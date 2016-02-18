'use strict';
var _ = require('underscore');
var json2csv = require('json2csv');
var moment = require('moment');


exports.read = function(req, res, next) {
    var outcome = {};

    var getRecord = function(callback) {
        req.app.db.models.Request.findById(req.params.id).exec(function(err, record) {
            if (err) {
                return callback(err, null);
            }

            outcome.record = record;
            return callback(null, 'done');
        });
    };

    var asyncFinally = function(err, results) {
        if (err) {
            return next(err);
        }

        if (req.xhr) {
            res.send(outcome.record);
        } else {
            res.render('admin/requests/details', {
                data: {
                    record: escape(JSON.stringify(outcome.record)),
                    statuses: outcome.statuses
                }
            });
        }
    };

    require('async').parallel([getRecord], asyncFinally);
};

exports.create = function(req, res, next) {
    var workflow = req.app.utility.workflow(req, res);

    workflow.on('validate', function() {
        if (!req.body['name.full']) {
            workflow.outcome.errors.push('Please enter a name.');
            return workflow.emit('response');
        }

        workflow.emit('createRequest');
    });

    workflow.on('createRequest', function() {
        var nameParts = req.body['name.full'].trim().split(/\s/);
        var fieldsToSet = {
            name: {
                first: nameParts.shift(),
                middle: (nameParts.length > 1 ? nameParts.shift() : ''),
                last: (nameParts.length === 0 ? '' : nameParts.join(' ')),
            },
            userCreated: {
                id: req.user._id,
                name: req.user.username,
                time: new Date().toISOString()
            }
        };
        fieldsToSet.name.full = fieldsToSet.name.first + (fieldsToSet.name.last ? ' ' + fieldsToSet.name.last : '');
        fieldsToSet.search = [
            fieldsToSet.name.first,
            fieldsToSet.name.middle,
            fieldsToSet.name.last
        ];

        req.app.db.models.Request.create(fieldsToSet, function(err, Request) {
            if (err) {
                return workflow.emit('exception', err);
            }

            workflow.outcome.record = Request;
            return workflow.emit('response');
        });
    });

    workflow.emit('validate');
};

exports.linkUser = function(req, res, next) {
    var workflow = req.app.utility.workflow(req, res);

    workflow.on('validate', function() {
        if (!req.user.roles.admin.isMemberOf('root')) {
            workflow.outcome.errors.push('You may not link Requests to users.');
            return workflow.emit('response');
        }

        if (!req.body.newUsername) {
            workflow.outcome.errfor.newUsername = 'required';
            return workflow.emit('response');
        }

        workflow.emit('verifyUser');
    });

    workflow.on('verifyUser', function(callback) {
        req.app.db.models.User.findOne({
            username: req.body.newUsername
        }).exec(function(err, user) {
            if (err) {
                return workflow.emit('exception', err);
            }

            if (!user) {
                workflow.outcome.errors.push('User not found.');
                return workflow.emit('response');
            } else if (user.roles && user.roles.Request && user.roles.Request !== req.params.id) {
                workflow.outcome.errors.push('User is already linked to a different Request.');
                return workflow.emit('response');
            }

            workflow.user = user;
            workflow.emit('duplicateLinkCheck');
        });
    });

    workflow.on('duplicateLinkCheck', function(callback) {
        req.app.db.models.Request.findOne({
            'user.id': workflow.user._id,
            _id: {
                $ne: req.params.id
            }
        }).exec(function(err, Request) {
            if (err) {
                return workflow.emit('exception', err);
            }

            if (Request) {
                workflow.outcome.errors.push('Another Request is already linked to that user.');
                return workflow.emit('response');
            }

            workflow.emit('patchUser');
        });
    });

    workflow.on('patchUser', function() {
        req.app.db.models.User.findByIdAndUpdate(workflow.user._id, {
            'roles.Request': req.params.id
        }).exec(function(err, user) {
            if (err) {
                return workflow.emit('exception', err);
            }

            workflow.emit('patchRequest');
        });
    });

    workflow.on('patchRequest', function(callback) {
        req.app.db.models.Request.findByIdAndUpdate(req.params.id, {
            user: {
                id: workflow.user._id,
                name: workflow.user.username
            }
        }).exec(function(err, Request) {
            if (err) {
                return workflow.emit('exception', err);
            }

            workflow.outcome.Request = Request;
            workflow.emit('response');
        });
    });

    workflow.emit('validate');
};

