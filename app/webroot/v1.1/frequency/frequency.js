// frequency bar chart

function FreqPlotter(d, conf) {
	this.data = d;

	var base = new ChartBase(conf);
	$.extend(this, base);

	this.container = [];
	this.cont_tail = 0;


	this.init()
		.draw()
		.setEvents()
		.drawLabels();

	// focus on the graph
	$('#'+this.id+'_svg').trigger('click');
} 

FreqPlotter.prototype = {
	init: function () {
		var data = this.data,
			labels = this.labels,
			conf = this.config,
			max_x = d3.max(data, function (d) {return d[0];}),
			max_y = d3.max(data, function (d) {return d[1];});

		this.setupXAxis(max_x*1.1)
			.setupYAxis(max_y)
			.setupGraph();

		// domain in y axis is inverted relative to the chart
		this.y_scale.domain([max_y, 0]);
		labels.select('.y.axis').call(this.y_axis);

		this.x_axis.ticks(5);
		labels.select('.x.axis').call(this.x_axis);

		this.bar_width=conf.chart_width/data.length;
		return this;
	},
	draw: function () {
		var self = this,
			graph= self.graph,
			data = self.data,
			conf = self.config,
			g_bars=self.g_bars;
		
		bars_data = g_bars.selectAll('g.bar').data(data, function (d) {return d[0]+'';});

		bars=bars_data.enter().append('svg:g').attr('class', function (d) {return 'bar '+d[0];})
				.attr('transform', function (d, i) {return 'translate('+(self.x_scale(d[0])-self.bar_width)+', 0)';});

		// the bar rects
		bars.append('svg:rect')
			.attr('width', self.bar_width/3)
			.attr('x', self.bar_width-self.bar_width/3/2)
			.attr('fill', '#BABAB2')
			.attr('height', function (d) {return conf.chart_height - self.y_scale(d[1]);});

		
		// remove extra
		bars_data.exit().remove();
		return this;
	},
	setEvents: function () {
		var self = this,
			conf = self.config;

		self.setupMarkerEvent(callback);

		function callback() {
			var val = d3.select(this)[0][0].__data__[1];
			return [val, conf.chart_height - self.y_scale(val)];
		}

		return this;
	},
	drawLabels: function () {
		var self  = this,
			labels= self.labels,
			data  = self.data,
			conf  = self.config;

		self.setupLabels();
		labels.append('svg:line')
			.attr('x1', conf.pad[3]).attr('y1', conf.pad[0]+conf.chart_height)
			.attr('x2', conf.pad[3]+conf.chart_width).attr('y2', conf.pad[0]+conf.chart_height)
			.attr('stroke', 'black').attr('stroke-width', 0.5);
		return this;
	},
}
