/* jshint indent: 2 */
module.exports = function(sequelize, DataTypes) {
    return sequelize.define('Message', {
        name: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        body: {
            type: DataTypes.TEXT,
            allowNull: true,
        }
    }, {
        freezeTableName: true
    });
};

