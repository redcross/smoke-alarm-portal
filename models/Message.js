/* jshint indent: 2 */
module.exports = function(sequelize, DataTypes) {
    return sequelize.define('Message', {
        name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        body: {
            type: DataTypes.STRING,
            allowNull: true,
        }
    }, {
        freezeTableName: true
    });
};

