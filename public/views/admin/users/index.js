/* global app:true */

(function() {
  'use strict';

  app = app || {};

  app.Record = Backbone.Model.extend({
    idAttribute: '_id',
    defaults: {
      _id: undefined,
      username: '',
      email: '',
      siteAdmin: ''
    },
    url: function() {
      return '/admin/users/'+ (this.isNew() ? 'new' : this.id +'/');
    }
  });

  app.RecordCollection = Backbone.Collection.extend({
    model: app.Record,
    url: '/admin/users/',
    parse: function(results) {
      return results;
    }
  });

  app.Filter = Backbone.Model.extend({
    defaults: {
      username: '',
      siteAdmin: '',
      sort: '',
      limit: ''
    }
  });

  app.Paging = Backbone.Model.extend({
    defaults: {
      pages: {},
      items: {}
    }
  });

  app.HeaderView = Backbone.View.extend({
    el: '#adder',
    template: _.template( $('#tmpl-adder').html() ),
    events: {
      'click .btn-add': 'addNew'
    },
    initialize: function() {
      this.model = new app.Record();
      this.listenTo(this.model, 'change', this.render);
      this.render();
    },
    render: function() {
      this.$el.html(this.template( this.model.attributes ));
    },
    addNew: function() {
      location.href = this.model.url();
    }
  });

  app.ResultsView = Backbone.View.extend({
    el: '#results-table',
    template: _.template( $('#tmpl-results-table').html() ),
    initialize: function() {
      this.collection = new app.RecordCollection( app.mainView.results );
      this.listenTo(this.collection, 'reset', this.render);
      this.render();
    },
    render: function() {
      this.$el.html( this.template() );

      var frag = document.createDocumentFragment();
      this.collection.each(function(record) {
        var view = new app.ResultsRowView({ model: record });
        frag.appendChild(view.render().el);
      }, this);
      $('#results-rows').append(frag);

      if (this.collection.length === 0) {
        $('#results-rows').append( $('#tmpl-results-empty-row').html() );
      }
    }
  });

  app.ResultsRowView = Backbone.View.extend({
    tagName: 'tr',
    template: _.template( $('#tmpl-results-row').html() ),
    events: {
      'click .btn-details': 'viewDetails',
      'click input[name="siteAdmin"]': 'update',
      'click input[name="isActive"]': 'update'
    },
    viewDetails: function() {
      location.href = this.model.url();
    },
    initialize: function() {
      this.model.set({
        _id: this.model.attributes.id
      });
    },
    render: function() {
      this.$el.html(this.template( this.model.attributes ));
      this.$el.find('[name="siteAdmin"]').prop('checked', this.model.attributes['siteAdmin']);
      this.$el.find('[name="isActive"]').prop('checked', this.model.attributes['isActive'] == 'yes');
      return this;
    },
    update: function() {
      this.model.save({
        siteAdmin: this.$el.find('[name="siteAdmin"]').prop("checked"),
        isActive: this.$el.find('[name="isActive"]').prop("checked"),
        propertiesOnly: true
      });
    },
  });

  app.FilterView = Backbone.View.extend({
    el: '#header',
    template: _.template( $('#tmpl-header').html() ),
    events: {
      'submit form': 'preventSubmit',
      'click .btn-search': 'filter',
      'keypress input[type="text"]': 'filterOnEnter',
      'change select': 'filter'
    },
    initialize: function() {
      this.model = new app.Filter( app.mainView.results.filters );
      this.listenTo(this.model, 'change', this.render);
      this.render();
    },
    render: function() {
      this.$el.html(this.template( this.model.attributes ));

      for (var key in this.model.attributes) {
        if (this.model.attributes.hasOwnProperty(key)) {
          this.$el.find('[name="'+ key +'"]').val(this.model.attributes[key]);
        }
      }
    },
    preventSubmit: function(event) {
      event.preventDefault();
    },
    filterOnEnter: function(event) {
      if (event.keyCode !== 13) { return; }
      this.filter();
    },
    filter: function() {
      var query = $('#header form').serialize();
      Backbone.history.navigate('q/'+ query, { trigger: true });
    }
  });

  app.PagingView = Backbone.View.extend({
    el: '#results-paging',
    template: _.template( $('#tmpl-results-paging').html() ),
    events: {
      'click .btn-page': 'goToPage'
    },
    initialize: function() {
      this.model = new app.Paging({ pages: app.mainView.results.pages, items: app.mainView.results.items });
      this.listenTo(this.model, 'change', this.render);
      this.render();
    },
    render: function() {
      if (this.model.get('pages').total > 1) {
        this.$el.html(this.template( this.model.attributes ));

        if (!this.model.get('pages').hasPrev) {
          this.$el.find('.btn-prev').attr('disabled', 'disabled');
        }

        if (!this.model.get('pages').hasNext) {
          this.$el.find('.btn-next').attr('disabled', 'disabled');
        }
      }
      else {
        this.$el.empty();
      }
    },
    goToPage: function(event) {
      var query = $('#filters form').serialize() +'&page='+ $(event.target).data('page');
      Backbone.history.navigate('q/'+ query, { trigger: true });
      $('body').scrollTop(0);
    }
  });

  app.MainView = Backbone.View.extend({
    el: '.page .container',
    initialize: function() {
      app.mainView = this;
      this.results = JSON.parse( $('#data-results').html() );

      app.headerView = new app.HeaderView();
      app.resultsView = new app.ResultsView();
      app.filterView = new app.FilterView();
      app.pagingView = new app.PagingView();
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
      if (!app.firstLoad) {
        app.resultsView.collection.fetch({ reset: true });
      }

      app.firstLoad = false;
    },
    query: function(params) {
      app.resultsView.collection.fetch({ data: params, reset: true });
      app.firstLoad = false;
    }
  });

  $(document).ready(function() {
    app.firstLoad = true;
    app.router = new app.Router();
    Backbone.history.start();
  });
}());
