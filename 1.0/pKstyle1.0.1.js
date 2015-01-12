"use strict";
if (!window.popKorn || !popKorn.isPopKornCoreObject || !popKorn.include_more || !popKorn.add_module)
	throw new Error('popKorn core object is not correct.');
popKorn.include_more([{name:'plain',ver:1}]);

popKorn.add_module('style',function() {
	function makeValidProp(property) {
		if ((new RegExp('[^A-Za-z-]', 'i')).test(property))
			return null;
		property.toLowerCase();
		if ('float' === property)
			return 'styleFloat';
		return property.replace(/(-[a-z])/g,function(match) {
			return match[1].toUpperCase();
		});
	}
	function makeVendProp(node,property,value) {
		var prefix = ['ms','o','moz','webkit'];
		for (var item in prefix)
		{
			var vendProperty = prefix[item]+property.substr(0,1).toUpperCase()+property.substr(1);
			if ( isUndef(node.style[vendProperty]) ) continue;
			node.style[vendProperty] = value;
		}
	}
	return {
		methods: {
			set: function(properties) {
				for (var prop in properties) {
					var p_tmp = prop;//makeValidProp(prop);
					//if ( isNull(p_tmp) ) continue;
					if ( isDef(this.style[p_tmp]) )
						this.style[p_tmp] = properties[prop];
					makeVendProp(this,prop,properties[prop]);
				}
				return this;
			}
		}
	}
}());