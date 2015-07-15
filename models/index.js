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
var mail_to_addr = config.mail_to_addr; // temporary kludge; will go away soon
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

// TODO: This doesn't seem right -- these shouldn't be part of the db,
//       they should be their own objects (i.e., their own models).
db.mailgun = mailgun;
db.mail_from_addr = mail_from_addr;

// TODO: This one also doesn't belong here, but it is a temporary
// kludge anyway and will go away once we have dynamic selection
// of the correct RC recipient address.
db.mail_to_addr = mail_to_addr;

module.exports = db;
