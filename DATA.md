# Using Data for couchdb

Some documentation on installing & using data for this application

The data used to determine whether the user is in a valid region served by the
application comes from the Counties listed in PDFs from the Red Cross and a Zip
Code database of the state. In addition, there are two CouchDB map functions for
"Couch Views", which should return documents that match certain query criteria.
These files are all in the "data" directory, with the exception of "couch_views.js."

1. US Addresses with zip code & county: data/us_addresses.json
2. Counties Included in Red Cross Region: data/selected_counties.json
3. Functions used for Couch views: couch_views.js


__Create database and upload data to couchdb server:__

curl -X PUT http://127.0.0.1:5984/smoke_alarm_requests
curl -X PUT http://127.0.0.1:5984/selected_counties
curl -X PUT http://127.0.0.1:5984/us_addresses
curl -H 'Content-Type: application/json' -X POST http://localhost:5984/us_addresses/_bulk_docs -d @data/us_addresses.json
curl -H 'Content-Type: application/json' -X POST http://localhost:5984/selected_counties/_bulk_docs -d @data/selected_counties.json

    $ sudo couchdb
    # creates db.  Do not run this line if the database already exists
    $ curl -X PUT http://127.0.0.1:5984/smoke_alarm_requests
    $ curl -X PUT http://127.0.0.1:5984/selected_counties
    $ curl -X PUT http://127.0.0.1:5984/us_addresses
    $ curl -H 'Content-Type: application/json' -X POST http://localhost:5984/us_addresses/_bulk_docs -d @data/us_addresses.json
    $ curl -H 'Content-Type: application/json' -X POST http://localhost:5984/selected_counties/_bulk_docs -d @data/selected_counties.json

Go to http://localhost:5984/_utils/ in the browser.

[Here](http://blog.vicmetcalfe.com/2011/04/11/creating-views-in-couchdb-futon/)
is a guide for creating views in futon.  More about making our specific views is
included in `/couch_views.js`.

TODO: find out and describe how to create views from the command line.
