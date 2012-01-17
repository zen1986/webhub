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
		chart_bottom_title: "",
	}

	if (conf) 
		this.config = conf;
	else
		this.config = config;

	this.id = new Date().getTime();

	if ($('#drawing_area').length == 0)
		$('body').prepend('<div id=\'drawing_area\'></div>');

	this.div = d3.select('#drawing_area').append('div').attr('id', this.id);

	this._clear()._init();
}

ChartBase.prototype = {
	_clear: function () {
		// bars pos relative to viewport, always -ve
		this.vp_x=0;
		this.cont_x=0;
		this.acc_move=0;
		return this;	
	},
	_init: function () {
		// create svg
		// chart area
		// label area
		var id = this.id,
			conf = this.config,
			adjustment = 20*2,
			svg_width = this.svg_width = conf.chart_width+conf.pad[3]+conf.pad[1],
			svg_height= this.svg_height = conf.chart_height+conf.pad[0]+conf.pad[2];

		$('#'+id).css('width', svg_width);

		// the svg
		this.svg = this.div.append('svg:svg').attr('id', id+'_svg').attr('width', svg_width).attr('height', svg_height);

		this.canvas = this.svg.append('svg:g').attr('class', 'canvas').attr('transform', 'translate('+conf.pad[3]+', '+conf.pad[0]+')');

		// put mask on canvas
		// adjust the mask to include more space at top and bottom for labels
		this.canvas.append('svg:clipPath').attr('id', id+'_canvas_mask').append('svg:rect')
			.attr('y', -adjustment/2)
			.attr('width', conf.chart_width)
			.attr('height', conf.chart_height+adjustment);
		this.canvas.attr('clip-path', 'url(#'+id+'_canvas_mask)');

		// the labels
		this.labels = this.svg.append('svg:g').attr('class', 'labels');

		return this;	
	},
	setupXAxis: function (max) {
		var conf = this.config,
			labels = this.labels,
			x_scale= this.x_scale = d3.scale.linear().range([0, conf.chart_width]).domain([0, max]),
			x_axis = this.x_axis = d3.svg.axis().scale(x_scale).orient('bottom').tickSubdivide(0).tickFormat(d3.format(".0f"));

		labels.append('svg:g').attr('class', 'x axis').attr('transform', 'translate('+conf.pad[3]+', '+(conf.pad[0]+conf.chart_height)+')');
		return this;	
	}, 
	setupYAxis: function (max) {
		var conf = this.config,
			labels= this.labels,
			y_scale = this.y_scale = d3.scale.linear().range([0, conf.chart_height]),
			y_axis = this.y_axis = d3.svg.axis().scale(y_scale).orient('left').ticks(5);

		labels.append('svg:g').attr('class', 'y axis block').attr('transform', 'translate('+conf.pad[3]+', '+conf.pad[0]+')');
		return this;	
	},
	setupLineAxis: function (max) {
		var conf = this.config,
			labels= this.labels,
			line_scale = this.line_scale = d3.scale.linear().range([conf.chart_height, 0]).domain([0, max]),
			line_axis = d3.svg.axis().scale(line_scale).orient('right').ticks(5);

		labels.append('svg:g').attr('class', 'line axis').attr('transform', 'translate('+(conf.chart_width+conf.pad[3])+', '+conf.pad[0]+')').call(line_axis);
		return this;	
	},
	setupGraph: function () {
		var conf = this.config,
			canvas = this.canvas;

		// new coordinate system of the graph
		this.graph = canvas.append('svg:g').attr('class', 'graph').attr('transform', 'scale(1,-1) translate(0, -'+conf.chart_height+')');
		this.g_bars = this.graph.append('svg:g').attr('class', 'bars');

		// the marker
		this.marker = this.graph.append('svg:g').attr('class', 'marker').attr('transform', 'translate(0, '+conf.chart_height+')');
		this.marker.append('svg:line')
			.attr('class', 'marker')
			.attr('x1', 0).attr('y1', 0)
			.attr('x2', conf.chart_width).attr('y2', 0)
			.attr('stroke', '#BABAB2').attr('stroke-width', 1);
		this.marker.append('svg:text')
			.attr('text-anchor', 'middle')
			.attr('class', 'marker')
			.attr('transform', 'scale(1, -1) translate(10, 0)');

		return this;	
	},
	setupLabels: function() {
		var self = this,
			conf = self.config,
			labels = self.labels,
			top =	labels.append('svg:g').attr('class', 'top_region')
						.attr('transform', 'translate('+conf.pad[3]+', 0)'),
			bottom= labels.append('svg:g').attr('class', 'bottom_region')
						.attr('transform', 'translate('+(conf.pad[3]+conf.chart_width/2)+', '+(self.svg_height-10)+')'),
			left=	labels.append('svg:g').attr('class', 'left_region block')
						.attr('transform', 'translate(0, '+(conf.chart_height/2+conf.pad[0])+')'),
			right=	labels.append('svg:g').attr('class', 'right_region line')
						.attr('transform', 'translate('+(conf.pad[3]+conf.chart_width)+', '+(conf.pad[0]+conf.chart_height/2)+')'),
			legend= labels.append('svg:g').attr('class', 'legend_region')
						.attr('transform', 'translate('+(conf.pad[3]+conf.chart_width + conf.pad[3])+', 0)');

		if (conf.chart_title) {
			top.append('svg:text')
				.text(conf.chart_title)
				.attr('transform', 'translate(0, '+(conf.pad[0]-50)+') scale(1.5) ');
		}
		
		if (conf.chart_left_title) {
			left.append('svg:text')
				.attr('text-anchor', 'middle')
				.attr('transform', 'rotate(-90)')
				.attr('dy', 20)
				.text(conf.chart_left_title);
		}

		if (conf.chart_bottom_title) {
			bottom.append('svg:text')
				.attr('text-anchor', 'middle')
				.text(conf.chart_bottom_title);
		}

		if (conf.chart_right_title) {
			right.append('svg:text')
				.attr('transform', 'rotate(90)')
				.attr('text-anchor', 'middle')
				.attr('dy', -70)
				.text(conf.chart_right_title);
		}

		return this;	
	},
	setupKeydown: function (bars_width, bar_width, off, cbUpdate, cbPrevPos, cbNextPos,  ctx) {
		var self = this,
			svgId ='#'+self.id+'_svg',
			draggable_width = bars_width - self.config.chart_width;
		// Setup animation
		// Allow the arrow keys to change the displayed.
		$(svgId).unbind("keydown").bind("keydown", function(e) {
			// 0>= vp_x>=-draggable_width
			var ret, dx, pre, next, old_vp=self.vp_x;
			switch (e.keyCode) {
				case 39: // right key 
					dx = off;
					if (typeof cbPrevPos== 'function') 
						pre = cbPrevPos.call(ctx, self.vp_x);
					else
						pre = self.vp_x+dx;
					self.vp_x= Math.min(draggable_width, pre);
					break;
				case 37: // left key 
					dx = -off;
					if (typeof cbNextPos== 'function') 
						next = cbNextPos.call(ctx, self.vp_x);
					else
						next = self.vp_x+dx;
					self.vp_x= Math.max(0, next);
					break;
				}
			self.svg.select('g.bars').transition().duration(500).attr('transform', 'translate(-'+self.vp_x+', 0)');
			if (typeof cbUpdate== 'function') {
				ret=false;
				while (!ret) {
					ret = self._updateContainer(old_vp-self.vp_x, bars_width, bar_width, cbUpdate, ctx);
				}
			}
		});
		$(svgId).unbind("click").bind("click", function () {$(this).focus();});
		
		return this;	
	},
	setupDrag: function (bars_width, bar_width, cbUpdate, ctx) {
		var self = this, drag,
			draggable_width = bars_width - self.config.chart_width;

		drag=d3.behavior.drag().on('drag', 
				function (d) {
					// move the bars
					var old_vp = self.vp_x,
						ret = false;

					self.vp_x-= d3.event.dx;
					self.vp_x=Math.max(self.vp_x,0);
					self.vp_x=Math.min(draggable_width, self.vp_x);

					d3.select(this).attr('transform', 'translate(-'+self.vp_x+', 0)');

					if (typeof cbUpdate=='function') {
						while (!ret) {
							ret = self._updateContainer(d3.event.dx, bars_width, bar_width, cbUpdate, ctx);
						};
					}
				});

		this.svg.select('g.bars').call(drag);
		return this;	
	},
	setupClick: function (callback) {
		var self = this,
			id = this.id+'_svg';

		$('#'+id+' g.bar').unbind('click').bind('click', function () {
			self.selected= d3.select(this);
			callback(self.selected);
		});
		return this;	
	},
	setupMarkerEvent: function (callback, trans) {
		var self = this,
			id = this.id+'_svg',
			domain = this.y_scale.domain(),
			max = Math.max(domain[0], domain[1]);

		this.marker.select('text').text(max.toFixed(0)+'');
		$('#'+id+' g.bar').unbind('mouseenter').bind('mouseenter', function () {
			if (!callback) return;
			// return [y, val] pair
			var ret = callback.call(this);
			self.svg.select('rect.highlighted').classed('highlighted', '').attr('opacity', 1);
			d3.select(this).selectAll('rect').classed('highlighted', true);
			self.drawMarker(ret, trans);
			return false;
		});
		return this;	
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

		var vp_x=this.vp_x, vp_width=this.config.chart_width,
			cont_width = vp_width*3,
			cont_x = this.cont_x,
			// offset between viewport and 1/3 container
			off,

			// bound rang within which the container position should be updated
			upper_bound= bars_width - ~~(2*cont_width/3),
			lower_bound= ~~(cont_width/3);

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
		off = vp_x - cont_x- vp_width;

		if (Math.abs(off)<bar_width/2) return true;

		if (!action) return true;

		// cont_x is before the position
		if (off>bar_width && cont_x<bars_width-cont_width) {
			// push it to right
			// update it's position by one bar width
			this.cont_x+=bar_width;
			action.call(ctx, 'push');
			return false;
		}
		// cont_x is after the position
		else if (-off>bar_width && cont_x>0) {
			// push it to left 
			// update it's position by one bar width
			this.cont_x-=bar_width;
			action.call(ctx, 'pop');
			return false;
		}
		return true;
	},
	drawMarker: function (pair, trans) {
		var val=pair[0],
			y  =pair[1],
			old_val = this.marker.select('text')[0][0].textContent;

		old_val = parseInt(old_val);

		if (trans)
			trans.call(this,y);
		else 
			this.marker.transition().delay(0).duration(500).attr('transform', 'translate(0, '+y+')');

		this.marker.select('text').transition().tween('text', tween);

		function tween() {
			var i = d3.interpolate(parseFloat(this.textContent), val);
			return function (t) {
				this.textContent = ''+i(t).toFixed(0);
			}
		}

		return this;	
	},
}
