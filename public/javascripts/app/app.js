define("app",function(require){

	var app = {};
	var math=mathjs=app.math=app.mathjs=require("mathjs");
	var Backbone = require("Backbone");
	var Models = app.Models = require("Models");
	var Views  = app.Views  = require("Views");
	var sync = require("sync");
	var ajax = app.ajax = sync.ajax;
	var $ = require("jquery");
	
	var models ={};
	
	var Model = app.Model = Backbone.Model;
	var Collection = app.Collection = Backbone.Collection;
	var View = app.View = Backbone.View;
	
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
		
		//Testing
		/*_.each(model.columns,function(col,key){
			console.log(key+"\t: "+col.type);
		});
		*/
		models[model.name].initialize = function(){
			this.structure = model.columns;		
		}


	});
	
	_.each(models,function(m){
		app[m.name] = Model.extend(m);
		app[m.name].prototype.type = function(){return m.name;};
		app[m.name].prototype.url = function(){return "/rest/"+m.name;};
	})

	console.log(app);
	//Load the logged in user--Skip login for offline development

	var user_id = $("#__user__").attr("y");
	var user_name = $('#__user__').attr("x");
	var u = new app.User({id:user_id});
	u.once("sync",function(){
		u.view.render();
		$('.container').html(u.view.el);
	});
	//Launch the app by fetching the user.
	u.fetch();
	
	var Users = app.Collection.extend({
		model:app.User,
		url: function(){return '/Users'},
	});

	users = new Users();
	users.create({email:"ohoh@gmail.com"});
	console.log(users)
	//users.fetch();
	console.log(users.get({id:1}));
	console.log(Users);	
	return app;
	
});
