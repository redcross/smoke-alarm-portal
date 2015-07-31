'use strict';

module.exports = {
    up: function(queryInterface, Sequelize) {
        return queryInterface.renameColumn('Requests', 'SelectedCountyId', 'assignedRegion');
    },

    down: function(queryInterface, Sequelize) {
        return queryInterface.renameColumn('Requests', 'assignedRegion', 'SelectedCountyId');
    }
};
