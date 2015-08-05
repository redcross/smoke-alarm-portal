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

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('User', {
        username: {
            type: DataTypes.TEXT,
            unique: true,
            allowNull: false
        },
        password: DataTypes.TEXT,
        email: {
            type: DataTypes.TEXT,
            unique: true
        },
        isActive: DataTypes.TEXT,
        resetPasswordToken: DataTypes.TEXT,
        resetPasswordExpires: DataTypes.DATE,
        twitter: DataTypes.JSON,
        github: DataTypes.JSON,
        facebook: DataTypes.JSON,
        google: DataTypes.JSON,
        tumblr: DataTypes.JSON
    }, {
        freezeTableName: true,
        instanceMethods: {
            canPlayRoleOf: function(role) {
                return true;
            },
            defaultReturnUrl: function() {
                var returnUrl = '/';
                if (this.canPlayRoleOf('account')) {
                    returnUrl = '/account/';
                }

                if (this.canPlayRoleOf('admin')) {
                    returnUrl = '/admin/';
                }

                return returnUrl;
            }
        },
        classMethods: {
            encryptPassword: function(password, done) {
                var bcrypt = require('bcrypt');
                bcrypt.genSalt(10, function(err, salt) {
                    if (err) {
                        return done(err);
                    }

                    bcrypt.hash(password, salt, function(err, hash) {
                        done(err, hash);
                    });
                });
            },
            validatePassword: function(password, hash, done) {
                var bcrypt = require('bcrypt');
                bcrypt.compare(password, hash, function(err, res) {
                    done(err, res);
                });
            }

        }
    });
};

