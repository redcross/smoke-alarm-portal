var env = process.env.NODE_ENV || 'development';
var config = require(__dirname + '/../../config/config.json')[env];
var twilio = require('twilio');
var parser = require('parse-address'); 

var http = require('http'),
    express = require('express'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser');

var app = express();
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(cookieParser())
var serial_num = "example serial";
var rc_local = "(555)-not-real";

// array of script responses
var responses_array = ["Welcome to the smoke alarm request system (para español, texto 'ES'). We need to ask four questions to process your request. Please text back the answer to each and wait for the next question. First, what is your name?", "What is your address, including the unit number, city, state, and zipcode?", "Is the number you're texting from the best way to get in touch with you? If so, text YES. Otherwise, please text a phone number where we can reach you.", "One last question: is there an email address we can use to contact you? If not, text NONE. If yes, please text us the email address.", "Thank you for your smoke alarm request! Your request number is " + serial_num + ". To contact your local Red Cross about this request, call " + rc_local + ". We will be in touch with you to schedule an installation."];
var request_object = {};

// include the functions from views/index.js
var save_utils = require('../utilities');

// Generally to find the county and region we use the zipcode, so this
// takes the entered zip.
// TODO: it needs to return a serial number and a contact phone number
// for the region the person is requesting from.  Or, of course, a
// generic "sorry" if they're out of area or in an inactive region.

var saveRequest = function (zip) {
    save_utils.findAddressFromZip(zip).then(function(address) {
        return save_utils.findCountyFromAddress(address, zip);
    }).then( function(county_id){
        if (county_id){
            region_code = county_id.region;
        }
        else {
            region_code = null
        }
        request_object.street_address = request_object.address.number + " " + request_object.address.street + " " + request_object.address.type + " " + request_object.address.sec_unit_type + " " + request_object.address.sec_unit_num;
        request_object.city = request_object.address.city;
        request_object.state = request_object.address.state;
        request_object.zip_final = request_object.address.zip;
        request_object.assigned_rc_region = region_code;
        return save_utils.countRequestsPerRegion(region_code);
    }).then( function(numRequests) {
        requestData = save_utils.createSerial(numRequests, request_object, region_code);
        return save_utils.saveRequestData(requestData);
    }).then(function(request) {
        savedRequest = request;
        // TODO: construct the final text with the new serial number
    });

};
 
exports.respond = function(req, res) {
    var twiml = new twilio.TwimlResponse();
    var counter = parseInt(req.cookies.counter) || 0;

    // Increment or initialize views, up to the length of our array.  If
    // we're at the end of the array, start over.
    if (counter >= responses_array.length) {
        counter = 0;
    }

    // Use the counter to find out what information is arriving:
    if (counter == 1) {
        request_object.name = req.query.Body;
    }
    else if (counter == 2) {
        // then it is their address
        request_object.address = req.query.Body;
        request_object.address = parser.parseLocation(request_object.address);
        // TODO: if we didn't get a zip, add another response in here to
        // ask for it specifically
    }
    else if (counter == 3) {
        var phone_check = req.query.Body;
        // handle any capitalization
        phone_check = phone_check.toLowerCase();
        
        if (phone_check == "yes") { 
            request_object.phone = req.query.From;
        }
        else {
            request_object.phone = req.query.Body;
        }
    }
    else if (counter == 4) {
        // this is their email address, or none.
        request_object.email = req.query.Body;
    }

    // construct a request object and insert it into the db
    if (request_object.address) {
        var response_elements = saveRequest(request_object.address.zip);
    }
    console.log("DEBUG: " + JSON.stringify(request_object));
    
    twiml.message(responses_array[counter]);

    counter = counter + 1;
    res.cookie('counter',counter);
    res.writeHead(200, {'Content-Type': 'text/xml'});
    res.end(twiml.toString());

};


