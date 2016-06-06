# How to test the external endpoint process


1. In `config/config.json`, set `"external_endpoint":
"http://localhost:3000/"` (or wherever your local copy of the app runs).
Now, if you enter a web request, you'll see `ForbiddenError: invalid
csrf token` and `DEBUG: statusCode from remote server was 500`.  That
means the app tried to post to the remote server (i.e., itself) but
didn't have the right token and was rejected.


2. So, in app.js, temporarily remove CSRF by commenting out the
following lines:

    ```
    app.use(csrf({
        cookie: {
            signed: true
        }
    }));
    ```
    and
    
    ```
        var token = req.csrfToken();
        res.locals.csrfToken = token;
        res.cookie('_csrfToken', token);
    ```

  Now, that is a huge security hole, so be sure not to leave it that
  way.

  This will also break the front page of the app, so in
  `views/index.js`, comment out `res.locals.csrf =
  encodeURIComponent(req.csrfToken());`.  Again, don't leave it like
  that.

  We need to make this change so that our API call to `/` will be
  accepted without a CSRF token.  This probably implies that we should
  have an environment option that allows us to test us without
  hand-commenting lines (TODO).

3. Create a valid auth token (can be any string for now) and add it to
your database like: `INSERT INTO "Tokens" (token, direction,
"createdAt", "updatedAt") values ('__YOUR_TOKEN__', 'inbound', now(),
now());`.  If you don't have a "Tokens" table, make sure you're on the
`196-api-integration` branch and restart the app.

4. Pass that token to our internal endpoint by adding a line like
`request.body = {"token": '__TOKEN_FROM_STEP_3__', "status":
'installed'};` to `postRequest` right after `var local_dest =
String(config.server_root + '/admin/requests/status/' +
request.serial);`.  Note that you can also test the internal endpoint
alone with a tool like Postman.




Now, whenever you submit a smoke alarm request from the front page of
the app, you'll see some more activity in the console and the status of
the request will be updated to "installed" in the database and the admin
area.

