define("rational",function(require){
	var util = require("util");
	var _ = require("lodash");
	var math = require("mathjs");
	var gcd=math.gcd;
	var abs=math.abs;
	var sign=math.sign;
	var term = util.term;
	var coef = util.coef;
	var signed = util.signed;
	var random = require("random");
	/*
	@constructor Rational

	A Rational value can be constructed in the following ways:
		var a = new Rational(5,10);   //  1/2 
		var b = new Rational("7/21"); //  1/3
		var c = new Rational("5.5");  //  11/2
		var d = new Rational(1.5);    //  3/2
		var f = Rational.parse("7/21") // 1/3
		etc.
		etc. ...
		
	@param {Number} num	//The numerator
	@param {Number} den //The denominator
	*/

	var __parse__ = function(input){
		return parseInt(input);
	//	return math.parse(input).compile(math).eval();
	}
	var Rational=function(num,den){
		//console.log('RATIONAL INPUTS', num,den);
		if(num.num)
		{
			den = num.den;
			num = num.num;
		}

		switch(arguments.length){
			case 0://Assign a random numerator and denominator
				this.num = random.randInt(-10,10);
				this.den = random.randInt(-10,10);
				break;
			
			case 1:
				var a = num;
		
				//Parse the inputs
				if((typeof a)=="string")
				{
					if(a.indexOf("/")>-1){
						var split="/";
						this.num =__parse__(a.split(split)[0]);
						this.den =__parse__(a.split(split)[1]);
					}
					//Even if a is a decimal string, the next block will catch it.
					a = parseFloat(a);
				}
				//Do we have a decimal like 5.5? If num=="5.5", we assume there is no denominator.
				//Note that this is a very naive conversion and will not account for rounding errors
				//made in prior calculutions. Significant figures should be accounted for prior to using function.
				if((typeof a)==="number" && a.toString().indexOf(".")>-1)
				{		
					a = a.toString();
					if(a.indexOf(".")>-1){
						var split="."
						var whole = parseInt(a.split(split)[0]);
						if(_.isNaN(whole))
							whole = 0;
						var decimal = a.split(split)[1];
						var deg = decimal.length;
						var s= sign(whole) || 1;
						whole=abs(whole)
						this.num = s*(whole * math.pow(10,deg)+parseInt(decimal));
						this.den = math.pow(10,deg);
					}
				}
			
			default:
				//Neither fraction 4/7 or decimal 5.5 detected, attempt to parse the num and den 
				if(this.num == undefined){
					this.num=__parse__(num);
					this.den=__parse__(den);
				}
		
				//Operate under the basic assumption that we are not intentionally creating undefined fractions
				if(_.isNaN(this.den) || this.den===0 || this.den==undefined)
					this.den=1;	
				if(_.isNaN(this.num) || this.num == undefined)
					this.num=0;
		}
		
		//console.log('RATIONAL RESULT: ',this.num,this.den);

	}

	Rational.parse = function(str){
		if(str === undefined || str === "")
			str = 1;
		return new Rational(str);
	}

	Rational.prototype.LaTex = function(__signed__){
		//Always includes a numerical part.
		//Returns a string without any + signs
		//Setting __signed__==true will FORCE a + sign if one occurs.
		if(!__signed__){//Returns a fraction or whole number using only a negative sign.
			if(this.isZero()) return "0";
			if(this.isOne()) return "1";
			if(this.negate().isOne()) return "-1";
		
			var a_1=this.num;
			var a_2=this.den
			u=math.gcd(a_1,a_2);
			n = math.abs(a_1/u);
			s=math.sign(a_1)*math.sign(a_2);
			d=math.abs(a_2/u);
			if(s>0)
				s=""
			else
				s="-";
			var A = d==1? s+n : s+"\\frac{"+n+"}{"+d+"}"
			return A;
		}else{
			//Return a signed value.
			//Zeroes are tricky. Shouldn't use this if you expect a 0
			if(this.isZero()) return "0";
			if(this.isOne()) return "+1";
			if(this.negate().isOne()) return "-1";
		
			var a_1=this.num;
			var a_2=this.den
			u=math.gcd(a_1,a_2);
			n = math.abs(a_1/u);
			s=math.sign(a_1)*math.sign(a_2);
			d=math.abs(a_2/u);
			if(s>0)
				s="+"
			else
				s="-";
			var A = d==1? s+n : s+"\\frac{"+n+"}{"+d+"}"
			return A;
		}
	}

	Rational.prototype.coef = function(__signed__,leading){
		if(__signed__)
		{
			var result = ""
			
			if(this.isZero()) return "0";//You should make sure this isn't zero before using it as a Coefficient!
			if(this.isOne() && !leading) return "+";
			else if(this.isOne()) return "";
			
			if(this.negate().isOne()) return "-";
		
			var a_1=this.num;
			var a_2=this.den
			u=math.gcd(a_1,a_2);
			n = math.abs(a_1/u);
			s=math.sign(a_1)*math.sign(a_2);
			d=math.abs(a_2/u);
			if(s>0 && !leading)
				s="+";
			else if(s>0)
				s="";
			else
				s="-";
			var A = d==1? s+n : s+"\\frac{"+n+"}{"+d+"}"
			return A;
		}

		//Return an UNSIGNED fraction. Note that this will destroy any sign information about the fraction.
		if(this.isZero()) return "0";//You should make sure this isn't zero before using it as a Coefficient!
		if(this.isOne()) return "";
		if(this.negate().isOne()) return "";

		var a_1=this.num;
		var a_2=this.den
		u=math.gcd(a_1,a_2);
		n = math.abs(a_1/u);
		s=math.sign(a_1)*math.sign(a_2);
		d=math.abs(a_2/u);
		
		var A = d==1? n : "\\frac{"+n+"}{"+d+"}"
		return A;
	}

	Rational.prototype.frac=function(leading){
		var leading = leading || false;
		var a_1=this.num;
		var a_2=this.den
		u=math.gcd(a_1,a_2);
		n = math.abs(a_1/u);
		s=math.sign(a_1)*math.sign(a_2);
		d=math.abs(a_2/u);
		if(!leading)
			var S=coef(math.multiply(s,n));
		else
			var S=coef(math.multiply(s,n),true);
		A=d==1?S:d==0?"Undefined":term(s,"\\frac{"+n+"}{"+d+"}",leading);
		return A;
	}

	Rational.prototype.fraction=function(leading){
		var leading = leading || false;
		var a_1=this.num;
		var a_2=this.den
		u=gcd(a_1,a_2);
		n = abs(a_1/u);
		s=sign(a_1)*sign(a_2);
		d=abs(a_2/u);
		if(!leading)
			var S=signed(math.multiply(s,n));
		else
			var S=coef(math.multiply(s,n),true);
		A=d==1?S:term(s,n+"/"+d,leading);
		return A;
	}

	Rational.prototype.decimal=function(){
		return parseFloat(this.num/this.den);
	}

	Rational.prototype.negate=function(){
		return new Rational(-this.num,this.den);
	}

	Rational.prototype.add = function(other){
		var n =math.add(math.multiply(other.num,this.den),math.multiply(this.num,other.den));
		var d = math.multiply(other.den,this.den);
		return new Rational(n,d);
	}

	Rational.prototype.pow = function(deg){
		var deg = parseInt(deg);
		var num = math.pow(this.num,deg);
		var den = math.pow(this.den,deg);
		return new Rational(num,den);
	}

	Rational.prototype.isOne = function(){
		return (this.num === 1 && this.den ===1);
	}

	Rational.prototype.isZero = function(){
		return (this.num === 0);
	}

	Rational.prototype.subtract = function(other){
		var o = new Rational(-other.num,other.den);
		return this.add(o);
	}

	Rational.prototype.multiply = function(other){
		if( (typeof other)==="number"){
			var t = other;
			other ={}
			other.num=t;
			other.den=1;
		}
			
		return new Rational(this.num*other.num,this.den*other.den);
	}

	Rational.prototype.divide = function(other){
		var num = this.num*other.den;
		var den = this.den*other.num;
		return new Rational(num+"/"+den);
	}

	Rational.prototype.clone = function(){
		return new Rational(this.num,this.den);
	}

	Rational.prototype.equals = function(other){
		//convert to a simplified fraction string. If they are identical, then these are equal.
		return (this.fraction()===other.fraction());
	}

	Rational.prototype.format = function(options){
		return this.fract();
	}
	//Default to a basic fraction string. This will permit the creation of new
	//rationals by passing the string value back into the constructor.
	Rational.prototype.toString=function(){
		return this.num+"/"+this.den;
	}

	Rational.prototype.toJSON=function(){
		return {
			mathjs:"Rational",
			num:this.num,
			den:this.den
		};
	}

	Rational.prototype.sign=function(){
		return sign(this.num)*sign(this.den);
	}

	Rational.prototype.simplify=function(){
		var u = gcd(this.num,this.den);
		var s = this.sign();
		return new Rational(s*abs(this.num/u),abs(this.den/u));
	}

	Rational.prototype.fromJSON = function(json){
		return new Rational(json.num,json.den);
	}

	var radd=function(a,b,s){
		var x = new Rational(a);
		var y = new Rational(b);
		var s = s ||0;
		switch(s){
			case 0:
				return x.add(y).frac();
			default:
				return x.add(y).fraction();
		}
	}

	var frac=function(s,l){
		return (new Rational(s)).frac(l);
	}

	var fraction=function(s,l){
		return (new Rational(s)).fraction(l);
	}
	var fLaTex = function(s,l){
		return (new Rational(s)).LaTex(l);
	}

	var fradd = function(a,b){
		console.log(a,b);
		var A=new Rational(a);
		var B=new Rational(b);
		var C=A.add(B).simplify();

		return C.toString();
	}

	var frsub=function(a,b){	
		var A=new Rational(a);
		var B=new Rational(b);
		var C=A.subtract(B).simplify();
		return C.toString();
	}

	var frmult=function(a,b){
		var A=new Rational(a);
		var B=new Rational(b);
		var C=A.multiply(B).simplify();
		return C.toString();	
	}

	var frdiv=function(a,b){
		var A=new Rational(a);
		var B=new Rational(b);
		var C=A.divide(B).simplify();
		return C.toString();	
	}

	var Fraction=function(n,d){
		var R = new Rational(n,d);
		return R.toString();
	}

	var exports = {
		Fraction:Fraction,
		fradd:fradd,
		frsub:frsub,
		frmult:frmult,
		frdiv:frdiv,
		Rational:Rational,
		rational:Rational,
		frac:frac,
		fraction:fraction,
		flatex:fLaTex,
	}
return exports;
});