/* Smoke Alarm Installation Request Portal (getasmokealarm.org)
 * 
 * Copyright (C) 2015  American Red Cross
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

'use strict';

require('dotenv').config()

exports.port = process.env.PORT || 3000;
exports.companyName = process.env.COMPANY_NAME;
exports.projectName = process.env.PROJECT_NAME;
exports.systemEmail = process.env.SYSTEM_EMAIL;
// This confirms whether the signup route is available
// or not. This affects both the availability of the signup
// URL as well as the navigation link to "Sign Up" at the top
// of the navigation for the admin section.
exports.signupEnabled = process.env.SIGNUP_ENABLED;

// Configure Geocoding API API key
exports.googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;

// Make up your own key here.  More background:
//
// I believe the cryptoKey is used to server-side sign session data
// that is then sent in a cookie to the client -- the client never
// knows the key, so the client therefore cannot tamper with any of
// the data in the cookie, because if it did, the digital signature on
// the cookie would be invalid.
//
// These two pages have more information.  In the first page, I think
// where they say "encrypt" they really mean "sign"; the second page
// explains the situation pretty straightforwardly, but it helps to
// have read the first page for context:
// 
//   http://stackoverflow.com/questions/18565512/importance-of-session-secret-key-in-express-web-framework
//   http://stackoverflow.com/questions/6719036/why-cherrypy-session-does-not-require-a-secret-key
exports.cryptoKey = process.env.CRYPTO_KEY;

exports.loginAttempts = {
  forIp: process.env.ALLOWED_LOGIN_ATTEMPS_IP,
  forIpAndUser: process.env.ALLOWED_LOGIN_ATTEMPTS_USER,
  logExpiration: process.env.LOG_EXPIRATION
};
exports.requireAccountVerification = process.env.REQUIRE_ACCOUNT_VERIFICATION;
exports.smtp = {
  from: {
    name: process.env.SMTP_FROM_NAME || exports.projectName +' Website',
    address: process.env.SMTP_FROM_ADDRESS || 'jrandom@example.com'
  },
  credentials: {
    user: process.env.SMTP_USERNAME || 'jrandom@example.com',
    password: process.env.SMTP_PASSWORD || '',
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    ssl: true
  }
};
exports.oauth = {
  twitter: {
    key: process.env.OAUTH_TWITTER_KEY || '',
    secret: process.env.OAUTH_TWITTER_SECRET || ''
  },
  facebook: {
    key: process.env.OAUTH_FACEBOOK_KEY || '',
    secret: process.env.OAUTH_FACEBOOK_SECRET || ''
  },
  github: {
    key: process.env.OAUTH_GITHUB_KEY || '',
    secret: process.env.OAUTH_GITHUB_SECRET || ''
  },
  google: {
    key: process.env.OAUTH_GOOGLE_KEY || '',
    secret: process.env.OAUTH_GOOGLE_SECRET || ''
  },
  tumblr: {
    key: process.env.OAUTH_TUMBLR_KEY || '',
    secret: process.env.OAUTH_TUMBLR_SECRET || ''
  }
};
