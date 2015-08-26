/* Specs for the index.js route, the main route of the application.
 * This app is currently using supertest, a module for express
 * "unit" testing. I put "unit" in quotes because at this point,
 * supertest walks and quacks like an integration test than a unit
 * test. That being said, having integration automated tests serves
 * us better than having no automated tests at all.
 *
 * This file is part of:
 *
 * Smoke Alarm Installation Request Portal (getasmokealarm.org)
 * 
 * Copyright (C) 2015  American Red Cross
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
var request = require('supertest'),
    express = require('express'),
    db = require('./../models', {logging:console.log}),
    chai = require('chai'),
    chaiAsPromised = require('chai-as-promised');

var expect = chai.expect;

var app = require('../app.js');

describe("GET", function() {
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
