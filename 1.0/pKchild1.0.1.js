"use strict";
if (!window.popKorn || !popKorn.isPopKornCoreObject || !popKorn.include_more || !popKorn.add_module)
	throw new Error('popKorn core object is not correct.');
popKorn.include_more([{name:'plain',ver:1}]);

popKorn.add_module('child',function() {
	return {
		methods: {
			is: {
				method: function(parents) {
					if (!isSet(parents)) return;
					var probableParents = parents;
					var probableChild = this;
					if (probableParents.isBasket() || probableParents.varType('list')) {
						for (var i = 0; i < probableParents.length; i++)
							if ( probableChild.isChild(probableParents[i]) )
								return true;
					} else if (probableParents.varType('node'))
						if (probableChild.parentNode === probableParents)
							return true;
					return false;
				}
			},
			find: {
				self: document,
				selection: true,
				method: function(value,num) {
					if ( isSet(value) && !isSet(num) && !value.varType('string') ){
						num = value;
						value = null;
					}
					if ( !isSet(value) || !value.varType('string') || '' === value )
						value = null;
					if ( isSet(num) && !num.varType('number') )
						num = null;
					if ( !isSet(value) && 1 === this.children.length )
						return this.children[0];
					if ( !isSet(value) && !isSet(num) )
						return this.children;
					if ( !isSet(num) )
						return this.querySelectorAll(value);
					if ( !isSet(value) ) {
						while (num < 0) num += this.children.length;
						return this.children[num%this.children.length];
					}
					if ( 0 === num )
						return this.querySelector(value);
					var selected = this.querySelectorAll(value);
					if (selected.length == 1) return selected[0];
					while (num < 0) num += selected.length;
					return selected[num%selected.length];
				}
			},
			push: {
				self: document.body,
				method: function(node) {
					if (!isSet(node))
						return null;
					if (node.varType('node') && !node.isBasket()) {
						var new_node = node.cloneNode(true);
						this.appendChild(new_node);
						return new_node;
					}
					if (node.isBasket() || node.varType('list')) {
						var result = new Basket();
						for (var i=0; i < node.length; i++)
							result.push( this.pushChild(node[i]) );
						return result;
					}
					return null;
				}
			},
			unshift: {
				self: document.body,
				method: function(node) {
					if (!isSet(node))
						return null;
					if (node.varType('node') && !node.isBasket()) {
						var new_node = node.cloneNode(true);
						this.insertBefore(new_node, this.firstChild);
						return new_node;
					}
					if (node.isBasket() || node.varType('list')) {
						var result = new Basket();
						for (var i=0; i < node.length; i++)
							result.push( this.unshiftChild(node[i]) );
						return result;
					}
					return null;
				}
			},
			pop: {
				self: document.body,
				method: function(n) {
					if (n && n > 1){
						var result = new Basket();
						var len = this.children.length;
						for (var i = 1; i <= n ; i++)
							if (len < i)
								result.push(null);
							else
								result.push(this.removeChild(this.children[len-i]));
						return result;
					}
					if (this.children.length === 0)
						return null;
					return this.removeChild(this.children[this.children.length-1]);
				}
			},
			shift: {
				self: document.body,
				method: function(n) {
					if (n && n > 1){
						var result = new Basket();
						var len = this.children.length;
						for (var i = 0; i < n ; i++)
							if (i >= len)
								result.push(null);
							else
								result.push(this.removeChild(this.children[0]));
						return result;
					}
					if (this.children.length === 0)
						return null;
					return this.removeChild(this.children[0]);
				}
			},
			clear: {
				self: document.body,
				method: function() {
					this.innerHTML = '';
					return this;
				}
			}
		}
	}
}());