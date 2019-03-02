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
    var region_code = "";
    // get zip in a function, to clean this up
    var zip_set = utils.findZipForLookup(req);
    var zip_for_lookup = zip_set.zip_for_lookup;
    utils.findAddressFromZip(zip_for_lookup).then(function(address) {
        return utils.findCountyFromAddress(address, zip_for_lookup);
    }).then( function(county_id){
        if (county_id){
            region_code = county_id.chapter.region;
        }
        else {
            region_code = 'XXXX';
        }
        return Promise.all([
          utils.countRequestsPerRegion(region_code),
          county_id]) ;
    }).then( function([numRequests, county]) {
        requestData = utils.getRequestData(req, numRequests);
        requestData = utils.createPublicId(numRequests, requestData, region_code);
        requestData.county = county;

        // Check what url the request came from:
        if (req.url == '/311') {
            requestData.source = 'chi-311-web';
        }
        else {
            requestData.source = 'web-home';
        }
        return utils.saveOrDuplicateRequest(requestData);
    }).then(function(request) {
        return Promise.all([
            request,
            request.getSelectedCounty()
                .then(county => county && county.getChapter())
                .then(chapter => chapter && chapter.getActiveRegion())
       ]);
    }).then(function([request, activeRegion]) {
        if (activeRegion && activeRegion.is_active) {
            utils.sendEmail(request, activeRegion);
            res.render('thankyou.jade', {region: activeRegion.region_name, id: request.public_id, origin: req.url});
        }
        else{
            res.render('sorry.jade', {county: requestData.countyFromZip, state: requestData.stateFromZip, zip: requestData.zip_for_lookup, origin: req.url});
        }
    }).catch(function(error) {
        res.render('sorry.jade', {county: requestData.countyFromZip, state: requestData.stateFromZip, zip: requestData.zip_for_lookup, origin: req.url});
    });
};
