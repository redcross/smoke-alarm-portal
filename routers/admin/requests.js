var express = require("express");
var router = express.Router();
var _ = require("underscore");
var json2csv = require('json2csv');
var moment = require('moment');


router.get("/", function(req, res, next){
  if (_.isUndefined(req.query.page)) {
      req.query.page = 1;
  }
  if (_.isUndefined(req.query.limit)) {
      req.query.limit  = 20;
  }
  var outcome = {
      data: null,
      pages: {
          current: parseInt(req.query.page, null),
          prev: 0,
          hasPrev: false,
          next: 0,
          hasNext: false,
          total: 0
      },
      items: {
          begin: ((req.query.page * req.query.limit) - req.query.limit) + 1,
          end: req.query.page * req.query.limit,
          total: 0
      }
  };
  var countResults = function(callback) {
      var filters = getFilters();
      req.app.db.Request.count( { where: filters }).then(function(results) {
          outcome.items.total = results;
          callback(null, 'done counting');
      });
  };

  var queryRegionPresentableName = function(request) {
      var selectedRegion = request.assigned_rc_region;
      return req.app.db.activeRegion.findOne({
          where: { rc_region: selectedRegion }
      });
  };

  /* Return the list of regions from the database, except our testing region. */
  var queryAllRegions = function() {
      return req.app.db.activeRegion.findAll({
          attributes: ['rc_region', 'region_name'],
          where: {rc_region: {ne: 'rc_test_region'} },
          order: 'region_name'
      });
  };

  /* Return the list of regions that the logged-in user has access to.

     In SQL:
     SELECT * FROM "activeRegions" INNER JOIN "regionPermissions" ON
     "activeRegions"."rc_region" = "regionPermissions"."rc_region"
     WHERE "regionPermissions"."user_id" = logged_in_user_id;
  */
  var queryUsableRegions = function() {
      var loggedin_id = String(req.user.id);
      return req.app.db.activeRegion.findAll({
          attributes: ['rc_region', 'region_name'],
          include: [{ model: req.app.db.regionPermission, where: {user_id: loggedin_id } }],
          where: {rc_region: {ne: 'rc_test_region'} },
          order: 'region_name'
      });
  };

  /*
   * This function finds the difference of the array of all regions
   * and the array of regions that the user has access to.
   *
   * Takes:
   * usableRegions: array of regions that the logged-in user has
   * permission to access
   * allRegions: array of all regions in the "activeRegions" db table.
   *
   * Returns:
   * disabledRegions: array of the regions that the logged-in user is
   * forbidden to access (purely for UI display)
   */
  var getForbiddenRegions = function(usableRegions, allRegions) {
      var disabledRegions = {};
      // first disable all regions
      allRegions.forEach( function (region) {
          disabledRegions[region.rc_region] = region.region_name;
      });
      usableRegions.forEach( function (allowed_region) {
          // Re-enable the regions that the user is allowed to access
          if (disabledRegions.hasOwnProperty(allowed_region.rc_region)) {
              delete disabledRegions[allowed_region.rc_region];
          }
      });
      return disabledRegions;
  };

  var getFilters = function() {
      var filters = {};
      req.query.search = req.query.search ? req.query.search : '';
      req.query.limit = req.query.limit ? parseInt(req.query.limit, null) : 20;
      req.query.page = req.query.page ? parseInt(req.query.page, null) : 1;
      req.query.sort = req.query.sort ? req.query.sort : '-createdAt';
      req.query.offset = (req.query.page - 1) * req.query.limit;
      req.query.startDate = (req.query.startDate) ? moment(req.query.startDate): '';
      req.query.endDate = (req.query.endDate) ? moment(req.query.endDate) : '';
      req.query.format = (req.query.format) ? req.query.format : 'json';

      if (req.query.startDate != '' && req.query.endDate != '') {
          filters.createdAt = {
              $between:[req.query.startDate.format(), req.query.endDate.format()]
          };
      }
      else {
          if (req.query.startDate != '') {
              filters.createdAt = {
                  gte:req.query.startDate.format()
              };
          }
          else if (req.query.endDate != '') {
              filters.createdAt = {
                  lte:req.query.endDate.format()
              };
          }
          
      }
      if (req.query.status && req.query.status != 'all') {
          filters.status = req.query.status;
      }
      if (req.query.search) {
          filters.name = {
              $ilike: '%' + req.query.search + '%'
          };
      }

      if (req.query.region) {
          filters.assigned_rc_region = req.query.region
      }
      return filters;
  };

  var getResults = function(callback) {
      var filters = getFilters();
      return queryUsableRegions().then( function (usableRegions) {
          // find intersection of allowed and filtered regions and set
          // that as our filter
          var entered_regions = filters.assigned_rc_region;
          filters.assigned_rc_region = [];
          var allowed_regions = [];
          usableRegions.forEach( function (region) {
              allowed_regions.push(region.rc_region);
          });
          // if they are allowed to see any regions and have filtered on a region
          if (allowed_regions.length > 0 && entered_regions) {
              // check if they're allowed to filter on that region
              var i = 0;
              entered_regions.forEach( function (filteredRegion) {
                  // TODO: does indexOf work in all browsers?
                  if (allowed_regions.indexOf(filteredRegion) < 0) {
                      // pop the disallowed region from the filter
                      entered_regions.splice(i, 1);
                  }
                  i++;
              });
              // what if they tried to filter on all regions that they don't have access to?
              // get no results.
              filters.assigned_rc_region = entered_regions;
          }
          // if they are allowed to see some regions and haven't
          // filtered, show them all the results they're allowed to
          // see
          else if (allowed_regions.length > 0 && ! entered_regions) {
              filters.assigned_rc_region = allowed_regions;
          }
          else {
              // TODO: then they don't have access to any regions and
              // should not get any results.
              //
              // how do I do that?
              filters.assigned_rc_region = [];
          }
          // TODO: how do I show requests that aren't linked to a
          // region (for full-powered admins)?

      // Determine direction for order
      var sortOrder = (req.query.sort[0] === '-')? 'DESC' : 'ASC';
      var limit;
      var offset;
      if (req.query.format == 'csv') {
          limit = null;
          offset = null;
      }
      else {
          limit = req.query.limit;
          offset = req.query.offset;
      }

      // Determine whether to filter by date
      req.app.db.Request.findAll({
          limit: limit,
          offset: offset,
          where: filters,
          order: [[req.query.sort.replace('-',''), sortOrder ]]
      }).reduce( function(previousValue, request, index, results) {
          return queryRegionPresentableName(request).then(
              function (displayName) {
                  if (displayName) {
                      request.assigned_rc_region = displayName.region_name;
                  }
                  if (previousValue[0]) {
                      // if this is not the first call of this
                      // anonymous function
                      previousValue.push(request);
                  }
                  else {
                      previousValue = [request];
                  }
                  return previousValue;
              });
      }, []).then( function (results_array) {
          outcome.data = results_array;
          outcome.pages.total = Math.ceil(outcome.items.total / req.query.limit);
          outcome.pages.next = ((outcome.pages.current + 1) > outcome.pages.total ? 0 : outcome.pages.current + 1);
          outcome.pages.hasNext = (outcome.pages.next !== 0);
          outcome.pages.prev = outcome.pages.current - 1;
          outcome.pages.hasPrev = (outcome.pages.prev !== 0);
          if (outcome.items.end > outcome.items.total) {
              outcome.items.end = outcome.items.total;
          }

          outcome.results = results_array;
          return callback(null, 'done');
      })
      .catch(function(err) {
          console.log("ERROR calling callback: " + err);
          return callback(err, null);
      });
      });
  };

  var createCSV = function() {
      var requestFieldNames = ['id','name','address','city','state','zip','phone','email','date created','region'];
      var requestFields = ['serial','name','address','city','state','zip','phone','email','createdAt','assigned_rc_region'];
      json2csv({ data: outcome.results, fields: requestFields, fieldNames: requestFieldNames }, function(err, csv) {
          if (err) console.log("ERROR: error converting to CSV" + err);
          res.setHeader('Content-Type','application/csv');
          res.setHeader('Content-Disposition','attachment; filename=smoke-alarm-requests-' + moment().format() + '.csv;');
          res.send(csv);
      });
  }

  var asyncFinally = function(err, results) {
      if (err) {
          return next(err);
      }

      // TODO: This section has duplicated logic which can be removed
      // For some reason, after using a filter, Backbone treats all links 
      // as XHR requests, even if they're not. This works around the 
      // issue for now, but should be fixed moving forward
      outcome.filters = req.query;
      if (req.xhr) {
          if (req.query.format !== "csv") {
              res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
              res.send(outcome);
          } else {
              createCSV();
          }
      } else {
          return queryUsableRegions().then( function (regions) {
              //get list of all regions
              return queryAllRegions().then( function (allRegions) {
                  var disabledRegions = getForbiddenRegions(regions, allRegions);
                  // if nonregion is in disabled regions then set
                  // disabled to true and pop it off the
                  // disabledRegions array
                  var non_region_code = 'XXXX';
                  var non_region_disabled = null;
                  if (disabledRegions.hasOwnProperty(non_region_code)) {
                      non_region_disabled = true;
                      delete disabledRegions[non_region_code];
                  }
                  // else, set disabled to false and pop it off the
                  // regions array
                  else {
                      non_region_disabled = false;
                      var index = 0;
                      regions.forEach( function (region) {
                          if (region.rc_region == non_region_code) {
                              regions.splice(index, 1);
                          }
                          index++;
                      });
                  }
                  outcome.results.filters = req.query;
                  if (req.query.format !== "csv") {
                      res.render('admin/requests/index', {
                          data: {
                              csrfToken: res.locals.csrfToken,
                              results: escape(JSON.stringify(outcome)),
                              usable_regions: regions,
                              disabled_regions: disabledRegions,
                              non_region: {disabled: non_region_disabled}
                          }
                      });
                  } else {
                      createCSV();
                  }
              });
          });
      }
  };
  require('async').parallel([countResults, getResults], asyncFinally);

})

router.put("/:id", function(req, res, next){
  var workflow = req.app.utility.workflow(req, res);

  workflow.on('validate', function() {
      if (workflow.hasErrors()) {
          return workflow.emit('response');
      }
      
      workflow.emit('patchRequest');
  });

  workflow.on('patchRequest', function() {
      var fieldsToSet = {
          name: {
              first: req.body.first,
              middle: req.body.middle,
              last: req.body.last,
              full: req.body.first + ' ' + req.body.last
          },
          company: req.body.company,
          phone: req.body.phone,
          zip: req.body.zip,
          search: [
              req.body.name,
              req.body.address,
              req.body.address_2,
              req.body.city,
              req.body.state,
              req.body.zip
          ]
      };

      req.app.db.Request.findOne({ where: {id: req.params.id} }).then( function(Request) {
          if (Request) { // if the record exists in the db
              Request.updateAttributes({
                  status: req.body.status
              }).then(function() {
                  workflow.outcome.Request = Request;
                  return workflow.emit('response');
              });
          }
      });
  });

  workflow.emit('validate');
})

module.exports = router;
