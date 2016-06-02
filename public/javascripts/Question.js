//Question
define(function(require){
	
	var Backbone=require('backbone');
	var Marionette=require('marionette');
	var Random=require('Random');
	var mathjs=require('mathjs');
	var math=mathjs;
	var math_template=Random.math_template;
	var parser=Random.parser;
	var cas=require('cas');
	var Graph=require('Graph');
	var UI=require('UI');
	require('MathJax');
	var models={};
	var views={};
	var collections={};
	var CView=require('CView');
	/*
	//Examples of how to use the templating system. note that each call returns both the seed and the 
	//rendered response.
	//console.log(math_template("{{parse 'x1=randInt(0,12)' ''}} Find x: \( {{parse 'x1'}} x=12\)"));
	//console.log(math_template("{{parse 'x1=randInt(0,12)' ''}} Find x: \( {{parse 'x1'}} x=12\)",1415992717886));
	*/
	
	models.question=Backbone.Model.extend({
		idAttribute:'id',
		/*
			The database will hold the questions with their assignments yet to be filled in
			The model will need to be parsed before it can be displayed. The following
			attributes will have variables that must be parsed:

				HEADER
					-The header contains all of the variable assignments, must be parsed first
			
				QUESTION
				ANSWER
				SOLUTION
				GRAPH_DATA
					-Each of the above may have variable assignments and must be parsed
					after the header has assigned the variables.
		
		*/
		defaults:{
			title:'',
			question:'',
			answer:'',
			solution:'',
			answer_type:'expression',
			tags:'math',
			//image_links:'',
			graph_data:'',
			hint:'',
			placeholder:'',
			header:"",
			description:'',
			author:'',
		},
		
		validate:function(){
			this.set('csrf',CSRF,{silent:true})
		},
		
		render:function(callback){
			var callback=callback || function(){};
			$.ajax({
				type:"POST",
				url:"/Question/"+this.id,
				data:{csrf:CSRF},
				success:function(response){
					this.set(response);
					callback();
				}.bind(this)
			});
		}
		
	});
	models.Question=Backbone.Model.extend({
	
		idAttribute:'id',
		/*
			The database will hold the questions with their assignments yet to be filled in
			The model will need to be parsed before it can be displayed. The following
			attributes will have variables that must be parsed:

				HEADER
					-The header contains all of the variable assignments, must be parsed first
				
				QUESTION
				ANSWER
				SOLUTION
				GRAPH_DATA
					-Each of the above may have variable assignments and must be parsed
					after the header has assigned the variables.
			
		*/
		defaults:{
			title:'',
			question:'',
			answer:'',
			solution:'',
			answer_type:'expression',
			tags:'math',
			//image_links:'',
			graph_data:'',
			hint:'',
			placeholder:'',
			header:"",
			description:'',
			author:'',
		},
		
		
		initialize:function(args1,args2){
		
			this.on("change",this.render);
			if(this.get('question') || this.get('title'))
				this.render();
		},
		
		render:function(seed,options)
		{
			options=options || {};
			
			//console.groupCollapsed("Question.render()");
			//console.log(this.toJSON());
			
			var options=options || {};
			var response=response || {};

			var commands=this.get('header');//.split(';');
			//console.log(seed);
			seed=seed || options.seed || new Date().valueOf()*mathjs.randInt(1,1000);
			//console.log(seed);
			mathjs.setSeed(seed);
			/*
			_.each(commands,function(command){
				command=command.trim();
				parser.eval(command);
			});
			*/
			parser.eval(commands);

			this.Graph_Data=math_template(this.get('graph_data'),this.seed).contents;
			try{
			this.set('Graph_Data',math_template(this.get('graph_data'),this.seed).contents,{silent:true});
			}catch(err){
				this.set('Graph_Data','');
			}try{
			this.Question=math_template(this.get('question'),this.seed).contents;
			this.set('Question',math_template(this.get('question'),this.seed).contents,{silent:true});
			}catch(err){
				this.set('Question','Could not parse...Did you delete a variable from the Header?');
			}try{
			this.Answer=math_template(this.get('answer'),this.seed).contents;
			this.set('Answer',math_template(this.get('answer'),this.seed).contents,{silent:true});
			}catch(err){
				this.set('Answer','');
			}try{
			this.Hint=math_template(this.get('hint'),this.seed).contents;
			this.set('Hint',math_template(this.get('hint'),this.seed).contents,{silent:true});
			}catch(err){
				this.set('Hint','');
			}try{
			this.Solution=math_template(this.get('solution'),this.seed).contents;
			this.set('Solution',math_template(this.get('solution'),this.seed).contents,{silent:true});
			}catch(err){
				this.set('Solution','');
			}try{
			this.Placeholder=math_template(this.get('placeholder'),this.seed).contents;
			this.set('Placeholder',math_template(this.get('placeholder'),this.seed).contents,{silent:true});
			}catch(err){
				this.set('Placeholder','');
			}try{
			this.Title=math_template(this.get('title'),this.seed).contents;
			this.set('Title',math_template(this.get('title'),this.seed).contents,{silent:true});
			}catch(err){
				this.set('Title','Could not parse...Did you delete a variable from the Header?');
			}try{
			this.Description=math_template(this.get('description'),this.seed).contents;
			this.set('Description',math_template(this.get('description'),this.seed).contents,{silent:true});
			}catch(err){
				this.set('Description','');
			}
			this.set("cid",this.cid,{silent:true});
			this.set('seed',seed,{silent:true});
			if(!options.silent)
			{
				//console.log("I won't be silenced!");
				this.trigger("parsed");
				this.trigger("render");//meh
				//this.trigger('change');
			}

			//console.groupEnd();
		},
		
		validate:function()
		{	
			//console.log("VALIDATE")
			//this.render(null,{silent:true});
			this.unset('module_id',{silent:true});
			this.unset('Graph_Data',{silent:true});
			this.unset('Question',{silent:true});
			this.unset('Answer',{silent:true});
			this.unset('Hint',{silent:true});
			this.unset('Solution',{silent:true});
			this.unset('Placeholder',{silent:true});
			this.unset('Title',{silent:true});
			this.unset('Description',{silent:true});
			this.unset('order',{silent:true});
			this.unset('cid',{silent:true});
			this.unset('seed',{silent:true});
			this.set('csrf',CSRF,{silent:true})
			
		},
		/*url:'/model/Question',
		sync:function(method,model,options){
			model.set("csrf",CSRF);
			var func=options.success || function(){};
			options.success=function(err,result){console.log("Synced done");func.apply(err,result)};
			console.log(model,options)
			Backbone.sync.apply(method,model,options);
			
		}*/
	});
	
	views.QView=Marionette.ItemView.extend({
		template:'#qview2',
			
		ui:{
			question:'#question',
			answer:'#answer',
			graph:'#graph',
			hint:'#hint',
			similar_question:"#similar_question",
		},
		
		events:{

			'keydown #answer':'filterKey',
			'keypress #answer':'keypress',
			'click #check_answer':'checkAnswer',
			'click #hint':'displayHint',
			'click #solution_button':'displaySolution',
			'click #similar_question':'newValue',
			'click #calculator':'displayCalculator',
			'click #give_up':'submit',
			'click .iButton':'updateInput',
			'click #toggle_keyboard':'toggleKeyBoard',
		},
		
		getResults:function(callback)
		{
			
			var callback=callback || function(){};
			/*
			AT THIS TIME THERE ARE NO STORED RESULTS
			*/
			return callback();
			
			var url="/results/Question/"+this.model.id;
			var type="POST";
			var data={
				csrf:CSRF,
			}
			if(this.RequiresUpdate)
				$.ajax({
					url:url,
					type:type,
					data:data,
					success:function(result){
						var seed=false;
				//		console.log(result);
						if(result[this.model.id] && this.options.ReviewMode)
						{
							var last=result[this.model.id].results.length-1;
							seed=result[this.model.id].results[last].seed;
							this.options.Response=result[this.model.id].results[last].response;
						}
						this.options.Score=0;
						if(result[this.model.id])
							for(var i = 0; i<Math.min(result[this.model.id].score,result.max);i++)
							{
								this.options.Score++;
								this.options.Attempts++;
							}
						
						this.options.Remaining=result.max-this.options.Score;
						if(this.IsTest && result[this.model.id])
							this.options.Remaining=0;
						if(this.IsTest && this.options.Remaining==0)
							this.options.NoSolution=false;
						//callback();
		/*			
						if(this.options.ReviewMode && seed)
							this.model.render(seed);
						else
							this.model.render(this.model.get('seed'));
		*/
						this.RequiresUpdate=false;
						this.render();
						MathJax.Hub.Queue(['Typeset',MathJax.Hub,this.el]);
					}.bind(this)
				});
		},
		
		filterKey:function(e)
		{
			if(this.NoKeyBoard)
				return;
			if(e.keyCode == 8 || e.charCode == 8)
			{
				e.preventDefault();
				this.updateInput("DELETE_ONE");
			}
			if(e.keyCode == 27 || e.charCode == 27)
			{
				e.preventDefault();
				this.updateInput("DELETE_ALL");
			}
			
		},
		updateInput:function(e)
		{
			var newInput='';
			if(typeof e  =="string")
				newInput=e;
			else if($(e.target)[0].attributes.value)
				newInput=$(e.target)[0].attributes.value.value;
			else if($(e.target).parents('.iButton')[0].attributes.value)
				newInput=$(e.target).parents('.iButton')[0].attributes.value.value;

			switch(newInput)
			{
					case "DELETE_ONE":
						this.input=this.input.slice(0,-1);
						break;
					case "DELETE_ALL":
						this.input="";
						break;
					default:
						this.input+=newInput;
			}
			this.ui.answer.val(this.input);
		},
		
		templateHelpers:function()
		{
			//if(!this.model.get('Title') || !this.model.get('Question'))
			//	this.model.render(null,{silent:true})
			//console.group("Template Helper");
			//console.dir(this.model.toJSON())
			//console.log(this.model.get('Title'));
			//console.log(this.model.get('title'))
			//console.groupEnd();	
			if(this.model.get('solution')=='')
				this.options.NoSolutionButton=true;
			if(this.model.get('hint')=='' || this.model.get('hint')==undefined)
				this.options.NoHint==true;
	
//			this.options.Title=this.model.get("title");
//			this.model.render(this.model.get('seed'),{silent:true});
			return this.options;
		},
		onShow:function()
		{
			this.getResults();
		},
		onRender:function()
		{
			//MathJax.Hub.Queue(['Typeset',MathJax.Hub,this.el]);
			MathJax.Hub.Queue(['Typeset',MathJax.Hub]);
			this.attempts=0;
			if(this.model.get('graph_data'))
			{
				var g= new Graph(null,{
									classes:["lesson_graph"],
									keepaspectratio:true,
									construct:this.model.get('graph_data')});
				g.render();
				this.ui.graph.append(g.el);
			}
			
			if(this.options.iPad)
			{
	//			this.ui.answer.attr("readonly",true);
			}
			else
				this.ui.answer.attr("readonly",false);
			
			
			//this.autofocus();
		},

		autofocus:function()
		{
			//if(navigator.userAgent.search("iPad")==-1 && window.innerHeight>650)
				this.ui.answer.focus();
		},		
		displayCalculator:function()
		{
			//console.log("display calculator");
		},
		
		newValue:function(){
			if(!this.rerollCount || this.submitted)
				this.rerollCount=0;

//			if(this.rerollCount > 3) return;

			this.rerollCount++;
			this.options.NoSolution=true;
			this.options.NoButtons=false;
			this.startTimer();
			

			
			this.model.render(function(){
				localStorage.setItem("/Question/"+this.model.id,JSON.stringify(this.model));
				this.render();
			}.bind(this));
//			this.render();

			if(this.rerollCount>3)
			{
				
//				this.ui.similar_question.remove();
//				console.log(this.ui.similar_question);
				//this.ui.similar_question[0].attributes.style.value='display:none';
			}
		},
		
		displaySolution:function()
		{
			//TODO: Submit a negative result too
//			this.model.render(this.model.get('seed'),{silent:true});
			if(this.model.get('solution')=='')
			{
				var msg=UI.infoBox("There is no worked out solution available for this question. Sorry.")
			}else{
				var msg=UI.getYesNoCancel("Give up and show the solution?",function(result)
				{
					//console.log(result);
					if(result.value==1)
					{
						this.options.NoSolution=false;
						this.options.NoButtons=true;
						//this.render();
						this.submit({result:0})
						this.autofocus();
						//console.log("display solution");
					}
					this.autofocus();
				}.bind(this));
			}
		},
		
		displayHint:function()
		{
			//this.model.render(this.model.get('seed'),{silent:true});
			var msg=UI.infoBox(this.model.get("hint"),{title:"Hint"});
			MathJax.Hub.Queue(['Typeset',MathJax.Hub]);
		},
		
		keypress:function(e)
		{
			if(e.which==13) 
				return this.checkAnswer();
			if(this.NoKeyBoard)
				return;
			e.preventDefault();
			var alphMap={61:"=",44:",",60:"<",62:">",97:'a',98:'b',99:'c',100:'d',101:'e',102:'f',103:'g',104:'h',105:'i',106:'j',107:'k',108:'l',109:'m',110:'n',111:'o',112:'p',113:'q',114:'r',115:'s',116:'t',117:'u',118:'v',119:'w',120:'x',121:'y',122:'z',43:"+",42:"*",46:'.',45:"-",47:"/",32:" ",8:"DELETE_ONE",27:"DELETE_ALL",94:"^",40:"(",41:")",91:"[",93:"]",49:'1',50:'2',51:'3',52:'4',53:'5',54:'6',55:'7',56:'8',57:'9',48:'0',188:",", 190:"."	};
//			console.log(e.which);
			function getChar(code)
			{
				if(alphMap[code])
					return alphMap[code];
				else
					return '';
			}

			if(e.which==13) 
				return this.checkAnswer();
			this.updateInput(getChar(e.which));
		},
		
		checkAnswer:function(e)
		{		
			var ans="";	
			try{
			//	console.log(this.ui.answer.val());
				
				ans=mathjs.parse(this.ui.answer.val()).toTex();
			}catch(err){
				/*
				if(this.model.get("answer_type")=="tuple" || this.model.get("answer_type")=="interval" 
								|| this.model.get("answer_type")=="point" || this.model.get("answer_type")=="list"
								|| this.model.get("answer_type")=="ordered pair")
					ans=this.ui.answer.val();
				else{
				
					return UI.infoBox("I had trouble interpreting what you entered. Please make sure it is formatted correctly",null,function()
					{
						this.autofocus();
					}.bind(this))
				}
				*/
				ans=this.ui.answer.val();
			}
			var display_ans=ans.replace("sqrt[","\\sqrt[");
			var doubleCheck=UI.getYesNoCancel("If you are happy with:    \\("+display_ans+"\\) for your answer, then press 'yes'",function(response)
			{
				this.options.Response="\\("+ans+"\\)";
				if(response.value==1){
					var res=cas.checkAnswer(this.ui.answer[0].value,this.model.get('answer'),this.model.get("answer_type"));
					if(this.IsTest)
						res.msg="Answer Submitted";
					var msg=UI.infoBox(res.msg,null,function()
						{
							this.autofocus();
						}.bind(this));
					
					if(this.MaxAttempts && res.submit==true)
					{
						this.attempts= this.attempts || 0;
						this.attempts++;
						
						if(this.attempts>1 && !this.options.NoHint)
							this.ui.hint[0].attributes.style.value='';
						if(this.attempts<this.MaxAttempts)
							res.submit=false;
					}

					if(res.submit || res.result)
						this.submit(res)
					MathJax.Hub.Queue(['Typeset',MathJax.Hub]);				

				}else{
					this.autofocus();
				}
			}.bind(this));
			//console.log("Rerender math...")
			MathJax.Hub.Queue(['Typeset',MathJax.Hub]);
		},
		
		startTimer:function()
		{
			this.timer=new Date().valueOf();
		},
		
		submit:function(res)
		{
			this.RequiresUpdate=true;
			//console.log('submit clicked');
			var stop=new Date().valueOf();
			var result=0;
			if(res.result)
				result=1;
			var module_id=this.model.get('module_id');
			var total_time;
			if(this.timer)
				total_time=stop-this.timer;
			
			//Lock out further input
			this.options.NoSolution=false;
			this.options.NoButtons=true;
			
			var results=
				{
					time:total_time,
					question_id:this.model.get("id"),
					result:result,
					seed:this.model.get('seed'),
					type:"practice",
					student_id:'',//To be filled in by server
					response:this.ui.answer.val(),
					question:this.model.get('title'),
					
				}
			
			results.csrf=CSRF;
			
			/*
			//Not actually saving results
			$.ajax({
					type:"POST",
					url:'/submit/result',
					data:results,
					success:function(){	
						this.submitted=true;
						this.getResults(this.render);
//						this.model.render();
						//console.log("Its good when these things work as planned");
						localStorage.setItem("/Question/"+this.model.id,"false");
						}.bind(this),
					error:function(err){
						UI.infoBox("There appears to have been an error in saving your result!! I am so sorry! Please pass this on to Mr. Person-Rennell and refresh your page (that usually fixes the problem until he can figure out exactly why this is happening!)<br>"+err);
//						console.log(err);
					}
					});
				*/
			this.render();
			//console.log(results);
		},
		
		toggleKeyBoard:function(){
			this.NoKeyBoard=!this.NoKeyBoard;
			this.options.NoKeyBoard=this.NoKeyBoard;
			this.checkIpad();
			this.render();
		},
		
		checkIpad:function(){
			
			if(navigator.userAgent.search("iPad")>-1 && !this.NoKeyBoard)
				this.options.iPad=true;
		
		},
		
		initialize:function(args,options){
			options=options || {};
			//Allow for fine grain control of what buttons can or cannot be displayed by the view in a given circumstance.
			this.options.NoButtons=options.NoButtons || false;
			this.options.NoHint=options.NoHint || false;
			this.options.NoCalculator=options.NoCalculator || false;
			this.options.NoSolutionButton=options.NoSolutionButton || false;
			this.options.NoNewValues=options.NoNewValues || false;
			this.options.NoScore=options.NoScore || false;
			this.options.NoSimilarQuestion=options.NoSimilarQuestion || false;
			this.options.NoSolution=true;
			this.options.NoGiveUp=true;
			this.options.NoAnswer=false;
			this.RequiresUpdate=true;
			this.options.Attempts=0;
			this.listenTo(this.model,"parsed",this.render);
			
			this.options.NoKeyBoard=options.NoKeyBoard || false;
			this.NoKeyBoard=this.options.NoKeyBoard;
			this.options.Score=0;
			this.options.iPad=false;
			this.MaxAttempts=options.MaxAttempts;
			this.IsTest=options.IsTest || false;
			this.options.IsTest=this.IsTest;
			this.options.Remaining=0;
			this.checkIpad();
			this.options.Response='';
			this.options.ReviewMode=options.ReviewMode || false;	
			//if(this.model.Question)
			//	this.render();
			
			this.input="";
			
			//this.getResults();
			//this.model.render();
		},
		

	});
	
	collections.Questions=Backbone.Collection.extend({

		
		model:models.question,
		initialize:function(model,options)
		{
			options=options || {};
			options.url=options.url || this.url;
			
			this.url=options.url

		},
		url:'/model/Question',
		
	});

	views.EditQuestion=Marionette.ItemView.extend({
		//model:Question,
		template:'#edit_question_template',
		
		ui:
		{
			question:'#question',
			graph_data:'#graph_data',
			image_links:'#image_links',
			header:'#header',
			description:'#description',
			video_links:'#video_links',
			title:'#title',
			solution:'#solution',
			delete:'#delete_question',
			answer:"#answer",
			placeholder:'#placeholder',
			answer_type:'#answer_type',
			hint:'#hint',
			render:'#render',
		
		},
		
		templateHelpers:function(){
				return {
					content:this.model.get('question'),
					title:this.model.get('title'),
					description:this.model.get('description'),
					graph_data:this.model.get('graph_data'),
					image_links:this.model.get('image_links'),
					video_links:this.model.get('video_links'),
					header:this.model.get('header'),
					placeholder:this.model.get('placeholder'),
					answer_type:this.model.get('answer_type'),
					solution:this.model.get('solution'),
				};
		},
		
		events:{
			'click #save':'save',
			'click #delete_slide':'delete',
			'click #render':'reroll',
		},
		
		reroll:function()
		{
			
			//this.model.render();
		},
		
		save:function()
		{

//			//console.log(this.ui.question);
			_.each(this.ui,function(el){

				if(!el) return;
				if(!el[0]) return;
//				//console.log(el[0].id)
//				//console.log(this.model.has(el[0].id))
				if(this.model.has(el[0].id))
				{
					this.model.set(el[0].id,el[0].value,{silent:true});
				}
			}.bind(this));

			this.model.save(null,{
					error:function(err,result){
						console.log(err,result);
					},
					success:function()
					{
						console.log("Question Saved!");
						this.model.trigger("parsed");
						MathJax.Hub.Queue(['Typeset',MathJax.Hub]);	
						//this.model.render();
					}.bind(this)});
			

		},
		
		delete:function()
		{
			this.model.destroy();
			
		},
		
		initialize:function()
		{
			this.listenTo(this.model,'render',this.render);
		},
	});
	
	var noview=Marionette.ItemView.extend({
		template:false,
	});
	
	views.Composite=CView.extend({
		template:'#composite_view_template',
		childView:views.QView,
		childViewContainer: '#content',
		
		ui:{
			back:'#back',
			next:'#next',
			preview_content:'#preview_content',
			progress_bar:'#progress_bar',
		},
		
		events:{
			'click #back':'back',
			'click #next':'next',
			'click .circle':'jump',
		},
		
		
		initialize:function(args,options){
			options=options || {};
			this.options=options;
			this.listenTo(this.collection,'change',this.render);
			this.length=this.collection.length;
			this.listenTo(this,"show:child",this.update);
			this.listenTo(this,"show",this.update);
		},
		
		update:function()
		{
			if(!this.collection.at(this.current))return;
			var progress=$("<div class='p_bar row fourteen columns'></div>");
			for(var i =0; i<this.current;i++)
			{
				progress.append($("<div class='black circle one columns' value='"+i+"'>"+(i+1)+"</div>"));
			}
				progress.append($("<div class='white circle one columns' value='"+this.current+"'>"+(this.current+1)+"</div>"));
			for(var i=this.current+1; i<this.collection.length;i++)
			{
				progress.append($("<div class='green circle one columns' value='"+i+"'>"+(i+1)+"</div>"));
			}
			//this.ui.progress_bar.html((this.current+1)+"/"+this.collection.length);		
			this.ui.progress_bar.empty()
			this.ui.progress_bar.append(progress);

			if(this.currentView().onShow)
				this.currentView().onShow();
		},
	
	
		jump:function(e)
		{

			var el=e.target;
			var val= el.attributes.value.value;
//			alert(val);
			this.setCurrent(el.attributes.value.value*1);
		},
		
		onRender:function(){
			this.length=this.collection.length;
		},

	});
	
	var Edit=views.Composite.extend({
		template:'#something',
		childView:views.EditQuestion,		
		events:{},
	});
	
	//Provides a Preview and an Editable Question View
	views.EditCollection=function(collection,options)
	{
		var options=options || {};
		var preview=new views.Composite({collection:collection},options);
		var edit=new Edit({collection:collection},options);

		edit.listenTo(preview,"change",function(){
			this.setCurrent(preview.current);
			preview.currentView().startTimer();
			preview.currentView().MaxAttempts=options.MaxAttempts || 3;
		});
		
		//preview.currentView().startTimer();
		//console.log(preview,edit)
		return {
			preview:preview,
			edit:edit,
		}
	}	
/*
	var qc=new collections.Questions()


//	qc.on("loaded",qc.randomize);
//	qc.getByModules([1]);
	qc.getById(20);
	var r=new Marionette.Region({el:'#preview'});
	var region=new Marionette.Region({el:"#main_content"});
	
	var test=views.EditCollection(qc);
	region.show(test.preview);
	r.show(test.edit);
	//Example of how to get a question from the DB.
	/*
	var q=new Question({id:17});
	q.fetch({success:function(model)
		{
			//console.log("Success");
		}
	});
	
	var qv=new QView({model:q});
	//console.log(qv);
	
	//console.log(q)


	//Example of how to create a new question and save it to the DB.
	var q2=new Question({
		name:"Another test question",
		header:"{{parse 'x1=randInt(-100,100)' ''}}",
		question:"What is the product of 9 and {{parse 'x1'}}?",
		answer:"{{parse '9*x1'}}",
		solution:"One way to answer this is to add {{parse 'x1'}} 9 times. Remember that product means multiplication",
		answer_type:'number',
		author:'2',
		hint:"multiply",
		placeholder:"Type an integer like -1, 0, 1, 2,.."
	});
	
	//console.log("Saving New Question...");
	q2.save(null,{wait:true,
		error:function(){
			//console.log("Error");
		},
		success:function(model, res){
			//console.log(model)
			//console.log(res);
			//console.log(q2)
			//console.log("SUCCESS!")
		}
	});
	*/
	return {
		models:models,
		collections:collections,
		views:views
		};
});