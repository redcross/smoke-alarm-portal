/* - import_into_postgres.js - Node based script that imports JSON files
 * into Postgres in conjunction with the data store migration from CouchDB,
 * This script uses the Sequelize ORM (https://github.com/sequelize/sequelize)
 * for the application models.
 *
 * The script should be installed using the following syntax:
 * > node data/import_into_postgres.js
 */
console.log("BEGINNING: " + new Date());
var _ = require('underscore'); // Used primarily for iterator
var fs = require('fs'); // File system access
var db = require('./../models');
/* import JSON using node require */
var selectedCountiesJson = require('../data/selected_counties.json');
var usAddressesJson = require('../data/us_addresses.json');

/* Create the SQL files to import
/* Import the selected counties from JSON. Create Counties using
 * Model.create() function from Sequelize.
 */

var insertCounties = function() {
	return db.SelectedCounties.bulkCreate(selectedCountiesJson.docs);
}

var insertUsAddresses = function() {
	return db.UsAddress.bulkCreate(usAddressesJson.docs);
}


	insertCounties()
	.then(insertUsAddresses())
	.then(function(docs) {
		console.log("DEBUG: Update complete, methinks? " + JSON.stringify(docs));
	})
	.catch(function(error) {
		console.log("ERROR: Houston, we have a problem: " + error);
	});

console.log("ENDING: " + new Date());
