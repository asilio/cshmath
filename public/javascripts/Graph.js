define(function(require){

	require('JessieScript');
	var _=require('lodash');
	var mathjs=require('mathjs');
	//var math=mathjs;

	var Marionette=require('marionette');

	/*Translate between a simple semi-colon separated graphing api
		into the JXG graphing environment.
		
		unit Test:
		f(x)=3x+2;
		plotCurve(f,0,22);
		plotPoint(2,5,"H");
		axis(-10,10,-10,10);
	*/
	
	function uuid()
	{
		this.count=0;
	}
	
	uuid.prototype.next=function()
	{
		return "graph"+this.count++;
	}
	
	var uid=new uuid();
	
	var Graph=Marionette.ItemView.extend({
		//template:false,
		//el:'#jxgbox',
		template:'#jxgbox',
		/*
		//See http://jsxgraph.uni-bayreuth.de/distrib/jessiescript_ref_en.pdf for details about syntax.
			In addition to the JessieScript below, this will also parse:
			******My Personal Scripting*****************
			axis=[xmin,xmax,ymax,ymin]	required to create ANY axis. Should be considered mandatory in any script
			
			*******JessieScript**************************
			A(1,1) 				point at (1,1) with name A
			BB(-2|0.5) 			point at (-2,0.5) with name BB
			]AB[ 				straight line through points A and B
			[AB[ 				ray through points A and B, stopping at A
			]A BB] 				ray through points A and BB, stopping at BB
			[AB] 				segment between A and B
			g=[AB] 				segment between A and B with name g
			k(A,4) 				circle with midpoint A and radius 4
			k(A,[BC]) 			circle with midpoint A, whose radius is given by the (not necessarily
			existing) 			segment [BC]
			k(A,B) 				circle with midpoint A, through point B
			k1=k(A,3) 			circle with midpoint A with radius 3 with name k1
			P(g) 				glider P on the object g
			Q(k1,0,1) 			glider Q on the object k1 at (0,1)
			g&k1 				intersection point(s) of the objects g and k1
			S=g&k1 				intersection point(s) of the g and k1.
								Multiple intersection points are named with S1 and S2, single ones with S.
			||(A,g) 			parallel line to g through point A
			|_(A,g) 			perpendicular line to g through point A
			<(A,B,C) 			angle, defined by the points A, B, C
			alpha=<(A,B,C)  	angle, defined by the points A, B, C, with name α
								Possible greek denominators are alpha, beta, gamma, delta, epsilon,
								zeta, eta, theta, iota, kappa, lambda, mu, nu, xi, omicron, pi, rho, sigmaf,
								sigma, tau, upsilon, phi, chi, psi and omega.
			1/2(A,B) 			midpoint between A and B
			3/4(A,B) 			point dividing the segment from A to B at ratio 3:7 ,
								i.e. 3 4
								parts of the segment [AB] are between A and the constructed point
								Therefore, any ratio of natural numbers is possible.
			P[A,B,C,D] 			polygon through points A, B, C, D with name ’P’
			f:x^2+2*x 			functiongraph, f : x → x^2 + 2 · x
			f:sin(x) 			functiongraph, g : x → sin(x)
			#Hello world(0,3) 	text Hello world at (0,3)
		*/
		initialize:function(model,options)
		{
		
			//Initialize board with some basic options
			this.options=options || {};
			
			this.options.showcopyright=false;
	
			//Default to not showing the axis
			if(this.options.axis==undefined)
				this.options.axis=false;
			
			//Initializing a mathematical parser
			//this.parser=mathjs.parser();
			
			this.functions={};
			
			
		},
		
		onRender:function()
		{
			
			this.el.id=uid.next();
			this.el.classList.add("jxgbox");//Mandatory
			
			_.each(this.options.classes,function(c){
				this.el.classList.add(c);
			}.bind(this));
			
			this.el.name="jxgbox";
			
			//Make the element visible in the DOM. This is absolutely necessary for 
			//JXG to do its stuff.
			$('body').append(this.el);
			this.board=JXG.JSXGraph.initBoard(this.el.id,this.options);
			//Parse the contents of options.commands into a meaningfuls JXGbox.
			//this.parse(this.options.commands);
			var constructions=this.options.construct.split(';');
			_.each(constructions,function(construct){
				construct=construct.trim();
				if(construct.indexOf("axis=")==0)
				{
					construct=construct.replace('[','');
					construct=construct.replace(']','');
					var args=construct.split("=")[1];
					args=args.split(',');
					_.each(args,function(arg){
						arg=1*arg;
					});
					
					var xmajor=Math.max(Math.floor(Math.abs(args[0]-args[1])/9),1);
					var ymajor=Math.max(Math.floor(Math.abs(args[2]-args[3])/9),1);

					JXG.Options.axis.ticks.majorHeight = -1;
					// To prevent default tick labels:
					JXG.Options.axis.ticks.insertTicks = false; 
					
					var xTicks, yTicks, bb;
					var xaxis = this.board.create('axis', [ [0,0],[1,0] ], {
						 ticks: { 
						   ticksDistance: 2,
						   label: {
							 offset: [-5, -12] // Must be within 'ticks:' definition
						   }, 
							minorTicks:1, // The NUMBER of small ticks between each Major tick
						   drawZero:true // Must be within 'ticks:' definition  
						 }
						}
					);
					xaxis.defaultTicks.ticksFunction = function () { return xTicks; };
					this.board.fullUpdate(); // full update is required
					yaxis = this.board.create('axis', [[0, 0], [0, 1]], {
						ticks: { 
						  ticksDistance: 2, 
						  label: {
							offset: [7, -2]
						  },
						  minorTicks:4 // The NUMBER of small ticks between each Major tick
						}
					 }
					);
					yaxis.defaultTicks.ticksFunction = function () { return yTicks; };
					this.board.fullUpdate(); // full update is required
					var s= function() {
						bb = this.board.getBoundingBox();
						xTicksVal = Math.pow(10, Math.floor((Math.log(0.6*(bb[2]-bb[0])))/Math.LN10));
						if( (bb[2]-bb[0])/xTicksVal > 4) {
						  xTicks = xTicksVal;
						} else {
						  xTicks = mathjs.round(0.5* xTicksVal,1);
						}
						yTicksVal = Math.pow(10, Math.floor((Math.log(0.6*(bb[1]-bb[3])))/Math.LN10));
						if( (bb[1]-bb[3])/yTicksVal > 4) {
						  yTicks = yTicksVal;
						} else {
						  yTicks = mathjs.round(0.5* yTicksVal,1);
						}
						this.board.fullUpdate(); // full update is required
					}
					setTicks=s.bind(this);
					this.board.on('boundingbox', function () { 
						setTicks();
					});

					//Set the bounding box and set off the axis creation.
					this.board.setBoundingBox(args,true);
					return;
				}				
				var constr=this.board.construct(construct);
				_.each(constr,function(point){
					//console.log(point);
					point.isDraggable=false;
				});
			}.bind(this));
			
		}
	});
	/*
	var g=new Graph(null,{
							keepaspectratio:true,
							boundingbox:[-10,10,10,-10],
							construct:"f:x^2+2;\nA(1,1);\ng:1-x^2;h:x-1;",
						});
	var testRegion=new Marionette.Region({el:"#preview"});
	testRegion.show(g);
	*/
	return Graph;
});