module.exports = function(sequelize, DataTypes) {
    return sequelize.define('UsAddress', {
	    "zip": DataTypes.TEXT,
	    "type": DataTypes.TEXT,
	    "primary_city": DataTypes.TEXT,
	    "acceptable_cities": DataTypes.TEXT,
	    "unacceptable_cities": DataTypes.TEXT,
	    "state": DataTypes.TEXT,
	    "county": DataTypes.TEXT,
	    "timezone": DataTypes.TEXT,
	    "area_codes": DataTypes.TEXT,
	    "latitude": DataTypes.TEXT,
	    "longitude": DataTypes.TEXT,
	    "world_region": DataTypes.TEXT,
	    "country": DataTypes.TEXT,
	    "decommissioned": DataTypes.BOOLEAN,
	    "estimated_population": DataTypes.INTEGER,
	    "notes": DataTypes.TEXT
    })
}
