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
    csrf = require('csurf');

console.log("Config = " + JSON.stringify(config));

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
app.locals.copyrightYear = new Date().getFullYear();
app.locals.copyrightName = app.config.companyName;
app.locals.cacheBreaker = 'br34k-01';

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
