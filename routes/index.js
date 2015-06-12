var express = require('express');
var router = express.Router();
var nano = require('nano')('http://localhost:5984');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* POST to the server */
router.post('/', function(req, res, next) {
	// Get values from request
	var requestDb = nano.use('smoke_detector_requests');
	requestDb.insert({
	  name: req.body.name,
	  address: req.body.address,
	  address_2: req.body.address_2,
	  city: req.body.city,
	  state: req.body.state,
	  zip: req.body.zip,
	  permission_to_text: req.body.permission_to_text,
   }, 'Request from ' + req.body.name,
	 function(err, body, header){
	 	if (err) {
	    console.log(err.message);
	    return;
  	}
    res.redirect('/');
	});
})
module.exports = router;
