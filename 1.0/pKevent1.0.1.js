"use strict";
if (!window.popKorn || !popKorn.isPopKornCoreObject || !popKorn.include_more || !popKorn.add_module)
	throw new Error('popKorn core object is not correct.');
popKorn.include_more([]);

popKorn.add_module('event', function(){
	if(!window.global_methods_names_list)
		window.global_methods_names_list = [];
	if(!window.global_methods_names_list.save_it_for_me)
		window.global_methods_names_list.save_it_for_me = 0;
	window.global_methods_names_list.save_it_for_me++;
	var guid = 0;
	var readyList = [];
	function bindReady(handler) {
		var called = false;
		function ready() {
			if (called) return;
			called = true;
			handler();
		}
		if (document.addEventListener) {document.addEventListener("DOMContentLoaded",function(){ready();},false);}
		else if (document.attachEvent) {
			if (document.documentElement.doScroll && window == window.top) {
				var tryScroll = function () {
					if (called) return;
					if (!document.body) return;
					try {
						document.documentElement.doScroll("left");
						ready();
					}
					catch(e) {setTimeout(tryScroll,0);}
				}
				tryScroll();
			}
			document.attachEvent("onreadystatechange", function(){if (document.readyState === "complete") {ready();}});
		}
		if (window.addEventListener) {window.addEventListener('load', ready, false);}
		else if (window.attachEvent) {window.attachEvent('onload', ready);}
	}
	function fixEvent(event) {
		event = event || window.event;
		if ( event.isFixed ) {return event;}
		event.isFixed = true;
		event.preventDefault = event.preventDefault || function(){this.returnValue = false;};
		event.stopPropagation = event.stopPropagaton || function(){this.cancelBubble = true;};
		if (!event.target) {event.target = event.srcElement;}
		if (!event.relatedTarget && event.fromElement) {
			event.relatedTarget = event.fromElement == event.target ? event.toElement : event.fromElement;
		}
		if (event.pageX == null && event.clientX != null) {
			var html = document.documentElement, body = document.body;
			event.pageX = event.clientX + (html && html.scrollLeft || body && body.scrollLeft || 0) - (html.clientLeft || 0);
			event.pageY = event.clientY + (html && html.scrollTop || body && body.scrollTop || 0) - (html.clientTop || 0);
		}
		if (!event.which && event.button) {
			event.which = (event.button & 1 ? 1 : ( event.button & 2 ? 3 : ( event.button & 4 ? 2 : 0 ) ));
		}
		return event;
	}
	function commonHandle(event) {
		event = fixEvent(event);
		var handlers = this.events[event.type];
		var errors = [];
		for (var g in handlers) {
			try {
				var handler = handlers[g];
				var ret = handler.call(this, event);
				if ( ret === false ) {
					event.preventDefault();
					event.stopPropagation();
				}
				else if ( ret !== undefined) {event.result = ret;}
				if (event.stopNow) break;
			} catch(err) {errors.push(err);}
		}
		if (errors.length == 1) {throw errors[0];}
		else if (errors.length > 1) {
			var e = new Error("Multiple errors thrown in handling 'sig', see errors property");
			e.errors = errors;
			throw e;
		} 
	}
	return {
		handler_wrapper: function(handler){
			if (!readyList.length) {
				bindReady(function() {
					for(var i=0; i<readyList.length; i++)
						readyList[i]();
				});
			}
			readyList.push(handler);
		},
		methods: {
			add: {
				self: document,
				method: function (type,handler) {
					var elem = this;
					if (type === '') return elem;
					if (elem.setInterval && ( elem != window && !elem.frameElement ) ) {elem = window;}
					if (!handler.guid) {handler.guid = ++guid;}
					if (!elem.events) {
						elem.events = {};
						Object.defineProperty(elem, 'events', { enumerable: false });
						elem.handle = function(event) {
							if (typeof Event !== "undefined") {return commonHandle.call(elem, event);}
						}
						Object.defineProperty(elem, 'handle', { enumerable: false });
					}
					if (!elem.events[type]) {
						elem.events[type] = {};
						if (elem.addEventListener) {elem.addEventListener(type, elem.handle, false);}
						else if (elem.attachEvent) {elem.attachEvent("on" + type, elem.handle);}
					}
					elem.events[type][handler.guid] = handler;
					return elem;
				}
			},
			del: {
				self: document,
				method: function (type,handler) {
					var elem = this;
					var handlers = elem.events;
					if (!handlers) return elem;
					if (type === ''){
						if (elem.events)
							for (var type_item in elem.events) {
								var handlers = elem.events[type_item];
								if (!handlers) return elem;
								if (!handler) {
									for ( var i in handlers )
										delete elem.events[type_item][i];
								} else {
									delete handlers[handler.guid];
									for(var any in handlers)
										return elem;
								}
							}
					} else {
						var handlers = elem.events[type];
						if (!handlers) return elem;
						if (!handler) {
							for ( var i in handlers )
								delete elem.events[type][i];
						} else {
							delete handlers[handler.guid];
							for(var any in handlers)
								return elem;
						}
					}
					if (elem.removeEventListener) {elem.removeEventListener(type, elem.handle, false);}
					else if (elem.detachEvent) {elem.detachEvent("on" + type, elem.handle);}
					delete elem.events[type];
					for (var any in elem.events)
						return elem;
					try {
						delete elem.handle;
						delete elem.events;
					} catch(err) {
						elem.removeAttribute("handle");
						elem.removeAttribute("events");
					}
					return elem;	
				}
			},
			triggering: {
				self: document,
				method: function(type,handler) {
					var elem = this;
					if (type === '') return elem;
					var handlers = elem.events && elem.events[type];
					if (!handlers) return elem;
					if (!handler) {
						for ( var i in handlers )
							elem.events[type][i].apply(this, Array.prototype.slice.call(arguments, 2));
					} else {
						if ( handler.guid in handlers )
							handlers[handler.guid].apply(this, Array.prototype.slice.call(arguments, 2));
					}
					return elem;
				}
			},
			count: {
				self: document,
				method: function(type) {
					var elem = this;
					var counter = 0;
					var handlers = elem.events;
					if (!handlers) return 0;
					if (!isSet(type) || type === '') {
						for (var i in handlers)
							for (var j in handlers[i])
								counter++;
						return counter;
					}
					handlers = elem.events[type];
					if (!handlers) return 0;
					for (var i in handlers)
						counter++;
					return counter;
				}
			}
		}
	}
}());