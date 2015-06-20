/* These are map() functions to be used in the browser.
 * They can be accessed through the following URLs (browser or cURL)
 * county-matchup:
 * http://localhost:5984/selected_counties/_design/selected_counties/_view/county-matchup?key=%22Ada%22
 * by-zip-code:
 * http://localhost:5984/us_addresses/_design/us_addresses/_view/by-zip-code?key=%2260101%22
 * Instructions for creating a view are in DATA.md

/* us_addresses/by-zip-code
 *
 *  View used for zip
 */

function(doc) {
  if (doc.zip) {
    emit(doc.zip, [doc.county, doc.state]);
  }
}

/* selected_counties/county-matchup
 *
 * View received for matching countries
 */

function(doc) {
  if (doc.County) {
     emit([doc.County,doc.region]);
  }
}