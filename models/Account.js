/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('Account', {
        isVerified: {
            type: DataTypes.STRING
        },
        name: {
            type: DataTypes.JSON
        },
        company: {
            type: DataTypes.STRING
        },
        phone: {
            type: DataTypes.STRING
        },
        zip: {
            type: DataTypes.STRING
        }
    }, {
        freezeTableName: true
    });
};

