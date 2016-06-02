var express 	= require('express');
var router 		= express.Router();
var Ribcage 	= require('../Ribcage/Ribcage');
var Models 		= require('../Ribcage/Models');
var _			= require('lodash');
//var async		= require('async');

//Runs once, when the server is started
Ribcage.build(Models,{
	ready:function(err,result){
		if(err) console.log(err);
		console.log("+++Server is Fully Operational!+++");
	}
});

router.route("/:Model.:Model2.:alias.:verb")
.all(function(req,res,next){
	//Ribcage.Models.Class.get(1).user.instructor.add(2);
	var parent = req.params.Model;
	var child  = req.params.Model2;

	var parent_model=Ribcage.Models[parent];
	if(!parent_model)
		return res.send("No parent Model");

	var parent=parent_model.get(req.body.id);
	//console.log(parent_model);
	//console.log(parent);
	if(!parent)
		return res.send("Couldn't find that parent");
	if(!parent[child.toLowerCase()])
		return res.send("Couldn't access the first level of parent[child]");
		
	var collection=parent[child.toLowerCase()][req.params.alias];
	if(!collection)
		return res.send("Couldn't access the collection.");
	
	switch(req.params.verb){
		case "all":
			var c = collection.all();
			var r = _.pluck(c,'attrs');
			res.send(r);
			return;
		case "new":
			console.log(req.body);
			var keys=req.body["keys[]"];
			var values=req.body["values[]"];
			console.log(keys,values);
			if(typeof keys === "string")
			{
				keys=[keys];
				values=[values];
			}
			var data = _.object(keys,values);
			console.log(data);
			console.log("**");
			collection.new(data,function(err,result){
				if(err) return next(err);
				res.send(result);
			});
			return;
		default:
			res.end(404);
	}
	//res.send(_.pluck(collection.all(),'attrs'));
	
	
})

/* 
CRUD Routes
*/
router.route('/:Model/:id')
.all(function(req,res,next) {
	console.log("HTTP://..."+req.originalUrl);
	next();

}).get(function(req,res,next){
	console.log("GET:\t"+req.originalUrl);
	var model = getModel(req,res,next);

	crud.read(model,req.query,function(err,result){
		if(err){
			console.log(err.message);
			res.status(200);
			return next(err);
		}
		console.log(result);
		res.send(result);
	})
}).put(function(req,res,next){
	console.log("PUT:\t"+req.originalUrl);
	console.log(req.body);
	console.log("ARE WE SAVING")
	var model = getModel(req,res,next);
	
	crud.update(model,req.body,function(err,r){
		if(err) return next(new Error(err));
		res.send(r);
	}.bind(this));
}).delete(function(req,res,next){
	console.log("DELETE:\t"+req.originalUrl);
	var model = getModel(req,res,next);
	crud.destroy(model,req.params.id,function(err,result){
		if(err) return next(new Error(err))
		res.end();
	});
});

router.route('/:Model')
.all(function(req,res,next){
	console.log("/:MODEL");
	next();
})
.post(function(req,res,next){
	console.log("POST:\t"+req.originalUrl);
	var model = Ribcage.Models[req.params.Model];
	if(!model) return next(new Error("Could not locate the model"));
	crud.create(model,req.body,function(error,instance){
		if(error) return next(new Error(error));
		res.send(instance);
	});

});

/*
CRUD operations: = function(model,data/id,callback)
Asynchronous operations which will call the callback after performing the desired operation
	model 	= Must be a valid Ribcage model.
	data/id = Must be an object for Create/Update and a numerical ID for Read/Destroy
	callback= A valid callback function. The model instance is passed into the callback (except for destroy);
*/
var crud = new (function(){

	var req,res,next;
	var create = function(model,data,callback){
		var callback = callback ||function(){};
		var t = model.new(data);
		t.save(function(err,result){
			callback(null,t.attrs);
		});
	};
	var read = function(model,data,callback){
		var id = data.id;
		var callback = callback || function(){};
		var t = model.get(id);
		if(!t) return callback(new Error("Could not locate a valid model instance with that id"),null);
	
		callback(null,t.attrs);
	};
	var update = function(model,data,callback){
		var callback = callback || function(){};
		var t = model.get(data.id);
		if(!t) return callback(new Error("Could not locate a valid model instance with that id"));
		_.each(data,function(value, key, data){
			t.set(key,value);
		});
	
		t.save(function(err,response){
			callback(err,t.attrs);
		});
	};
	var destroy = function(model,id,callback){
		var callback = callback ||function(){};
		var t = model.get(id);
		t.destroy(callback);
	};

	return {
		create:create,
		read:read,
		update:update,
		destroy:destroy,
	};
});

var getModel=function(req,res,next){
	var model = Ribcage.Models[req.params.Model];
	if(!model){
		var err = new Error("Could not locate the model");
		return next(err);
	}
	
	return model;
};

module.exports = router;
