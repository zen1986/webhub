// treemap plotter

function TreemapBase(conf) {
	var config={
		pad: [80,80,80,80],
		chart_width: 800,
		chart_height: 800,
		label_width: 200,
		chart_title: "chart",
	}
	if (conf == undefined) 
		this.config = config;
	else
		this.config = conf;

	this.id = new Date().getTime();
	this._init();
}

TreemapBase.prototype = {
	_init: function () {
		var conf = this.config;
		var w = conf.chart_width, 
			h = conf.chart_height;
		this.color = d3.scale.ordinal().range(colors);

		var id = this.id;
		var conf = this.config;
		
		var svg_width = this.svg_width = conf.chart_width+conf.pad[3]+conf.pad[1];
		var svg_height= this.svg_height = conf.chart_height+conf.pad[0]+conf.pad[2];

		if ($('#drawing_area').length == 0)
			$('body').prepend('<div id=\'drawing_area\'></div>');
		
		this.treemap = d3.layout.treemap()
			.size([w, h])
			.sticky(true);
		
		this.div= d3.select("#drawing_area").append("div")
			.style("position", "relative")
			.attr('id', id+'_div')

		this.canvas = this.div.append('div')
			.attr('class', 'canvas')
			.style("position", "relative")
			.style("width", w + "px")
			.style("height", h + "px");
		
		this.labels = this.div.append("div")
			.style("position", "absolute")
			.style('left', (1+w)+'px')
			.style('top', '0px')
			.attr('class', 'labels')
			.style('background', 'white')
			.style('width', conf.label_width + 'px')
			.style('height', (1+h) + 'px')
	},
}
