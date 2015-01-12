"use strict";
if (!window.popKorn || !popKorn.isPopKornCoreObject || !popKorn.include_more || !popKorn.add_module)
	throw new Error('popKorn core object is not correct.');
popKorn.include_more([{name:'plain',ver:1},{name:'event',ver:1},{name:'crypt',ver:1}]);

popKorn.add_module('query', function(){
	var queries_groups = {};
	var get_ajax = function(){
		var xmlhttp;
		try {
			xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
		} catch (e) {
			try {
				xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
			} catch (E) {
				xmlhttp = false;
			}
		}
		if (!xmlhttp && typeof XMLHttpRequest!='undefined') {
			xmlhttp = new XMLHttpRequest();
		}
		return xmlhttp;
	};
	var makeRequestData = function(object,name_prefix) {
		var result = {str:'',n_hash:'',v_hash:''};
		if (!name_prefix) name_prefix = '';
		for (var key in object) {
			if (typeof object[key] === "object" && object[key] !== null) {
				var tmp = makeRequestData(object[key],name_prefix+key+'__');
				result.str += tmp.str;
				result.n_hash += tmp.n_hash;
				result.v_hash += tmp.v_hash;
			} else {
				var val = encodeURIComponent(object[key]);
				result.str += name_prefix+key+'='+val+'&';
				result.n_hash += name_prefix+key+'&';
				result.v_hash += val+'&';
			}
		}
		return result;
	}
	var init_queries_collection = function(name){
		if(isSet(queries_groups[name])) return;
		queries_groups[name] = {};
		queries_groups[name]._count = 0;
		Object.defineProperty(queries_groups[name], '_count', {enumerable: false});
	};
	return {
		global: {
			init: function(url,params){// params = {method, timeout,hash,json}
				var tmp = {
					url:		url || null,
					method:		(params && params.method)	|| null,
					timeout:	(params && params.timeout)	|| false,
					hash:		(params && params.hash)		|| false,
					json:		(params && params.json)		|| false,
					response:	{}
				};
				Object.defineProperty(tmp, '_popKorn_query_object_type', {
					enumerable: false,
					writable: false,
					configurable: false,
					value: 'single_query'
				});
				Object.defineProperty(tmp, 'onComplete', {
					enumerable: false,
					writable: false,
					configurable: false,
					value: function(handlers){ // handlers = func || {complete,notfound,error,timeout}
						if(handlers.varType('function'))
							return tmp.addEvent('ajax_complete',handlers);
						if(typeof handlers !== 'object')
							throw new Error('Incorrect type of handler.');
						if(handlers.complete)	tmp.addEvent('ajax_complete'	,handlers.complete);
						if(handlers.notfound)	tmp.addEvent('ajax_notfound'	,handlers.notfound);
						if(handlers.error)		tmp.addEvent('ajax_error'		,handlers.error);
						if(handlers.timeout)	tmp.addEvent('ajax_timeout'	,handlers.timeout);
						return tmp;
					}
				});
				tmp.send = function(data){
					this.send = function(){throw new Error('This query already been sent.');};
					if(isNull(this.url))throw new Error('Cant send query to empty URL.');
					if(isNull(this.method))this.method='get';
					this.method = this.method.toUpperCase();
					if ( !(this.method === 'GET' || this.method === 'POST') )
						throw new Error('Incorrect method for request.');
					var ajax = get_ajax();
					var is_get = (this.method === 'GET');
					this.sent = makeRequestData(data);
					this.sent.data = data;
					if (this.hash) {
						this.sent.str+='nhash='+this.sent.n_hash.md5()+'&';
						this.sent.str+='vhash='+this.sent.v_hash.md5()+'&';
					}
					ajax.open(this.method,this.url+'?'+(is_get?this.sent.str+'&':'')+'r='+Math.random(), true);
					if (!is_get) ajax.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
					var self = this;
					ajax.onreadystatechange = function() {
						if (ajax.readyState != 4) return;
						if (self.timeout) clearTimeout(timeout_id);
						switch (ajax.status){
						case 200:
							self.response.success = true;
							self.response.text = ajax.responseText;
							if (ajax.responseXML) self.response.xml = ajax.responseXML;
							if (self.json){
								try{
									var tmp_json = JSON.parse(ajax.responseText);
									self.response.json = tmp_json.changeEachItem(tryParse);
								} catch(e) {}
							}
							self.response.headers = ajax.getAllResponseHeaders().split('\n');
							self.response.headers.pop();
							self.triggeringEvent('ajax_complete',null,self.response);
							self.delEvent('ajax_complete');
							self.delEvent('ajax_notfound');
							self.delEvent('ajax_error');
							self.delEvent('ajax_timeout');
						break;
						case 404:
							self.response.success = false;
							self.response.text = 'URL is not found.';
							self.response.headers = ajax.getAllResponseHeaders().split('\n');
							self.response.headers.pop();
							self.triggeringEvent('ajax_notfound',null,self.response);
							self.delEvent('ajax_complete');
							self.delEvent('ajax_notfound');
							self.delEvent('ajax_error');
							self.delEvent('ajax_timeout');
						break;
						default:
							self.response.success = false;
							self.response.text = ajax.statusText;
							self.response.headers = ajax.getAllResponseHeaders().split('\n');
							self.response.headers.pop();
							self.triggeringEvent('ajax_error',null,self.response);
							self.delEvent('ajax_complete');
							self.delEvent('ajax_notfound');
							self.delEvent('ajax_error');
							self.delEvent('ajax_timeout');
						}
					};
					ajax.send(is_get?null:this.sent.str);
					if (self.timeout) {
						var timeout_id = setTimeout( function(){
							ajax.abort();
							self.response.success = false;
							self.response.text = 'No response from server for '+self.timeout+' seconds - time is over.';
							this.triggeringEvent('ajax_timeout',null,self.response);
							this.delEvent('ajax_complete');
							this.delEvent('ajax_notfound');
							this.delEvent('ajax_error');
							this.delEvent('ajax_timeout');
						}, self.timeout*1000);
					}
					return this;
				};
				Object.defineProperty(tmp, 'send', {enumerable: false});
				return tmp;
			},
			initMulti: function(url,params){// params = {method, timeout,hash,json}
				var tmp = {
					url:		url || null,
					method:		(params && params.method)	|| null,
					timeout:	(params && params.timeout)	|| false,
					hash:		(params && params.hash)		|| false,
					json:		(params && params.json)		|| false,
					queries:	[],
					handlers:	[]
				};
				Object.defineProperty(tmp, '_popKorn_query_object_type', {
					enumerable: false,
					writable: false,
					configurable: false,
					value: 'multi_query'
				});
				Object.defineProperty(tmp, 'onComplete', {
					enumerable: false,
					writable: false,
					configurable: false,
					value: function(handlers){ // handlers = func || {complete,notfound,error,timeout}
						if (!isSet(handlers)) {
							this.handlers = [];
							return tmp;
						}
						this.handlers.push(handlers);
						for (var i = 0; i < this.queries.length; i++) {
							if (isDef(this.queries[i].response.success)) continue;
							this.queries[i].onComplete(handlers);
						}
						return tmp;
					}
				});
				tmp.send = function(data) {
					var p = {method:this.method,timeout:this.timeout,hash:this.hash,json:this.json};
					var q = initQuery(this.url,p);
					this.queries.push(q);
					for (var i = 0; i < this.handlers.length; i++) {
						q.onComplete(this.handlers[i]);
					}
					q.send(data);
					return this;
				};
				Object.defineProperty(tmp, 'send', {enumerable: false});
				return tmp;
			},
			initGroup: function(url,params){// params = {method, timeout,hash,json}
				var tmp = {
					url:		url || null,
					method:		(params && params.method)	|| null,
					timeout:	(params && params.timeout)	|| false,
					hash:		(params && params.hash)		|| false,
					json:		(params && params.json)		|| false,
					queries:	[],
					handlers:	[],
					response:	[],
					q_end_count:0
				};
				Object.defineProperty(tmp, '_popKorn_query_object_type', {
					enumerable: false,
					writable: false,
					configurable: false,
					value: 'group_query'
				});
				Object.defineProperty(tmp, 'onComplete', {
					enumerable: false,
					writable: false,
					configurable: false,
					value: function(handler){ // handlers = func || {complete,notfound,error,timeout}
						if (!isSet(handler)) {
							this.handlers = [];
							return tmp;
						}
						this.handlers.push(handler);
						return tmp;
					}
				});
				Object.defineProperty(tmp, 'addQuery', {
					enumerable: false,
					writable: false,
					configurable: false,
					value: function(query){
						if (typeof query === 'number' && query > 0) {
							for(var i=0; i<query; i++) tmp.addQuery();
							return tmp;
						}
						if (!isSet(query)) query = initQuery(	tmp.url, {
													method:		tmp.method,
													timeout:	tmp.timeout,
													hash:		tmp.hash,
													json:		tmp.json
												});
						if (typeof query!=='object') throw new Error('Incorrect query object.');
						if 	(	query._popKorn_query_object_type!=='single_query'
							&&	query._popKorn_query_object_type!=='multi_query')
								throw new Error('Incorrect type of adding query.');
						this.queries.push(query);
						query.onComplete(function(data){
							self.q_end_count++;
							tmp.response.push(data);
							if (self.q_end_count <= self.queries.length) return;
							for (var i = 0; i < tmp.handlers.length; i++)
								tmp.handlers[i](tmp.response);
						});
						return tmp;
					}
				});
				
			}
			/*onCompleteGroup: function(name,handler) {
				if (!isSet(name) || !isSet(handler))
					throw new Error('Incorrect parameters.');
				init_queries_collection(name);
				var func = function(){
					this.delEvent('ajax_group_'+name+'_complete',func);
					delete queries_groups[name]._count;
					handler(queries_groups[name]);
				};
				queries_groups[name].addEvent('ajax_group_'+name+'_complete',func);
			}*/
		},
		methods: {
		}
	}
}());