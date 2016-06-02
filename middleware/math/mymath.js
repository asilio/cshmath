var Handlebars=require('handlebars');
var hbs=Handlebars;
var _=require('lodash');

var util = require("./util");
var rational = require("./rational");
var polynomial = require("./polynomial");
var random = require("./random");
var mathjs=require('mathjs');
var math = mathjs;

mathjs.import(util);
mathjs.import(polynomial);
mathjs.import(random);
mathjs.import(rational);


var parser=mathjs.parser();
var hobs_parse=function(args, suppressOutput)
{	
	try{
		var res=parser.eval(args).toString();
	}catch(err)
	{
		return 'ERROR: '+err;
	}
	if(!suppressOutput)
		return '';
	return res;
}

var concat=function()
{
	var result="";
	//return "CONCAT, "+String(hobs_parse(arguments[0]))
	for(var i = 0; i<arguments.length;i++)
		result+=hobs_parse(arguments[i]);
	return result;
}

hbs.registerHelper('parse',hobs_parse);
hbs.registerHelper('concat',concat);

function math_template(contents,seed,scope)
{
	var contents=contents+"";
	var seed=seed || new Date().valueOf()*mathjs.randInt(1,1000);
	mathjs.setSeed(seed);

	_.each(scope,function(val,key){
		var re=new RegExp("{{"+key+"}}",'g');
		//console.log(re,val,contents);
		contents=contents.replace(re,val);
	})
	
	contents=hbs.compile(contents)();

	return {
		contents:contents,
		seed:seed};
}

function render_question(question,options){
	var options = options || {};
	var result={};
	var seed=options.seed || new Date().valueOf()*mathjs.randInt(1,1000);
	mathjs.setSeed(seed);
	var commands=question.header;
	//Reset parser...
	parser.clear();
	//Set new scope...
	try{
		parser.eval(commands);
	}catch(err)
	{	
		console.log("Could not parse the command");
		console.log(commands)
		console.log(err);
	}
	var attrs=_.keys(question);
	_.each(attrs,function(key){
		result[key]=math_template(question[key],seed,parser.scope).contents;
	});
	return result;
}

function render_questions(questions,options)
{
	var result=[];
	_.each(questions,function(question){
		result.push(render_question(question,options));
	});
	return result;
}

var exports={
	math_template:math_template,
	render_question:render_question,
	render_questions:render_questions,
	parser:parser,
}

module.exports = exports;