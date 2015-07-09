'use strict';
exports.init = function(req, res) {
    if (req.isAuthenticated()) {
        res.redirect(req.user.defaultReturnUrl());
    } else {
        res.render('signup/index', {
            oauthMessage: '',
            oauthTwitter: !!req.app.config.oauth.twitter.key,
            oauthGitHub: !!req.app.config.oauth.github.key,
            oauthFacebook: !!req.app.config.oauth.facebook.key,
            oauthGoogle: !!req.app.config.oauth.google.key,
            oauthTumblr: !!req.app.config.oauth.tumblr.key
        });
    }
};

exports.signup = function(req, res) {
    console.log(req.body);
    var workflow = req.app.utility.workflow(req, res);

    workflow.on('validate', function() {
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

        if (!req.body.password) {
            workflow.outcome.errfor.password = 'required';
        }

        if (workflow.hasErrors()) {
            return workflow.emit('response');
        }

        workflow.emit('duplicateUsernameCheck');
    });

    workflow.on('duplicateUsernameCheck', function() {
        req.app.db.User.findOne({
                username: req.body.username
            })
            .then(function(user) {
                console.log('User', user);
                if (user) {
                    workflow.outcome.errfor.username = 'username already taken';
                    return workflow.emit('response');
                }
                workflow.emit('duplicateEmailCheck');
            })
            .catch(function(err) {
                console.log(err);
                return workflow.emit('exception', err);
            });
    });

    workflow.on('duplicateEmailCheck', function() {
        console.log('Duplicate email');
        req.app.db.User.findOne({
                email: req.body.email.toLowerCase()
            })
            .then(function(user) {
                if (user) {
                    workflow.outcome.errfor.email = 'email already registered';
                    return workflow.emit('response');
                }

                workflow.emit('createUser');
            })
            .catch(function(err) {
                console.log('Err dupicate email', err);
                return workflow.emit('exception', err);
            });
    });


    workflow.on('createUser', function() {
        console.log('Create User');
        req.app.db.User.encryptPassword(req.body.password, function(err, hash) {
            if (err) {
                return workflow.emit('exception', err);
            }

            var fieldsToSet = {
                isActive: 'yes',
                username: req.body.username,
                email: req.body.email.toLowerCase(),
                password: hash
            };

            req.app.db.User.create(fieldsToSet)
                .then(function(user) {
                    workflow.user = user;
                    workflow.emit('createAccount');
                })
                .catch(function(err) {
                    return workflow.emit('exception', err);
                });

        });
    });


    workflow.on('createAccount', function() {
        console.log('Create account');
        var fieldsToSet = {
            isVerified: req.app.config.requireAccountVerification ? 'no' : 'yes',
            'name.full': workflow.user.username,
        };

        req.app.db.Account.create(fieldsToSet)
            .then(function(account) {
                return account.setUser(workflow.user);
            }).then(function(account) {
                workflow.emit('sendWelcomeEmail');
            })
            .catch(function(err) {
                return workflow.emit('exception', err);
            });
    });

    workflow.on('sendWelcomeEmail', function() {
        console.log('Send welcome email');
        req.app.utility.sendmail(req, res, {
            from: req.app.config.smtp.from.name + ' <' + req.app.config.smtp.from.address + '>',
            to: req.body.email,
            subject: 'Your ' + req.app.config.projectName + ' Account',
            textPath: 'signup/email-text',
            htmlPath: 'signup/email-html',
            locals: {
                username: req.body.username,
                email: req.body.email,
                loginURL: req.protocol + '://' + req.headers.host + '/login/',
                projectName: req.app.config.projectName
            },
            success: function(message) {
                workflow.emit('logUserIn');
            },
            error: function(err) {
                console.log('Error Sending Welcome Email: ' + err);
                workflow.emit('logUserIn');
            }
        });
    });

    workflow.on('logUserIn', function() {
        console.log('Log user in');
        req._passport.instance.authenticate('local', function(err, user, info) {
            if (err) {
                return workflow.emit('exception', err);
            }

            if (!user) {
                workflow.outcome.errors.push('Login failed. That is strange.');
                return workflow.emit('response');
            } else {
                req.login(user, function(err) {
                    if (err) {
                        return workflow.emit('exception', err);
                    }

                    workflow.outcome.defaultReturnUrl = user.defaultReturnUrl();
                    workflow.emit('response');
                });
            }
        })(req, res);
    });

    workflow.emit('validate');
};

