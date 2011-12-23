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
}	
	// scroll container is able to cover all bars

TestSuitStackGraph.prototype = {

	// scroll container is able to cover all bars
	"can_show_all_bars_expected_automatic": function () {
		console.log("running test...can_show_all_bars_expected_automatic");
		var self = this;
		var marker = new Array(this.plotter.data.length);

		function result(pass) {
			var div =$('div.can_show_all_bars_expected_automatic>div.result');
			if (pass) {
				div.addClass('pass');
				div.removeClass('delay');
				div.removeClass('fail');
				div.html('passed');
			} else {	
				div.addClass('fail');
				div.removeClass('delay');
				div.removeClass('pass');
				div.html('fail');
			}
		
			clearTimeout(self.timer);
			self.end_of_scroll_not_exceed_one_bar_width_expected_automatic();
		}

		function failed() {
			result(false);
		}

		function passed() {
			result(true);
		}
		
		function checkContainer() {
			var cont = self.plotter.container;

			// for each container
			for (var i=0;i<cont.length;i++) {
				var item = cont[i];
				var id = item.time;
				var found = false;

				// check against data
				for (var j=0;j<self.plotter.data.length;j++) {
					// if match, then mark true
					if (id == self.plotter.data[j].time) {
						marker[j] = true;
						found = true;
						break;
					}
				}

				// if it contains non valid data, return false, shouldn't come here
				if (!found) {
					failed();
				}
			}
		}

		function checkMarker() {
			var pass=true;
			for (var i=0;i<marker.length;i++) {
				if (!marker[i]) {
					pass=false;
					break;
				}
			}
			if (pass) {
				passed();
			}
		}

		function moveRight() {
			// simulate 'right arrow' key event
			jQuery('body').trigger({ type: 'keydown', keyCode:39});
			checkContainer();
			checkMarker();
			// if the drag reached the end, but still cannot confirm all bars, fail it
			if (self.plotter.screen_x>=self.draggable_width) {
				failed();
			}
		}
		
		this.timer = setInterval(moveRight, 200);
		return false;
	},

	// if total bar length>=screen length, scroll ending page will never contain empty space that is wider than one bar
	"end_of_scroll_not_exceed_one_bar_width_expected_automatic": function () {
		console.log("running test...end_of_scroll_not_exceed_one_bar_width_expected_automatic");

		// reset the graph
		this.plotter = new SGPlotter();
		this.plotter.setData(this.output);
		this.plotter.draw();

		var bar_width = this.plotter.bar_width;
		var bar_margin = config.bar_margin;
		var total_bars = this.plotter.data.length;
		var total_width = (bar_width+bar_margin)*total_bars;
		var self=this;

		function moveRight() {
			jQuery('body').trigger({ type: 'keydown', keyCode:39});
		}

		function checkEnding() {
			if (self.plotter.screen_x>=self.plotter	.draggable_width) {
				clearTimeout(timer);
				checkScrollEnding();
			} else {
				moveRight();
			}
		}
		function checkScrollEnding() {
			var screen_ending_pos = self.plotter.screen_x + config.chart_width;
			var last_bar_pos = (self.plotter.container_pos + self.plotter.container.length) * (self.plotter.bar_width+ config.bar_margin);
			var diff = screen_ending_pos - last_bar_pos;
			if (diff<0 || diff>config.bar_margin+self.plotter.bar_width) {
				failed();
			}
			else {
				passed();
			}
		}
		function passed() {
			result(true);
		}
		function failed() {
			result(false);
		}
		function result(pass) {
			var div =$('div.end_of_scroll_not_exceed_one_bar_width_expected_automatic>div.result');
			if (pass) {
				div.addClass('pass');
				div.removeClass('delay');
				div.removeClass('fail');
				div.html('passed');
			} else {	
				div.addClass('fail');
				div.removeClass('delay');
				div.removeClass('pass');
				div.html('fail');
			}
		
			clearTimeout(self.timer);
			self.blocks_drawn_correct_order_expected_true();
		}
	
		// if total bar length < screen length, check the containers should never be changed 
		if (total_width<config.chart_width) {
			var t=100;					 
			var timer=setInterval(moveRight, t);
			var first_bar = self.plotter.container[0];
			function cancelTimer() {
				clearTimeout(timer);
				if (first_bar.time == self.plotter.container[0].time) passed();
				else failed();
			}
			setTimeout(cancelTimer, t*10);

		}
		else {
			var timer=setInterval(checkEnding, 200);
		}
	},

	// all blocks within a bar are drawn and in correct order
	"blocks_drawn_correct_order_expected_true": function () {
		console.log("running test...blocks_drawn_correct_order_expected_true");

		// check ascending order
		function checkSorted(arr) {
			var last;
			for (var i=0;i<arr.length;i++) {
				if (last==undefined) {
					last = arr[i];
					continue;
				} else {
					var t = arr[i];
					if (t[0]<last[0] || t[1]<last[1]) return false;
					last = t;
				}
			}		
			return true;
		}

		// check the y axis in each block
		// its value should have same rank as its entries length
		var bars = this.plotter.data;
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

	},

	// all blocks are drawn with correct color
	"blocks_colors_correspond_to_legend_expected_true": function () {
	},

	// average line is always associated with correct average value for bar and lines
	"average_bar_has_correct_value_expected_true": function () {
	},

	"average_line_has_correct_value_expected_true": function () {
	},

	// line values is correct for all bars
	"line_value_is_correct_expected_true": function () {

	},

	// more than 90% of the graph height are covered with items
	"graph_height_has_over_90%_coverage_expected_true": function () {
		// check highest bar 
		// should be taller than 90%
	},

	// popup will be shown correctly
	"popup_shown_correct_expected_true": function () {
	},

	// popup show correct date
	"popup_show_correct_date_expected_true": function () {
		// randomly choose a bar
		// trigger an dblclick event
		// check the date element
	}
}
