var env = process.env.NODE_ENV || 'development';
var client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
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
        // number today and do a exponential backoff
        var now_var = new Date();
        var today_var = new Date(now_var.getFullYear(), now_var.getMonth(), now_var.getDate(), 0, 0, 0, 0);
        client.messages.list( {To: req.body.To, DateSent: today_var}, function(err, data) {
            // count the failed texts to this number
            var num_failed = 0;
            data.messages.forEach( function (sms) {
                // for testing: sms.status = 'failed';
                if (sms.status == 'failed' || sms.status == 'undelivered') {
                    num_failed++;
                }
            });
            if (num_failed <= max_resends) {
                // if we haven't exceeded max resends, then:
                sms_utils.resend(req,res);
            }
            else {
                console.log("DEBUG: exceeded max resends to " + req.body.To);
                res.send('Sorry, too many failures.');
            }
        });
    }
    else {
        console.log("DEBUG: message has status " + req.body.MessageStatus);
        res.send('Message was successful.');
    }
}