exports.unlinkUser = function(req, res, next) {
    var workflow = req.app.utility.workflow(req, res);

    workflow.on('validate', function() {
        if (!req.user.roles.admin.isMemberOf('root')) {
            workflow.outcome.errors.push('You may not unlink users from Requests.');
            return workflow.emit('response');
        }

        workflow.emit('patchRequest');
    });

    workflow.on('patchRequest', function() {
        req.app.db.models.Request.findById(req.params.id).exec(function(err, Request) {
            if (err) {
                return workflow.emit('exception', err);
            }

            if (!Request) {
                workflow.outcome.errors.push('Request was not found.');
                return workflow.emit('response');
            }

            var userId = Request.user.id;
            Request.user = {
                id: undefined,
                name: ''
            };
            Request.save(function(err, Request) {
                if (err) {
                    return workflow.emit('exception', err);
                }

                workflow.outcome.Request = Request;
                workflow.emit('patchUser', userId);
            });
        });
    });

    workflow.on('patchUser', function(id) {
        req.app.db.models.User.findById(id).exec(function(err, user) {
            if (err) {
                return workflow.emit('exception', err);
            }

            if (!user) {
                workflow.outcome.errors.push('User was not found.');
                return workflow.emit('response');
            }

            user.roles.Request = undefined;
            user.save(function(err, user) {
                if (err) {
                    return workflow.emit('exception', err);
                }

                workflow.emit('response');
            });
        });
    });

    workflow.emit('validate');
};

exports.newNote = function(req, res, next) {
    var workflow = req.app.utility.workflow(req, res);

    workflow.on('validate', function() {
        if (!req.body.data) {
            workflow.outcome.errors.push('Data is required.');
            return workflow.emit('response');
        }

        workflow.emit('addNote');
    });

    workflow.on('addNote', function() {
        var noteToAdd = {
            data: req.body.data,
            userCreated: {
                id: req.user._id,
                name: req.user.username,
                time: new Date().toISOString()
            }
        };

        req.app.db.models.Request.findByIdAndUpdate(req.params.id, {
            $push: {
                notes: noteToAdd
            }
        }, function(err, Request) {
            if (err) {
                return workflow.emit('exception', err);
            }

            workflow.outcome.Request = Request;
            return workflow.emit('response');
        });
    });

    workflow.emit('validate');
};

exports.newStatus = function(req, res, next) {
    var workflow = req.app.utility.workflow(req, res);

    workflow.on('validate', function() {
        if (!req.body.id) {
            workflow.outcome.errors.push('Please choose a status.');
        }

        if (workflow.hasErrors()) {
            return workflow.emit('response');
        }

        workflow.emit('addStatus');
    });

    workflow.on('addStatus', function() {
        var statusToAdd = {
            id: req.body.id,
            name: req.body.name,
            userCreated: {
                id: req.user._id,
                name: req.user.username,
                time: new Date().toISOString()
            }
        };

        req.app.db.models.Request.findByIdAndUpdate(req.params.id, {
            status: statusToAdd,
            $push: {
                statusLog: statusToAdd
            }
        }, function(err, Request) {
            if (err) {
                return workflow.emit('exception', err);
            }

            workflow.outcome.Request = Request;
            return workflow.emit('response');
        });
    });

    workflow.emit('validate');
};

exports.delete = function(req, res, next) {
    var workflow = req.app.utility.workflow(req, res);

    workflow.on('validate', function() {
        if (!req.user.roles.admin.isMemberOf('root')) {
            workflow.outcome.errors.push('You may not delete Requests.');
            return workflow.emit('response');
        }

        workflow.emit('deleteRequest');
    });

    workflow.on('deleteRequest', function(err) {
        req.app.db.models.Request.findByIdAndRemove(req.params.id, function(err, Request) {
            if (err) {
                return workflow.emit('exception', err);
            }

            workflow.outcome.Request = Request;
            workflow.emit('response');
        });
    });

    workflow.emit('validate');
};
