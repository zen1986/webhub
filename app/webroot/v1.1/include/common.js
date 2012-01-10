
// run test suit
function runTest(suit, test_div) {
	test_div.append('<h3>'+suit.title+'</h3>');
	var method;
	for (method in suit) {
		if (typeof suit[method] == "function") {
			var pass = suit[method]();
			var out;
			if (pass) {
				out = "<div class='test "+method+"'>"+ method+" <div class='result pass'>passed</div></div>";
			}
			else {
				out = "<div class='test "+method+"'>"+ method+" <div class='result fail'>failed</div></div>";
			}
			test_div.append(out);
		}
	}
}


function deepCopyBars(bars) {
	var ret=[];
	for (var i=0;i<bars.length;i++) {
		var bar = new StackBar();
		bar.count = bars[i].count;
		bar.levels = bars[i].levels;
		bar.time_by = bars[i].time_by;
		bar.time = bars[i].time;
		bar.blocks=[];

		for (var j=0;j<bars[i].blocks.length;j++) {
			var block = new StackBlock();
			block.block_by = bars[i].blocks[j].block_by;
			block.entries = [];

			for (var m=0;m<bars[i].blocks[j].entries.length; m++) {
				var entry = [];
				for (var n=0;n<bars[i].blocks[j].entries[m].length;n++) entry.push(bars[i].blocks[j].entries[m][n]);
				block.entries.push(entry);
			}
			bar.blocks.push(block);
		}
		ret.push(bar);
	}
	return ret;
}
/*
 * N: getWeekFormat
 * A: date, js date object
 * D: get the time string when the time_by is 'week'
 * R: return the weeks tring for selected date
 * */
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
/*
 * N: lineValue 
 * A: bar, d3 bar object; idx_of_line, index of fields to show 
 * D: sum the line value of all entries on each bar 
 * R: return the sum
 * */
function lineValue(bar,idx_of_line) {
	var sum=0;
	for (var i=0;i<bar.blocks.length;i++) {
		sum+=d3.sum(bar.blocks[i].entries, function (d) {return d[idx_of_line];});
	}
	return sum;
}

function getValues(obj)  {
	var vals=[];
	for (var i in obj) {
		vals.push(obj[i]);
	}
	return vals;
}

function getUniqueLength(entries) {
	var uniq_arr=[];
	for (var i=0;i<entries.length;i++) {
		var uid = entries[i][1];
		if (uniq_arr.indexOf(uid)==-1) uniq_arr.push(uid);
	}
	return uniq_arr.length;
}

function Composition(target, source) {
	var desc = Object.getOwnPropertyDescriptor;
	var prop = Object.getOwnPropertyNames;
	var def_prop = Object.defineProperty;

	prop(source).forEach(
			function(key) {
				def_prop(target, key, desc(source, key));
			});
	return target;
}

function inherit(src, to) {
	var base = new src();
	
	// inherit properties
	Composition(to, base);

	// inherit methods
	var proto =Object.getPrototypeOf(base);

	for (var p in proto) {
		to[p] = proto[p];
	}
}
