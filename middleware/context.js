var express = require('express');
var _       = require('lodash');
var router  = express.Router();

router.use(function(req,res,next){
	//Add a dedicated context element.
	req.session.context = req.session.context || {};
	res.locals = req.session.context;
	//Modify the render method to always call the sessions context 
	res.rend = _.partial(res.render, _, req.session.context);
	next();
});

module.exports=router;