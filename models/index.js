'use strict';

var fs        = require('fs');
var path      = require('path');
var Sequelize = require('sequelize');
var basename  = path.basename(module.filename);
var env       = process.env.NODE_ENV || 'development';
var config    = require(__dirname + '/../config/config.json')[env];

// Our config files set logging as 'true' or 'false', for admin
// convenience, but the proper non-false value is a logging function
// (see http://docs.sequelizejs.com/en/1.7.0/docs/usage/, the
// "Options" section).  So here we convert 'true' if necessary.
if (config.logging === true) { config.logging = console.log; }

var sequelize = new Sequelize(config.database, config.username, config.password, config);
var db        = {};

fs
  .readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf('.') !== 0) && (file !== basename);
  })
  .forEach(function(file) {
    var model = sequelize['import'](path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(function(modelName) {
  if ('associate' in db[modelName]) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// It would make more sense to have this in ../app.js, but then how
// would it be available to ../routes/index.js?
db.maybe_console_log = function(output, is_error) {
    var prefix_str = "DEBUG: "
    if (typeof is_error === 'undefined') { 
        is_error = false; 
    } else if (is_error) {
        prefix_str = "ERROR: "
    }
    if (config.logging) {
        console.log(prefix_str + output);
    }
}

module.exports = db;
