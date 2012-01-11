// frequency bar chart

function FreqPlotter(d, conf) {
	this.data = d;

	inherit(ChartBase, this, conf);

	this.container = [];
	this.cont_tail = 0;


	this.init();
	this.draw();
	this.setEvents();
	this.drawLabels();

	// focus on the graph
	$('#'+this.id+'_svg').trigger('click');
} 

FreqPlotter.prototype = {
	init: function () {
		var data = this.data;
		var conf = this.config;

		var max_x = d3.max(data, function (d) {return d[0];});
		var max_y = d3.max(data, function (d) {return d[1];});

		this.setupXAxis(max_x*1.1);
		this.setupYAxis(max_y);
		this.setupGraph();

		// domain in y axis is inverted relative to the chart
		this.y_scale.domain([max_y, 0]);
		this.labels.select('.y.axis').call(this.y_axis);

		this.x_axis.ticks(5);
		this.labels.select('.x.axis').call(this.x_axis);

		this.bar_width=conf.chart_width/data.length;
	},
	draw: function () {
		var self = this;
		var graph= self.graph;
		var data = self.data;
		var conf = self.config;
		var g_bars= self.g_bars;
		
		bars_data = g_bars.selectAll('g.bar').data(data, function (d) {return d[0]+'';});

		bars = bars_data.enter().append('svg:g').attr('class', function (d) {return 'bar '+d[0];})
			.attr('transform', function (d, i) {return 'translate('+(self.x_scale(d[0])-self.bar_width)+', 0)';});

		/*
		// background
		bars.append('svg:rect')
			.attr('width', self.bar_width)
			.attr('fill', 'blue')
			.attr('stroke', 'white')
			.attr('opacity', 0.1)
			.attr('height', conf.chart_height); 
			*/
		// the bar rects
		bars.append('svg:rect')
			.attr('width', self.bar_width/3)
			.attr('x', self.bar_width-self.bar_width/3/2)
			.attr('fill', 'blue')
			.attr('height', function (d) {return conf.chart_height - self.y_scale(d[1]);});

		/*
		// bar label
		bars.append('svg:text')
			.text(function (d) {return d[1].toFixed(2);})
			.attr('text-achor', 'middle')
			.attr('dx', self.bar_width/2)
			.attr('dy', -100)
			.attr('transform', 'scale(1, -1)');
			*/

		// remove extra
		bars_data.exit().remove();
	},
	setEvents: function () {
		var self = this;
		var data = self.data;
		var conf = self.config;
		var draggable_width = data.length*self.bar_width-conf.chart_width;

		function updateContainer(cmd) {
			if (cmd=='push') {
				while (data[self.cont_tail] !=undefined && self.container.length<=(conf.chart_width* 3/self.bar_width)) 	{
					self.container.push(data[self.cont_tail]);
					self.cont_tail++;
				}
				self.container.shift();
			} else {
				self.cont_tail--;

				var idx=self.cont_x/self.bar_width;
				if (idx>=0)
					self.container.unshift(data[idx]);
				self.container.pop();
			}
			updateBars();
		}
		function updateBars() {
			self.draw();
		}
		self.setupDrag(draggable_width, self.bar_width*self.data.length, self.bar_width, updateContainer);
		self.setupKeydown(self.bar_width*self.data.length, self.bar_width, 1000, updateContainer);
		function getY() {
			//console.log(this);
			return conf.chart_height - self.y_scale(d3.select(this)[0][0].__data__[1]);
		}
		self.setupMarkerEvent(getY);
	},
	drawLabels: function () {
		var self = this;
		var labels= self.labels;
		var data = self.data;
		var conf = self.config;

		self.setupLabels();
		labels.append('svg:line')
			.attr('x1', conf.pad[3]).attr('y1', conf.pad[0]+conf.chart_height)
			.attr('x2', conf.pad[3]+conf.chart_width).attr('y2', conf.pad[0]+conf.chart_height)
			.attr('stroke', 'black').attr('stroke-width', 0.5);
	},
}
