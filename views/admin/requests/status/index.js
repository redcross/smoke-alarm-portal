'use strict';
var db = require('./../../../../models');


exports.init = function(req, res) {
    res.send("Please send the status of a smoke alarm request");
};

/*
 * Takes a request with 
 *  - PARAM: id (i.e., serial in our database)
 *  - BODY: Acceptance from AllReady (boolean indicating whether or not they will track this request)
 *    - True usually means this is in a region they are covering
 *    - False means this is outside their region
 *  - BODY: Status (one of "new," "in progress," "canceled," "scheduled," and "installed."
*/
exports.update = function(req, res) {
    // TODO: include auth check
    var access_error = [{ "code": "ACCESS_DENIED", "message": "Please pass a valid token to access this content." }];
    var server_error = [{ "code": "QUERY_PROBLEM", "message": "Sorry, we had a problem updating this region.  Please try again." }];
    var token = true;
    if (token) {
        // update the status of a request
        return db.Request.findOne(
            { where:
              {serial: req.params.id}
            })
            .then( function(request) {
                return request.updateAttributes({
                    external_tracking: req.body.acceptance,
                    status: req.body.status
                })
            }).then( function (request) {
                res.send(request.dataValues);
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
