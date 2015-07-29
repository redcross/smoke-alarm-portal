'use strict';

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('Note', {
        data: {
            type: DataTypes.TEXT
        }
    }, {
        freezeTableName: true
    });
};

