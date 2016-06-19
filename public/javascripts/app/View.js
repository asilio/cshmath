// Backbone.View
  // -------------

  // Backbone Views are almost more convention than they are actual code. A View
  // is simply a JavaScript object that represents a logical chunk of UI in the
  // DOM. This might be a single item, an entire list, a sidebar or panel, or
  // even the surrounding frame which wraps your whole app. Defining a chunk of
  // UI as a **View** allows you to define your DOM events declaratively, without
  // having to worry about render order ... and makes it easy for the view to
  // react to specific changes in the state of your models.

define("View",function(require){
	
	var _ = require("underscore");
	var $ = require("jquery");
	var ui = require("jquery_ui");
	var Obj = require("Object");
	var hbs = require("hbs");
	var sync = require("sync");
	var ajax = sync.ajax;
	
	var View = function(options) {
		this.cid = _.uniqueId('view');
		this.events ={
			"input change" : 'updateModel'
		};
		
		_.extend(this, _.pick(options, viewOptions));
		this._ensureElement();

		//Set the template using the model.type()
		//Then cache the template for rapid templating.
		if(this.model.type)
			var source = $("#template_for_"+this.model.type()).html();
		else
			var source = undefined;
		this.template = hbs.compile(source);
		this.display="view";
		this.initialize.apply(this, arguments);
		this.__update__=false;
		this._waiting_for_response=false;
		this.listenTo(this.model,'change',this.saveModel);
		this.name = this.model.name;
		if(this.mediator==undefined){
			this.mediator = this.model.mediator;
		}
		this.trigger_count = 0;
	};
	
	// Cached regex to split keys for `delegate`.
	var delegateEventSplitter = /^(\S+)\s*(.*)$/;

	// List of view options to be set as properties.
	var viewOptions = ['model', 'collection', 'el', 'id', 'attributes', 'className', 'tagName', 'events'];
	
	var inherit = {
		// The default `tagName` of a View's element is `"div"`.
		tagName: 'div',

		// jQuery delegate for element lookup, scoped to DOM elements within the
		// current view. This should be preferred to global lookups where possible.
		$: function(selector) {
			return this.$el.find(selector);
		},

		// Initialize is an empty function by default. Override it with your own
		// initialization logic.
		initialize: function(){},

		// **render** is the core function that your view should override, in order
		// to populate its element (`this.el`), with the appropriate HTML. The
		// convention is for **render** to always return `this`.
		render: function() {
			this.$el.html(this.template(this.model.attributes));
			this.setElement(this.el);
			//Set the display
			this.updateView();
			return this;
		},

		// Remove this view by taking the element out of the DOM, and removing any
		// applicable Backbone.Events listeners.
		remove: function() {
			this._removeElement();
			this.stopListening();
			return this;
		},

		// Remove this view's element from the document and all event listeners
		// attached to it. Exposed for subclasses using an alternative DOM
		// manipulation API.
		_removeElement: function() {
			this.$el.remove();
		},

		// Change the view's element (`this.el` property) and re-delegate the
		// view's events on the new element.
		setElement: function(element) {
			this.undelegateEvents();
			this._setElement(element);
			this.delegateEvents();
			return this;
		},

		// Creates the `this.el` and `this.$el` references for this view using the
		// given `el`. `el` can be a CSS selector or an HTML string, a jQuery
		// context or an element. Subclasses can override this to utilize an
		// alternative DOM manipulation API and are only required to set the
		// `this.el` property.
		_setElement: function(el) {
			this.$el = el instanceof $ ? el : $(el);
			this.el = this.$el[0];
		},

		// Set callbacks, where `this.events` is a hash of
		//
		// *{"event selector": "callback"}*
		//
		//     {
		//       'mousedown .title':  'edit',
		//       'click .button':     'save',
		//       'click .open':       function(e) { ... }
		//     }
		//
		// pairs. Callbacks will be bound to the view, with `this` set properly.
		// Uses event delegation for efficiency.
		// Omitting the selector binds the event to `this.el`.
		delegateEvents: function(events) {
			events || (events = _.result(this, 'events'));
			if (!events) return this;
			this.undelegateEvents();
			for (var key in events) {
				var method = events[key];
				if (!_.isFunction(method)) method = this[method];
					if (!method) continue;
				var match = key.match(delegateEventSplitter);
				this.delegate(match[1], match[2], _.bind(method, this));
			}
			return this;
		},

		// Add a single event listener to the view's element (or a child element
		// using `selector`). This only works for delegate-able events: not `focus`,
		// `blur`, and not `change`, `submit`, and `reset` in Internet Explorer.
		delegate: function(eventName, selector, listener) {
			this.$el.on(eventName + '.delegateEvents' + this.cid, selector, listener);
			return this;
		},

		// Clears all callbacks previously bound to the view by `delegateEvents`.
		// You usually don't need to use this, but may wish to if you have multiple
		// Backbone views attached to the same DOM element.
		undelegateEvents: function() {
			if (this.$el) this.$el.off('.delegateEvents' + this.cid);
			return this;
		},

		// A finer-grained `undelegateEvents` for removing a single delegated event.
		// `selector` and `listener` are both optional.
		undelegate: function(eventName, selector, listener) {
			this.$el.off(eventName + '.delegateEvents' + this.cid, selector, listener);
			return this;
		},

		// Produces a DOM element to be assigned to your view. Exposed for
		// subclasses using an alternative DOM manipulation API.
		_createElement: function(tagName) {
			return document.createElement(tagName);
		},

		// Ensure that the View has a DOM element to render into.
		// If `this.el` is a string, pass it through `$()`, take the first
		// matching element, and re-assign it to `el`. Otherwise, create
		// an element from the `id`, `className` and `tagName` properties.
		_ensureElement: function() {
			if (!this.el) {
				var attrs = _.extend({}, _.result(this, 'attributes'));
				if (this.id) attrs.id = _.result(this, 'id');
				if (this.className) attrs['class'] = _.result(this, 'className');
				this.setElement(this._createElement(_.result(this, 'tagName')));
				this._setAttributes(attrs);
			} else {
				this.setElement(_.result(this, 'el'));
			}
		},

		// Set attributes from a hash on this view's element.  Exposed for
		// subclasses using an alternative DOM manipulation API.
		_setAttributes: function(attributes) {
			this.$el.attr(attributes);
		},
		
		show:function(){
			this.$el.show();
			return this;
		},
		
		hide:function(){
			this.$el.hide();
			return this;
		},
		
		toggle:function(){
			this.$el.toggle();
			return this;
		},
		
		show_sub_view:function(){
			this.$("sub_view").show();
		},
		
		hide_sub_view:function(){
			this.$("sub_view").hide();
		},
		
		toggle_sub_view:function(){
			this.$("sub_view").toggle();
		},
		
		set_display:function(d){
			//There are only 3 displays available, print, edit, and view.
			console.log(d);	
			if(d!="print" && d!="edit" && d!="view" && d!="list")
				d='view';
			if(d == this.display) return;
			
			this.display=d;
			this.updateView();
		},
		
		updateView:function(){
			var views = [".view",".edit",".print","list"];
			this.$(".view").hide();
			this.$(".edit").hide();
			this.$(".print").hide();
			this.$(".list").hide();
			this.$(".edit").css("z-index",100);
			
			/* Event logic. This is custom designed to take advantage of the templates built by rib on the server*/
			/*****Editing Logic******/

			this.$('.__delete__').off().click(function(e){
				this.mediator.trigger("delete:"+this.name,{source_id:e.target.id});
			}.bind(this));

			this.$(".__edit__").click(function(){
				this.set_display("edit");
			}.bind(this));

			this.$('.view').draggable({
				revert:true,
			});
			this.$('.view').droppable({
				drop:function(event,ui){				
					this.mediator.trigger("insert_after:"+this.name,{source_id:ui.draggable.attr("id"),target_id:$(event.target).attr("id")})
				}.bind(this)
			});

			this.$('.view').click(function(){

				this.mediator.trigger("select:"+this.name,{id:this.model.get("id"),el:this.$('.view')});
				this.$('.view').focus();


			}.bind(this));

			this.$('.list').mouseover(function(){
				this.$('.full').show("fold");
			}.bind(this)).mouseout(function(){
				this.$('.full').removeAttr("style").fadeOut();
			}.bind(this));


			this.$('.view').dblclick(function(){
				this.set_display("edit");
			}.bind(this));
			
			_.each(this.model.attributes,function(val,key,model){
				var inid = "input#"+key;

				this.$(inid).on("input change",function(e){
					this.updateModel(e.target);
				}.bind(this));
				
				var inid = "textarea#"+key;
				this.$(inid).on("input change",function(e){
					this.updateModel(e.target);
				}.bind(this));
				
				var inid = "select#"+key;
				this.$(inid).on("input change",function(e){
					this.updateModel(e.target);
				}.bind(this));

			}.bind(this));
			
			this.$('.__done__').click(function(){				
				this.set_display("view");
				this.saveModel();
				this.render();
			}.bind(this))
			
			this.$('.noactionpost').submit(function(e){
				return noaction(e,"POST");
			});
	
			this.$('.noactionupdate').submit(function(e){
				return noaction(e,"PUT");
			});	
			
			/* Display the appropriate element*/
			this.$("."+this.display).show();
			this.trigger("view:ready");
		},
		
		updateModel:function(el){
			console.log(el.id,el.value);
			this.model.set(el.id,el.value);
		},
		
		saveModel:function(){
			//console.log("Saving...")
			//console.log(this._waiting_for_response);
			//console.log(this.model.changedAttributes());
			this.updateView();
			if(this._waiting_for_response || !this.model.changedAttributes()){
				 return;
			}
			
			this._waiting_for_response = true;
			
			this.model.save(null,{
				success:function(e,r){
					this._waiting_for_response = false;
				//	console.log("Saved!");
				}.bind(this),
				error:function(e,r){
				//	console.log("Error!");
					console.log(e);
				}.bind(this)
			});
		},
	};
	
	
	function noaction(e,type){
		var attrs=e.currentTarget.attributes;
	
		var data=$(e.currentTarget).serializeArray();
		var url;
		if(attrs.action)
			url=attrs.action.value;
		var redirect;
	
		if(attrs.redirect)
			redirect=e.currentTarget.attributes.redirect.value;
		var reload=false;
		if(attrs.reload)
			reload=true;
	
		var msg="Done!";
		if(attrs.msg)
			msg=attrs.msg.value;
	
		ajax({
			method:type,
			url:url,
			data:data,
		}).done(function(result){
			//required to update the on page stuff.
			if(reload)
				location.reload();
			 $( "#msg" ).text( msg ).show().fadeOut( 3000 );
			 if(redirect!="back")
				setTimeout(function(){location.replace(redirect);},5000);
			else
				setTimeout(function(){history.back()},5000);
		});
		return false;
	}
	
	var module = Obj.new(View,inherit);
	
	return module;
});