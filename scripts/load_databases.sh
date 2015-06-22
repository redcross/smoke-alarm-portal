#!/bin/sh

# Refresh and restart a smoke-alarm-portal development server, assuming that
# couchdb is already running on your localhost
#
# WARNING: This will drop your databases, and you will only have the
# region/state data.  All requests will be lost.
#
# This should be used for development purposes only.
#
# Usage: run source scripts/load_databases.sh from the top-level of the smoke-alarm-portal

# we need to check that we're in the correct directory
# I should check here to see if couchdb is running

#drop all databases
curl -X DELETE http://127.0.0.1:5984/smoke_alarm_requests
curl -X DELETE http://127.0.0.1:5984/selected_counties
curl -X DELETE http://127.0.0.1:5984/us_addresses

#recreate the databases
curl -X PUT http://127.0.0.1:5984/smoke_alarm_requests
curl -X PUT http://127.0.0.1:5984/selected_counties
curl -X PUT http://127.0.0.1:5984/us_addresses


# Load data.  These commands may spew a lot of JSON to your screen;
# pass the -s / --silent flag to curl if you don't want the spew.
curl -H 'Content-Type: application/json' -X POST http://localhost:5984/us_addresses/_bulk_docs -d @data/us_addresses_0.json
curl -H 'Content-Type: application/json' -X POST http://localhost:5984/us_addresses/_bulk_docs -d @data/us_addresses_1.json
curl -H 'Content-Type: application/json' -X POST http://localhost:5984/us_addresses/_bulk_docs -d @data/us_addresses_2.json
curl -H 'Content-Type: application/json' -X POST http://localhost:5984/us_addresses/_bulk_docs -d @data/us_addresses_3.json
curl -H 'Content-Type: application/json' -X POST http://localhost:5984/us_addresses/_bulk_docs -d @data/us_addresses_4.json
curl -H 'Content-Type: application/json' -X POST http://localhost:5984/us_addresses/_bulk_docs -d @data/us_addresses_5.json
curl -H 'Content-Type: application/json' -X POST http://localhost:5984/us_addresses/_bulk_docs -d @data/us_addresses_6.json
curl -H 'Content-Type: application/json' -X POST http://localhost:5984/us_addresses/_bulk_docs -d @data/us_addresses_7.json
curl -H 'Content-Type: application/json' -X POST http://localhost:5984/us_addresses/_bulk_docs -d @data/us_addresses_8.json
curl -H 'Content-Type: application/json' -X POST http://localhost:5984/us_addresses/_bulk_docs -d @data/us_addresses_9.json
curl -H 'Content-Type: application/json' -X POST http://localhost:5984/selected_counties/_bulk_docs -d @data/selected_counties.json

# Create the views
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
