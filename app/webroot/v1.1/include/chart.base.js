// base bar chart
// just draw bar chart
// with event handlers, drag, left/right keys
// this object will not deal with any data
var config={
	pad: [80,80,80,80],
	chart_width: 400,
	chart_height: 400
}

function ChartBase(conf) {

	if (conf == undefined) 
		this.config = config;
	else
		this.config = conf;

	// position of the head of the currently displayed bars
	this.screen_x=0;
	this.id = new Date().getTime();
	this.init();
}

ChartBase.prototype = {
	init: function () {
		// create svg
		// chart area
		// label area
		var id = this.id;
		var conf = this.config;
		
		var svg_width = this.svg_width = conf.chart_width+conf.pad[3]+conf.pad[1];
		var svg_height= this.svg_height = conf.chart_height+conf.pad[0]+conf.pad[2];

		if ($('#drawing_area').length == 0)
			$('body').prepend('<div id=\'drawing_area\'></div>');

		// the svg
		this.svg = d3.select('#drawing_area').append('svg:svg').attr('id', id+'_svg').attr('width', svg_width).attr('height', svg_height);;

		this.canvas = this.svg.append('svg:g').attr('class', 'canvas').attr('transform', 'translate('+conf.pad[3]+', '+conf.pad[0]+')');
		// put mask on canvas
		this.canvas.append('svg:clipPath').attr('id', id+'_canvas_mask').append('svg:rect')
			.attr('width', conf.chart_width)
			.attr('height', conf.chart_height);
		this.canvas.attr('clip-path', 'url(#'+id+'_canvas_mask)');

		// the labels
		this.labels = this.svg.append('svg:g').attr('class', 'labels');
	},

	drawXAxis: function (max) {
		var conf = this.config;
		var labels = this.labels;
		var x_scale= this.x_scale = d3.scale.linear().range([0, conf.chart_width]).domain([0, max]);
		var x_axis = d3.svg.axis().scale(x_scale).orient('bottom');
		labels.append('svg:g').attr('class', 'x axis').attr('transform', 'translate('+conf.pad[3]+', '+(conf.pad[0]+conf.chart_height)+')').call(x_axis);
	}, 
	drawYAxis: function (max) {
		var conf = this.config;
		var labels= this.labels;
		var y_scale = this.y_scale = d3.scale.linear().range([conf.chart_height, 0]).domain([0, max]);
		var y_axis = d3.svg.axis().scale(y_scale).orient('left');
		labels.append('svg:g').attr('class', 'y axis').attr('transform', 'translate('+conf.pad[3]+', '+conf.pad[0]+')').call(y_axis);
	},
	/*
	 * bars: a d3 object of svg:rect elements
	 */
	drawGraph: function () {
		var conf = this.config;
		var canvas = this.canvas;

		// new coordinate system of the graph
		this.graph = canvas.append('svg:g').attr('class', 'graph').attr('transform', 'scale(1,-1) translate(0, -'+conf.chart_height+')');
	},
	setKeydown: function (cbNextPos, cbPrePos, cbUpdate) {
		var self = this;
		var svgId ='#'+self.id+'_svg';
		$(svgId).unbind("focus").bind("focus", function() {
			console.log('focused');
			// Setup animation
			// Allow the arrow keys to change the displayed.
			$(svgId).unbind("keydown").bind("keydown", function(e) {
				//  0>= screen_x >=-draggable_width
				switch (e.keyCode) {
					case 37: // left
						if (cbPrePos!=undefined && typeof cbPrePos== 'function') 
							var pre = cbPrePos(self.screen_x);
						else
							var pre = self.screen_x - 100;
						self.screen_x = Math.max(-self.draggable_width, pre);
						break;
					case 39: // right
						if (cbNextPos!=undefined && typeof cbNextPos== 'function') 
							var next = cbNextPos(self.screen_x);
						else
							var next = self.screen_x + 100;
						self.screen_x = Math.min(0, next);
						break;
					}
				self.svg.select('g.bars').transition().duration(500).attr('transform', 'translate('+self.screen_x+', 0)');

				if (cbUpdate!=undefined && typeof cbUpdate== 'function') cbUpdate(e);
			});
		});
		$(svgId).unbind("click").bind("click", function () {$(this).focus();});

	},
	setDrag: function (draggable_width, callback) {
		var self = this;
		self.draggable_width = draggable_width;
		this.svg.select('g.bars')
			.call(d3.behavior.drag()
				.on('drag', 
					function (d) {
						// move the bars
						self.screen_x -= d3.event.dx;
						self.screen_x=Math.max(self.screen_x,0);
						self.screen_x=Math.min(self.draggable_width, self.screen_x);
						d3.select(this).attr('transform', 'translate(-'+self.screen_x+', 0)');

						if (callback!=undefined && typeof callback == 'function') callback(d3.event);
					}
				)
			);
	}
}
