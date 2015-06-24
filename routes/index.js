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
    // Get values from request
    var requestDb = nano.use('smoke_alarm_requests');
    var addressDb = nano.use('us_addresses');
    var countyDb = nano.use('selected_counties');
    // Determine the county of the Zip code
    var zipToSelect = req.body.zip;
    var matchedCounty = null;  // matched from user-provided zip code; remains null if no match
    var matchedState = null;   // matched from user-provided zip code; remains null if no match
    // Get desired county and state
    console.log("DEBUG: the user-provided zip code is: '" + zipToSelect + "'");

    // Save the data
    requestDb.insert(
        {
            name: req.body.name,
            street_address: req.body.street_address,
            city: req.body.city,
            state: req.body.state,
            zip: req.body.zip,
            phone: req.body.phone,
            permission_to_text: req.body.permission_to_text,
        },
        'Request from ' + req.body.name + ' at ' +  new Date().toLocaleString(),
        function(err, body, header) {
            if (err) {
                console.log(err.message);
                return;
            }
        });

    addressDb.view('us_addresses','by-zip-code', {key:zipToSelect}, function(error, results) {
        if (error) {
            if (String(error).toLowerCase().indexOf("error happened in your connection") != -1) {
                console.log("ERROR: " + error)
                console.log("       (This probably means you forgot to start CouchDB.)\n")
            } else {
                console.log("DEBUG: unrecognized error: " + error);
            }
        }
        console.log("DEBUG: doc result from search on zip '" + zipToSelect + "': " + JSON.stringify(results));
        results.rows.forEach(function(doc) {
            if (matchedCounty) {
                console.log("DEBUG: another state+county match found: '"
                           + doc.value[1] + "'+'" + doc.value[0] + "'");
            }
            matchedCounty = doc.value[0].replace(" County", "");
            matchedState = doc.value[1];
        });

        console.log("DEBUG: county '" + matchedCounty + "' in state '" + matchedState + "' found");
        var matchedRegion = null;
        // We have to match both county and state.  Counties
        // are not only not unique across states, they are not
        // even unique within Red Cross regions in the North
        // Central Division.  For example, there is a
        // "KansasNebraska" region, but both Kansas and
        // Nebraska have a Greeley County.  Try submitting one
        // request with zip 67879 (Greeley County, Kansas) and
        // another with zip 68665 (Greeley County, Nebraska).
        countyDb.view('selected_counties','county-matchup', {key: [matchedState,matchedCounty]}, function(error, results) {
            if (error) console.log("ERROR: Error matching region: " + error);
            results.rows.forEach(function(doc) {
                console.log("DEBUG: Retrieved this state+county from the view:\n       "
                            + JSON.stringify(doc) + "\n");
                console.log("DEBUG: You could use this command to verify it:\n       "
                            + "'curl -X GET http://127.0.0.1:5984/selected_counties/"
                            + doc._id + "'\n");
                if (doc.key[0] == matchedState && doc.key[1] == matchedCounty) {
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
                res.render('sorry.jade', {county: matchedCounty, state: matchedState, zip: zipToSelect});
            }
        });
    });
});

module.exports = router;
