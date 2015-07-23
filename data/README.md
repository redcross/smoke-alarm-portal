Smoke Alarm Portal DATA Information & Considerations
====================================================

This file reviews the information & history of the data decisions
around the Smoke Alarm Portal project in order to provide some
history & context for decisions made as well as instructions for
installing and/or deploying this application on other machines.

Region Boundaries in the Red Cross North Central Division.
----------------------------------------------------------

We have PDF maps that show the exact boundaries of all Red Cross
Regions in the North Central Division.  However, our application code
needs county names as text, associated with state names also as text.

Even then we'll have a few issues with regions that slip over state
lines in a few places, and even with a few region boundaries that run
through certain counties.  But we'll deal with the edge cases later.
For the moment, 'selected_counties.json' just treats regions as
falling perfectly along state boundaries: if a county is in a given
state, and that state is in a region, then that county is assumed to
be in that region.  We can look at the maps and tweak the data later.

The counties-per-state data came from Wikipedia:

  * RCIA_REG_CO.pdf:
    - https://en.wikipedia.org/wiki/List_of_counties_in_Iowa

  * RCIDMT_REG_CO.pdf:
    - https://en.wikipedia.org/wiki/List_of_counties_in_Idaho
    - https://en.wikipedia.org/wiki/List_of_counties_in_Montana

  * RCIL_REG_CO.pdf:
    - https://en.wikipedia.org/wiki/List_of_counties_in_Illinois

  * RCKSNE_REG_CO.pdf:
    - https://en.wikipedia.org/wiki/List_of_counties_in_Kansas
    - https://en.wikipedia.org/wiki/List_of_counties_in_Nebraska

  * RCMN_REG_CO.pdf:
    - https://en.wikipedia.org/wiki/List_of_counties_in_Minnesota

  * RCMO_REG_CO.pdf:
    - https://en.wikipedia.org/wiki/List_of_counties_in_Missouri

  * RCNDSD_REG_CO.pdf:
    - https://en.wikipedia.org/wiki/List_of_counties_in_South_Dakota
    - https://en.wikipedia.org/wiki/List_of_counties_in_North_Dakota

  * RCWI_REG_CO.pdf:
    - https://en.wikipedia.org/wiki/List_of_counties_in_Wisconsin


Data storage history & migration
--------------------------------
This application was originally developed using CouchDB as the backend
data store; the intent was to try out a relatively unused technology
and augment the team skillset. After a couple of sprints, we made the
decision to move to Postgres due to:


* Greater familiarity with SQL queries than with Map/Reduce and CouchDB
  views.

* Greater hosting/sysadmin familiarity with PostgreSQL than CouchDB.

The database migration was accomplished using the following steps:

* Installed [Sequelize](http://docs.sequelizejs.com/en/latest/) as
  an ORM to connect with Postgres. Also added the CLI for
  command line options.

  `npm install --save sequelize`
  `npm install -g sequelize-cli`

* Created an application skeleton for the Sequlize ORM and started
  environment specific config settings using

  `sequelize init:models`

* Created explicit models (located in /models/*) files that sync to
  database tables.

* Created a 'smokealarm_development' database in local Postgres instance

* Created an import script (data/import_into_postgres.js) that seeds the
  database with required information via Javascript Promises in order to
  select the counties properly.

* Modified the queries in routes/index.js so that the Postgres data store
  is used

Environments that do not have a Postgres instance installed will need to
install one. Detailed [Postgres Debian installation](https://wiki.debian.org/PostgreSql)
instructions are available, and the commands used to install Postgres are as follows:

* `apt-get install postgresql postgresql-client` - install the db
* `adduser <user>` - create postgres system user
* `createuser <dbuser> ` - create postgres database user
* `createdb -O <dbuser> <database>` - create postgres database

Once the database is created, a "staging" environment should be added to the
`config/config.json` file. Replace the username/password used with environmental
variables set in the shell of the user who starts the server. The "test" environment
has an example of how that works.






