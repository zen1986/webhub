// treemap plotter
// inherit from TreemapBase

function TreemapPlotter(d) {
	var base = new TreemapBase();
	this.tree = d;
	$.extend(this, base);
	this.init().draw();
}
TreemapPlotter.prototype = {
	init: function () {
		var self = this;
		this.level = 0;
		this.treemap.value(function (d) {return d.value;});
		this.treenodes = this.treemap.nodes(this.tree);
		return this;
	},
	draw: function () {
		var self=this,
			node,
			levels = self.levels = d3.max(self.treenodes, function (t) {return t.depth;});

		this.color = d3.scale.category20c();

		node = this.canvas.data([this.tree]).append('svg:g').attr('class', 'node').attr('id', function (d) {return d.name;})
						.attr("visibility", "visible");
		node.append('svg:rect')
			.attr("class", "node")
			.attr("width", function (d) {return d.dx;})
			.attr("height", function (d) {return d.dy;})
			.attr("fill", function(d, i) {return self.color(d.name);}) ;

		node.append('svg:text').text(function (d) {return d.depth;})
			.attr('dy', function (d) {return d.dy/2;}).attr('dx', function (d) {return d.dx/2;});

		for (var i=0;i<levels;i++) {
			node = node.selectAll('g.node').data(function (d) {return d.children;}).enter().append('svg:g')
					.attr('class', 'node')
					.attr('id', function (d) {return d.name;})
					.attr("visibility", "hidden")
					.attr("transform", function (d) {return 'translate('+(d.x-d.parent.x)+','+(d.y-d.parent.y)+')';});
			node.append('svg:rect')
				.attr("class", "node")
				.attr("width", function (d) {return d.dx;})
				.attr("height", function (d) {return d.dy;})
				.attr("fill", function(d, i) {return self.color(d.name);});
			node.append('svg:text').text(function (d) {return d.depth;})
				.attr('dy', function (d) {return d.dy/2;}).attr('dx', function (d) {return d.dx/2;});
		}

		this.setEvents()
			//.drawLabels();
	},
	setEvents: function () {
		var id = this.id,
			self = this,
			conf = self.config,
			div_id = '#'+id+'_div';

		function getGroupDim(d) {
			var w=0,h=0, c=d.children;
			for (var i=0;i<c.length;i++) {
				w+=c[i].dx;
				h+=c[i].dy;
			}
			return [w,h];
		}
		$(div_id+ ' g.node').unbind()
			.mouseenter(function () {
				return false;
			})
			.mouseleave(function () {
				return false;
			})
			.contextmenu(function () {
				var data = d3.select(this)[0][0].__data__,
					time = 500;
				if (data.depth ==self.levels) return false;
					// g 
				var node = d3.selectAll($(this.childNodes).filter('g')).style('opacity', 0).transition().delay(time).attr('visibility', 'visible');
				//var parent = d3.select(this)[0][0].parentNode;
				//var me = $(this).remove();
				//$(parent).append(me);
				d3.select(this).transition().delay(time)
						.attr('transform', function (d) {
							if (d.depth == 0) 
								return 'translate(0,0) scale('+conf.config_width/d.dx+', '+conf.config_height/d.dy+')';
							else 
								return 'translate(0,0) scale('+d.parent.dx/d.dx+', '+d.parent.dy/d.dy+')';
							//return 'translate(0,0) ';
						});
				node.transition().duration(time).style('opacity', 1);
				// need to move this child to the last
				$(this).parent().append(this);

				return false;
			})
			.click(function () {
				var data = d3.select(this)[0][0].__data__, time=500, node;
				// prevent hiding root background
				if (data.depth ==0) return false;
				// prevent hiding parent with a visible child
				// if (!d3.selectAll($(this.childNodes).filter('g[visibility=visible]'))[0].every(function (d) {return d==null;})) return false;

				d3.select(d3.select(this)[0][0].parentNode).transition().delay(time)
						.attr('transform', function (d) {
							if (d.depth == 0) 
								return 'translate('+d.dx+','+d.dy+') scale('+d.dx/conf.config_width+', '+d.dy/conf.config_height+')';
							else 
								return 'translate('+d.dx+','+d.dy+') scale('+d.dx/d.parent.dx+', '+d.dy/d.parent.dy+')';
						});
				
				//node = d3.select(this).transition().duration(time).style('opacity', 0);
				//node.transition().delay(time).attr('visibility', 'hidden');
				return false;
			});

		return this;
	},

	drawLabels: function () {
		var map, rows,
			self = this,
			label_cont = this.labels.append('div').attr('class', 'legend');

		map = {
			'top': '100px',
			'position': 'absolute',
			'width': '100px',
		};
		$('div.legend').css(map);

		this.labels.append('div').text('Activity Density Graph')
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

		label_cont.append('text').text('legend').style('line-height', '2em').style('margin', '10px');
		rows = label_cont.selectAll('div.row').data(this.tree['activities']).enter().append('div').attr('class', 'row');
		map = {
			'position': 'relative',
			'margin-bottom': '10px',
			'margin-left': '10px'
		};
		$('div.row').css(map);

		rows.append('div').attr('class', 'icon')
			.style('background', function (d) {return self.color(d);})
			.style('width', '20px').style('height', '20px');

		rows.append('text').text(function (d) {return d;})
			.style('position', 'absolute')
			.style('left', '25px')
			.style('top', '0px');

		// information div
		this.labels.append('div').attr('class', 'info');
		map = {
			'width': '150px', 
			'height': '200px', 
			'position': 'absolute',
			'bottom': 0,
			'left': '25px',
			'background': 'lightblue',
		};
		
		$('div.info').css(map);
		return this;
	},
}



