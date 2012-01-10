// frequency bar chart

function FreqPlotter(d, conf) {
	this.data = d.sort(function (a,b) {return b[1]-a[1];});
	this.base = new ChartBase(conf);

	this.container = [];
	this.cont_tail = 0;


	this.init();
	this.draw();
	this.setEvents();
	this.drawLabels();

	// focus on the graph
	$('#'+this.base.id+'_svg').trigger('click');
} 

FreqPlotter.prototype = {
	init: function () {
		var base = this.base;
		var data = this.data;
		var conf = base.config;

		var max_x = d3.max(data, function (d) {return d[0];});
		var max_y = d3.max(data, function (d) {return d[1];});

		//base.drawXAxis(max_x);
		base.drawYAxis(max_y);
		base.drawGraph();

		// domain in y axis is inverted relative to the chart
		base.y_scale.domain([max_y, 0]);

		this.bar_width=100;

		var len = data.length;
		var vp_over_bw = ~~(conf.chart_width/this.bar_width);
		for (var i=0;i<vp_over_bw*3;i++) {
			this.container.push(data[i]);
			this.cont_tail++;
		}
	},
	draw: function () {
		var self = this;
		var base = self.base;
		var graph= base.graph;
		var data = self.container;
		var conf = base.config;
		var g_bars= base.g_bars;
		

		bars_data = g_bars.selectAll('g.bar').data(data, function (d) {return d[0]+'';});

		bars = bars_data.enter().append('svg:g').attr('class', function (d) {return 'bar '+d[0];})
			.attr('transform', function (d, i) {return 'translate('+(base.cont_x+i*self.bar_width)+', 0)';});

		// background
		bars.append('svg:rect')
			.attr('width', self.bar_width)
			.attr('fill', 'blue')
			.attr('stroke', 'white')
			.attr('opacity', 0.1)
			.attr('height', conf.chart_height); 

		// the bar rects
		bars.append('svg:rect')
			.attr('width', self.bar_width/5)
			.attr('x', self.bar_width/2-self.bar_width/5/2)
			.attr('fill', 'blue')
			.attr('height', function (d) {return base.y_scale(d[1]);});

		// bar label
		bars.append('svg:text')
			.text(function (d) {return d[0];})
			.attr('text-achor', 'middle')
			.attr('dx', self.bar_width/2)
			.attr('dy', 20)
			.attr('transform', 'scale(1, -1)')

		// remove extra
		bars_data.exit().remove();
	},
	setEvents: function () {
		var self = this;
		var base = self.base;
		var data = self.data;
		var conf = base.config;
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

				var idx=base.cont_x/self.bar_width;
				if (idx>=0)
					self.container.unshift(data[idx]);
				self.container.pop();
			}
			updateBars();
		}
		function updateBars() {
			self.draw();
		}
		base.setDrag(draggable_width, self.bar_width*self.data.length, self.bar_width, updateContainer);
		base.setKeydown(self.bar_width*self.data.length, self.bar_width, 1000, updateContainer);
	},
	drawLabels: function () {
		var self = this;
		var base = self.base;
		var labels= base.labels;
		var data = self.data;
		var conf = base.config;

		base.drawLabels();
		labels.append('svg:line')
			.attr('x1', conf.pad[3]).attr('y1', conf.pad[0]+conf.chart_height)
			.attr('x2', conf.pad[3]+conf.chart_width).attr('y2', conf.pad[0]+conf.chart_height)
			.attr('stroke', 'black').attr('stroke-width', 0.5);
	}
}
