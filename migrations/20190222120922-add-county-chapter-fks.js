'use strict';

// This is written for sequelize 3, which didn't yet have queryInterface.addConstraint
module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.sequelize.query(
        'ALTER TABLE "SelectedCounties" ADD CONSTRAINT "chapters_chater_fkey" ' +
          'FOREIGN KEY (chapter) REFERENCES chapters(code)')
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.sequelize.query('ALTER TABLE "SelectedCounties" DROP CONSTRAINT "chapters_chater_fkey"')
    ]);
  }
};
