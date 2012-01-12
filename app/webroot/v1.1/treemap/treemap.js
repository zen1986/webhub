// treemap plotter
// inherit from TreemapBase

function TreemapPlotter() {
	var base = new TreemapBase();
	$.extend(this, base);
}


TreemapPlotter.prototype = {
	draw: function (json) {
		var self=this;
		self.data = json;

		this.color.domain(json.activities);
		this.treemap.value(function (d) {return d.number;});

		this.canvas.data([json]).selectAll("div")
				.data(this.treemap.nodes)
				.enter().append("div")
				.attr("class", function(d) { return d.children ? 'node': 'cell';})
				.style("background", function(d, i) {var color = d.children ? null : self.color(d.name); return color;}) 
				.call(cell)
				.append('title').text(function(d) { return d.children ? null : d.parent.name; });

		function cell() {
			this
				.style("left", function(d) { return d.x + "px"; })
				.style("top", function(d) { return d.y + "px"; })
				.style("width", function(d) { return d.dx - 1 + "px"; })
				.style("height", function(d) { return d.dy - 1 + "px"; });
		}

		this.setEvents()
			.drawLabels();
	},
	setEvents: function () {
		var id = this.id,
			div_id = '#'+id+'_div';

		// put parent node onto bottom
		$(div_id+ ' div.node').css('z-index', -1);

		$(div_id+ ' div.cell').unbind()
			.mouseenter(function () {
				$(this).css('z-index',  100);
				$(this).animate({'width':'+=20', 'height':'+=20', 'left':'-=10', 'top':'-=10'}, 50);
				return false;
			})
			.mouseleave(function () {
				$(this).css('z-index', 0);
				$(this).animate({'width':'-=20', 'height':'-=20', 'left':'+=10', 'top':'+=10'}, 50);
				return false;
			})
			.click(function () {
				var data = d3.select(this)[0][0].__data__,
					info = 'Activity:'+data.name+'<br>Date:'+data.parent.name+'<br>Occurence:'+data.number;
				d3.select('div.info').html(info);
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
		rows = label_cont.selectAll('div.row').data(this.data['activities']).enter().append('div').attr('class', 'row');
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



