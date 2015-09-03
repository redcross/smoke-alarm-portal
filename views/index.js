'use strict';
var db = require('./../models');

// Any reason not to just hardcode this here?
var state_abbrevs =
    {
        "Alabama":                        "AL",
        "Alaska":                         "AK",
        "Arizona":                        "AZ",
        "Arkansas":                       "AR",
        "California":                     "CA",
        "Colorado":                       "CO",
        "Connecticut":                    "CT",
        "Delaware":                       "DE",
        "Florida":                        "FL",
        "Georgia":                        "GA",
        "Hawaii":                         "HI",
        "Idaho":                          "ID",
        "Illinois":                       "IL",
        "Indiana":                        "IN",
        "Iowa":                           "IA",
        "Kansas":                         "KS",
        "Kentucky":                       "KY",
        "Louisiana":                      "LA",
        "Maine":                          "ME",
        "Maryland":                       "MD",
        "Massachusetts":                  "MA",
        "Michigan":                       "MI",
        "Minnesota":                      "MN",
        "Mississippi":                    "MS",
        "Missouri":                       "MO",
        "Montana":                        "MT",
        "Nebraska":                       "NE",
        "Nevada":                         "NV",
        "New Hampshire":                  "NH",
        "New Jersey":                     "NJ",
        "New Mexico":                     "NM",
        "New York":                       "NY",
        "North Carolina":                 "NC",
        "North Dakota":                   "ND",
        "Ohio":                           "OH",
        "Oklahoma":                       "OK",
        "Oregon":                         "OR",
        "Pennsylvania":                   "PA",
        "Rhode Island":                   "RI",
        "South Carolina":                 "SC",
        "South Dakota":                   "SD",
        "Tennessee":                      "TN",
        "Texas":                          "TX",
        "Utah":                           "UT",
        "Vermont":                        "VT",
        "Virginia":                       "VA",
        "Washington":                     "WA",
        "West Virginia":                  "WV",
        "Wisconsin":                      "WI",
        "Wyoming":                        "WY",
        "American Samoa":                 "AS",
        "District of Columbia":           "DC",
        "Federated States of Micronesia": "FM",
        "Guam":                           "GU",
        "Marshall Islands":               "MH",
        "Northern Mariana Islands":       "MP",
        "Palau":                          "PW",
        "Puerto Rico":                    "PR",
        "Virgin Islands":                 "VI",
        "Armed Forces Africa":            "AE",
        "Armed Forces Americas":          "AA",
        "Armed Forces Canada":            "AE",
        "Armed Forces Europe":            "AE",
        "Armed Forces Middle East":       "AE",
        "Armed Forces Pacific":           "AP"
    };

exports.init = function(req, res) {
    res.locals.csrf = encodeURIComponent(req.csrfToken());
    res.render('index');
};
/* MN: 7.31.2015 - This is a big refactoring of this file.
 * The primary motivations for this were to effectively handle
 * promise chaining as well as separating functionality into
 * different functions in order to increase maintainability.
 * saveRequest in its current form was becoming too unweidly, IMO.
 *
 * As a result, saveRequest as we know it is now fulfilled by 
 * several functions, including:
 * - getRequestData(req) - gets and parses request data from incoming request
 * - saveRequestData(request) - saves the request to the DB
 * - findAddressFromZip(zip) - gets the address (most importantly county) from
     the UsAddress table so we can determine whether this county is covered
     or not
 * - findCountyFromAddress(address) - tries to find a county within a region
     based upon the address
 * - updateRequestWithRegion(request, selectedRegion) - if the address is in a region, we update the 
     request with that info
 * - sendEmail(request, selectedRegion) - sends Email to region representative
 */

// Request data context to use through the promise chain
var requestData = {};

