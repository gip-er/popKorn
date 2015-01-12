"use strict";
if (!window.popKorn || !popKorn.isPopKornCoreObject || !popKorn.include_more || !popKorn.add_module)
	throw new Error('popKorn core object is not correct.');
popKorn.include_more([{name:'plain',ver:1}]);

popKorn.add_module('nodes',function() {
	function restoreObject(original,backup) {
		for (var key in backup) {
			if ( key[0] === '_' ) continue;
			if (typeof backup[key] == "object")
				restoreObject(original[key],backup[key]);
			else
				original[key] = backup[key];
		}
	}
	function setAttrs(node,attrs_obj) {
		if ( attrs_obj && attrs_obj.varType('object') ) {
			if ( isDef(attrs_obj._counter) ) {
				if (isUndef(attrs_obj._backup))
					attrs_obj._backup = attrs_obj.cloneMe();
				else
					restoreObject(attrs_obj,attrs_obj._backup);
			}
			if ( attrs_obj._before && attrs_obj._before.varType('function') )
				attrs_obj._before();
			for (var param in attrs_obj) {
				if ( param[0] === '_' ) continue;
				if (param === 'innerHTML') {
					if (isNull(attrs_obj[param]))
						node.innerHTML = null;
					else if (attrs_obj[param].varType('node'))
						node.appendChild(attrs_obj[param]);
					else if (attrs_obj[param].isBasket() || attrs_obj[param].varType('list')) {
						for (var i = 0; i < attrs_obj[param].length; i++)
							if (attrs_obj[param][i].varType('node'))
								node.appendChild(attrs_obj[param][i]);
					} else if (isDef(attrs_obj[param]))
						node.innerHTML = attrs_obj[param];
				} else {
					node[param] = attrs_obj[param];
				}
				if (param === 'className' && node.patchClass)
					node.patchClass();
			}
			if ( attrs_obj._after && attrs_obj._after.varType('function') )
				attrs_obj._after();
		}
	}
	var getNextElement = document.documentElement.nextElementSibling !== undefined ?
		function(elem) {
			return elem.nextElementSibling;
		} : function(elem) {
			var current = elem.nextSibling;
			while(current && current.nodeType != 1) {
				current = current.nextSibling;
			}
			return current;
		};
	var getPrevElement = document.documentElement.previousElementSibling !== undefined ?
		function(elem) {
			return elem.previousElementSibling;
		} : function(elem) {
			var current = elem.previousSibling;
			while(current && current.nodeType != 1) {
				current = current.previousSibling;
			}
			return current;
		};
	var matchesSelector = document.documentElement.matchesSelector
						|| document.documentElement.webkitMatchesSelector
						|| document.documentElement.mozMatchesSelector
						|| document.documentElement.msMatchesSelector
						|| document.documentElement.oMatchesSelector;
	return {
		methods: {
			unique: {
				selection: true,
				method: function() {
					return this;
				}
			},
			find: {
				method: function(value) {
					if ( !isSet(value) || !value.varType('string') || value === '' )
						return this;
					if (matchesSelector.call(this,value))
						return this;
				}
			},
			create: {
				self: document.body,
				method: function(tag_name,attrs_obj) {
					var node = document.createElement(tag_name);
					setAttrs(node,attrs_obj);
					node.add_me_to = this;
					return node;
				}
			},
			add: {
				method: function(parent) {
					if ( isUndef(this.add_me_to) )
						return this;
					if ( !isSet(parent) || !parent.varType('node') )
						parent = this.add_me_to;
					delete this.add_me_to;
					parent.appendChild(this);
					return this;
				}
			},
			change: {
				method: function(attrs_obj) {
					setAttrs(this,attrs_obj);
					return this;
				}
			},
			copy: {
				method: function() {
					return this.cloneNode(true);
				}
			},
			del: {
				method: function() {
					return this.parentNode ? this.parentNode.removeChild(this) : this;
				}
			},
			next: {
				method: function() {
					return getNextElement(this);
				}
			},
			prev: {
				method: function() {
					return getPrevElement(this);
				}
			},
			up: {
				selection: true,
				method: function() {
					return this.parentNode ? this.parentNode : this;
				}
			},
			directUp: {
				method: function() {
					return this.parentNode ? this.parentNode : this;
				}
			},
			subjoin: {
				method: function(node) {
					if (!this.parentNode || !isSet(node)) return null;
					var parent = this.parentNode;
					var elem = getNextElement(this);
					if (node.varType('node') && !node.isBasket()) {
						var new_node = node.cloneNode(true);
						elem ? parent.insertBefore(new_node, elem) : parent.appendChild(new_node);
						return new_node;
					}
					if (node.isBasket() || node.varType('list')) {
						var result = new Basket();
						for (var i=0; i < node.length; i++){
							var new_node = node.cloneNode(true);
							elem ? parent.insertBefore(new_node, elem) : parent.appendChild(new_node);
							result.push(new_node);
						}
						return result;
					}
					return null;
				}
			}
		}
	}
}());