/* Smoke Alarm Installation Request Portal (getasmokealarm.org)
 * 
 * Copyright (C) 2015  American Red Cross
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('Admin', {
        name: {
            type: DataTypes.JSON
        },
        name: {
            type: DataTypes.JSON
        },
    }, {
        freezeTableName: true,
        instanceMethods: {
            hasPermissionTo: function(something) {
                //check group permissions
                var groupHasPermission = false;
                for (var i = 0; i < this.groups.length; i++) {
                    for (var j = 0; j < this.groups[i].permissions.length; j++) {
                        if (this.groups[i].permissions[j].name === something) {
                            if (this.groups[i].permissions[j].permit) {
                                groupHasPermission = true;
                            }
                        }
                    }
                }
                //check admin permissions
                for (var k = 0; k < this.permissions.length; k++) {
                    if (this.permissions[k].name === something) {
                        if (this.permissions[k].permit) {
                            return true;
                        }

                        return false;
                    }
                }

                return groupHasPermission;
            },
            isMemberOf: function(group) {
                for (var i = 0; i < this.groups.length; i++) {
                    if (this.groups[i]._id === group) {
                        return true;
                    }
                }
                return false;
            }
        }
    })
};

