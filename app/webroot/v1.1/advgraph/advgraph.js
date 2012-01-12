function AdvPlotter(d, conf) {
	this.data = d;

	this.bar_width=100;
	conf.chart_height= this.bar_width * d.length;

	var base = new ChartBase(conf);
	$.extend(this, base);

	this.init()
		.draw()
		.setEvents()
		.drawLabels();

	// focus on the graph
	$('#'+this.id+'_svg').trigger('click');
} 

AdvPlotter.prototype = {
	init: function () {
		var data = this.data,
			conf= this.config,
			labels = this.labels,
			max_x = d3.max(data, function (d) {return d[0];}),
			max_y = d3.max(data, function (d) {return d[1];});

		this.setupXAxis(max_x*1.1)
			.setupYAxis(max_y)
			.setupGraph();

		// domain in y axis is inverted relative to the chart
		this.y_scale.domain([0, max_y]);
		this.y_scale.range([0, conf.chart_width*0.9]);
		this.y_axis.orient('top');
		this.labels.select('.y.axis').attr('transform', 'translate('+conf.pad[3]+', '+(conf.pad[0])+')');

		labels.select('.y.axis').call(this.y_axis);
		this.img_axis = labels.append('svg:g').attr('class', 'img_axis').attr('transform', 'translate(0, '+conf.pad[0]+')');

		return this;
	},
	draw: function () {
		var self = this,
			graph= self.graph,
			data = self.data,
			conf = self.config,
			img_width = 100,
			img_height= self.bar_width,
			g_bars=self.g_bars;

		g_bars.attr('transform', 'rotate(-90) translate(-'+conf.chart_height+', 0)');

		bars_data = g_bars.selectAll('g.bar').data(data, function (d) {return[0]+'';});

		bars=bars_data.enter().append('svg:g').attr('class', function (d) {return 'bar '+d[0];})
				.attr('transform', function (d, i) {return 'translate('+(i*self.bar_width)+', 0)';});

		// the bar rects
		bars.append('svg:rect')
			.attr('width', self.bar_width/5)
			.attr('x', self.bar_width/5*2)
			.attr('fill', '#BABAB2')
			.attr('height', function (d) {return self.y_scale(d[1]);})
			.append('title')
			.text(function (d) {return d[1];});

		// remove extra
		bars_data.exit().remove();

		// draw image axis
		this.img_axis.append('svg:line').attr('x1', conf.pad[3]).attr('x2', conf.pad[3]).attr('y1', 0).attr('y2', conf.chart_height).attr('stroke-width', 1).attr('stroke', 'black');
		this.img_axis.selectAll('g.label').data(data).enter().append('svg:g').attr('transform', function (d, i) {return 'translate ('+(conf.pad[3] - img_width - 20)+', '+ i*self.bar_width+')';}).attr('class', 'label').append('svg:image').attr('xlink:href', function (d) {return d[0];}).attr('width', img_width).attr('height', img_height);

		return this;
	},
	setEvents: function () {
		var self = this,
			data = self.data,
			conf = self.config,
			range = self.y_scale.range(),
			max_r = Math.max(range[0], range[1]),
			draggable_width = data.length*self.bar_width-conf.chart_width;

		this.marker.select('line').attr('x2', conf.chart_height);
		this.marker.select('text').attr('transform', 'scale(1, -1) rotate(-90) translate(0, '+(conf.chart_height+20)+') ');
		this.marker.attr('transform', 'rotate(-90) translate(-'+conf.chart_height+', '+max_r/2+')');
		self.setupMarkerEvent(callback, trans);

		function callback() {
			var val = d3.select(this)[0][0].__data__[1];
			return [val, self.y_scale(val)];
		}
		// transform marker
		function trans(y) {
			this.marker.transition().delay(0).duration(500).attr('transform', 'rotate(-90) translate(-'+conf.chart_height+', '+y+')');
		}

		return this;
	},
	drawLabels: function () {
		var self = this,
			labels= self.labels,
			data = self.data,
			conf = self.config;

		self.setupLabels();
		labels.append('svg:line')
			.attr('x1', conf.pad[3]).attr('y1', conf.pad[0]+conf.chart_height)
			.attr('x2', conf.pad[3]+conf.chart_width).attr('y2', conf.pad[0]+conf.chart_height)
			.attr('stroke', 'black').attr('stroke-width', 0.5);
		return this;
	},
	transform: function () {
		var conf = this.config;
		//this.graph.attr('transform', 'rotate(180) translate('+conf.chart_height+', 0');
	},
}
