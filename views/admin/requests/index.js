'use strict';
var _ = require('underscore');
var recipients_table = require(__dirname + '/../../../config/recipients.json');
var json2csv = require('json2csv');
var moment = require('moment');
exports.find = function(req, res, next) {
    if (_.isUndefined(req.query.page)) {
        req.query.page = 1;
    }
    if (_.isUndefined(req.query.limit)) {
        req.query.limit  = 500;
    }
    var outcome = {
        data: null,
        pages: {
            current: parseInt(req.query.page, null),
            prev: 0,
            hasPrev: false,
            next: 0,
            hasNext: false,
            total: 0
        },
        items: {
            begin: ((req.query.page * req.query.limit) - req.query.limit) + 1,
            end: req.query.page * req.query.limit,
            total: 0
        }
    };
    var countResults = function(callback) {
        req.app.db.Request.count().then(function(results) {
            outcome.items.total = results;
            callback(null, 'done counting');
        });
    };
    var includeClause = {
        model: req.app.db.SelectedCounties
    };
    var getResults = function(callback) {
        var filters = {};
        req.query.search = req.query.search ? req.query.search : '';
        req.query.limit = req.query.limit ? parseInt(req.query.limit, null) : 500;
        req.query.page = req.query.page ? parseInt(req.query.page, null) : 1;
        req.query.sort = req.query.sort ? req.query.sort : 'id';
        req.query.offset = (req.query.page - 1) * req.query.limit;
        req.query.startDate = (req.query.startDate) ? moment(req.query.startDate): moment('01-01-1980');
        req.query.endDate = (req.query.endDate) ? moment(req.query.endDate) : moment('01-01-2040');
        req.query.format = (req.query.format) ? req.query.format : 'json';

        filters.createdAt = {
            $between:[req.query.startDate.format(), req.query.endDate.format()]
        };
        if (req.query.search) {
            filters.name = {
                $ilike: '%' + req.query.search + '%'
            };
        }

        if (req.query.region) {
            includeClause.where = {
                region: req.query.region
            };
        }
        // Determine direction for order
        var sortOrder = (req.query.sort[0] === '-')? 'DESC' : 'ASC';

        // Determine whether to filter by date

        req.app.db.Request.findAll({
            limit:req.query.limit,
            offset:req.query.offset,
            where: filters,
            include: [includeClause],
            order: [[req.query.sort.replace('-',''), sortOrder ]]
        }).then(function(results) {
            // TODO: Right now this puts the region name in the address_2 field
            // which is not being used. Long term, this value should be in another
            // parameter.
            var findRegionPresentableName = function(request, index) {
                if (request.SelectedCounty) {
                    console.log("DEBUG: We are in here!: request = " + request + " & key = " + index);
                    var selectedRegion = request.SelectedCounty.region;
                    request.rc_region = recipients_table[selectedRegion]["region_display_name"];
                }
                return request;
            };
            var resultsWithRegionDisplayName = _.map(results, findRegionPresentableName); 
            outcome.data = resultsWithRegionDisplayName;
            outcome.pages.total = Math.ceil(outcome.items.total / req.query.limit);
            outcome.pages.next = ((outcome.pages.current + 1) > outcome.pages.total ? 0 : outcome.pages.current + 1);
            outcome.pages.hasNext = (outcome.pages.next !== 0);
            outcome.pages.prev = outcome.pages.current - 1;
            outcome.pages.hasPrev = (outcome.pages.prev !== 0);
            if (outcome.items.end > outcome.items.total) {
                outcome.items.end = outcome.items.total;
            }

            outcome.results = resultsWithRegionDisplayName;
            return callback(null, 'done');
        })
        .catch(function(err) {
            console.log("ERROR calling callback: " + err);
            return callback(err, null);
        });
    };

    var asyncFinally = function(err, results) {
        if (err) {
            return next(err);
        }

        if (req.xhr) {
            res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
            console.log("DEBUG: Check 1: " + JSON.stringify(req.query));
            outcome.filters = req.query;
            console.log("DEBUG: Check 2: " + JSON.stringify(req.query));
            res.send(outcome);
        } else {
            outcome.results.filters = req.query;
            if (req.query.format !== "csv") {
                res.render('admin/requests/index', {
                    data: {
                        results: escape(JSON.stringify(outcome))
                    }
                });
            } else {
                var requestFields = ['id','name','address','city','state','zip','phone','email','date created','region'];
                json2csv({ data: outcome.results, fields: requestFields }, function(err, csv) {
                    if (err) console.log("ERROR: error converting to CSV" + err);
                    console.log("DEBUG: outcome: " + JSON.stringify(outcome.results));
                    console.log("DEBUG: csv: " + JSON.stringify(csv));
                    res.setHeader('Content-Type','application/csv');
                    res.setHeader('Content-Disposition','attachment; filename=smoke-alarm-requests-' + moment().format() + '.csv;');
                    res.send(csv);
                });
            }
        }
    };
    require('async').parallel([countResults, getResults], asyncFinally);
};

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

exports.update = function(req, res, next) {
    var workflow = req.app.utility.workflow(req, res);

    workflow.on('validate', function() {
        if (!req.body.name) {
            workflow.outcome.errfor.name = 'required';
        }

        if (!req.body.last) {
            workflow.outcome.errfor.last = 'required';
        }

        if (workflow.hasErrors()) {
            return workflow.emit('response');
        }

        workflow.emit('patchRequest');
    });

    workflow.on('patchRequest', function() {
        var fieldsToSet = {
            name: {
                first: req.body.first,
                middle: req.body.middle,
                last: req.body.last,
                full: req.body.first + ' ' + req.body.last
            },
            company: req.body.company,
            phone: req.body.phone,
            zip: req.body.zip,
            search: [
                req.body.name,
                req.body.address,
                req.body.address_2,
                req.body.city,
                req.body.state,
                req.body.zip
            ]
        };

        req.app.db.models.Request.findByIdAndUpdate(req.params.id, fieldsToSet, function(err, Request) {
            if (err) {
                return workflow.emit('exception', err);
            }

            workflow.outcome.Request = Request;
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

