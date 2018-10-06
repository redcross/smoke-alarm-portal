/* global app:true */

(function() {
  'use strict';

  app = app || {};

  app.User = Backbone.Model.extend({
    idAttribute: 'id',
    url: function() {
      return '/admin/users/'+ this.id +'/';
    }
  });

  app.Delete = Backbone.Model.extend({
    idAttribute: '_id',
    defaults: {
      success: false,
      errors: [],
      errfor: {}
    },
    url: function() {
      return '/admin/users/'+ app.mainView.model.id +'/';
    }
  });

  app.Identity = Backbone.Model.extend({
    idAttribute: '_id',
    defaults: {
      success: false,
      errors: [],
      errfor: {},
      siteAdmin: false,
      username: '',
      email: ''
    },
    url: function() {
      return '/admin/users/'+ app.mainView.model.id +'/';
    },
    parse: function(response) {
      if (response.user) {
        app.mainView.model.set(response.user);
        delete response.user;
      }

      return response;
    }
  });

  app.Roles = Backbone.Model.extend({
    idAttribute: '_id',
    defaults: {
      success: false,
      errors: [],
      errfor: {},
      newAccountId: '',
      newAdminId: ''
    },
    url: function() {
      return '/admin/users/'+ app.mainView.model.id +'/';
    },
    parse: function(response) {
      if (response.user) {
        app.mainView.model.set(response.user);
        delete response.user;
      }

      return response;
    }
  });

  app.Region = Backbone.Model.extend({
    idAttribute: '_id',
    defaults: {
      success: false
    },
    url: function() {
      return '/admin/users/'+ app.mainView.model.id +'/regions/';
    }
  });

  app.Regions = Backbone.Collection.extend({ });

  app.Password = Backbone.Model.extend({
    idAttribute: '_id',
    defaults: {
      success: false,
      errors: [],
      errfor: {},
      newPassword: '',
      confirm: ''
    },
    url: function() {
      return '/admin/users/'+ app.mainView.model.id +'/password/';
    },
    parse: function(response) {
      if (response.user) {
        app.mainView.model.set(response.user);
        delete response.user;
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

  app.IdentityView = Backbone.View.extend({
    el: '#identity',
    template: _.template( $('#tmpl-identity').html() ),
    events: {
      'click .btn-update': 'update'
    },
    initialize: function() {
      this.model = new app.Identity();
      this.syncUp();
      this.listenTo(app.mainView.model, 'change', this.syncUp);
      this.listenTo(this.model, 'sync', this.render);
      this.render();
    },
    syncUp: function() {
      this.model.set({
        _id: app.mainView.model.id,
        siteAdmin: app.mainView.model.get('siteAdmin'),
        username: app.mainView.model.get('username'),
        email: app.mainView.model.get('email')
      });
    },
    render: function() {
      this.$el.html(this.template( this.model.attributes ));

      this.$el.find('[name="siteAdmin"]').prop('checked', this.model.attributes['siteAdmin']);
      this.$el.find('[name="username"]').val(this.model.attributes['username']);
      this.$el.find('[name="email"]').val(this.model.attributes['email']);
    },
    update: function() {
      this.model.save({
        siteAdmin: this.$el.find('[name="siteAdmin"]').prop("checked"),
        username: this.$el.find('[name="username"]').val(),
        email: this.$el.find('[name="email"]').val()
      });
    }
  });


  app.RegionView = Backbone.View.extend({
    el: '#regions',
    template: _.template( $('#tmpl-region').html() ),
    events: {
      'click .btn-regions': 'regions'
    },
    initialize: function() {
      app.mainView.model.activeRegions.forEach(function(activeRegion) {
        activeRegion.enabled = false;
        app.mainView.model.enabledRegions.forEach(function(enabledRegion) {
          if(enabledRegion.rc_region == activeRegion.rc_region) {
            activeRegion.enabled = true;
          }
        });
      });
      this.model = new app.Region({
        _id: app.mainView.model.id,
        regions: new app.Regions(app.mainView.model.activeRegions)
      });
      this.listenTo(this.model, 'sync', this.render);
      this.render();
    },
    render: function() {
      this.$el.html(this.template(this.model.attributes));
      var container = this.$el.find("#region-rows");

      this.model.attributes['regions'].each(function(region) {
        var view = new app.RegionRowView({ model: region });
        container.append(view.render().el);
      });
      return this;
    },
    regions: function() {
      this.model.save();
    }
  });

  app.RegionRowView = Backbone.View.extend({
    tagName: 'div',
    template:  _.template( $('#tmpl-region-row').html() ),
    events: {
      'click input': 'update'
    },
    render: function() {
      this.$el.html(this.template(this.model.attributes));
      this.$el.find('input').prop('checked', this.model.attributes.enabled);
      return this;
    },
    update: function() {
      this.model.attributes.enabled = this.$el.find('input').prop('checked');
    }
  });

  app.PasswordView = Backbone.View.extend({
    el: '#password',
    template: _.template( $('#tmpl-password').html() ),
    events: {
      'click .btn-password': 'password'
    },
    initialize: function() {
      this.model = new app.Password({ _id: app.mainView.model.id });
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
    password: function() {
      this.model.save({
        newPassword: this.$el.find('[name="newPassword"]').val(),
        confirm: this.$el.find('[name="confirm"]').val()
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
              location.href = '/admin/users/';
            }
            else {
              app.deleteView.model.set(response);
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
      this.model = new app.User( JSON.parse( unescape($('#data-record').html())) );

      this.model.activeRegions = JSON.parse( unescape($('#data-active-regions').html()));
      this.model.enabledRegions = JSON.parse( unescape($('#data-enabled-regions').html()));

      app.headerView = new app.HeaderView();
      app.identityView = new app.IdentityView();
      app.regionView = new app.RegionView();
      app.passwordView = new app.PasswordView();
      app.deleteView = new app.DeleteView();
    }
  });

  $(document).ready(function() {
    app.mainView = new app.MainView();
  });
}());
