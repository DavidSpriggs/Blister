/* global app:true */

(function() {
	'use strict';

	app = app || {};

	app.Record = Backbone.Model.extend({
		idAttribute: '_id',
		defaults: {
			_id: undefined,
			serviceUrl: '',
			userIdColumnName: ''
		},
		url: function() {
			return '/admin/ags-settings/' + (this.isNew() ? '' : this.id + '/');
		}
	});

	app.RecordCollection = Backbone.Collection.extend({
		model: app.Record,
		url: '/admin/ags-settings/',
		parse: function(results) {
			app.pagingView.model.set({
				pages: results.pages,
				items: results.items
			});
			app.filterView.model.set(results.filters);
			return results.data;
		}
	});

	app.HeaderView = Backbone.View.extend({
		el: '#header',
		template: _.template($('#tmpl-header').html()),
		events: {
			'submit form': 'preventSubmit',
			'keypress input[type="text"]': 'addNewOnEnter',
			'click .btn-add': 'addNew'
		},
		initialize: function() {
			this.model = new app.Record();
			this.listenTo(this.model, 'sync', this.render);
			this.render();
		},
		render: function() {
			this.$el.html(this.template(this.model.attributes));
		},
		preventSubmit: function(event) {
			event.preventDefault();
		},
		addNewOnEnter: function(event) {
			if (event.keyCode !== 13) {
				return;
			}
			event.preventDefault();
			this.addNew();
		},
		addNew: function() {
			if (this.$el.find('[name="serviceUrl"]').val() === '') {
				alert('Please enter a serviceUrl.');
			} else if (this.$el.find('[name="userIdColumnName"]').val() === '') {
				alert('Please enter a userIdColumnName.');
			} else {
				this.model.save({
					serviceUrl: this.$el.find('[name="serviceUrl"]').val(),
					userIdColumnName: this.$el.find('[name="userIdColumnName"]').val()
				}, {
					success: function(model, response) {
						console.log("SUCCESS");
						if (response.success) {
							app.headerView.model.set({
								serviceUrl: '',
								userIdColumnName: ''
							});
							Backbone.history.stop();
							Backbone.history.start();
						} else {
							alert(response.errors.join('\n'));
						}
					}
				});
			}
		}
	});

	app.MainView = Backbone.View.extend({
		el: '.page .container',
		initialize: function() {
			app.mainView = this;
			// this.results = JSON.parse(unescape($('#data-results').html()));

			app.headerView = new app.HeaderView();
			// app.resultsView = new app.ResultsView();
			// app.filterView = new app.FilterView();
			// app.pagingView = new app.PagingView();
		}
	});

	app.Router = Backbone.Router.extend({
		routes: {
			'': 'default',
			'q/:params': 'query'
		},
		initialize: function() {
			app.mainView = new app.MainView();
		},
		default: function() {
			//if (!app.firstLoad) {
			// app.resultsView.collection.fetch({
			// reset: true
			// });
			// }
			app.firstLoad = false;
		},
		query: function( /*params*/ ) {
			// app.resultsView.collection.fetch({
			// data: params,
			// reset: true
			// });
			app.firstLoad = false;
		}
	});
	$(document).ready(function() {
		app.firstLoad = true;
		app.router = new app.Router();
		Backbone.history.start();
	});
}());