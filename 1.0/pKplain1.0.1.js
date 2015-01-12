"use strict";
if (!window.popKorn || !popKorn.isPopKornCoreObject || !popKorn.include_more || !popKorn.add_module)
	throw new Error('popKorn core object is not correct.');
popKorn.include_more([]);

popKorn.add_module('plain',function() {
	var deep_copy = function (obj) {
		var copy = obj.constructor();
		for (var key in obj) {
			if (typeof obj[key] === "object" && obj[key] !== null)
				copy[key] = deep_copy(obj[key]);
			else
				copy[key] = obj[key];
		}
		return copy;
	};
	return {
		simple_methods_names: true,
		global: {
			isNull: function (elem) {
				return (null === elem);
			},
			isUndef: function (elem) {
				return (undefined === elem);
			},
			isDef: function (elem) {
				return !(undefined === elem);
			},
			isSet: function (elem) {
				return (undefined !== elem && null !== elem);
			},
			tryParse: function(str) {
				if (str === 'true') return true;
				if (str === 'false') return false;
				if (str === 'null') return null;
				if (str === 'undefined') return undefined;
				var n = parseFloat(str);
				var s = ''+n;
				return (s===str?n:str);
			}
		},
		methods: {
			use: function() {
				var args = Array.prototype.slice.call(arguments);
				var func = args.shift();
				if (typeof func === 'function')
					this[func].apply(this,args);
				return this;
			},
			varType: function(val) {
				var type = Object.prototype.toString.call(this).toLowerCase().replace(/\[[\w]+ ([\w]+)\]/,'$1');
				if (!val)
					return type;
				if (typeof val !== 'string')
					return null;
				switch (val) {
					case 'primitive':
						if (val === null)
							return true;
						return (typeof this !== 'object' && typeof this !== 'function');
					break;
					case 'node':
						return (new RegExp('html(?:[a-z]*)element', 'i')).test(type);
					break;
					case 'nodelist':
						return ('nodelist' === type || 'htmlcollection' === type);
					break;
					case 'list':
						return ('array' === type || 'nodelist' === type || 'htmlcollection' === type);
					break;
					default:
						return (type === val.toLowerCase());
				}
			},
			isEmpty: function() {
				if (!this.varType('object'))
					return false;
				for (var any in this)
					return false;
				return true;
			},
			isBasket: function() {
				if (!this.varType('object'))
					return false;
				if (this instanceof Basket)
					return true;
				return false;
			},
			cloneMe: function() {
				if (typeof this === "object")
					return deep_copy(this);
				return this;
			},
			changeEachItem: function(func) {
				if (typeof this !== "object")
					return func(this);
				for (var item in this){
					if (typeof this[item] !== "object")
						this[item] = func(this[item]);
					else
						this[item].forEach(func);
				}
				return this;
			}
		}
	}
}());