exports.signupTwitter = function(req, res, next) {
    req._passport.instance.authenticate('twitter', function(err, user, info) {
        if (!info || !info.profile) {
            return res.redirect('/signup/');
        }

        req.app.db.User.findOne({
            'twitter.id': info.profile.id
        }, function(err, user) {
            if (err) {
                return next(err);
            }

            if (!user) {
                req.session.socialProfile = info.profile;
                res.render('signup/social', {
                    email: ''
                });
            } else {
                res.render('signup/index', {
                    oauthMessage: 'We found a user linked to your Twitter account.',
                    oauthTwitter: !!req.app.config.oauth.twitter.key,
                    oauthGitHub: !!req.app.config.oauth.github.key,
                    oauthFacebook: !!req.app.config.oauth.facebook.key,
                    oauthGoogle: !!req.app.config.oauth.google.key,
                    oauthTumblr: !!req.app.config.oauth.tumblr.key
                });
            }
        });
    })(req, res, next);
};

exports.signupGitHub = function(req, res, next) {
    req._passport.instance.authenticate('github', function(err, user, info) {
        if (!info || !info.profile) {
            return res.redirect('/signup/');
        }

        req.app.db.User.findOne({
            'github.id': info.profile.id
        }, function(err, user) {
            if (err) {
                return next(err);
            }

            if (!user) {
                req.session.socialProfile = info.profile;
                res.render('signup/social', {
                    email: info.profile.emails && info.profile.emails[0].value || ''
                });
            } else {
                res.render('signup/index', {
                    oauthMessage: 'We found a user linked to your GitHub account.',
                    oauthTwitter: !!req.app.config.oauth.twitter.key,
                    oauthGitHub: !!req.app.config.oauth.github.key,
                    oauthFacebook: !!req.app.config.oauth.facebook.key,
                    oauthGoogle: !!req.app.config.oauth.google.key,
                    oauthTumblr: !!req.app.config.oauth.tumblr.key
                });
            }
        });
    })(req, res, next);
};

exports.signupFacebook = function(req, res, next) {
    req._passport.instance.authenticate('facebook', {
        callbackURL: '/signup/facebook/callback/'
    }, function(err, user, info) {
        if (!info || !info.profile) {
            return res.redirect('/signup/');
        }

        req.app.db.User.findOne({
            'facebook.id': info.profile.id
        }, function(err, user) {
            if (err) {
                return next(err);
            }
            if (!user) {
                req.session.socialProfile = info.profile;
                res.render('signup/social', {
                    email: info.profile.emails && info.profile.emails[0].value || ''
                });
            } else {
                res.render('signup/index', {
                    oauthMessage: 'We found a user linked to your Facebook account.',
                    oauthTwitter: !!req.app.config.oauth.twitter.key,
                    oauthGitHub: !!req.app.config.oauth.github.key,
                    oauthFacebook: !!req.app.config.oauth.facebook.key,
                    oauthGoogle: !!req.app.config.oauth.google.key,
                    oauthTumblr: !!req.app.config.oauth.tumblr.key
                });
            }
        });
    })(req, res, next);
};

exports.signupGoogle = function(req, res, next) {
    req._passport.instance.authenticate('google', {
        callbackURL: '/signup/google/callback/'
    }, function(err, user, info) {
        if (!info || !info.profile) {
            return res.redirect('/signup/');
        }

        req.app.db.User.findOne({
            'google.id': info.profile.id
        }, function(err, user) {
            if (err) {
                return next(err);
            }
            if (!user) {
                req.session.socialProfile = info.profile;
                res.render('signup/social', {
                    email: info.profile.emails && info.profile.emails[0].value || ''
                });
            } else {
                res.render('signup/index', {
                    oauthMessage: 'We found a user linked to your Google account.',
                    oauthTwitter: !!req.app.config.oauth.twitter.key,
                    oauthGitHub: !!req.app.config.oauth.github.key,
                    oauthFacebook: !!req.app.config.oauth.facebook.key,
                    oauthGoogle: !!req.app.config.oauth.google.key,
                    oauthTumblr: !!req.app.config.oauth.tumblr.key
                });
            }
        });
    })(req, res, next);
};

