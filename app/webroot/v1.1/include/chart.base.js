// base bar chart
// just draw bar chart
// with event handlers, drag, left/right keys
// this object will not deal with any data



function ChartBase(conf) {
	var config={
		pad: [80,80,80,80],
		chart_width: 400,
		chart_height: 400,
		chart_title: "chart",
		chart_left_title: "",
		chart_right_title: "",
	}

	if (conf == undefined) 
		this.config = config;
	else
		this.config = conf;

	this.id = new Date().getTime();

	if ($('#drawing_area').length == 0)
		$('body').prepend('<div id=\'drawing_area\'></div>');

	this.div = d3.select('#drawing_area').append('div').attr('id', this.id);
	this._clear();
	this._init();
}

ChartBase.prototype = {
	_clear: function () {
		// bars pos relative to viewport, always -ve
		this.vp_x=0;
		this.cont_x=0;
		this.acc_move=0;
		this.max_dx=0;
	},
	_init: function () {
		// create svg
		// chart area
		// label area
		var id = this.id;
		var conf = this.config;
		
		var svg_width = this.svg_width = conf.chart_width+conf.pad[3]+conf.pad[1];
		var svg_height= this.svg_height = conf.chart_height+conf.pad[0]+conf.pad[2];

		$('#'+id).css('width', svg_width);
		// the svg
		this.svg = this.div.append('svg:svg').attr('id', id+'_svg').attr('width', svg_width).attr('height', svg_height);

		this.canvas = this.svg.append('svg:g').attr('class', 'canvas').attr('transform', 'translate('+conf.pad[3]+', '+conf.pad[0]+')');
		// put mask on canvas

		// adjust the mask to include more space at top and bottom for labels
		var adjustment = 20*2;
		this.canvas.append('svg:clipPath').attr('id', id+'_canvas_mask').append('svg:rect')
			.attr('y', -adjustment/2)
			.attr('width', conf.chart_width)
			.attr('height', conf.chart_height+adjustment);
		this.canvas.attr('clip-path', 'url(#'+id+'_canvas_mask)');

		// the labels
		this.labels = this.svg.append('svg:g').attr('class', 'labels');

	},
	setupXAxis: function (max) {
		var conf = this.config;
		var labels = this.labels;
		var x_scale= this.x_scale = d3.scale.linear().range([0, conf.chart_width]).domain([0, max]);
		var x_axis = this.x_axis = d3.svg.axis().scale(x_scale).orient('bottom').tickSubdivide(0).tickFormat(d3.format(".0f"));
		labels.append('svg:g').attr('class', 'x axis').attr('transform', 'translate('+conf.pad[3]+', '+(conf.pad[0]+conf.chart_height)+')');
	}, 
	setupYAxis: function (max) {
		var conf = this.config;
		var labels= this.labels;
		var y_scale = this.y_scale = d3.scale.linear().range([0, conf.chart_height]);
		this.y_axis = d3.svg.axis().scale(y_scale).orient('left').ticks(5);
		labels.append('svg:g').attr('class', 'y axis block').attr('transform', 'translate('+conf.pad[3]+', '+conf.pad[0]+')');
	},
	setupLineAxis: function (max) {
		var conf = this.config;
		var labels= this.labels;
		var line_scale = this.line_scale = d3.scale.linear().range([conf.chart_height, 0]).domain([0, max]);
		var line_axis = d3.svg.axis().scale(line_scale).orient('right').ticks(5);
		labels.append('svg:g').attr('class', 'line axis').attr('transform', 'translate('+(conf.chart_width+conf.pad[3])+', '+conf.pad[0]+')').call(line_axis);
	},
	setupGraph: function () {
		var conf = this.config;
		var canvas = this.canvas;

		// new coordinate system of the graph
		this.graph = canvas.append('svg:g').attr('class', 'graph').attr('transform', 'scale(1,-1) translate(0, -'+conf.chart_height+')');
		this.g_bars = this.graph.append('svg:g').attr('class', 'bars');

		// the marker
		this.marker = this.graph.append('svg:line')
			.attr('x1', 0).attr('y1', conf.chart_width)
			.attr('x2', conf.chart_width).attr('y2', conf.chart_width)
			.attr('stroke', 'red').attr('opacity', 0.4).attr('stroke-width', 1);

	},
	setupLabels: function() {
		var self = this;
		var conf = self.config;
		var labels = self.labels;

		var top =	labels.append('svg:g').attr('class', 'top_region').attr('transform', 'translate('+conf.pad[3]+', 0)');
		var bottom= labels.append('svg:g').attr('class', 'bottom_region').attr('transform', 'translate('+(conf.pad[3]+conf.chart_width/2)+', '+(self.svg_height-10)+')');
		var left=	labels.append('svg:g').attr('class', 'left_region block').attr('transform', 'translate(0, '+(conf.chart_height/2+conf.pad[0])+')');
		var right=	labels.append('svg:g').attr('class', 'right_region line').attr('transform', 'translate('+(conf.pad[3]+conf.chart_width)+', '+(conf.pad[0]+conf.chart_height/2)+')');
		var legend= labels.append('svg:g').attr('class', 'legend_region').attr('transform', 'translate('+(conf.pad[3]+conf.chart_width + conf.pad[3])+', 0)');

		if (conf.chart_title!=undefined) {
			top.append('svg:text')
				.text(conf.chart_title)
				.attr('transform', 'translate(0, '+(conf.pad[0]-50)+') scale(1.5) ');
		}
		
		if (conf.chart_left_title!=undefined) {
			left.append('svg:text')
				.attr('text-anchor', 'middle')
				.attr('transform', 'rotate(-90)')
				.attr('dy', 20)
				.text(conf.chart_left_title);
		}

		if (conf.chart_bottom_title!=undefined) {
			bottom.append('svg:text')
				.attr('text-anchor', 'middle')
				.text(conf.chart_bottom_title);
		}

		if (conf.chart_right_title !=undefined) {
			right.append('svg:text')
				.attr('transform', 'rotate(90)')
				.attr('text-anchor', 'middle')
				.attr('dy', -70)
				.text(conf.chart_right_title);
		}

	},
	setupKeydown: function (bars_width, bar_width, default_page, cbUpdate, cbPrevPos, cbNextPos,  ctx) {
		var self = this;
		var svgId ='#'+self.id+'_svg';
		$(svgId).unbind("focus").bind("focus", function() {

			// Setup animation
			// Allow the arrow keys to change the displayed.
			$(svgId).unbind("keydown").bind("keydown", function(e) {
				// 0>= vp_x>=-draggable_width
				var dx, old_vp=self.vp_x;
				switch (e.keyCode) {
					case 39: // right key 
						dx = default_page;
						if (cbPrevPos!=undefined && typeof cbPrevPos== 'function') 
							var pre = cbPrevPos.call(ctx, self.vp_x);
						else
							var pre = self.vp_x+dx;
						self.vp_x= Math.min(self.draggable_width, pre);
						break;
					case 37: // left key 
						dx = -default_page;
						if (cbNextPos!=undefined && typeof cbNextPos== 'function') 
							var next = cbNextPos.call(ctx, self.vp_x);
						else
							var next = self.vp_x+dx;
						self.vp_x= Math.max(0, next);
						break;
					}
				self.svg.select('g.bars').transition().duration(500).attr('transform', 'translate(-'+self.vp_x+', 0)');

				if (cbUpdate!=undefined && typeof cbUpdate== 'function') {
					var ret=false;
					while (!ret) {
						ret = self._updateContainer(old_vp-self.vp_x, bars_width, bar_width, cbUpdate, ctx);
					}
				}
			});
		});
		$(svgId).unbind("click").bind("click", function () {$(this).focus();});
		
	},
	setupDrag: function (draggable_width, bars_width, bar_width, cbUpdate, ctx) {
		var self = this;
		self.draggable_width = draggable_width;
		this.svg.select('g.bars')
			.call(d3.behavior.drag()
				.on('drag', 
					function (d) {
						// move the bars
						var old_vp = self.vp_x;
						self.vp_x-= d3.event.dx;
						self.vp_x=Math.max(self.vp_x,0);
						self.vp_x=Math.min(self.draggable_width, self.vp_x);
						d3.select(this).attr('transform', 'translate(-'+self.vp_x+', 0)');

						if (cbUpdate!=undefined && typeof cbUpdate== 'function') {
							var ret=false;
							while (!ret) {
								ret = self._updateContainer(d3.event.dx, bars_width, bar_width, cbUpdate, ctx);
							};
						}
					}
				)
			);
	},
	setupClick: function (callback) {
		var self = this;
		var id = this.id+'_svg';
		$('#'+id+' g.bar').unbind('click').bind('click', function () {
			self.selected= d3.select(this);
			callback(self.selected);
		});
	},
	setupMarkerEvent: function (callback) {
		var self = this;
		var id = this.id+'_svg';
		$('#'+id+' g.bar').unbind('hover').bind('hover', function () {
			var y = callback.call(this);
			self.svg.select('rect.highlighted').classed('highlighted', '').attr('fill', 'blue');
			d3.select(this).selectAll('rect').classed('highlighted', true);
			self.drawMarker(y);
		});
	},
	_updateContainer: function (dx, bars_width, bar_width, action, ctx) {
		/*
		 * update container position according to viewport's position
		 * call push/pop action
		 * */
		// viewport, container (adjacent bars with width spanning 3 viewport width) , bars
		// consider leftmost coord x relative to bars, i.e. bars is static
		// all x will be positive
		// at beginning, viewport's x and container's x in container overlap at 0 
		
		if (bars_width <= vp_width) return true;

		this.max_dx = Math.max(Math.abs(dx), this.max_dx);
		var vp_x=this.vp_x, vp_width=this.config.chart_width;
		var cont_width = vp_width*3;
		var cont_x = this.cont_x;

		// bound rang within which the container position should be updated
		var upper_bound= bars_width - ~~(2*cont_width/3);
		var lower_bound= ~~(cont_width/3);

		//console.log(' cont_x:'+cont_x+' old_vp:'+old_vp+' lower_bound:'+lower_bound+' upper_bound:'+upper_bound);
		if (upper_bound<vp_x && upper_bound>vp_x+dx) {
			cont_x = bars_width - cont_width;
			return true;
		}
		if (lower_bound>vp_x && lower_bound<vp_x+dx) {
			cont_x = 0;
			return true;
		}

		// within the bound the vp_x is at roughly 1/3 cont pos after cont_x
		var off = vp_x - cont_x- vp_width;

		if (Math.abs(off)<bar_width/2) return true;

		// cont_x is before the position
		if (off>bar_width) {
			if (cont_x<bars_width-cont_width) {
				// push it to right
				// update it's position by one bar width
				this.cont_x+=bar_width;
				action.call(ctx, 'push');
				return false;
			} 
			else 
				return true;
		}
		// cont_x is after the position
		else if (-off>bar_width) {
			if (cont_x>0) {
				// push it to left 
				// update it's position by one bar width
				this.cont_x-=bar_width;
				action.call(ctx, 'pop');
				return false;
			} 
			else  
				return true;
		}
		else 
			return true;
	},
	drawMarker: function (y) {
		this.marker.transition().delay(0).duration(500).attr('y1', y).attr('y2', y);
	},
}
