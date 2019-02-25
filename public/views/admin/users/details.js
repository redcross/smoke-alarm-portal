/* global app:true */

(function() {
  'use strict';

  app = app || {};

  app.User = Backbone.Model.extend({
    idAttribute: 'id',
    defaults: {
      success: false,
      errors: [],
      errfor: {},
      siteAdmin: false,
      isActive: true,
      username: '',
      name: '',
      email: '',
      newPassword: '',
      confirm: '',
      activeRegions: []
    },
    url: function() {
      return '/admin/users/' + (this.isNew() ? '' : this.id + '/');
    },
    parse: function(response) {
      if (response.user) {
        app.mainView.model.set(response.user);
        delete response.user;
      }

      return response;
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

  app.Regions = Backbone.Collection.extend({ });

  app.HeaderView = Backbone.View.extend({
    el: '#header',
    template: _.template( $('#tmpl-header').html() ),
    initialize: function() {
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
      'change': 'update'
    },
    initialize: function() {
      this.listenTo(this.model, 'sync', this.render);
      this.render();
    },
    render: function() {
      this.$el.html(this.template( this.model.attributes ));

      if(this.model.attributes['siteAdmin']) {
        this.$el.find('.siteAdmin').prop('checked', true);
      } else {
        this.$el.find('.regularAdmin').prop('checked', true);
      }
      if(this.model.attributes['isActive']) {
        this.$el.find('.active').prop('checked', true);
      } else {
        this.$el.find('.inactive').prop('checked', true);
      }
      this.$el.find('[name="username"]').val(this.model.attributes['username']);
      this.$el.find('[name="name"]').val(this.model.attributes['name']);
      this.$el.find('[name="email"]').val(this.model.attributes['email']);
    },
    update: function() {
      this.model.set({
        siteAdmin: this.$el.find('input.siteAdmin').prop("checked"),
        isActive: this.$el.find('input.active').prop("checked"),
        username: this.$el.find('[name="username"]').val(),
        name: this.$el.find('[name="name"]').val(),
        email: this.$el.find('[name="email"]').val()
      });
    }
  });

  app.RegionView = Backbone.View.extend({
    el: '#regions',
    template: _.template( $('#tmpl-region').html() ),
    initialize: function() {
      var model = this.model
      model.activeRegions.forEach(function(activeRegion) {
        activeRegion.enabled = false;
        model.enabledRegions.forEach(function(enabledRegion) {
          if(enabledRegion.rc_region == activeRegion.rc_region) {
            activeRegion.enabled = true;
            activeRegion.contact = enabledRegion.regionPermission.contact;
          }
        });
      });

      this.model.set({activeRegions: model.activeRegions});
      this.render();
    },
    render: function() {
      this.$el.html(this.template(this.model.attributes));
      var container = this.$el.find("#region-rows");

      this.model.activeRegions.forEach(function(region) {
        var view = new app.RegionRowView({ model: region });
        container.append(view.render().el);
      });
      return this;
    }
  });

  app.RegionRowView = Backbone.View.extend({
    tagName: 'tr',
    className: 'regionRow',
    template:  _.template( $('#tmpl-region-row').html() ),
    events: {
      'change': 'update',
      'click [name="view"]': 'enableContact'
    },
    render: function() {
      this.$el.html(this.template(this.model));
      this.$el.find('input[name="view"]').prop('checked', this.model.enabled);
      this.$el.find('input[name="contact"]').prop('checked', this.model.contact);
      this.$el.find('input[name="contact"]').prop('disabled', !this.model.enabled);
      return this;
    },
    update: function() {
      this.model.enabled = this.$el.find('input[name="view"]').prop('checked');
      this.model.contact = this.$el.find('input[name="contact"]').prop('checked');
    },
    enableContact: function() {
      if(this.$el.find('input[name="view"]').prop('checked')) {
         this.$el.find('input[name="contact"]').prop('disabled', false);
      } else {
         this.$el.find('input[name="contact"]').prop('disabled', true);
         this.$el.find('input[name="contact"]').prop('checked', false);
         this.model.attributes.contact = false;
      }
    }
  });

  app.PasswordView = Backbone.View.extend({
    el: '#password',
    template: _.template( $('#tmpl-password').html() ),
    events: {
      'change': 'update'
    },
    initialize: function() {
      this.listenTo(this.model, 'sync', this.render);
      this.render();
    },
    render: function() {
      this.$el.html(this.template( this.model.attributes ));
    },
    update: function() {
      this.model.set({
        newPassword: this.$el.find('[name="newPassword"]').val(),
        confirm: this.$el.find('[name="confirm"]').val()
      });
    }
  });

  app.UpdateView = Backbone.View.extend({
    el: '#update',
    template: _.template( $('#tmpl-update').html() ),
    events: {
      'click .btn-update': 'update',
    },
    initialize: function() {
      this.listenTo(this.model, 'sync', this.render);
      this.render();
    },
    render: function() {
      this.model.set('action', this.model.isNew() ? 'Add' : 'Update');
      this.$el.html(this.template( this.model.attributes ));
    },
    update: function() {
      this.model.save({}, {
        success: function(model, response) {
          if(response.success) {
            location.href = '/admin/users/';
          }
        }
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
      if(!app.mainView.model.isNew()) {
        this.model = new app.Delete({ _id: app.mainView.model.id });
        this.listenTo(this.model, 'sync', this.render);
        this.render();
      }
    },
    render: function() {
      this.$el.html(this.template( this.model.attributes ));
    },
    delete: function() {
      var confirmationMessage = "Are you sure you want to delete admin " +
        app.mainView.model.attributes.username + "?\n\n" +
        "Deleting a admin is irreversible and may leave uncompleted requests in limbo " +
        "if there are no other admins enabled for those regions.";
      if (confirm(confirmationMessage)) {
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
    events: {
      'click .btn-update': 'update'
    },
    initialize: function() {
      app.mainView = this;
      this.model = new app.User( JSON.parse( unescape($('#data-record').html())) );

      this.model.activeRegions = JSON.parse( unescape($('#data-active-regions').html()));
      this.model.enabledRegions = JSON.parse( unescape($('#data-enabled-regions').html()));

      app.headerView = new app.HeaderView({model: this.model});
      app.identityView = new app.IdentityView({model: this.model});
      app.passwordView = new app.PasswordView({model: this.model});
      app.regionView = new app.RegionView({model: this.model});
      app.deleteView = new app.UpdateView({model: this.model});
      app.deleteView = new app.DeleteView();
    }
  });

  $(document).ready(function() {
    app.mainView = new app.MainView();
  });
}());
