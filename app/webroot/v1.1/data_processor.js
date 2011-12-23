/*
 * DataProcessor object
 * arguments: time_by, block_by, path to raw data, callback(ret_data)
 * required file: 
 * date.format.js
 * data_loader.js
 **/
 
function DataProcessor(time_by, time_by_domain, block_by, path) {
	this.time_by = time_by;
	this.time_by_domain = time_by_domain;
	this.block_by = block_by;
	this.loader = new DataLoader();
	if (path!=undefined) {
		this.path = path;
		this.get(path);
	}
}

DataProcessor.prototype = {
	'get': function (path) {
		var data = this.loader.loadRawData(path, this.time_by, this.time_by_domain, this.block_by);
		if (data) {
			this.data=data;
			return data;
		} else {
			return false;
		}
	},
    "process": function (raw) {
		var ret;
		if (raw!=undefined && this.loader.validateRaw(raw, this.time_by, this.time_by_domain, this.block_by)) 
			ret = process(raw, this.time_by, this.block_by, this.time_by_domain);
		else if (this.loader.validateRaw(this.data, this.time_by, this.time_by_domain, this.block_by))
			ret = process(this.data, this.time_by, this.block_by, this.time_by_domain);
		else return false;
		return ret;
    }
}


function process(raw, time_by, block_by, time_by_domain) {
    var data={}; // return data
    data['fields'] = raw['fields'];
    data['info'] = raw['info'];
    /*
     * create bars 
     * this is merely separate raw data according to different time intervals
     */
    // get time range
    var idx_bar_by = data['fields'].indexOf('time');
    raw.raw.sort(function (e1, e2) {
        return e1[idx_bar_by] - e2[idx_bar_by];
    });

    var bar_objs= {}; 

    for (var i=0;i<raw.raw.length;i++) {
        var entry = raw.raw[i];
        var label = getFormatedTime(entry[idx_bar_by], time_by);
        var time = entry[idx_bar_by];

        if (!(bar_objs[label] instanceof StackBar)) {
            bar_objs[label]=new StackBar(time, label);
        }
        bar_objs[label].add(entry, data['fields'].indexOf(block_by));
    }
	// get bars array
   	data['bars'] = getArray(bar_objs).sort(function (a, b) {return a.time - b.time;});	
	data['bars'].map(function (bar) {bar.convertBlock();});
	data['bar_by'] = time_by;
	data['bar_by_domain']=time_by_domain;
	data['block_by']=block_by;

    return data;
}

function getArray(obj) {
	var arr = [];
	for (var i in obj) {
		arr.push(obj[i]);
	}
	return arr;
}

function StackBar(time, label) {
	this.time_by= label;
    this.blocks = {};
    this.count=0; //number of entries
    this.levels=0; //number of blocks
    this.time = time; //timestamp of the first entry
}

StackBar.prototype = {
    "add" : function (entry, idx_block_by) {
        if (!(this.blocks[entry[idx_block_by]] instanceof StackBlock)) {
            this.blocks[entry[idx_block_by]] = new StackBlock(entry[idx_block_by]);
            this.levels++;
        }
        this.blocks[entry[idx_block_by]].entries.push(entry);
        this.count++;
    },
	"convertBlock": function () {
		this.blocks = getArray(this.blocks);
		var acc = 0;
		this.blocks.sort(function (a,b) {return a.entries.length - b.entries.length;});
		// add accumulated value
		for (var i=0;i<this.blocks.length;i++) {
			this.blocks[i]['acc'] = acc;
			acc+=this.blocks[i]['entries'].length;
		}
	}
}

function StackBlock(block_by) {
	this.block_by= block_by;
	this.entries=[];
}

// used in graph plotter and worker
function getFormatedTime(time, by) {
    var milisec = time * 3600 * 1000;
    var date = new Date(milisec);
    var format;
    switch (by) {
        case 'hour':
            format = date.format('d/mm htt');
            break;
        case 'week':
            format = getWeekFormat(date);
            break;
        case 'month':
            format = date.format('mmmm yy');
            break;
        case 'day':
            format = date.format('ddd d/mm');
            break;
        default:
            format = time;
    }
    return format;
}


function getWeekFormat(date) {
    var year = date.format('yyyy');
    // first day of the year, 0 week
    var d = new Date(year, 0,1,0,0,0);
    // difference in days
    var diff = (date.getTime() - d.getTime())/(1000*24*3600);
    // add offset of first day
    var wd = d.format('dddd');
    diff += ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].indexOf(wd);
    // divided by 7
    var weeks = ~~(diff/7)+1.
    return "week "+weeks+", "+year;
}
function is_int(value){
	if((parseFloat(value) == parseInt(value)) && !isNaN(value)){
	  	return true;
	} else {
	  	return false;
	} 
}