exports.signupTumblr = function(req, res, next) {
    req._passport.instance.authenticate('tumblr', {
        callbackURL: '/signup/tumblr/callback/'
    }, function(err, user, info) {
        if (!info || !info.profile) {
            return res.redirect('/signup/');
        }

        if (!info.profile.hasOwnProperty('id')) {
            info.profile.id = info.profile.username;
        }

        req.app.db.User.findOne({
            'tumblr.id': info.profile.id
        }, function(err, user) {
            if (err) {
                return next(err);
            }
            if (!user) {
                req.session.socialProfile = info.profile;
                res.render('signup/social', {
                    email: info.profile.emails && info.profile.emails[0].value || ''
                });
            } else {
                res.render('signup/index', {
                    oauthMessage: 'We found a user linked to your Tumblr account.',
                    oauthTwitter: !!req.app.config.oauth.twitter.key,
                    oauthGitHub: !!req.app.config.oauth.github.key,
                    oauthFacebook: !!req.app.config.oauth.facebook.key,
                    oauthGoogle: !!req.app.config.oauth.google.key,
                    oauthTumblr: !!req.app.config.oauth.tumblr.key
                });
            }
        });
    })(req, res, next);
};

exports.signupSocial = function(req, res) {
    var workflow = req.app.utility.workflow(req, res);

    workflow.on('validate', function() {
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
        workflow.username = req.session.socialProfile.username || req.session.socialProfile.id;
        if (!/^[a-zA-Z0-9\-\_]+$/.test(workflow.username)) {
            workflow.username = workflow.username.replace(/[^a-zA-Z0-9\-\_]/g, '');
        }

        req.app.db.User.findOne({
            username: workflow.username
        }, function(err, user) {
            if (err) {
                return workflow.emit('exception', err);
            }

            if (user) {
                workflow.username = workflow.username + req.session.socialProfile.id;
            } else {
                workflow.username = workflow.username;
            }

            workflow.emit('duplicateEmailCheck');
        });
    });

    workflow.on('duplicateEmailCheck', function() {
        req.app.db.User.findOne({
            email: req.body.email.toLowerCase()
        }, function(err, user) {
            if (err) {
                return workflow.emit('exception', err);
            }

            if (user) {
                workflow.outcome.errfor.email = 'email already registered';
                return workflow.emit('response');
            }

            workflow.emit('createUser');
        });
    });

    workflow.on('createUser', function() {
        var fieldsToSet = {
            isActive: 'yes',
            username: workflow.username,
            email: req.body.email.toLowerCase(),
            search: [
                workflow.username,
                req.body.email
            ]
        };
        fieldsToSet[req.session.socialProfile.provider] = {
            id: req.session.socialProfile.id
        };

        req.app.db.User.create(fieldsToSet, function(err, user) {
            if (err) {
                return workflow.emit('exception', err);
            }

            workflow.user = user;
            workflow.emit('createAccount');
        });
    });

    workflow.on('createAccount', function() {
        var displayName = req.session.socialProfile.displayName || '';
        var nameParts = displayName.split(' ');
        var fieldsToSet = {
            isVerified: 'yes',
            'name.first': nameParts[0],
            'name.last': nameParts[1] || '',
            'name.full': displayName,
            user: {
                id: workflow.user._id,
                name: workflow.user.username
            },
            search: [
                nameParts[0],
                nameParts[1] || ''
            ]
        };
        req.app.db.Account.create(fieldsToSet, function(err, account) {
            if (err) {
                return workflow.emit('exception', err);
            }

            //update user with account
            workflow.user.roles.account = account._id;
            workflow.user.save(function(err, user) {
                if (err) {
                    return workflow.emit('exception', err);
                }

                workflow.emit('sendWelcomeEmail');
            });
        });
    });

    workflow.on('sendWelcomeEmail', function() {
        req.app.utility.sendmail(req, res, {
            from: req.app.config.smtp.from.name + ' <' + req.app.config.smtp.from.address + '>',
            to: req.body.email,
            subject: 'Your ' + req.app.config.projectName + ' Account',
            textPath: 'signup/email-text',
            htmlPath: 'signup/email-html',
            locals: {
                username: workflow.user.username,
                email: req.body.email,
                loginURL: req.protocol + '://' + req.headers.host + '/login/',
                projectName: req.app.config.projectName
            },
            success: function(message) {
                workflow.emit('logUserIn');
            },
            error: function(err) {
                console.log('Error Sending Welcome Email: ' + err);
                workflow.emit('logUserIn');
            }
        });
    });

    workflow.on('logUserIn', function() {
        req.login(workflow.user, function(err) {
            if (err) {
                return workflow.emit('exception', err);
            }

            delete req.session.socialProfile;
            workflow.outcome.defaultReturnUrl = workflow.user.defaultReturnUrl();
            workflow.emit('response');
        });
    });

    workflow.emit('validate');
};

