/*
 * DataProcessor object
 * arguments: time_by, block_by, path to raw data, callback(ret_data)
 * required file: 
 * date.format.js
 * data_loader.js
 **/
 
function DataProcessor(time_by, time_by_domain, block_by, line_by, path) {
	this.time_by = time_by;
	this.time_by_domain = time_by_domain;
	this.block_by = block_by;
	this.line_by = line_by;
	this.loader = new DataLoader();
	if (path!=undefined) {
		this.path = path;
		this.get(path);
	}
}

DataProcessor.prototype = {
	get: function (path) {
		var data = this.loader.loadRawData(path, this.time_by, this.time_by_domain, this.block_by);
		if (data) {
			this.data=data;
			return data;
		} else {
			return false;
		}
	},
    process: function (raw) {
		var ret;
		//if (raw!=undefined && this.loader.validateRaw(raw, this.time_by, this.time_by_domain, this.block_by)) 
		if (raw!=undefined) 
			ret = process(raw, this.time_by, this.block_by, this.time_by_domain, this.line_by);
		//else if (this.loader.validateRaw(this.data, this.time_by, this.time_by_domain, this.block_by))
		else
			ret = process(this.data, this.time_by, this.block_by, this.time_by_domain, this.line_by);
		//else return false;
		return ret;
    }
}


function process(raw, time_by, block_by, time_by_domain, line_by) {
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

	var block_by_idx = data['fields'].indexOf(block_by);
	var use_info;
	if (data['info'][block_by]==undefined)
		use_info = false;
	else 
		use_info = true;

    var bar_objs= {}; 

    for (var i=0;i<raw.raw.length;i++) {
        var entry = raw.raw[i];
        var label = getFormatedTime(entry[idx_bar_by], time_by);
        var time = entry[idx_bar_by];

        if (!(bar_objs[label] instanceof StackBar)) {
            bar_objs[label]=new StackBar(time, label);
        }

		var block_by_value;
		var block_val_key = entry[block_by_idx];
		block_by_value=data['info'][block_by][block_val_key];

        bar_objs[label].add(entry, block_by_value);
    }
	var line_idx = data['fields'].indexOf(line_by);
	// get bars array
   	data['bars'] = getValues(bar_objs).sort(function (a, b) {return a.time - b.time;});	
	data['bars'].map(function (bar) {bar.convertBlock(line_idx);});
	data['bar_by'] = time_by;
	data['bar_by_domain']=time_by_domain;
	data['block_by']=block_by;
	data['block_by_idx']=block_by_idx;

    return data;
}

function StackBar(time, label) {
	this.time_by= label;
    this.blocks = {};
    this.count=0; //number of entries
    this.levels=0; //number of blocks
    this.time = time; //timestamp of the first entry
}

StackBar.prototype = {
    add : function (entry, block_by_value ) {
        if (!(this.blocks[block_by_value ] instanceof StackBlock)) {
            this.blocks[block_by_value] = new StackBlock(block_by_value);
            this.levels++;
        }
        this.blocks[block_by_value].entries.push(entry);
        this.count++;
    },
	convertBlock: function (idx_of_line) {
		this.blocks = getValues(this.blocks);
		var acc = 0, unique_acc = 0, bar_unique=[];
		var line_val = 0;
		this.blocks.sort(function (a,b) {return a.entries.length - b.entries.length;});
		// add accumulated value
		for (var i=0;i<this.blocks.length;i++) {
			var unique=getUniqueLength(this.blocks[i]['entries']);
			this.blocks[i]['acc'] = acc;
			this.blocks[i]['unique_acc']= unique_acc;
			this.blocks[i]['unique']= unique;
			acc+=this.blocks[i]['entries'].length;
			unique_acc+=unique;
			for (var j=0;j<this.blocks[i]['entries'].length;j++) {
				var entry = this.blocks[i]['entries'][j];
				if (bar_unique.indexOf(entry[1])==-1) {
					bar_unique.push(entry[1]);
				}
			}
			line_val+=d3.sum(this.blocks[i]['entries'], function (d) {return d[idx_of_line]});
		}
		this.line_val = line_val;
		this.unique = bar_unique.length;
		for (var i=0;i<this.blocks.length;i++) {
			this.blocks[i].bar_unique = this.unique;
		}
	}
}

function StackBlock(block_by) {
	this.block_by= block_by;
	this.entries=[];
}

