var env = process.env.NODE_ENV || 'development';
var config = require('../../config/config.json')[env];
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

var accountSid = config.twilio_accountSid;
var authToken = config.twilio_authToken;
var client = require('twilio')(accountSid, authToken);

app.use(function(req, res, next) {
    req.i18n.setLocaleFromCookie();
    // can set this here for testing purposes
    // req.i18n.setLocale('es');
    next();
});

// include the functions from views/index.js
var save_utils = require('../utilities');

exports.respond = function(req, res) {

    /* Takes: "twiml," an xml object including the message to be texted
     * to the requester.  
     *
     * No return value, but sends the twiml message.
     * "res.end" is required by the node server to complete any
     * transmission to the client.
     */
    var completeMsg = function (twiml, phone_number) {
        res.cookie('locale', i18n_inst.getLocale());
        res.writeHead(200, {'Content-Type': 'text/xml'});
        res.end(twiml.toString());
    };

    var checkMsgStatus = function (to_num) {
        var now_var = new Date();
        var today_var = new Date(now_var.getFullYear(), now_var.getMonth(), now_var.getDate(), 0, 0, 0, 0);
        client.messages.list( {To: to_num, DateSent: today_var}, function(err, data) {
            if (data) {
                var most_recent_msg = data.messages[0];
                // if the most recent message was delivered successfully
                // then great!  Otherwise, do something else.
                if (most_recent_msg.status != 'delivered') {
                    // then send the message again
                }
 		else {
		    console.log("DEBUG: the most recent message, " + most_recent_msg.body + ", was delivered.");
		}

            }
            else {
                console.log("DEBUG: we didn't get data back from the Twilio API");
                console.log(err);
            }
        });
    };

    /*
     * Takes a Twiml object (in order to compose a response message). 
     *
     * Sends a text message indicating that there's been an error.
     * 
     */
    
    var sendError = function () {
        var twiml = new twilio.TwimlResponse();
        // add a help number here.
        var error_text = "Sorry, we've encountered an error.  Please try sending your message again, or call <number> for assistance.";
        twiml.message(__(error_text), {statusCallback: '/sms/response/'});
        completeMsg(twiml, req.query.From);
    };

    /* 
     * Check if the incoming text is a request for help or info about
     * the service.  Implicitly takes the body of the incoming request.
     * Return true if it is and false if it is not.
     */
    
    var helpCheck = function () {
        var help_array = ['info', 'help', 'stop', 'exit'];
        if (req.query.Body) {
            var help_check = help_array.indexOf(req.query.Body.toLowerCase());
        }
        if (help_check >= 0) {
            // then they sent some message asking for help/info.  Send
            // an appropriate response.
            var help = true;
        }
        else {
            var help = false;
        }
        return help;
    }

    /* Change the SMS language to either English or Spanish, based on
     * incoming request from the user.
     *
     * Return true if language changed from previous value and false if
     * it did not.
     */
    var changeLanguage = function () {
        var lang_changed = false;
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
        if (req.query.Body) {
            var language_check = available_locales.indexOf(req.query.Body.toLowerCase());
        }
        else {
            var language_check = -1;
            // sendError();
        }
        if (language_check >= 0 && req.cookies.locale != available_locales[language_check]) {
            req.cookies.locale = available_locales[language_check];
            i18n_inst.setLocale(req.cookies.locale);
            lang_changed = true;
        }

        return lang_changed;
    };
    

    /*
     * Takes: the "outcome" (a boolean that is true iff the entered zip code
     * is valid and in an active region),
     * If the outcome was successful:
     * public_id: the unique ID number assigned to the request
     * county: the county found based on the entered zipcode
     *
     * Returns: a message with "thank you," and the ID number (public id),
     * successful outcomes and a "sorry" message with a generic RC
     * phone number for out-of-area zip codes (just like the website).
     */
    var constructFinalText = function (outcome, request) {
        var twiml = new twilio.TwimlResponse();
        if (outcome) {
            msg = __("Thank you for your smoke alarm request! Your request number is %s.");
            msg = msg.replace('%s', request.public_id);
            msg += __(" To contact your local Red Cross about this request, call 1-800-RED-CROSS (1-800-733-2767). We will be in touch with you to schedule an installation.");
        }
        else {
            if (request.county) {
                msg = __("Sorry, the Red Cross Region serving %s, %s does not yet accept smoke alarm installation requests by text message. Please call 1-800-RED CROSS (1-800-733-2767) to be connected with your local Region.");
                msg = msg.replace('%s', request.county);
                msg = msg.replace('%s', request.state);
            }
            else {
                // invalid zip
                if ( request.zip_final) {
                    var msg_zip = request.zip_final;
                }
                else {
                    var msg_zip = request.raw_zip;
                }
                msg = __("Sorry, we don't recognize any U.S. location for Zip Code \"%s\".  Are you sure you entered an accurate Zip Code?");
                msg = msg.replace('%s', msg_zip);
            }
        }
        twiml.message(msg, {statusCallback: '/sms/response/'});
        res.clearCookie('priorities');
        res.clearCookie('request_object');
        completeMsg(twiml, req.query.From);
    };


    /* Generally to find the county and region we use the zipcode, so this
     * takes the entered zip.
     * Returns nothing, but saves the request to the database.
     */
    var saveRequest = function (zip) {
        save_utils.findAddressFromZip(zip).then(function(address) {
            if (! req.cookies.request_object) {
                req.cookies.request_object = {};
            }
            if (! address) {
                address = null;
            }
            else {
                req.cookies.request_object.county = address['county'];
                req.cookies.request_object.state = address['state'];
            }
            return save_utils.findCountyFromAddress(address, zip);
        }).then( function(county_id){
            if (county_id){
                region_code = county_id.chapter.region;
            }
            else {
                region_code = 'XXXX';
            }
            // add pieces of the street address as they exist
            if ( req.cookies.priorities.address.value ) {
                var street_address_arr = [req.cookies.priorities.address.value.number, req.cookies.priorities.address.value.street, req.cookies.priorities.address.value.type, req.cookies.priorities.address.value.sec_unit_type, req.cookies.priorities.address.value.sec_unit_num];
                req.cookies.request_object.street_address = "";
                street_address_arr.forEach( function (element) {
                    if (element) {
                        req.cookies.request_object.street_address = req.cookies.request_object.street_address + " " + element;
                    }
                });
                req.cookies.request_object.city = req.cookies.priorities.address.value.city;
                if (req.cookies.priorities.address.value.zip) {
                    req.cookies.request_object.zip_final = req.cookies.priorities.address.value.zip;
                }
                else {
                    req.cookies.request_object.zip_final = zip;
                }
            }
            else {
                req.cookies.request_object.street_address = null;
                req.cookies.request_object.city = null;
                req.cookies.request_object.zip_final = zip;
            }
            return Promise.all([
              save_utils.countRequestsPerRegion(region_code),
              county_id]) ;
        }).then( function([numRequests, county]) {
            requestData = save_utils.createPublicId(numRequests, req.cookies.request_object, region_code);
            requestData.source = 'sms';
            requestData.name = req.cookies.priorities.name.value;
            requestData.phone = req.cookies.priorities.phone.value;
            requestData.email = req.cookies.priorities.email.value;
            requestData.county = county;
            return save_utils.saveRequestData(requestData);
        }).then(function(request) {
            savedRequest = request;
            return save_utils.isActiveRegion(savedRequest);
        }).then( function(activeRegion){
            var is_valid = null;
            if (activeRegion) {
                save_utils.sendEmail(savedRequest, activeRegion);
                is_valid = true;
            }
            else{
                is_valid = false;
            }
            constructFinalText(is_valid, req.cookies.request_object);

        }).catch(function(error) {
            console.log("DEBUG: caught error " + error);
            // send sorry
            constructFinalText(false, req.cookies.request_object);
        });
    };

    /*
     * Takes the current text priority and the most recently received
     * value
     *
     * Inspects the value and determines whether it matches the expected
     * type of information (e.g. does it look like a phone number?),
     * then saves it in the appropriate part of a cookie.
     * 
     * No return value, though it would be a good idea to return an
     * error if updating the cookie didn't work.
     * 
     */
    var storeValues = function (priority, incoming_text) {
        // this is where the off-by-one happens, because it's trying to
        // save the initiating text instead of the response to the name
        // text.

        // so, really we need to be testing against what we think the
        // piece of information we just received is, instead of the text
        // we're about to send.

        if (current_priority == 5) {
            // we think we've just received a name
            req.cookies.priorities.name.value = req.query.Body;
        }
        else if (current_priority == 4) {
            // maybe test to make sure this looks like an address
            if (! req.cookies.request_object) {
                req.cookies.request_object = {};
            }
            req.cookies.request_object.raw_address = req.query.Body;
            req.cookies.priorities.address.value = parser.parseLocation(req.query.Body);
            if (req.cookies.priorities.address.value) {
                if (req.cookies.priorities.address.value.zip) {
                    req.cookies.priorities.zipcode.value = req.cookies.priorities.address.value.zip;
                }
            }
            else {
                console.log("DEBUG: should send an error for null address");
                // sendError();
            }
            
        }
        else if (current_priority == 3) {
            // should only be here if we had to send the zipcode text
            // process it slightly
            if (! req.cookies.request_object) {
                req.cookies.request_object = {};
            }
            req.cookies.request_object.raw_zip = req.query.Body;
            var zipset = save_utils.findZipForLookup(req);
            req.cookies.priorities.zipcode.value = zipset.zip_final;
        }
        else if (current_priority == 2) {
            if (! req.cookies.request_object) {
                req.cookies.request_object = {};
            }
            req.cookies.request_object.raw_phone = req.query.Body;
            // check whether we have access to req.query here
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
        else if (current_priority == 1) {
            // check whether this looks like an email address?
            var has_address = true;
            // this is their email address, or none.
            req.cookies.priorities.email.value = req.query.Body;

            // insert the info into the db
            var response_elements = saveRequest(req.cookies.priorities.zipcode.value);
        }
        else {
            // we shouldn't be here
            console.log("DEBUG: send an error because we have current_priority of zero");
            res.clearCookie('priorities');
            res.clearCookie('request_object');
            // sendError();
        }


    };

 
    /*
     * Takes the value of the current highest priority (determined from
     * the priority cookie, but normally set to zero before calling this
     * function) and the "text_name," which is also stored in that
     * cookie.  (Note that I can probably set this up more cleanly so that
     * we don't have to deal with both of these two values...).  
     *
     * Returns those same values (current_priority and text_name), in an
     * array.  Caller expects priority to have shifted after calling
     * this function.
     *
     */
    var findPriority = function (current_priority, text_name) {
        for (var i in req.cookies.priorities) {
            if ( req.cookies.priorities[i].value == "" && req.cookies.priorities[i].priority > current_priority ) {
                current_priority = req.cookies.priorities[i].priority;
                text_name = i;
            }
            i++;
        }
        return [current_priority, text_name];
    };
    
    // find highest priority empty element
    var current_priority = 0;
    var text_name = "";
    // so each element in the priority list needs a name, a value, and a priority
    // we know the names, the values will be filled by the sms's, and we
    // assign the priorities
    var twiml = new twilio.TwimlResponse();
    var help_check = helpCheck();
    if (! help_check) {
        if ( ! req.cookies.priorities || req.cookies.priorities == "undefined") {
            // this is a new request
            req.cookies.request_object = {};
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
            
            var priority_array = findPriority(current_priority, text_name);
            current_priority = priority_array[0];
            text_name = priority_array[1];
            
            var lang_changed = changeLanguage();
            
            // if the language was changed, send the same text again in a
            // different language.  If not, store the incoming value and
            // move on to the next text.
            if (! lang_changed) {
                storeValues(current_priority, req.query.Body);
            }

            current_priority = 0;
            priority_array = findPriority(current_priority, text_name);
            current_priority = priority_array[0];
            text_name = priority_array[1];
        }
    }
    else {
        text_name = "help_response";
    }
    // now we have the element with current highest priority
    // send the text associated with that element
    var texts = { name: "Welcome to the smoke alarm request system \(para continuar en espanol, mande el texto \"ES\"\)." + " " + "We need to ask four questions to process your request. Please text back the answer to each and wait for the next question. First, what is your name?", address: __('What is your address, including the unit number, city, state, and zipcode?'), zipcode:  __('Sorry, we couldn\'t process your zipcode. Please text us your 5-digit zipcode.'), phone: __('Is the number you\'re texting from the best way to get in touch with you?') + " " + __('If so, text YES. Otherwise, please text a phone number where we can reach you.'), email:  __('One last question: is there an email address we can use to contact you?') + " " + __('If not, text NONE. If yes, please text us the email address.'), help_response: __('This is the smoke alarm request system from the Red Cross.  For more information, call 1-800-RED-CROSS or visit getasmokealarm.org.')};
    var text_body = texts[text_name];
    twiml.message( __(text_body), {statusCallback: '/sms/response/'});
    if ( help_check || (req.cookies.priorities.email && req.cookies.priorities.email.value == "") ) {
        res.cookie('priorities', req.cookies.priorities);
        res.cookie('request_object', req.cookies.request_object);
        completeMsg(twiml, req.query.From);
    }
};

exports.resend = function (req, res) {
    console.log("DEBUG: message sending failed; resending.");
    // we have the ID of the SMS, so we can get info on it from Twilio
    // API.
    client.messages(req.body.SmsSid).get(function(err, message) {
        // for testing: message.status = 'undelivered';
        // double check failure
        if (message.status == 'failed' || message.status == 'undelivered'){
            // then resend
            client.messages.create({
                to: message.to, from: config.twilio_phone, body: message.body, statusCallback: config.server_root + '/sms/response/'
            }, function (err, message) {
                console.log("DEBUG: resent message.");
                if (err) {
                    console.log("DEBUG: received error");
                    console.log(err);
                }
            });
        }
        else {
            console.log("DEBUG: message eventually succeeded");
            res.send("Not resending.");
        }
    });
};


 
