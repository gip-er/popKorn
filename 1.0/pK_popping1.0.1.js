"use strict";
if (!window.popKorn || !popKorn.isPopKornCoreObject || !popKorn.get_modules || !popKorn.wrap_handler)
	throw new Error('popKorn core object is not correct.');

(function(){
	var BIND_METHOD_TO_NAME = {
		$	:	'findChild',
		$$	:	'createNodes',
		__	:	'use',
		$_	:	'addNodes',
		_$	:	'findNodes',
		css	:	'setStyle'
	};
	var checkBindingForMethod = function(name) {
		var bind = BIND_METHOD_TO_NAME;
		for (var symb in bind)
			if	(bind.hasOwnProperty(symb) && bind[symb]===name){
				Object.prototype[symb] = Object.prototype[name];
				Object.defineProperty(Object.prototype, symb, { enumerable: false });
			}
	}
	var makeLookingThroughMethod = function(method_object) {
		return 
	}
	var addNewMethod = function(method_name, func) {
		var self = func.self || null;
		var selection = func.selection || false;
		if (typeof func !== 'function') {
			func = func.method || null;
		}
		Object.prototype[method_name] = function() {
			var all_results = new Basket();
			var args = Array.prototype.slice.call(arguments);
			if (this instanceof Basket) {
				for (var i = 0; i < this.length; i++) {
					var result = this[i][method_name].apply(this[i], args);
					all_results.add(result, selection);
				}
				return all_results;
			}
			if ( this === window || this === undefined ) //strict mode and not strict mode
				return all_results.add( self ? func.apply(self, args) : null, selection);
			return all_results.add(func.apply(this, args), selection);
		};
		Object.defineProperty(Object.prototype, method_name, { enumerable: false });
		checkBindingForMethod(method_name);
	}
	var modules = popKorn.get_modules();
	for (var module_item in modules) {
		var module_name = '';
		if ( !modules[module_item].simple_methods_names )
			module_name += module_item.substr(0,1).toUpperCase() + module_item.substr(1);
		if ( 'methods' in modules[module_item] ) {
			var methods = modules[module_item].methods;
			for (var method_item in methods) {
				addNewMethod(method_item + module_name, methods[method_item]);
			}
		}
		if ( 'global' in modules[module_item] ) {
			var global = modules[module_item].global;
			if (!window.global_methods_names_list)
				window.global_methods_names_list = [];
			for (var method_item in global) {
				window.global_methods_names_list.push(method_item + module_name);
				window[method_item + module_name] = global[method_item];
			}
		}
		if ( 'handler_wrapper' in modules[module_item] )
			popKorn.wrap_handler(modules[module_item].handler_wrapper)
	}
})();