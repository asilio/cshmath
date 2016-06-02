define("Transporter",function(require){
	var $=require("jquery");
	var module={};
	
	module.CSRF="";
	
	module.ajax=function(options){
		if(module.CSRF=="")
			module.CSRF=$('#csrf').html();
		var options  =  options || {}
		options.data =  options.data  || {}
		options.data.csrf = module.CSRF;
		
		$.ajax(options);
	}
	
	module.post=function(options)
	{
		var options  =  options || {};
		options.method="POST"
		module.ajax(options);
	}

	module.get=function(options)
	{
		var options  =  options || {};
		options.method="GET"
		module.ajax(options);
	}
	
	module.put=function(options)
	{
		var options  =  options || {};
		options.method="PUT"
		module.ajax(options);
	}
	
	module.delete=function(options)
	{
		var options = options || {};
		options.method = "DELETE";
		module.ajax(options);
	}
	return module
	
})