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


exports.status = function(req, res) {
    console.log("hello, we're in the response dir");
    console.log(req);
    console.log("the request should be in the body:");
    console.log(req.body);
}
