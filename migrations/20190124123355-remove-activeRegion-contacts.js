'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.removeColumn('activeRegions', 'contact_name'),
      queryInterface.removeColumn('activeRegions', 'contact_phone'),
      queryInterface.removeColumn('activeRegions', 'contact_email')
    ]);
  },

  down: function (queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.addColumn('activeRegions', 'contact_name', Sequelize.TEXT),
      queryInterface.addColumn('activeRegions', 'contact_phone', Sequelize.TEXT),
      queryInterface.addColumn('activeRegions', 'contact_email', Sequelize.TEXT)
    ]);
  }
};
