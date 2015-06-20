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
		var countyMatched = false;

		// This is buggy because it just accepts the first
                // county-name match it comes across in the database,
                // but counties are not only not unique across states,
                // they are not even unique within Red Cross regions
                // in the North Central Division -- for example, our
                // division has a "KansasNebraska" region, but both
                // Kansas and Nebraska have a Greeley County.
                //
                // The entries in ../data/selected_counties.json now
                // include the state, so we can disambiguate in these
                // cases.  However, the code below does not do that
                // yet, it just accepts the first county with a
                // matching name, no matter from what state.
		countyDb.view('selected_counties','county-matchup', {key:countyToSelect}, function(error, results) {
			results.rows.forEach(function(doc) {
				if (doc.key.match(countyToSelect) && countyMatched == false) {
					countyMatched = true;
				        console.log("County Doc = " + JSON.stringify(doc) +
                                                    "; CountyMatched = " + countyMatched);
				}
			});
			if (countyMatched === true) {
		    res.redirect('/thankyou');
			} else {
				res.redirect('/sorry');
			}
		});
	});
});

module.exports = router;
