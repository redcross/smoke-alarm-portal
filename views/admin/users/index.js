'use strict';

exports.find = function(req, res, next) {
    req.query.username = req.query.username ? req.query.username : '';
    req.query.limit = req.query.limit ? parseInt(req.query.limit, null) : 20;
    req.query.page = req.query.page ? parseInt(req.query.page, null) : 1;
    req.query.sort = req.query.sort ? req.query.sort : '_id';

    var filters = {};
    if (req.query.username) {
        filters.username = new RegExp('^.*?' + req.query.username + '.*$', 'i');
    }

    if (req.query.isActive) {
        filters.isActive = req.query.isActive;
    }

    if (req.query.roles && req.query.roles === 'admin') {
        filters['roles.admin'] = {
            $exists: true
        };
    }

    if (req.query.roles && req.query.roles === 'account') {
        filters['roles.account'] = {
            $exists: true
        };
    }

    req.app.db.User.findAll()
        .then(function(results) {
            if (req.xhr) {
                res.header("Cache-Control", "no-cache, no-store, must-revalidate");
                results.filters = req.query;
                res.send(results);
            } else {
                results.filters = req.query;
                res.render('admin/users/index', {
                    data: {
                        results: JSON.stringify(results)
                    }
                });
            }
        })
        .catch(function(err) {
            return next(err);
        });
};

exports.read = function(req, res, next) {
    req.app.db.User
        .find( { where: {id: req.params.id} } )
        .then( function(user, err) {
            if (err) {
                return workflow.emit('exception', err);
            }

            if (req.xhr) {
                res.send(user);
            } else {
                res.render('admin/users/details', {
                    data: {
                        record: escape(JSON.stringify(user))
                    }
                });
            }
        });
};

exports.create = function(req, res, next) {
    var workflow = req.app.utility.workflow(req, res);

    workflow.on('validate', function() {
        if (!req.body.username) {
            workflow.outcome.errors.push('Please enter a username.');
            return workflow.emit('response');
        }

        if (!/^[a-zA-Z0-9\-\_]+$/.test(req.body.username)) {
            workflow.outcome.errors.push('only use letters, numbers, -, _');
            return workflow.emit('response');
        }

        workflow.emit('duplicateUsernameCheck');
    });

    workflow.on('duplicateUsernameCheck', function() {
        req.app.db.User.find(
            { where: { username: req.body.username }
        }).then( function(user, err) {
            if (err) {
                return workflow.emit('exception', err);
            }

            if (user) {
                workflow.outcome.errors.push('Sorry, that username is already taken.  Please choose a different one, or edit the existing user.');
                return workflow.emit('response');
            }
            workflow.emit('createUser');
        });
    });

    workflow.on('createUser', function() {
        req.app.db.User.create( {username: req.body.username} )
            .then( function(user, err) {
                if (err) {
                    return workflow.emit('exception', err);
                }

                workflow.outcome.record = user;
                return workflow.emit('response');
            });
    });

    workflow.emit('validate');
};

