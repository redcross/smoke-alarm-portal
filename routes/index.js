var express = require('express');
var router = express.Router();
var nano = require('nano')('http://localhost:5984');

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
    var requestDb = nano.use('smoke_alarm_requests');
    var addressDb = nano.use('us_addresses');
    var countyDb = nano.use('selected_counties');

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
    var zip_match = zip_re.exec(zip_received)
    if (zip_match) {
        if (zip_match.length < 2) {
            console.log("ERROR: zip matched, but match grouping is somehow wrong,");
            console.log("       which implies that the regexp itself is not right");
            console.log("       (or our use of it isn't right).");
        }
        else {
            zip_5 = zip_match[1];
            console.log("DEBUG: found the 5-digit portion of the zip code: '" + zip_5 + "'");
            if (zip_match.length == 3) {
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
    requestDb.insert(
        {
            name: name,
            street_address: street_address,
            city: city,
            state: state,
            zip: zip_final,
            phone: phone,
            email: email,
        },
        'Request from ' + req.body.name + ' at ' +  new Date().toLocaleString(),
        function(err, body, header) {
            if (err) {
                console.log("ERROR: '" + err.message + "'");
                return;
            }
        });

    // Derive state+county from zip code
    addressDb.view('us_addresses','by-zip-code', {key:zip_5}, function(error, results) {
        if (error) {
            if (String(error).toLowerCase().indexOf("error happened in your connection") != -1) {
                console.log("ERROR: " + error)
                console.log("       (This probably means you forgot to start CouchDB.)\n")
            } else {
                console.log("DEBUG: unrecognized error: " + error);
            }
        }
        console.log("DEBUG: doc result from search on zip '" + zip_5 + "': " + JSON.stringify(results));
        results.rows.forEach(function(doc) {
            if (countyFromZip) {
                console.log("DEBUG: another state+county match found: '"
                           + doc.value[1] + "'+'" + doc.value[0] + "'");
            }
            countyFromZip = doc.value[0].replace(" County", "");
            stateFromZip = doc.value[1];
        });

        console.log("DEBUG: county '" + countyFromZip + "' in state '" + stateFromZip + "' "
                    + "derived from zip code '" + zip_5 + "'");
        var matchedRegion = null;
        // We have to match both county and state.  Counties
        // are not only not unique across states, they are not
        // even unique within Red Cross regions in the North
        // Central Division.  For example, there is a
        // "KansasNebraska" region, but both Kansas and
        // Nebraska have a Greeley County.  Try submitting one
        // request with zip 67879 (Greeley County, Kansas) and
        // another with zip 68665 (Greeley County, Nebraska).
        countyDb.view('selected_counties','county-matchup', {key: [stateFromZip,countyFromZip]}, function(error, results) {
            if (error) console.log("ERROR: Error matching region: " + error);
            results.rows.forEach(function(doc) {
                console.log("DEBUG: Retrieved this state+county from the view:\n       "
                            + JSON.stringify(doc) + "\n");
                console.log("DEBUG: You could use this command to verify it:\n       "
                            + "'curl -X GET http://127.0.0.1:5984/selected_counties/"
                            + doc._id + "'\n");
                if (doc.key[0] == stateFromZip && doc.key[1] == countyFromZip) {
                    if (matchedRegion) {
                        console.log("DEBUG: another region match found:\n       "
                                    + JSON.stringify(doc) + "\n");
                    }
                    matchedRegion = doc.value;
                    console.log("DEBUG: The matching document is:\n       "
                                + JSON.stringify(doc) + "\n");
                }
            });
            if (matchedRegion) {
                res.render('thankyou.jade', {region: matchedRegion});
            } else {
                if (zip_final) {
                    var zip_for_display = zip_final;
                } else {
                    // A better way to handle this would be to display a sorry
                    // page that discusses the invalidity of the zip code and
                    // doesn't talk about anything else.  But this will do for now.
                    var zip_for_display = "(INVALID ZIP CODE '" + zip_received + "')";
                }
                res.render('sorry.jade', {county: countyFromZip, state: stateFromZip, zip: zip_for_display});
            }
        });
    });
});

module.exports = router;
