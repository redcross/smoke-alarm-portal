'use strict';

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('AdminGroup', {
        name: {
            type: DataTypes.TEXT
        },
        permissions: {
            type: DataTypes.JSON
        }
    }, {
        freezeTableName: true
    });
};