exports.update = function(req, res, next) {
    var workflow = req.app.utility.workflow(req, res);

    workflow.on('validate', function() {
        if (!req.body.isActive) {
            req.body.isActive = 'no';
        }

        if (!req.body.username) {
            workflow.outcome.errfor.username = 'required';
        } else if (!/^[a-zA-Z0-9\-\_]+$/.test(req.body.username)) {
            workflow.outcome.errfor.username = 'only use letters, numbers, \'-\', \'_\'';
        }

        if (!req.body.email) {
            workflow.outcome.errfor.email = 'required';
        } else if (!/^[a-zA-Z0-9\-\_\.\+]+@[a-zA-Z0-9\-\_\.]+\.[a-zA-Z0-9\-\_]+$/.test(req.body.email)) {
            workflow.outcome.errfor.email = 'invalid email format';
        }

        if (workflow.hasErrors()) {
            return workflow.emit('response');
        }

        workflow.emit('duplicateUsernameCheck');
    });

    workflow.on('duplicateUsernameCheck', function() {
        req.app.db.User.find(
            { where : {
                username: req.body.username,
                id: {
                    $ne: req.body.id
                }
            }
            }).then( function(user, err) {
                if (err) {
                    return workflow.emit('exception', err);
                }

                if (user) {
                    workflow.outcome.errfor.username = 'username already taken';
                    return workflow.emit('response');
                }

                workflow.emit('duplicateEmailCheck');
            }).catch( function(err) {
                return workflow.emit('exception', err);
        });
    });

    workflow.on('duplicateEmailCheck', function() {
        req.app.db.User.find( {
            where: {
                email: req.body.email.toLowerCase(),
                id: {
                    $ne: req.body.id
                }
            }
        }).then( function(user, err) {
            if (err) {
                return workflow.emit('exception', err);
            }

            if (user) {
                workflow.outcome.errfor.email = 'email already taken';
                return workflow.emit('response');
            }

            workflow.emit('patchUser');
        });
    });

    workflow.on('patchUser', function() {
        req.app.db.User.findOne( { where: {id: req.body.id} })
            .then( function(User) {
                if (User) {
                    User.updateAttributes({
                        isActive: req.body.isActive,
                        username: req.body.username,
                        email: req.body.email.toLowerCase()
                    })
                        .then( function(user, err) {
                            if (err) {
                                return workflow.emit('exception', err);
                            }

                            workflow.emit('response');
                        });
                }
            });
    });

    workflow.on('patchAdmin', function(user) {
        if (user.roles.admin) {
            var fieldsToSet = {
                user: {
                    id: req.params.id,
                    name: user.username
                }
            };
            req.app.db.Admin.findByIdAndUpdate(user.roles.admin, fieldsToSet, function(err, admin) {
                if (err) {
                    return workflow.emit('exception', err);
                }

                workflow.emit('patchAccount', user);
            });
        } else {
            workflow.emit('patchAccount', user);
        }
    });

    workflow.on('patchAccount', function(user) {
        if (user.roles.account) {
            var fieldsToSet = {
                user: {
                    id: req.params.id,
                    name: user.username
                }
            };
            req.app.db.Account.findByIdAndUpdate(user.roles.account, fieldsToSet, function(err, account) {
                if (err) {
                    return workflow.emit('exception', err);
                }

                workflow.emit('populateRoles', user);
            });
        } else {
            workflow.emit('populateRoles', user);
        }
    });

    workflow.on('populateRoles', function(user) {
        user.populate('roles.admin roles.account', 'name.full', function(err, populatedUser) {
            if (err) {
                return workflow.emit('exception', err);
            }

            workflow.outcome.user = populatedUser;
            workflow.emit('response');
        });
    });

    workflow.emit('validate');
};

exports.password = function(req, res, next) {
    var workflow = req.app.utility.workflow(req, res);

    workflow.on('validate', function() {
        if (!req.body.newPassword) {
            workflow.outcome.errfor.newPassword = 'required';
        }

        if (!req.body.confirm) {
            workflow.outcome.errfor.confirm = 'required';
        }

        if (req.body.newPassword !== req.body.confirm) {
            workflow.outcome.errors.push('Passwords do not match.');
        }

        if (workflow.hasErrors()) {
            return workflow.emit('response');
        }

        workflow.emit('patchUser');
    });

    workflow.on('patchUser', function() {
        req.app.db.User.encryptPassword(req.body.newPassword, function(err, hash) {
            if (err) {
                return workflow.emit('exception', err);
            }

            var fieldsToSet = {
                password: hash
            };
            req.app.db.User.findByIdAndUpdate(req.params.id, fieldsToSet, function(err, user) {
                if (err) {
                    return workflow.emit('exception', err);
                }

                user.populate('roles.admin roles.account', 'name.full', function(err, user) {
                    if (err) {
                        return workflow.emit('exception', err);
                    }

                    workflow.outcome.user = user;
                    workflow.outcome.newPassword = '';
                    workflow.outcome.confirm = '';
                    workflow.emit('response');
                });
            });
        });
    });

    workflow.emit('validate');
};

