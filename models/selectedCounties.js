/* Smoke Alarm Installation Request Portal (getasmokealarm.org)
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

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('SelectedCounties', {
		region: DataTypes.TEXT,
		state: DataTypes.TEXT,
		county: DataTypes.TEXT,
		
		// This function gets the selected county if it exists from the requests
		findCountyFromAddress: function(address, zip) {
				var requestData = {
					countyFromZip: null,
					stateFromZip: null,
					zip_for_lookup: zip
				}
			
		    if (!address) {
		        return null;
		    } 
		
		
		    requestData.countyFromZip = address['county'].replace(" County", "");
		    requestData.stateFromZip = address['state'];
		
		    return this.findOne({
		        where: {
		            // Use the PostgreSQL "ILIKE" (case-insensitive LIKE)
		            // operator so that internal inconsistencies in the
		            // case-ness of our data don't cause problems.  For
		            // example, Lac qui Parle County, MN is "Lac qui
		            // Parle" (correct) in ../data/selected_counties.json
		            // but "Lac Qui Parle" (wrong) in us_addresses.json.
		            //
		            // Since us_addresses.json comes from an upstream data
		            // source, correcting all the cases there could be a
		            // maintenance problem.  It's easier just to do our
		            // matching case-insensitively.
		            //
		            // http://docs.sequelizejs.com/en/latest/docs/querying/
		            // has more about the use of operators like $ilike.
		            county: { $ilike: requestData.countyFromZip },
		            state: { $ilike: requestData.stateFromZip }
		        }
		    });
		}
	})
}
