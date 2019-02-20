'use strict';

/* Add this here because not sure where else to put it.
 * After running this migration, if there's live data,
 * you should create a default migration for each region
 * using the following:
 *
 * insert into chapters (code, name, region)
 *   select rc_region, 'N/A', rc_region from "activeRegions";
 */

module.exports = {
  up: (queryInterface, Sequelize) => {
      return queryInterface.createTable('chapters', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        code: {
          type: Sequelize.TEXT,
          allowNull: false,
          unique: true
        },
        name: Sequelize.TEXT,
        region: {
          type: Sequelize.TEXT,
          references: {
            model: 'activeRegions',
            key: 'rc_region'
          },
          onUpdate: 'cascade',
          onDelete: 'cascade'
        }
      });
  },

  down: (queryInterface, Sequelize) => {
      return queryInterface.dropTable('chapters');
  }
};
