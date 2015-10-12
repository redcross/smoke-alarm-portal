var env = process.env.NODE_ENV || 'development';
var config = require(__dirname + '/../../config/config.json')[env];

exports.respond = function(req, res) {
    console.log(req.body);
    
    // array of script responses
    var responses_array = ["Welcome to the smoke alarm request system (para español, texto 'ES'). We need to ask four questions to process your request. Please text back the answer to each and wait for the next question. First, what is your name?", "What is your address, including the unit number, city, state, and zipcode?", "Is the number you're texting from the best way to get in touch with you? If so, text YES. Otherwise, please text a phone number where we can reach you.", "One last question: is there an email address we can use to contact you? If not, text NONE. If yes, please text us the email address.", "Thank you for your smoke alarm request! Your request number is <serial number>. To contact your local Red Cross about this request, call <local phone number>. We will be in touch with you to schedule an installation."];
    // TODO: the last response will need to be changed after we store
    // the request and get the RC region name, serial number, and other
    // info from the db.

    // TODO: how many texts have we sent them?  Get this from a cookie
    // we've set or by searching our sent texts.  For now, a
    // placeholder:
    var text_num = 0;
    
    // TODO: store their incoming texts and construct a request object
    // from them to insert into the db.  This might be a totally
    // separate function.

    var twilio = require('twilio');
    var resp = new twilio.TwimlResponse();
    
    // Send response, from array above
    resp.sms( responses_array[text_num] );

    res.writeHead(200, {
        'Content-Type':'text/xml'
    });
    res.end(resp.toString());

};
