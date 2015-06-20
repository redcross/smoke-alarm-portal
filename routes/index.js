var express = require('express');
var router = express.Router();
var nano = require('nano')('http://localhost:5984');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Red Cross' });
});


/* GET Thank You page. */
router.get('/thankyou', function(req, res, next) {
  res.render('thankyou', { title: 'Red Cross: Thank You' });
});

/* GET Sorry page. */
router.get('/sorry', function(req, res, next) {
  res.render('sorry', { title: 'Red Cross: Sorry' });
});

/* POST to the server */
router.post('/', function(req, res, next) {
	// Get values from request
	var requestDb = nano.use('smoke_alarm_requests');
	var addressDb = nano.use('us_addresses');
	var countyDb = nano.use('selected_counties');
		// Determine the county of the Zip code
	var zipToSelect = req.body.zip;
	var countyToSelect = null;
	var stateToSelect = null;
	var selectedCounties = null;
	// Get desired county and state
	console.log("The zip to use is:" + zipToSelect);

		// Save the data
	requestDb.insert({
	  name: req.body.name,
	  address: req.body.address,
	  address_2: req.body.address_2,
	  city: req.body.city,
	  state: req.body.state,
	  zip: req.body.zip,
	  phone: req.body.phone,
	  permission_to_text: req.body.permission_to_text,
   }, 'Request from ' + req.body.name + ' at ' +  new Date().toLocaleString(),
	 function(err, body, header) {
	 	if (err) {
	    console.log(err.message);
	    return;
  	}
	});

	addressDb.view('us_addresses','by-zip-code', {key:Number(zipToSelect)}, function(error, results) {
		if (error) {
			console.log("Error =" + error);
		}
		console.log("Doc result from zip " + zipToSelect + " search: " + JSON.stringify(results));
		results.rows.forEach(function(doc) {
			countyToSelect = doc.value[0].replace(" County", "");
			stateToSelect = doc.value[1];
    });

		console.log("county " + countyToSelect + " in state " + stateToSelect + " found");
		var state_and_county_matched = false;

		// We have to match both county and state.  Counties
                // are not only not unique across states, they are not
                // even unique within Red Cross regions in the North
                // Central Division.  For example, there is a
                // "KansasNebraska" region, but both Kansas and
                // Nebraska have a Greeley County.  Try submitting one
                // request with zip 67879 (Greeley County, Kansas) and
                // another with zip 68665 (Greeley County, Nebraska).
		countyDb.view('selected_counties','county-matchup',
                              {key: [stateToSelect,countyToSelect]}, function(error, results) {
			results.rows.forEach(function(doc) {
			    console.log("DEBUG: Retrieved this state+county from the view:\n       "
                                        + JSON.stringify(doc) + "\n");
			    console.log("DEBUG: You could use this command to verify it:\n       "
                                        + "'curl -X GET http://127.0.0.1:5984/selected_counties/"
                                        + doc._id + "'\n");
			    if (doc.key[0] == stateToSelect && doc.key[1] == countyToSelect) {
                                        if (state_and_county_matched == true) {
  				            console.log("DEBUG: another match found:\n       "
                                                        + JSON.stringify(doc) + "\n");
                                        }
					state_and_county_matched = true;
				        console.log("DEBUG: The matching document is:\n       " 
                                                    + JSON.stringify(doc) + "\n");
				}
			});
			if (state_and_county_matched === true) {
 		                res.redirect('/thankyou');
			} else {
				res.redirect('/sorry');
			}
		});
	});
});

module.exports = router;
