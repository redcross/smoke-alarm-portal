'use strict';

exports = module.exports = function(app) {
    app.get('/sms/response/', require('./views/sms/response/index').init);
    app.post('/sms/response/', require('./views/sms/response/index').status);
}
