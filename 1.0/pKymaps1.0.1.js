"use strict";
if (!window.popKorn || !popKorn.isPopKornCoreObject || !popKorn.include_more || !popKorn.add_module)
	throw new Error('popKorn core object is not correct.');
popKorn.include_more([]);

popKorn.add_module('ymaps', function(){
	var script = document.createElement('script');
	script.src = "http://api-maps.yandex.ru/2.1/?lang=ru_RU";
	script.async = true;
	document.head.appendChild(script);
	return {
		handler_wrapper: function (handler){
			return ymaps.ready(handler);
		}
	}
}());