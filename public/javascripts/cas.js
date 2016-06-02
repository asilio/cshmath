//cshmath.js
//mathjs.js should be loaded prior to this file
define(function(require){
   
   
    var math=require('mathjs');
    var mathjs=math;
    var _=require('underscore');
  	var parser=mathjs.parser();
  
    math.import({
    	//Assumed that input is a fraction like :'12/5' or '4/12'
    	//returns true if the fraction is simplified
    	//returns false if it is not.
    	isSimplifiedFraction:function(input)
    	{
    		try{
    			math.parse(input);
    		}catch(err){
    			return false;//Could not be parsed. Dump a false and quit.
    		}
    		var frac=input.split('/');
    		var num=math.number(frac[0]);
    		var den=math.number(frac[1]);
    		var gcf=math.gcd(num,den);
    		
    		num=num/gcf;
    		den=den/gcf;
    
    		//By parsing these strings and converting to tex
    		//we can check if the strings are identical.
    		var simplified=num+"/"+den;
    		simplified=math.parse(simplified).toTex();
    		input=math.parse(input).toTex();
    
    		if(simplified==input)
    			return true;
    
    		return false;
    	},
    
    });
    
    document.addEventListener('DOMContentLoaded',function(e){
    	if(navigator.userAgent.search('iPad')==-1) return; // not an iPad
    	
    	console.log("You are an iPad");
    	var css=document.createElement('link');
    	css.setAttribute('rel','stylesheet');
    	css.setAttribute('type','text/stylesheet');
    	css.setAttribute('href','/stylesheets/ipad.css');
    	document.head.appendChild(css);
    	
    	
    });
    
    var cshmath=(function(){
    	
    	//Regular expression for identifying the following: +(-2x)
    	//This is to allow us to simplify to just : -2x
    	//Note that the expression will NOT match +(-12x+3) because it will not match operations inside the match
    	//There are allowed spaces between the + and the ( and the ( and the - as well as in between the numbers
    	//and variables within the parenthesis
    	var impliedSubtraction = /\+\s*\(\s*-([\s\d\w)]+)\)[^\^]{1}/g;
    	var plusMinus=/\+\s*-/g;//Just a plus followed by a minus
    	
    	var alph='abcdefghijklmnopqrstubwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    	
    	
    	//Verified, works with the following:
		//checkInterval("(-Infinity, 2]U(3,infinity)","(-infinity,2]U(3,infinity)")
		//Correctly finds correct versus incorrect. 
		function checkInterval(userInput,answerString)
		{
			//Reduce all cases and strip out all extra white spaces.
			//Then split up over any possible Unions. 
			//NOTE: It is assumed that there are NO intersections in Interval Notation.
			//All intersections should be simplified down
			userInput=userInput.toLowerCase();
			userInput=userInput.replace(/\s/g,'');	
			userInput=userInput.split('u'); //Now represents each subinterval
		
			answerString=answerString.toLowerCase();
			answerString=answerString.replace(/\s/g,'');
			answerString=answerString.split('u');
		
			if(userInput.length<answerString.length)
			{
				return { 
					msg:"Incorrect: The answer must be an interval and you have not included all possible subintervals",
					result:false,
					submit:true,
					}
			
			}
			if(userInput.length>answerString.length)
			{
				return{
					msg:"Incorrect: you have included too many subintervals",
					result:false,
					submit:true,
					}
			}


			//both user and answer are an array of string intervals: [ "(-infinity,2]", ...] etc
			var correct=[];		
			for(var i = 0;i<userInput.length;i++)
			{
				var lower=userInput[i][0];
				var upper=userInput[i][userInput[i].length-1];
			
				var l=answerString[i][0];
				var u=answerString[i][answerString[i].length-1];
			
				if(lower!=l || upper != u)
				{
					correct.push(0);
					break;
				}
			
				userInput[i]=userInput[i].slice(1,-1);
				answerString[i]=answerString[i].slice(1,-1);

				userInput[i]=userInput[i].split(",");
				answerString[i]=answerString[i].split(",");
			
				for(var j=0;j<2;j++)
				{
					if(answerString[i][j].indexOf("i")==-1)//This is NOT the string infinity or -infinity
					{
						var res=checkNumber(userInput[i][j],answerString[i][j]);
						correct.push(res.result);
				
					}else if(mathjs.equal(userInput[i][j],answerString[i][j]))
					{
						correct.push(1);
					}
					else
						correct.push(0);
				}			
			}
		
			correct=mathjs.min(correct);
			if(correct)
				return {msg:"Correct!",result:true,submit:true};
			else
				return {msg:"Incorrect.",result:false,submit:true};
		}
    	
    	function checkList(userInput,answerString)
		{
			userInput=userInput.replace(/\s/g,'');
			answerString=answerString.replace(/\s/g,'');
		
			userInput=userInput.split(',');
			answerString=answerString.split(',');
			res=[];
		
			_.each(answerString,function(a)
			{
				a=mathjs.eval(a);
				a=mathjs.round(a,3);
				res.push(a)
			});
		
			answerString=res;
		
			//The lists must be the same length
			if(userInput.length!=answerString.length)
			{
				return{
					msg:"That is incorrect.  :(",
					result:false,
					submit:true,
				}
			}
			//If we are here, the lists are the same length
			for(var i =0; i<answerString.length;i++)
			{
				var correct=false;
				for(var j=0;j<userInput.length;j++){
					var userAnswer=mathjs.eval(userInput[i]);
					userAnswer=mathjs.round(userAnswer,3);
					if(mathjs.equal(userAnswer,answerString[j]))
						correct=true;
					
				}
				if(!correct)
					return{
							msg:"That is not correct",
							result:false,
							submit:true,
						}
			}
		
			return{
				msg:"You are the best. That is correct",
				result:true,
				submit:true,
			}
		}
    	
    	//Works for Numerical & String Inputs ONLY
    	function checkOrderedPair(userInput,answerString)
    	{
    		//Strip out the parenthesis and seperate everything by commas.
    		userInput=userInput.replace('(','');
    		userInput=userInput.replace(')','');
    		userInput=userInput.replace(/\s/g,'');
    		userInput=userInput.split(',');
    		answerString=answerString.replace('(','');
    		answerString=answerString.replace(')','');
    		answerString=answerString.replace(/\s/g,'');	
    		answerString=answerString.split(',');
    	
    		if(userInput.length!=answerString.length)
    		{
    			return {
    				msg:"Your dimensions do not match the dimensions I was expecting. Please double check your work and what you typed in.",
    				result:false,
    				submit:false,
    				};
    		}
    		for(var i = 0;i<userInput.length;i++)
    		{
    			//A single incorrect entry means the whole answer is wrong.
    			if(!mathjs.equal(userInput[i],answerString[i]))
    			{	
    				return{
    					msg:"That is incorrect. This value: "+userInput[i] +" in position "+i+" was not the value I was expecting.",
    					result:false,
    					submit:true,
    				};
    			}
    		}
    		//If we get here, didn't find anything wrong.
    		return {
    			msg:"Correct!",
    			result:true,
    			submit:true,
    		};
    	}
    	
    	//Passes to the ordered pair since the formatting is virtually identically 
    	//barring the use of [] instead of ()
    	function checkVector(userInput,answerString)
    	{
    		userInput=userInput.replace('[','');
    		userInput=userInput.replace(']','');
    		answerString=answerString.replace('[','');
    		answerString=answerString.replace(']','');
    		
    		return checkOrderedPair(userInput,answerString);
    	}
    
    	//Works
		function checkNumber(userInput,answerString)
		{
			var answer=math.number(answerString*1);
			try{
				//math.eval allows for a WIDE variety of inputs, 
				//including pretty much any mathematical operation
				//But, if this doesn't work, there is something wrong,
				//so it is a good starting point.
				var userAnswer=math.eval(userInput);
			}catch(err){
				console.log("Could not parse the input as a number");
				return {
					msg:"Please check your answer; I was unable to interpret your input numerically",
					result:false,
					submit:false,
					}
			}
		
			//The answer may be parsed as numerical even if the user is using 
			//extra operations. This will catch any basic operation
			//TODO Catch ANY mathematical operation that is NOT division.
			if(userInput.search("\\+")>0 || userInput.search("\\^")>0 ||
				userInput.search("\\-")>0 || userInput.search("\\*")>0)
			{
				return {
					msg:"Your answer is not simplified. You may enter either a decimal (rounded to the nearest thousandth) OR a simplified fraction.",
					result:false,
					submit:false,
					}
			}
			//If the user is dividing, make sure the answer is simplified
			if(userInput.search("/")>0)
			{
				if(!math.isSimplifiedFraction(userInput))
				{
					return {
						msg:"You are attempting to submit an answer as a fraction, but your fraction is NOT simplified. Please simplify the fraction and then submit your answer.",
						result:false,
						submit:false,
					}
				}
				//the fraction is simplified, so we can just check it out now.
				if(math.eval(userInput)==math.eval(answerString))
				{
					var result=true;
					var msg="That is correct! Very well done.";
				}
				else{
					var result=false;
					var msg="That is incorrect. Please try again.";
				}
				return {
					msg:msg,
					result:result,
					submit:true,//actually record this result.
				}
			}

			//If we make it to this point, the answer is presumably some kind of decimal
			//We only want to compare to the nearest thousandth
			userInput=mathjs.round(mathjs.eval(userInput),3);
			answerString=mathjs.round(mathjs.eval(answerString),3);
		
			if(!mathjs.equal(userInput,answerString))
			{
				var msg="That is incorrect. Please try again.";
				var result=false;
			}else{
				var msg="That is correct! Very well done.";
				var result=true;
			}

			return {
				msg:msg,
				result:result,
				submit:true
			};
		}
    
    	//TODO: Modify the Check Expression to be as robust as possible.
		function checkExpression(userInput,answerString,variables)
		{
			var testValues=[];
			var parser=math.parser();
			userInput=userInput.toLowerCase();
			answerString=answerString.toLowerCase();
		
			//Turns all subtraction into adding the opposite.
			//Ignores negatives with (, +, or a space in front of it.

			userInput=doubleNegatives(userInput);

			userInput=fixExponents(userInput);

			userInput=noSubtraction(userInput);

			answerString=doubleNegatives(answerString);

			answerString=fixExponents(answerString);

			answerString=noSubtraction(answerString);

			//The following loop will search for every variable^exponent
			//that the user submitted. It will check this against the expected
			//answer variable^power and determine if the user has submitted the correct
			//number of variable^power. Example
			//User submits x^2 + 4x + 3
			//answer expects to see (x+1)(x+3)
			//Since the user submitted x^2, this will break and let the user know their answer
			//was not correct.
			var inputVars=detectVariablesExponents(userInput);
		
			var result=false
			inputVars.every(function(variable){
				if(userInput.split(variable).length!=answerString.split(variable).length)
				{
				
					//console.log(userInput,answerString);
					result= {
						msg:"Double check your work and make sure your answer is formatted correctly",
						result:false,
						submit:false
					}
					return;
				}
			});
		
			if(result)
			{
				return result;
			}

		
			userInput=impliedVariableMultiplcation(userInput);
			answerString=impliedVariableMultiplcation(answerString);

		
			var alph='abcdefghijklmnopqrstubwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
			var vars=''
			for(var i=0;i<alph.length;i++)
			{
				if(userInput.indexOf(alph[i])>-1)
					vars+=alph[i]+','
			}
			vars=vars.slice(0,-1);


		
			//Create two functions, one for the input, one for the correct answer		
			parser.clear();
			parser.eval('f('+vars+')='+answerString);
			try{
				parser.eval('g('+vars+')='+userInput);
			}catch(err){
				return {
					msg:"Could not interpret what you typed in. Please check your formatting",
					result:false,
					submit:false,
				}
			}
			//We have defined g and f, functions within the parser. 
			//To see if the expressions are equivalent, we will test 20 random points
			//and evaluate both expressions at these points. Any descrepencies
			//and we say no.
			for (var i=0;i<20;i++){
				var res='';
				for (var j=0;j<vars.split(',').length-1;j++)
				{
					res+=math.randomInt(-100,100)+',';
				}
				res+=' '+math.randomInt(-100,100);
				testValues.push(res);
			}
		
			for(var i=0;i<testValues.length;i++)
			{
				try{
					if(!math.equal(parser.eval('f('+testValues[i]+')'),
							   parser.eval('g('+testValues[i]+')'))){
						return {
							msg:"That is incorrect",
							result:false,
							submit:true,
						}
					}
				}catch(err){
					return {
						msg:"There appears to be an error in your answer. Please double check to make sure you typed it in correctly.",
						result:false,
						submit:false,
					}
				}
			}
			return {
				msg:"Correct!",
				result:true,
				submit:true
			}
		}
    	
    	//TODO Implement Equation Checking
    	function checkEquation(userInput,answerString,variables)
    	{
    		return true;
    	}
    
    	//Works, but is derived from checkExpression, so all the same problems overlap.
    	function checkFunction(userInput,answerString,variables)
    	{
    		if(userInput.split('=').length!=2)
    			return {
    				msg:"Remember, you need to type a function like f(x)=3x+2",
    				result:false,
    				submit:false
    			}
    		return checkExpression(userInput.split('=')[1],answerString.split('=')[1],variables);
    	}
    	
    	//TODO Implement Multiple choice
    	function checkMultipleChoice(userInput,answerString)
    	{
    		return true;
    	}
    
    	//Functional
    	function checkString(userInput,answerString)
    	{
    		//Strip out ALL whitespace from the user input.
    		//Flatten out all upper and lower case letters
    		userInput=userInput.trim().toLowerCase();
    		
    		var re=new RegExp(" ",'g');
    		userInput=userInput.replace(re,'');
    
    		//There may be more than one correct means of representing the answer as a string. Those means must be separated by the keyword OR (capital!)
    		if(answerString.search("OR")>-1)
    		{
    			var answers=answerString.split("OR");
    			var res=undefined;
    			for(var i =0;i<answers.length;i++)
    			{
    				res=checkString(userInput,answers[i]);
    				if(res.result==true) return res;
    			}			
    			return res;
    		}
    
    		//Strip out all remaining whitespace from the answer
    		answerString=answerString.trim().toLowerCase();
    		answerString=implicitUnitaryMultiplication(answerString,'abcdefghijklmnopqrstuvwxyz');
    		var msg='';
    		var result=false;
    		if(userInput==answerString)
    		{
    			var result=true;
    			var msg="Correct!";
    		}else{
    		
    			try{
    				var result=checkExpression(userInput,answerString).result;
    				if(result)
    				{
    					//Generally speaking, the expression checker is now correct, including formatting.
    					//msg="You answer appears to be correct, but not exactly what I was expecting. Could you try to simplify it more for me?";
    					msg="Woohoo! Correct!",
    					result=true;
    					submit=true;
    					
    					
    				}
    			}catch(err){
    			
    				var result=false;
    				var msg="That was incorrect.";
    			}
    		}
    		
    		return {
    			msg:msg,
    			result:result,
    			submit:true
    		};
    	}

    	
    	function simplifyNegatives(input)
    	{
    		var result=input;
    		var match=impliedSubtraction.exec(result);
    		while(match)
    		{
    			result=result.replace(match[0],"-"+match[1]);
    			match=impliedSubtraction.exec(result);
    		}
    		
    		match=plusMinus.exec(result);
    		while(match)
    		{
    			result=result.replace(match[0],"-");
    			match=plusMinus.exec(result);
    		}
    		return result;
    	}
    	
    	function implicitUnitaryMultiplication(input,variables)
    	{
    		//Strip out all whitespace.
    		var re=new RegExp(" ",'g');
    		input=input.replace(re,'');
    
    		for(var i=0;i<variables.length;i++)
    		{
    			//In case the string starts with something like 1x or -1x
    			re=RegExp('^(\\-{0,1})1'+variables[i]);
    			var match=re.exec(input);
    			if(match)
    				input=input.replace(match[0],match[1]+variables[i]);
    				
    			//input=input.replace(re,variables[i]);
    			
    			re=RegExp('^\\((\\-{0,1})1\\)'+variables[i]);
    			match=re.exec(input);
    			if(match)
    				input=input.replace(match[0],match[1]+variables[i]);
    				
    			input=input.replace(re,variables[i]);
    			
    			re=RegExp('([\\+\\-\\*])(1)'+variables[i],'g');
    			var match=re.exec(input);
    			while(match)
    			{
    				if(match[1]==undefined) match[1]='';
    				
    				input=input.replace(match[0],match[1]+variables[i]);
    				match=re.exec(input);
    			}
    		}
    		return input;
    	}
    	
    	function simplify(input)
    	{
    		input=simplifyNegatives(input);
    		input=implicitUnitaryMultiplication(input,alph);
    		return input;
    	}
    	
    	//Fix all of the exponents by wrapping parenthesis around any exponent
    	//not already in parenthesis. Only matches DIGITS in the exponent, nothing else.
    	function fixExponents(input)
    	{
    		var exp=/\^(\d+)/;
    		var test=input;
    		var match=exp.exec(test);
    		while(match)
    		{
    			test=test.replace(match[0],"^("+match[1]+")");
    			match=exp.exec(test);
    		}
    		
    		return test;
    	}
    
    
    	function detectVariablesExponents(input)
    	{
    		var vars=[];
    		//var exp=/\^(\d+)/g;
    		_.each(alph, function(c){
    			var test=c+'\\^\\((\\d+)\\)';
    			
    			var exp=RegExp(test,'g');
    			
    			var match=exp.exec(input);
    			while(match){
    				vars.push(c+"^("+match[1]+")");
    				match=exp.exec(input);
    				}
    			//Also need to test non-exponents
    			test=c+"\[^\\^\]";
    			exp=RegExp(test);
    			var match=exp.exec(input);
    			
    			if(match)
    			{
    				vars.push(c);
    			}
    		});
    		
    		return vars;
    	}
    	
    	//Turns all subtraction into adding the opposite.
    	//Ignores negatives with (, +, or a space in front of it.
    	function noSubtraction(input)
    	{
    
    		var add=/([^\+\(\^])(\-)/g;
    		var match=add.exec(input);
    		while(match)
    		{
    			input=input.replace(match[0],match[1]+"+-");
    			match=add.exec(input);
    		}
    		return input.replace(add,'+-');
    
    	}
    	
    	function doubleNegatives(input)
    	{
    		var dbln=/\-\s*\-/g;
    		input=input.replace(dbln,'+');
    		return input;
    	}
    	function impliedVariableMultiplcation(input)
    	{
    		//Match a variable in front of a parens
    		var re=/(\w\()/;
    		var match=re.exec(input);
    		while(match)
    		{
    			input=input.replace(match[0],match[1][0]+"*"+match[1][1]);
    			match=re.exec(input);
    		}
    
    		//Match two variables one after the other		
    		re = /([^\d\W])([^\d\W])/;
    		match=re.exec(input);
    		while(match)
    		{
    			input=input.replace(match[0],match[1]+"*"+match[2]);
    			match=re.exec(input);
    		}
    		
    		return input;
    	}
    	
    	function checkAnswer(userInput,answerString,answerType){
    	
			var answerType=answerType || 'expression'; //default to expressionfor best performance;		
    
			if(userInput==undefined || userInput=='')
				return {
					msg:"You didn't enter anything!",
					result:false,
					submit:false,
				};
			//console.log(userInput,answerString);	
			//console.log(answerType);	
    		//This may be too aggressive, but...
    		userInput=userInput.replace('*','');
    		//There should be no reason why the user would need to have 
    		//anything other than implied multiplication, right?
    
    		//Depending on the type of the question, we must handle
    		//How we check the answer accordingly.
    		var variables=['x'];
    		var result;
    		var funcs=[
				checkString,
    			checkNumber,
    			checkExpression,
    			checkEquation,
    			checkFunction,
    			checkMultipleChoice,
    			checkOrderedPair,
    			checkInterval,
    			checkVector,
    			checkList,
    		]
    		console.log("Attempting to interprete the answer type...");
    		for(var i=0;i<funcs.length;i++){
				try{
					result=funcs[i](userInput,answerString,variables);
					if(result.result)
						return result;
				}catch(err){
					console.log("Error: ",err);
				}
    		}
    		
    		return {
    			result:false,
    			msg:"That is incorrect.",
    			submit:true,
    		 }
    		console.log("Couldn't guess answertype, using recommended...");
    		switch(answerType){
    
    			//DONE	
    			case 'number':
    			//TODO, integer and fraction differentiation
    			case 'integer':
    			case 'fraction':
    				return checkNumber(userInput,answerString);
    				break;
    			//DONE
    			case 'expression':
    				return checkExpression(userInput,answerString,variables);
    				break;
    			//TODO
    			case 'equation':
    				return checkEquation(userInput,answerString,variables);
    				break;
    			//DONE
    			case 'function':
    				return checkFunction(userInput,answerString,variables);	
    				break;
    			//TODO
    			case 'multi':
    				return checkMultipleChoice(userInput,answerString);
    				break;
    
    			//Functional
    			case 'ordered pair':
    			case 'point':
    			case 'tuple':
    				return checkOrderedPair(userInput,answerString);
    				break;
    			case 'interval':
    				return checkInterval(userInput,answerString);
    				break;
    			//TODO
    			case 'matrix':
    			case 'vector':
    				return checkVector(userInput,answerString);
    				break;
    
    			//Works on Numbers!	NUMBERS ARE IMPLIED
    			case 'list':
//    			case 'tuple':
    				return checkList(userInput,answerString);
    				break;
    			//Functional
    			case 'text':
    			case 'string':
    			default:
    				return checkString(userInput,answerString);
    		}
    
    	}
        
    	return {
    		checkAnswer:checkAnswer,
    		implicitUnitaryMultiplication:implicitUnitaryMultiplication,
    		simplifyNegatives:simplifyNegatives,
    		simplify:simplify,
    		fixExponents:fixExponents,
    		checkInterval:checkInterval
    	};
    })();

    return cshmath;
 
});


