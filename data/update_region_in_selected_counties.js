/* update_region_in_selected_counties.js - Node based script to change 
 * the "region" column in the selectedCounties model to match the top 
 * level keys in the config/recipients.json.tmpl document.
 * JSON files * into PostgreSQL using Sequelize ORM 
 * (github.com/sequelize/sequelize) for the application models.  Usage:
 * '$ node data/update_region_in_selected_counties.js'
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

var _ = require('underscore'); // Used primarily for iterator
var fs = require('fs'); // File system access

var regionNameSwitch = {
	"Iowa": "rc_iowa",
	"Kansas Nebraska SW Iowa": "rc_kansas_nebraska_sw_iowa",
	"Southern Illinois":"rc_southern_illinois",
	"ARC of Chicago and Northern Illinois":"rc_chicago_northern_illinois",
	"Dakotas": "rc_dakotas",
	"Eastern Missouri": "rc_eastern_missouri",
	"Idaho and Montana" : "rc_idaho_montana",
	"Minnesota" : "rc_minnesota",
	"Western Missouri" : "rc_western_missouri",
	"Wisconsin" : "rc_wisconsin"
};

var inputFileString = fs.readFileSync('data/selected_counties.json').toString();
console.log("Input File String:" + inputFileString);
_.each(Object.keys(regionNameSwitch), function(element, index, list) {
	console.log("Element = " + JSON.stringify(element) + " Value = " + regionNameSwitch[element]);
	var regionBefore = '"region":"' + element + '"';
	var regionExp = new RegExp(regionBefore, 'g');
	var regionAfter = '"region":"' + regionNameSwitch[element] + '"';
	console.log("Region Before = " + regionBefore); 
	console.log("Region After = " + regionAfter);
	console.log("Region Exp = " + regionExp);
	inputFileString = inputFileString.replace(regionExp, regionAfter);
});
var outputFile = fs.writeFileSync('data/selected_counties.json', inputFileString);


