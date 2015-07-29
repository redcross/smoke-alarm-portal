/* 
 * To run: $ node fake_request_data.js
 *
 * fake_request_data.js - Short script to fake requests to make sure
 * that pagination works as expected. Uses the 'faker' library to create
 * requests in the admin
 */

var db = require('./../models');
var _ = require('underscore');
var faker = require('faker');
var requestCount = 725; // TODO: Make configurable
var requests = [];
_.times(requestCount, function(index) {
	var requestData = {
		name: faker.name.findName(),
		address: faker.address.streetAddress(),
		city: faker.address.city(),
		state: faker.address.state(),
		zip: faker.address.zipCode(),
		phone: faker.phone.phoneNumber(),
		email: faker.internet.email()
	}
	requests.push(requestData);
});

db.Request.sync().then(function () {
	db.Request.bulkCreate(requests).then(function() {
		console.log("DEBUG: All " + requestCount + " requests entered");
	});
});
