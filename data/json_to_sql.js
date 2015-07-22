/* - import_into_postgres.js - 
 *
 * Node-based script that converts JSON static data files to SQL, for
 * subsequent import into PostgreSQL.  The SQL emitted is appropriate
 * for use with Sequelize ORM (https://github.com/sequelize/sequelize)
 * application models.
 *
 * This script should be run from the top of the source tree (i.e.,
 * ../ relative to here), like so:
 *
 *   $ node data/import_into_postgres.js
 *
 * It may take a while (possibly a couple of minutes).  If there are
 * no errors, it will return silently, having created two new files:
 *
 *   data/selected_counties.sql
 *   data/us_addresses.sql
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

fs.unlink('data/selected_counties.sql');
_.each(selectedCountiesJson.docs, function(element) {
	var insertSelectedCountySql = 'INSERT INTO "SelectedCounties"' +
		'("id","region","state","county","createdAt","updatedAt") VALUES' +
		'(DEFAULT,' 
			+ quote(element.region) + "," 
			+ quote(element.state) + "," 
			+ quote(element.county) + ",now(),now());\n";
	fs.appendFileSync('data/selected_counties.sql', insertSelectedCountySql);
});

fs.unlink('data/us_addresses.sql');
_.each(usAddressesJson.docs, function(element) {
	var insertUsAddressSql = 'INSERT INTO "UsAddresses"' +
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
		quote(element.county) + ',' +
		quote(element.timezone) + ',' +
		'quote_literal(\'' + element.area_codes + '\'),' +
		element.latitude + ',' +
		element.longitude + ',' +
		quote(element.world_region) + ',' +
		quote(element.country) + ',' +
		((element.decommissioned === 0) ? true: false) + ',' +
		element.estimated_population + ',' +
		quote(element.notes) + ",now(),now());\n";
	fs.appendFileSync('data/us_addresses.sql', insertUsAddressSql);

});