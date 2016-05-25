'use strict';
var db = require('./../models');
var env = process.env.NODE_ENV || 'development';
var config = require(__dirname + '/../config/config.json')[env];
// all the functions used below are now defined in utilities.js so that
// they can also be used by SMS requests
var utils = require('./utilities');

exports.init = function(req, res) {
    res.locals.csrf = encodeURIComponent(req.csrfToken());
    res.render('index');
};

// Request data context to use through the promise chain
var requestData = {};


exports.saveRequest = function(req, res) {
    var savedRequest = {};
    var region_code = "";
    // use this to hold db information about whether a region is active
    var region_info = null;
    // get zip in a function, to clean this up
    var zip_set = utils.findZipForLookup(req);
    var zip_for_lookup = zip_set.zip_for_lookup;
    utils.findAddressFromZip(zip_for_lookup).then(function(address) {
        return utils.findCountyFromAddress(address, zip_for_lookup);
    }).then( function(county_id){
        if (county_id){
            region_code = county_id.region;
        }
        else {
            region_code = 'XXXX';
        }
        return utils.countRequestsPerRegion(region_code);
    }).then( function(numRequests) {
        requestData = utils.getRequestData(req, numRequests, region_code);
        requestData = utils.createSerial(numRequests, requestData, region_code);
        requestData.is_sms = 'web';
        return utils.saveRequestData(requestData);
    }).then(function(request) {
        savedRequest = request;
        return utils.isActiveRegion(savedRequest);
    }).then( function(activeRegion) {
        region_info = activeRegion
        // get our token first
        return utils.getOutboundToken();
    }).then( function (token) {
        // extract and pass the token itself here
        return utils.postRequest(savedRequest, config.external_endpoint, region_info, token['token']);
    }).then( function (regionObject) {
        // if request was posted, regionObject will be undefined and so
        // we set activeRegion to the db object we saved in the last
        // chunk.  If the request is not posted but the region is active
        // then we'll get a full db object as regionObject from
        // postRequest().  If the region is inactive then regionObject
        // will be null.
        if ( typeof regionObject == 'undefined') {
            var activeRegion = region_info;
        }
        else {
            var activeRegion = regionObject;
        }
        if (activeRegion) {
            utils.sendEmail(savedRequest, activeRegion);
            res.render('thankyou.jade', {region: activeRegion.region_name, id: savedRequest.serial});
        }
        else{
            res.render('sorry.jade', {county: requestData.countyFromZip, state: requestData.stateFromZip, zip: requestData.zip_for_lookup});
        }
    }).catch(function(error) {
        res.render('sorry.jade', {county: requestData.countyFromZip, state: requestData.stateFromZip, zip: requestData.zip_for_lookup});
    });
};
