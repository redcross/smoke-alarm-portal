var express = require('express');
var router = express.Router();
var db = require('./../models');
var recipients_table = require(__dirname + '/../config/recipients.json')
/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Red Cross' });
});


/* GET Thank You page. */
router.get('/thankyou', function(req, res, next) {
    res.render('thankyou', { title: 'Red Cross: Thank You', region: res.locals.matchedRegion });
});

/* GET Sorry page. */
router.get('/sorry', function(req, res, next) {
    res.render('sorry', { title: 'Red Cross: Sorry', county: res.locals.matchedCounty, state:res.locals.matchedState });
});

/* POST to the server */
router.post('/', function(req, res, next) {
    // Databases we'll need.

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
    var name = req.body.name.trim().replace(/\s+/g, ' ');
    var street_address = req.body.street_address.trim().replace(/\s+/g, ' ');
    var city = req.body.city.trim().replace(/\s+/g, ' ');
    var state = req.body.state.trim().replace(/\s+/g, ' ');
    var phone = req.body.phone.trim().replace(/\s+/g, ' ');
    var email = req.body.email.trim().replace(/\s+/g, ' ');

    // Treat zip code specially.  For zip codes, we remove all
    // internal spaces, since they can't possibly be useful.
    var zip_received = req.body.zip.trim().replace(/\s+/g, '');
    // This is the zip code we will actually store in the database.
    // Our canonical form for storing zip codes is any of the following:
    // "NNNNN" (a 5 digit string), "NNNNN-NNNN" (a string consisting
    // of 5 digits, a hyphen, and 4 digits), or null.  No other forms
    // are to be stored, at least not without changing this comment.
    var zip_final = null;

    // Parse 5-digit section and optional 4-digit section from the zip code.
    var zip_5 = null;
    var zip_4 = null;
    var zip_re = /^([0-9][0-9][0-9][0-9][0-9]) *[-_+]{0,1} *([0-9][0-9][0-9][0-9]){0,1}$/g;
    var zip_match = zip_re.exec(zip_received);
    if (zip_match) {
        if (zip_match.length < 2) {
            console.log("ERROR: zip matched, but match grouping is somehow wrong,");
            console.log("       which implies that the regexp itself is not right");
            console.log("       (or our use of it isn't right).");
        }
        else {
            zip_5 = zip_match[1];
            console.log("DEBUG: found the 5-digit portion of the zip code: '" + zip_5 + "'");
            if (zip_match.length == 3 && zip_match[2] !== undefined) {
                zip_4 = zip_match[2];
                console.log("DEBUG: found a 4-digit portion in the zip code: '" + zip_4 + "'");
                zip_final = zip_5 + "-" + zip_4;
            } else {
                zip_final = zip_5;
            }
        }
    }

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

    var request = db.Request.create({
        name: name,
        address: street_address,
        city: city,
        state: state,
        zip: zip_final,
        phone: phone,
        email: email,
    }).then(function(successfulRequest) {
        console.log("DEBUG: Request entered successfully");
    });

    var zip_for_lookup = zip_5;
    if (! zip_for_lookup) {
        // If the zip we got doesn't look like it was a real zip, then
        // it won't work later as a key for database lookups.  But we
        // should still pass it along so at least error messages can
        // display it accurately.
        zip_for_lookup = zip_received;
    }

    var requestedCountyAddress = null;
    db.UsAddress.findOne({
        where: {
            zip: zip_for_lookup
        }
    }).then(function(county) {
        if (! county) {
            console.log("ERROR: no county found for zip '" + JSON.stringify(zip_for_lookup) + "'");
            return res.render('sorry.jade', {zip: zip_for_lookup});
        } 

        console.log("DEBUG: county found: '" + JSON.stringify(county) + "'");
        requestedCountyAddress = county;

        countyFromZip = requestedCountyAddress['county'].replace(" County", "");
        stateFromZip = requestedCountyAddress['state'];

        db.SelectedCounties.findOne({
            where: {
                county: countyFromZip,
                state: stateFromZip
            }
        }).then(function(selectedRegion) {
            if (selectedRegion !== null) {
                console.log("DEBUG: selected region: " + JSON.stringify(selectedRegion));

                var regionPresentableName = recipients_table[selectedRegion.region]["region_alt_name"];
                var regionRecipientName   = recipients_table[selectedRegion.region]["contact_name"];
                var regionRecipientEmail  = recipients_table[selectedRegion.region]["contact_email"];

                // Temporary shims during development, so we don't send
                // mail to real Red Cross administrators when testing.
                var regionRecipientShimName   = recipients_table["Test Region"]["contact_name"];
                var regionRecipientShimEmail  = recipients_table["Test Region"]["contact_email"];

                console.log("")
                console.log("DEBUG: db request:");
                console.log(request);
                console.log("DEBUG: (end db request)");
                console.log("")
                console.log("DEBUG: Information for '" + selectedRegion.region + "':");
                console.log("DEBUG:    Presentable region name: '" + regionPresentableName + "'");
                console.log("DEBUG:    Contact name: '" + regionRecipientName + "'");
                console.log("DEBUG:    Contact email: '<" + regionRecipientEmail + ">'");

                var email_text = "We have received a smoke alarm installation request from:\n"
                    + "\n"
                    + "  " + name + "\n"
                    + "  " + street_address + "\n"
                    + "  " + city + ", " + state + "  " + zip_final + "\n"
                    + "  Phone:" + phone + "\n"
                    + "  Email: <" + email + ">\n"
                    + "\n"
                    + "We're directing this installation request to the administrator\n"
                    + "for the American Red Cross North Central Division,\n"
                    + regionPresentableName + " region:\n"
                    + "\n"
                    + "  " + regionRecipientName + " <" + regionRecipientEmail + ">\n"
                    + "\n"
                    + "Thank you,\n"
                    + "-The Smoke Alarm Request Portal\n";

                // Send an email to the appropriate Red Cross administrator.
                var this_request_id = request._boundTo.dataValues.id;
                var outbound_email = {
                    from: db.mail_from_addr,
                    to: regionRecipientShimName + " <" + regionRecipientShimEmail + ">",
                    subject: "Smoke alarm install request from " 
                        + name + " (#" + this_request_id + ")",
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

                res.render('thankyou.jade', {region: selectedRegion.region});
            } else {
                if (zip_5) {
                    var zip_for_display = zip_for_lookup;
                } else {
                    // A better way to handle this would be to display a sorry
                    // page that discusses the invalidity of the zip code and
                    // doesn't talk about anything else.  But this will do for now.
                    var zip_for_display = "(INVALID ZIP CODE '" + zip_for_lookup + "')";
                }
                res.render('sorry.jade', {county: countyFromZip, state: stateFromZip, zip: zip_for_display});
            };
        });
    });
});

module.exports = router;
