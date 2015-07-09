/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('User', {
        username: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        },
        password: DataTypes.STRING,
        email: {
            type: DataTypes.STRING,
            unique: true
        },
        isActive: DataTypes.STRING,
        resetPasswordToken: DataTypes.STRING,
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

