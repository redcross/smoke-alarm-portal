/* Smoke Alarm Installation Request Portal (getasmokealarm.org)
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

'use strict';

var config = require('./config'),
    express = require('express'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    cookieSession = require('cookie-session'),
    http = require('http'),
    path = require('path'),
    passport = require('passport'),
    models = require('./models/index'),
    helmet = require('helmet'),
    csrf = require('csurf'),
    moment = require('moment');

var favicon = require('serve-favicon');

var pg = require('pg');
var db = require('./models');
var users = require('./routes/users');

var app = express();

//keep reference to config
app.config = config;

//setup the web server
app.server = http.createServer(app);

app.db = models;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(require('morgan')('dev'));
app.use(require('compression')());
app.use(require('serve-static')(path.join(__dirname, 'public')));
app.use(require('method-override')());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(cookieParser(config.cryptoKey));
app.use(cookieSession({
    resave: true,
    saveUninitialized: true,
    secret: config.cryptoKey,
    keys: ['key1', 'key2']
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(csrf({
    cookie: {
        signed: true
    }
}));
helmet(app);

//response locals
app.use(function(req, res, next) {
    res.cookie('_csrfToken', req.csrfToken());
    res.locals.user = {};
    res.locals.user.defaultReturnUrl = req.user && req.user.defaultReturnUrl();
    res.locals.user.username = req.user && req.user.username;
    next();
});

//global locals
app.locals.projectName = app.config.projectName;
// This calculation of the copyright year is a kludge, but it'll
// probably be accurate enough most of the time, since it's likely
// that some code somewhere in the app changed in a given year.  Maybe
// in early January of the year it will be inaccurate, though!
app.locals.copyrightYear = new Date().getFullYear();
// Since this is open source software, it doesn't matter *too* much
// who owns the copyright, but for the record this is a work for hire
// so the customer is the copyright holder.
app.locals.copyrightName = "American Red Cross"; 
app.locals.cacheBreaker = 'br34k-01';
app.locals.signupEnabled = app.config.signupEnabled;
app.locals.moment =moment;
//setup passport
require('./passport')(app, passport);

//setup routes
require('./routes')(app, passport);

//custom (friendly) error handler
app.use(require('./views/http/index').http500);

//setup utilities
app.utility = {};
app.utility.sendmail = require('./util/sendmail');
app.utility.slugify = require('./util/slugify');
app.utility.workflow = require('./util/workflow');

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

/* Throw an error if the database sync does not occur */
db.sequelize.sync().then(function(promise) {
    console.log("DEBUG: DB in place");
}).catch(SyntaxError, function(e) {
    console.log("don't be evil: " + e);
});

module.exports = app;
