define("sync",function(require){
	var $=require("jquery");
	var CSRF="";
	
	//CRUD(P) mapping to HTTP verbs
	var methodMap = {
		'create': 'POST',
		'read':   'GET',
		'update': 'PUT',
		'delete': 'DELETE',
		'patch':  'PATCH'
	};
	
	var ajax=function(options){
		if(CSRF=="")
			CSRF=$('#csrf').html();
		
		var options  =  options || {};
		options.method = options.method || "POST";//default to POST
		//if(options.type !="GET")
		options.data = options.data || {};
		options.data.csrf = CSRF;

		var xhr=$.ajax(options);
		return xhr;
	}
	

	
	var module = function(method, model, options){
		var options=options || {};

		options.url = options.url || model.url();
		if(!options.url) throw new Error("Model does not have a valid url defined!");
		if(model.isNew!==undefined)
		if(!model.isNew())
			options.url+="/"+model.id;
		//console.log(options.url);
		var type = methodMap[method];
		
		if(!type) throw new Error("Do not recognize a valid CRUD request");
		options.type=type;
		options.method=type;
		
		//if(type === "POST" || type === "PUT" || type==="PATCH")
		options.data=_.extend((options.data || {}),model.attributes);
		
		var xhr = ajax.call(module,options);
		return xhr;
		model.trigger('request',model, xhr, options);
	};
	module.ajax=ajax;
	return module
	
})
