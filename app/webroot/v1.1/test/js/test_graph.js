// test suit for stack graph
// need to setup the graph first
// check for certain property
// generate events to check for scroll functions


function TestSuitStackGraph (title, path, time_by_domain, block_by) {
	// setup graph
	this.time_by = time_by_domain[1];
	this.time_by_domain = time_by_domain;
	var p = new DataProcessor(this.time_by, time_by_domain, block_by);
	var input = p.get(path);
	this.output = p.process(input);

	if (!(new DataLoader().validateProcessed(this.output, input,this.time_by, time_by_domain, block_by))) {
		console.log("Invalid Data");
		alert("Invalid Data");
		return false;
	}	

	this.plotter = new SGPlotter();
	this.plotter.setData(this.output);
	this.plotter.draw();


	this.timer=null;
	this.title = title;
	this.has_coverage = false;
	this.blocks_seen_sofar = [];
}	
	
// how to test chart:
// I only test the parts that currently in container
// keep global variable to indicate the status of test
// trigger events at the higher level and run test again to update the status
// tests end when all testable events are iterated
TestSuitStackGraph.prototype = {

	// scroll container is able to cover all bars
	can_show_all_bars_expected_automatic: function () {
		console.log("running test...can_show_all_bars_expected_automatic");

		var self = this;
		var container = this.plotter.container;
		var container_pos = this.plotter.container_pos;
		for (var i=0;i<container.length;i++) {
			// check each screen pos
			var block = container[i];
			var screen_pos = container_pos+i;
			var screen_actual_pos = screen_pos*(this.plotter.bar_width + config.bar_margin);

			var offset = screen_actual_pos - this.plotter.screen_x;
			if (offset>=0 && offset<=config.chart_width) addBlock(block);
		}

		function addBlock(block) {
			var b = self.blocks_seen_sofar.every(function (x) {return x.time != block.time;});
			if (b) self.blocks_seen_sofar.push(block);
		}

		$(document).trigger({ type: "keydown", keyCode:39});

		// check blocks seen so far
		if (self.blocks_seen_sofar.length == this.plotter.data.length) return true;
		else return false;


	},

	end_of_scroll_not_exceed_one_bar_width_expected_automatic: function () {
		console.log("running test...end_of_scroll_not_exceed_one_bar_width_expected_automatic");

		// check the screen_x, it should be in range [0, total_bars*(margin+width)]
		scroll_exceed = false;
		// check
		var screen_x = this.plotter.screen_x;
		if (screen_x<0 || screen_x> (this.plotter.data.length-1)*(this.plotter.bar_width + config.bar_margin))
		{
			scroll_exceed = true;
		}

		return !scroll_exceed;
	},

	// all blocks within a bar are drawn and in correct order
	blocks_drawn_correct_order_expected_true: function () {
		console.log("running test...blocks_drawn_correct_order_expected_true");

		// check the y axis in each block
		// its value should have same rank as its entries length
		var bars = this.plotter.container;
		for (var i=0;i<bars.length;i++) {
			var bar = bars[i];
			var blocks = bar.blocks;
			var time = bar.time;

			var check=[];
			for (var j=0;j<blocks.length;j++) {
				var block = blocks[j];
				var a = d3.selectAll("#bar_"+time+" .block_"+block.block_by)[0][0].getAttribute('y');

				check.push([a, block.entries.length]);
			}
			if (!checkSorted(check)) {
				return false;
			}
		}
		return true;

		// check ascending order
		function checkSorted(arr) {
			var last;
			for (var i=0;i<arr.length;i++) {
				if (last==undefined) {
					last = arr[i];
					continue;
				} else {
					var t = arr[i];
					if (parseFloat(t[0])<parseFloat(last[0]) || t[1]<last[1]) return false;
					last = t;
				}
			}		
			return true;
		}
		
	},

	// all blocks are drawn with correct color
	blocks_colors_correspond_to_legend_expected_true: function () {
		console.log("running test...blocks_colors_correspond_to_legend_expected_true");
		// select legends
		var legend = d3.selectAll('g.legend g.icon rect');
		legend = legend[0];
		var colors = {}; 
		for (var i=0;i<legend.length;i++) {
			var l = legend[i];
			var color = l.getAttribute('fill');
			var level = l.getAttribute('level');

			colors[level] = color;
		}

		// check for each block in container
		var bars = this.plotter.container;
		for (var i=0;i<bars.length;i++) {
			var bar = bars[i];
			var blocks = bar.blocks;
			var time = bar.time;

			var check={};
			for (var j=0;j<blocks.length;j++) {
				var block = blocks[j];
				var a = d3.selectAll("#bar_"+time+" .block_"+block.block_by)[0][0].getAttribute('fill');

				check[block.block_by]=a;
			}
			if (!checkColor(check)) {
				return false;
			}
		}
		return true;
		
		function checkColor(check) {
			for (var i in check) {
				if (check[i]!=colors[i]) return false;
				else return true;
			}
		}
	},

	// average line is always associated with correct average value for bar and lines
	correct_bars_selected_to_compute_average_expected_true: function () {
		console.log("running test...correct_bars_selected_to_compute_average_expected_true");
		// value of average line
		// currently selected bar
		var selected = this.plotter.selected_bar;
		var line_by = config.average_line_by;
		var data = this.plotter.data;

		var range = this.plotter.average_range;
		for (var i=0;i<range.length;i++) {
			var bar = range[i];
			var diff = selected.time - bar.time;
			switch (line_by) {
				case 'od':
					if (diff>=24 || diff<0) return false;
					break;
				case 'ow':
					if (diff>=24*7 || diff<0) return false;
					break;
				case 'om':
					if (diff>=24*30 || diff<0) return false;
					break;
				case 'tm':
					if (diff>=24*90 || diff<0) return false;
					break;
				case 'oy':
					if (diff>=24*365 || diff<0) return false;
					break;
				default:
					if (bar.time <0 || bar.time> ~~(new Date().getTime()/3600/1000)) return false;
					break;	
			}
		}
		return true;
	},

	average_bar_has_correct_value_expected_true: function () {
		console.log("running test...average_bar_has_correct_value_expected_true");

		var bar_average = this.plotter.bar_average;
		var range = this.plotter.average_range;
		if (bar_average != d3.sum(range, function (d) {return d.count;}) / range.length) return false;
		else return true;
	},

	average_line_has_correct_value_expected_true: function () {
		console.log("running test...average_line_has_correct_value_expected_true");
	
		var line_average = this.plotter.line_average;
		var range = this.plotter.average_range;
		var idx_of_line = this.plotter.fields.indexOf(config.line_by);
		if (line_average != d3.sum(range, function (d) {return lineValue(d, idx_of_line);}) / range.length) return false;
		else return true;
	},

	// line values is correct for all bars
	line_value_is_correct_expected_true: function () {
		console.log("running test...line_value_is_correct_expected_true");

		var line_points = d3.selectAll('g.line_point');
		var self = this;
		var expected = line_points[0].every(function (x) {
			var data = x.__data__;
			var line_value = data[2];
			var bar = data[3];

			var sum = d3.sum(bar.blocks, function (bloc) {
				return d3.sum(bloc.entries, function (d) {return d[self.plotter.fields.indexOf(config.line_by)];});
			});
			if (sum==line_value) return true;
			else return false;
		});
		return expected;
	},

	// more than 90% of the graph height are covered with items
	graph_height_has_over_90_coverage_expected_true: function () {
		console.log("running test...graph_height_has_over_90");
		// check highest bar 
		// should be taller than 90%
		var bars = d3.selectAll('g.bars g.bar').selectAll('rect.block');
		var heights = [];

		for (var i=0;i<bars.length;i++) {
			var bar = bars[i];
			var height = 0;
			for (var j=0;j<bar.length;j++) {
				var block = bar[j];
				height+=parseFloat(block.getAttribute('height'));
			}
			heights.push(height);
		}

		var max = d3.max(heights);

		if (max>config.chart_height*0.9) {
			this.has_coverage = true;
		} 
		return this.has_coverage;
	},

	// popup will be shown correctly
	popup_shown_correct_expected_true: function () {
		console.log("running test...popup_shown_correct_expected_true");

		var popup_working = false;
		$('g.bar').on('dblclick', testPopup);
		function testPopup(e) {
			var time = $(e.target).attr('time');
			var popup = $('g.popup:first');
			if (popup.length==null || popup.attr('time') !=time) {
				popup_working = false;
			} else {
				popup_working = true;
			}
		}

		$("g.bar:first").trigger("dblclick");
		setTimeout(function () {$("g.popup").trigger("click");}, 500);

		$('g.bar').unbind('dblclick', testPopup);
		return popup_working;
	}
}
