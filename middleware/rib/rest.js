var express 	= require('express');
var router 		= express.Router();
var rib 		= require("./rib");
var async	 	= require("async");
var _			= require("lodash");
var sync 		= require("./sync");

var __callback__ = function(req,res,next){
	var f = function(err,result){
//		console.log("CALLBACK");
//		console.log(result);
		if(err) return next(err);
		res.send(result);
	}
	return f;
}

var __success__ = function(req,res,next){
	return function(model,resp,options){
		_.each(resp,function(val,key,obj){
			if(options.attrs.indexOf(key)==-1 && key!="id")
				delete obj[key];
		});
		res.send(resp);
	}
};

var __error__ = function(req,res,next){
	return function(model,resp,options){
		console.log("ERROR: ")
		console.log(model,resp,options)
		next(new Error("did not succeed"));
	}
}


var __save__ = function(req,res,next){
	var options = {};
	options.success = __success__(req,res,next);
	options.error 	= __error__(req,res,next);
	return options;
}

router.route("/search/:Model")
.post(function(req,res,next){
	if(!rib[req.params.Model]) return next(new Error("Could not find model"));

	var model = new rib[req.params.Model]({id:req.params.id});

	rib[req.params.Model].search(req.body.query,__callback__(req,res,next));
});


router.route("/:Model/:id")
.all(function(req,res,next){
	if(!rib[req.params.Model]) return next(new Error("Could not locate Model"));
	next();
})
.get(function(req,res,next){
	//The callback will send the results unless there is an error.
	rib[req.params.Model].get(req.params.id,__callback__(req,res,next));
})
.post(function(req,res,next){
	var u = new rib[req.params.Model]();
	u.save(req.body,__save__(req,res,next));
})
.put(function(req,res,next){
	var u = new rib[req.params.Model]();
//	console.log("PUT",req.body);
//	console.log(req.body);
	u.save(req.body,__save__(req,res,next));
})
.delete(function(req,res,next){
	rib[req.params.Model].delete(req.params.id,__callback__(req,res,next));
});


router.route("/:Model.:alias.:verb/id/:id")
.all(function(req,res,next){
	if(!rib[req.params.Model]) return next(new Error("Could not find model"));
	//var model = new rib[req.params.Model]({id:req.body.id});
	var model = new rib[req.params.Model]({id:req.params.id});
	var id = req.params.id;
	var payload ={};
	console.log("BODY : ",req.body);
	if(req.body["keys[]"])
	{
		if((typeof req.body["keys[]"])==="string")
			payload[req.body["keys[]"]]=req.body["values[]"];
		else
			for(var i = 0; i <req.body["keys[]"].length; i++)
				payload[req.body["keys[]"][i]]=req.body["values[]"][i];
	}
	
	async.series([
		function(cbk){
			model.fetch({success:cbk,error:cbk});
		}],function(err,result){
			console.log("FINAL CALLBACK", err,result);
			//if(!model[req.params.alias]) return next(new Error("Could not locate an alias with that name"));
			//if(!model[req.params.alias][req.params.verb]) return next(new Error("Could not find that verb"));
			
			//var action = rib.Models[req.params.alias][req.params.verb]
			switch(req.params.verb){
				case "all":
					//We no longer want a specific model nor to create a new instance
					//but we do want to return ALL of the instances of this model...
					console.log(req.params.Model+"."+req.params.alias+"."+req.params.verb);
					//console.log(model)
					//console.log(model[req.params.alias]);
					var callback  = __callback__(req,res,next);
//					console.log(callback);
					//console.log("rib.Models."+req.params.Model+"."+req.params.alias+".all");
					return rib.Models[req.params.Model][req.params.alias].all(id,callback);
//					return action.apply(rib.Models[req.params.alias],[id,callback]);
				case "new":
					console.log("NEW : ",req.params.Model+"."+req.params.alias+"."+req.params.verb);
					if(!model[req.params.alias]) return next(new Error("Could not locate an alias with that name"));
					if(!model[req.params.alias][req.params.verb]) return next(new Error("Could not find that verb"));
					if(!rib[model[req.params.alias].other_model]) return next(new Error("Could not locate other model. Weird"));
					var u = new rib[model[req.params.alias].other_model](req.body);
					console.log(u);
					options={};
					options.success  =function(err,result){
						console.log("NEW RESULT",result);
						model[req.params.alias].new.apply(model[req.params.alias],[req.params.id,{id:result.id},__callback__(req,res,next)]);
					};
					options.error 	 =__error__(req,res,next);
					return u.save(payload,options);
				case "add":

					if(!model[req.params.alias]) return next(new Error("Could not locate an alias with that name"));
					model[req.params.alias].new(req.params.id,{id:req.body.id},__callback__(req,res,next));
					return;

				case "insert_after":
					//console.log("Insert");
					if(!model[req.params.alias]) return next(new Error("Could not locate an alias with that name"));
					//if(!model[req.params.alias][req.params.verb]) return next(new Error("Could not find that verb"));
					//if(!rib[model[req.params.alias].other_model]) return next(new Error("Could not locate other model. Weird"));
					//console.log(model[req.params.alias]);
					model[req.params.alias].insert_after({
						source_id:req.body.source_id,
						target_id:req.body.target_id,
						id: req.params.id,
						callback:__callback__(req,res,next),
					})
					return;

				case "delete":
					console.log("DELETE");

					if(!model[req.params.alias]) return next(new Error("Could not locate an alias with that name"));
					console.log(model[req.params.alias]);
					model[req.params.alias].delete({
						id:req.params.id,
						source_id:req.body.source_id,
						callback:__callback__(req,res,next),
					})
					return;
				default:
					return next(new Error("Could not find that verb"));

			}
			})

	
});

router.route("/:Model")
.post(function(req,res,next){
	//console.log("POST: "+req.params.Model,req.body);
	var u = new rib[req.params.Model]();
	u.save(req.body,__save__(req,res,next));
});


rib.init(function(err,result){
	/*
	for(var i = 0; i <err.length; i++)
		console.log(err[i]);
	for(var i = 0; i <result.length; i ++)
		console.log(result[i])
*/
	/*	TESTING  */
	/*
	var u = new rib.Note({id:25,content:"Whatever"});
	console.log(u.mtm);
	console.log(u.subcategory);
	
	u.subcategory.all(function(er,res){
		console.log(er,res);
	});
	
	
	
	var u = new rib.User({email:"yuppy3@gmail.com",id:76});
	
	u.save(null,{
		success:function(result){
			console.log("SUCCESS");
			console.log(result);
			u.instructor.new({title:"A Class",description:"A game of thrones"});
		},
		error:function(result){
			console.log("ERROR")
			console.log(result);
		}
	});
	

	rib.User.all(function(err,result){
		console.log(err,result);
	})
	
	rib.User.get(6,function(err,result){
		console.log("GET: ",err,result);
	})
	
	
	rib.User.search({email:"^ppy",noWild:true},function(err,result){
		console.log("SEARCH: ",err,result);
	})
	

	rib.Class.all(function(err,result){
		console.log(result);
	})
	
	var callback =function(res,err)
	{
		console.log(res,err);
	}

	//Get all classes that user 1 is an instructor for
	rib.Models.User.instructor.all(1,callback);
	
	//Get all classes that user 1 is a student in
	rib.Models.User.student.all(1,callback);

	//Get all questions from a particular assignment	
	rib.Models.Assignment.question.all(150,callback);
		*/
//	console.log(rib.Class.all(function(resp,err){
//		console.log(resp,err);
//	}));
//	console.log(rib.Models);
	console.log("Ready!");
});
module.exports = router;