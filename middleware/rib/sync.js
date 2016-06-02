var db		=	require("../../db");
var _		= 	require("lodash");

var create	= function(options){
	return db.insert(options.table,options.data,function(err,result){
		if(err) return options.error(err);
		var res = {};
		res.id = result.insertId;
		return options.success(res);
	});
};

var read	= function(options){
	var properties  = {};
	properties.id = options.data.id;

	return db.get(options.table,properties,function(err,result){
		if(err)
			return options.error(err);
		return options.success(result[0]);
	});

};

var update	= function(options){
	return db.update(options.table,options.data,function(err,result){
		if(err) return options.error(err);
		return options.success(result);
	});
};

var destroy = function(options){
	var properties  = {};
	properties.id = options.data.id;

	return db.delete(options.table,properties,function(err,result){
		if(err) return options.error(err);
		return options.success(result);
	});
};

var methodMap = {
		'create': create,
		'read':   read,
		'update': update,
		'delete': destroy,
		'patch':  update,
};

var sync = function(method, model, options){
	var options=options || {};
	options.success = options.success 	|| function(){};
	options.error 	= options.error 	|| function(){};

	var f = methodMap[method];

	if(!model.name) throw new Error("Must provide a model name");
		
	options.data	=	_.extend((options.data || {}),model.attributes);
	options.table	=	model.name;
	options.attrs 	= 	model.keys();
	//console.log(options);
	//console.log("SYNC:",this);
	return f.call(sync,options);	
};

module.exports = sync;