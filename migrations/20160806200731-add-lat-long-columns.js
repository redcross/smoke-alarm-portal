'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    queryInterface.addColumn('Requests', 'latitude', Sequelize.DOUBLE);
    queryInterface.addColumn('Requests', 'longitude', Sequelize.DOUBLE);
  },

  down: function (queryInterface, Sequelize) {
    queryInterface.removeColumn('Requests', 'latitude');
    queryInterface.removeColumn('Requests', 'longitude');
  }
};
