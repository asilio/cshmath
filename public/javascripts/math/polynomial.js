define("polynomial",function(require){

	var rational = require("rational");
	var radical = require("radical");
	var Radical = radical.Radical;
	var Rational = rational.Rational;
	var math = require("mathjs");
	var mathjs=math;
	var gcd=math.gcd;
	var abs=math.abs;
	var sign=math.sign;
	var util = require("util");
	var term=util.term;
	var coef=util.coef;
	var _ = require("lodash");
	var signed = util.signed;

	/*
	*/
	var Polynomial = function(coefs){
		this.coefs=coefs;
	}
	//a = [1, 0, 2] -- > 1 +0x +2x^2
	//Naive Multiplication using Coefficients
	var poly_mult=function(a,b){
		var a=_.clone(a);
		var b=_.clone(b);
		
		var m=a.length;
		var n=a.length+b.length-1;
		var result=math.zeros(n);
		

		for(var i = 0; i < n; i++)
		{
			if(a[i]==undefined)
				a[i]=0;
			if(b[i]==undefined)
				b[i]=0;
		}
		
		for(var i = 0; i<m;i++)
		{
			result=math.add(result,math.multiply(a[i],b));
			b.pop();
			b.unshift(0);
		}
		
		
		return _.clone(result._data);
	}
	var print_poly = function(poly){
		if(poly.length<1) return "";
		if(poly.length==1)	return poly[0];
		if(poly.length==2) return term(poly[1],"x",true)+signed(poly[0]);
		
		var n = poly.length-1;
		
		var result=term(poly[n],"x^{"+n+"}",true);
		
		for(var i = poly.length-2 ; i >=2; i--)
			result+=term(poly[i],"x^{"+i+"}");
		result+=term(poly[1],"x")+""+signed(poly[0]);
		return result;
	}

	// x^2+2x-3 --> [-3, 2, 1]
	var poly_parse=function(string){
		//Split over either addition or subtraction
		var poly = string.replace(/\-/,"+-");
		//All terms will have a coeffiecient and sign
		var terms = poly.split(/[\+]/);
		var n = terms.length;
		var degree = n-1;
		
		var result = math.zeros(n);
		result = result._data;
		for(var i = 0 ; i<n;i++)
		{
			var term = terms[i].split("x");
			var coef = term[0];
			if(coef == "")
				coef = 1;
			if(coef =="-")
				coef = -1;
			if(term[1] == undefined){
				result[0]+=parseFloat(coef);
			}
			else if(term[1] == ""){
				result[1]+=parseFloat(coef);

			}
			else{
				var deg = parseInt(term[1].split("^")[1]);
				result[deg]+=parseFloat(coef);
			}
		}
		
		return result;
	}

	var poly_add=function(a,b){
		var m = math.max(a.length,b.length);
		for(var i = 0 ; i <m;i++){
			if(a[i]==undefined)
				a[i]=0;
			if(b[i]==undefined)
				b[i]=0;
		}
		
		var result = math.add(a,b);
		return result;
	}

	var poly_subtract=function(a,b){
		var m = math.max(a.length,b.length);
		for(var i = 0 ; i <m;i++){
			if(a[i]==undefined)
				a[i]=0;
			if(b[i]==undefined)
				b[i]=0;
		}
		
		var result = math.subtract(a,b);
		return result;
	}

	//Build a polynomial with these Rational roots.
	/*
		Default == Case 0: Returns an array of coefficients
				   Case 1: Returns an expanded polynomial: ax^n+bx^n-2...+c
				   Case 2: Returns a factored polynomial: (2x+3)(x-2)(x) etc.
	*/
	var polynomial = function(roots,choice){
		var choice = choice || 0;
		if(choice >2)
			choice = 0;
		
		var roots = roots._data || roots; //Ned to account for mathjs's internal type changing
		var result=[];
		
		var r = new Rational(roots[0]);
		r=r.negate();
		r=r.simplify();
		
		result[0]=[r.num,r.den];//coefficients, aka, polynomial object for this module
		console.log(result[0]);
		result[1]="";//This will be the expanded polynomial
		result[2]="("+term(r.den,"x",true)+signed(r.num)+")";//this will be the factored polynomial.
		
		for(var i = 1; i <roots.length; i++){
			r = new Rational(roots[i]);
			r=r.negate();
			r=r.simplify();
			result[2]+="("+term(r.den,"x",true)+signed(r.num)+")";//this will be the factored polynomial.
			result[0]=poly_mult(result[0],[r.num,r.den]);
		}
		result[1]=print_poly(result[0]);
		result[0]=result[0].reverse();
		return result[choice];
	}

	//Generates a quadratic function with x intercepts x_1,x_2 and vertex (x,k).
	/*
		Default Case: Returns a string formatted a(x-h)^2+k
	    	  Case 1: Returns a string formatted ax^2-2ahx+k
	    	  Case 2: Returns decimal values for the x-intercepts (these may be complex)
	    	  Case 3: Returns LaTex formated values for the x-intercepts (these may be complex)
	    	  Case 4: Returns a decimal value for the y-intercept;
	    	  Case 5: Returns a LaTex formatted value of the y-intercept
	*/
	var quadVertex = function(a,h,k,choice){
		var h   = Rational.parse(h)  || new Rational();
		var k   = Rational.parse(k)	 || new Rational();
		var a   = Rational.parse(a)  || new Rational();
		var choice = choice || -1;

		switch(choice){
			
			case 1:
				h=h.negate();
				var c=a.multiply(h.pow(2)).add(k);
				if(c.isZero())
					var C = "";
				else
					var C = c.LaTex(true);
				var result =a.coef(true,true)+"x^2"+a.multiply(h).multiply(2).coef(true)+"x"+C;
				
				return result;
			case 2://Decimal Solutions for the intercepts
				var x_1, x_2;
				x_1 = math.add(mathjs.sqrt(-k.decimal()/a.decimal()),h.decimal());
				x_2 = math.subtract(h.decimal(),mathjs.sqrt(-k.decimal()/a.decimal()));
				return [x_1,x_2];
			case 3://Latex comma separated solution for x-intercepts
				var x_1, x_2;
				var rad = k.negate().divide(a); 
				x_1 = new Radical(rad,2);
				x_1 = x_1.simplify();
				x_2 = new Radical(rad,2,-1);
				x_2 = x_2.simplify();
				if(x_1.isWhole())
				{						
					return h.add(x_1.coef).LaTex() +", "+h.add(x_2.coef).LaTex();
				}
				if(x_1.isZero())
					return h.LaTex();
				if(h.isZero())
					return x_1+", "+x_2;
						
				return h.LaTex()+"+"+x_1+", "+h.LaTex()+x_2;
			case 4://Y-intercept, decimal solution
				var y;
				y = a.decimal()*h.pow(2).decimal()+k.decimal();
				return y;
			case 5://Returns latex interpreted y intercept
				var y;
				y = a.multiply(h.pow(2)).add(k).LaTex();
				return y;
			default:
				var H="";
				var result="";
				if(!h.isZero())
					H = h.negate().LaTex(true);
				var K = "";
				if(!k.isZero())
					K=k.LaTex(true);
				var A = a.coef(true,true);
				if(h.isZero())
					result =A+"x^2"+K;
				else
					result =A+"(x"+H+")^2"+K;
				return result;
		}
		
	}
	/*
	Trinomial(a,b,c,choice)

	Default: Returns a string formatted ax^2+bx+c
		example: trinomial() --> returns trinomial with random rational coefficients
				 trinomial([1,2,3]) --> "x^2+2x+3"
				 
	Case 1: Returns a decimal answer for the roots of f(x)=ax^2+bx+c
	Case 2: 
	*/
	var trinomial = function(coefs,choice){
		var coefs = coefs._data || coefs;
		
		var b   = Rational.parse(coefs[1])  || new Rational();
		var c   = Rational.parse(coefs[2])	|| new Rational();
		var a   = Rational.parse(coefs[0])  || new Rational();
		var choice = parseInt(choice) || -1;
		
		switch(choice){
			case 1:
				var x_1,x_2;
				var num_1 = mathjs.add(b.negate().decimal(),mathjs.sqrt(math.subtract(b.pow(2).decimal(),4*a.decimal()*c.decimal())))
				var num_2 = mathjs.subtract(b.negate().decimal(),mathjs.sqrt(math.subtract(b.pow(2).decimal(),4*a.decimal()*c.decimal())))
				x_1=mathjs.divide(num_1,2*a.decimal());
				x_2=mathjs.divide(num_2,2*a.decimal());
				return [x_1,x_2];
			case 2:
				
			default:
				var A = "";
				if(!a.isZero())
					A = a.coef(true,true)+"x^2";
				var B = "";
				if(!b.isZero())
					B = b.coef(true)+"x";
				var C="";
				if(!c.isZero())
					C=c.LaTex(true);
				return A+B+C;
		}
	}

	var exports = {
		polynomial:polynomial,
		trinomial:trinomial,
		quadVertex:quadVertex,
		poly_subtract:poly_subtract,
		poly_add:poly_add,
		poly_mult:poly_mult,
		poly_parse:poly_parse,
		print_poly:print_poly,
	}

//	module.exports = exports;
	return exports;
})