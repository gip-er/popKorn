"use strict";
window.popKorn = function(){
	var INCLUDE = {
		I		:	'popKorn.js',
		DIR		:	null,
		FILES	:	{
						PRELOAD	:	[
										{name:'_kernels',ver:1}
									],
						LOAD	:	[],
						POSTLOAD:	[
										{name:'_popping',ver:1},
										{name:'_cleaner',ver:1}
									],
						MIN		:	[
										{name:'plain',ver:1},
										{name:'event',ver:1}
									],
						STABLE	:	[
										{name:'nodes',ver:1},
										{name:'child',ver:1},
										{name:'class',ver:1},
										{name:'style',ver:1},
										{name:'state',ver:1},
										{name:'crypt',ver:1},
										{name:'query',ver:1},
										{name:'qsync',ver:1},
										{name:'input',ver:1},
									],
						EXT		:	[
									],
						MORE	:	[]
					},
		VERSION	:	'1.0',
		PREFIX	:	'pK',
		SUFFIX	:	'.js',
	};
	var handler_on_init = [];
	var new_script_nodes = [];
	var make_filepath = function(file) {
		if (typeof file === 'object' && file.name !== undefined && file.ver !== undefined){
			var dir_path = file.path ? file.path : INCLUDE.DIR+'/'+INCLUDE.VERSION+'/';
			var file_name = INCLUDE.PREFIX+file.name+INCLUDE.VERSION+'.'+file.ver+INCLUDE.SUFFIX;
			return dir_path + file_name;
		}
		return null;
	}
	var include_file = function(file) {
		var script = document.createElement('script');
		script.src = make_filepath(file);
		script.async = false;
		document.head.appendChild(script);
		new_script_nodes.push(script);
	}
	var add_without_duplicates = function(adding,original) {
		to_next_add: for (var i = 0; i < adding.length; i++) {
			for (var j = 0; j < original.length; j++)
				if ( original[j].name === adding[i].name ) {
					original[j].ver = Math.max(original[j].ver,adding[i].ver);
					continue to_next_add;
				}
			original.push(adding[i]);
		}
	}
	var include_files = function (args) {
		var param;
		var files;
		if (!args) args = '';
		if (typeof args === 'object' && args.shift) {
			param = args.shift();
			files = args;
		} else param = args;
		if (typeof param !== 'string' || param === '') param = 'stable';
		(INCLUDE.DIR = document.querySelector('script[src$="'+INCLUDE.I+'"]').src.split(/[\\\/]/)).pop();
		INCLUDE.DIR = INCLUDE.DIR.join('/');
		if (files)
			add_without_duplicates(files,INCLUDE.FILES.LOAD);
		switch (param) {
			case 'ext':
				add_without_duplicates(INCLUDE.FILES.EXT,INCLUDE.FILES.LOAD);
			case 'stable':
				add_without_duplicates(INCLUDE.FILES.STABLE,INCLUDE.FILES.LOAD);
			case 'min':
				add_without_duplicates(INCLUDE.FILES.MIN,INCLUDE.FILES.LOAD);
		}
		[].concat(INCLUDE.FILES.PRELOAD,INCLUDE.FILES.LOAD,INCLUDE.FILES.POSTLOAD).forEach(include_file);
	}
	return {
		cook: function(includes,handler) {
			if (!this.isPopKornCoreObject) {
				this.isPopKornCoreObject = true;
				this.get_handler = function(){
					return handler_on_init[handler_on_init.length-1];
				};
				this.wrap_handler = function(func){
					var len = handler_on_init.length;
					handler_on_init[len] = function(){
						func(handler_on_init[len-1]);
					};
				};
				this.get_script_nodes = function(){
					return new_script_nodes;
				};
				this.include_more = function(list){
					add_without_duplicates(list,INCLUDE.FILES.MORE);
				};
				this.check_includes = function(){
					var errors = [];
					to_next: for (var i = 0; i < INCLUDE.FILES.MORE.length; i++) {
						for (var j = 0; j < INCLUDE.FILES.LOAD.length; j++)
							if		(
										INCLUDE.FILES.LOAD[j].name === INCLUDE.FILES.MORE[i].name
									&&
										INCLUDE.FILES.LOAD[j].ver >= INCLUDE.FILES.MORE[i].ver
									)
								continue to_next;
						errors.push(INCLUDE.FILES.MORE[i]);
					}
					if (0 === errors.length) return null;
					var files_list_str = '';
					for (var i = 0; i < errors.length; i++)
						files_list_str += '\n\t\t'+errors[i].name+' ver-'+errors[i].ver;
					return new Error('For stable work need next files to be included:'+files_list_str);
				};
				if(!handler && typeof includes === 'function'){
					handler_on_init[0] = includes;
					include_files();
				} else {
					handler_on_init[0] = handler;
					include_files(includes);
				}
			} else
				throw new Error("Repeated initialization of popKorn core object.");
		},
	};
}();