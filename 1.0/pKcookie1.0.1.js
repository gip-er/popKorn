"use strict";
if (!window.popKorn || !popKorn.isPopKornCoreObject || !popKorn.include_more || !popKorn.add_module)
	throw new Error('popKorn core object is not correct.');
popKorn.include_more([{name:'plain',ver:1}]);

popKorn.add_module('cookie', function(){
	return {
		global: {
			get: function(name) {
				var matches = document.cookie.match(new RegExp(
					"(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
					));
				return matches ? decodeURIComponent(matches[1]) : undefined;
			},
			set: function(name, value, options) { // options={expires,path,domain,secure}
				options = options || {};
				var expires = options.expires;
				if (typeof expires == "number" && expires) {
					var d = new Date();
					d.setTime(d.getTime() + expires*1000);
					expires = options.expires = d;
				}
				if (expires && expires.toUTCString) { 
					options.expires = expires.toUTCString();
				}
				value = encodeURIComponent(value);
				var updatedCookie = name + "=" + value;
				for(var propName in options) {
					updatedCookie += "; " + propName;
					var propValue = options[propName];    
					if (propValue !== true) { 
						updatedCookie += "=" + propValue;
					}
				}
				document.cookie = updatedCookie;
			},
			del: function(name) {
				var updatedCookie = name + "=; expires="+(new Date(0)).toUTCString();
				document.cookie = updatedCookie;
			}
		}
	}
}());