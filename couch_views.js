/*
 * These js functions are used to create views in CouchDB.  Couch "views" are
 * somewhat like queries, in that they return matching results from the
 * database.  In these views, we search by a "key."  (For more about
 * CouchDB views, see http://guide.couchdb.org/editions/1/en/views.html.)
 *
 * DETAILED INSTRUCTIONS IF YOU'RE NEW TO THIS:
 * --------------------------------------------
 *
 * Here's a detailed walk-through of how to create each of these
 * views in the appropriate database in CouchDB:
 *
 * Go to http://127.0.0.1:5984/_utils/.  You should see a list of
 * databases, e.g., "smoke_alarm_requests", "us_addresses", etc.
 *
 * Say we're going to create the 'by-zip-code' view function in
 * 'us_addresses'.  Click on 'us_addresses' to enter that database.
 * In the upper right, change the "View:" selector, which is probably
 * set to "All documents" by default, to "Design documents" instead
 *
 *   (Note: Design documents are a special kind of document in
 *   CouchDB, containing application code that CouchDB then uses to
 *   provide applications with an API for interacting with the
 *   database in which the design document resides.  For example, a
 *   design doc might offers Javascript functions used for the "map"
 *   phase of a Map-Reduce process; that's how we're using them in
 *   this application.  For more about design documents in CouchDB,
 *   see http://guide.couchdb.org/editions/1/en/design.html.)
 *
 * Now you're probably looking at a page showing 0 rows, because there
 * are no design docs for 'us_addresses' yet.  Click 'New Document' in
 * the upper left, and immediately replace the auto-generated _id
 * (some garbage like "e5db861e7bacaa5565d6f7b150885a38") with this:
 * "_design/us_addresses"
 *
 * Now we've named a design document for this database, but the design
 * doc doesn't yet have any views (which are written in Javascript).
 * Let's add one.
 * 
 * First, tell the design document what language views are written in.
 * Click on "Add field" at the upper right.  For the field's name,
 * enter "language", and for its value (double click on 'null' to set
 * the value -- yes, I know that's not intuitive) put "javascript".
 *
 * Now to finally add the code!  Click "Add field" again, and for the
 * new field's _id put "views".  The value is going to be a JSON
 * dictionary mapping view names to view code.  (Well, actually it
 * maps view names to sub-dictionaries that further map view function
 * types to the corresponding view code.  But the only view function
 * type we care about here is the map, as you'll see.)  The value will
 * look like this, with real code substituted in of course:
 * 
 *   { "by-zip-code": { "map" : "JAVASCRIPT_CODE_HERE" } }
 * 
 * The Javascript code in question is written out in this file with
 * nice indentation and multiple lines, e.g.:
 *
 *   function(doc) {
 *     if (doc.zip) {
 *       emit(doc.zip, [doc.county, doc.state]);
 *     }
 *   }
 *
 * You could put it in the view like that, or you could compactify it
 * as below -- either way is fine:
 *
 *   { "by-zip-code": { "map" : "function(doc) {if (doc.zip){emit(doc.zip, [doc.county, doc.state]);}}" } }
 *
 * Finally -- VERY IMPORTANT -- don't forget to go to the upper right
 * and click "Save Document".  Now you have a design doc with views!
 *
 * To test the view -- that is, run the MapReduce process for which
 * this view provides the map function -- try this:
 *
 *   $ curl -H 'Content-Type: application/json' -X GET "http://127.0.0.1:5984/us_addresses/_design/us_addresses/_view/by-zip-code?key=%2260202%22"
 *
 *   (Note: the "%22" around the zip code is just URL-escaping for "/".  
 *   CouchDB has a rule that "/" in a document ID must be escaped in a
 *   URL, but makes an exception for the "/" in the IDs of design
 *   documents, because those IDs are seen by human eyes so often and
 *   need to be recognizeable & readable to aid debugging.)
 *
 * From that query, you should get back a result something like this:
 *
 *  {"total_rows":42521,"offset":42521,"rows":[
 *  
 *  ]}
 *
 * Fun trick: try running the query a second time and notice how
 * vastly much more quickly the result comes back this time!  CouchDB
 * caches view results, and even updates the cache when you update the
 * database.  So things are slow the first time, but then jumping fast
 * after that.
*/

/* by-zip-code
 *
 * When creating this view in futon, you should enter these fields and values:

 | Field    |       Value                        |
 +-----------------------------------------------+
 | _id      | _design/us_addresses               |
 | language | javascript                         |
 | views    | { "by-zip-code": { "map": " <JS    |
 |          |    FUNCTION BELOW GOES HERE> "}}   |


 * Takes: a zipcode as the key
 * Returns: a JSON array with zipcodes as keys and [county, state]
 * pairs as values.
 * Example call:
 * curl -H 'Content-Type: application/json' -X GET http://localhost:5984/us_addresses/_design/us_addresses/_view/by-zip-code?key=%2260101%22
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


 * Takes: a state name and county name as keys
 * Returns: a JSON array with county name as key and Red Cross region
 * as value.
 * Example call:
 * curl -H 'Content-Type: application/json' -X GET http://localhost:5984/selected_counties/_design/selected_counties/_view/county-matchup?key=%22Ada%22
*/
function(doc) {
    if (doc.state && doc.county && doc.region) {
        emit([doc.state, doc.county], doc.region);
    }
}

