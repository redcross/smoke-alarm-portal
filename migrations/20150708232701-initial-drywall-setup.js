'use strict';

var db = require('./../models/index')

module.exports = {
  up: function (queryInterface, Sequelize) {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    db.AdminGroup.create({ name: 'Root' }).then(function(adminGroup) {
      db.Admin.create({ name: 'Root Admin'}).then(function(admin) {
        admin.setAdminGroup(adminGroup);
        admin.save();
        db.User.create({ username: 'root', isActive: 'yes', email: 'mark@grandkru.com'}).then(function(user) {
          user.setAdmin(admin);
          user.save();
          console.log("User = " + user.name + " admin created");
        });
      });
    });
  },

  down: function (queryInterface, Sequelize) {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
  }
};
