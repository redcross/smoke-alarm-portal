module.exports = function(sequelize, DataTypes) {
	return sequelize.define('SelectedCounties', {
		region: DataTypes.STRING,
		state: DataTypes.STRING,
		county: DataTypes.STRING
	})
}