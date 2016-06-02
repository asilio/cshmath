// Backbone.Collection
  // -------------------

  // If models tend to represent a single row of data, a Backbone Collection is
  // more analogous to a table full of data ... or a small slice or page of that
  // table, or a collection of rows that belong together for a particular reason
  // -- all of the messages in this particular folder, all of the documents
  // belonging to this particular author, and so on. Collections maintain
  // indexes of their models, both in order, and for lookup by `id`.

  // Create a new **Collection**, perhaps to contain a specific type of `model`.
  // If a `comparator` is specified, the Collection will maintain
  // its models in sort order, as they're added and removed.
define("Collection",function(require){

	var Obj = require("Object");
	var sync = require("sync");
	var Model = require("Model");
	
	var Collection  = function(models, options) {
		options || (options = {});
		if (options.model) this.model = options.model;
		if (options.comparator !== void 0) this.comparator = options.comparator;
		this._reset();
		this.initialize.apply(this, arguments);
		if (models) this.reset(models, _.extend({silent: true}, options));
	};

	// Default options for `Collection#set`.
	var setOptions = {add: true, remove: true, merge: true};
	var addOptions = {add: true, remove: false};

	var inherit = {
		// The default model for a collection is just a **Backbone.Model**.
		// This should be overridden in most cases.
		model: Model,

		// Initialize is an empty function by default. Override it with your own
		// initialization logic.
		initialize: function(){},

		// The JSON representation of a Collection is an array of the
		// models' attributes.
		toJSON: function(options) {
			return this.map(function(model) { return model.toJSON(options); });
		},

		// Proxy `Backbone.sync` by default.
		sync: function() {
			return sync.apply(this, arguments);
		},

		// Add a model, or list of models to the set. `models` may be Backbone
		// Models or raw JavaScript objects to be converted to Models, or any
		// combination of the two.
		add: function(models, options) {
			return this.set(models, _.extend({merge: false}, options, addOptions));
		},

		// Remove a model, or a list of models from the set.
		remove: function(models, options) {
			options = _.extend({}, options);
			var singular = !_.isArray(models);
			models = singular ? [models] : _.clone(models);
			var removed = this._removeModels(models, options);
			if (!options.silent && removed) this.trigger('update', this, options);
			return singular ? removed[0] : removed;
		},

		// Update a collection by `set`-ing a new list of models, adding new ones,
		// removing models that are no longer present, and merging models that
		// already exist in the collection, as necessary. Similar to **Model#set**,
		// the core operation for updating the data contained by the collection.
		set: function(models, options) {
			options = _.defaults({}, options, setOptions);
			if (options.parse && !this._isModel(models)) models = this.parse(models, options);
			var singular = !_.isArray(models);
			models = singular ? (models ? [models] : []) : models.slice();
			var id, model, attrs, existing, sort;
			var at = options.at;
			if (at != null) at = +at;
			if (at < 0) at += this.length + 1;
			var sortable = this.comparator && (at == null) && options.sort !== false;
			var sortAttr = _.isString(this.comparator) ? this.comparator : null;
			var toAdd = [], toRemove = [], modelMap = {};
			var add = options.add, merge = options.merge, remove = options.remove;
			var order = !sortable && add && remove ? [] : false;
			var orderChanged = false;

			// Turn bare objects into model references, and prevent invalid models
			// from being added.
			for (var i = 0; i < models.length; i++) {
				attrs = models[i];

				// If a duplicate is found, prevent it from being added and
				// optionally merge it into the existing model.
				if (existing = this.get(attrs)) {
					if (remove) modelMap[existing.cid] = true;
					if (merge && attrs !== existing) {
						attrs = this._isModel(attrs) ? attrs.attributes : attrs;
						if (options.parse) attrs = existing.parse(attrs, options);
						existing.set(attrs, options);
						if (sortable && !sort && existing.hasChanged(sortAttr)) sort = true;
					}
					models[i] = existing;

				// If this is a new, valid model, push it to the `toAdd` list.
				} else if (add) {
					model = models[i] = this._prepareModel(attrs, options);
					if (!model) continue;
					toAdd.push(model);
					this._addReference(model, options);
				}

				// Do not add multiple models with the same `id`.
				model = existing || model;
				if (!model) continue;
				id = this.modelId(model.attributes);
				if (order && (model.isNew() || !modelMap[id])) {
					order.push(model);

					// Check to see if this is actually a new model at this index.
					orderChanged = orderChanged || !this.models[i] || model.cid !== this.models[i].cid;
				}

				modelMap[id] = true;
			}

			// Remove stale models.
			if (remove) {
				for (var i = 0; i < this.length; i++) {
					if (!modelMap[(model = this.models[i]).cid]) toRemove.push(model);
				}
				if (toRemove.length) this._removeModels(toRemove, options);
			}

			// See if sorting is needed, update `length` and splice in new models.
			if (toAdd.length || orderChanged) {
				if (sortable) sort = true;
				this.length += toAdd.length;
				if (at != null) {
					for (var i = 0; i < toAdd.length; i++) {
					this.models.splice(at + i, 0, toAdd[i]);
					}
				} else {
					if (order) this.models.length = 0;
					var orderedModels = order || toAdd;
					for (var i = 0; i < orderedModels.length; i++) {
						this.models.push(orderedModels[i]);
					}
				}
			}

			// Silently sort the collection if appropriate.
			if (sort) this.sort({silent: true});

			// Unless silenced, it's time to fire all appropriate add/sort events.
			if (!options.silent) {
				var addOpts = at != null ? _.clone(options) : options;
				for (var i = 0; i < toAdd.length; i++) {
					if (at != null) addOpts.index = at + i;
					(model = toAdd[i]).trigger('add', model, this, addOpts);
				}
				if (sort || orderChanged) this.trigger('sort', this, options);
				if (toAdd.length || toRemove.length) this.trigger('update', this, options);
			}

			// Return the added (or merged) model (or models).
			return singular ? models[0] : models;
		},

		// When you have more items than you want to add or remove individually,
		// you can reset the entire set with a new list of models, without firing
		// any granular `add` or `remove` events. Fires `reset` when finished.
		// Useful for bulk operations and optimizations.
		reset: function(models, options) {
			options = options ? _.clone(options) : {};
			for (var i = 0; i < this.models.length; i++) {
				this._removeReference(this.models[i], options);
			}
			options.previousModels = this.models;
			this._reset();
			models = this.add(models, _.extend({silent: true}, options));
			if (!options.silent) this.trigger('reset', this, options);
			return models;
		},

		// Add a model to the end of the collection.
		push: function(model, options) {
			return this.add(model, _.extend({at: this.length}, options));
		},

		// Remove a model from the end of the collection.
		pop: function(options) {
			var model = this.at(this.length - 1);
			return this.remove(model, options);
		},

		// Add a model to the beginning of the collection.
		unshift: function(model, options) {
			return this.add(model, _.extend({at: 0}, options));
		},

		// Remove a model from the beginning of the collection.
		shift: function(options) {
			var model = this.at(0);
			return this.remove(model, options);
		},

		// Slice out a sub-array of models from the collection.
		slice: function() {
			return slice.apply(this.models, arguments);
		},

		// Get a model from the set by id.
		get: function(obj) {
			if (obj == null) return void 0;
			var id = this.modelId(this._isModel(obj) ? obj.attributes : obj);
			return this._byId[obj] || this._byId[id] || this._byId[obj.cid];
		},

		// Get the model at the given index.
		at: function(index) {
			if (index < 0) index += this.length;
			return this.models[index];
		},

		// Return models with matching attributes. Useful for simple cases of
		// `filter`.
		where: function(attrs, first) {
			return this[first ? 'find' : 'filter'](attrs);
		},

		// Return the first model with matching attributes. Useful for simple cases
		// of `find`.
		findWhere: function(attrs) {
			return this.where(attrs, true);
		},

		// Force the collection to re-sort itself. You don't need to call this under
		// normal circumstances, as the set will maintain sort order as each item
		// is added.
		sort: function(options) {
			if (!this.comparator) throw new Error('Cannot sort a set without a comparator');
			options || (options = {});

			// Run sort based on type of `comparator`.
			if (_.isString(this.comparator) || this.comparator.length === 1) {
				this.models = this.sortBy(this.comparator, this);
			} else {
				this.models.sort(_.bind(this.comparator, this));
			}

			if (!options.silent) this.trigger('sort', this, options);
			return this;
		},

		// Pluck an attribute from each model in the collection.
		pluck: function(attr) {
			return _.invoke(this.models, 'get', attr);
		},

		// Fetch the default set of models for this collection, resetting the
		// collection when they arrive. If `reset: true` is passed, the response
		// data will be passed through the `reset` method instead of `set`.
		fetch: function(options) {
			options = _.extend({parse: true}, options);
			var success = options.success;
			var collection = this;
			options.success = function(resp) {
			var method = options.reset ? 'reset' : 'set';
			collection[method](resp, options);
			if (success) success.call(options.context, collection, resp, options);
				collection.trigger('sync', collection, resp, options);
			};
		//	wrapError(this, options);
			return this.sync('read', this, options);
		},

		// Create a new instance of a model in this collection. Add the model to the
		// collection immediately, unless `wait: true` is passed, in which case we
		// wait for the server to agree.
		create: function(model, options) {
			options = options ? _.clone(options) : {};
			var wait = options.wait;
			model = this._prepareModel(model, options);
			if (!model) return false;
			if (!wait) this.add(model, options);
			var collection = this;
			var success = options.success;
			options.success = function(model, resp, callbackOpts) {
				if (wait) collection.add(model, callbackOpts);
				if (success) success.call(callbackOpts.context, model, resp, callbackOpts);
			};
			model.save(null, options);
			return model;
		},

		// **parse** converts a response into a list of models to be added to the
		// collection. The default implementation is just to pass it through.
		parse: function(resp, options) {
			return resp;
		},

		// Create a new collection with an identical list of models as this one.
		clone: function() {
			return new this.constructor(this.models, {
				model: this.model,
				comparator: this.comparator
			});
		},

		// Define how to uniquely identify models in the collection.
		modelId: function (attrs) {
			return attrs[this.model.prototype.idAttribute || 'id'];
		},

		// Private method to reset all internal state. Called when the collection
		// is first initialized or reset.
		_reset: function() {
			this.length = 0;
			this.models = [];
			this._byId  = {};
		},

		// Prepare a hash of attributes (or other model) to be added to this
		// collection.
		_prepareModel: function(attrs, options) {
			if (this._isModel(attrs)) {
				if (!attrs.collection) attrs.collection = this;
				return attrs;
			}
			options = options ? _.clone(options) : {};
			options.collection = this;
			var model = new this.model(attrs, options);
			if (!model.validationError) return model;
			this.trigger('invalid', this, model.validationError, options);
			return false;
		},

		// Internal method called by both remove and set.
		_removeModels: function(models, options) {
			var removed = [];
			for (var i = 0; i < models.length; i++) {
				var model = this.get(models[i]);
				if (!model) continue;

				var index = this.indexOf(model);
				this.models.splice(index, 1);
				this.length--;

				if (!options.silent) {
					options.index = index;
					model.trigger('remove', model, this, options);
				}

				removed.push(model);
				this._removeReference(model, options);
			}
			return removed.length ? removed : false;
		},

		// Method for checking whether an object should be considered a model for
		// the purposes of adding to the collection.
		_isModel: function (model) {
			return model instanceof Model;
		},

		// Internal method to create a model's ties to a collection.
		_addReference: function(model, options) {
			this._byId[model.cid] = model;
			var id = this.modelId(model.attributes);
			if (id != null) this._byId[id] = model;
			model.on('all', this._onModelEvent, this);
		},

		// Internal method to sever a model's ties to a collection.
		_removeReference: function(model, options) {
			delete this._byId[model.cid];
			var id = this.modelId(model.attributes);
			if (id != null) delete this._byId[id];
			if (this === model.collection) delete model.collection;
			model.off('all', this._onModelEvent, this);
		},

		// Internal method called every time a model in the set fires an event.
		// Sets need to update their indexes when models change ids. All other
		// events simply proxy through. "add" and "remove" events that originate
		// in other collections are ignored.
		_onModelEvent: function(event, model, collection, options) {
			if ((event === 'add' || event === 'remove') && collection !== this) return;
			if (event === 'destroy') this.remove(model, options);
			if (event === 'change') {
				var prevId = this.modelId(model.previousAttributes());
				var id = this.modelId(model.attributes);
				if (prevId !== id) {
					if (prevId != null) delete this._byId[prevId];
					if (id != null) this._byId[id] = model;
				}
			}
			this.trigger.apply(this, arguments);
		}
	};

	var module = Obj.new(Collection,inherit);
	// Underscore methods that we want to implement on the Collection.
	// 90% of the core usefulness of Backbone Collections is actually implemented
	// right here:
	var collectionMethods = { forEach: 3, each: 3, map: 3, collect: 3, reduce: 4,
	  foldl: 4, inject: 4, reduceRight: 4, foldr: 4, find: 3, detect: 3, filter: 3,
	  select: 3, reject: 3, every: 3, all: 3, some: 3, any: 3, include: 2,
	  contains: 2, invoke: 0, max: 3, min: 3, toArray: 1, size: 1, first: 3,
	  head: 3, take: 3, initial: 3, rest: 3, tail: 3, drop: 3, last: 3,
	  without: 0, difference: 0, indexOf: 3, shuffle: 1, lastIndexOf: 3,
	  isEmpty: 1, chain: 1, sample: 3, partition: 3, groupBy: 3, countBy: 3,
	  sortBy: 3, indexBy: 3};

	// Mix in each Underscore method as a proxy to `Collection#models`.
	Obj.addUnderscoreMethods(module, collectionMethods, 'models');
	return module;
});
