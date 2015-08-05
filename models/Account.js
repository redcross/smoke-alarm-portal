module.exports = function(sequelize, DataTypes) {
    return sequelize.define('Account', {
        isVerified: {
            type: DataTypes.TEXT
        },
        name: {
            type: DataTypes.JSON
        },
        company: {
            type: DataTypes.TEXT
        },
        phone: {
            type: DataTypes.TEXT
        },
        zip: {
            type: DataTypes.TEXT
        }
    }, {
        freezeTableName: true
    });
};

