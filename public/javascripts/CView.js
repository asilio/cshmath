define(function(require){

	//This modified ItemView is intended to be an ABSTRACT CLASS
	/*										
	
	CView provides a simple way of displaying a --single-- collection item at a time
	This differs from Marionette's builtin CollectionView because the intention here
	is that the model's views are all rendered but held, whereas CollectionView routinely
	recreates and destroys the views. For me, I need each view to remain static and available
	because much of the content of the view is randomly generated, so recreating the view
	destroys information that would could not be retrieved.
	
	-------Requirements-------
	When extending, you will need to instantiate:
	childView--A Marionette.View (or above) 
	childViewContainer--The JQuery element identifier which will contain the view
	collection--Must initialize with a collection passed in
	
	-------Provides-----------
	render: Overwrites default render() method to allow for the single view at a time
	current: An integer tracking the model currently in view (the integer is the index within collection)
	next: Method that advances current appropriately checking for out of bounds conditions.
	back: Method that moves current down appropriately checking for out of bounds conditions
	
	-------Events-------------
	"change"---Triggered whenenver next() or back() results in incrementing or decrementing current.
	
	-------Other Thoughts-----
	This behaves just like an ItemView in all other regards, so ui, events, etc can all be attached as per normal
	I strongly suggest tying two ui elements to the next() and back() function allowing for navigation
	through the collection's model views.
	The elements are detached using the JQuery detach() method to preserve any content.
	*/
	var Backbone=require('backbone');
	var Marionette=require('marionette');
	var CView=Marionette.ItemView.extend({
		render:function()
		{
			//Call the default render
			Marionette.ItemView.prototype.render.apply(this);
			if(!this.collectionRendered)
			{
				if(this.collection.length==0)return;
				
				//console.log("Rendering The Model Views")
				this.childrenViews=[];
				for(var i=0;i<this.collection.length;i++)
				{
					this.childrenViews.push(new this.childView({model:this.collection.at(i)},this.options));
					this.childrenViews[i].render();
					//this.childrenViews[i].listenTo(this.collection.at(i),'all',this.render);
				}
				
				this.current=this.current || 0;
				this.childContainerRegion=this.$(this.childViewContainer);
				this.collectionRendered=true;
				
				this.listenTo(this.collection,"change",function()
				{
					
				//	console.log("Need to rerender because the collection has changed")
					this.collectionRendered=false;
					this.stopListening(this.collection,"change");
					this.stopListening(this,"show");
					this.stopListening(this,'change');
					
					//for(var i=0;i<this.childrenViews.length;i++)
					//	this.childrenViews[i].stopListening();
					this.render();
				});
				
				this.listenTo(this,"show",function(){
					this.show();
//					this.childContainerRegion.append(this.childrenViews[this.current].el);
					
				});
				
				this.listenTo(this,'change',function()
				{
					if(!this.collectionRendered)
						return this.render();
					
					this.show();
//					this.childContainerRegion.append(this.childrenViews[this.current].el);
				});
				
				this.trigger("change");
			}else{
				this.show();		
			}
			
		},
		
		show:function()
		{
		
			this.childContainerRegion.append(this.childrenViews[this.current].el);
			if(this.childrenViews[this.current].autofocus)
				this.childrenViews[this.current].autofocus();
			this.trigger("show:child");
		},
		
		setCurrent:function(index)
		{
			if(index==this.current);
			if(!this.collection.at(index))return;
			if(!this.collection.at(this.current))return;
			this.currentView().$el.detach();
			this.current=index;
			this.trigger('change');
		},
		
		next:function(){
			var t=this.current;
			if(this.current<this.collection.length-1)
				this.current++;
			if(t==this.current)
				return;
				
			this.childrenViews[t].$el.detach();
			this.trigger("change");
			//this.render();
		},
		
		back:function(){
		
			var t=this.current;
			if(this.current>0)
				this.current--;
			if(t==this.current)
				return;
			

			this.childrenViews[t].$el.detach();
			this.trigger("change");
			//this.render();
		},
		
		currentView:function()
		{
			return this.childrenViews[this.current];
		},
		
		currentModel:function()
		{
			return this.collection.at(this.current);
		},
	});
	
	return CView;
});