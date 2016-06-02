define("Events",function(require){
	var module={};
	var _=require("underscore");
	
	var eventSplitter = /\s+/;
	
	var eventsApi = function(iteratee, memo, name, callback, opts){
		var i = 0, names;
		if(name && typeof name==='object'){
			if(callback !==void 0 && 'context' in opts && opts.context === void 0) opts.context = callback;
			for(names =_.keys(name); i < names.length ; i++)
			{
				memo=iteratee(memo, names[i], name[names[i]], opts);
			}
		}else if(name && eventSplitter.test(name)){
			for(names = name.split(eventSplitter); i <names.length; i++)
			{
				memo = iteratee(memo, names[i], callback, opts);
			}
		}else{
			memo = iteratee(memo, name, callback, opts);
		}
		
		return memo;
		
	}
	
	module.on = function(name, callback, context){
		return internalOn(this, name, callback, context);
	};
	
	var internalOn = function(obj, name, callback, context, listening){
		obj._events = eventsApi(onApi, obj._events || {}, name, callback, {
			context: context,
			ctx: obj,
			listening: listening});
		
		if(listening){
			var listeners = obj._listeners || (obj._listeners = {});
			listeners[listening.id] = listening;
		}
		
		return obj;
	}
	
	 module.listenTo = function(obj, name, callback){
	 	if(!obj) return this;
	 	var id = obj._listenId || (obj._listenId = _.uniqueId('l'));
	 	var listeningTo = this._listeningTo || (this._listeningTo = {});
	 	var listening = listeningTo[id];
	 	
	 	if(!listening){
	 		var thisId = this._listenId || (this._listenId = _.uniqueId('l'));
	 		listening = listeningTo[id] ={obj:obj, id:thisId, listeningTo:listeningTo, count:0};
	 	}
	 	
	 	internalOn(obj, name, callback, this, listening);
	 	return this;
	 };
	 
	 var onApi = function(events, name, callback, options){
	 	if(callback){
	 		var handlers = events[name] || (events[name] = []);
	 		var context = options.context, ctx = options.ctx, listening = options.listening;
	 		if(listening) listening.count++;
	 		
	 		handlers.push({callback: callback, context:context, ctx:context || ctx, listening:listening});
	 	}
	 	return events;
	 };
	 
	 module.off = function(name, callback, context){
	 	if(!this._events) return this;
	 	this._events = eventsApi(offApi, this._events, name, callback, {
	 		context: context,
	 		listeners: this._listeners,
	 		});
	 	return this;
	 };
	 
	 module.stopListening = function(obj, name, callback){
	 	var listeningTo = this._listeningTo;
	 	if(!listeningTo) return this;
	 	
	 	var ids = obj ? [obj._listenId] : _.keys(listeningTo);
	 	
	 	for(var i = 0; i < ids.length; i++){
	 		var listening = listeningTo[ids[i]];
	 		
	 		if(!listening) break;
	 		
	 		listening.obj.off(name, callback, this);
	 	}
	 	
	 	if(_.isEmpty(listeningTo)) this._listeningTo = void 0;
	 	
	 	return this;
	 };
	 
	 var offApi = function(events, name, callback, options){
	 	if(!events) return;
	 	var i = 0, listening;
	 	var context = options.context, listeners  = options.listeners;
	 	
	 	if(!name && !callback && !context){
	 		var ids=_.keys(listeners);
	 		for(;i<ids.length;i++)
	 		{
	 			listening = listeners[ids[i]];
	 			delete listeners[listening.id];
	 			delete listening.listeningTo[listening.objId];
	 			
	 		}
	 		return;
	 	}
	 	
	 	var names = name ? [name] : _.keys(events);
	 	for(; i < names.length; i++){
	 		name = names[i];
	 		var handlers = events[name];
	 		if(!handlers) break;
	 		var remaining = [];
	 		for(var j = 0; j<handlers.length; j++)
	 		{
	 			var handler = handlers[j];
	 			if(
	 				callback && callback !== handler.callback &&
	 				callback !== handler.callback._callback ||
	 				context && context !==handler.context
	 			){
	 				remaining.push(handler)
	 			} else {
	 				listening = handler.listening;
	 				if(listening && --listening.count === 0)
	 				{
	 					delete listeners[listening.id];
	 					delete listening.listeningTo[listening.objId]
	 				}
	 			}
	 		}
	 		
	 		if(remaining.length) {
	 			events[name] = remaining;
	 		}else{
	 			delete events[name];
	 		}
	 		
	 	}
	 	
	 	if(_.size(events)) return events;
	 };
	 
	 module.once = function(name, callback, context){
	 	var events = eventsApi(module.onceMap, {}, name, callback, _.bind(this.off,this));
	 	return this.on(events, void 0, context);
	 };
	 
	 module.listenToOnce=function(map, name, callback, offer){
	 	if(callback){
	 		var once = map[name] = _.once(function(){
	 			offer(name, once);
	 			callback.apply(this,arguments);
	 		});
	 		once._callback=callback;
	 	}
	 	return map;
	 };
	 
	// Reduces the event callbacks into a map of `{event: onceWrapper}`.
	// `offer` unbinds the `onceWrapper` after it has been called.
	module.onceMap = function(map, name, callback, offer) {
	if (callback) {
		var once = map[name] = _.once(function() {
			offer(name, once);
			callback.apply(this, arguments);
		});
		once._callback = callback;
	}
	return map;
	};
	 
	 module.trigger = function(name){
	 	if(!this._events) return this;
	 	
	 	var length = Math.max(0,arguments.length - 1);
	 	var args = Array(length);
	 	for(var i = 0; i <length; i++) args[i] = arguments[i+1];
	 	
	 	eventsApi(triggerApi,this._events,name, void 0, args);
	 	return this;
	 };
	 
	 var triggerApi = function(objEvents, name, cb, args){
	 	if(objEvents){
	 		var events = objEvents[name];
	 		var allEvents = objEvents.all;
	 		if(events && allEvents) allEvents = allEvents.slice();
	 		if(events) triggerEvents(events,args);
	 		if(allEvents) triggerEvents(allEvents, [name].concat(args));
	 	}
	 	return objEvents
	 };
	 
	 var triggerEvents=function(events, args){
		var ev, i = -1, l = events.length, a1 = args[0], a2 = args[1], a3 = args[2];
		switch (args.length) {
		  case 0: while (++i < l) (ev = events[i]).callback.call(ev.ctx); return;
		  case 1: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1); return;
		  case 2: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2); return;
		  case 3: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2, a3); return;
		  default: while (++i < l) (ev = events[i]).callback.apply(ev.ctx, args); return;
		}
	 };
	 
	 module.bind= module.on;
	 module.unbind = module.off;
	 
	 return module;
});