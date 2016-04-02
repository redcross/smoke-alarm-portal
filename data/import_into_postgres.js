/* - import_into_postgres.js - Node based script to import JSON files
 * into PostgreSQL using Sequelize ORM (github.com/sequelize/sequelize)
 * for the application models.  Usage: '$ node data/import_into_postgres.js'
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

console.log("sync SelectedCounties");
db.SelectedCounties.sync()
.then(function () {
	console.log("bulkCreate selectedCountiesJson.docs");
	return db.SelectedCounties.bulkCreate(selectedCountiesJson.docs);
})
.then(function() {
	console.log("sync UsAddress");
	return db.UsAddress.sync();
})
.then(function() {
	console.log("bulkCreate useAddressJson.docs");
	return db.UsAddress.bulkCreate(usAddressesJson.docs);
})
.catch(function(error) {
	console.log("Error installing: " + error);
});
