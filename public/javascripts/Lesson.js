//Lesson
define(function(require){
	var Backbone=require('backbone');
	var Marionette=require('marionette');

	var mathjs=require('mathjs');

	var math=mathjs;
	var $=require('jquery');

	require('MathJax');

	var Graph=require('Graph');

	var Random=require('Random');
	var math_template=Random.math_template;
	var parser=Random.parser;
	
	var Question=require('Question');
	$.event.props.push('dataTransfer');
	
	var CView=require('CView');
	var dataTransfer={};
	
	var Lesson_Module=Backbone.Model.extend({
		urlRoot:'/db/Lesson_Module',
		defaults:{
			id:null,
			lesson_id:null,
			module_id:null,
		},
	});
	
	var LMs=Backbone.Collection.extend({
		model:Lesson_Module,
		//Load API:
		/*
			Expects an options hash. 
			options.where == string description of how to load the modules
			options.error == to be called from the Ajax on an error
			options.success == to be called from the Ajax on success
			
			options.where and options.is --> Both must be defined, can be used as a simple search
			
			//Lesson Attributes:
				id
				title
				description
				module_ids // DEPRECATED
				prerequisites
				subject_area
				
		//Load Events
			triggers "change" and "reset". Preferentially, listeners should listen to "change"
		*/
		load:function(options)
		{
			options = options || {};
			
			var ajax_args={
						url:"/db/all/Lesson_Module",
						error:options.error,
						success:function(data, response){
							
							//Overwrite any existing models and bulk add
							//This method will fire a SINGLE "reset" event at the end
							this.reset(data);
							
							//Most of the listeners will be listening for a 'change' event, so
							//we manually fire one here, just in case. Note that listeners
							//should not listen to both "reset" and "change".
							this.trigger("change");
							
							//Call the callback.
							options.success();
						},
					};
			
			if(options.where!="all" && options.is)
				ajax_args.url=ajax_args.url+"/"+options.where+"/"+options.is;
			
			$.ajax(ajax_args);		
		},
	});
	
	var Lesson=Backbone.Model.extend({
		defaults:{
			title:'',
			description:'',
			subject:'',
			rank:'',
		},
	});
	
	var Lessons=Backbone.Collection.extend({
		model:Lesson,
		url:'/model/Lesson'
	});
	
	var LessonView=Marionette.ItemView.extend({
		template:'#lessons_template',
		initialize:function()
		{
			this.listenTo(this.collection,'all',this.render)
		},
	});
	
	var LView=Marionette.ItemView.extend({
		template:'#lview',
		el:'<div class="row">',
		initialize:function(options)
		{
			this.options=options
		},
		templateHelpers:function()
		{
			if(this.options.module_id==-1)
				this.options.no_delete=true;
			else
				this.options.no_delete=false;
			return this.options;
		}
	});
	
	var LessonRowView=Marionette.CollectionView.extend({
		childView:LView,
		el:'<div class="sixteen columns container" style="background:white"><h2>Lessons</h2>',
		initialize:function()
		{
			this.listenTo(this.collection,"all",this.render);
		},
	
	});
	
	var Lesson_Slide=Backbone.Model.extend({
	
		defaults:{
			content:'Content',
			graph_data:'',
			image_links:'',
			video_links:'',
			description:'',
			title:'Untitled',
			header:'',
			rank:'',
			csrf:CSRF,
		},

		parse:function(response,options)
		{
			var options=options || {};
			var response=response || {};

			var commands=this.get('header').split(';');
			var seed=options.seed || new Date().valueOf()*mathjs.randInt(1,1000);
			mathjs.setSeed(seed);
			_.each(commands,function(command){
				parser.eval(command);
			});
			
			this.Content=math_template(this.get('content')).contents;
			this.set('Content',math_template(this.get('content')).contents,{silent:true});
			this.Graph_Data=math_template(this.get('graph_data')).contents;
			this.set('Graph_Data',math_template(this.get('graph_data')).contents,{silent:true});
			if(!options.silent)
				this.trigger("parsed");
			if(this.cid)
				this.set('cid',this.cid);
			return response;
		},
		
		validate:function(attr,opts)
		{
			//this.parse();
			this.unset("cid",{silent:true});
			this.unset('Graph_Data',{silent:true});
			this.unset('Content',{silent:true});

		},
		
		initialize:function()
		{
			console.log(this.url());
			this.listenTo(this,'change',function(){
				this.parse();}.bind(this));
			this.set("cid",this.cid);
			//this.fetch();
		},
	});
	
	var SlideShow=Backbone.Collection.extend({
		model:Lesson_Slide,
		
		url:'/model/Slide',
		
		initialize:function(){
			console.log(this.url);
		},
		
		comparator:function(slide)
		{
			return slide.get('rank');
		},
		
		
		changeorder:function()
		{
			this.sort();
		},
		
		currentSlide:function(id)
		{
			if(!this.first()) return false;
			this.current=this.current || this.first().get('id') || this.first().cid;
			var temp=this.current;

			if(id)
				this.current=id;
			if(!this.current)
			{
				this.current=this.first().get('id');
			}

			if(this.current!=temp)
				this.trigger("change");
			return this.get(this.current);
		},
		
		changeOrder:function(slide,order)
		{
			if(typeof slide == 'number' || typeof slide=="string")
				slide=this.get(slide);
			if(slide == undefined) return;
			

			var slides=this.slidesGreaterThan(order);
			_.each(slides,function(s){
				s.set('order',s.get('order')*1+1);
			});
			
			slide.set('order',order+1);
			this.sort();
			var c=1;
			this.each(function(slide){
				slide.set('order',c++);
				slide.save();
				slide.set('cid',slide.cid);
			});

//			this.trigger("rerender");
			this.trigger('change');
		},
		
		swapOrder:function(left,right)
		{
			var temp=left.get('order');
			left.set('order',right.get('order'));
			right.set('order',temp);
			return;
		},
		
		slidesGreaterThan:function(order)
		{

			return this.filter(function(slide){
				return 1*slide.get('order')>order*1;
			});
		},
		
		lastOrder:function(){
			return this.last().get('order');
		},
		
	});
	
	var SV=Marionette.ItemView.extend({
		template:"#edit_slideshow_template",
		ui:
		{
			new_slide:'#new_slide',
			content:'#content',
			graph_data:'#graph_data',
			image_links:'#image_links',
			header:'#header',
			description:'#description',
			video_links:'#video_links',
			order:'#order',
			title:'#title',
			delete:'#delete_slide',
			lesson_title:'#lesson_title',
			lesson_description:'#lesson_description',
		
		},
		/*
		onRender:function(){
		//	MathJax.Hub.Queue(['Typeset',MathJax.Hub,this.el]);
		//	MathJax.Hub.Queue(['Typeset',MathJax.Hub]);
		},*/
		events:{
			'click #new_slide':'newSlide',
			'click #save':'saveSlide',
			'click #delete_slide':'deleteSlide'
		},
		
		saveSlide:function(options)
		{
			console.log(this.model);
			options=options || {};
			
			var success=options.success || function(){};
			var error=options.success || function(){};
			
			_.each(this.ui,function(el){
				if(!el) return;
				if(!el[0]) return;
				if(this.model.has(el[0].id))
				{
					this.model.set(el[0].id,el[0].value);
				}
			}.bind(this));
						
			if(this.model.isNew)
				this.model.save();
			else
				this.model.save();
			
		},
		
		initialize:function(args,options)
		{
			options=options || {};
			this.options.lessonTitle=options.lessonTitle;
			this.options.lessonDescription=options.lessonDescription;
			
			this.listenTo(this.model,'all',this.render);
			//this.listenTo(this.collection,'all',this.render);
		},
		
		deleteSlide:function()
		{
			this.model.destroy();
		},
		
		templateHelpers:function(){
			return this.options;
		},
	})
	
	var EV=Question.views.Composite.extend({
		template:'#composite_edit_slide',
		childView:SV,
		childContainer:'#content',
		
		ui:{
			back:'#back',
			next:'#next',
			preview_content:'#preview_content',
			progress_bar:'#progress_bar',
			lesson_title:'#lesson_title',
			lesson_description:'#lesson_description',
		},

		events:{
			'click #new_slide':'new_slide',
			'click #update_lesson':'update_lesson',
			'click #back':'back',
			'click #next':'next',
			'click .circle':'jump',
			'click #delete_slide':'delete_slide',
		},
		templateHelpers:function()
		{
			var options={
				lessonTitle:this.collection.Lesson.get("title"),
				lessonDescription:this.collection.Lesson.get("description"),
			};
			
			return options;
		},
		
		update_lesson:function(){
			var les=this.collection.Lesson;

			les.set("title",this.ui.lesson_title[0].value);
			les.set("description",this.ui.lesson_description[0].value);
			les.save(null,{success:function(){
				this.ui.lesson_title.focus();
			}});
		},
		
		new_slide:function()
		{
			var s=this.collection.add({title:"New Slide",lesson_id:this.collection.Lesson.get("id"),order:this.collection.length});

			s.save();
		},
		
		delete_slide:function()
		{
			var model=this.currentModel();
			if(this.current>0)
			{
				this.setCurrent(this.current-1);
				model.destroy();
			}
			else if(this.current<this.collection.length)
			{
				this.setCurrent(this.current+1)
				model.destroy();
			}
			
		},
		
	});

	var lv=Marionette.ItemView.extend({
		template:'#slide_show_template',
		ui:{
			graph:"#graph",
		},
		templateHelpers:function(){
			var currentSlide=this.model;
			if(currentSlide)
				return {
					content:currentSlide.Content,
					graph:currentSlide.Graph_Data,
					image:currentSlide.get('image_links'),
					description:currentSlide.get('description'),
					video:currentSlide.get('video_links'),
					header:currentSlide.get('header'),
					title:currentSlide.get('title'),
					cid:currentSlide.cid,
					score:'',
				
				};
			return {					
					currentContent:"",
					currentGraph:"",
					currentImage:"",
					currentDescription:"",
					currentVideo:"",
					currentHeader:"",
					currentTitle:"",
					score:''
			}
		},
		
		onRender:function(){
			if(this.model.get('Graph_Data'))
				{
					var g= new Graph(null,{
										classes:["lesson_graph"],
										keepaspectratio:true,
										construct:this.model.get('Graph_Data')});
					g.render();
					this.ui.graph.append(g.el);
				}
			},
		initialize:function()
		{
			this.listenTo(this.model,'all',this.render);
		},
	});
	

	var VSS=Question.views.Composite.extend({
		template:'#composite_view_template',
		childView:lv,
		childContainer:'#content',
		initialize:function()
		{
			this.collection.each(function(model){
				this.collection.listenTo(model,"change:order",this.sort.bind(this));
			}.bind(this));
//			Question.views.Composite.initialize.apply(this);
			
			this.listenTo(this.collection,'change',this.render);
			this.length=this.collection.length;
			this.listenTo(this,"show:child",this.update);
			this.listenTo(this,"show",this.update);
		},
		
		sort:function()
		{
			this.collection.sort();
			this.setCurrent(0);
		},
		
	});
	
	var ViewSlideShow=Marionette.ItemView.extend({
		template:'#view_lesson_template',
		
		ui:{
			back:'#back',
			next:'#next',
			graph:'#graph',
		},
		
		events:{
			'click #back':'back',
			'click #next':'next'
		},
		
		templateHelpers:function(){
			var currentSlide=this.collection.currentSlide();
			if(currentSlide)
				return {
					content:currentSlide.Content,
					graph:currentSlide.Graph_Data,
					image:currentSlide.get('image_links'),
					description:currentSlide.get('description'),
					video:currentSlide.get('video_links'),
					header:currentSlide.get('header'),
					title:currentSlide.get('title'),
					cid:currentSlide.cid,
					score:'',
					progress:currentSlide.get('order')+"/"+this.collection.lastOrder(),
				};
			return {					
					currentContent:"",
					currentGraph:"",
					currentImage:"",
					currentDescription:"",
					currentVideo:"",
					currentHeader:"",
					currentTitle:"",
					score:''
				
			}
		},
		render:function()
		{
			if(this.collection.length==0)return;
			
			Marionette.ItemView.prototype.render.apply(this);
		},		
		next:function()
		{
			var t=this.collection.slidesGreaterThan(this.collection.currentSlide().get("order"));
			if(t.length>0)
				this.collection.currentSlide(t[0].cid);
			this.trigger("render");
		},
		
		back:function()
		{
			var s=this.collection.currentSlide().get("order")*1-2;
			//if(s<=0) return;
			
			var t=this.collection.slidesGreaterThan(s);
			if(t.length>0)
				this.collection.currentSlide(t[0].cid);
				
			this.trigger('render');
		},
		
		initialize:function()
		{
			
			this.listenTo(this.collection,'change',this.render);
			this.listenTo(this.collection,'preview:ready',this.render);
			this.listenTo(this.collection,'add',this.render);
			//this.render();
		},
		
		onRender:function()
		{
			//Wait for the Dom element to fully render and then rerender the math.
			MathJax.Hub.Queue(['Typeset',MathJax.Hub,this.el]);
			
			if(this.collection.currentSlide().get('Graph_Data'))
			{
				var g= new Graph(null,{
									classes:["lesson_graph"],
									keepaspectratio:true,
									construct:this.collection.currentSlide().get('Graph_Data')});
				g.render();
				this.ui.graph.append(g.el);
			}

		}
	});
	
	var exports={
		models:{
			Lesson:Lesson,
			Lesson_Slide:Lesson_Slide,},
		collections:{
			SlideShow:SlideShow,
			Lessons:Lessons},
		views:{
			EditSlideShow:EV,
			ViewSlideShow:VSS,
			LessonView:LessonView,
			LessonRowView:LessonRowView,
		},
	}
	
	return exports;
});