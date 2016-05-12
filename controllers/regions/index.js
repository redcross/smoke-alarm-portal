'use strict';
var db = require('./../../models');


exports.init = function(req, res) {
    var getAllActiveRegions =  function () {
        return db.activeRegion.findAll({
            where: {
                is_active: true
            }
        });
    }
    var access_error = [{ "code": "ACCESS_DENIED", "message": "Please pass a valid token to access this content." }];
    var server_error = [{ "code": "QUERY_PROBLEM", "message": "Sorry, we had a problem finding the regions.  Please try again." }];
    // TODO: Do a token dance here.  For now, skip it.
    var token = true;
    if (token) {
        var items = [];
        getAllActiveRegions().then( function (regions) {
            regions.forEach( function (region) {
                var basic_region = {"region_id": region.rc_region, "region_name": region.region_name};
                items.push(basic_region);
            });
            var response = {"data": { "items": items}};
            res.send(response);
        }).catch(function() {
            var errors = { "error": { "errors": server_error } };
            res.send(errors);
        });
    }
    else {
        var errors = { "error": { "errors": access_error } };
        res.send(errors);
    }
};
