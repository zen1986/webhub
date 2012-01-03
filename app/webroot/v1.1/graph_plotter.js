/*
 * SGPlotter -- stack graph plotter
 * draw the graph with given data
 * N=>Name, A=>Arguments, D=>Description, R=>Return
 * */
function SGPlotter() {
	
    this.screen_x=0;
	this.popup_y=0;
    this.popup_scrollable_height=0;

	// for optimization of bar rendering
	// container contains bars spanning three screen width
    this.container=[];
	// container pos specify the position of container, from 0 to char_width - container_width
    this.container_pos=0;

    this.init();
}

SGPlotter.prototype = {
	/*
	 * N: getData
	 * A: path, uri to the JSON data file
	 * D: retrieve data through get request; synchronous process; setData upon success
	 * */
	getData: function (path) {
		var req = new XMLHttpRequest();
		req.open('get', path, false);
		req.send(null);
		if (req.readyState==4) {
			var response = req.responseText;
			var data = JSON.parse(response);
			this.setData(data);
		}
	},

	/*
	 * N: setData
	 * A: data, JSON data as per https://docs.google.com/document/pub?id=11tjO6EYsB35rnr3hKCeZpBiKV4_QbICneHDayHm4AYU&pli=1
	 * D: set the data required to draw the graph
	 * */
    setData: function (data) {
		this.bar_by = data.bar_by;
		this.bar_by_domain = data.bar_by_domain;
		this.block_by = data.block_by;
        this.data = data.bars;
		this.info = data.info;
		this.fields = data.fields;
		this.ref_idx = data.ref_idx;
		this.block_levels = data.block_levels;
    },
	
	/*
	 * N: init
	 * A: none
	 * D: remove previous drawn graph if exist; draw the graph background; show loading;  
	 *
	 * */
    init: function () {
        d3.select('svg').remove();
        
        // main canvas
        this.svg = d3.select('#drawing_div').append('svg:svg').attr('id', 'svg');
        
		// loading
        this.svg.append('svg:g').attr('id', 'loading').attr('transform', 'translate(20, 30)').append('svg:text').text('Loading').style('font-size', 30);loading();
        
        config.svg_width=config.chart_width+config.pad[1]+config.pad[3];
        config.svg_height=config.chart_height+config.pad[0]+config.pad[2];
        // due to firefox compatibility, have to use raw js to set style instead of d3's style method
        var e = document.getElementById('svg');
        e.style.width=config.svg_width+'px';
        e.style.height=config.svg_height+'px';
        e.style.backgroundColor=config.background_color;
        
        
        this.graph = this.svg.append('svg:g')
        .attr('class', 'graph')
        .attr('transform', 'translate('+config.pad[3]+', '+config.pad[0]+')');
        
        this.graph.append('svg:rect')
        .attr('width', config.chart_width)
        .attr('height', config.chart_height)
        .attr('fill', config.background_color);
                

        this.labels = this.svg.append('svg:g')
        .attr('class', 'labels');
    },

	/*
	 * N: preDraw
	 * A: none
	 * D: do some computation of variables from data supplied before actual drawing
	 *		computation include: bar_width, create separators, create sliding container, set selected bar 
	 * */
    preDraw: function () {
        d3.select('#loading').remove();
        // calculated config
        this.bar_width = this.data[0]['time_by'].length*8;
        
        var full_width = this.data.length*(this.bar_width+config.bar_margin)+config.bar_margin;
        this.draggable_width = Math.max(0,full_width - config.chart_width);
        
        this.createSeparator();
        
        var container_size = 3*(~~(config.chart_width/(config.bar_margin+this.bar_width))+1);
        for (var i=0;i<container_size;i++) {
            if (i<this.data.length) {
                this.container.push(this.data[i]);
            } else {
                break;
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
        this.drawBarAndLine();
        this.drawLabels();
		this.drawAverageLine();
    },

	/*
	 * N: drawBarAndLine
	 * A: none
	 * D: setup regions for drawing bars and lines, setup click listeners for handling paging, call update method to actually draw
	 * */
    drawBarAndLine: function () {
        var data = this.container;
        var self = this;
        var y_coord = d3.scale.linear().range([0, config.chart_height]).domain([0, d3.max(this.data, function (d) {return d.count;})]);
        this.y_coord = y_coord; // for use in axis label
        
        var main = this.graph.append('svg:g')
        .attr('class', 'chart_main')
        .attr('transform', 'translate(0, '+(config.chart_height)+') scale(1,-1)')
        .call(d3.behavior.drag()
            .on('drag', 
                function (d) {
                    var dir = ''
                    self.screen_x -= d3.event.dx;
                    if (d3.event.dx>0) dir='left';
                    if (d3.event.dx<0) dir='right';
                    self.screen_x=Math.max(self.screen_x,0);
                    self.screen_x=Math.min(self.draggable_width, self.screen_x);
                    d3.select(this).attr('transform', 
                        'translate('+(-self.screen_x)+', '+config.chart_height+') scale(1,-1)');
                    self.update(dir);
                }));
		main.append('svg:g').attr('class', 'bars');
		main.append('svg:g').attr('class', 'lines');
        
        // Setup animation
        // Allow the arrow keys to change the displayed.
        $(document).keydown(function(e) {
            var dir='';
            switch (e.keyCode) {
                case 37: // left
					if (d3.select('.popup')[0][0]==null) {
                    	dir='left';
                    	var pre = self.getPreSeparator(self.screen_x);
                    	self.screen_x = Math.min(self.draggable_width, pre);
                    	self.screen_x = Math.max(self.screen_x, 0);
					}	 
                    break;
                case 39: // right
					if (d3.select('.popup')[0][0]==null) {
                    	dir='right';
                    	var next = self.getNextSeparator(self.screen_x);
                    	self.screen_x = Math.max(0, next);
                    	self.screen_x = Math.min(self.screen_x, self.draggable_width);
					} 
                    break;
				case 40: // down
					if (d3.select('.popup')[0][0]!=null) {
						self.popup_y += 10;
						self.popup_y = Math.min(self.popup_y, self.popup_scrollable_height);
					}
					break;
				case 38: // up
					if (d3.select('.popup')[0][0]!=null) {
						self.popup_y -= 10;
						self.popup_y = Math.max(self.popup_y, 0);
					}
					break;
				}
			if (d3.select('.popup')[0][0]==null) {
            	d3.select('g.chart_main').transition().duration(500).attr('transform', 
                	'translate('+(-self.screen_x)+', '+config.chart_height+') scale(1,-1)');
				self.update(dir, 'key');
			} else {
				var popup=d3.select('#popup_main');
				popup.attr('transform', 'translate('+(config.popup_text_width+config.pad[3])+', '+(config.pad[0]-self.popup_y)+') ')
			}
        });
        
        this.update();
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
		// click/dblclick binding
		// position them according to x coord
        var bars = d3.select('g.bars')
		.selectAll('g.bar')
        .data(data, function (d) {return d.time;}).enter().append('svg:g')
        .attr('class', 'bar')
        .attr('id', function (d) {return "bar_"+d.time;})
		.attr('time', function (d) {return d.time;})
        .attr('transform', function (d,i) {return 'translate('+((config.bar_margin+self.bar_width)*(i+self.container_pos))+', 0)';});

		// use jQuery's method to register event, easy for testing
		$('g.bar').on('dblclick', function () {
			var data = d3.select(this)[0][0].__data__;	
			self.popup(data, self);
		});

		$('g.bar').on('click', function () {
			self.selected_bar = d3.select(this)[0][0].__data__;
			self.drawAverageLine();
			// remove previous assigned
			d3.select('.selected_bar').classed('selected_bar', false);
			// add new class to currectly selected
			d3.select(this).classed('selected_bar', true);
		})
        
		// attach rect to bar groups
        bars.append('svg:rect')
        .attr('width', this.bar_width+config.bar_margin)
        .attr('height',config.chart_height) 
        .attr('fill', function (d, i) {
				var n=0;
				for (var j=0;j<self.separators.length;j++) {
					if (self.separators[j]<=self.container_pos+i) n++;
				}
				if (n%2==0) return 'lightblue';
				else return 'blue';
		})
        .attr('class', 'bar_background')
		.attr('opacity', 0.1)
		.attr('stroke', 1)

        
        // attach x-labels
        bars.append('svg:text')
        .attr('class', 'x_label_text')
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

        // attach y-labels above each bar 
        bars.append('svg:text')
        .text(function (bar) {
            return bar.count.toFixed(2).replace(".00", "");
        })
        .attr('class', 'block')
        .attr('transform', function (bar) {return  'scale(1,-1) translate('+(config.bar_margin+self.bar_width)/2+', '+(-self.y_coord(bar.count)-10)+')';})
        .attr('fill', 'grey')
        .attr('text-anchor', 'middle');
        
        // display blocks for each bar
        bars.selectAll('rect.block').data(function (bar) {return bar.blocks;}).enter().append('svg:rect')
		.attr('class', function (d) {return 'block bar_item block_'+d.block_by;})
        .attr('width', this.bar_width)
        .attr('height', function (d) {return self.y_coord(d.entries.length)})
        .attr('x', config.bar_margin/2)
        .attr('y', function (d) {return self.y_coord(d.acc);})
        .attr('fill', function (d) {var color = config.color(self.block_levels.indexOf(d['block_by'])/self.block_levels.length); return color;})
        .attr('stroke-width', 0);
        
		d3.selectAll('title.block').remove();
        // block title
        d3.selectAll('rect.block').append('svg:title').attr('class', 'block').text(function (d) {
                return findInfo(self.block_by, d.block_by, self.info)[self.block_by]+"\r\ncount: "+d['entries'].length.toFixed(2).replace(".00", "");
        });
        
		
        this.toggleBar(this.bar_hidden);
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
        this.enterBar();
        this.exitBar();
		this.drawLine();
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
	 * N: drawLine
	 * A: none
	 * D: draw the line graph
	 *		lines are drawn differently from bars
	 *		lines are removed and redrawn every time screen needs update
	 *		this is because line values are computed by SGPlotter
	 *		it makes it easy to switch selected line values (so no need to redraw bar chart every time line selection is changed)
	 * */
	drawLine: function () {
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
		var lines = d3.select('g.lines');
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
                

		// draw right region labels
		d3.select('.right_region_label').remove();
		d3.select('.right_region').append('svg:text')
        .text('Points '+past_tense)
        .attr('fill', 'black')
        .attr('text-anchor', 'middle')
        .attr('class', 'right_region_label')
        .attr('dx', 0)
        .attr('dy', config.pad[0]+config.chart_height/2-10)
        .attr('transform', 'rotate(90,0,'+(config.pad[0]+config.chart_height/2)+') translate(0, '+(-config.pad[3])+') scale(1.2)');
        
        this.toggleLine(this.line_hidden);
	},

	/*
	 * N: drawLabels
	 * A: none
	 * D: draw labels
	 *		all static labels
	 * */
    drawLabels: function () {
        this.labels.append('svg:line')
        .attr('class', 'bottom')
        .attr('x1', config.pad[3])
        .attr('y1', config.pad[0]+config.chart_height)
        .attr('x2', config.pad[3]+config.chart_width)
        .attr('y2', config.pad[0]+config.chart_height)
        .attr('stroke', 'black');
         
        
        // draw chart title
        this.labels.append('svg:text').text('No. of checkins per '+this.block_by+' over a '+this.bar_by)
        .attr('transform', 'translate('+config.pad[3]+','+(config.pad[0]-50)+') scale(1.5) ')
	
        // left region pane
        this.labels.append('svg:g')
        .attr('class', 'left_region')
        .append('svg:rect')
        .attr('width', config.pad[3])
        .attr('height', config.svg_height)
        .attr('fill', config.background_color)
		var y1Scale= d3.scale.linear().range([config.chart_height, 0]).domain([0, d3.max(this.data, function (d) {return d.count;})]);
		var y1Axis = d3.svg.axis().scale(y1Scale).orient('left');
		d3.select('g.left_region').append('svg:g').attr('class', 'y1 axis').attr('transform', 'translate('+(config.pad[3])+','+(config.pad[0])+')').call(y1Axis);
        
        // title on the left
        d3.select('g.left_region').append('svg:text')
        .text('No. of Checkins (bar)')
        .attr('class', 'left_region_label')
        .attr('fill', 'black')
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(270, 0, 0) translate(-'+(config.chart_height/2+config.pad[0])+', 50) scale(1.2)');
        
        // right region
        this.labels.append('svg:g')
        .attr('class', 'right_region')
        .attr('transform', 'translate('+(config.pad[3]+config.chart_width)+', 0)')
        .append('svg:rect')
        .attr('width', config.pad[3])
        .attr('height', config.svg_height)
        .attr('x', 0)
        .attr('fill', config.background_color)
        		
		var idx_of_line = this.fields.indexOf(config.line_by);
        var line_coord = d3.scale.linear().range([config.chart_height, 0]).domain([0,d3.max(this.data, function (d) {return lineValue(d,idx_of_line);})]);
		var y2Axis = d3.svg.axis().scale(line_coord).orient('right');
		d3.select('g.right_region').append('svg:g').attr('class', 'y2 axis').attr('transform', 'translate(0, '+config.pad[0]+')').call(y2Axis); 
		d3.select('.y2.axis').selectAll('*').attr('fill', config.line_color);
   
		// title on the right 
        var past_tense = config.line_by+'d';
        if (config.line_by=='collection') past_tense = 'collected';
        if (config.line_by=='redemption') past_tense = 'redeemed';

        d3.select('g.right_region').append('svg:text')
        .text('Points '+past_tense)
        .attr('fill', 'black')
        .attr('text-anchor', 'middle')
        .attr('class', 'right_region_label')
        .attr('dx', 0)
        .attr('dy', config.pad[0]+config.chart_height/2-10)
        .attr('transform', 'rotate(90,0,'+(config.pad[0]+config.chart_height/2)+') translate(0, '+(-config.pad[3])+') scale(1.2)');
       
 
        // legend region
        this.labels.append('svg:g')
        .attr('class', 'legend_region')
        .append('svg:rect')
        .attr('width', config.pad[1] - config.pad[3])
        .attr('height', config.svg_height)
        .attr('x', 2*config.pad[3]+config.chart_width)
        .attr('fill', config.background_color);
        
        // legend
        var legend_width = config.pad[1]-config.pad[3];
        var legend_height = config.svg_height;
        var legend_x = config.pad[3]+config.chart_width + config.pad[3];
        var legend_y = 0;
		
        var legend = d3.select('g.legend_region').append('svg:g').attr('class', 'legend')
        .attr('transform', 'translate('+legend_x+','+legend_y+')')
		
        legend.append('svg:rect')
        .attr('width', legend_width)
        .attr('height', legend_height)
        .attr('fill', config.background_color);
        
        var levels = this.block_levels;
        var color = function (level) {
            return config.color(levels.indexOf(level)/levels.length);
        }
        var bw=10, bh=10, bmargin=10;
        
        var l = legend.selectAll('g.icon').data(levels).enter().append('svg:g').attr('class', 'icon')
        .attr('transform', function (d) {
            return 'translate(0, '+(levels.length - levels.indexOf(d)) *(bh+bmargin)+')';
        })
			
        l.append('svg:rect').attr('fill', function (d) {return color(d);} ).attr('width', bw).attr('height', bh)
		.attr('level', function (d) {return d;});
			
        var self=this;
        l.append('svg:text')
        .text(function (d) {
            var ret=findInfo(self.block_by, d, self.info);
			return ret[self.block_by];
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
			legend.attr('transform', 'translate('+legend_x+','+margin_top+')')
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
        var pad=[10, 0, 0, 30];
        var blocks = bar.blocks;
		var label = bar.time_by;
		var bar_width = 30;
		var total = bar.count;
		var perc = blocks.map(function (b) {return b['entries'].length;});
		var clipPath = d3.select('#svg').append('svg:clipPath').attr('id', 'popup_clip').attr('class', 'popup');
		var block_levels = self.block_levels;
	
		// define the clip region
		clipPath.append('svg:rect')
		.attr('x', 0)
		.attr('y', config.pad[0])
		.attr('width', config.svg_width)
		.attr('height', config.chart_height+config.pad[2]-10);	
 	      
		self.popup_y = 0;
		self.popup_scrollable_height = blocks.length*bar_width - config.chart_height-config.pad[2]+10;
		var popup_canvas = d3.select('svg').append('svg:g').attr('class', 'popup').attr('time', bar.time);
	
        popup_canvas.append('svg:rect')
        .attr('width', config.svg_width-config.pad[1]+config.pad[3]-20)
        .attr('height', config.svg_height)
		.attr('fill', config.popup_background)
		.attr('opacity', 0.9);
        
		$('g.popup').on('click', function () {
			d3.selectAll('.popup').remove();
		});
		// popup title
		var clip_center = popup_canvas.append('svg:g').attr('clip-path', 'url(#popup_clip)');
		popup_canvas.append('svg:text')
        .attr('x', config.pad[3]+config.popup_text_width)
        .attr('y', config.pad[0]/2)
        .text('No. of checkins per '+this.block_by+' at '+label)
        .attr('stroke-width', 0.3)
        .style('font-size', 24)
        .attr('fill', 'lightblue');

		var main = clip_center.append('svg:g').attr('id', 'popup_main')
        .attr('transform', 'translate('+(config.popup_text_width+config.pad[3])+', '+config.pad[0]+') ');

       	var bars = main.selectAll('g.popup_bar').data(blocks).enter().append('svg:g').attr('class', 'popup_bar')
        .attr('transform', function (d , i) {return 'translate(0,'+bar_width*i+')';})
		var x_coord = d3.scale.linear().range([0, config.chart_width-config.popup_text_width]).domain([0, d3.max(blocks, function (b) {return b['entries'].length;})]);
	
		bars.append('svg:rect')
		.transition().delay(function (d, i) {return 50*i;})
		.attr('width', function (d, i) {return x_coord(d['entries'].length)})
		.attr('height', bar_width)
		.attr('fill', function (d, i) {return config.color(block_levels.indexOf(d['block_by'])/block_levels.length);})
		.attr('stroke', 'black')
		.attr('stroke-width', 1); 
	
		bars.append('svg:text')
		.transition().delay(function (d, i) {return 50*i;})
        .attr('stroke', 'black')
        .attr('fill', 'white')
        .attr('stroke-width', 0)
        .style('font-size', 18)
        .text(function (d) {return findInfo(self.block_by, d['block_by'], self.info)[self.block_by];})
        .attr('dx', -4)
        .attr('dy', bar_width/2)
        .attr('text-anchor', 'end')
	

		// percentage
		bars.select('text.percentage').data(perc).enter().append('svg:text').attr('class', 'percentage').text(function (d) {var p = ((d/total)*100).toFixed(1);return p+'%'})
		.transition().delay(function (d, i) {return 50*i;})
		.attr('x', function (d) {return x_coord(d);})
		.attr('y', function (d, i) {return i*bar_width;})
		.attr('dy', bar_width/2)
		.attr('dx', 4)
		.attr('stroke', 'white')
		.attr('fill', 'white')
		.attr('text-anchor', 'start')
		.attr('stroke-width', 0.1)
		
        bars.append('svg:title')
        .text(function (d) {return findInfo(self.block_by, d['block_by'], self.info)[self.block_by];});

    },

	/*
	 * N: toggleLine
	 * A: hide, boolean indicating the visibility to set
	 * D: toggle the visibility of line graph
	 * */
    toggleLine: function (hide) {
		config.show_line=!hide;
        if (hide) {
            d3.selectAll('.lines').attr('visibility', 'hidden');
            d3.selectAll('.right_region_label').attr('visibility', 'hidden');
			d3.selectAll('.y2.axis').attr('visibility', 'hidden');
        }
        else {
			d3.selectAll('.y2.axis').attr('visibility', 'visible');
            d3.selectAll('.lines').attr('visibility', 'visible');
            d3.selectAll('.right_region_label').attr('visibility', 'visible');
        }
        this.line_hidden = hide;
    },

	/*
	 * N: toggleBar
	 * A: hide, boolean indicating the visibility to set
	 * D: toggle the visibility of bar graph
	 * */
    toggleBar: function (hide) {
		config.show_bar = !hide;
        if (hide) {
			d3.selectAll('.y1.axis').attr('visibility', 'hidden');
            d3.selectAll('.block').attr('visibility', 'hidden');
            d3.selectAll('.left_region_label').attr('visibility', 'hidden');
        }
        else {
			d3.selectAll('.y1.axis').attr('visibility', 'visible');
            d3.selectAll('.block').attr('visibility', 'visible');
            d3.selectAll('.left_region_label').attr('visibility', 'visible');
        }
        this.bar_hidden = hide;
    },

	/*
	 * N: drawAverageLine
	 * A: none
	 * D: draw the average line for bar and line charts
	 * */
    drawAverageLine: function () {
		var range = getAverageRange(config.average_line_by, this.selected_bar, this.data);
		
		this.average_range = range;
		var bar_sum = d3.sum(range, function (d) {return d.count});
		var bar_average = bar_sum/range.length;
		
		var idx_of_line = this.fields.indexOf(config.line_by);
		var line_sum = d3.sum(range, function (d) {return lineValue(d, idx_of_line);});
		var line_average = line_sum/range.length;
		this.bar_average = bar_average;
		this.line_average = line_average;

		if (config.show_bar) {
			d3.select('.bar_average').remove();
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

			d3.select('.line_average').remove();
        	this.labels.append('svg:line')
        	.attr('x1', 0+config.pad[3])
        	.attr('y1', config.pad[0]+config.chart_height-line_pos)
        	.attr('x2', config.chart_width+config.pad[3])
        	.attr('y2', config.pad[0]+config.chart_height-line_pos)
        	.attr('stroke', config.line_color)
        	.attr('class', 'line_average lines')
			.append('svg:title').text('Average '+config.line_by+':'+line_average.toFixed(1));
		}
    }
}

/*
 * show loading animation
 * */
var count=0;
function loading() {
	if (count==5) {
        count=0;
		d3.selectAll('text.comma').remove()
	}
	for (var i=0;i<count;i++) {
		d3.select('#loading').append('svg:text').text('.').attr('class', 'comma').attr('dx', 90+ count*10).style('font-size', 30)
	}
	if (d3.select('#loading')[0][0]!=null) {
		setTimeout('loading()', 300);
	}
	count++;
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

