// frequency bar chart

function FreqPlotter(d, conf) {
	this.data = d;
	this.base = new ChartBase(conf);
	this.init();
	this.draw();
} 

FreqPlotter.prototype = {
	init: function () {
		var base = this.base;
		var data = this.data;
		var conf = base.config;

		var max_x = d3.max(data, function (d) {return d[0];});
		var max_y = d3.max(data, function (d) {return d[1];});

		base.drawXAxis(max_x);
		base.drawYAxis(max_y);
		base.drawGraph();

		// domain in y axis is inverted relative to the chart
		base.y_scale.domain([max_y, 0]);
	},
	draw: function () {
		var self = this;
		var base = self.base;
		var graph= base.graph;
		var data = self.data;
		var conf = base.config;
		self.bar_width=100;

		var g_bars= graph.append('svg:g').attr('class', 'bars');
		bars = g_bars.selectAll('g.bar').data(data).enter().append('svg:g')
			.attr('transform', function (d, i) {return 'translate('+i*self.bar_width+', 0)';});

		bars.append('svg:rect')
			.attr('width', self.bar_width)
			.attr('stroke', 'blue')
			.attr('height', function (d) {return base.y_scale(d[1]);});

		this.setEvents();
		base.setKeydown();
	},
	setEvents: function () {
		var self = this;
		var base = self.base;
		var data = self.data;
		var draggable_width = data.length*self.bar_width-base.config.chart_width;

		base.setDrag(draggable_width);
	}
}
