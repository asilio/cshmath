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
		*/

});
requirejs(['main']);	