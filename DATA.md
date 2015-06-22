# Using Data for couchdb

Some documentation on installing & using data for this application

The data used to determine whether the user is in a valid region
served by the application comes from the Counties listed in PDFs from
the Red Cross and a Zip Code database of the state. In addition, there
are two CouchDB map functions for "Couch Views", which should return
documents that match certain query criteria.  These files are all in
the "data" directory, with the exception of "couch_views.js."

1. US Addresses with zip code & county: data/us_addresses.json
2. Counties Included in Red Cross Region: data/selected_counties.json
3. Functions used for Couch views: couch_views.js

__Create database and upload data to couchdb server:__

    ## Create databases.  Each command creates the given database if
    ## if that database doesn't exist, else gives a harmless error if
    ## the database already exists.  (However, if the database already
    ## exists, you may want to see what's in it before you perform the
    ## data-loading steps that come next.)
    $ curl -X PUT http://127.0.0.1:5984/smoke_alarm_requests
    $ curl -X PUT http://127.0.0.1:5984/selected_counties
    $ curl -X PUT http://127.0.0.1:5984/us_addresses

    ## Load data.  These commands may spew a lot of JSON to your screen;
    ## pass the -s / --silent flag to curl if you don't want the spew.
    $ curl -H 'Content-Type: application/json' -X POST http://localhost:5984/us_addresses/_bulk_docs -d @data/us_addresses.json
    $ curl -H 'Content-Type: application/json' -X POST http://localhost:5984/selected_counties/_bulk_docs -d @data/selected_counties.json

Go to http://localhost:5984/_utils/ in the browser.

[Here](http://blog.vicmetcalfe.com/2011/04/11/creating-views-in-couchdb-futon/)
is a guide for creating views in futon.  More about making our specific views is
included in `/couch_views.js`.

Or, create these specific views from the command line:

```
curl -X PUT http://localhost:5984/us_addresses/_design/us_addresses -d \
'{
   "_id": "_design/us_addresses",
   "language": "javascript",
   "views": { "by-zip-code": { "map": "function(doc) { if (doc.zip) { emit(doc.zip, [doc.county, doc.state]); } }" } }
}'

curl -X PUT http://localhost:5984/selected_counties/_design/selected_counties -d \
'{
   "_id": "_design/selected_counties",
   "language": "javascript",
   "views": { "county-matchup": { "map": "function(doc) { if (doc.state && doc.county && doc.region) { emit([doc.state, doc.county], doc.region); } }" } }
}'


```