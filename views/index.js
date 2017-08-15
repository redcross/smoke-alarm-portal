'use strict';
var db = require('../models');
// all the functions used below are now defined in utilities.js so that
// they can also be used by SMS requests
var utils = require('./utilities');

exports.init = function(req, res) {
    res.locals.csrf = encodeURIComponent(req.csrfToken());
    res.render('index', {origin: req.url});
};

// Request data context to use through the promise chain
var requestData = {};


exports.saveRequest = function(req, res) {
    var savedRequest = {};
    var region_code = "";
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
        
        // Check for 311 origin:
        if (req.url == '/311') {
            requestData.origin = '311-web';
        }
        else {
            requestData.origin = 'web';
        }
        return utils.saveRequestData(requestData);
    }).then(function(request) {
        savedRequest = request;
        return utils.isActiveRegion(savedRequest);
    }).then( function(activeRegion){
        if (activeRegion) {
            utils.sendEmail(savedRequest, activeRegion);
            res.render('thankyou.jade', {region: activeRegion.region_name, id: savedRequest.serial, origin: req.url});
        }
        else{
            res.render('sorry.jade', {county: requestData.countyFromZip, state: requestData.stateFromZip, zip: requestData.zip_for_lookup, origin: req.url});
        }
    }).catch(function(error) {
        res.render('sorry.jade', {county: requestData.countyFromZip, state: requestData.stateFromZip, zip: requestData.zip_for_lookup, origin: req.url});
    });
};
