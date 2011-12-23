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

// with set interval
// the sequence of test cannot be set here
// just trigger the first time
// let the function itself decide which subsequent function to run
function runTestWithInterval(suit, test_div) {
	test_div.append('<h3>'+suit.title+'</h3>');
	var method;
	var first;
	for (method in suit) {
		if (typeof suit[method] == "function") {
			var	out = "<div class='test "+method+"'>"+ method+" <div class='result fail'>failed</div></div>";
			test_div.append(out);
			if (first==undefined) {
				first=method;
			} 
		}
	}
	suit[first]();
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
