function DataLoader() {
}


DataLoader.prototype = {
	'loadRawData': function (path, time_by, time_by_domain, block_by) {
		var data = this.loadData(path, time_by, time_by_domain, block_by);

		//if (data && this.validateRaw(data, time_by, time_by_domain, block_by)) return data;
		//else {
		//	return false;
		//}
		return data;
	},

	'loadData': function (path, time_by, time_by_domain, block_by) {
		var req = new XMLHttpRequest();
        req.open('get', path, false);
        req.send(null);
        if (req.readyState == 4) {
			var response = req.responseText;
			try {
				var data = JSON.parse( response );	
				return data;
			} catch (e) {
				console.error("loadRawData: Raw Data Load Exception");
				return false;
			}
		}
		return false;
	}, 

	'validateRaw': function (data, time_by, time_by_domain, block_by) {
		var i, j;
		
		if (data==undefined || !(data instanceof Object)) {
			console.error("validateRaw: raw data is not an Object");
			return false;
		}

		// check time_by
		if (time_by_domain.indexOf(time_by)==-1) {
			console.error("validateRaw: time_by is invalid");
			return false;
		}
		
		// check keys
		// it must have 'info', 'fields', 'raw' keys and they type must be array
		var valid_fields = ['info', 'fields', 'raw'];
		for (i=0;i<valid_fields.length;i++) {
			var val = data[valid_fields[i]];
			if (val==undefined || !(val instanceof Array)) {
				console.error("validateRaw: raw key is invalid ");
				return false;
			}
			if (val.length==0) {
				console.error("validateRaw: raw key is empty ");
				return false;
			}
		}

		// get the first entry and its keys
		var info = data['info'];
		var info_0 = info[0];
		var ref_values = [];

		var info_keys = Object.keys(info_0); 
		var fields = data['fields'];
		
		// must have ref value to info object 
		var refs = fields.filter(function (x) {return info_keys.indexOf(x)!=-1});
		// reference index in fields
		var ref_idx;
		// reference value
		var ref_key;

		if (refs.length != 1) {
			console.error("validateRaw: there is no ref in fields");
			return false;
		} else {
			ref_key = refs[0];
			ref_idx = fields.indexOf(ref_key);
		}

		// check info
		// must have a property name matching block by
		if (!info_0.hasOwnProperty(block_by)) {
			console.error("validateRaw: info object must contain block_by property ");
			return false;
		}

		
		for (i=0;i<info.length;i++) {
			// for each company info
			var cinfo = info[i];
			ref_values.push(cinfo[ref_key]);

			for (j=0;j<info_keys.length;j++) { 
				var key = info_keys[j];
				// must have the same key defined
				if (!cinfo.hasOwnProperty(key)) {
					console.error("validateRaw: info object must have the same key defined ");
					return false;
				}
				// if the value is a number, it cannot be negative
				if (!isNaN(cinfo[key]) && cinfo[key]<0) {
					console.error("validateRaw: info object cannot be negative  ");
					return false;  
				}
			}
		}	

		
		// check fields
		// must have 'time'
		if (fields.indexOf('time')==-1) {
				console.error("validateRaw: time is absent in fields ");
			return false;
		}

		for (i=0;i<fields.length;i++) {
			// fields must all be string
			if (typeof fields[i] != "string") {
				console.error("validateRaw: fields must be all string ");
				return false;
			}
		}
		

		// check raw
		// check data length
		var raw = data['raw'];
		for (i=0;i<raw.length;i++) {
			if (raw[i].length!=fields.length) {
				console.error("validateRaw: data length is incorrect ");
				return false;
			}
			for (j=0;j<fields.length;j++) {
				if (isNaN(raw[i][j]) || raw[i][j]<0) {
				console.error("validateRaw: data entry can only be positive number");
					return false;
				}
			}
			// ref_values must be valid
			if (ref_values.indexOf(raw[i][ref_idx]) == -1) {
				console.error("validateRaw: entry doesn't have valid ref value ");
				return false;
			}
		}

		return true;
	},

	'loadProcessedData': function (path, raw) {
		var data = this.loadData(path, time_by, time_by_domain, block_by);

		if (data && this.validateProcessed(data, raw, time_by, time_by_domain, block_by)) return data;
		else {
			return false;
		}
	},

	'validateProcessed': function (data, raw, time_by, time_by_domain, block_by) {

		if (data==undefined || !(data instanceof Object) || raw==undefined || !(raw instanceof Object)) {
			console.error("validateProcessed: input data not object");
			return false;
		}

		// format
		if (!data.hasOwnProperty('info')) {
			console.error("validateProcessed: data no info");
			return false;
		}
		if (!data.hasOwnProperty('fields')) {
			console.error("validateProcessed: data no fields");
			return false;
		}	
		if (!data.hasOwnProperty('bars')) {
			console.error("validateProcessed: data no bars");
			return false;
		}	
		if (!data['info'] instanceof Array) {
			console.error("validateProcessed: data info not array");
			return false;
		}	
		if (!data['info'].length > 0 ) {
			console.error("validateProcessed: data info array empty");
			return false;
		}
		if (!data['fields'] instanceof Array) {
			console.error("validateProcessed: data fields not array");
			return false;
		}	
		if (!data['fields'].length >0) {
			console.error("validateProcessed: data fields array empty");
			return false;
		}	
		if (!data['bars'] instanceof Array) {
			console.error("validateProcessed: data bars not array");
			return false;
		}	
		if (!data['bars'].length>0) {
			console.error("validateProcessed: data bars array empty");
			return false;
		}
		
		// unchanged fields
		if (raw['fields'].length != data['fields'].length) {
			console.error("validateProcessed: fields length incorrect");
			return false;
		}
		for (var i=0;i<raw['fields'].length;i++) {
			if (data['fields'][i]==undefined || data['fields'][i]!=raw['fields'][i]) {
				console.error("validateProcessed: fields value changed");
				return false;
			}
		}

		// unchanged info
		if (raw['info'].length != data['info'].length) {
			console.error("validateProcessed: info length incorrect");
			return false;
		}

		function sameCompany(c1, c2) {
			for (var i in c1) {
				if (c2[i] == undefined || c2[i] !=c1[i]) {
					return false;
				}
			}
			return true;
		}

		for (var i=0;i<raw['info'].length;i++) {
			if (data['info'][i]==undefined || !sameCompany(data['info'][i], raw['info'][i])) {
				console.error("validateProcessed: info value changed");
				return false;
			}
		}

		// bars are StackBar
		for (var i=0;i<data['bars'].length;i++) {
			var bar = data['bars'][i];
			if (!(bar instanceof StackBar)) { 
				console.error("validateProcessed: bar is not of StackBar");
				return false;
			}
		}
	
		// every block is a StackBlock
		for (var i=0;i<data['bars'].length;i++) {
			var bar = data['bars'][i];
			for (var j=0;j<bar.blocks.length;j++) {
				var block = bar.blocks[j];
				if (!(block instanceof StackBlock)) {
					console.error("validateProcessed: block is not StackBlock");	
					return false;
				}
			}
		}

		// count value is equal to sum of block entries
		for (var i=0;i<data['bars'].length;i++) {
			var bar = data['bars'][i];
			var blocks = bar['blocks'];
			var block_sum=0;
			for (var j=0;j<blocks.length;j++) {
				block_sum+=blocks[j].entries.length;
			}
			if (block_sum != bar.count) {
				console.error("validateProcessed: count value is incorrect");	
				return false;
			}
			
		}


		//levels value is equal to length of blocks
		for (var i=0;i<data['bars'].length;i++) {
			var bar = data['bars'][i];
			var blocks = bar['blocks'];
			if (blocks.length != bar.levels) {
				console.error("validateProcessed: levels value is incorrect");	
				return false;
			}
		}

		// timestamp when converted to string should equal to 'time_by'
		for (var i=0;i<data['bars'].length;i++) {
			var bar = data['bars'][i];
			var label = bar['time_by'];
			var time = bar['time'];
			var t= getFormatedTime(time,time_by);
			if (label != t) {
				console.error("validateProcessed: time value is incorrect");	
				return false;
			}
		}


		// foreach entry in block, entry.length == no. of fields B
		for (var i=0;i<data['bars'].length;i++) {
			var bar = data['bars'][i];
			var blocks = bar['blocks'];
			for (var j=0;j<blocks.length;j++) {
				var block = blocks[j];
				var entries = block['entries'];
				for (var k=0;k<entries.length;k++) {
					if (entries[k].length != data['fields'].length) {
						console.error("validateProcessed: entry length is incorrect");	
						return false;
					}
				}
			}
		}

		// block entries have same block_by value
		for (var i=0;i<data['bars'].length;i++) {
			var bar = data['bars'][i];
			var blocks = bar['blocks'];
			for (var j=0;j<blocks.length;j++) {
				var block = blocks[j];
				var entries = block['entries'];
				var ref_idx = data['ref_idx'];
				var block_by_value = block.block_by; 
				for (var k=0;k<entries.length;k++) {
					var ref_value = entries[k][ref_idx];
					var ref_block_by = findInfo(data['fields'][ref_idx], ref_value, data['info'])[data['block_by']];
					if (ref_block_by != block_by_value) {
						console.error("validateProcessed: entry block_by value is incorrect");	
						return false;
					}
				}
			}
		}
		return true;
	}
}
