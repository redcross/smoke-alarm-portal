'use strict';
var db = require('../../../models');

exports.init = function(req, res){
  if (req.isAuthenticated()) {
    res.redirect(req.user.defaultReturnUrl());
  }
  else {
    res.render('login/reset/index');
  }
};

exports.set = function(req, res){
  var workflow = req.app.utility.workflow(req, res);

  workflow.on('validate', function() {
    if (!req.body.password) {
      workflow.outcome.errfor.password = 'required';
    }

    if (!req.body.confirm) {
      workflow.outcome.errfor.confirm = 'required';
    }

    if (req.body.password !== req.body.confirm) {
      workflow.outcome.errors.push('Passwords do not match.');
    }

    if (workflow.hasErrors()) {
      return workflow.emit('response');
    }

    workflow.emit('findUser');
  });

  workflow.on('findUser', function() {
    var conditions = {
        email: req.params.email,
        resetPasswordExpires: { gt: db.sequelize.fn('NOW') }
    };
      req.app.db.User.findOne({where: conditions})
          .then( function(user, err) {
              if (err) {
                  return workflow.emit('exception', err);
              }

              if (!user) {
                  workflow.outcome.errors.push('Invalid request.');
                  return workflow.emit('response');
              }

              req.app.db.User.validatePassword(req.params.token, user.resetPasswordToken, function(err, isValid) {
                  if (err) {
                      return workflow.emit('exception', err);
                  }

                  if (!isValid) {
                      workflow.outcome.errors.push('Invalid request.');
                      return workflow.emit('response');
                  }

                  workflow.emit('patchUser', user);
              });
          });
  });

  workflow.on('patchUser', function(user) {
    req.app.db.User.encryptPassword(req.body.password, function(err, hash) {
      if (err) {
        return workflow.emit('exception', err);
      }

        var fieldsToSet = { password: hash, resetPasswordToken: '' };
        req.app.db.User.findOne( {where: {id: user.id} })
            .then( function (user) {
                console.log(fieldsToSet)
                return user.updateAttributes(fieldsToSet);
            }).then( function(user) {
                if (!user) {
                    return workflow.emit('exception');
                }
                workflow.emit('response');
            });
    });
  });

  workflow.emit('validate');
};
