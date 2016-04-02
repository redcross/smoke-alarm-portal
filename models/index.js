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

var fs        = require('fs');
var path      = require('path');
var Sequelize = require('sequelize');
var basename  = path.basename(module.filename);
var env       = process.env.NODE_ENV || 'development';
var config    = require(__dirname + '/../config/config.json')[env];
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
    force: false,
    logging: false
};

db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.Admin.belongsTo(db.User);
db.Message.belongsTo(db.User);
db.Account.belongsTo(db.User);
db.Admin.belongsTo(db.AdminGroup);
db.Request.belongsTo(db.activeRegion, {foreignKey:'assigned_rc_region'});
db.Request.belongsTo(db.SelectedCounties, {foreignKey:'selected_county'});
db.regionPermission.belongsTo(db.activeRegion, {foreignKey:'rc_region'});
db.regionPermission.belongsTo(db.User, {foreignKey:'user_id'});
db.activeRegion.hasMany(db.regionPermission, {foreignKey:'rc_region'});
db.SelectedCounties.hasMany(db.Request, {foreignKey:'selected_county'});

db.sequelize.sync(options);

module.exports = db;

