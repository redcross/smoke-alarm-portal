var env = process.env.NODE_ENV || 'development';
var config = require(__dirname + '/../../../config/config.json')[env];
var twilio = require('twilio');
var parser = require('parse-address'); 

var http = require('http'),
    express = require('express'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser');
var app = express();
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(cookieParser());

var sms_utils = require('../index');
var max_resends = 3;

exports.init = function (req, res) {
    res.send('Hello, this is an SMS status check response.');
}

exports.status = function(req, res) {
    // for testing: req.body.MessageStatus = 'failed';
    // see https://www.twilio.com/docs/api/rest/message
    if (req.body.MessageStatus == 'failed' || req.body.MessageStatus == 'undelivered') {
        // check whether we've already resent this message to this
        // number and do a exponential backoff
        //
        // For now, just fake the number of resends
        var num_resends = 2;
        if (num_resends <= max_resends) {
            // if we haven't exceeded max resends, then:
            sms_utils.resend(req,res);
        }
        else {
            console.log("DEBUG: exceeded max resends to " + req.body.To);
            res.send('Sorry, too many failures.');
        }
    }
    else {
        console.log("DEBUG: message has status " + req.body.MessageStatus);
        res.send('Message was successful.');
    }
}
