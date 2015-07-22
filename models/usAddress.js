module.exports = function(sequelize, DataTypes) {
    return sequelize.define('UsAddress', {
	    "zip": DataTypes.STRING,
	    "type": DataTypes.STRING,
	    "primary_city": DataTypes.STRING,
	    "acceptable_cities": DataTypes.TEXT,
	    "unacceptable_cities": DataTypes.TEXT,
	    "state": DataTypes.STRING,
	    "county": DataTypes.STRING,
	    "timezone": DataTypes.STRING,
	    "area_codes": DataTypes.STRING,
	    "latitude": DataTypes.STRING,
	    "longitude": DataTypes.STRING,
	    "world_region": DataTypes.STRING,
	    "country": DataTypes.STRING,
	    "decommissioned": DataTypes.BOOLEAN,
	    "estimated_population": DataTypes.INTEGER,
	    "notes": DataTypes.TEXT
    },{
        freezeTableName: true
    })
}
