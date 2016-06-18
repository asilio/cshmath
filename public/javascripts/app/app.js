define("app",function(require){

	var app = {};
	var math=mathjs=app.math=app.mathjs=require("mathjs");
	var Backbone = require("Backbone");
	var Models = app.Models = require("Models");
	var Views  = app.Views  = require("Views");
	var Object = require("Object");
	var sync = require("sync");
	var ajax = app.ajax = sync.ajax;
	var $ = require("jquery");
	var _ = require("lodash");
	var mathjax = require('mathjax');
	var math = require('mymath');
	var handlebars =app.handlebars=require('hbs');
	var models ={};
	
	var Model = app.Model = Backbone.Model;
	var Collection = app.Collection = Backbone.Collection;
	var View = app.View = Backbone.View;
	var Router = app.Router = Backbone.Router;

	var mediator = new(new Object.extend({}));

	var ft = function(model_name,other_name, alias){
		this.url="/rest/"+model_name+"."+alias+".";
	};
	
	ft.prototype.all=function(id,callback){
		var url = this.url+"all/"
		return ajax({
			data:{id:id},
			url:url,
			success:callback,
			error:callback
		});
	};
	
	ft.prototype.new=function(id,data,callback){
		var options = {};
		options.url = this.url+"new/";
		options.data={id:id};
		options.data.keys=_.keys(data);
		options.data.values=_.values(data);
		options.success=callback;
		options.error=callback;
		return ajax(options);
	};
	
	_.each(Models,function(model){
		models[model.name]=_.extend(_.clone(model),{view_extensions:Views[model.name]});
		if(model.mtm){
			var keys = _.keys(model.mtm);
			var values = _.values(model.mtm);
			for(var i = 0; i<keys.length; i++){
				models[model.name][keys[i]]=new ft(model.name,values[i],keys[i]);
				models[values[i]] = models[values[i]] || {};
				models[values[i]][keys[i]]=new ft(values[i],model.name,keys[i]);
				
			}
		}
		models[model.name].defaults = models[model.name].defaults || {};
		//models[model.name].defaults.url="/rest/"+model.name;
		models.view_extensions = Views[model.name];
		models[model.name].mediator = mediator;
		//Testing
		/*_.each(model.columns,function(col,key){
			console.log(key+"\t: "+col.type);
		});
		*/
		models[model.name].initialize = function(){
			this.structure = model.columns;
			this.name = model.name;
			this.mediator = mediator;	
		}


	});
	
	_.each(models,function(m){
		app[m.name] = Model.extend(m);
		app[m.name].prototype.type = function(){return m.name;};
		app[m.name].prototype.url = function(){return "/rest/"+m.name;};
	})


	app.session = {};
/****Customizing application to specifics of my needs
overwrite the init function and any of the helper functions below to 
customize for other sites****/

	app.init = function(options){
		/*******Handlebars Configuration******/
		app.handlebars.registerHelper("direction",function(d,obj){
			if(obj.__last__)
				if(obj.__last__.toString)
					obj.__last__=obj.__last__.replace(/\s/g,"").toLowerCase();
			if(obj.__last__ === d.replace(/\s/g,"").toLowerCase())
				return "";
			obj.__last__ = d;
			return new app.handlebars.SafeString(obj.__last__);
		});
		app.handlebars.registerHelper("inc", function (i) { return parseInt(i)+1; });

		app.session.source = $('#template_for_Print').html();
		app.session.print_template = handlebars.compile(app.session.source)
		/*******End Handlebars Configuration******/

		var user_id = $("#__user__").attr("y");
		var user_name = $('#__user__').attr("x");
		app.session.user = new app.User({id:user_id});
		app.session.user.set("id",user_id);
		//console.log(app)
		app.session.user.fetch();

		var Teaching= app.Collection.extend({
			model:app.Class,});

		var Assignments = app.Collection.extend({
			model:app.Assignment
		});
		
		var Modules = app.Collection.extend({
			model:app.Module
		});
		
		var Questions = app.Collection.extend({
			model:app.Question,
		});
		
		app.session.teaching = new Teaching();
		app.session.modules = new Modules();
		
		app.session.assignments = new Assignments();
		
		app.session.questions = new Questions();
		app.routes = new app.Workspace();
		Backbone.history.start();


		$('#search').on("click",function(e){
			var url = $("#query").attr("target");
			var query = $('#query').val();
			search(query,url)
		});

		$('#query').keypress(function(e){
			if(e.which == 13){
				var url = $("#query").attr("target");
				var query = $('#query').val();
				search(query,url)
			}

		});

		function search(query,url){
			var options ={
				url:url,
				method:"POST",
				data:{
					query:query,
				}
			}
			app.ajax(options);
		}

		mediator.on("view:class view:module view:assignment view:question view:top",function(e){
			console.log(e);
			$("#query").attr("target","/rest/search/"+e.search);
		});

		mediator.on("select:Class",function(context){
			$(".view").removeClass("focus");
			context.el.addClass("focus");
			$('#content').html(app.session.teaching.get(context.id).attributes['description']);
			$('#content').append("<br><br><a href='#Class/"+context.id+"'>Open</a>")
			$('#__header__').html(app.session.teaching.get(context.id).attributes['title']);
		});
		mediator.on("select:Module",function(context){
			$(".view").removeClass("focus");
			context.el.addClass("focus");
			$('#content').html(app.session.modules.get(context.id).attributes['description']);
			$('#content').append("<br><br><a href='#Module/"+context.id+"'>Open</a>")
			$('#__header__').html(app.session.modules.get(context.id).attributes['title']);
		});
		mediator.on("select:Assignment",function(context){
			$(".view").removeClass("focus");
			context.el.addClass("focus");
			$('#content').html(app.session.assignments.get(context.id).attributes['description']);
			$('#content').append("<br><br><a href='#Assignment/"+context.id+"'>Open</a>")
			$('#__header__').html(app.session.assignments.get(context.id).attributes['title']);
		});

		mediator.on("select:Question",function(context){
			$('#content').html('');
			$('#__header__').html('');
			$(".view").removeClass("focus");

			context.el.addClass("focus");
			//$('li#'+context.id).addClass("focus");
			var q = app.session.questions.get(context.id).attributes;
			var content = math.render_question(q);
			//console.log(content)
			$('#content').html(content.question);
			$('#__header__').html(content.title);
			mathjax.Hub.Queue(['Typeset',mathjax.Hub, 'content']);
			mathjax.Hub.Queue(['Typeset',mathjax.Hub, '__header__']);
		});
			

/****Insertion Logic*****/
		mediator.on("insert_after:Class",function(context){
			console.log("insert_after:Class",context);
			var options = {
				data:context,
				url:"/rest/User.instructor.insert_after/id/"+app.session.user.get("id"),
				success:function(resp){
					console.log("SUCCESS:",resp)
					app.workspace.top_view();
				}
			}
			app.ajax(options);
		});

		mediator.on("insert_after:Module",function(context){
			console.log("insert_after:Module",context);
			var options = {
				data:context,
				url:"/rest/Class.class_module.insert_after/id/"+app.session.class.get("id"),
				success:function(resp){
					console.log("SUCCESS:",resp)
					app.workspace.class_view(app.session.class.get("id"));
				}
			}
			app.ajax(options);
		});

		mediator.on("insert_after:Assignment",function(context){
			console.log("insert_after:Assignment",context);
			var options = {
				data:context,
				url:"/rest/Module.module_assignment.insert_after/id/"+app.session.module.get("id"),
				success:function(resp){
					console.log("SUCCESS:",resp)
					app.workspace.module_view(app.session.module.get("id"));
				}
			}
			app.ajax(options);
		});

		mediator.on("insert_after:Question",function(context){
			console.log("insert_after:Question",context);
			var options = {
				data:context,
				url:"/rest/Assignment.question.insert_after/id/"+app.session.assignment.get("id"),
				success:function(resp){
					console.log("SUCCESS:",resp)
					app.workspace.assignment_view(app.session.assignment.get("id"));
				}
			}
			app.ajax(options);
		});
/*****Deletion logic*****/
		mediator.on("delete:Class",function(context){
			console.log("delete:Class",context);
			var options = {
				url: "/rest/User.instructor.delete/id/"+app.session.user.get("id"),
				data:context,
				success:function(resp){
					console.log(resp);
					app.workspace.top_view();
				},
				error:function(resp){
					console.log(resp);
				},
				complete:function(resp){
					console.log(resp);
				}
			}
			app.ajax(options);
		});

		mediator.on("delete:Module",function(context){
			console.log("delete:Module",context);
			var options = {
				url: "/rest/Class.class_module.delete/id/"+app.session.class.get("id"),
				data:context,
				success:function(resp){
					console.log(resp);
					app.workspace.module_view(app.session.class.get("id"));
				},
				error:function(resp){
					console.log(resp);
				},
				complete:function(resp){
					console.log(resp);
				}
			}
			app.ajax(options);
		});

		mediator.on("delete:Assignment",function(context){
			console.log("delete:Assignment",context);
			var options = {
				url: "/rest/Module.module_assignment.delete/id/"+app.session.module.get("id"),
				data:context,
				success:function(resp){
					console.log(resp);
					app.workspace.assignment_view(app.session.module.get("id"));
				},
				error:function(resp){
					console.log(resp);
				},
				complete:function(resp){
					console.log(resp);
				}
			}
			app.ajax(options);
		});

		mediator.on("delete:Question",function(context){
			console.log("delete:Question",context);
			var options = {
				url: "/rest/Assignment.question.delete/id/"+app.session.assignment.get("id"),
				data:context,
				success:function(resp){
					console.log(resp);
					app.workspace.assignment_view(app.session.assignment.get("id"));
				},
				error:function(resp){
					console.log(resp);
				},
				complete:function(resp){
					console.log(resp);
				}
			}
			app.ajax(options);
		});
	}

	function open_action(e,stub)	{
	//	console.log(e.target.id)
	//	action(e.target.id);
		var id = e.target.id;
		if(stub) app.routes.navigate(stub+"/"+id,{trigger:true});
		else app.routes.navigate("",{trigger:true});
	}

	function show(l){
		_.each(l,function(el){
			$(el).css('display','');
		});
	}
	function hide(l){
		_.each(l,function(el){
			$(el).css('display','none');
		})
	}

	function errorWrapper(fun){
		try{
			fun();
		}catch(Error){
			console.log(Error);
			app.routes.navigate("",{trigger:true});
		}
	}

	var separator = '<p style="background:black;foreground:black;width=100%;overflow:hidden;display:block;float:left;height:1px;cursor:default">safdasdfasfdasfasdfasdfasdfas</p>';
	var Workspace = app.Router.extend({
		routes:{
			"":"top_view",
			"Class/:id":"class_view",
			"Module/:id":"module_view",
			"Assignment/:id":"assignment_view",
			"Print/:id":"print_view",
			"Question/:id":"question_view"
		},

		top_view : function(){
			mediator.trigger("view:top",{id:null, search:"Class"});

			errorWrapper(function(){
				$('#content').html('');
				$('#__header__').html('Select a Class on the left to view the modules!');

				var user_id = app.session.user.get("id");
				app.session.teaching.fetch({url:"/rest/User.instructor.all/id/"+user_id,success:function(model, resp,options){
					$('#main_menu').html('');
					//The class view is the main opening view of the site. Disable the buttons for navigating to 
					//The modules or assignments (or returning to this state via classes) or lectures, etc.
					var h = ['.__show__modules__', '.__show__classes__', '.__show__assignments__', '.__print__assignment__',
							'.__show__questions__','.__add__modules__','.__add__assignments__','.__add__questions__'];

					var s = ['.__add__classes__'];
					
					hide(h);
					show(s);
					
					$('.__add__classes__').attr('id',user_id);

					app.session.teaching.each(function(m){
						m.view.render();
						$('#main_menu').append(m.view.el);
						$('#main_menu').append($(separator));

					});

					$('.__open_class__').on("click",function(e){
						open_action(e,"Class")
					});
				}});
			})
		},

		class_view : function(id){
			mediator.trigger("view:class",{id:id,search:"Module"});
			errorWrapper(function(){
				$('#content').html('');
				$('#__header__').html('');
				app.session.class = app.session.teaching.get(id);
				app.session.modules.fetch({url:"/rest/Class.class_module.all/id/"+id,success:function(model, resp,options){
					$('#main_menu').html('');
					
					var h = ['.__show__modules__', '.__show__assignments__', '.__show__questions__',
							 '.__add__classes__','.__add__assignments__','.__add__questions__',
							 '.__print__assignment__'];

					var s = ['.__show__classes__','.__add__modules__'];
					
					hide(h);
					show(s);
			
					$('.__show__modules__').attr('id',id)//Set the id of the show modules button to the current class.
					$('.__add__modules__').attr('id',id)
					app.session.modules.each(function(mm){
						mm.view.render();
						$('#main_menu').append(mm.view.el);
						$('#main_menu').append($(separator));
					});

					$('.__open_module__').on("click",function(e){
			//			console.log("CLICK")
						open_action(e,"Module");
					});

				}});
			});
		},

		module_view : function(id){
			mediator.trigger("view:module",{id:id,search:"Assignment"});
			errorWrapper(function(){
				$('#content').html('');
				$('#__header__').html('');
				console.log("Module View")
				//$('.no_print').show();
				//$('#print_container').hide();
				//console.log("Switch to Module View")
				app.session.module = app.session.modules.get(id);
				app.session.assignments.fetch({url:"/rest/Module.module_assignment.all/id/"+id,
					success:function(model, resp,options){
				//	console.log("UMMM>>>")
					$('#main_menu').html('');
					//console.log("Jquery just deleted main menu items.")
					//Assignment view is two steps deep into the site, show the classes and modules buttons
					var h = [ '.__show__assignments__', '.__show__questions__',
							 '.__add__classes__','.__add__modules__','.__add__questions__',
							 '.__print__assignment__'];

					var s = ['.__show__classes__','.__show__modules__','.__add__assignments__'];
					
					hide(h);
					show(s);

					$('.__show__assignments__').attr('id',id);
					$('.__add__assignments__').attr('id',id);

					app.session.assignments.each(function(mm){
						mm.view.render();
						$('#main_menu').append(mm.view.el);
						//Line Separator for each menu item
						$('#main_menu').append($(separator));
					});

					$('.__open_assignment__').on("click",function(e){
						open_action(e,"Assignment");
					});			
				}});
			});
		},

		assignment_view : function(id){	
			mediator.trigger("view:assignment",{id:id,search:"Question"});
			errorWrapper(function(){
				$('#content').html('');
				$('#__header__').html('');
				console.log("Assignment View")
				$('#print_container').hide();
				app.session.assignment=app.session.assignments.get(id);
				app.session.questions.fetch({url:"/rest/Assignment.question.all/id/"+id,success:function(model, resp,options){
					$('#main_menu').html('');
					//Assignment view is two steps deep into the site, show the classes and modules buttons
					$('.no_print').css('display','');
					var h = ['.__show__questions__',
							 '.__add__classes__','.__add__assignments__','.__add__modules__'];

					var s = [ '.__show__assignments__', '.__show__classes__','.__show__modules__','.__add__questions__',
							 '.__print__assignment__'];
					
					hide(h);
					show(s);


					$('.__print__assignment__').attr("id",id);
					$('.__show__questions__').attr("id",id);
					$('.__add__questions__').attr("id",id);


					$('#main_menu').append($('<ol id="qlist"></ol>'));


					app.session.questions.each(function(mm){
						mm.view.render();

						$('#qlist').append($('<li id="q'+mm.get('id')+'" style="float:left;width:100%"></li>').append(mm.view.el));
						//Line Separator for each menu item
						$('#qlist').append($(separator));
						mathjax.Hub.Queue(['Typeset',mathjax.Hub, 'q'+mm.get('id')]);
					});

					$('.__open_question__').on("click",function(e){
						open_action(e,"Question");
					});			
				}});
			});
		},

		print_view : function(id){
			mediator.trigger("view:print",{id:id});
			errorWrapper(function(){
				var qs = [];
				app.session.questions.each(function(m){
					qs.push(_.clone(m.attributes));
				});
				qs = math.render_questions(qs);
				var context = {};
				context.assignment = _.clone(app.session.assignments.get(id).attributes);
				context.questions = qs;
				context.instructor = true;
				var html = app.session.print_template(context);
				$('#print_container').html(html).show();
				$('.no_print').hide();
				//$('.__show__questions__').show();
				$('.__show__questions__').css("display","");
				mathjax.Hub.Queue(['Typeset',mathjax.Hub, 'print_container']);
			});
		},

		question_view : function(id){
			mediator.trigger("view:question",{id:id});
			errorWrapper(function(){
				$('#content').html('');
				$('#__header__').html('');
				app.session.question = app.session.questions.get(id);
				var q = app.session.questions.get(id).attributes;
				var content = math.render_question(q);
				//console.log(content)
				$('#content').html(content.question);
				$('#__header__').html(content.title);
				mathjax.Hub.Queue(['Typeset',mathjax.Hub, 'content']);
			});
		}

	})

	app.Workspace = Workspace;
	app.workspace = new app.Workspace();
	return app;
	
});
