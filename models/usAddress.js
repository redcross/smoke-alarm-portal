module.exports = function(sequelize, DataTypes) {
    return sequelize.define('UsAddress', {
<<<<<<< HEAD
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
=======
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
>>>>>>> email_demo
	    "decommissioned": DataTypes.BOOLEAN,
	    "estimated_population": DataTypes.INTEGER,
	    "notes": DataTypes.TEXT
    },{
        freezeTableName: true
    })
}
