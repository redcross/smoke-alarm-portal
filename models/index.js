'use strict';

var fs        = require('fs');
var path      = require('path');
var Sequelize = require('sequelize');
var basename  = path.basename(module.filename);
var env       = process.env.NODE_ENV || 'development';
var config    = require(__dirname + '/../config/config.json')[env];
var mailgun   = require('mailgun-js')({apiKey: config.mailgun_api_key, 
                                       domain: config.mail_domain});
var mail_from_addr = config.mail_from_addr;
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

// TODO: This is a temporary kludge.  These shouldn't really be part
// of the db, and in the long run they won't be.  Once the admin
// changes are fully integrated, there will be a ../views/index.js
// file, and we can create the mailgun etc objects there, after line 2
// where the DB is created.
//
// However, that file doesn't exist yet on this branch, so we just
// stuff this stuff into the db, however inappropriately.
db.mailgun = mailgun;
db.mail_from_addr = mail_from_addr;

module.exports = db;
