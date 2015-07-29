'use strict';

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('LoginAttempt', {
        ip: {
            type: DataTypes.TEXT
        },
        user: {
            type: DataTypes.TEXT
        },
        time: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        freezeTableName: true
    });
};