exports.linkAdmin = function(req, res, next) {
    var workflow = req.app.utility.workflow(req, res);

    workflow.on('validate', function() {
        if (!req.user.canPlayRoleOf('superuser')) {
            workflow.outcome.errors.push('You may not link users to admins.');
            return workflow.emit('response');
        }
        if (!req.body.newAdminId) {
            workflow.outcome.errfor.newAdminId = 'required';
            return workflow.emit('response');
        }
        workflow.emit('verifyAdmin');
    });

    workflow.on('verifyAdmin', function(callback) {
        req.app.db.Admin.findOne( { where: {id: req.body.newAdminId} })
            .then( function( admin, err) {
                if (!admin) {
                    workflow.outcome.errors.push('Admin not found.');
                    return workflow.emit('response');
                }

                workflow.admin = admin;
                workflow.emit('patchUser');
                
            }).catch( function (err) {
                return workflow.emit('exception', err);

            });
    });

    workflow.on('patchUser', function(callback) {
        req.app.db.User.findOne( {where: {id: req.params.id}})
            .then( function(User) {
                if (User) {
                    User.updateAttributes({
                        adminGroupId: req.body.newAdminId
                    }).then( function() {
                        workflow.outcome.user = User;
                        workflow.emit('response');
                    }).catch( function(err){
                        return workflow.emit('exception', err);
                    });
                }
            }).catch( function (err) {
                return workflow.emit('exception', err);
            });
    });

    workflow.emit('validate');
};

exports.unlinkAdmin = function(req, res, next) {
    var workflow = req.app.utility.workflow(req, res);

    workflow.on('validate', function() {
        if (!req.user.roles.admin.isMemberOf('root')) {
            workflow.outcome.errors.push('You may not unlink users from admins.');
            return workflow.emit('response');
        }

        if (req.user._id === req.params.id) {
            workflow.outcome.errors.push('You may not unlink yourself from admin.');
            return workflow.emit('response');
        }

        workflow.emit('patchUser');
    });

    workflow.on('patchUser', function() {
        req.app.db.User.findById(req.params.id).exec(function(err, user) {
            if (err) {
                return workflow.emit('exception', err);
            }

            if (!user) {
                workflow.outcome.errors.push('User was not found.');
                return workflow.emit('response');
            }

            var adminId = user.roles.admin;
            user.roles.admin = null;
            user.save(function(err, user) {
                if (err) {
                    return workflow.emit('exception', err);
                }

                user.populate('roles.admin roles.account', 'name.full', function(err, user) {
                    if (err) {
                        return workflow.emit('exception', err);
                    }

                    workflow.outcome.user = user;
                    workflow.emit('patchAdmin', adminId);
                });
            });
        });
    });

    workflow.on('patchAdmin', function(id) {
        req.app.db.Admin.findById(id).exec(function(err, admin) {
            if (err) {
                return workflow.emit('exception', err);
            }

            if (!admin) {
                workflow.outcome.errors.push('Admin was not found.');
                return workflow.emit('response');
            }

            admin.user = undefined;
            admin.save(function(err, admin) {
                if (err) {
                    return workflow.emit('exception', err);
                }

                workflow.emit('response');
            });
        });
    });

    workflow.emit('validate');
};

