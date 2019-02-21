/*
 * Copyright (C) 2019  American Red Cross
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

/*
 * This is a one off script that should be used to bring requests in line
 * with the new usage of having chapters in the database, a la Issue #277.
 * It can be run multiple times, and can be rerun any time we add counties
 * to the SelectedCounties table, since we may want to go back and update 
 * previously unsatisfiable requests.
 *
 * Run via:
 *  $ node data/update_request_counties.js
 */

var db = require('../models');
var utilities = require('../views/utilities');

// The utilities function assumes it's in a request, so we wrap here so we
// can reuse that code.
function simplifyZip(zip) {
  return zip && utilities.findZipForLookup({ body: {zip: zip} }).zip_for_lookup;
}

db.Request.findAll()
  .then(requests => {
    return Promise.all([
      requests,
      Promise.all(
        requests.map(request => {
          return utilities.findAddressFromZip(simplifyZip(request.zip));
        }))
    ]);
  }).then(([requests, addresses]) => {
    return Promise.all([
      requests,
      Promise.all(
        requests.map(function(request, idx) {
          var address = addresses[idx];
          return utilities.findCountyFromAddress(address, simplifyZip(request.zip));
        }))]);
  }).then(([requests, counties]) => {
      requests.map(function(request, idx) {
        var county = counties[idx];
        return request.setSelectedCounty(county);
      });
  });
