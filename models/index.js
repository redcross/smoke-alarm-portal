"use strict";

var fs = require("fs");
var path = require("path");
var Sequelize = require("sequelize");
var basename = path.basename(module.filename);
var env = process.env.NODE_ENV || "development";
var config = require(__dirname + '/../config/config.json')[env];
var sequelize = new Sequelize(config.database, config.username, config.password, config);
var db = {};


fs
    .readdirSync(__dirname)
    .filter(function(file) {
        return (file.indexOf(".") !== 0) && (file !== basename);
    })
    .forEach(function(file) {
        var model = sequelize["import"](path.join(__dirname, file));
        db[model.name] = model;
    });

Object.keys(db).forEach(function(modelName) {
    if ("associate" in db[modelName]) {
        db[modelName].associate(db);
    }
});

var options = {
    force: true
}

db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.Admin.belongsTo(db.User);
db.Message.belongsTo(db.User);
db.Account.belongsTo(db.User);
db.Admin.belongsTo(db.AdminGroup);

db.sequelize.sync(options).then(function() {
    console.log("DEBUG: Database created");
});

module.exports = db;

