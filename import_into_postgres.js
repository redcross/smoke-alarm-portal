var db = require('./models');
var async = require('async');
var selectedCountiesJson = require('./data/selected_counties.json');
var usAddressesJson = require('./data/us_addresses.json');


/* Throw an error if the database sync does not occur */
db.sequelize.sync().then(function(promise) {
    console.log("DB in place");
}).catch(SyntaxError, function(e){
    console.log("don't be evil: " + e);
});


// Import the selected counties
var selectedCounties = db.SelectedCounties;

async.each(selectedCountiesJson.docs, function(county, callback) {
	selectedCounties.create(county).then(function(returnedCounty) {
		console.log("County " + returnedCounty + " added");
	});
});


// Import the addresses
var addresses = db.UsAddress;

async.each(usAddressesJson.docs, function(address, callback) {
	addresses.create(address).then(function(returnedAddress) {
		console.log("Address " + returnedAddress + " added");
	});
});