exports.linkAccount = function(req, res, next) {
    var workflow = req.app.utility.workflow(req, res);

    workflow.on('validate', function() {
        if (!req.user.roles.admin.isMemberOf('root')) {
            workflow.outcome.errors.push('You may not link users to accounts.');
            return workflow.emit('response');
        }

        if (!req.body.newAccountId) {
            workflow.outcome.errfor.newAccountId = 'required';
            return workflow.emit('response');
        }

        workflow.emit('verifyAccount');
    });

    workflow.on('verifyAccount', function(callback) {
        req.app.db.Account.findById(req.body.newAccountId).exec(function(err, account) {
            if (err) {
                return workflow.emit('exception', err);
            }

            if (!account) {
                workflow.outcome.errors.push('Account not found.');
                return workflow.emit('response');
            }

            if (account.user.id && account.user.id !== req.params.id) {
                workflow.outcome.errors.push('Account is already linked to a different user.');
                return workflow.emit('response');
            }

            workflow.account = account;
            workflow.emit('duplicateLinkCheck');
        });
    });

    workflow.on('duplicateLinkCheck', function(callback) {
        req.app.db.User.findOne({
            'roles.account': req.body.newAccountId,
            _id: {
                $ne: req.params.id
            }
        }).exec(function(err, user) {
            if (err) {
                return workflow.emit('exception', err);
            }

            if (user) {
                workflow.outcome.errors.push('Another user is already linked to that account.');
                return workflow.emit('response');
            }

            workflow.emit('patchUser');
        });
    });

    workflow.on('patchUser', function(callback) {
        req.app.db.User.findById(req.params.id).exec(function(err, user) {
            if (err) {
                return workflow.emit('exception', err);
            }

            user.roles.account = req.body.newAccountId;
            user.save(function(err, user) {
                if (err) {
                    return workflow.emit('exception', err);
                }

                user.populate('roles.admin roles.account', 'name.full', function(err, user) {
                    if (err) {
                        return workflow.emit('exception', err);
                    }

                    workflow.outcome.user = user;
                    workflow.emit('patchAccount');
                });
            });
        });
    });

    workflow.on('patchAccount', function() {
        workflow.account.user = {
            id: req.params.id,
            name: workflow.outcome.user.username
        };
        workflow.account.save(function(err, account) {
            if (err) {
                return workflow.emit('exception', err);
            }

            workflow.emit('response');
        });
    });

    workflow.emit('validate');
};

exports.unlinkAccount = function(req, res, next) {
    var workflow = req.app.utility.workflow(req, res);

    workflow.on('validate', function() {
        if (!req.user.roles.admin.isMemberOf('root')) {
            workflow.outcome.errors.push('You may not unlink users from accounts.');
            return workflow.emit('response');
        }

        workflow.emit('patchUser');
    });

    workflow.on('patchUser', function() {
        req.app.db.User.findById(req.params.id).exec(function(err, user) {
            if (err) {
                return workflow.emit('exception', err);
            }

            if (!user) {
                workflow.outcome.errors.push('User was not found.');
                return workflow.emit('response');
            }

            var accountId = user.roles.account;
            user.roles.account = null;
            user.save(function(err, user) {
                if (err) {
                    return workflow.emit('exception', err);
                }

                user.populate('roles.admin roles.account', 'name.full', function(err, user) {
                    if (err) {
                        return workflow.emit('exception', err);
                    }

                    workflow.outcome.user = user;
                    workflow.emit('patchAccount', accountId);
                });
            });
        });
    });

    workflow.on('patchAccount', function(id) {
        req.app.db.Account.findById(id).exec(function(err, account) {
            if (err) {
                return workflow.emit('exception', err);
            }

            if (!account) {
                workflow.outcome.errors.push('Account was not found.');
                return workflow.emit('response');
            }

            account.user = undefined;
            account.save(function(err, account) {
                if (err) {
                    return workflow.emit('exception', err);
                }

                workflow.emit('response');
            });
        });
    });

    workflow.emit('validate');
};

exports.delete = function(req, res, next) {
    var workflow = req.app.utility.workflow(req, res);

    workflow.on('validate', function() {
        // TODO: Test whether the logged-in user has permission to edit users
        
        /*if (!req.user.roles.admin.isMemberOf('root')) {
            workflow.outcome.errors.push('You may not delete users.');
            return workflow.emit('response');
        }*/

        if (req.user.dataValues.id === req.params.id) {
            workflow.outcome.errors.push('You may not delete yourself from user.');
            return workflow.emit('response');
        }

        workflow.emit('deleteUser');
    });

    workflow.on('deleteUser', function(err) {
        req.app.db.User.findOne(
            {where: {id: req.params.id}
            }).then( function(User) {
                User.destroy();
                workflow.emit('response');
            }).catch ( function (err) {
                return workflow.emit('exception', err);
            })
        });

    workflow.emit('validate');
};

