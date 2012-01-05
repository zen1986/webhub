/*
 * SGPlotter -- stack graph plotter
 * draw the graph with given data
 * N=>Name, A=>Arguments, D=>Description, R=>Return
 * */
function SGPlotter(id) {
	
    this.screen_x=0;
	this.popup_y=0;
    this.popup_scrollable_height=0;

	// for optimization of bar rendering
	// container contains bars spanning three screen width
    this.container=[];
	// container pos specify the position of container, from 0 to char_width - container_width
    this.container_pos=0;

	// total | unique
	this.mode = 'total';

	this.graph_id= id;
    this.init();
}

SGPlotter.prototype = {
	/*
	 * N: setData
	 * A: data
	 * D: set the data required to draw the graph
	 * */
    setData: function (data) {
		this.bar_by = data.bar_by;
		this.block_by = data.block_by;

        this.data = data.bars;
		this.info = data.info;
		this.fields = data.fields;
		initBlockColor(this);
    },
	
	/*
	 * N: init
	 * A: none
	 * D: remove previous drawn graph if exist; draw the graph background
	 *
	 * */
    init: function () {
		var id = this.graph_id;

        d3.select('#'+id).empty();
        
		// unique
		this.div = d3.select("#"+id);
		// unique
        this.svg = this.div.append('svg:svg').attr('id', id+"_svg");
        
		// set width and height
        config.svg_width=config.chart_width+config.pad[1]+config.pad[3];
        config.svg_height=config.chart_height+config.pad[0]+config.pad[2];
		
		$("svg").css({"width": config.svg_width, "height":config.svg_height, "backgroundColor":config.background_color});
        
		// unique
        this.stage= this.svg.append('svg:g').attr('class', 'stage')
			.attr('transform', 'translate('+config.pad[3]+', 0)');
		
		this.stage.append('svg:clipPath').attr('id', id+'graph_mask').append('svg:rect')
			.attr('width', config.chart_width)
			.attr('height', config.svg_height);

		this.stage.attr('clip-path', 'url(#'+id+'graph_mask)');

		// unique
        this.labels = this.svg.append('svg:g').attr('class', 'labels');

 
	},

	/*
	 * N: preDraw
	 * A: none
	 * D: do some computation of variables from data supplied before actual drawing
	 *		computation include: bar_width, create separators, create sliding container, set selected bar 
	 * */
    preDraw: function () {
        // calculated config
        this.bar_width = this.data[0]['time_by'].length*8;
        
		// theoretical width
        var full_width = this.data.length*(this.bar_width+config.bar_margin);
        this.draggable_width = Math.max(0,full_width - config.chart_width);
        
        this.createSeparator();
        
        var container_size = 3*(~~(config.chart_width/(config.bar_margin+this.bar_width))+1);
        for (var i=0;i<container_size;i++) {
            if (i<this.data.length) {
                this.container.push(this.data[i]);
            }
        }
        this.container_size = container_size;
		this.selected_bar = this.data[this.data.length-1];
    },

	/*
	 * N: draw
	 * A: none
	 * D: call all the draw functions 
	 * */
    draw: function () {
        this.preDraw();
        this.drawLabels();
        this.drawBarAndLine();
		this.postDraw();
    },

	/*
	 * N: drawBarAndLine
	 * A: none
	 * D: setup regions for drawing bars and lines, setup click listeners for handling paging, call update method to actually draw
	 * */
    drawBarAndLine: function () {
        var self = this;
        var data = this.container;
		var main_x = 0;
		var main_y = config.pad[0]+config.chart_height;
        this.y_coord = d3.scale.linear().range([0, config.chart_height]).domain([0, d3.max(this.data, function (d) {return d.count;})]);

		this.graph = this.stage.append('svg:g').attr('class', 'graph');
		this.graph.attr('transform', 'translate('+main_x+', '+main_y+') scale(1,-1)')
			.call(d3.behavior.drag()
			.on('drag', 
				function (d) {
					var dir = ''
					self.screen_x -= d3.event.dx;
					if (d3.event.dx>0) dir='left';
					if (d3.event.dx<0) dir='right';
					self.screen_x=Math.max(self.screen_x,0);
					self.screen_x=Math.min(self.draggable_width, self.screen_x);
					d3.select(this).attr('transform', 'translate('+(main_x-self.screen_x)+', '+main_y+') scale(1,-1)');
					self.update(dir);
				}));

		this.graph.append('svg:g').attr('class', 'bars').attr('id', this.graph_id+"_bars");
		this.graph.append('svg:g').attr('class', 'lines');
		 
        // Setup animation
        // Allow the arrow keys to change the displayed.
        $(document).keydown(function(e) {
            var dir='';
            switch (e.keyCode) {
                case 37: // left
					if (self.svg.select('.popup')[0][0]==null) {
                    	dir='left';
                    	var pre = self.getPreSeparator(self.screen_x);
                    	self.screen_x = Math.min(self.draggable_width, pre);
                    	self.screen_x = Math.max(self.screen_x, 0);
					}	 
                    break;
                case 39: // right
					if (self.svg.select('.popup')[0][0]==null) {
                    	dir='right';
                    	var next = self.getNextSeparator(self.screen_x);
                    	self.screen_x = Math.max(0, next);
                    	self.screen_x = Math.min(self.screen_x, self.draggable_width);
					} 
                    break;
				}
        	self.svg.select('g.graph').transition().duration(500).attr('transform', 'translate('+(main_x-self.screen_x)+', '+main_y+') scale(1,-1)');
			self.update(dir, 'key');
        });
        
        this.update();
    },

	/*
	 * N: update
	 * A: dir, the direction the screen move to the graph 
	 * D: called when graph is dragged or left/right key is pressed
	 *		update the container and draw the graph
	 *		bars and lines are drawn differently
	 *		bars use container data to enter and exit its element
	 *		lines use container data to compute position, then remove everything before drawing
	 * */
    update: function (dir) {
        if (dir!='') while (!this.updateContainer(dir));
		this.updateBar();
		this.updateLine();
		this.toggleLine(config.show_line);
		this.toggleBar(config.show_bar);
    },

	updateBar: function () {
        this.enterBar();
        this.exitBar();
	},

	/*
	 *
	 * N: enterBar
	 * A: none 
	 * D: use the updated data, then enter bar and line
	 * */
    enterBar: function () {
		var data=this.container;
        var self=this;

		// bar groups
		// position them according to x coord
        var g_bars = this.graph.select('g.bars');

		var bars =g_bars.selectAll('g.bar')
			.data(data, function (d) {return d.time;}).enter().append('svg:g')
			.attr('id', function (d) { return self.graph_id+"_"+d.time;})
			.attr('class', 'bar')
			.attr('time', function (d) {return d.time;})
			.attr('transform', function (d,i) {return 'translate('+((config.bar_margin+self.bar_width)*(i+self.container_pos))+', 0)';});

		// attach rect to bar groups
        var a = bars.append('svg:rect').attr('class', 'bar_background');
        this.renderBarBackground();
        
        // attach x-labels
        bars.append('svg:text').attr('class', 'block bar_label_bottom');
        this.renderBarXLabel();

        // attach y-labels above each bar 
        bars.append('svg:text').attr('class', 'block bar_label_top')
		this.renderBarLabel(this.mode);

        // display blocks for each bar
        bars.selectAll('rect.block').data(function (bar) {return bar.blocks;}).enter().append('svg:rect').attr('class', function (d) {return 'block';});
		this.renderBlockRect(this.mode);
        
		this.renderBlockTitle(this.mode);
 
		
		// click/dblclick binding
		$('#'+this.graph_id+' g.bar').on('dblclick', function () {
			var data = d3.select(this)[0][0].__data__;	
			self.popup(data, self);
		});

		$('#'+this.graph_id+' g.bar').on('click', function () {
			self.selected_bar = d3.select(this)[0][0].__data__;
			self.drawAverageLine();
			// remove previous assigned
			self.svg.select('.selected_bar').classed('selected_bar', false);
			// add new class to currectly selected
			d3.select(this).classed('selected_bar', true);
		})
	},

	/*
	 * N: updateContainer
	 * A: dir, the direction the screen move to the graph, left or right
	 * R: return true if no more moving required, return false otherwise
	 * D: update the container data
	 *		container data is the actual data that have been drawn
	 *		it has has left and right buffer which is of width equal to screen size
	 * */
    updateContainer: function (dir) {
		// positional index
        var screen_pos = ~~(this.screen_x/(this.bar_width+config.bar_margin));
        
        if (screen_pos-this.container_pos<0) screen_pos_in_container=0;
        else screen_pos_in_container=screen_pos-this.container_pos;
        
        if (screen_pos_in_container<this.container_size/3 && this.container_pos==0) {
            container_moving = false;
        } else if (screen_pos_in_container>this.container_size/3 && this.container_pos == this.data.length-this.container_size) {
            container_moving = false;
        } else {
            container_moving =true;
        }
        
        if (container_moving) {
            if (dir=='left') {
                if (screen_pos - this.container_size/3-this.container_pos<0) {
                    this.container_pos--;
                    this.container.unshift(this.data[this.container_pos]);
                    if (this.container.length>this.container_size) this.container.pop();
                    return false;
                } else return true;
            } else if (dir=='right') {
                if (screen_pos - this.container_size/3-this.container_pos>0) {
                    if (this.container_pos+this.container_size<this.data.length) 
                        this.container.push(this.data[this.container_pos+this.container_size]);
                    this.container.shift();
                    this.container_pos++;
                    return false;
                } else return true;
            } else return true;
        } else {
            return true;
        }
    },

	/*
	 * N: exitBar
	 * A: none
	 * D: remove extra DOM element according to updated data
	 * */
    exitBar: function () {
		var data=this.container;
        d3.selectAll('g.bar').data(data, function (d) {return d.time;}).exit().remove();
    },

	/*
	 * N: updateLine 
	 * A: none
	 * D: draw the line graph
	 *		lines are drawn differently from bars
	 *		lines are removed and redrawn every time screen needs update
	 *		this is because line values are computed by SGPlotter
	 *		it makes it easy to switch selected line values (so no need to redraw bar chart every time line selection is changed)
	 * */
	updateLine: function () {
		var data=this.container;
		var self=this;
        
		// draw circles according to line_by value 
        var pos=[];
		var idx_of_line = this.fields.indexOf(config.line_by);

		// line_coord 
        var line_coord = d3.scale.linear().range([0,config.chart_height]).domain([0,d3.max(this.data, function (d) {return lineValue(d, idx_of_line);})]);

        var past_tense = config.line_by+'d';
        if (config.line_by=='collection') past_tense = 'collected';
        if (config.line_by=='redemption') past_tense = 'redeemed';

		// get positions of current data
        var line = d3.svg.line().interpolate('linear');
        for (var i=0;i<data.length;i++) {
			var line_val = lineValue(data[i],idx_of_line);
            var p = [(config.bar_margin+this.bar_width)*(i+self.container_pos)+(config.bar_margin+this.bar_width)/2,line_coord(line_val).toFixed(2), line_val, data[i]];
            pos.push(p)
        }
		// append lines
		var lines = self.svg.select('g.lines');
		lines.selectAll('*').remove();

		// draw lines
        lines.append('svg:path').data([pos]).attr('class', 'line_path line_item')
        .attr('d', line)
        .attr('fill', 'none')
        .attr('stroke', 'DarkViolet')
        .attr('stroke-width',1.5)
        .attr('opacity', 0.3);
        self.line_coord = line_coord;
        self.points = pos;    

		// draw circles
		lines.selectAll('g.line_point').data(pos, function (d) {return d;}).enter().append('svg:g').attr('class', 'line_point')
		.attr('transform',function (d,i) {
            return 'translate('+d[0]+','+parseInt(d[1])+')';
        })
        .append('svg:circle')      // append circles
        .attr('r', 5)
        .attr('fill', config.line_color)
        .append('svg:title')
        .text(function (d, i) {
            return "Points "+past_tense+" :"+lineValue(self.data[self.container_pos+i],idx_of_line).toFixed(0);
        });
                

	},

	/*
	 * N: drawLabels
	 * A: none
	 * D: draw labels
	 *		all static labels
	 * */
    drawLabels: function () {
		var top = this.labels.append('svg:g').attr('class', 'top_region').attr('transform', 'translate('+config.pad[3]+', 0)');
		var bottom= this.labels.append('svg:g').attr('class', 'bottom_region').attr('transform', 'translate('+config.pad[3]+', '+(config.chart_height+config.pad[0])+')');
		var left= this.labels.append('svg:g').attr('class', 'left_region').attr('transform', 'translate(0, 0)');
		var right= this.labels.append('svg:g').attr('class', 'right_region').attr('transform', 'translate('+(config.pad[3]+config.chart_width)+', 0)');
		var legend= this.labels.append('svg:g').attr('class', 'legend_region').attr('transform', 'translate('+(config.pad[3]+config.chart_width + config.pad[3])+', 0)');
		
		// bottom
        bottom.append('svg:line')
			.attr('x1', 0)
			.attr('y1', 0)
			.attr('x2', config.chart_width)
			.attr('y2', 0)
			.attr('stroke', 'black');
         
        // draw chart title
        this.labels.append('svg:text').text('No. of checkins per '+this.block_by+' over a '+this.bar_by)
        .attr('transform', 'translate('+config.pad[3]+','+(config.pad[0]-50)+') scale(1.5) ')
	
        // left region pane
        left.append('svg:rect')
			.attr('width', config.pad[3])
			.attr('height', config.svg_height)
			.attr('fill', config.background_color)

		left.append('svg:g').attr('class', 'y1 axis block').attr('transform', 'translate('+(config.pad[3])+','+(config.pad[0])+')');
		this.renderY1Axis(this.mode);
        
        // title on the left
        left.append('svg:text')
			.text('No. of Checkins (bar)')
			.attr('class', 'left_region_label block')
			.attr('fill', 'black')
			.attr('text-anchor', 'middle')
			.attr('transform', 'rotate(270, 0, 0) translate(-'+(config.chart_height/2+config.pad[0])+', 50) scale(1.2)');
        
        // right region
        right.append('svg:rect')
			.attr('width', config.pad[3])
			.attr('height', config.svg_height)
			.attr('fill', config.background_color)
        		
		var idx_of_line = this.fields.indexOf(config.line_by);
        var line_coord = d3.scale.linear().range([config.chart_height, 0]).domain([0,d3.max(this.data, function (d) {return lineValue(d,idx_of_line);})]);
		var y2Axis = d3.svg.axis().scale(line_coord).orient('right');
		right.append('svg:g').attr('class', 'y2 axis lines').attr('transform', 'translate(0, '+config.pad[0]+')').call(y2Axis); 
		this.labels.select('.y2.axis').selectAll('*').attr('fill', config.line_color);
   
		// title on the right 
        var past_tense = config.line_by+'d';
        if (config.line_by=='collection') past_tense = 'collected';
        if (config.line_by=='redemption') past_tense = 'redeemed';

        right.append('svg:text')
			.text('Points '+past_tense)
			.attr('fill', 'black')
			.attr('text-anchor', 'middle')
			.attr('class', 'right_region_label lines')
			.attr('dx', 0)
			.attr('dy', config.pad[0]+config.chart_height/2-10)
			.attr('transform', 'rotate(90,0,'+(config.pad[0]+config.chart_height/2)+') translate(0, '+(-config.pad[3])+') scale(1.2)');
  
 
        // legend region
        legend.append('svg:rect')
			.attr('width', config.pad[1] - config.pad[3])
			.attr('height', config.svg_height)
			.attr('fill', config.background_color);
        // legend
		var levels = getValues(this.info[this.block_by]);
        var bw=10, bh=10, bmargin=10;
        
        var l = legend.selectAll('g.icon').data(levels).enter().append('svg:g').attr('class', 'icon')
        .attr('transform', function (d) {
            return 'translate(0, '+(levels.length - levels.indexOf(d)) *(bh+bmargin)+')';
        })
			
        l.append('svg:rect').attr('fill', function (d) {return blockColor(d);} ).attr('width', bw).attr('height', bh)
		.attr('level', function (d) {return d;});
			
        var self=this;
        l.append('svg:text')
			.text(function (d) {
				return d;
				})
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
			.attr('stroke', config.bar_color)
			.attr('stroke-width', 1)
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
			.attr('stroke', config.line_color)
			.attr('stroke-width', 1)
			legend.append('svg:text')
			.attr('dx', 20)
			.attr('dy', lvl+4)
			.text('Average for Line')
			.attr('stroke', 'black')
			.attr('stroke-width', 0.1);

		// adjust legend position to middle
		var total_height = lvl+4*2+50;
		var margin_top = (config.svg_height- total_height) /2;

		if (margin_top>0) {
			legend.attr('transform', 'translate('+(config.pad[3]+config.chart_width + config.pad[3])+','+margin_top+')')
		}
    },

	/*
	 * N: createSeparator
	 * A: none
	 * D: separator partition all data into intervals that is one level greater than the currently selected time
	 *		it is used when left/right key pressed
	 *		separators is an array of bar index
	 * */
    createSeparator: function () {
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

	/*
	 * N: getNextSeparator
	 * A: curPos, the index of current bar on the leftmost screen
	 * R: get next separator
	 * */
    getNextSeparator: function (curPos) {
        var pos=0;
        for (var i=0;i<this.separators.length;i++) {
            var pos = this.separators[i]*(config.bar_margin+this.bar_width);
            if (pos>curPos) return pos;
        }
        return pos;
    },

	/*
	 * N: getPreSeparator
	 * A: curPos, the index of current bar on the leftmost screen
	 * R: get previous separator
	 * */
    getPreSeparator: function (curPos) {
        var pos=0;
        for (var i=this.separators.length-1;i>=0;i--) {
            var pos = this.separators[i]*(config.bar_margin+this.bar_width);
            if (pos<curPos) return pos;
        }
        return pos;    
    },
	/*
	 * N: popup
	 * A: bar, selected bar it's a d3 DOM object; self, reference to SGPlotter object
	 * D: create the popup graph
	 *		popup shows the breakdown of data in the selected time
	 * */
    
	popup: function (bar, self) {
		var w=config.svg_width-config.pad[1]+config.pad[3]-20,
			h=config.svg_height,
			r=Math.min(w,h)/2-100,
			donut = d3.layout.pie(),
			levels = getValues(this.info[this.block_by]);
			arc = d3.svg.arc().innerRadius(0).outerRadius(r);

		donut.value(function (d) {return d.entries.length;});
        
		var popup_canvas = self.stage.append('svg:g').attr('class', 'popup').attr('time', bar.time);

		var adjustment = 24;
		popup_canvas.append('svg:rect').attr('width', config.chart_width).attr('height', config.chart_height+adjustment).attr('y', config.pad[0]-adjustment).attr('fill', 'black').attr('opacity', 0.8);

		$('#'+this.graph_id+' g.popup').on('click', function () {
			self.svg.selectAll('.popup').remove();
		});

		popup_canvas
	        .attr('width', w-100)
			.attr('height', h-100)
			.data([bar.blocks]);
		var arcs = popup_canvas.selectAll("g.arc")
			.data(donut)
			.enter().append("svg:g")
			.attr("class", "popup arc")
			.attr("transform", "translate(" + (r+100)+","+(r+100)+")");

		function tweenPie(b) {
			b.innerRadius = 0;
			var i=d3.interpolate({startAngle:0, endAngle:0}, b);
			return function (t) {
				return arc(i(t));
			}
		}

		var paths = arcs.append("svg:path").attr("class", "popup").attr("fill", function(d) { return blockColor(d.data.block_by); });
		paths.transition()
			.ease("bounce")
			.duration(1000)
			.attrTween("d", tweenPie);

		var text = arcs.append("svg:text")
		.attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
		.attr("dy", ".35em")
		.attr("class", "popup")
		.attr("text-anchor", "middle")
		.attr("display", function(d) { return d.value > .15 ? null : "none"; })
		.text(function(d, i) {return d.data.block_by+": "+d.value; })
		.attr("opacity", 0);


		arcs.append("svg:title")
			.text(function (d) {return d.data.block_by+": "+d.value;});

		text.transition().delay(1000).attr('opacity', 1);
	},
	/*
	 * N: toggleLine
	 * A: show, boolean indicating the visibility to set
	 * D: toggle the visibility of line graph
	 * */
    toggleLine: function (show) {
        if (show) 
            this.svg.selectAll('.lines').attr('visibility', 'visible');
        else 
            this.svg.selectAll('.lines').attr('visibility', 'hidden');
        this.show_line= show;
    },

	/*
	 * N: toggleBar
	 * A: show, boolean indicating the visibility to set
	 * D: toggle the visibility of bar graph
	 * */
    toggleBar: function (show) {
        if (show) 
            this.svg.selectAll('.block').attr('visibility', 'visible');
        else 
            this.svg.selectAll('.block').attr('visibility', 'hidden');

        this.show_bar= show;
    },

	/*
	 * N: drawAverageLine
	 * A: none
	 * D: draw the average line for bar and line charts
	 * */
    drawAverageLine: function () {
		var range = getAverageRange(config.average_line_by, this.selected_bar, this.data);
		
		this.average_range = range;
		if (this.mode=='total') 
			var bar_sum = d3.sum(range, function (d) {return d.count});
		else 
			var bar_sum = d3.sum(range, function (d) {return d.unique});
		var bar_average = bar_sum/range.length;
		
		var idx_of_line = this.fields.indexOf(config.line_by);
		var line_sum = d3.sum(range, function (d) {return lineValue(d, idx_of_line);});
		var line_average = line_sum/range.length;
		this.bar_average = bar_average;
		this.line_average = line_average;

		if (config.show_bar) {
			this.svg.select('.bar_average').remove();
			// draw average line for bars
			var bar_average_height = config.pad[0]+config.chart_height-this.y_coord(bar_average);
        	this.labels.append('svg:line')
        	.attr('class', 'block bar_average')
        	.attr('x1', 0+config.pad[3])
        	.attr('y1', bar_average_height)
        	.attr('x2', config.chart_width+config.pad[3])
        	.attr('y2', bar_average_height)
        	.attr('stroke', config.bar_color)
			.append('svg:title').text('Average Checkin:'+bar_average.toFixed(1));
		}
		if (config.show_line) {
        	// draw average line for lines
        	var line_pos = this.line_coord(line_average.toFixed(1));

			this.svg.select('.line_average').remove();
        	this.labels.append('svg:line')
        	.attr('x1', 0+config.pad[3])
        	.attr('y1', config.pad[0]+config.chart_height-line_pos)
        	.attr('x2', config.chart_width+config.pad[3])
        	.attr('y2', config.pad[0]+config.chart_height-line_pos)
        	.attr('stroke', config.line_color)
        	.attr('class', 'line_average lines')
			.append('svg:title').text('Average '+config.line_by+':'+line_average.toFixed(1));
		}
    },

	transformUniqueBar: function () {
		var self=this;
		self.mode = 'unique';

		// transform y1 axis
		this.y_coord = d3.scale.linear().range([0, config.chart_height]).domain([0, d3.max(this.data, function (d) {return d.unique;})]);
		this.renderY1Axis(self.mode);

		// transform blocks
		this.renderBlockRect('unique');
		
		// transform text label
		this.renderBarLabel(self.mode);

		// transform title
		this.renderBlockTitle(self.mode);
	},
	transformTotalBar: function () {
		var self=this;
		self.mode = 'total';

		// transform y1 axis
		this.y_coord = d3.scale.linear().range([0, config.chart_height]).domain([0, d3.max(this.data, function (d) {return d.count;})]);
		this.renderY1Axis(self.mode);

		// transform blocks
		this.renderBlockRect(self.mode);
        
		// transform text label
		this.renderBarLabel(self.mode);
        	
		// transform title
		this.renderBlockTitle(self.mode);
	},
	renderBarBackground: function () {
		var self = this;
		self.graph.selectAll('rect.bar_background')
			.attr('width', this.bar_width+config.bar_margin)
			.attr('height',config.chart_height) 
			.attr('fill', function (d, i) {
				return 'blue';
			})
			.attr('opacity', 0.1)
			.attr('stroke', 1);
	},
	renderBarXLabel: function () {
		this.svg.selectAll('text.bar_label_bottom')
			.text(function (bar) {
				return bar.time_by;
			})
			.attr('stroke', 'red')
			.attr('stroke-width', 0.1)
			.attr('text-anchor', 'middle')
			.attr('x', config.bar_margin/2)
			.attr('y', 0)
			.attr('transform', 'scale(1,-1) translate('+this.bar_width/2+', 20)')
			.attr('fill', 'black');
	},
	renderBlockTitle: function (mode) {
		var self=this;
		if (mode=='total') {
			self.svg.selectAll('title.block').remove();
			// block title
			self.svg.selectAll('rect.block').append('svg:title').attr('class', 'block').text(function (d) {
				return d['block_by'];
			});	   
		} else {
			self.svg.selectAll('title.block').remove();
		}
	},
	renderY1Axis: function (mode) {

		if (mode=='total') {
			this.y1Scale= d3.scale.linear().range([config.chart_height, 0]).domain([0, d3.max(this.data, function (d) {return d.count;})]);
			this.y1Axis = d3.svg.axis().scale(this.y1Scale).orient('left');
		} else {
			this.y1Scale= d3.scale.linear().range([config.chart_height, 0]).domain([0, d3.max(this.data, function (d) {return d.unique;})]);
			this.y1Axis = d3.svg.axis().scale(this.y1Scale).orient('left');
		}
		this.svg.select('.y1.axis').transition().duration(1000).call(this.y1Axis);
	},
	renderBlockRect: function (mode) {
		var self=this;
		var blocks = self.svg.selectAll('rect.block');
		blocks
			.attr('width', this.bar_width)
			.attr('x', config.bar_margin/2)
			.attr('stroke', 'black')
			.attr('stroke-width', '0.5');
        
		if (mode=='total') {
			blocks.transition().duration(500)
				.attr('height', function (d) {return self.y_coord(d.entries.length)})
				.attr('y', function (d) {return self.y_coord(d.acc);});
			blocks.transition().delay(500)
				.attr('fill', function (d) {
					var block_range = getValues(self.info[self.block_by]);
					var block_val_idx = block_range.indexOf(d['block_by']);
					var color = config.color(block_val_idx/block_range.length); 
					return blockColor(d.block_by);
			});
		} else {
			// mode unique
			blocks.transition().duration(500)
				.attr('height', function (d) { return self.y_coord(d.unique)})
				.attr('y', 0); 
			blocks.transition().delay(500)
				.attr('fill', 'Olive'); 
		}
	}, 
	renderBarLabel: function (mode) {
		var self = this;
		var bar_label = self.svg.selectAll('text.bar_label_top');
		bar_label
			.attr('fill', 'grey')
			.attr('opacity', 0)
			.attr('text-anchor', 'middle');

		if (mode=='total') {
			bar_label
				.text(function (bar) {return bar.count.toFixed(2).replace(".00", "");})
				.attr('transform', function (bar) {return  'scale(1,-1) translate('+(config.bar_margin+self.bar_width)/2+', '+(-self.y_coord(bar.count)-10)+')';})
		} else {
			bar_label
				.text(function (bar) {return bar.unique.toFixed(2).replace(".00", "");})
				.attr('transform', function (bar) {return  'scale(1,-1) translate('+(config.bar_margin+self.bar_width)/2+', '+(-self.y_coord(bar.unique)-10)+')';})
		}
		bar_label.transition().attr('opacity', 1);
	},
	postDraw: function () {
		this.drawAverageLine();
	}
}
/*
 * N: getAverageRange
 * A: by, period; selected_bar, the curently selected bar object; data, reference to the data
 * D: compute the average value for certain period upto selected bar date
 * R: the array contains all the data in this period
 * */
function getAverageRange (by, selected_bar, data) {
    //return sum/arr.length;
	// 1 day, od
	// 1 week, ow
	// 1 month, om 
	// 3 month, tm 
	// 1 year, oy 
	// default everything
	var container = [];
	var upto = selected_bar.time, from=0; // in hour

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

}
var colors;

function initBlockColor(plotter) {
	var domain = getValues(plotter.info[plotter.block_by]);
	colors = d3.scale.category20c();
	colors.domain(domain);
}

function blockColor(d) {
	return colors(d);
}
