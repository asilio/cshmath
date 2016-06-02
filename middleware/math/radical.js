var math = require("mathjs");
var gcd=math.gcd;
var rational = require("./rational");
var Rational = rational.Rational;

var Radical = function(radicand,index,coef){
	
	var index = parseInt(index)  || 2;
	var coef = Rational.parse(coef) || Rational.parse(1);
	if(index<2)
		index = 2;
		
	this.radicand = Rational.parse(radicand);
	this.index = index;
	this.coef=coef;
	
}

Radical.prototype.simplify=function(){
	var num=1;
	var den=1;
	var coef=this.coef.simplify();
	var radicand=this.radicand.simplify();
	var i =2;
	var deg = this.index;
	var t = math.pow(i,deg);
	while(t<=radicand.num){
		if(radicand.num == 1)break;
		if(radicand.num%t==0){
			num=num*i;
			radicand.num=radicand.num/t;
			continue;
		}
		i++;
		t=math.pow(i,deg);
	}
	
	i=2;
	t = math.pow(i,deg);
	while(t<=radicand.den){
		if(radicand.den == 1)break;
		if(radicand.den%t == 0){
			den=den*i;
			radicand.den=radicand.den/t;
			continue;
		}
		i++;
		t=math.pow(i,deg);
	}
	
	coef = coef.multiply(new Rational(num,den));
	coef=coef.toString();
	return new Radical(radicand,deg,coef);
}

Radical.prototype.isZero=function(){
	return (this.radicand.isZero() || this.coef.isZero());
}

Radical.prototype.toString=function(simp){
	if(this.isZero()) return "";
	var simp = simp || false;
	if(simp)
		var t = this.simplify
	else
		var t = this.clone();
		
	var c = t.coef.clone();
	var r = t.radicand.clone();
	
	if(r.isOne()){
		return c.add(r).frac(true);
	}
	c = c.frac(true);
	if(this.index % 2 ==0 && t.radicand.sign()<0){
		c+="i"
		r = t.radicand.negate();
	}
	if(r.isOne())
		return c;
	
	//r is not one, so there is no possibility of stranding a sign under the radical.
	r = r.frac(true);

	if(this.index>2)
		return c+"\\sqrt["+this.index+"]{"+r+"}";
	else
		return c+"\\sqrt{"+r+"}";

}

Radical.prototype.clone = function(){
	return new Radical(this.radicand.toString(),this.index,this.coef.toString());
}

Radical.prototype.isWhole = function(){
	return this.simplify().radicand.isOne();
}

Radical.prototype.decimal = function(){
	var t = this.simplify();
	return t.coef.decimal()*mathjs.pow(t.radicand,1/this.index);
	
}

var exports={
	Radical:Radical
}

module.exports = exports;