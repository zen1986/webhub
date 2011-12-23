// test cases file for data_loader.js and data_processor.js 
// requisites:
// data/valid_raw.txt, data/malformed.txt

function TestSuitStackData(title, block_by, time_by_domain) {
	this.time_by_domain = time_by_domain;
	this.time_by = this.time_by_domain[0];
	this.block_by = block_by;

	this.loader = new DataLoader();
	
	var proc = new DataProcessor(this.time_by, time_by_domain, block_by);
	this.valid_input = proc.get('./data/valid_raw.txt');
	this.valid_output = proc.process();

	this.title = title;
}

TestSuitStackData.prototype = {

	"raw_incomplete_9_in_1_expected_false": function () {
		console.log("running test... raw_incomplete_9_in_1_expected_false");

		var no_info={	"fields": ["pid", "cid", "time", "cost"],
						"raw"	: [[1,2,3,4]]};

		var no_fields ={"info"	: [{"namde": "starhub", "cid": 2}],			
						"raw"	: [[1,2,3,4]]};

		var no_raw = {	"info"	: [{"namde": "starhub", "cid": 2}],
						"fields": ["pid", "cid", "time", "cost"]};

		var info_not_array = {	"info"	:  "cid",
								"fields": ["pid", "cid", "time", "cost"],
								"raw"	: [[1,2,3,4]]};

		var fields_not_array = {"info"	: [{"namde": "starhub", "cid": 2}],
								"fields": "cost",
								"raw"	: [[1,2,3,4]]};

		var raw_not_array ={"info"	: [{"namde": "starhub", "cid": 2}],
							"fields": ["pid", "cid", "time", "cost"],
							"raw"	: 1};

		var info_empty={"info"	: [],	
						"fields": ["pid", "cid", "time", "cost"],
						"raw"	: [[1,2,3,4]]};

		var fields_empty= {	"info"	: [{"namde": "starhub", "cid": 2}],	
							"fields": [],
							"raw"	: [[1,2,3,4]]};

		var raw_empty= {"info"	: [{"namde": "starhub", "cid": 2}],	
						"fields": ["pid", "cid", "time", "cost"],
						"raw"	: []};

		var p = this.loader;

		
		if (
			p.validateRaw(no_info, this.time_by, this.time_by_domain, this.block_by) || 
			p.validateRaw(no_fields, this.time_by, this.time_by_domain, this.block_by) || 
			p.validateRaw(no_raw, this.time_by, this.time_by_domain, this.block_by) || 
			p.validateRaw(info_not_array, this.time_by, this.time_by_domain, this.block_by) || 
			p.validateRaw(fields_not_array, this.time_by, this.time_by_domain, this.block_by) || 
			p.validateRaw(raw_not_array, this.time_by, this.time_by_domain, this.block_by) ||  
		   	p.validateRaw(info_empty, this.time_by, this.time_by_domain, this.block_by) ||  
		   	p.validateRaw(fields_empty, this.time_by, this.time_by_domain, this.block_by) || 
			p.validateRaw(raw_empty, this.time_by, this.time_by_domain, this.block_by)
			) return false;

		else 
			return true;
	},

	// read mal-formed json as external file
	"raw_json_malformed_expected_false": function () {
		console.log("running test... raw_json_malformed_expected_false");
		return this.loader.loadRawData('data/malformed.txt', this.time_by, this.time_by_domain, 'cid')==false;
	},

	// info does not have a 'name' key
	"raw_info_no_name_key_expected_false": function () {
		console.log("running test... raw_info_no_name_key_expected_false");
		var data = {"info"	: [{"company_name": "starhub", "cid": 2}],
					"fields": ["cid", "time"],
					"raw"	: [[2,3]]};
		return this.loader.validateRaw(data, this.time_by, this.time_by_domain, 'cid')==false;
	},

	//info doesn't have an key match this.block_by
	"raw_info_no_blockby_key_expected_false": function () {
		console.log("running test... raw_info_no_blockby_key_expected_false");
		var block_by = 'cid';
		var data = {"info"	: [{"name": "starhub", "did": 2}],
					"fields": [block_by, "time"],
					"raw"	: [[2,3]]};
		return this.loader.validateRaw(data, this.time_by, this.time_by_domain, 'cid')==false;
	},

	// value is both numeric and negative
	"raw_info_negative_value_expected_false": function () {
		console.log("running test... raw_info_negative_value_expected_false");
		var data = {"info"	: [{"name": "starhub", "cid": -2}],
					"fields": ["cid", "time"],
					"raw"	: [[2,3]]};
		return this.loader.validateRaw(data, this.time_by, this.time_by_domain, 'cid')==false;
	},

	
	// length of entry != length of fields
	"raw_raw_entry_length_inequalto_fields_expected_false": function () {
		console.log("running test... raw_raw_entry_length_inequalto_fields_expected_false");
		var data = {"info"	: [{"name": "starhub", "cid": 2}],
					"fields": ["cid", "time"],
					"raw"	: [[2,3,5]]};
		return this.loader.validateRaw(data, this.time_by, this.time_by_domain, 'cid')==false;
	},

	// data of entry contains -ve or non-numeric data type
	"raw_raw_string_or_negative_expected_false": function () {
		console.log("running test... raw_raw_string_or_negative_expected_false");
		var raw_negative= {"info"	: [{"name": "starhub", "cid": 2}],
					"fields": ["cid", "time"],
					"raw"	: [[2,-3]]}
		var raw_string= {"info"	: [{"name": "starhub", "cid": 2}],
					"fields": ["cid", "time"],
					"raw"	: [[2,"string"]]};

		if (this.loader.validateRaw(raw_negative, this.time_by, this.time_by_domain, 'cid')||this.loader.validateRaw(raw_string, this.time_by, this.time_by_domain, 'cid')) return false;
		return true;
	},

	// this.block_by value doesn't exist in the info
	"raw_raw_blockby_value_not_valid_expected_false": function () {
		console.log("running test... raw_raw_blockby_value_not_valid_expected_false");
		// example below, the 12 doesn't match 2 
		var data = {"info"	: [{"name": "starhub", "cid": 2}],
					"fields": ["cid", "time"],
					"raw"	: [[12,3]]};
		return this.loader.validateRaw(data, this.time_by, this.time_by_domain, 'cid')==false;
	},

	"raw_fields_no_blockby_expected_false": function () {
		console.log("running test... raw_fields_no_blockby_expected_false");
		var data = {"info"	: [{"name": "starhub", "cid": 2}],
					"fields": ["did", "time"],
					"raw"	: [[2,3]]};
		return this.loader.validateRaw(data, this.time_by, this.time_by_domain, 'cid')==false;
	},

	// fields doesn't have a 'time' value
	"raw_fields_no_time_expected_false": function () {
		console.log("running test... raw_fields_no_time_expected_false");
		var data = {"info"	: [{"name": "starhub", "cid": 2}],
					"fields": ["cid", "date"],
					"raw"	: [[12,3]]};
		return this.loader.validateRaw(data, this.time_by, this.time_by_domain, 'cid')==false;
	},

	// field not all string
	"raw_fields_value_not_string_expected_false": function () {
		console.log("running test... raw_fields_value_not_string_expected_false");
		var data = {"info"	: [{"name": "starhub", "cid": 2}],
					"fields": ["cid", "time", 9],
					"raw"	: [[12, 3, 8]]};
		return this.loader.validateRaw(data, this.time_by, this.time_by_domain, 'cid')==false;
	},

	"valid_bar_by_domain_expected_true": function () {
		console.log("running test... valid_bar_by_domain_expected_true");
		var i;
		var len = this.time_by_domain.length;
		// is array 
		if (!(this.time_by_domain instanceof Array)) return false;
		// is array of string
		for (i=0;i<len;i++) {
			var val = this.time_by_domain[i];
			if (typeof val !="string") return false;
		}
		// is set
		var set=[];
		for (i=0;i<len;i++) {
			var v = this.time_by_domain[i];
			if (set.indexOf(v)!=-1) continue;
			else set.push(v);
		}	
		if (set.length!=this.time_by_domain.length) return false;

		// is one of 'hour', 'day', 'week', 'month', 'quarter', 'half year', 'year'
		var valid = ['hour', 'day', 'week', 'month', 'quarter', 'half year', 'year'];
		for (i=0;i<len;i++)  {
			if (valid.indexOf(this.time_by_domain[i])==-1) return false;
		}
		return true;
	},


	// test processed data
	// test each data field


	"processed_data_no_info_expected_false": function () {
		console.log("running test... processed_data_no_info_expected_false");

		var data_no_info = {};
		data_no_info.fields = this.valid_output.fields;
		data_no_info.bars = this.valid_output.bars; 

		return this.loader.validateProcessed(data_no_info, this.valid_input, this.time_by, this.time_by_domain, this.block_by) == false;
	}, 
	"processed_data_no_fields_expected_false": function () {
		console.log("running test... processed_data_no_fields_expected_false");

		var data_no_fields= {};
		data_no_fields.info= this.valid_output.info;
		data_no_fields.bars = this.valid_output.bars; 

		return this.loader.validateProcessed(data_no_fields, this.valid_input, this.time_by, this.time_by_domain, this.block_by) == false;
	},
	"processed_data_no_bars_expected_false": function () {
		console.log("running test... processed_data_no_bars_expected_false");

		var data_no_bars= {};
		data_no_bars.info= this.valid_output.info;
		data_no_bars.fields= this.valid_output.fields; 

		return this.loader.validateProcessed(data_no_bars, this.valid_input, this.time_by, this.time_by_domain, this.block_by) == false;
	}, 


	// info and fields are expected unchanged
	"processed_data_fields_changed_expected_false": function () {
		console.log("running test... processed_data_fields_changed_expected_false");

		var data_changed_fields= {};
		data_changed_fields.info= this.valid_output.info;
		data_changed_fields.bars = this.valid_output.bars; 

		data_changed_fields.fields = [];
		for (var i=0;i<this.valid_output.fields.length;i++) data_changed_fields.fields.push(this.valid_output.fields[i]);
		data_changed_fields.fields.pop();
		data_changed_fields.fields.push('hello world');

		return this.loader.validateProcessed(data_changed_fields, this.valid_input, this.time_by, this.time_by_domain, this.block_by) == false;
	},
	"processed_data_info_changed_expected_false": function () {
		console.log("running test... processed_data_info_changed_expected_false");

		var data_changed_info= {};
		data_changed_info.fields= this.valid_output.fields;
		data_changed_info.bars = this.valid_output.bars; 

		data_changed_info.info = [];
		for (var i=0;i<this.valid_output.info.length;i++) data_changed_info.info.push(jQuery.extend(true, {}, this.valid_output.info[i])); 
		data_changed_info.info[0].level = 123;

		return this.loader.validateProcessed(data_changed_info, this.valid_input, this.time_by, this.time_by_domain, this.block_by) == false;
	},


	// testing the bars
	"processed_data_bars_not_StackBar_expected_false": function () {
		console.log("running test... processed_data_bars_not_StackBar_expected_false");

		var data_invalid_bars= {};
		data_invalid_bars.fields= this.valid_output.fields;
		data_invalid_bars.info= this.valid_output.info; 
		data_invalid_bars.bars = deepCopyBars(this.valid_output.bars);

		data_invalid_bars.bars.push( 123);

		return this.loader.validateProcessed(data_invalid_bars, this.valid_input, this.time_by, this.time_by_domain, this.block_by) == false;

	},


	"processed_data_bar_incorrect_count_expected_false": function () {
		console.log("running test... processed_data_bar_incorrect_count_expected_false");

		var data_incorrect_bar_count={};
		data_incorrect_bar_count.fields = this.valid_output.fields;
		data_incorrect_bar_count.info = this.valid_output.info;
		data_incorrect_bar_count.bars = deepCopyBars(this.valid_output.bars);

		var bar_len = data_incorrect_bar_count.bars.length; 
		var rand_idx = ~~(Math.random() * bar_len);
		var rand_bar = data_incorrect_bar_count.bars[rand_idx];
		rand_bar.count++;
		return this.loader.validateProcessed(data_incorrect_bar_count, this.valid_input, this.time_by, this.time_by_domain, this.block_by) == false;
	},
	"processed_data_bar_incorrect_levels_expected_false": function () {
		console.log("running test... processed_data_bar_incorrect_levels_expected_false");

		var data_incorrect_bar_levels={};
		data_incorrect_bar_levels.fields = this.valid_output.fields;
		data_incorrect_bar_levels.info = this.valid_output.info;
		data_incorrect_bar_levels.bars = deepCopyBars(this.valid_output.bars);

		var bar_len = data_incorrect_bar_levels.bars.length; 
		var rand_idx = ~~(Math.random() * bar_len);
		var rand_bar = data_incorrect_bar_levels.bars[rand_idx];
		rand_bar.levels++;
		return this.loader.validateProcessed(data_incorrect_bar_levels, this.valid_input, this.time_by, this.time_by_domain, this.block_by) == false;
	},
	"processed_data_bar_incorrect_time_expected_false": function () {
		console.log("running test... processed_data_bar_incorrect_time_expected_false");

		var data_incorrect_bar_time={};
		data_incorrect_bar_time.fields = this.valid_output.fields;
		data_incorrect_bar_time.info = this.valid_output.info;
		data_incorrect_bar_time.bars = deepCopyBars(this.valid_output.bars);

		var bar_len = data_incorrect_bar_time.bars.length; 
		var rand_idx = ~~(Math.random() * bar_len);
		var rand_bar = data_incorrect_bar_time.bars[rand_idx];
		rand_bar.time--;

		return this.loader.validateProcessed(data_incorrect_bar_time, this.valid_input, this.time_by, this.time_by_domain, this.block_by) == false;
	},


	// check blocks
	
	"processed_data_block_not_StackBlock_expected_false": function () {
		console.log("running test... processed_data_block_not_StackBlock_expected_false");

		var data_incorrect_block_type={};
		data_incorrect_block_type.fields = this.valid_output.fields;
		data_incorrect_block_type.info = this.valid_output.info;
		data_incorrect_block_type.bars = deepCopyBars(this.valid_output.bars);

		//change it to array
		data_incorrect_block_type.bars[0].blocks[0] = []; 

		return this.loader.validateProcessed(data_incorrect_block_type, this.valid_input, this.time_by, this.time_by_domain, this.block_by) == false;
	}, 

	"processed_data_block_incorrect_entry_length_expected_false": function () {
		console.log("running test... processed_data_block_incorrect_entry_length_expected_false");

		var data_incorrect_block_entry_length={};
		data_incorrect_block_entry_length.fields = this.valid_output.fields;
		data_incorrect_block_entry_length.info = this.valid_output.info;
		data_incorrect_block_entry_length.bars = deepCopyBars(this.valid_output.bars);

		//change it to array
		data_incorrect_block_entry_length.bars[0].blocks[0].entries[0].push(1);

		return this.loader.validateProcessed(data_incorrect_block_entry_length, this.valid_input, this.time_by, this.time_by_domain, this.block_by) == false;
	},

	"processed_data_block_incorrect_entry_block_by_value_expected_false": function () {
		console.log("running test... processed_data_block_incorrect_entry_block_by_value_expected_false");

		var data_incorrect_entry_block_by_value={};
		data_incorrect_entry_block_by_value.fields = this.valid_output.fields;
		data_incorrect_entry_block_by_value.info = this.valid_output.info;
		data_incorrect_entry_block_by_value.bars = deepCopyBars(this.valid_output.bars);

		//change the block_by value 
		var block_by_idx = this.valid_output.fields.indexOf(this.block_by);
		data_incorrect_entry_block_by_value.bars[0].blocks[0].entries[0][block_by_idx]++;

		return this.loader.validateProcessed(data_incorrect_entry_block_by_value, this.valid_input, this.time_by, this.time_by_domain, this.block_by) == false;
	},

	"valid_processed_data_expected_true": function () {
		console.log("running test... valid_processed_data_expected_true");
		return this.loader.validateProcessed(this.valid_output, this.valid_input, this.time_by, this.time_by_domain, this.block_by);
	}
}
			


