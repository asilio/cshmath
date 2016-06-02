//     Backbone.js 1.2.1

//     (c) 2010-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Backbone may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://backbonejs.org

define("Backbone",function(require){
	var _ = require("underscore");
	var sync=require("sync");
	var ajax = sync.ajax;
	var module={}, models={};
	var Model=require("Model");
	var Models=require("Models");
	var View = require("View");
	var Collection = require("Collection");
	
	var Backbone={};
	Backbone.Model = Model;
	Backbone.View  = View;
	Backbone.Collection=Collection;
	return Backbone;	
});