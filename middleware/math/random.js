var mathjs=require('mathjs');
var random=require('random-js');
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
	var min = min || -10;
	var max = max ||  10;
	min = parseInt(min);
	max = parseInt(max);
	if(min >=max)
		min = max-10;
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

var randIntArray=function(min,max,length){
	var length = length ||10;
	var result =[];
	for(var i = 0; i < length; i++)
		result.push(randInt(min,max));
	return result;
}

var randReal=function(min,max,prec)
{
	var min = min || -10;
	var max = max ||  10;
	min = parseInt(min);
	max = parseInt(max);
	if(min >=max)
		min = max-10;
	var prec = prec || 2;
	var result=random.real(min,max)(engine);
	result=mathjs.format(result,{precision:14});
	var temp=result.split(".")
	result=temp[0]+"."+temp[1].slice(0,prec);
	return mathjs.number(result);
}

var randRealArray=function(min,max,prec,length){
	var prec = prec || 2;
	var length = length || 10;
	var result =[];
	for(var i = 0; i  < length; i++)
		result.push(randReal(min,max,prec));
	return result
		
}

var randPick=function(array){
	if(!array.length)
		array=array._data;

	var index = randInt(0,array.length);
	index--;

	return array[index];
}

var exports={
	engine:engine,
	setSeed:setSeed,
	sample:sample,
	randInt:randInt,
	randReal:randReal,
	randPick:randPick,
	randIntArray:randIntArray,
	randRealArray:randRealArray,
}

module.exports =exports;