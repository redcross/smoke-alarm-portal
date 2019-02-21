'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Requests', 'assigned_rc_region');
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Requests', 'assigned_rc_region', {
      type: Sequelize.TEXT,
      references: {
        model: "activeRegions",
        key: "rc_region"
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL"
    });
  }
};
