requirejs.config({
	
	baseUrl:"./javascripts/app",
	
	paths:{
		hbs:'../vendor/handlebars',
		randomjs:'../vendor/randomjs',
		lodash:'../vendor/lodash',
		underscore:'../vendor/underscore',
		mathjs:'../vendor/mathjs',
		jquery:'../vendor/jquery',
		jquery_ui:'../vendor/jquery-ui.min',
	},
	
	urlArgs:"bust="+new Date().getTime(),

});
var app;
define('main',function(require){
	app = require("app");
	var $ = require("jquery");
	

	//-------TESTS--------------//
	/*var q = new app.Class();	
	q.once("sync",function(){
		console.log(q)
		q.view.render();
		$('.container').html(q.view.el);
	});
	q.save(null,{
		success:function(res){
			console.log(res)},
		error:function(res){console.log(res)}
		});

	var c = new app.Question({id:6});
	c.once("sync",function(){
		c.view.render();
		c.view.set_display('print');
		$('.container').append(c.view.el);
	});
	c.fetch();

		*/
		
	//console.log(app.Models);
	//Load the logged in user--Skip login for offline development


//This will likely become a separate file, but working here for right now during development phase.
	var user_id = $("#__user__").attr("y");
	var user_name = $('#__user__').attr("x");
	var u = new app.User({id:user_id});
	u.once("sync",function(){
		//u.view.render();
		//$('.container').html(u.view.el);
	});
	//Launch the app by fetching the user.

	u.fetch();

	var Teaching= app.Collection.extend({
		model:app.Class,});
	var teaching = new Teaching();

	var Assignments = app.Collection.extend({
		model:app.Assignment
	});
	
	var Modules = app.Collection.extend({
		model:app.Module
	});
	
	var modules = new Modules();
	
	var assignments = new Assignments();

	var Questions = app.Collection.extend({
		model:app.Question,
	});
	
	var questions = new Questions();
	teaching.fetch({url:"/rest/User.instructor.all/id/"+user_id,success:function(model, resp,options){
		teaching.each(function(m){
			m.view.render();
			$('.container').append(m.view.el);
			modules.fetch({url:"/rest/Class.class_module.all/id/"+m.get("id"),success:function(model, resp,options){
				modules.each(function(mm){
					mm.view.render();
					$('.container').append(mm.view.el);
					});
				}});
		});
	}});
	

});
requirejs(['main']);	