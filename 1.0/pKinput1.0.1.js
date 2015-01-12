"use strict";
if (!window.popKorn || !popKorn.isPopKornCoreObject || !popKorn.include_more || !popKorn.add_module)
	throw new Error('popKorn core object is not correct.');
popKorn.include_more([{name:'plain',ver:1},{name:'crypt',ver:1}]);

popKorn.add_module('input', function(){
	var forms_list = {};
	var initAutopushableArray = function (in_object,as_method){
		var array = [];
		Object.defineProperty(in_object, as_method, {
			get: function() {
				if (array.length === 1)
					return array[0];
				return array;
			},
			set: function(value) {
				array.push(value);
			},
			enumerable: true
		});
	}
	var initFormsList = function(doc){
		for (var i = 0; i < doc.forms.length; i++) {
			(function(form){
				var name = form.name || '_noname';
				var tmp_f = {};
				Object.defineProperty(tmp_f, '_url', {
					get: function() {
						return form.action;
					},
					set: function(value) {
						form.action = value;
					},
					enumerable: true
				});
				Object.defineProperty(tmp_f, '_method', {
					get: function() {
						return form.method;
					},
					set: function(value) {
						form.method = value;
					},
					enumerable: true
				});
				for (var j = 0; j < form.elements.length; j++) {
					(function(input){
						var i_name = input.name || '_noname';
						if (i_name === '_url' || i_name === '_method' || i_name === 'value')
							throw new Error('Illegal name of input field.');
						var tmp_i = {};
						Object.defineProperty(tmp_i, 'value', {
							get: function() {
								switch(input.type) {
									case undefined:
									case 'text':
									case 'search':
									case 'email':
									case 'url':
									case 'textarea':
									case 'number':
									case 'tel':
									case 'range':
									case 'date':
									case 'datetime':
									case 'datetime-local':
									case 'time':
									case 'month':
									case 'week':
									case 'color':
									case 'hidden':
										return input.value;
									break;
									case 'password':
										return input.value.md5();
									break;
									case 'radio':
										if (input.checked)
											return input.value||'';
										return null;
									break;
									case 'checkbox':
										return input.checked;
									break;
									case 'select-multiple':
										if (input.selectedIndex === -1) return null;
										var res = [];
										for (var i = 0; i < input.options.length; i++)
											if (input.options[i].selected)
												res.push(input.options[i].value);
										return res;
									break;
									case 'select-one':
										if (input.selectedIndex === -1) return null;
										return input.options[input.selectedIndex].value;
									break;
									case 'button':
									case 'submit':
									case 'reset':
										return;
									break;
									default:
										throw new Error('This type of input tag is not allowed.');
								};
							},
							set: function(value) {
								switch(input.type) {
									case undefined:
									case 'text':
									case 'search':
									case 'email':
									case 'url':
									case 'textarea':
									case 'number':
									case 'tel':
									case 'range':
									case 'date':
									case 'datetime':
									case 'datetime-local':
									case 'time':
									case 'month':
									case 'week':
									case 'color':
									case 'hidden':
										input.value = value;
									break;
									case 'password':
										throw new Error('To set value of password is forbidden.');
									break;
									case 'radio':
										if(input.value == value)
											return (input.checked = true);
										return (input.checked = false);
									break;
									case 'checkbox':
										input.checked = value;
									break;
									case 'select-multiple':
										for (var i = 0; i < input.options.length; i++){
											input.options[i].selected = false;
											for (var j = 0; j < value.length; j++) {
												if (input.options[i].value == value[j])
													input.options[i].selected = true;
											}
										}
									break;
									case 'select-one':
										for (var i = 0; i < input.options.length; i++){
											if (input.options[i].value == value)
												input.options[i].selected = true;
											else
												input.options[i].selected = false;
										}
									break;
									case 'button':
									case 'submit':
									case 'reset':
									break;
									default:
										throw new Error('This type of input tag is not allowed.');
								};
							},
							enumerable: true
						});
						if (!isSet(tmp_f[i_name])) {
							if (input.type === 'radio'){
								initAutopushableArray(tmp_f,i_name);
								Object.defineProperty(tmp_f[i_name], 'value', {
									get: function() {
										if (!tmp_f[i_name].length && tmp_f[i_name].checked)
											return tmp_f[i_name].value;
										if (!tmp_f[i_name].length)
											return null;
										for(var i = 0; i < tmp_f[i_name].length; i++)
											if (tmp_f[i_name][i].value)
												return tmp_f[i_name][i].value;
										return null;
									},
									set: function(value) {
										if (!tmp_f[i_name].length && tmp_f[i_name].value == value)
											tmp_f[i_name].checked = true;
										else if (!tmp_f[i_name].length)
											tmp_f[i_name].checked = false;
										else for(var i = 0; i < tmp_f[i_name].length; i++)
											tmp_f[i_name][i].value = value;
									},
									enumerable: true
								});
							}
						} else if (input.type !== 'radio')
							throw new Error('Every input (except for radio type) must have unique names.');
						tmp_f[i_name] = tmp_i;
					})(form.elements[j]);
				}
				if (isSet(forms_list[name]))
					throw new Error('Every form must have unique names.');
				forms_list[name] = tmp_f;
				Object.defineProperty(forms_list[name], 'value', {
					get: function() {
						var obj = {};
						for (var key in forms_list[name]) {
							if (key === '_url' || key === '_method' || key === 'value')
								continue;
							if (isDef(forms_list[name][key].value))
								obj[key] = forms_list[name][key].value;
						}
						return obj;
					},
					set: function(value) {
						for (var key in value) {
							if (key === '_url' || key === '_method' || key === 'value')
								throw new Error('Illegal name of input field.');
							if (!isSet(forms_list[name][key]))
								throw new Error('Input field with name '+key+' is not found.');
							forms_list[name][key].value = value[key];
						}
					},
					enumerable: true
				});
			})(doc.forms[i]);
		}
		initFormsList = function(){};
	}
	return {
		methods: {
			get: {
				self: document,
				method: function(form_name,input_name) {
					if (this.varType() !== 'htmldocument')
						throw new Error('Incorrect type of context. It must be HTML Document.');
					initFormsList(this);
					if (!isSet(form_name) || !form_name.varType('string'))
						return forms_list;
					if (!isSet(forms_list[form_name]))
						throw new Error('Incorrect name of form.');
					if (!isSet(input_name) || !input_name.varType('string'))
						return forms_list[form_name];
					if (!isSet(forms_list[form_name][input_name]))
						throw new Error('Incorrect name of input.');
					return forms_list[form_name][input_name];
				}
			}
		}
	}
}());