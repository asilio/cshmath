define("util",function(require){
	var _ = require("lodash");
	/*Utility functions*/
//	console.log("Util.")
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

	//Returns a list of points formatted and tagged for latex rendering using MathJax
	//prints 5 points per line.
	var zipAsPoints=function(a,b){
		if(a.length!=b.length)
			throw new Error("Must have matching array length");
		result ="\\[";
		for(var i = 0; i<a.length;i++){
			if(i%5==0)
				result+="\\\\";
			result+="("+a[i]+","+b[i]+"),"
		}
		result=result.slice(0,-1)+"\\]";
		return result;
	}


	var uniq = function(array){
		return _.uniq(array);
	}

	exports = {
		signed:signed,
		coef:coef,
		term:term,
		fArray:fArray,
		zipAsPoints:zipAsPoints,
		uniq:uniq
	}

	//Returns a table formatted and tagged for latex rendering using MathJax
	//Table is formatted as a horizontal table:
	/*

	----------------------------------
	| x| x_1 | x_2 | x_3 | ... | x_n |
	| y| y_1 | y_2 | y_3 | ... | y_n |
	----------------------------------

	*/
	exports.zipAsTable=function(a,b,ta,tb){
		var ta=ta || "x";
		var tb=tb || "y";
		if(a.length!=b.length)
			throw new Error("Must have matching array length");
			
		var n=a.length;
		var result="\\[\\begin{array}{|r|"
		for(var i =0;i<n;i++)
			result+="c|";
		result+="}\n\\hline ";
		result+=ta+"&";
		for(var i=0;i<n-1;i++)
			result+=a[i]+"&";
		result+=a[n-1]+"\\\\ \\hline\n";

		result+=tb+"&";
		for(var i=0;i<n-1;i++)
			result+=b[i]+"&";
		result+=b[n-1]+"\\\\ \\hline\n\\end{array}\\]";
		return result;
	}

	/*Using the \bcancel latex function. Be sure that the page has implemented the MathJax extension
	since it is not installed by default.*/
	exports.tally=function(count){
		var count = parseInt(count);
		var r = count%5;
		var q = Math.floor(count/5);
		var result="";
		for(var i = 0; i<q; i++)
			result+="\\bcancel{\\mathbb{||||}}\\;\\;";
		for(var i = 0; i<r; i++)
			result+="\\mathbb{|}";
		return result;
	}

	exports.tally_table=function(rows,values){
		if(rows.length!=values.length) throw new Error("Must have matching rows"+rows+values);
		var result = "<table class='tally_table'>";
		for(var i = 0; i < rows.length; i++)
			result+="<tr><td>"+rows[i]+"</td><td>\\("+exports.tally(values[i])+"\\)</td></tr>";
		result+="</table>";
		return result;
	}

	exports.quick_table=function(rows,values,math){
		var math = math || false;
		if(rows.length!=values.length) throw new Error("Must have matching rows"+rows+values);
		var result = "<table class='tally_table'>";
		for(var i = 0; i < rows.length; i++)
			if(math)
				result+="<tr><td>"+rows[i]+"</td><td>\\("+values[i]+"\\)</td></tr>";
			else
				result+="<tr><td>"+rows[i]+"</td><td>"+values[i]+"</td></tr>";
		result+="</table>";
		return result;
	}

	exports.display_array=function(array,cols){
		var cols = parseInt(cols);
		var result ="\\[";
		for(var i = 0; i <array.length ;i++){
			if(i % cols == 0)
				result+="\\\\";
			result+=array[i]+",\\;";
		}
		result = result.slice(0,-3);
		result+="\\]";
		return result;
	}
	return exports;
});