# Using Data for couchdb

Some documentation on installing & using data for this application

The data used to determine whether the user is in a valid region served by the application comes from the Counties listed in PDFs from the Red Cross and a Zip Code database of the state. In addition, there are two CouchDB map functions for "Couch Views", which should return documents that match certain query criteria.
These files are all in the "data" directory, with the exception of "views"

1. US Addresses with zip code & county: data/us_addresses.json
2. Counties Included in Red Cross Region: data/selected_counties.json
3. functions used for Couch views: couch_views.js


Create database and Upload data to couchdb server:
In order to upload data to the couchdb server, please use cURL or another agent that makes requests and includes files as POST data. cURL syntax is shown here:

curl -X PUT http://127.0.0.1:5984/smoke_alarm_requests
curl -X PUT http://127.0.0.1:5984/selected_countries
curl -H 'Content-Type: application/json' -X POST http://localhost:5984/us_addresses/_bulk_docs -d @data/us_addresses.json
curl -H 'Content-Type: application/json' -X POST http://localhost:5984/selected_counties/_bulk_docs -d @data/selected_counties.json

Go to http://localhost:5984/_utils/ in the browser
Use [this](http://blog.vicmetcalfe.com/2011/04/11/creating-views-in-couchdb-futon/) as a guide for creating views in futon.
