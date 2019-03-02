'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.renameColumn("SelectedCounties", "region", "chapter")
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.renameColumn("SelectedCounties", "chapter", "region")
  }
};
