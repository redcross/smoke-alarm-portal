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

