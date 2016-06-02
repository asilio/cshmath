requirejs.config({
	
	paths:{
		hbs:'./vendor/handlebars',
		randomjs:'./vendor/randomjs',
		app:'./app',
		backbone:'./vendor/backbone',
		lodash:'./vendor/lodash',
		underscore:'./vendor/underscore',
		mathjs:'./vendor/mathjs',
		jquery:'./vendor/jquery',
		localStorage:'./vendor/backbone-localstorage',
		marionette:'./vendor/marionette',
		MathJax:'http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS_HTML',
		JXG:'./vendor/jsxgraphsrc',
		JessieScript:'./vendor/JessieScript',
		jquery_ui:'./vendor/jquery-ui.min',
	},
	
	shim : {
		underscore : {
		  exports : '_'
		},
		backbone : {
		  exports : 'Backbone',
		  deps : ['jquery','underscore']
		},
		marionette : {
		  exports : 'Backbone.Marionette',
		  deps : ['backbone']
		}
	},
	
	deps: ['jquery','underscore'],
	 
	urlArgs:"bust="+(new Date()).getTime(),
	
});

define('main',function(require){
var Question=require('Question');
});