var getRequestData = function(req) {
    var zipToSelect = req.body.zip;
    // Things we derive from the user-provided zip code.
    var stateFromZip = null;   // remains null if no match
    var countyFromZip = null;  // remains null if no match

    // Treat state gingerly.  Because of the way ../views/index.js
    // simulates placeholder text for State, there is a possibility
    // that, unlike other fields, req.body.state may be undefined.
    // For other fields we can assume they are strings, either empty
    // or non-empty, so here we make state meet that assumption too.
    if (req.body.state === undefined) {
        req.body.state = '';
    }
    // Trim and sanitize the request values.
    //
    // Note: we could augment String like so
    //
    //     String.prototype.trimAndSlim() {
    //         return this.trim().replace(/\s+/g, ' ');
    //     };
    //
    // and use that to declutter the code below.  But I'm not sure
    // whether such augmentation is frowned on or not.  Advice from
    // more experienced Javascript programmers welcome.  -Karl
    requestData.name = req.body.name.trim().replace(/\s+/g, ' ');
    requestData.street_address = req.body.street_address.trim().replace(/\s+/g, ' ');
    requestData.city = req.body.city.trim().replace(/\s+/g, ' ');
    requestData.state = req.body.state.trim().replace(/\s+/g, ' ');
    requestData.phone = req.body.phone.trim().replace(/\s+/g, ' ');
    requestData.email = req.body.email.trim().replace(/\s+/g, ' ');

    // Treat zip code specially.  For zip codes, we remove all
    // internal spaces, since they can't possibly be useful.
    requestData.zip_received = req.body.zip.trim().replace(/\s+/g, '');
    // This is the zip code we will actually store in the database.
    // Our canonical form for storing zip codes is any of the following:
    // "NNNNN" (a 5 digit string), "NNNNN-NNNN" (a string consisting
    // of 5 digits, a hyphen, and 4 digits), or null.  No other forms
    // are to be stored, at least not without changing this comment.
    requestData.zip_final = null;

    // Parse 5-digit section and optional 4-digit section from the zip code.
    requestData.zip_5 = null;
    requestData.zip_4 = null;
    var zip_re = /^([0-9][0-9][0-9][0-9][0-9]) *[-_+]{0,1} *([0-9][0-9][0-9][0-9]){0,1}$/g;
    requestData.zip_match = zip_re.exec(requestData.zip_received);
    if (requestData.zip_match) {
        if (requestData.zip_match.length < 2) {
            console.log("ERROR: zip matched, but match grouping is somehow wrong,");
            console.log("       which implies that the regexp itself is not right");
            console.log("       (or our use of it isn't right).");
        }
        else {
            requestData.zip_5 = requestData.zip_match[1];
            if (requestData.zip_match.length == 3 && requestData.zip_match[2] !== undefined) {
                requestData.zip_4 = requestData.zip_match[2];
                requestData.zip_final = requestData.zip_5 + "-" + requestData.zip_4;
            } else {
                requestData.zip_final = requestData.zip_5;
            }
        }
    }

    requestData.zip_for_lookup = requestData.zip_5;
    if (! requestData.zip_for_lookup) {
        // If the zip we got doesn't look like it was a real zip, then
        // it won't work later as a key for database lookups.  But we
        // should still pass it along so at least error messages can
        // display it accurately.
        requestData.zip_for_lookup = requestData.zip_received;
    }
    return requestData;
};

// Save the request data unconditionally.  Even if we can't
// service the request -- or even if it contains some invalid
// data, such as an unknown zip code -- we still want to record
// that the person made the request.

// TODO: We need to have sanitized all inputs by now.  We need to
// know that all input is not problematic from an SQL point of
// view (even though we're using an ORM here, we don't want to
// store data that will later be a security risk for someone else
// generating a report or whatever), and we need to make sure that
// the email address does not have surrounding "<" and ">", and
// that the phone number is in a standard 10-digit format
// (actually, I think we've already validated that, but let's
// check again here).

var saveRequestData = function(requestData) {
    return db.Request.create({
        name: requestData.name,
        address: requestData.street_address,
        city: requestData.city,
        state: requestData.state,
        zip: requestData.zip_final,
        phone: requestData.phone,
        email: requestData.email
    });
};

// This function gets the address from the zip code in the request
var findAddressFromZip = function(zip) {
    return db.UsAddress.findOne({where: {zip: zip}});
};

