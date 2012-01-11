// foot fall chart
function FootfallPlotter(data, conf, block_by, line_by) {
	this.setData(data, 'day', ['hour', 'day'], block_by, line_by);
	
	// total or unique
	this.mode = 'total';

	// inherit from chartbase
	inherit(ChartBase, this, conf);

	// for control scroll
	this.container = [];
	this.cont_tail = 0;

	this.reDraw();

} 

FootfallPlotter.prototype = {
	setData: function (data, bar_by, bar_by_domain, block_by, line_by) {
		this.proc = new DataProcessor(bar_by, bar_by_domain, block_by, line_by);
		var d = this.proc.process(data);
	
		this.raw = data;
		this.data = d['bars'];
		this.info = d['info'];
		this.fields=d['fields'];
		this.block_by =d['block_by'];
		this.block_by_idx=d['block_by_idx'];
		this.bar_by = bar_by;
	},
	clear: function () {
		$('div#'+this.id).empty();
		this._clear();
		this._init();
		this.container = [];
		this.cont_tail = 0;
	}, 
	reDraw: function () {
		this.init();
		this.draw();
		
		this.setEvents();
		this.drawLabels();
	
		// focus on the graph
		$('#'+this.id+'_svg').trigger('click');

		this.makeController();
	},
	init: function () {
		var data = this.data;
		var conf = this.config;

		//var max_x = d3.max(data, function (d) {return d[0];});
		var max_y = this.max_y = d3.max(data, function (d) {return d['count'];});
		var max_line = d3.max(data, function (d) {return d['line_val'];});
		this.max_unique = d3.max(data, function (d) {return d['unique'];});

		// inherited methods
		//this.setupXAxis(max_x);
		this.setupYAxis(max_y);
		this.setupLineAxis(max_line);
		this.setupGraph();

		// domain in y axis is inverted relative to the chart
		this.line_scale.domain([max_line, 0]);
		
		// initialize colors
		this._initBlockColor();
		// set bar width
		var label = data[0]['time_by'];
		this.bar_width = label.length*10;

		// initialize container
		// used for paging bars
		var len = data.length;
		var vp_over_bw = 1+~~(conf.chart_width/this.bar_width);
		for (var i=0;i<vp_over_bw*3;i++) {
			if (i<len) {
				this.container.push(data[i]);
				this.cont_tail++;
			}
		}

		// initialize separators
		this._createSeparator();
	},
	makeController: function () {
		var self = this;
		var id = self.id;
		var conf = this.config;
		var div = $('#'+id);
		var controls= "<div id="+id+"_controls><button class='show_unique'>Unique</button><button class='show_total'>Total</button>show line:<input type='checkbox' class='show_line' checked />show bar:<input type='checkbox' class='show_bar' checked />Average by: <select class='average'></select>Display by: <select class='aggr'></select></div>";

		div.append(controls);

		// binding event
		var c_id = '#'+id+'_controls ';
		$(c_id + '.show_unique').click(function() {self.mode = 'unique'; self.draw();} );
		$(c_id + '.show_total').click(function() {self.mode = 'total'; self.draw();} );
		$(c_id + '.show_line').change(function () {
			if ($(this).is(':checked')) {
				conf.show_line = true;
			} else {
				conf.show_line = false;
			}
			self._toggleLineView();
		});
		$(c_id + '.show_bar').change(function () {
			if ($(this).is(':checked')) {
				conf.show_bar = true;
			} else {
				conf.show_bar = false;
			}
			self._toggleBarView();
		});

		// add time select
		var avg_ops = "<option value='od' class='od'>Past One Day</option><option class='ow' value='ow'>Past One Week</option><option class='om' value='om'>Past One Month</option><option class='tm' value='tm'>Past Three Month</option><option class='oy' value='oy'>Past One Year</option>";
		$(c_id + 'select.average').append(avg_ops);
		$(c_id + 'select.average option[value='+conf.average_line_by+']').attr('selected', true);

		$(c_id + 'select.average').change(function () {
			var val = $(this).val();
			conf.average_line_by = val;
			self.drawAverageLine();
		});


		// aggregate by
		var aggr_ops = "<option value='hour'>Hour</option><option value='day'>Day</option><option value='week'>Week</option><option value='month'>Month</option><option value='year'>Year</option>";
		$(c_id + 'select.aggr').append(aggr_ops);
		$(c_id + 'select.aggr option[value='+this.bar_by+']').attr('selected', true);

		$(c_id + 'select.aggr').change(function () {
			var val = $(this).val();
			self.bar_by = val;
			self.setData(self.raw, self.bar_by, ['hour', 'day'], 'sid', 'points');
			self.clear();
			self.reDraw();
		});

	},
	_toggleBarView: function () {
		var self = this;
		var conf = self.config;

		if (conf.show_bar) {
			self.svg.selectAll('.block').attr('opacity', 1);
		} else {
			self.svg.selectAll('.block').attr('opacity', 0);
		}
	},
	_toggleLineView: function () {
		var self = this;
		var conf = self.config;

		if (conf.show_line) {
			self.svg.selectAll('.line').attr('opacity', 1);
		} else {
			self.svg.selectAll('.line').attr('opacity', 0);
		}
	},
	draw: function (type) {
		var self = this;
		var graph= self.graph;
		var data = self.container;
		var conf = self.config;
		var g_bars= self.g_bars;
		

		bars_data = g_bars.selectAll('g.bar').data(data, function (d) {return d['time'];});

		bars = bars_data.enter().append('svg:g').attr('class', function (d) {return 'bar time_'+d['time'];})
			.attr('transform', function (d, i) {return 'translate('+(self.cont_x+i*self.bar_width)+', 0)';});

		// render the newly entered bars
		
		self._renderBarBackground(bars);	
		
		self._renderBlocks(bars);

		self._renderBarLabels(bars);

		self._renderCircles(bars);
		
		self.drawLines(bars_data);

		self.setBarEvents();

		bars_data.exit().remove();

		// toggle view
		self._toggleBarView();
		self._toggleLineView();

		this.drawAverageLine();
	},
	drawAverageLine: function () {
		var conf = this.config;
		var data = this.data;
		var range = this._getAverageRange(conf.average_line_by, data);
		
		if (range.length==0) return;

		if (this.mode=='total') 
			var bar_sum = d3.sum(range, function (d) {return d.count});
		else 
			var bar_sum = d3.sum(range, function (d) {return d.unique});

		var bar_average = bar_sum/range.length;
		
		if (conf.show_bar) {
			this.svg.select('.bar_average').remove();
			// draw average line for bars
			var bar_average_height = conf.chart_height - this.y_scale(bar_average);
        	this.graph.append('svg:line')
				.attr('class', 'block bar_average')
				.attr('x1', 0)
				.attr('y1', bar_average_height)
				.attr('x2', conf.chart_width)
				.attr('y2', bar_average_height)
				.attr('stroke', conf.bar_color)
				.append('svg:title').text('Average Checkin:'+bar_average.toFixed(1));
		}
		if (conf.show_line) {
			var line_sum = d3.sum(range, function (d) {return d.line_val;});
			var line_average = line_sum/range.length;
        	var line_pos = this.line_scale(line_average);

			this.svg.select('.line_average').remove();
        	// draw average line for lines
        	this.graph.append('svg:line')
				.attr('class', 'line line_average')
				.attr('x1', 0)
				.attr('y1', line_pos)
				.attr('x2', conf.chart_width)
				.attr('y2', line_pos)
				.attr('stroke', conf.line_color)
				.append('svg:title').text('Average '+conf.line_by+':'+line_average.toFixed(1));
		}
    },
	setEvents: function () {
		var self = this;
		var data = self.data;
		var conf = self.config;
		var draggable_width = data.length*self.bar_width-conf.chart_width;
		var svg_id = self.id+'_svg';

		function updateContainer(cmd) {
			if (cmd=='push') {
				while ( this.container.length<=~~(this.config.chart_width* 3/this.bar_width)) {
					if (this.cont_tail !=this.data.length) {
						this.container.push(this.data[this.cont_tail]);
						this.cont_tail++;
					}
				}
				this.container.shift();
			} else {
				this.cont_tail--;

				var idx=this.cont_x/this.bar_width;
				if (idx>=0)
					this.container.unshift(data[idx]);
				this.container.pop();
			}
			this.draw();
		}

		this.setupDrag(draggable_width, self.bar_width*self.data.length, self.bar_width, updateContainer, this);
		this.setupKeydown(self.bar_width*self.data.length, self.bar_width, 100, updateContainer, self._getNextSeparator, self._getPrevSeparator, this);
	},
	setBarEvents: function () {
		var self = this;
		var conf = self.config;
		var svg_id = self.id+'_svg';
		
		// dblclick event, popup
		function popup(bar) {
			var w=conf.chart_width,
				h=conf.chart_height,
				r=Math.min(w,h)/2,
				donut = d3.layout.pie(),
				levels = getValues(self.info[self.block_by]);
				arc = d3.svg.arc().innerRadius(0).outerRadius(r);
	
			if (self.mode=='unique') 
				donut.value(function (d) {return d.unique;});
			else	
				donut.value(function (d) {return d.entries.length;});
		 
			var popup_canvas = self.graph.append('svg:g').attr('class', 'popup').attr('time', bar.time).data([bar.blocks]);
	
			var adjustment = 24;
			popup_canvas.append('svg:rect')
				.attr('width', conf.chart_width)
				.attr('height', conf.chart_height+adjustment)
				.attr('fill', 'black')
				.attr('opacity', 0.8);
	
			$('#'+svg_id+' g.popup').on('click', function () {
				d3.select(this).remove();
			});
	
			var arcs = popup_canvas.selectAll("g.popup_arc")
				.data(donut)
				.enter().append("svg:g")
				.attr("class", "popup_arc")
				.attr("transform", "translate(" + (conf.chart_width/2)+","+(conf.chart_height/2)+")");
	
			
			function tweenPie(b) {
				b.innerRadius = 0;
				var i=d3.interpolate({startAngle:0, endAngle:0}, b);
				return function (t) {
					return arc(i(t));
				}
			}
	
			var paths = arcs.append("svg:path").attr("class", "popup_path").attr("fill", function(d) { return self.blockColor(d.data.block_by); });
			paths.transition()
				.ease("bounce")
				.duration(1000)
				.attrTween("d", tweenPie);
	
			var text = arcs.append("svg:text")
				.attr("transform", function(d) { return "translate(" + arc.centroid(d) + ") scale(1, -1) "; })
				.attr("class", "popup")
				.attr("text-anchor", "middle")
				.attr("display", function(d) { return d.value > .15 ? null : "none"; })
				.text(function(d, i) {return d.data.block_by+": "+d.value; })
				.attr("opacity", 0);
	
			if (self.mode=='unique') {
				paths.attr("stroke-width", 0.5).attr('stroke', 'black').attr("fill", conf.unique_color);
			}
	
			arcs.append("svg:title").attr('class', 'popup')
				.text(function (d) {return d.data.block_by+": "+d.value;});
	
			text.transition().delay(1000).attr('opacity', 1);
		}
		
		// popup event, dblclick
		$('#'+svg_id+' g.bar').unbind('dblclick').bind('dblclick', function () {
			// already existed
			if (self.svg.select('.popup')[0][0]!=null) return;
	
			if (!self.config.show_bar) return;
			var data = d3.select(this)[0][0].__data__;	
			popup(data);
		});
		
		// click event
		function clickHandler(selected) {
			var data = selected[0][0].__data__;
			
			self.svg.select('.selected_bar').classed('selected_bar', false);
			selected.classed('selected_bar', true);

			self.drawAverageLine(data);
		}
		this.setupClick(clickHandler);
	
	},
	drawLabels: function () {
		var self = this;
		var labels= self.labels;
		var data = self.data;
		var conf = self.config;

		this.setupLabels();
		labels.append('svg:line')
			.attr('x1', conf.pad[3]).attr('y1', conf.pad[0]+conf.chart_height)
			.attr('x2', conf.pad[3]+conf.chart_width).attr('y2', conf.pad[0]+conf.chart_height)
			.attr('stroke', 'black').attr('stroke-width', 0.5);

		self._renderLegends();
	},
	drawLines: function (bars) {
		var self = this;
		var conf = self.config;
		var data=self.container;
		
		var ps = bars[0].map(function (bar, i) {return [self.cont_x+i*self.bar_width+self.bar_width/2, self.line_scale(bar.__data__.line_val)];});
        var line = d3.svg.line().interpolate('linear');

		self.g_bars.select('path.line').remove();
		
		// draw lines
        self.g_bars.append('svg:path').data([ps]).attr('class', 'line')
        .attr('d', line)
        .attr('fill', 'none')
        .attr('stroke', 'DarkViolet')
        .attr('stroke-width',1.5)
        .attr('opacity', 0.3);
		
	
	},
	_renderBlocks: function (bars) {
		var self=this;
		var conf = self.config;

		// the block rects
		var block_data = bars.selectAll('rect.block').data(function (d) {return d.blocks;});

		var blocks = block_data.enter().append('svg:rect')
			.attr('class', 'block')
			.attr('width', self.bar_width/2)
			.attr('x', self.bar_width/2-self.bar_width/4)
			.attr('stroke', 'black')
			.attr('stroke-width', 0.5);

		if (self.mode=='total') {
			self.y_scale.domain([self.max_y, 0]);
			self.svg.selectAll('rect.block').transition().duration(500)
				.attr('value', function (d) {return d.entries.length;})
				.attr('height', function (d) {return conf.chart_height - self.y_scale(d.entries.length);})
				.attr('y', function (d) {return conf.chart_height - self.y_scale(d.acc);})
				.attr('fill', function (d) {
					return self.blockColor(d.block_by);
				});
			self.svg.selectAll('rect.block').append('svg:title').text(function (d) {return d.block_by;});
		} else {
			// mode unique
			self.y_scale.domain([self.max_unique, 0]);
			self.svg.selectAll('rect.block').transition().duration(500)
				.attr('value', function (d) {return d.bar_unique;})
				.attr('height', function (d) {return conf.chart_height - self.y_scale(d.bar_unique);})
				.attr('y', 0)
				.attr('fill', self.config.unique_color);
			self.svg.selectAll('rect.block').selectAll('title').remove();
		}
		self.svg.select('.y.axis').transition().duration(500).call(self.y_axis);
	},
	_renderBarLabels: function (bars) {
		var self=this;
		var conf = self.config;

		// bar label
		bars.append('svg:text')
			.attr('text-anchor', 'middle')
			.attr('dy', 20)
			.attr('dx', self.bar_width/2)
			.text(function (d) {return d['time_by'];})
			.attr('transform', 'scale(1, -1)');

		bars.append('svg:text')
			.attr('class', 'block bar_label')
			.attr('text-anchor', 'middle')
			.attr('dx', self.bar_width/2)
			.attr('transform', 'scale(1, -1)');

		if (self.mode=='total') {
			self.svg.selectAll('text.bar_label').text(function (d) {return d['count'];})
				.transition().duration(500)
				.attr('dy', function (d) {return -(conf.chart_height - self.y_scale(d['count']))-10;})
		} else {
			self.svg.selectAll('text.bar_label').text(function (d) {return d['unique'];})
				.transition().duration(500)
				.attr('dy', function (d) {return -(conf.chart_height - self.y_scale(d['unique']))-5;})
		}
	},
	_renderBarBackground: function (bars) {
		var self=this;
		var conf = self.config;

		// background
		bars.append('svg:rect').attr('class', 'bar_background');

		self.svg.selectAll('rect.bar_background')
			.attr('width', self.bar_width)
			.attr('fill', 'blue')
			.attr('stroke', 'white')
			.attr('opacity', 0.1)
			.attr('height', conf.chart_height); 

	},

	_renderLegends: function () {
		var self = this;
		var conf = self.config;
		var legend = self.labels.select('g.legend_region');

		var levels = getValues(self.info[self.block_by]);
        var bw=10, bh=10, bmargin=10;
        
        var l = legend.selectAll('g.icon').data(levels).enter().append('svg:g').attr('class', 'icon')
        .attr('transform', function (d) {
            return 'translate(0, '+(levels.length - levels.indexOf(d)) *(bh+bmargin)+')';
        });

        l.append('svg:rect').attr('fill', function (d) {return self.blockColor(d);} ).attr('width', bw).attr('height', bh)
		.attr('level', function (d) {return d;});
			
        l.append('svg:text')
			.text(function (d) {return d;})
			.attr('stroke', 'DarkSlateGrey')
			.attr('stroke-width', 0.1)
			.attr('dx', 20)
			.attr('dy', bh);
		 
        var lvl = 50 + levels.length*(bh+bmargin);
        legend.append('svg:line')
			.attr('x1', 0)
			.attr('y1', lvl)
			.attr('x2', 10)
			.attr('y2', lvl)
			.attr('stroke', conf.bar_color)
			.attr('stroke-width', 1);

		legend.append('svg:text')
			.attr('dx', 20)
			.attr('dy', lvl+4)
			.text('Average for Bar')
			.attr('stroke', 'black')
			.attr('stroke-width', 0.1);
        
        lvl += 50;
        legend.append('svg:line')
			.attr('x1', 0)
			.attr('y1', lvl)
			.attr('x2', 10)
			.attr('y2', lvl)
			.attr('stroke', conf.line_color)
			.attr('stroke-width', 1);
		
		legend.append('svg:text')
			.attr('dx', 20)
			.attr('dy', lvl+4)
			.text('Average for Line')
			.attr('stroke', 'black')
			.attr('stroke-width', 0.1);

		// adjust legend position to middle
		var total_height = lvl+4*2+50;
		var margin_top = (self.svg_height- total_height) /2;
		var margin_left = (conf.pad[1]-conf.pad[3])/6;

		if (margin_top>0) {
			legend.attr('transform', 'translate('+(conf.pad[3]+conf.chart_width + conf.pad[3]+margin_left)+','+margin_top+')')
		}
	},
	_initBlockColor: function () {
		var domain = getValues(this.info[this.block_by]);
		this.blockColor = d3.scale.category20c();
		this.blockColor.domain(domain);
	},
	/*
	 * N: getAverageRange
	 * A: by, period; selected_bar, the curently selected bar object; data, reference to the data
	 * D: compute the average value for certain period upto selected bar date
	 * R: the array contains all the data in this period
	 * */
	_getAverageRange: function (by, data) {
		//return sum/arr.length;
		// 1 day, od
		// 1 week, ow
		// 1 month, om 
		// 3 month, tm 
		// 1 year, oy 
		// default everything
		var selected_bar = this.svg.select('g.selected_bar')[0][0];
		if (selected_bar !=null) selected_bar = selected_bar.__data__;
		else {
			this.svg.select('g.bar').classed('selected_bar', true);
			selected_bar = this.svg.select('g.bar')[0][0].__data__;
		}
		var container = [];
		var upto = selected_bar==undefined ? ~~(new Date().getTime()/3600/1000): selected_bar.time, 
			from=0; // in hour
	
		switch (by) { 
			case 'od': 
				// get last one day 
				from = upto - 24;
				break; 
			case 'ow': 
				from = upto - 24*7; // past 1 week 
					break;
			case 'om':
				from = upto - 24*30; // past 1 month 
				break;
			case 'tm':
				from = upto - 24*90; // past 3 month
				break;
			case 'oy':
				from = upto - 24*365; // past 1 year 
				break;
			default:
				upto = ~~(new Date().getTime()/3600/1000);
				break;		
		}
	
		for (var i=0;i<data.length;i++) {
			if (data[i].time<=upto && data[i].time>from) {
				container.push(data[i]);
			}
		}
		return container;
	},
	/*
	 * N: getNextSeparator
	 * A: curPos, the index of current bar on the leftmost screen
	 * R: get next separator
	 * */
    _getNextSeparator: function (curPos) {
        var pos=0;
        for (var i=0;i<this.separators.length;i++) {

            var pos = this.separators[i]*this.bar_width;
            if (pos>curPos) return pos;
        }
        return pos;
    },

	/*
	 * N: getPrevSeparator
	 * A: curPos, the index of current bar on the leftmost screen
	 * R: get previous separator
	 * */
    _getPrevSeparator: function (curPos) {
        var pos=0;

        for (var i=this.separators.length-1;i>=0;i--) {
            var pos = this.separators[i]*this.bar_width;
            if (pos<curPos) return pos;
        }
        return pos;    
    },
	/*
	 * N: createSeparator
	 * A: none
	 * D: separator partition all data into intervals that is one level greater than the currently selected time
	 *		it is used when left/right key pressed
	 *		separators is an array of bar index
	 * */
    _createSeparator: function () {
        var curMarker='';
        var marker_by='';
        var bars = this.data;

        switch (this.bar_by) {
            case 'hour':
                marker_by='day';
                break;
            case 'day':
                marker_by='week';
                break;
            case 'week':
                marker_by='month';
                break;
            default:
                break;
        }
        if (marker_by=='' ) {
            this.separators = [];
            return;
        }
        var separators=[];
        for (var bid=0;bid<bars.length;bid++) {
            var bar = bars[bid];
            var tStr = getFormatedTime(bar.time, marker_by);
            if (tStr!=curMarker) {
                curMarker = tStr;
                separators.push(bid);
            } 
        }
        this.separators = separators;
    },
	_renderCircles: function (bars) {
		var self = this;
		var conf = self.config;
		var data=self.container;
    
		bars.append('svg:g').attr('class', 'line').attr('transform',function (d,i) {
            return 'translate('+self.bar_width/2+','+self.line_scale(d.line_val)+')';
        })
        .append('svg:circle') 
        .attr('r', 5)
        .attr('fill', conf.line_color)
		.attr('opacity', 0.4)
        .append('svg:title')
        .text(function (d, i) {
			return d.line_val;
        });
	}

}
