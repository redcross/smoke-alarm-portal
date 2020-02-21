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

// console.log(process.env);

var fs = require('fs');
var path = require('path');
var config = require('../config/config');
var Sequelize = require('sequelize');
var basename = path.basename(module.filename);
var env = process.env.NODE_ENV || 'development';
var mailgun = require('mailgun-js')({
    apiKey: process.env.MAILGUN_API_KEY,
    domain: process.env.MAILGUN_DOMAIN
});
var mail_from_addr = process.env.MAILGUN_FROM_ADDR || '';
var sequelize = new Sequelize(
    process.env.DB_DATABASE,
    process.env.DB_USERNAME,
    process.env.DB_PASSWORD,
    config[env]
);
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
    force: false,
    logging: false
};

db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.Admin.belongsTo(db.User);
db.Message.belongsTo(db.User);
db.Account.belongsTo(db.User);
db.Admin.belongsTo(db.AdminGroup);
db.Request.belongsTo(db.SelectedCounties, {foreignKey:'selected_county'});
db.regionPermission.belongsTo(db.activeRegion, {foreignKey:'rc_region'});
db.regionPermission.belongsTo(db.User, {foreignKey:'user_id'});
db.activeRegion.hasMany(db.regionPermission, {foreignKey:'rc_region'});
db.SelectedCounties.hasMany(db.Request, {foreignKey:'selected_county'});

db.User.belongsToMany(
    db.activeRegion,
    {
        through: { model: db.regionPermission, unique: false },
        foreignKey: 'user_id'
    }
);
db.activeRegion.belongsToMany(
    db.User,
    {
        through: { model: db.regionPermission, unique: false },
        foreignKey: 'rc_region'
    }
);

db.SelectedCounties.belongsTo(db.chapter, {foreignKey:'chapter_code', targetKey:'code'});
db.chapter.belongsTo(db.activeRegion, {foreignKey:'region', targetKey: 'rc_region'});

db.sequelize.sync(options);

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

