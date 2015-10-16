var db = require('./../models');
var requestData = {};

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

module.exports  = {

    // get count of requests saved for a given region
    countRequestsPerRegion: function (region) {
        if (region){
            return db.Request.count({
                where: {
                    assigned_rc_region: region
                }
            });
        }
        else {
            return db.Request.count({
                where: {
                    assigned_rc_region: null
                }
            });
        }
    },

    // takes a "value" that needs to be a certain "length" (in this file,
    // either a date or a sequence number) and pads it with leading zeroes
    // until it is "length" long.
    padWithZeroes: function (value, length){
        while (value.length < length) {
            value = "0" + value;
        }
        return value;
    },

    findZipForLookup: function (req) {
        // get zip_for_lookup from req
        // Treat zip code specially.  For zip codes, we remove all
        // internal spaces, since they can't possibly be useful.
        var requestZip = {};
        requestZip.zip_received = req.body.zip.trim().replace(/\s+/g, '');
        // This is the zip code we will actually store in the database.
        // Our canonical form for storing zip codes is any of the following:
        // "NNNNN" (a 5 digit string), "NNNNN-NNNN" (a string consisting
        // of 5 digits, a hyphen, and 4 digits), or null.  No other forms
        // are to be stored, at least not without changing this comment.
        requestZip.zip_final = null;

        // Parse 5-digit section and optional 4-digit section from the zip code.
        requestZip.zip_5 = null;
        requestZip.zip_4 = null;
        var zip_re = /^([0-9][0-9][0-9][0-9][0-9]) *[-_+]{0,1} *([0-9][0-9][0-9][0-9]){0,1}$/g;
        requestZip.zip_match = zip_re.exec(requestZip.zip_received);
        if (requestZip.zip_match) {
            if (requestZip.zip_match.length < 2) {
                console.log("ERROR: zip matched, but match grouping is somehow wrong,");
                console.log("       which implies that the regexp itself is not right");
                console.log("       (or our use of it isn't right).");
            }
            else {
                requestZip.zip_5 = requestZip.zip_match[1];
                if (requestZip.zip_match.length == 3 && requestZip.zip_match[2] !== undefined) {
                    requestZip.zip_4 = requestZip.zip_match[2];
                    requestZip.zip_final = requestZip.zip_5 + "-" + requestZip.zip_4;
                } else {
                    requestZip.zip_final = requestZip.zip_5;
                }
            }
        }

        requestZip.zip_for_lookup = requestZip.zip_5;
        if (! requestZip.zip_for_lookup) {
            // If the zip we got doesn't look like it was a real zip, then
            // it won't work later as a key for database lookups.  But we
            // should still pass it along so at least error messages can
            // display it accurately.
            requestZip.zip_for_lookup = requestZip.zip_received;
        }
        
        return requestZip;
    },

    getRequestData: function(req, numberOfRequests, region) {
        var zipArray = module.exports.findZipForLookup(req);
        requestData.zip_for_lookup = zipArray.zip_for_lookup;
        requestData.zip_final = zipArray.zip_final;
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
        requestData.assigned_rc_region = region;

        return requestData;
    },

    createSerial: function (numberOfRequests, requestData, region) {
        // construct today date object
        var today = new Date();
        // avoid the first request having a serial number of
        // "region-date-00000."  I think that would be confusing for users.
        // We might as well start with 1.
        numberOfRequests = numberOfRequests + 1;
        var sequenceNumber = module.exports.padWithZeroes(numberOfRequests.toString(), 5);
        var displayDate = today.getFullYear().toString()+module.exports.padWithZeroes((today.getMonth() +1).toString(), 2) + module.exports.padWithZeroes(today.getDate().toString(), 2);
        if (region) {
            var serial = region + "-" + displayDate + "-" + sequenceNumber;
        }
        else {
            // construct code from state
            var state_code = "";
            if (requestData.state != "" && state_abbrevs[requestData.state]){
                // get abbreviation
                state_code = "XX" + state_abbrevs[requestData.state];
            }
            else {
                state_code = "XXXX";
            }
            var serial = state_code + "-" + displayDate + "-" + sequenceNumber;
        }

        requestData.serial = serial;
        return requestData;
    },

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

    saveRequestData: function(requestData) {
        return db.Request.create({
            name: requestData.name,
            source: requestData.is_sms,
            address: requestData.street_address,
            city: requestData.city,
            state: requestData.state,
            zip: requestData.zip_final,
            phone: requestData.phone,
            email: requestData.email,
            serial: requestData.serial,
            assigned_rc_region: requestData.assigned_rc_region
        }).catch( function () {
            // uniqueness failed; increment serial
            var serial_array = requestData.serial.split("-");
            var new_serial = module.exports.padWithZeroes((parseInt(serial_array[2]) + 1).toString(), 5);
            requestData.serial = serial_array[0] + "-" + serial_array[1] + "-" + new_serial;
            return saveRequestData(requestData); //loop until save works
        });
    },

    // This function gets the address from the zip code in the request
    findAddressFromZip: function(zip) {
        return db.UsAddress.findOne({where: {zip: zip}});
    },

    // This function gets the selected county if it exists from the requests
    findCountyFromAddress: function(address, zip) {
        if (!address) {
            // Then no valid zipcode was found, so make sure that the
            // "invalid zip" page is displayed
            requestData.countyFromZip = null;
            requestData.stateFromZip = null;
            // make sure that the correct "zip_for_lookup" is specified here...
            requestData.zip_for_lookup = zip;
            return null;
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
    },

    // find out whether a region is active or not
    isActiveRegion: function(request) {
        return db.activeRegion.findOne({
            where: {
                rc_region: request.assigned_rc_region,
                is_active: true
            }
        });
    },




    // sends an email to the regional representative
    sendEmail: function(request, selectedRegion) {
        // selectedRegion is now a row from the activeRegions table
        var regionPresentableName = selectedRegion.region_name;
        var regionRecipientName   = selectedRegion.contact_name;
        var regionRecipientEmail  = selectedRegion.contact_email;
        var thisRequestID = request.serial;

        var email_text = "We have received a smoke alarm installation request from:\n"
            + "\n"
            + "  " + request.name + "\n"
            + "  " + request.address + "\n"
            + "  " + request.city + ", ";
        if (state_abbrevs[request.state]){
            email_text = email_text + state_abbrevs[request.state];
        }
        else {
            email_text = email_text + request.state;
        }
        email_text = email_text + "  " + request.zip + "\n";

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
    }
}
