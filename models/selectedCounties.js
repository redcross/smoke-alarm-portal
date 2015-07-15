module.exports = function(sequelize, DataTypes) {
	return sequelize.define('SelectedCounties', {
		region: DataTypes.TEXT,
		state: DataTypes.TEXT,
		county: DataTypes.TEXT
	})
}