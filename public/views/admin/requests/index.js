/* global app:true */

(function() {
  'use strict';

  app = app || {};

  app.Record = Backbone.Model.extend({
    idAttribute: 'id',
    defaults: {
      id: undefined,
      name: '',
      address: '',
      assigned_rc_region: '',
      city: '',
      state: '',
      zip: '',
      phone: '',
      email: '', 
      selected_county: ''
    },
    url: function() {
      return '/admin/requests/'+ (this.isNew() ? '' : this.id +'/');
    }
  });

  app.RecordCollection = Backbone.Collection.extend({
    model: app.Record,
    url: '/admin/requests/',
    parse: function(results) {
      app.pagingView.model.set({
        pages: results.pages,
        items: results.items
      });
      app.filterView.model.set(results.filters);
      return results.data;
    }
  });

  app.Filter = Backbone.Model.extend({
    defaults: {
      search: '',
      sort: '',
      limit: '',
      startDate: '',
      endDate: '',
      region: ''
    }
  });

  app.Paging = Backbone.Model.extend({
    defaults: {
      pages: {},
      items: {}
    }
  });

  app.HeaderView = Backbone.View.extend({
    el: '#header',
    template: _.template( $('#tmpl-header').html() ),
    events: {
      'submit form': 'preventSubmit',
      'keypress input[type="text"]': 'addNewOnEnter',
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
    preventSubmit: function(event) {
      event.preventDefault();
    },
    addNewOnEnter: function(event) {
      if (event.keyCode !== 13) { return; }
      event.preventDefault();
      this.addNew();
    },
    addNew: function() {
      if (this.$el.find('[name="name"]').val() === '') {
        alert('Please enter a name.');
      }
      else {
        this.model.save({
          'name.full': this.$el.find('[name="name"]').val()
        },{
          success: function(model, response) {
            if (response.success) {
              model.id = response.record.id;
              location.href = model.url();
            }
            else {
              alert(response.errors.join('\n'));
            }
          }
        });
      }
    }
  });

  app.ResultsView = Backbone.View.extend({
    el: '#results-table',
    template: _.template( $('#tmpl-results-table').html() ),
    initialize: function() {
      this.collection = new app.RecordCollection( app.mainView.results.data );
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
        'change input.status_updater': 'postNewStatus'
    },
    viewDetails: function() {
      location.href = this.model.url();
    },
      postNewStatus: function (ev) {
          // need to post the new status away to the db
          var status = null;
          if ($(ev.currentTarget).prop("checked") == true) {
              status = 'installed';
          }
          else {
              status = 'new';
          }
          this.model.save({status: status,
                           _csrf: $('#csrf_token').val()
                          }, {
              success: function (model, response, options) {
                  console.log("DEBUG: saved status successfully");
              },
              error: function (model, xhr, options) {
                  console.log("DEBUG: error saving status");
                  console.log(xhr.responseText);
              }
          });
          },
      render: function() {
          this.$el.html(this.template( this.model.attributes ));
          var row = this.$el.html(this.template( this.model.attributes));
          // check the checkboxes of the ones that have been installed
          if (this.model.attributes.status == 'installed') {
              $(row).find("input[type=checkbox]").prop("checked", true);
          }
          this.$el.find('.name').each(function(index, indexValue) {
          });
          return this;
    }
  });

  app.FilterView = Backbone.View.extend({
    el: '#filters',
    template: _.template( $('#tmpl-filters').html() ),
    events: {
      'submit form': 'preventSubmit',
      // 'keypress input[type="text"]': 'filterOnEnter',
      // 'change select': 'filter',
      'click input#applyFilters': 'filter',
      'click input#clearFilters': 'clearFilter'
    },
    endpointDates: {
      'earliest': new Date(2000, 1, 1),
      'latest': moment().toDate(),
      'yearRange': '2000:nnnn'
    },
    initialize: function() {
      this.model = new app.Filter( app.mainView.results.filters);
      this.listenTo(this.model, 'change', this.render);
      this.render();
      this.initializeFormElements();
    },
    initializeFormElements: function() {
      $("#filters form")[0].reset();
      // Form elements of type="hidden" don't get cleared by "reset", so
      // clear them manually.
      $(".datepickerWrapper input[type='hidden']").val('');
    },
    render: function() {
      this.$el.html(this.template( this.model.attributes ));
      for (var key in this.model.attributes) {
        if (this.model.attributes.hasOwnProperty(key)) {
          var el = this.$el.find('[name="'+ key +'"]');
          el.val(this.model.attributes[key]);
          if (key === "startDate" || key === "endDate") {
            if (this.model.attributes[key] != "") {
              var date = moment.utc(this.model.attributes[key]);
              if (date > this.endpointDates.earliest && date <= this.endpointDates.latest) {
                el.val(date.format("YYYY-MM-DD"));
                el.siblings(".pickedDate").text(date.format("YYYY-MM-DD"));
                continue;
              }
            }
            el.val("");
            el.siblings(".pickedDate").text("no date selected");
          }
        }
      }
      $(".datepickerTrigger").datepicker({
          buttonImage: "/third-party/Farm-Fresh_calendar_view_month.png",
          buttonImageOnly: true,
          changeMonth: true,
          changeYear: true,
          dateFormat: "yy-mm-dd",
          minDate: this.endpointDates.earliest,
          maxDate: this.endpointDates.latest,
          showOn: 'both',
          yearRange: this.endpointDates.yearRange,
          onSelect: this.onSelect
      });
    },
    preventSubmit: function(event) {
      event.preventDefault();
    },
    filterOnEnter: function(event) {
      if (event.keyCode !== 13) { return; }
      this.filter();
    },
    filter: function() {
      var query = $('#filters form').serialize();
      Backbone.history.navigate('q/'+ query, { trigger: true });
    },
    clearFilter: function () {
      Backbone.history.navigate('', { trigger: true });
    },
    onSelect: function(dateText) {
      // $(this) is the (hidden) input field to which the datepicker is attached.
      if ($(this).prop("name") == "startDate") {
          var startDate = new Date(dateText);
          var endDate = new Date($("input.form-control[name='endDate']").val());
      }
      else {  // We assume this is the "endDate" field
          var startDate = new Date($("input.form-control[name='startDate']").val());
          var endDate = new Date(dateText);
      }
      // Make sure startDate is not later than endDate.
      if (startDate >= endDate) {
          alert("The start date must be earlier than the end date.");
      }
      else {
        // put the selected date into the field for filtering
        $(this).val(dateText);
        // Also display the selected date so the user can see it.
        $(this).siblings(".pickedDate").text(dateText);
      }
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
      this.results = JSON.parse( unescape($('#data-results').html()) );
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
