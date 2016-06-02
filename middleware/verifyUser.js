var express 	= require('express');
var router 		= express.Router();
var rib 		= require("./rib/rib");

var f =function(req,res,next){
	if(!req.session.user)
		return res.redirect('/login');
	res.locals.user=req.session.user;
	if(req.session.user.id){
		res.locals.user.id = req.session.user.id;
		return next();
	}
//	console.log("Logged in as "+res.locals.user.displayName+"\nEmail: "+res.locals.user.email);
	rib.User.search({email:res.locals.user.email,noWild:true,limit:1},function(err,result){
		var u = result[0];
		if(!u){
			var u = new rib.User();
			return u.save({email:res.locals.user.email},{success:function(err,result){
				console.log("SAVED: ",err,result)
				next();
				},
				error:function()
				{console.log("ERROR");next();}
				}
			)
		}
		if(u.id){
			res.locals.user.id = u.id;
			req.session.user.id = u.id;
		}
//		console.log("DID NOT NEED TO SAVE",u.id)
//		console.log(res.locals.user)
		next();
	});
}
router.use(f);

module.exports = router;

