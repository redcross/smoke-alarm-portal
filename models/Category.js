'use strict';

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('Category', {
        name: {
            type: DataTypes.TEXT
        },
        pivot: {
            type: DataTypes.TEXT
        }
    }, {
        freezeTableName: true
    });
};