// This function gets the selected county if it exists from the requests
var findCountyFromAddress = function(address) {
    if (!address) {
        if (requestData.zip_5) {
            var zip_for_display = requestData.zip_for_lookup;
        } else {
            // A better way to handle this would be to display a sorry
            // page that discusses the invalidity of the zip code and
            // doesn't talk about anything else.  But this will do for now.
            var zip_for_display = "(INVALID ZIP CODE '" + requestData.zip_for_lookup + "')";
        }
        return res.render('sorry.jade', {zip: zip_for_display});
    } 


    requestData.countyFromZip = address['county'].replace(" County", "");
    requestData.stateFromZip = address['state'];

    return db.SelectedCounties.findOne({
        where: {
            // Use the PostgreSQL "ILIKE" (case-insensitive LIKE)
            // operator so that internal inconsistencies in the
            // case-ness of our data don't cause problems.  For
            // example, Lac qui Parle County, MN is "Lac qui
            // Parle" (correct) in ../data/selected_counties.json
            // but "Lac Qui Parle" (wrong) in us_addresses.json.
            //
            // Since us_addresses.json comes from an upstream data
            // source, correcting all the cases there could be a
            // maintenance problem.  It's easier just to do our
            // matching case-insensitively.
            //
            // http://docs.sequelizejs.com/en/latest/docs/querying/
            // has more about the use of operators like $ilike.
            county: { $ilike: requestData.countyFromZip },
            state: { $ilike: requestData.stateFromZip }
        }
    });
};

var isActiveRegion = function(selectedRegion) {
    return db.activeRegion.findOne({
        where: {
            rc_region: selectedRegion.region,
            is_active: true
        }
    });
};

// Updates the request with the region if it is in a covered region
var updateRequestWithRegion = function(request, region) {
    request.selected_county = region.id;
    return request.save({fields: ['selected_county']});
};

// sends an email to the regional representative
var sendEmail = function(request, selectedRegion) {
    // selectedRegion is now a row from the activeRegions table
    var regionPresentableName = selectedRegion.region_name;
    var regionRecipientName   = selectedRegion.contact_name;
    var regionRecipientEmail  = selectedRegion.contact_email;
    var thisRequestID = request.id;

    var email_text = "We have received a smoke alarm installation request from:\n"
        + "\n"
        + "  " + request.name + "\n"
        + "  " + request.address + "\n"
        + "  " + request.city + ", " + state_abbrevs[request.state] + "  " + request.zip + "\n";

    if (request.phone) {
        email_text += "  Phone: " + request.phone + "\n";
    } else {
        email_text += "  Phone: ---\n";
    };
    if (request.email) {
        email_text += "  Email: <" + request.email + ">\n";
    } else {
        email_text += "  Email: ---\n";
    };

    email_text += "\n"
        + "This is installation request #" + thisRequestID + ".\n"
        + "\n"
        + "We're directing this request to the administrator for the\n"
        + "ARC North Central Division, " + regionPresentableName + " region:\n"
        + "\n"
        + "  " + regionRecipientName + " <" + regionRecipientEmail + ">\n"
        + "\n"
        + "Thank you,\n"
        + "-The Smoke Alarm Request Portal\n";

    // Send an email to the appropriate Red Cross administrator.
    var outbound_email = {
        from: db.mail_from_addr,
        to: regionRecipientName + " <" + regionRecipientEmail + ">",
        subject: "Smoke alarm install request from " 
            + request.name + " (#" + thisRequestID + ")",
        text: email_text
    };


    db.mailgun.messages().send(outbound_email, function (error, body) {
        // TODO: We need to record the sent message's Message-ID 
        // (which is body.id) in the database, with the request.
        if (body.id === undefined) {
            console.log("DEBUG: sent mail ID was undefined");
        } else {
            console.log("DEBUG: sent mail ID:  '" + body.id + "'");
        }
        if (body.message === undefined) {
            console.log("DEBUG: sent mail msg was undefined");
        } else {
            console.log("DEBUG: sent mail msg: '" + body.message + "'");
        }
    });
};

exports.saveRequest = function(req, res) {
    var savedRequest = {};
    requestData = getRequestData(req);
    saveRequestData(requestData).then(function(request) {
        savedRequest = request;
        return findAddressFromZip(requestData.zip_for_lookup)
    }).then(function(address) {
        return findCountyFromAddress(address);
    }).then(function(selectedRegion, requestData) {
        return isActiveRegion(selectedRegion);
    }).then( function(activeRegion){
        if (activeRegion.is_active === true) {
            updateRequestWithRegion(savedRequest, activeRegion).then(function() {
                sendEmail(savedRequest, activeRegion);
                res.render('thankyou.jade', {region: activeRegion.rc_region});
            });
        }
        else{
            res.render('sorry.jade', {county: requestData.countyFromZip, state: requestData.stateFromZip, zip: requestData.zip_for_lookup});
        }
    }).catch(function(error) {
        res.render('sorry.jade', {county: requestData.countyFromZip, state: requestData.stateFromZip, zip: requestData.zip_for_lookup});
    });
};
