module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Request', {
	  name: DataTypes.STRING,
		address: DataTypes.STRING,
		address_2: DataTypes.STRING,
		city: DataTypes.STRING,
		state: DataTypes.STRING,
		zip: DataTypes.STRING,
		phone: DataTypes.STRING,
		email: DataTypes.STRING,
		permission_to_text: DataTypes.BOOLEAN
	})
}
