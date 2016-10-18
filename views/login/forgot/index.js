'use strict';
var db = require('../../../models');

exports.init = function(req, res){
  if (req.isAuthenticated()) {
    res.redirect(req.user.defaultReturnUrl());
  }
  else {
    res.render('login/forgot/index');
  }
};

exports.send = function(req, res, next){
    var workflow = req.app.utility.workflow(req, res);
    
    workflow.on('validate', function() {
    if (!req.body.email) {
      workflow.outcome.errfor.email = 'required';
      return workflow.emit('response');
    }

        workflow.emit('generateToken');
  });

  workflow.on('generateToken', function() {
    var crypto = require('crypto');
    crypto.randomBytes(21, function(err, buf) {
      if (err) {
        return next(err);
      }

      var token = buf.toString('hex');
      req.app.db.User.encryptPassword(token, function(err, hash) {
        if (err) {
          return next(err);
        }

        workflow.emit('patchUser', token, hash);
      });
    });
  });

  workflow.on('patchUser', function(token, hash) {
    var conditions = { email: req.body.email.toLowerCase() };
    var fieldsToSet = {
      resetPasswordToken: hash,
      resetPasswordExpires: Date.now() + 10000000
    };
      
      req.app.db.User.findOne( {where: conditions})
          .then( function(User) {
              if (User) {
                  return User.updateAttributes( fieldsToSet)
              }
              else {
                  return workflow.emit('exception', 'Sorry, we don\'t recognize that email address.' );
              }
          })
          .then(function (User) {
              workflow.emit('sendEmail', token, User);

          })
          .catch(function (err) {
              return workflow.emit('exception', err);
          });

  });

    workflow.on('sendEmail', function(token, user) {

        var email_text = "\n"
            + "Hi " + user.username + ","
            + "\n"
            + "\n"
            + "We received a request to reset the password for your account.  "
            + "\n"
            + "To reset your password, click here: "
            + req.protocol +'://'+ req.headers.host +'/login/reset/'+ user.email +'/'+ token +'/'
            + "\n"
            + "\n"
            + "Thank you, "
            + "\n"
            + "-The Smoke Alarm Request Portal";
        
        var outbound_email = {
            from: db.mail_from_addr,
            to: user.email,
            subject: 'Reset your '+ req.app.config.projectName +' password',
            text: email_text
        };

        db.mailgun.messages().send(outbound_email, function (error, body) {
            if (error) {
                workflow.outcome.errors.push('Error Sending:' + error);
                return workflow.emit('exception', error);
            }

            // TODO: We need to record the sent message's Message-ID 
            // (which is body.id) in the database, with the request.
            if (body.id === undefined) {
                console.log("DEBUG: sent mail ID was undefined");
            } else {
                console.log("DEBUG: sent mail ID:  '" + body.id + "'");
            }
            if (body.message === undefined) {
                console.log("DEBUG: sent mail msg was undefined");
            } else {
                console.log("DEBUG: sent mail msg: '" + body.message + "'");
            }
        });
        workflow.emit('response', "Thanks! You will receive an email shortly.");
    });
    
    workflow.emit('validate');

};
