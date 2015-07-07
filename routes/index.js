var express = require('express');
var router = express.Router();
var db = require('./../models');
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
            db.maybe_console_log("zip matched, but match grouping is somehow wrong,", true);
            db.maybe_console_log("which implies that the regexp itself is not right", true);
            db.maybe_console_log("(or our use of it isn't right).", true);
        }
        else {
            zip_5 = zip_match[1];
            db.maybe_console_log("found the 5-digit portion of the zip code: '" + zip_5 + "'");
            if (zip_match.length == 3 && zip_match[2] !== undefined) {
                zip_4 = zip_match[2];
                db.maybe_console_log("found a 4-digit portion in the zip code: '" + zip_4 + "'");
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

    var request = db.Request.create({
        name: name,
        address: street_address,
        city: city,
        state: state,
        zip: zip_final,
        phone: phone,
        email: email,
    }).then(function(successfulRequest) {
        db.maybe_console_log("Request entered successfully");
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
            db.maybe_console_log("no county found for zip '" + JSON.stringify(zip_for_lookup) + "'", true);
            // TODO: This isn't quite right, for two reasons.
            // 
            // One, it tries to use the call to res.render() as an
            // error exit (a non-local exit), which is what we want of
            // in this error case.  But that doesn't really stop
            // execution of this function -- we continue on after the
            // closing curly brace, it's just that the user never sees
            // that because we've rendered the sorry page already.
            // There's got to be a Right Way to both hand off to the
            // sorry page and exit out with an error here, without
            // having the entire rest of this function be wrapped in
            // an 'else' clause, right?
            //
            // The other problem is that we want the same wrapping of
            // the erroneous zip code here as we have later on, where
            // we wrap it in language about "INVALID ZIP CODE" etc.
            // But I don't want to just copy-and-paste that code;
            // that's obviously not the right way.
            res.render('sorry.jade', {zip: zip_for_lookup});
        } 

        db.maybe_console_log("county found: '" + JSON.stringify(county) + "'");
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
                db.maybe_console_log("selected region: " + JSON.stringify(selectedRegion));
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
