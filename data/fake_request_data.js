/* 
 * To run: $ node fake_request_data.js
 *
 * fake_request_data.js - Short script to fake requests to make sure
 * that pagination works as expected. Uses the 'faker' library to create
 * requests in the admin
 * 
 * Copyright (C) 2015  American Red Cross
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

var db = require('./../models');
var _ = require('underscore');
var faker = require('faker');
var requestCount = 725; // TODO: Make configurable
var requests = [];
var regions = ['IDMT', 'NDSD', 'KSNE', 'IOWA', 'WEMO', 'EAMO', 'WISC', 'CHNI', 'CSIL', 'MINN', 'XXXX'];
_.times(requestCount, function(index) {
	var requestData = {
		name: faker.name.findName(),
    	        address: faker.address.streetAddress(),
                assigned_rc_region: faker.random.arrayElement(regions),
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
