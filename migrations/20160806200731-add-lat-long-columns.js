'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.addColumn('Requests', 'latitude', Sequelize.DOUBLE),
      queryInterface.addColumn('Requests', 'longitude', Sequelize.DOUBLE)
    ]);
  },

  down: function (queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.removeColumn('Requests', 'latitude'),
      queryInterface.removeColumn('Requests', 'longitude')
    ]);
  }
};
