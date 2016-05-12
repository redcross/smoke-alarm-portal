'use strict';

exports = module.exports = function(app) {
    // Twilio delivery checks
    app.get('/sms/response/', require('./views/sms/response/index').init);
    app.post('/sms/response/', require('./views/sms/response/index').status);


    // AllReady integration:

    // list of active regions
    app.get('/regions/', require('./controllers/regions/index').init);

    // Status updates from AllReady (including confirmation of our initial POST)
    app.get('/admin/requests/status/', require('./views/admin/requests/status/index').init);
    app.post('/admin/requests/status/:id', require('./views/admin/requests/status/index').update);
    
    // New request list (takes date last polled, returns requests since
    // then).  We may not need this one, since we'll be sending them
    // each new request when it comes in.
    //app.get('/admin/requests/allnew/', require('./views/admin/requests/allnew/index').init);
}
