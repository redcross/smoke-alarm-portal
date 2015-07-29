module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Request', {
	  name: DataTypes.TEXT,
		address: DataTypes.TEXT,
		address_2: DataTypes.TEXT,
		city: DataTypes.TEXT,
		state: DataTypes.TEXT,
		zip: DataTypes.TEXT,
		phone: DataTypes.TEXT,
		email: DataTypes.TEXT,
		permission_to_text: DataTypes.BOOLEAN
	})
}
