var env = process.env.NODE_ENV || 'development';
var config = require(__dirname + '/../../config/config.json')[env];
var twilio = require('twilio');

var http = require('http'),
    express = require('express'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser');

var app = express();
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(cookieParser())

exports.respond = function(req, res) {
    // array of script responses
    var responses_array = ["Welcome to the smoke alarm request system (para español, texto 'ES'). We need to ask four questions to process your request. Please text back the answer to each and wait for the next question. First, what is your name?", "What is your address, including the unit number, city, state, and zipcode?", "Is the number you're texting from the best way to get in touch with you? If so, text YES. Otherwise, please text a phone number where we can reach you.", "One last question: is there an email address we can use to contact you? If not, text NONE. If yes, please text us the email address.", "Thank you for your smoke alarm request! Your request number is <serial number>. To contact your local Red Cross about this request, call <local phone number>. We will be in touch with you to schedule an installation."];
    // TODO: the last response will need to be changed after we store
    // the request and get the RC region name, serial number, and other
    // info from the db.

    var twiml = new twilio.TwimlResponse();
    console.log("DEBUG: " + req.cookies);
    var counter = parseInt(req.cookies.counter) || 0;

    // Increment or initialize views, up to the length of our array.  If
    // we're at the end of the array, start over.
    if (counter >= responses_array.length) {
        counter = 0;
    }
    twiml.message(responses_array[counter]);

    counter = counter + 1;
    res.cookie('counter',counter);
    res.writeHead(200, {'Content-Type': 'text/xml'});
    res.end(twiml.toString());

    // TODO: store their incoming texts and construct a request object
    // from them to insert into the db.  This might be a totally
    // separate function.

};


