// treemap plotter
// inherit from TreemapBase

function TreemapPlotter(d) {
	var base = new TreemapBase();
	$.extend(this, base);

	this.tree = d;
	this.init().draw();
}
TreemapPlotter.prototype = {
	init: function () {
		var self = this;
		this.level = 0;
		// specify value function , this value will determin the size of the rectangles
		this.treemap.value(function (d) {return d.value;});

		this.treenodes = this.treemap.nodes(this.tree);

		// set the color for secondary represenation
		this.color = d3.interpolateRgb('rgb(255,255,255)', 'rgb(100,100,100)');
		return this;
	},
	draw: function () {
		var self=this,
			node,
			levels = self.levels = d3.max(self.treenodes, function (t) {return t.depth;}),
			max_unique= self.max_unique= d3.max(self.treenodes, function (t) {return t.unique;});

		// set the root
		node = this.canvas.data([this.tree]);

		for (var i=0;i<levels;i++) {
			// group
			node = node.selectAll('g.node').data(function (d) {return d.children;}).enter().append('svg:g')
					.attr('class', 'node group')
					.attr('id', function (d) {return d.name;})
					.attr("visibility", function () {return i==0? "visible":"hidden";})
					.attr("transform", function (d) {return 'translate('+(d.x-d.parent.x)+','+(d.y-d.parent.y)+')';});

			// rectangle
			node.append('svg:rect')
				.attr("class", "node")
				.attr("width", function (d) {return d.dx;})
				.attr("height", function (d) {return d.dy;})
				.attr("stroke", 'black')
				.attr("stroke-width", 0.01)
				.attr("fill", function(d, i) {return self.color(d.unique/max_unique);});
		}

		this.setEvents().drawLabels();
	},
	setEvents: function () {
		var id = this.id,
			self = this,
			conf = self.config,
			div_id = '#'+id+'_div';

		// keep current scale
		self.scalex= [1];
		self.scaley= [1];
		
		// keep history of selected nodes
		self.history = [this.tree];

		$(div_id+ ' g.node').unbind()
			.click(function () {
				drillDown.call(this);
				return false;
			})
			.contextmenu(function () {
				drillUp.call(this);
				return false;
			});

		function getGroupDim(d) {
			var w=0,h=0, c=d.children;
			for (var i=0;i<c.length;i++) {
				w+=c[i].dx;
				h+=c[i].dy;
			}
			return [w,h];
		}
		function drillDown() {
			var data = d3.select(this)[0][0].__data__,
				time = 300;
			if (data.depth ==self.levels) return false;
			if (self.history.filter(function (h) {return h.name == data.name;}).length !=0) {
				return false;
			}
		
			self.history.push(data);
			self._updateLabels();

			if (data.parent) {
				self.scalex.push(data.parent.dx/data.dx);
				self.scaley.push(data.parent.dy/data.dy);
			}
			// scale this to fit full screen
			d3.select(this).transition().delay(0).duration(time)
				.attr('transform', function (d) {
					return 'scale('+d.parent.dx/d.dx+', '+d.parent.dy/d.dy+')';
				});
			
			// need to move this to the last element of parent, z-order
			$(this).parent().append(this);
			// show child nodes
			var node = d3.selectAll($(this.childNodes).filter('g')).style('opacity', 0).transition().delay(time).duration(time).attr('visibility', 'visible');
			node.transition().duration(time).style('opacity', 1);
		}
		function drillUp() {
			var data = d3.select(this)[0][0].__data__, time=300, node;
			// prevent hiding root background
			if (data.depth ==1) return false;

			if (self.history.length>1) {
				self.history.pop();
				self._updateLabels();
			}
			var parent = d3.select($(this).parent()[0]);

			// hide this and siblings 
			var children = d3.selectAll($(parent[0][0].childNodes).filter('g')).transition().duration(time).style('opacity', '0');
			children.transition().delay(time).attr('visibility', 'hidden');
			if (data.depth!=1) {
				self.scalex.pop();
				self.scaley.pop();
			}
			
			// move parent back to position
			parent.transition().delay(time).duration(time)
				.attr('transform', function (d) {
					if (d.depth == 0) 
						return '';
					else  {
						return 'translate('+(d.x-d.parent.x)+','+(d.y-d.parent.y)+')';
					}
				});
		}

		return this;
	},

	drawLabels: function () {
		var map, rows,
			self = this,
			label_cont = this.labels.append('div').attr('class', 'legend');

		map = {
			'top': '10px',
			'left': '10px',
			'position': 'absolute',
			'width': '200px',
		};
		$('div.legend').css(map);

		this.labels.append('div').text('Redemption Density Graph')
			.attr('class', 'title')
			
		map = {
			'top': '-80px',
			'left': '-140px',
			'position': 'absolute',
			'font-size': '2em',
			'color': 'black',
			'width': '500px',
			'margin': '10px'
		};

		$('div.title').css(map);

		label_cont.append('text').text('Unique Count').style('line-height', '1em').style('margin', '10px');
		rows = label_cont.selectAll('div.row').data(d3.range(100,0,-10)).enter().append('div').attr('class', 'row');
		map = {
			'position': 'relative',
			'margin-top': '5px',
			'margin-bottom': '5px',
			'margin-left': '10px',
			'height': '1em'
		};
		$('div.row').css(map);

		rows.append('div').attr('class', 'icon')
			.style('background', function (d) {return self.color(d/100);})
			.style('width', '20px').style('height', '20px');

		rows.append('text').text(function (d) {return d;})
			.style('position', 'absolute')
			.style('left', '25px')
			.style('font-size', '10pt')
			.style('top', '0px');

		this.labels.append('div').attr('class', 'instruction').style('position', 'absolute').style('bottom', '10px').style('left', '10px');
		$('div.instruction').append("Instruction: <br/>Left click to drill down<br/>Right click to drill up<br/>Rect Size &#8250; Total Count<br/>Rect Color &#8250; Unique Count");
		
		// information div
		this.labels.append('div').attr('class', 'info');

		// rect labels
		this.div.append('div').attr('class', 'tree_labels').style('position', 'absolute').style('left', 0).style('top', 0);

		self._updateLabels();
		return this;
	},
	_updateLabels: function () {
		var map, cur_depth, parent_node;
		var conf = this.config;

		map = {
			'top': '-1.2em',
			'left': '-'+this.config.chart_width+'px',
			'position': 'absolute',
			'font-size': '14pt',
			'color': 'black',
			'width': '500px',
			'height': '40px',
		};
		
		$('div.info').css(map);

		$('div.info').empty();
		
		$('div.info').append('root');
		for (var i=1;i<this.history.length;i++) {
			var name = this.history[i].name;
			$('div.info').append("&#8594;"+ name);
		}
	
		cur_depth = this.history.length;
		parent_node= this.history[cur_depth-1];

		var labels = d3.select('div.tree_labels').selectAll('div').data(parent_node.children, function (n) {return n.name;});

		labels.enter().append('div')
			.style('text-align', 'center')
			.style('position', 'absolute')
			.style('overflow', 'hidden')
			.style('left', function (d) {return (d.x-d.parent.x)*conf.chart_width/d.parent.dx+'px';})
			.style('top', function (d) {return (d.y-d.parent.y+d.dy/2)*conf.chart_height/d.parent.dy+'px';})
			.style('max-width', function (d) {return d.dx*conf.chart_width/d.parent.dx+'px';})
			.append('p')
			.style('width', '100px')
			.transition().delay(600)
			.text(function (d) {return d.name;});
		labels.exit().remove();
	},
}



