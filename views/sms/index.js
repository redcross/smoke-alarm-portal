var env = process.env.NODE_ENV || 'development';
var config = require(__dirname + '/../../config/config.json')[env];
var parser = require('parse-address'); 

var client = require('twilio')(config.twilio_accountSid, config.twilio_authToken);

var http = require('http'),
    express = require('express'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser');

var i18n = require('i18n-2');

var app = express();
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(cookieParser());

app.use(function(req, res, next) {
    req.i18n.setLocaleFromCookie();
    // can set this here for testing purposes
    // req.i18n.setLocale('es');
    next();
});
var i18n_inst = new (i18n)({
    // setup some locales - other locales default to en silently
    locales: ['en', 'es'],
    // change the cookie name from 'lang' to 'locale'
    cookieName: 'locale'
});
var __ = function(s) { return i18n_inst.__(s); }
var serial_num = "example serial";
var rc_local = "(555)-not-real";

var request_object = {};
// include the functions from views/index.js
var save_utils = require('../utilities');

/*
 * Takes: the "outcome" (a boolean that is true iff the entered zip code
 * is valid and in an active region),
 * If the outcome was successful:
 * serial: the serial number assigned to the request
 * county: the county found based on the entered zipcode
 * contact: the phone number for this RC region
 * phone: the number to send the message to
 *
 * Returns: a message with "thank you," the serial number, and a contact
 * phone for successful outcomes and a "sorry" message with a generic RC
 * phone number for out-of-area zip codes (just like the website).
*/
var constructFinalText = function (outcome, request, contact, phone) {
    var msg = "";
    if (outcome) {
        msg = __("Thank you for your smoke alarm request! Your request number is %s.", request.serial)+ __("To contact your local Red Cross about this request, call %s. We will be in touch with you to schedule an installation.", contact);
    }
    else {
        if (request.county) {
            msg = __("Sorry, the Red Cross Region serving %s County, %s does not yet offer smoke alarm installation service.", request.county, request.state);
        }
        else {
            // invalid zip
            msg = __("Sorry, we don't recognize any U.S. location for Zip Code \"%s\".  Are you sure you entered an accurate Zip Code?", request.zip);
        }
    }
        client.sendMessage({
            to: phone,
            from: config.twilio_phone,
            body: msg
        }, function(err, responseData) {
            if (!err) {
                console.log("DEBUG: message sent successfully");
                return;
            }
            else {
                console.log("DEBUG: error sending message");
                console.log(err);
                return;
            }
        });
};


/* Generally to find the county and region we use the zipcode, so this
 * takes the entered zip and the phone number to send the final message to.
 * Returns nothing, but saves the request to the database.
*/
var saveRequest = function (zip, phone) {
    save_utils.findAddressFromZip(zip).then(function(address) {
        request_object.county = address['county'];
        return save_utils.findCountyFromAddress(address, zip);
    }).then( function(county_id){
        if (county_id){
            region_code = county_id.region;
        }
        else {
            region_code = null
        }
        // add pieces of the street address as they exist
        request_object.street_address = "";
        var street_address_arr = [request_object.address.number, request_object.address.street, request_object.address.type, request_object.address.sec_unit_type, request_object.address.sec_unit_num];
        street_address_arr.forEach( function (element) {
            if (element) {
                request_object.street_address = request_object.street_address + " " + element;
            }
        });
        request_object.city = request_object.address.city;
        request_object.state = request_object.address.state;
        request_object.zip_final = request_object.address.zip;
        request_object.assigned_rc_region = region_code;
        return save_utils.countRequestsPerRegion(region_code);
    }).then( function(numRequests) {
        requestData = save_utils.createSerial(numRequests, request_object, region_code);
        requestData.is_sms = 'sms';
        return save_utils.saveRequestData(requestData);
    }).then(function(request) {
        savedRequest = request;
        return save_utils.isActiveRegion(savedRequest);
    }).then( function(activeRegion){
        var is_valid = null;
        var contact_num = null;
        if (activeRegion) {
            save_utils.sendEmail(savedRequest, activeRegion);
            is_valid = true;
            contact_num = activeRegion.contact_phone;
        }
        else{
            is_valid = false;
        }
        constructFinalText(is_valid, request_object, contact_num, phone); 

    }).catch(function(error) {
        // send sorry
        constructFinalText(false, request_object, null, phone);
    });
};
 
exports.respond = function(req, res) {
    
    if (req.cookies.locale) {
        req.cookies.locale = req.cookies.locale.toLowerCase();
    }
    else {
        // English by default
        req.cookies.locale = 'en';
    }
    i18n_inst.setLocale(req.cookies.locale);
    var responses_array = [__('Welcome to the smoke alarm request system \(para continuar en espanol, mande el texto "ES"\).') + " " + __('We need to ask four questions to process your request. Please text back the answer to each and wait for the next question. First, what is your name?'), __('What is your address, including the unit number, city, state, and zipcode?'), __('Sorry, we couldn\'t process your zipcode. Please text us your 5-digit zipcode.'), __('Is the number you\'re texting from the best way to get in touch with you?') + " " + __('If so, text YES. Otherwise, please text a phone number where we can reach you.'), __('One last question: is there an email address we can use to contact you?') + " " + __('If not, text NONE. If yes, please text us the email address.'), __('Thank you for your smoke alarm request! Your request number is %s.', serial_num) + __('To contact your local Red Cross about this request, call %s. We will be in touch with you to schedule an installation.', rc_local)];
    var counter = parseInt(req.cookies.counter) || 0;

    // Increment or initialize views, up to the length of our array.  If
    // we're at the end of the array, start over.
    if (counter >= responses_array.length) {
        counter = 0;
    }

    // Not thrilled about the magic numbers here.  What's a better way
    // to do this?

    // Use the counter to find out what information is arriving:

    if (counter == 1) {
        // need to abstract this so that we can add locales without
        // adding another block here.
        if (req.query.Body == 'ES'){
            // start sending spanish texts
            // set i18n to spanish
            req.cookies.locale = 'es';
            i18n_inst.setLocale(req.cookies.locale);
            // reset counter so they get the intro text in their language
            counter = 0;
        }
        else if (req.query.Body == 'EN') {
            req.cookies.locale = 'en';
            i18n_inst.setLocale(req.cookies.locale);
            // reset counter so they get the intro text in their language
            counter = 0;
        }
        else{
            request_object.name = req.query.Body;
        }
    }
    else if (counter == 2) {
        // then it is their address
        request_object.address = req.query.Body;
        request_object.address = parser.parseLocation(request_object.address);
        if (request_object.address.zip) {
            // if they've included their zip, skip the extra "please
            // send your zip" text.
            counter = counter + 1;
        }
    }
    else if (counter == 3) {
        // should only be here if we had to send the zipcode text
        // process it slightly
        req.query.Body;
        var zipset = save_utils.findZipForLookup(req);
        if (request_object.address) {
            request_object.address.zip = zipset.zip_final;
        }
        else {
            request_object.address = "";
            request_object.address.zip =  zipset.zip_final;
        }
    }
    else if (counter == 4) {
        var phone_check = req.query.Body;
        // handle any capitalization
        if (phone_check) {
            phone_check = phone_check.toLowerCase();
        }
        if (phone_check == "yes") {
            request_object.phone = req.query.From;
        }
        else {
            request_object.phone = req.query.Body;
        }
    }
    else if (counter == 5) {
        // this is their email address, or none.
        request_object.email = req.query.Body;
        if (request_object.address) {
            // send final text to the number the user has been texting from
            var to_phone;
            if (req.query.From) {
                to_phone = req.query.From;
            }
            counter = counter + 1;
            var response_elements = saveRequest(request_object.address.zip, to_phone);
        }
        else {
            console.log("DEBUG: no address");
        }
    }

    // construct a request object and insert it into the db

    // may need to change this to account for varying scripts with i18n.
    if (counter < (responses_array.length -1 )){
        client.sendMessage({
            to: req.query.From,
            from: config.twilio_phone,
            body: responses_array[counter]
        }, function(err, responseData) {
            if (!err) {
                console.log("DEBUG: message sent successfully");
                counter = counter + 1;
                res.cookie('counter', counter);
                res.cookie('locale', i18n_inst.getLocale());
                res.writeHead(200, {'Content-Type': 'text/xml'});
                res.end(responses_array[counter].toString());
            }
            else {
                console.log("DEBUG: error sending message");
                console.log(err);
                // don't increment counter and maybe resend the message
            }
        });
    }
    // else the message will be sent from "construct final text"
};


