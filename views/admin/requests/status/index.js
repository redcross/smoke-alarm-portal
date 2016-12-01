'use strict';
var db = require('./../../../../models');
var util = require('./../../../utilities.js');

exports.init = function(req, res) {
    res.send("Please send the status of a smoke alarm request");
};

/*
 * Takes a request with 
 *  - PARAM: id (i.e., serial in our database)
 *  - BODY: Acceptance from AllReady (boolean indicating whether or not they will track this request)
 *    - True means this is in a region they are covering
 *    - False means this is outside their region
 *  - BODY: Status (one of "new", "in progress", "canceled", "scheduled", and "installed".)
 *  - BODY: Token (shows that the POST-er has permission to send us information)
 * 
 * TODO: maybe the token should be passed in a header, instead of as part of the body.
*/
exports.update = function(req, res) {
    var access_error = [{ "code": "ACCESS_DENIED", "message": "Please pass a valid token to access this content." }];
    console.log("DEBUG: We assume that the request body can be parsed correctly.");
    var body = req.body;

    // get token from req and check whether it is valid
    var testToken = function () {
        return db.Token.findOne({
            where: {
                token: req.headers.authorization,
                direction: "inbound"
            }
        });
    };

    testToken().then( function (token) {
        if (token) {
            // update the status of a request
            return util.updateRequestStatus(req.params.id, body.acceptance, body.status)
                .then(function (status) {
                    res.send(status);
                });
        }
        else {
            var errors = { "error": { "errors": access_error } };
            res.send(errors);
        }
    });
};
