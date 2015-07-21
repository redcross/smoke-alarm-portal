/* global app:true */

(function() {
  'use strict';

  app = app || {};

  app.Request = Backbone.Model.extend({
    idAttribute: 'id',
    url: function() {
      return '/admin/requests/'+ this.id +'/';
    }
  });

  app.Delete = Backbone.Model.extend({
    idAttribute: 'id',
    defaults: {
      success: false,
      errors: [],
      errfor: {}
    },
    url: function() {
      return '/admin/requests/'+ app.mainView.model.id +'/';
    }
  });

  app.Details = Backbone.Model.extend({
    idAttribute: 'id',
    defaults: {
      success: false,
      errors: [],
      errfor: {},
      name: '',
      address: '',
      address_2: '',
      city: '',
      state: '',
      zip: ''
    },
    url: function() {
      return '/admin/requests/'+ app.mainView.model.id +'/';
    },
    parse: function(response) {
      if (response.request) {
        app.mainView.model.set(response.request);
        delete response.request;
      }

      return response;
    }
  });

  app.Login = Backbone.Model.extend({
    idAttribute: 'id',
    defaults: {
      success: false,
      errors: [],
      errfor: {},
      id: '',
      name: '',
      newUsername: ''
    },
    url: function() {
      return '/admin/requests/'+ app.mainView.model.id +'/user/';
    },
    parse: function(response) {
      if (response.request) {
        app.mainView.model.set(response.request);
        delete response.request;
      }

      return response;
    }
  });


  app.HeaderView = Backbone.View.extend({
    el: '#header',
    template: _.template( $('#tmpl-header').html() ),
    initialize: function() {
      this.model = app.mainView.model;
      this.listenTo(this.model, 'change', this.render);
      this.render();
    },
    render: function() {
      this.$el.html(this.template( this.model.attributes ));
    }
  });

  app.DetailsView = Backbone.View.extend({
    el: '#details',
    template: _.template( $('#tmpl-details').html() ),
    events: {
      'click .btn-update': 'update'
    },
    initialize: function() {
      this.model = new app.Details();
      this.syncUp();
      this.listenTo(app.mainView.model, 'change', this.syncUp);
      this.listenTo(this.model, 'sync', this.render);
      this.render();
    },
    syncUp: function() {
      this.model.set({
        id: app.mainView.model.id,
        name: app.mainView.model.get('name'),
        address: app.mainView.model.get('address'),
        address_2: app.mainView.model.get('address_2'),
        city: app.mainView.model.get('city'),
        state: app.mainView.model.get('state'),
        zip: app.mainView.model.get('zip')
      });
    },
    render: function() {
      this.$el.html(this.template( this.model.attributes ));

      for (var key in this.model.attributes) {
        if (this.model.attributes.hasOwnProperty(key)) {
          this.$el.find('[name="'+ key +'"]').val(this.model.attributes[key]);
        }
      }
    },
    update: function() {
      this.model.save({
        name: this.$el.find('[name="name"]').val(),
        address: this.$el.find('[name="address"]').val(),
        address_2: this.$el.find('[name="address_2"]').val(),
        city: this.$el.find('[name="city"]').val(),
        state: this.$el.find('[name="state"]').val(),
        zip: this.$el.find('[name="zip"]').val()
      });
    }
  });

  app.DeleteView = Backbone.View.extend({
    el: '#delete',
    template: _.template( $('#tmpl-delete').html() ),
    events: {
      'click .btn-delete': 'delete',
    },
    initialize: function() {
      this.model = new app.Delete({ _id: app.mainView.model.id });
      this.listenTo(this.model, 'sync', this.render);
      this.render();
    },
    render: function() {
      this.$el.html(this.template( this.model.attributes ));
    },
    delete: function() {
      if (confirm('Are you sure?')) {
        this.model.destroy({
          success: function(model, response) {
            if (response.success) {
              location.href = '/admin/requests/';
            }
            else {
              app.deleteView.model.set(response);
            }
          }
        });
      }
    }
  });

  app.LoginView = Backbone.View.extend({
    el: '#login',
    template: _.template( $('#tmpl-login').html() ),
    events: {
      'click .btn-user-open': 'userOpen',
      'click .btn-user-link': 'userLink',
      'click .btn-user-unlink': 'userUnlink'
    },
    initialize: function() {
      this.model = new app.Login();
      this.syncUp();
      this.listenTo(app.mainView.model, 'change', this.syncUp);
      this.listenTo(this.model, 'sync', this.render);
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
    userOpen: function() {
      location.href = '/admin/users/'+ this.model.get('id') +'/';
    },
    userLink: function() {
      this.model.save({
        newUsername: $('[name="newUsername"]').val()
      });
    },
    userUnlink: function() {
      if (confirm('Are you sure?')) {
        this.model.destroy({
          success: function(model, response) {
            if (response.request) {
              app.mainView.model.set(response.request);
              delete response.request;
            }

            app.loginView.model.set(response);
          }
        });
      }
    }
  });

  app.NewNoteView = Backbone.View.extend({
    el: '#notes-new',
    template: _.template( $('#tmpl-notes-new').html() ),
    events: {
      'click .btn-add': 'addNew'
    },
    initialize: function() {
      this.model = new app.Note();
      this.listenTo(this.model, 'change', this.render);
      this.render();
    },
    render: function() {
      this.$el.html( this.template(this.model.attributes) );
    },
    validates: function() {
      var errors = [];
      if (this.$el.find('[name="data"]').val() === '') {
        errors.push('Please enter some notes.');
      }

      if (errors.length > 0) {
        this.model.set({ errors: errors });
        return false;
      }

      return true;
    },
    addNew: function() {
      if (this.validates()) {
        this.model.save({
          data: this.$el.find('[name="data"]').val()
        });
      }
    }
  });

  app.NoteCollectionView = Backbone.View.extend({
    el: '#notes-collection',
    template: _.template( $('#tmpl-notes-collection').html() ),
    initialize: function() {
      this.collection = new app.NoteCollection();
      this.syncUp();
      this.listenTo(app.mainView.model, 'change', this.syncUp);
      this.listenTo(this.collection, 'reset', this.render);
      this.render();
    },
    syncUp: function() {
      this.collection.reset(app.mainView.model.get('notes'));
    },
    render: function() {
      this.$el.html(this.template());

      var frag = document.createDocumentFragment();
      var last = document.createTextNode('');
      frag.appendChild(last);
      this.collection.each(function(model) {
        var view = new app.NotesItemView({ model: model });
        var newEl = view.render().el;
        frag.insertBefore(newEl, last);
        last = newEl;
      }, this);
      $('#notes-items').append(frag);

      if (this.collection.length === 0) {
        $('#notes-items').append( $('#tmpl-notes-none').html() );
      }
    }
  });

  app.NotesItemView = Backbone.View.extend({
    tagName: 'div',
    className: 'note',
    template: _.template( $('#tmpl-notes-item').html() ),
    render: function() {
      this.$el.html( this.template(this.model.attributes) );

      this.$el.find('.timeago').each(function(index, indexValue) {
        if (indexValue.innerText) {
          var myMoment = moment(indexValue.innerText);
          indexValue.innerText = myMoment.from();
        }
      });
      return this;
    }
  });

  app.NewStatusView = Backbone.View.extend({
    el: '#status-new',
    template: _.template( $('#tmpl-status-new').html() ),
    events: {
      'click .btn-add': 'addNew'
    },
    initialize: function() {
      this.model = new app.Status();
      this.syncUp();
      this.listenTo(app.mainView.model, 'change', this.syncUp);
      this.listenTo(this.model, 'change', this.render);
      this.render();
    },
    syncUp: function() {
      this.model.set({
        id: app.mainView.model.get('status').id,
        name: app.mainView.model.get('status').name
      });
    },
    render: function() {
      this.$el.html( this.template(this.model.attributes) );

      if (app.mainView.model.get('status') && app.mainView.model.get('status').id) {
        this.$el.find('[name="status"]').val(app.mainView.model.get('status').id);
      }
    },
    validates: function() {
      var errors = [];
      if (this.$el.find('[name="status"]').val() === '') {
        errors.push('Please choose a status.');
      }

      if (this.$el.find('[name="status"]').val() === app.mainView.model.get('status').id) {
        errors.push('That is the current status.');
      }

      if (errors.length > 0) {
        this.model.set({ errors: errors });
        return false;
      }

      return true;
    },
    addNew: function() {
      if (this.validates()) {
        this.model.save({
          id: this.$el.find('[name="status"]').val(),
          name: this.$el.find('[name="status"] option:selected').text()
        });
      }
    }
  });

  app.StatusCollectionView = Backbone.View.extend({
    el: '#status-collection',
    template: _.template( $('#tmpl-status-collection').html() ),
    initialize: function() {
      this.collection = new app.StatusCollection();
      this.syncUp();
      this.listenTo(app.mainView.model, 'change', this.syncUp);
      this.listenTo(this.collection, 'reset', this.render);
      this.render();
    },
    syncUp: function() {
      this.collection.reset(app.mainView.model.get('statusLog'));
    },
    render: function() {
      this.$el.html( this.template() );

      var frag = document.createDocumentFragment();
      var last = document.createTextNode('');
      frag.appendChild(last);
      this.collection.each(function(model) {
        var view = new app.StatusItemView({ model: model });
        var newEl = view.render().el;
        frag.insertBefore(newEl, last);
        last = newEl;
      }, this);
      $('#status-items').append(frag);
    }
  });

  app.StatusItemView = Backbone.View.extend({
    tagName: 'div',
    className: 'status',
    template: _.template( $('#tmpl-status-item').html() ),
    render: function() {
      this.$el.html( this.template(this.model.attributes) );

      this.$el.find('.timeago').each(function(index, indexValue) {
        if (indexValue.innerText) {
          var myMoment = moment(indexValue.innerText);
          indexValue.innerText = myMoment.from();
        }
      });
      return this;
    }
  });

  app.MainView = Backbone.View.extend({
    el: '.page .container',
    initialize: function() {
      app.mainView = this;
      this.model = new app.Request( JSON.parse( unescape($('#data-record').html()) ) );
      
      app.headerView = new app.HeaderView();
      app.detailsView = new app.DetailsView();
      app.deleteView = new app.DeleteView();
      app.loginView = new app.LoginView();
      app.newNoteView = new app.NewNoteView();
      app.notesCollectionView = new app.NoteCollectionView();
      app.newStatusView = new app.NewStatusView();
      app.statusCollectionView = new app.StatusCollectionView();
    }
  });

  $(document).ready(function() {
    app.mainView = new app.MainView();
  });
}());
