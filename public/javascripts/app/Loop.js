/*
Loop Copyright Christopher Person-Rennell 2015
All rights reserved

Executes functions in no particular order on a preset timer. 
Attempts to keep the loop on the timer, but will not restart until all functions have finished executing.
*/
define("Loop",function(require){
	var _ = require("underscore");
	
	var Loop = function(options){
		this.settings = _.extend({
			interval:3000,
			continuous:true,
			},options);
		this.funcs = {};
		this.interval = false;
		this._lock = false;
		this._start();
	};
	
	Loop.prototype.add = function(f,context,args){

		var key = _.uniqueId("Loop")
		var args = args || [];
		var context = context || {};
		if(!f) throw new Error("Must provide a function for the execution of the loop!");
		this.funcs[key] = [f,context,args];
		console.log(this.funcs)
		return key;
	};
	
	Loop.prototype.remove = function(key){
		delete this.funcs[key];
		return false;
	};
	
	Loop.prototype.stop = function(){
		clearInterval(this.interval);
		this.interval = false;
	};
	
	Loop.prototype.start = function(){
		if(this.interval == false) return;
		this._start();
		
	};
	
	Loop.prototype._execute = function(){
		if(this._lock == true || _.keys(this.funcs).length == 0) return; //Prevent the loop for re-executing the functions before the previous cycle has finished.
		this._lock = true;
			_.each(this.funcs,function(val,key,obj){
				val[0].apply(val[1],val[2]);
			});
		this._lock = false;
	};
	
	Loop.prototype._start = function(){
		this.interval = setInterval(this._execute.bind(this),this.settings.interval);
	};
	
	return Loop;
});