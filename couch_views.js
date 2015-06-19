/*
 * These js functions are used to create views in CouchDB.  Couch "views" are
 * somewhat like queries, in that they return matching results from the
 * database.  In these views, we search by a "key."
 *
 * We've included example calls to these views, with example keys.  We can call 
 * them via a browser or through cURL.
 *
*/

/* by-zip-code 
 * 
 * When creating this view in futon, you should enter these fields and values:

 | Field    |       Value                        |
 +-----------------------------------------------+
 | _id      | _design/us_addresses               |
 | language | javascript                         |
 | views    | { "by-zip-code": { "map": " <js    |
 |          |    function below goes here> "}}   |


 * Takes: a zipcode as the key
 * Returns: a JSON array with zipcodes as keys and [county, state]
 * pairs as values.  
 * Example call: 
 * http://localhost:5984/us_addresses/_design/us_addresses/_view/by-zip-code?key=%2260101%22
*/

function(doc) {
  if (doc.zip) {
      emit(doc.zip, [doc.county, doc.state]);
  }
}

/* county-matchup
 *
 * When creating this view in futon, you should enter these fields and values:

 | Field    |       Value                        |
 +-----------------------------------------------+
 | _id      | _design/selected_counties          |
 | language | javascript                         |
 | views    | { "county-matchup": { "map": " <js |
 |          |    function below goes here> "}}   |


 * Takes: a county name as the key
 * Returns: a JSON array with county name as key and Red Cross region
 * as value.  
 * Example call: 
 * http://localhost:5984/selected_counties/_design/selected_counties/_view/county-matchup?key=%22Ada%22
*/
function(doc) {
  if (doc.County) {
     emit(doc.County, doc.region);
  }
}