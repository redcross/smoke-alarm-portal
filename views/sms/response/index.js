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
    console.log("DEBUG: we're in the status-checking function");
}
