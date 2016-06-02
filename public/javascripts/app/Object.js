define("Object",function(require){
	var _=require("underscore");
	var extend=require("extend");
	var Events = require("Events");
	var module={};
	var obj=function(attrs, options){
		var attrs = attrs || {};
		options || (options = {});
		this.cid =_.uniqueId("o");
	};
	
	obj.extend = extend;
	_.extend(obj.prototype, Events);
	module.new = function(constructor, inherit){
		if(!constructor) return obj;
		constructor.extend = extend;
		_.extend(constructor.prototype, Events, inherit);
		return constructor;
	}
	
	module.extend=function(protoProps, staticProps){
		return obj.extend(protoProps, staticProps);	
	}
	
	var addMethod = function(length, method, attribute) {
		switch (length) {
			case 1: return function() {
				return _[method](this[attribute]);
				};
			case 2: return function(value) {
				return _[method](this[attribute], value);
				};
			case 3: return function(iteratee, context) {
				return _[method](this[attribute], cb(iteratee, this), context);
				};
			case 4: return function(iteratee, defaultVal, context) {
				return _[method](this[attribute], cb(iteratee, this), defaultVal, context);
				};
			default: return function() {
				var args = slice.call(arguments);
				args.unshift(this[attribute]);
				return _[method].apply(_, args);
				};
		}
	};

	var addUnderscoreMethods = function(Class, methods, attribute) {
		_.each(methods, function(length, method) {
		if (_[method]) Class.prototype[method] = addMethod(length, method, attribute);
		});
	};

	// Support `collection.sortBy('attr')` and `collection.findWhere({id: 1})`.
	var cb = function(iteratee, instance) {
		if (_.isFunction(iteratee)) return iteratee;
		if (_.isObject(iteratee) && !instance._isModel(iteratee)) return modelMatcher(iteratee);
		if (_.isString(iteratee)) return function(model) { return model.get(iteratee); };
		return iteratee;
	};

	var modelMatcher = function(attrs) {
		var matcher = _.matches(attrs);
		return function(model) {
		return matcher(model.attributes);
	};
	};

	module.addUnderscoreMethods = addUnderscoreMethods;	
	return module;
});