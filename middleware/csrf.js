/***************************
	CSRF TOKEN CHECK
	
	Middleware for preventing Cross Site Request Forgery attacks
	
Copyright Christopher Person-Rennell 2015
All rights reserved.
***************************/

var express=require("express");
var router=express.Router();

function generate_csrf(){
	return "CSRF"+Math.sin(Math.random())+"adjfiAsfaASDF"+Math.sin(Math.random());
}

function csrf(req,res,next){
	//console.log("CSRF: ",req.body);
	if(!req.body || !req.query) return res.send("You didn't provide a body to your request...weird.");
	
	if(req.session.csrf!=req.body.csrf && req.session.csrf != req.query.csrf)
	{
		console.log("TOKENS DO NOT MATCH",req.query,req.body);
		return next(new Error("CSRF Tokens don't match!"));
	}

	//Should the token last for the whole session?
	//Token has been used and is now discarded.
	//delete req.session.csrf;
	//delete req.session.context.csrf;
	delete req.body.csrf;
	delete req.query.csrf;
	//Using the counter like this, in theory, infinitely many asynchronous requests, on one token,
	//can be made up until the client requests GET /etc/ and then the csrf token refreshes if
	//more than X requests have been made on the same token.
	req.session.csrf_counter++;
	next();
}

function session(req,res,next){
	req.session.csrf_counter = req.session.csrf_counter || 0;
	if(!req.session.csrf)// || req.session.csrf_counter>=500)
	{
		req.session.csrf=generate_csrf();
		req.session.csrf_counter=0;
	}

	///Uncomment to count or leave commented to allow unlimited use of token.
	//req.session.csrf_counter++;
	
	//add the csrf token and input field to the context for every request.
	req.session.context.CSRF=req.session.csrf;
	res.locals.CSRF=req.session.csrf;
	req.session.context.csrf="<script type='text/plain' value='"+req.session.csrf+"' id='csrf' name='csrf' style='display:none'>"+req.session.csrf+"</script>";
	res.locals.csrf=req.session.context.csrf;
	next();
}
router.use(session);
//Change this route to add the segments you wish you guard against;
router.route("/rest/*")
.get(csrf)
.post(csrf)
.put(csrf)
.delete(csrf);





module.exports=router;