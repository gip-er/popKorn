"use strict";
if (!window.popKorn || !popKorn.isPopKornCoreObject || !popKorn.include_more || !popKorn.add_module)
	throw new Error('popKorn core object is not correct.');
popKorn.include_more([{name:'plain',ver:1}]);

popKorn.add_module('state',function() {
	var initStates = function (core_obj, prop) {
		if (isUndef(core_obj['_popKornStates'])){
			core_obj['_popKornStates'] = {};
			Object.defineProperty(core_obj, '_popKornStates', {enumerable: false});
		}
		var states = core_obj['_popKornStates'];
		if (isUndef(states[prop])){
			states[prop] = [{id:'_default',data:core_obj[prop]}];
			delete core_obj[prop];
			Object.defineProperty(core_obj, prop, {
				get: function() {
					return states[prop][states[prop].length-1].data;
				},
				set: function(value) {
					for (var i = 0; i < states[prop].length; i++)
						if (states[prop][i].id === '_default'){
							states[prop][i].data = value;
							return;
						}
					states[prop].push({id:'_default',data:value});
				},
				enumerable: true
			});
		}
		return core_obj['_popKornStates'][prop];
	}
	var checkStates = function (core_obj, prop) {
		if (isUndef(core_obj['_popKornStates']))
			throw new Error('States object is not exist.');
		if (isUndef(core_obj['_popKornStates'][prop]))
			throw new Error('Not exist stack of property "'+prop+'" in states object.');
		return core_obj['_popKornStates'][prop];
	}
	var initStateReceivers = function (core_obj, prop) {
		if (isUndef(core_obj['_popKornStateReceivers']))
			core_obj['_popKornStateReceivers'] = {};
		if (isUndef(core_obj['_popKornStateReceivers'][prop]))
			core_obj['_popKornStateReceivers'][prop] = [];
		return core_obj['_popKornStateReceivers'][prop];
	}
	var callToReceivers = function (core_obj, prop) {
		if (isUndef(core_obj['_popKornStateReceivers'])) return;
		if (isUndef(core_obj['_popKornStateReceivers'][prop])) return;
		core_obj['_popKornStateReceivers'][prop].forEach(function(item){
			if (!item.varType('object') || !isSet(item.receiver))
				throw new Error('Incorrect type of receiver object.');
			if (typeof item.receiver !== 'object')
				throw new Error('Receiver must be an object.');
			item.receiver[item.property ? item.property : prop] = core_obj[prop];
		});
	}
	var checkNewProp = function (prop,name) {
		if ( !prop.varType('object') || isUndef(prop.data) || isUndef(prop.id) )
			throw new Error('Incorrect type of property "'+name+'".');
	}
	var checkPropList = function (props) {
		if (!props.varType('object'))
			throw new Error('Incorrect type of list of properties.');
	}
	return {
		methods: {
			add: function(properties) {
				checkPropList(properties);
				var error_mess = [];
				iter_prop: for (var item in properties) {
					checkNewProp(properties[item],item);
					var states = initStates(this,item);
					for (var i = 0; i < states.length; i++)
						if (states[i].id === properties[item].id) {
							error_mess.push('Property "'+item+'" with id "'+properties[item]+'" is already exist in stack.');
							continue iter_prop;
						}
					states.push(properties[item]);
					callToReceivers(this,item);
				}
				if (error_mess.length)
					throw new Error(error_mess.join('\n'));
				return this;
			},
			set: function(properties) {
				checkPropList(properties);
				iter_prop: for (var item in properties) {
					checkNewProp(properties[item],item);
					var states = checkStates(this,item);
					for (var i = 0; i < states.length; i++)
						if (states[i].id === properties[item].id) {
							states[i].data = properties[item].data;
							callToReceivers(this,item);
							continue iter_prop;
						}
					throw new Error('Not exist property "'+item+'" with id "'+properties[item].id+'" in stack.');
				}
				return this;
			},
			use: function(properties) {
				if (properties.varType('string')) {
					iter_this_prop: for (var item in this) {
						try {
							var states = checkStates(this,item);
							for (var i = 0; i < states.length; i++)
								if (states[i].id === properties) {
									Array.prototype.push.apply(states,states.splice(i,1));
									callToReceivers(this,item);
									continue iter_this_prop;
								}
						}
						catch (e) {}
					}
					return this;
				}
				checkPropList(properties);
				iter_prop: for (var item in properties) {
					var states = checkStates(this,item);
					for (var i = 0; i < states.length; i++)
						if (states[i].id === properties[item]) {
							Array.prototype.push.apply(states,states.splice(i,1));
							callToReceivers(this,item);
							continue iter_prop;
						}
					throw new Error('Not exist property "'+item+'" with id "'+properties[item]+'" in stack.');
				}
				return this;
			},
			del: function(properties) {
				checkPropList(properties);
				iter_prop: for (var item in properties) {
					var states = checkStates(this,item);
					for (var i = 0; i < states.length; i++)
						if (states[i].id === properties[item]) {
							states.splice(i,1);
							if (properties[item] === '_default')
								states.unshift({id:'_default'});
							callToReceivers(this,item);
							continue iter_prop;
						}
					throw new Error('Not exist property "'+item+'" with id "'+properties[item]+'" in stack.');
				}
				return this;
			},
			cast: function(properties) {
				checkPropList(properties);
				iter_prop: for (var item in properties) {
					checkStates(this,item);
					switch (properties[item].varType()) {
						case 'array':
							Array.prototype.push.apply(initStateReceivers(this,item),properties[item]);
						break;
						case 'object':
							initStateReceivers(this,item).push(properties[item]);
						break;
						default:
							throw new Error('Incorrect type of receiver in property "'+item+'".');
					}
					callToReceivers(this,item);
				}
				return this;
			}
		}
	}
}());