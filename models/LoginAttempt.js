'use strict';

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('LoginAttempt', {
        ip: {
            type: DataTypes.STRING
        },
        user: {
            type: DataTypes.STRING
        },
        time: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        freezeTableName: true
    });
};

