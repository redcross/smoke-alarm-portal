/* Specs for the index.js route, the main route of the application.
 * This app is currently using supertest, a module for express
 * "unit" testing. I put "unit" in quotes because at this point,
 * supertest walks and quacks like an integration test than a unit
 * test. That being said, having integration automated tests serves
 * us better than having no automated tests at all.
 */
var request = require('supertest'),
    express = require('express'),
    db = require('./../models'),
    chai = require('chai'),
    chaiAsPromised = require('chai-as-promised');

var expect = chai.expect;

var app = require('../app.js');

describe('GET', function() {
    it('responds with an index page in HTML', function(done) {
        request(app)
            .get('/')
            .set('Accept', 'text/html')
            .expect(200)
            .end(function(err, res) {
                expect(res.text).to.contain('Thank you for your interest');
                done();
            });
    });
});

describe("POST", function() {
    var insertInRangeAddress = function() {
        return db.UsAddress.create({
            zip: "60602",
            type: "STANDARD",
            primary_city: "Chicago",
            acceptable_cities: "''",
            unacceptable_cities: "''",
            state: "Illinois",
            county: "Cook County",
            timezone: "America/Chicago",
            area_codes: "312,630,773",
            latitude: "41.83",
            longitude: "-87.68",
            world_region: "NA",
            country: "US",
            decommissioned: false,
            estimated_population: 1657
        });
    };

    var insertOutOfRangeAddress = function() {
        return db.UsAddress.create({
            zip: "10026",
            type: "STANDARD",
            primary_city: "New York",
            acceptable_cities: "''",
            unacceptable_cities: "''",
            state: "New York",
            county: "New York County",
            timezone: "America/New York",
            area_codes: "212,646,347",
            latitude: "40.71",
            longitude: "-73.99",
            world_region: "NA",
            country: "US",
            decommissioned: false,
            estimated_population: 24221
        });
    };
    var insertCounty = function() {
        return db.rcRegionsByCounty.create({
            region: "ARC of Chicago and Northern Illinois",
            state: "Illinois",
            county: "Cook"
        });
    };

    before(function() {
        insertInRangeAddress()
            .then(insertCounty())
            .then(insertOutOfRangeAddress());
    });

    it('redirects to the thank you page when receiving an address in a supported region', function(done) {
        request(app)
            .post('/')
            .send({
                name: 'Midwestern Resident',
                street_address: '69 W. Washington',
                city: 'Chicago',
                state: 'Illinois',
                zip: '60602',
                phone: '7185551212',
                email: 'here@there.com'
            })
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);
                expect(res.text).to.contain('Thank you for your smoke alarm installation request');
                done();
            });
    });

    it('redirects to the sorry page with county of address entered'
        + 'when receiving an address not in the supported region ', function (done) {
        request(app)
        .post('/')
        .send({
            name: 'New York Denizen',
            street_address: '125 W. 110th Street',
            city: 'New York',
            state: 'New York',
            zip: '10026',
            phone: '7185551212',
            email: 'here@there.com'
        })
        .expect(200)
        .end(function(err, res) {
            if (err) return done(err);
            expect(res.text).to.contain("Sorry, the Red Cross Region serving");
            done();
        });
    });

    // TODO: Need separate test for when the zip code is valid but the
    // region that it indicates is not one of the supported regions.

    it('redirects to sorry page when zip code is not recognized', function(done) {
        request(app)
            .post('/')
            .send({
                name: 'New York Denizen',
                street_address: '125 W. 103rd Street',
                city: 'New York',
                state: 'New York',
                zip: '65957',
                phone: '7185551212',
                email: 'here@there.com'
            })
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);
                expect(res.text).to.contain("Sorry, we don't recognize any U.S. location for Zip Code");
                done();
            });
    });
});
