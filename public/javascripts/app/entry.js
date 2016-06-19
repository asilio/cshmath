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
		mathjax: "http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS_HTML&amp;delayStartupUntil=configured",
		mymath:"../math/mymath",
		util:"../math/util",
		rational:"../math/rational",
		polynomial:"../math/polynomial",
		random:"../math/random",
		radical:"../math/radical",
	},
	

	shim: {
	    mathjax: {
	      exports: "MathJax",
	      init: function () {
	        MathJax.Hub.Config({  });
	        MathJax.Hub.Startup.onload();
	        return MathJax;
	      }
	    }
	},

	urlArgs:"bust="+new Date().getTime(),

});
var app;

define('main',function(require){
	app = require("app");
	app.init();

	/**
	 * You first need to create a formatting function to pad numbers to two digits…
	 **/
	function twoDigits(d) {
	    if(0 <= d && d < 10) return "0" + d.toString();
	    if(-10 < d && d < 0) return "-0" + (-1*d).toString();
	    return d.toString();
	}

	/**
	 * …and then create the method to output the date string as desired.
	 * Some people hate using prototypes this way, but if you are going
	 * to apply this to more than one Date object, having it as a prototype
	 * makes sense.
	 **/
	Date.prototype.toMYSQLString = function() {
	    return this.getUTCFullYear() + "-" + twoDigits(1 + this.getUTCMonth()) + "-" + twoDigits(this.getUTCDate()) + " " + twoDigits(this.getUTCHours()) + ":" + twoDigits(this.getUTCMinutes()) + ":" + twoDigits(this.getUTCSeconds());
	};

	function open_action(e,stub)	{
	//	console.log(e.target.id)
	//	action(e.target.id);
		var id = e.target.id;
		if(stub) app.routes.navigate(stub+"/"+id,{trigger:true});
		else app.routes.navigate("",{trigger:true});
	}

	function add_class(id){
		var data ={
			method:"POST",
			url:"/rest/User.instructor.new/id/"+id,
			success:function(resp){
				console.log("Added New Class")
				console.log(resp);
				app.routes.navigate("",{trigger:true});
				app.workspace.top_view();
			},
			error:function(resp){
				$('#content').html(resp.responseText)
				console.log(resp);
			}

		};
		app.ajax(data);
		//app.routes.navigate(data.url)

	}

	function add_module(id){
		var options ={
			method:"POST",
			url:"/rest/Class.class_module.new/id/"+id,
			success:function(resp){
				console.log(resp);
				app.routes.navigate("Class/"+id,{trigger:true});
				app.workspace.module_view(id);
			},
			error:function(resp){
				$('#content').html(resp.responseText)
				console.log(resp);
			},
			data:{
				class:id,
				creator:app.session.user.get("id"),
			}

		};
		app.ajax(options);
	}

	function add_assignment(id){
		var options ={
			method:"POST",
			url:"/rest/Module.module_assignment.new/id/"+id,
			success:function(resp){
				console.log(resp);
				app.workspace.module_view(id);
				app.routes.navigate("Module/"+id,{trigger:true});
			},
			error:function(resp){
				$('#content').html(resp.responseText);
				console.log(resp);
			},

			complete:function(resp){
				console.log("COMPLETE : ",resp);
			},

			data:{
		//		module_id:id,
				start_date:new Date().toMYSQLString(),
				due: new Date(22000101111111).toMYSQLString(),
				created: new Date().toMYSQLString(),
				rank:"",
				grade_category:"",
				assignment_attempts_allowed:1,
				question_attempts_allowed: 1,
				number_of_questions: 1,
				repeat_questions: 1,
				module:id,
				type: "Homework",
				weight: "",
			}

		};
		app.ajax(options);
	}
	function add_question(id){
		var options ={
			method:"POST",
			url:"/rest/Assignment.question.new/id/"+id,
			success:function(resp){
				app.routes.navigate("Assignment/"+id,{trigger:true});
				app.workspace.assignment_view(id);
			},
			error:function(resp){
				$('#content').html(resp.responseText)
				console.log(resp);
			},
			data:{
				image_links:"",
				author:app.session.user.get("id"),
			}

		};
		app.ajax(options);
	}

	function button_event(e,action){
		action(e.target.id);
	}
	$('.__show__classes__').on("click",function(e){
		open_action(e,"")});
	$('.__show__modules__').on("click",function(e){open_action(e,"Class")});
	$('.__show__assignments__').on("click",function(e){open_action(e,"Module")});
	$('.__print__assignment__').on("click",function(e){open_action(e,"Print")});

	$('.__show__questions__').on("click",function(e){open_action(e,"Assignment")});

	$('.__add__classes__').on("click",function(e){button_event(e,add_class)});
	$('.__add__modules__').on("click",function(e){button_event(e,add_module)});
	$('.__add__assignments__').on("click",function(e){button_event(e,add_assignment)});
	$('.__add__questions__').on("click",function(e){button_event(e,add_question)});
	
	$('body').height(window.innerHeight-100);
	$('#main_menu').height(window.innerHeight-100);
	$('#container').height(window.innerHeight-80);
	$('#content').height(window.innerHeight-100);


	//Keep the user aware that using the back button will break this 
	//##Uncomment below for deployment
	//window.onbeforeunload = function() { return "You work will be lost."; };

});
requirejs(['main']);	