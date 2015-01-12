"use strict";
if (!window.popKorn || !popKorn.isPopKornCoreObject)
	throw new Error('popKorn core object is not correct.');

(function(){
	var modules = {};
	popKorn.get_modules = function(){
		return modules;
	};
	popKorn.add_module = function(name,module){
		modules[name] = module;
	};
	window.Basket = function(){
		var args = Array.prototype.slice.call(arguments);
		for (var i = 0; i < args.length; i++)
			this.push(args[i]);
		this.add = function(basket, ignore_duplicated) {
			var len = this.length;
			var type = Object.prototype.toString.call(basket).toLowerCase().replace(/\[[\w]+ ([\w]+)\]/,'$1');
			if	( 	!(basket instanceof Basket)
				&&	'nodelist' !== type
				&&	'htmlcollection' !== type ) {
				if (ignore_duplicated)
					for (var j = 0; j < len; j++)
						if ( this[j] === basket )
							return basket;
				this.push(basket);
				return basket;
			}
			adding: for (var i = 0; i < basket.length; i++) {
				if (ignore_duplicated){
					for (var j = 0; j < len; j++)
						if ( this[j] === basket[i] )
							continue adding;
				}
				this.push(basket[i]);
			}
			return this;
		};
		Object.defineProperty(this, 'add', {enumerable: false});
	}
	window.Basket.prototype = new Array;
})();