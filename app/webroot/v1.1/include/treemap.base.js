// treemap plotter
// tree structure
// each node is associated with a value
// only dig 2 levels

function TreemapBase(conf) {
	var config={
		pad: [80,80,80,80],
		chart_width: 800,
		chart_height: 800,
		label_width: 200,
		chart_title: "chart",
	}
	if (conf) 
		this.config = conf;
	else
		this.config = config;

	this.id = new Date().getTime();
	this._init();
}

TreemapBase.prototype = {
	_init: function () {
		var conf = this.config,
			w = conf.chart_width, 
			h = conf.chart_height,
			id = this.id,
			conf = this.config,
			svg_width = this.svg_width = conf.chart_width+conf.pad[3]+conf.pad[1],
			svg_height= this.svg_height = conf.chart_height+conf.pad[0]+conf.pad[2];

		// color marks level 2 data
		//this.color = d3.scale.ordinal().range(colors.slice(10));
		// opacity marks level 1 data
		this.opacity = d3.scale.ordinal().rangePoints([0.2,1]);

		if ($('#drawing_area').length == 0)
			$('body').prepend('<div id=\'drawing_area\'></div>');
		
		// treemap layout
		this.treemap = d3.layout.treemap()
			.size([w, h])
			.sticky(true);
		
		// container div
		this.div= d3.select("#drawing_area").append("div")
			.style("position", "relative")
			.style('width', (w+conf.label_width+10) + 'px')
			.style('height', (h+1) + 'px')
			.style('border', '1px solid black')
			.attr('id', id+'_div');

		// drawing div
		this.canvas = this.div.append('svg:svg')
			.attr('class', 'canvas')
			.style("width", w + "px")
			.style("height", h + "px");
		
		// labeling div
		this.labels = this.div.append("div")
			.style("position", "absolute")
			.style('left', (1+w)+'px')
			.style('top', '0px')
			.attr('class', 'labels')
			.style('background', 'white')
			.style('width', conf.label_width + 'px')
			.style('height', (1+h) + 'px');
		return this;
	},
}
