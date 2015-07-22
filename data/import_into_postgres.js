/* - import_into_postgres.js - Node based script that imports JSON files
 * into Postgres in conjunction with the data store migration from CouchDB,
 * This script uses the Sequelize ORM (https://github.com/sequelize/sequelize)
 * for the application models.
 *
 * The script should be installed using the following syntax:
 * > node data/import_into_postgres.js
 */

var _ = require('underscore'); // Used primarily for iterator
var fs = require('fs'); // File system access
var escape = require('pg-escape');
/* import JSON using node require */
var selectedCountiesJson = require('../data/selected_counties.json');
var usAddressesJson = require('../data/us_addresses.json');

/* Create the SQL files to import
/* Import the selected counties from JSON. Create Counties using
 * Model.create() function from Sequelize.
 */

 var quote = function(term) {
 	var secondTerm = String(term).replace(/'/g, "''");
 	var finalTerm = "'" + secondTerm.replace(/\,/g, "\,") + "'";
 	// console.log("FINAL TERM: " + finalTerm);
 	return finalTerm;
 };

_.each(selectedCountiesJson.docs, function(element) {
	var insertSelectedCountySql = 'INSERT INTO "SelectedCounties"' +
		'("id","region","state","county","createdAt","updatedAt") VALUES' +
		'(DEFAULT,' 
			+ quote(element.region) + "," 
			+ quote(element.state) + "," 
			+ quote(element.county) + ",now(),now());\n";
	fs.appendFileSync('selected_counties.sql', insertSelectedCountySql);
});

_.each(usAddressesJson.docs, function(element) {
	var insertUsAddressSql = 'INSERT INTO "UsAddress"' +
		'("id","zip","type","primary_city","acceptable_cities","unacceptable_cities",' +
		'"state","county","timezone","area_codes","latitude","longitude","world_region",' +
	 	'"country","decommissioned","estimated_population","notes","updatedAt","createdAt")' +
		' VALUES ' +
		'(DEFAULT,' +
		quote(element.zip) + ',' +
		quote(element.type) + ',' +
		quote(element.primary_city) + ',' +
		"'',''," +
		quote(element.state) + ',' +
		quote(element.country) + ',' +
		quote(element.timezone) + ',' +
		'quote_literal(\'' + element.area_codes + '\'),' +
		element.latitude + ',' +
		element.longitude + ',' +
		quote(element.world_region) + ',' +
		quote(element.country) + ',' +
		((element.decommissioned === 0) ? true: false) + ',' +
		element.estimated_population + ',' +
		quote(element.notes) + ",now(),now());\n";
	fs.appendFileSync('us_addresses.sql', insertUsAddressSql);

});