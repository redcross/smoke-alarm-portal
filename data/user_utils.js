/*
 * To run: $ node user_utils.js
 *
 * user_utils.js - A short script to aid in creating and configuring users for
 * use in the application's admin panel.
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

var db = require('../models');
var prompt = require('prompt');
var _ = require('underscore');

var emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

var actionOptions = [{
    name: 'action',
    validator: /^user-create|password-reset|quit$/,
    warning: 'Action must be user-create, password-reset or quit'
}];

var createUserOptions =[
    {
        name: 'username',
        validator: /^[a-zA-Z\s\-]+$/,
        warning: 'Username must be only letters, spaces, or dashes'
    },{
        name: 'password',
        hidden: true
    },{
        name: 'email',
        validator: emailRegex,
        warning: 'Invalid email'
    },{
        name: 'is_admin',
        validator: /^yes|no$/,
        warning: 'Must be either yes or no'
    }
];
var resetPasswordOptions = createUserOptions.slice(0,2);

var handleError = function (err) {
    console.log(err);
    return 1;
};

var makeAdmin = function(user) {
    db.regionPermission.sync().then(function () {
        db.activeRegion.findAll()
            .then(function (regions) {
                _.each(regions, function(region) {
                    db.regionPermission.create({
                        rc_region: region.rc_region,
                        user_id: user.id
                    });
                    console.log('Added permissions to ' + region.rc_region + ' for ' + user.username);
                });
            });
    });
};

var createUser = function () {
    return prompt.get(createUserOptions, function (err, userInput) {
        db.User.sync().then(function () {
            if(err) { return handleError() }

            db.User.encryptPassword(userInput.password, function(err, hash) {
                db.User.create({
                    username: userInput.username,
                    password: hash,
                    email: userInput.email,
                    isVerified: 'yes'
                }).then(function(user) {
                    console.log('Created user with id: ' + user.id);
                    if (userInput.is_admin == 'yes') {
                        makeAdmin(user);
                    }
                });
            });
        });
    });
};

var resetPassword = function() {
    return prompt.get(resetPasswordOptions, function (err, userInput) {
        db.Request.sync().then(function () {
            if(err) { return handleError() }

            db.User.findOne( {where: {username: userInput.username}} )
                .then(function(user) {
                    db.User.encryptPassword(userInput.password, function(err, hash) {
                        user.update({password:hash}).then(function () {
                            console.log('User Updated!');
                        });
                    });
                }
            );
        });
    });
}

prompt.start();
console.log('Options: user-create, password-reset, quit');
prompt.get(actionOptions, function(err, userInput) {
    if(err) { return handleError(err) }

    if(userInput.action == 'user-create') {
        return createUser();
    } else if (userInput.action == 'password-reset') {
        return resetPassword();
    }
});
