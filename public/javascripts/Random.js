define(function(require){
	var Handlebars=require('hbs');
	var hbs=Handlebars;

	var mathjs=require('mathjs');
	var random=require('randomjs');
	var engine=random.engines.mt19937();
	var math=mathjs;
		
	var setSeed=function(seed)
	{
		engine.seed(seed);
	}
	setSeed(new Date().valueOf()*Math.random());
	
	var sample=function(pop,size)
	{
		return random.sample(engine,pop,size);
	}

	//Look, we really don't actually ever want a 0, I mean, right?
	var randInt=function(min,max)
	{
		var result=random.integer(min,max)(engine)
		var count=0;
		while(result==0)
		{
			count++;
			if(count>50) break;//Apparently we have bad luck.
			result=random.integer(min,max)(engine)
		}
		return result;
	}
	

	var randReal=function(min,max,prec)
	{
		var result=random.real(min,max)(engine);
		if(!prec)
			prec=2;
		result=mathjs.format(result,{precision:14});
		var temp=result.split(".")
		result=temp[0]+"."+temp[1].slice(0,prec);
		return mathjs.number(result);
	}

	var randPick=function(array){
		if(!array.length)
			array=array._data;

		var index = randInt(0,array.length);
		index--;

		return array[index];
	}
	
	var signed=function(a){
		if(a>=0)
			return "+"+a;
		return ""+a;
	}
	
	var coef=function(c,leading){
		if(c==1 && !leading)
			return "+"
		else if(c==1)
			return ""
		if(c==-1)
			return "-"
		if(leading && c>0)
			return ""+c;
		
		return signed(c);
	}
	
	var term=function(c,vari,leading)
	{
		if(c==0 || c*1==0)
			return '';
			
		c = coef(c,leading);
		return c+vari;
	}
	
	var myrandom={
		engine:engine,
		setSeed:setSeed,
		sample:sample,
		randInt:randInt,
		randReal:randReal,
		randPick:randPick,
		signed:signed,
		coef:coef,
		term:term,
	}
	mathjs.import(myrandom);

	var parser=mathjs.parser();
	var hobs_parse=function(args, suppressOutput)
	{
		var res=parser.eval(args).toString();
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
	
	function math_template(contents,seed)
	{

		var seed=seed || new Date().valueOf()*mathjs.randInt(1,1000);
		mathjs.setSeed(seed);

		var contents=hbs.compile(contents)();

		return {
			contents:contents,
			seed:seed};
	}
	
	var exports={
		math_template:math_template,
		parser:parser,
	}
	
	return exports;
});