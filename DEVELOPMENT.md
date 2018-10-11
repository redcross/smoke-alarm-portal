#Red Cross Smoke Alarm Portal Development

This file contains an overview of how to do development on this
application, as well as HOWTOs for specific tasks.

## Architecture Overview

TBD: Explain the various locations in the code tree that we most commonly find ourselves editing to accomplish tasks.

## User Model Overview

Each Red Cross region using the Smoke Alarm Portal has one or more
users (administrators) who have permission to view and manage requests
associated with that region.  Users are always individuals; that way
one of them can be added or removed for a particular region without
affecting the other users associated with that region.

Each region also has a designated email address to which notification
of inbound smoke alarm installation requests should be sent.
Sometimes that notification address is the same as an email address
for one the region's user accounts, and sometimes not (e.g., it might
be an alias that forwards the email to several people).

When a new user is created via the `/signup` route (which must first
be temporarily enabled via a `config.js` edit and server restart right
now, until issue #138 is resolved), that causes a new row in the
"Users" table to be created.  But the new user does not have
administrative privileges on any region(s) yet.  To grant privileges
for a particular region, set up the relation in the database in the
"regionPermissions" table:

    smokealarm=# select username, id from "User";
       username   | id
    --------------+----
     ...          | ...
     jrandom      | 1729
    (1729 rows)

    smokealarm=# select "rc_region", "region_name", "is_active" from "activeRegions";
       rc_region    |         region_name         | is_active
    ----------------+-----------------------------+-----------
     ...            | ...                         | ...
     IDMT           | Idaho/Montana               | t
    (15 rows)
    smokealarm=# INSERT INTO "regionPermissions" "(rc_region", "user_id", "createdAt", "updatedAt") VALUES ('IDMT', 1729, now(), now());

Meanwhile, notification address relations are in the "activeRegions" table:

    smokealarm=# select "rc_region", "contact_name", "contact_email" from "activeRegions";
       rc_region    |    contact_name      |            contact_email
    ----------------+----------------------+--------------------------------------
     ...            | ...                  | ...
     IDMT           | Idaho Montana Region | idmt-region-admin-nospam@redcross.org
    (15 rows)

(Yes, this is veering over into admin documentation, rather than
developer documentation.  At some point we should probably split it
out into a separate document.)

## Localization

Localization is handled via [i18n-2](https://www.npmjs.com/package/i18n-2)
and uses the ```__('...')``` syntax throughout.  When a string is found using
notation, it is then looked up against locales/en.js or locales/es.js.
Switching between those locales is handled by cookies and an option on the
main page.

If you change a string in the codebase, it will be added to those locale files,
meanining you'll need to commit the changes to github to prevent local changes
(See [#192](https://github.com/redcross/smoke-alarm-portal/issues/192)).

The current best practice is to use key fields, rather than entire english
strings, and have the more verbose information in the locale files as a whole
rather than counting on the system to generate and use with large strings.

## Coding Practices

### Change one thing at a time

Please make each commit be one logical change -- i.e., each commit
should be "about" one thing and not include parts of other changes.
Among other things, this means that a commit should not contain
unrelated whitespace changes that could distract someone trying to
read the commit's diff.

(Note that some text editors automatically trim trailing spaces at the
ends of lines, which leads to lots of spurious whitespace changes.
The Sublime Text editor does this; to turn that off, in Preferences ->
Settings -> User, set `trim_trailing_whitespace_on_save` to false.)

### Commit messages

Please use the commit message conventions described in
http://chris.beams.io/posts/git-commit/.  Include any issue numbers at
the end of the first (summary) line of the commit message, prefixed by
a #-mark.  If the commit is related to multiple issues, and you can't
fit them all on the summary line while keeping the line under 50
characters, then just put them in the body of the commit message.

Here's a good example commit message:

    commit 060a367d42c5ae15c388b7f348464a5ce8af600b
    Author: Mike Chu <his-email>
    Date:   Wed Mar 30 12:54:14 2016 -0500
    
        Edit validations for blank field #170
        
        Edited the validation so that it only raises an error if BOTH of the
        conditions are met: the field is not empty AND the format is invalid
    
    M	views/account/settings/index.jade
    M	views/account/settings/index.js

## HOWTOs:

### HOWTO Add a filter to the requests admin (http://<host>/admin/requests)

1. In `views/admin/requests/index.jade`, add a filter to the list of filters
   in the Underscore template id `tmpl-filters`. Note; there are currently 6
   filter boxes on this page, so if more are to be added, it might be good 
   to have a UI person check those out.

2. In the `find()` function in `views/admin/requests/index.js`, the query that
	 returns the requests to the frontend is the [Sequelize](http://sequelize.readthedocs.org/en/latest/) [findAll()](http://sequelize.readthedocs.org/en/latest/docs/querying/#where)
	 function. This is located in the getResults() function expression.

	 Currently, certain query parameters are used for certain filters. 
	 * The `beginDate` and `endDate` params are used for date range filtering
	 
	 * The `search` param is used for an ILIKE query. 
	 
	 * The `offset` and `limit` params are used for limiting ranges
	 
	 * The `region` param is used to filter by region

	 Each of these maps to a [Sequelize operator](http://sequelize.readthedocs.org/en/latest/docs/querying/#operators) or clause.

	 * `beginDate` and `endDate` are used with the $between operator.

	 * `offset` and `limit` are optional parameters to the findAll query


### HOWTO Add a new region

1. Add counties to the "SelectedCounties" table.  Note that the county
column here does not include the string "County," unlike the
corresponding column in the "UsAddress" table.  So, for any state's Cook
County, the "SelectedCounties" `county` column would have the string
"Cook," while the "UsAddress" `county` column has the string "Cook
County."  In both tables, the state name is spelled out, not given in
its postal abbreviation form.

    ```
    for county in region:
        INSERT INTO "SelectedCounties" (region, state, county, "createdAt",
        "updatedAt") VALUES ('__REGION_ID__', '__FULL_STATE_NAME__',
        '__COUNTY_NAME_NO_COUNTY__', now(), now());
    ```

2. Add the region to the `activeRegions` table.

    ```
    
    INSERT INTO "activeRegions" (rc_region, region_name, contact_name,
    contact_email, is_active, "createdAt", "updatedAt") values ('__REGION_ID__',
    '__REGION_FULL_NAME__', '__CONTACT_PERSON_NAME__',
    '__CONTACT__EMAIL__ADDRESS__', true, now(), now());
    
    ```

3. Add an admin user for the new region.

   a. Enable the signup route and add a user from the GUI interface.
   b. Give that new user access to the new region.
    ```
    INSERT INTO "regionPermissions" (rc_region, user_id, "createdAt",
    "updatedAt") VALUES ('__NEW_REGION_ID__', '__NEW_USER_ID__', now(),
    now()); 
    ```
    
4. Grant access for the new region to the global admin user, if one
exists.
    ```
    INSERT INTO "regionPermissions" (rc_region, user_id, "createdAt",
    "updatedAt") VALUES ('__NEW_REGION_ID__', '__ADMIN_USER_ID__', now(),
    now()); 
    ```

5. Update `data/selected_counties.json` with the new region's counties,
so that fresh installs/imports will be up to date.

6. Update the "availability" language on the front page of the app.

## Notes:

### DB Table Usage for Red Cross Smoke Alarm App. This lists the models (and accompanying tables) and their current status regarding the application. The tables that are not used
are candidates for removal later.

* Account - Used by Drywall for user management.
* Admin - Used by Drywall for user management.
* AdminGroup - Used by Drywall for user management.
* Category - Part of Drywall package, but not used for this application.
* LoginAttempt - Used by Drywall for user management.
* Message - Part of Drywall package, but not used for this application.
* Note - Part of Drywall package, but not used for this application.
* Requests - Used in this application.
* SelectedCounties - Used in this application.
* Status - Part of Drywall package, but not used for this application.
* StatusLog - Part of Drywall package, but not used for this application.
* UsAddress - Used in this application.
* User -  Used by Drywall for user management.