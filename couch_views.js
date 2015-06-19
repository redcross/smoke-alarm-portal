/* us_addresses/by-zip-code
 *
 *  View used for zip
 */

function(doc) {
  if (doc.zip) {
    emit([doc.zip, doc.county, doc.state]);
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