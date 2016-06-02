var _ = require("lodash");
/*Utility functions*/
var signed=function(a){
	if(a>0)
		return "+"+a;
	if(a==0)
		return "";
	return ""+a;
}

var coef=function(c,leading){
	if(_.isNaN(parseInt(c)) && _.isNaN(parseFloat(c)))
		return c;
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

var fArray=function(f,a){
	var result =[];
	for(var i = 0; i<a.length; i++)
		result.push(f(a[i]));
	return result;
}

var zipAsPoints=function(a,b){
	if(a.length!=b.length)
		throw new Error("Must have matching array lengths");
	result ="\\[";
	for(var i = 0; i<a.length;i++){
		if(i%5==0)
			result+="\\\\";
		result+="("+a[i]+","+b[i]+"),"
	}
	result=result.slice(0,-1)+"\\]";
	return result;
}

var exports = {
	signed:signed,
	coef:coef,
	term:term,
	fArray:fArray,
	zipAsPoints:zipAsPoints,
}

module.exports = exports;