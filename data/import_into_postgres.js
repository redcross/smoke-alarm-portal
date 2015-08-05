/* - import_into_postgres.js - Node based script to import JSON files
 * into PostgreSQL using Sequelize ORM (github.com/sequelize/sequelize)
 * for the application models.  Usage: '$ node data/import_into_postgres.js'
 */
console.log("BEGINNING: " + new Date());
var _ = require('underscore'); // Used primarily for iterator
var fs = require('fs'); // File system access
/* import JSON using node require */
var selectedCountiesJson = require('../data/selected_counties.json');
var usAddressesJson = require('../data/us_addresses.json');

/* Create the SQL files to import
/* Import the selected counties from JSON. Create Counties using
 * Model.create() function from Sequelize.
 */
/*
* TBD: These are now being added using Javascript Promises, but I
* (cdonnelly) don't know enough about them to add a note here.  Can you
* elaborate, msnyon?
*/

var theseCounties = null;
var docs = null;
var db = require('./../models');
db.SelectedCounties.sync().then(function () {
	db.SelectedCounties.bulkCreate(selectedCountiesJson.docs).then(function() {
		db.UsAddress.sync().then(function() {
			db.UsAddress.bulkCreate(usAddressesJson.docs);
		});
	});
})
.catch(function(error) {
	console.log("Error installing: " + error);
});

