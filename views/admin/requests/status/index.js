'use strict';
var db = require('./../../../../models');


exports.init = function(req, res) {
    res.send("Please send the status of a smoke alarm request");
};

/*
 * Takes a request with 
 *  - PARAM: id (i.e., serial in our database)
 *  - BODY: Acceptance from AllReady (boolean indicating whether or not they will track this request)
 *    - True means this is in a region they are covering
 *    - False means this is outside their region
 *  - BODY: Status (one of "new," "in progress," "canceled," "scheduled," and "installed.")
 *  - BODY: Token (shows that the POST-er has permission to send us information)
 * 
*/
exports.update = function(req, res) {
    var access_error = [{ "code": "ACCESS_DENIED", "message": "Please pass a valid token to access this content." }];
    var server_error = [{ "code": "QUERY_PROBLEM", "message": "Sorry, we had a problem updating this region.  Please try again." }];

    // get token from req and check whether it is valid
    var testToken = function () {
        return db.Token.count({
            where: {
                token: req.body.token,
                direction: "inbound"
            }
        });
    }

    testToken().then( function (token) {
        if (token > 0) {
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
    });
};
