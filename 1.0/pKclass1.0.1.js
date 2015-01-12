"use strict";
if (!window.popKorn || !popKorn.isPopKornCoreObject || !popKorn.include_more || !popKorn.add_module)
	throw new Error('popKorn core object is not correct.');
popKorn.include_more([{name:'plain',ver:1}]);
/* дописать использование Element.classList если он поддерживается браузером */

popKorn.add_module('Class',function() {
	function isClassNameCorrect(name) {
		if (!isSet(name) || !name.varType('string')) return false;
		if ((new RegExp('[^\\w-]', 'i')).test(name)) return false;
		if (!(new RegExp('[\\w]', 'i')).test(name))	return false;
		var regexp = new RegExp('[0-9]', 'i');
		if (regexp.test(name[0])) return false;
		for (var i = 0; '-' === name[i]; ++i)
			if(regexp.test(name[i+1]))
				return false;
		return true;
	}
	function patchNode(elem) {
		if (isSet(elem.classNamesList)) return;
		var inputNames = convertInputToArray(elem.className);
		elem.classNamesList = [];
		for (var i = 0; i < inputNames.length; i++)
			elem.classNamesList.push(inputNames[i]);
	}
	function refreshClassName(elem) {
		elem.className = elem.classNamesList.join(' ');
	}
	function numOfClass(elem,val) {
		for (var i = 0; i < elem.classNamesList.length; i++)
			if (elem.classNamesList[i] === val)
				return i;
	}
	function convertInputToArray(input) {
		var result = [];
		if (!isSet(input)) return result;
		if (input.varType('array')) {
			for (var i = 0; i < input.length; i++)
				result = result.concat(convertInputToArray(input[i]));
		}
		else if (input.varType('string') && input !== '') {
			var inputList = input.replace(/ {1,}/g,' ').split(' ');
			for (var i = 0; i < inputList.length; i++)
				if ( isClassNameCorrect(inputList[i]) )
					result.push(inputList[i]);
		}
		return result;
	}
	return {
		methods: {
			patch: {
				method: function() {
					patchNode(this);
					refreshClassName(this);
					return this;
				}
			},
			is: {
				method: function(val) {
					patchNode(this);
					refreshClassName(this);
					val = convertInputToArray(val);
					if (val.length === 0)
						return (this.classNamesList.length === 0);
					for (var i = 0; i < val.length; i++)
						if (isUndef(numOfClass(this,val[i])))
							return false;
					return true;
				}
			},
			replace: {
				method: function(val) {
					patchNode(this);
					val = convertInputToArray(val);
					this.classNamesList = [];
					for (var i = 0; i < val.length; i++)
						if (isClassNameCorrect(val[i]))
							this.classNamesList.push(val[i]);
					refreshClassName(this);
					return this;
				}
			},
			add: {
				method: function(val) {
					patchNode(this);
					val = convertInputToArray(val);
					if (val.length === 0)
						return this;
					for (var i = 0; i < val.length; i++)
						if ( isUndef( numOfClass(this,val[i]) ) )
							this.classNamesList.push(val[i]);
					refreshClassName(this);
					return this;
				}
			},
			del: {
				method: function(val) {
					patchNode(this);
					val = convertInputToArray(val);
					if (val.length === 0)
						return this;
					for (var i = 0; i < val.length; i++) {
						var num = numOfClass(this,val[i]);
						if (isUndef(num)) continue;
						this.classNamesList.splice(num,1);
					}
					refreshClassName(this);
					return this;
				}
			}
		}
	}
}());