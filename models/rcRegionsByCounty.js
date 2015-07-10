module.exports = function(sequelize, DataTypes) {
	return sequelize.define('rcRegionsByCounty', {
		region: DataTypes.STRING,
		state: DataTypes.STRING,
		county: DataTypes.STRING
	}, { freezeTableName: true })
}