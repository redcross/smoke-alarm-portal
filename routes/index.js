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
                // in the North Central Division.
                //
                // For example, our division has a "KansasNebraska"
                // region, but both Kansas and Nebraska have a
                // Greely County.  In ../data/selected_counties.json,
                // this just means that there are literally two
                // identical entries, separated by 48 lines, both saying
                // {"region":"KansasNebraska","County":"Greeley"} :-).
                //
                // Fortunately, that's not the direction in which we
                // have to index things, so it doesn't matter for
                // us.  We already have the actual state and county
                // (they were derived from the zip code), so all we
                // need is to map state+county combinations to the
                // appropriate Red Cross *regions* within the North
                // Central *Division*.  That's probably what
                // ../data/selected_counties.json is supposed to be,
                // but it doesn't key to states yet, so it isn't quite
                // providing the data we need.  With a little massaging
                // it will, of course.
                // 
                // However, as it isn't quite there yet, the code
                // below is currently incorrect.
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
