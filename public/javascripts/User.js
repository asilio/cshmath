define(function(require){
	
	var Backbone=require('backbone');
	var Marionette=require('marionette');
	var Random=require('Random');
	var mathjs=require('mathjs');
	
	var Module={};
	Module.model={};
	Module.collections={};
	Module.views={};
	Module.model.User=Backbone.Model.extend({
		defaults:{
			email:'',
			type:'student',
		}
		
	});
	
	Module.collections.Users=Backbone.Collection.extend({
		model:Module.model.User,
		url:'/model/User',
	});
	
	return Module;
});