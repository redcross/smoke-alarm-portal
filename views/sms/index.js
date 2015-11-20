var env = process.env.NODE_ENV || 'development';
var config = require(__dirname + '/../../config/config.json')[env];
var twilio = require('twilio');
var parser = require('parse-address'); 

var http = require('http'),
    express = require('express'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser');
var i18n = require('i18n-2');

var i18n_inst = new (i18n)({
    // setup some locales - other locales default to en silently
    locales: ['en', 'es'],
    // change the cookie name from 'lang' to 'locale'
    cookieName: 'locale'
});
var __ = function(s) { return i18n_inst.__(s); }


var app = express();
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(cookieParser());

app.use(function(req, res, next) {
    req.i18n.setLocaleFromCookie();
    // can set this here for testing purposes
    // req.i18n.setLocale('es');
    next();
});
var serial_num = "";
var rc_local = "";


// create an object with those empty values for those elements
var request_row = {name: "", address: "", zip: "", phone: "", email: ""};
// we'll save that object in a cookie

var request_object = {};
// include the functions from views/index.js
var save_utils = require('../utilities');

exports.respond = function(req, res) {

    /*
     * Takes: the "outcome" (a boolean that is true iff the entered zip code
     * is valid and in an active region),
     * If the outcome was successful:
     * serial: the serial number assigned to the request
     * county: the county found based on the entered zipcode
     * contact: the phone number for this RC region
     *
     * Returns: a message with "thank you," the serial number, and a contact
     * phone for successful outcomes and a "sorry" message with a generic RC
     * phone number for out-of-area zip codes (just like the website).
     */
    var constructFinalText = function (outcome, request, contact) {
        var twiml = new twilio.TwimlResponse();
        if (outcome) {
            msg = __("Thank you for your smoke alarm request! Your request number is %s.");
            msg = msg.replace('%s', request.serial);
            msg += __(" To contact your local Red Cross about this request, call %s. We will be in touch with you to schedule an installation.", contact);
            msg = msg.replace('%s', contact);
        }
        else {
            if (request.county) {
                msg = __("Sorry, the Red Cross Region serving %s, %s does not yet offer smoke alarm installation service.");
                msg = msg.replace('%s', request.county);
                msg = msg.replace('%s', request.state);
            }
            else {
                // invalid zip
                msg = __("Sorry, we don't recognize any U.S. location for Zip Code \"%s\".  Are you sure you entered an accurate Zip Code?");
                msg = msg.replace('%s', request.zip);
            }
        }
        twiml.message(msg);
        // clear priority_list cookie
        request_object = {};
        // need to send the xml here
        res.writeHead(200, {'Content-Type': 'text/xml'});
        res.end(twiml.toString());
    };


    /* Generally to find the county and region we use the zipcode, so this
     * takes the entered zip.
     * Returns nothing, but saves the request to the database.
     */
    var saveRequest = function (zip) {
        save_utils.findAddressFromZip(zip).then(function(address) {
            request_object.county = address['county'];
            request_object.state = address['state'];
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
            if (request_object.address.zip) {
                request_object.zip_final = request_object.address.zip;
            }
            else {
                request_object.zip_final = zip;
            }
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
            constructFinalText(is_valid, request_object, contact_num); 

        }).catch(function(error) {
            console.log("DEBUG: caught error " + error);
            // send sorry
            constructFinalText(false, request_object, null);
        });
    };


    console.log("starting cookies");
    console.log(req.cookies);
    
    // find highest priority empty element
    var i = 0;
    var current_priority = 0;
    var text_name = "";
    // so each element in the priority list needs a name, a value, and a priority
    // we know the names, the values will be filled by the sms's, and we
    // assign the priorities
    var twiml = new twilio.TwimlResponse();
    if ( ! req.cookies.priorities) {
        // this is a new request
        req.cookies.priorities = {
            name: {value: "", priority: 5},
            address: {value: "", priority: 4},
            zipcode: {value: "", priority: 3},
            phone: {value: "", priority: 2},
            email: {value: "", priority: 1}
        };
        //send first text
        text_name = "name";
    }
    else {
        
        for (var i in req.cookies.priorities) {
            if ( req.cookies.priorities[i].value == "" && req.cookies.priorities[i].priority > current_priority ) {
                current_priority = req.cookies.priorities[i].priority;
                text_name = i;
            }
            i++;
        }
        if (current_priority == 0) {
            // start over
            text_name = "name";
            // clear cookie, since we're starting over (maybe do this in SaveRequest?)
            /* req.cookies.priorities = {
                name: {value: "", priority: 5},
                address: {value: "", priority: 4},
                zipcode: {value: "", priority: 3},
                phone: {value: "", priority: 2},
                email: {value: "", priority: 1}
            };*/
        }
        

        // Question: make sure we're continuing in the same request by
        // checking the token?  Who's keeping track of these cookies getting
        // passed back and forth?
        
        if (req.cookies.locale) {
            req.cookies.locale = req.cookies.locale.toLowerCase();
        }
        else {
            // English by default
            req.cookies.locale = "en";
        }
        i18n_inst.setLocale(req.cookies.locale);

        // get a list of locales
        var available_locales = Object.keys(i18n_inst.locales);
        var language_check = available_locales.indexOf(req.query.Body.toLowerCase());
        if (language_check >= 0) {
            req.cookies.locale = available_locales[language_check];
            i18n_inst.setLocale(req.cookies.locale);
        }
        if (text_name == "name") {
            req.cookies.priorities.name.value = req.query.Body;
        }
        if (text_name == "address") {
            req.cookies.priorities.address.value = req.query.Body;
            req.cookies.priorities.address.value = parser.parseLocation(request_object.address);
            if (req.cookies.priorities.address.value.zip) {
                req.cookies.priorities.zipcode.value = req.cookies.priorities.address.value.zip;
            }
        }
        if (text_name == "zipcode") {
            // should only be here if we had to send the zipcode text
            // process it slightly
            var zipset = save_utils.findZipForLookup(req);
            req.cookies.priorities.zipcode.value = zipset.zip_final;
        }
        if (text_name == "phone") {
            var phone_check = req.query.Body;
            // handle any capitalization
            // if their text does not include ten digits, then we use the
            // "from" number
            digit_array = phone_check.match(/\d/g);
            var num_digits = 0;
            if (digit_array) {
                num_digits = digit_array.length;
            }
            // I assume 10 digits for US phone numbers
            if ( num_digits < 10) {
                req.cookies.priorities.phone.value = req.query.From;
            }
            else {
                req.cookies.priorities.phone.value = req.query.Body;
            }
        }
        if (text_name == "email") {
            var has_address = true;
            // this is their email address, or none.
            req.cookies.priorities.email.value = req.query.Body;
        }

        // insert the info into the db (but only if we just asked about the
        // least important piece of information)

        if (text_name == "email") {
            var response_elements = saveRequest(req.cookies.priorities.zipcode.value);
        }
    }

    // now we have the element with current highest priority
    // send the text associated with that element
    var texts = { name: "Welcome to the smoke alarm request system \(para continuar en espanol, mande el texto \"ES\"\)." + " " + "We need to ask four questions to process your request. Please text back the answer to each and wait for the next question. First, what is your name?", address: __('What is your address, including the unit number, city, state, and zipcode?'), zipcode:  __('Sorry, we couldn\'t process your zipcode. Please text us your 5-digit zipcode.'), phone: __('Is the number you\'re texting from the best way to get in touch with you?') + " " + __('If so, text YES. Otherwise, please text a phone number where we can reach you.'), email:  __('One last question: is there an email address we can use to contact you?') + " " + __('If not, text NONE. If yes, please text us the email address.')};
    var text_body = texts[text_name];
    twiml.message( __(text_body));
    
    res.cookie('priorities', req.cookies.priorities);
    res.cookie('locale', i18n_inst.getLocale());
    console.log("debug: all cookies here");
    console.log(req.cookies);
    res.writeHead(200, {'Content-Type': 'text/xml'});
    res.end(twiml.toString());
};


