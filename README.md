# Smoke Alarm Portal

An open source web portal to handle requests for smoke alarm
installation.  Preview available at
[demo.getasmokealarm.org](https://demo.getasmokealarm.org/).

## Overview

The American Red Cross of Chicago and Northern Illinois (ARC-CNI)
seeks to improve smoke alarm installation rates in the Red Cross North
Central Division, which is comprised of 10 regions.  This software is
a lightweight web portal for receiving and routing smoke alarm
installation requests.

Please see [DEVELOPMENT.md](DEVELOPMENT.md) for information about
design, user model, data model, and development / contribution.

## Features

The expected user workflow is:

* A person visits the front page and enters their installation request:
  name, address, phone number, etc.

* We log the request: all the information the user provided, plus the
  date of the request and a unique identifier for the request (i.e., a
  ticket number).

* We geocode the request to figure out what Red Cross region should
  handle it.

* If it is one of the regions included in this pilot program, we send
  an email to the designated contact person for that region, giving
  the details of the request, and show the user a confirmation page
  telling them this has been done.  Otherwise, we show the user a page
  with a short message explaining that Red Cross is not handling
  online requests for smoke alarm installation in their region yet,
  but giving the user a toll-free number at which to contact the Red
  Cross about getting a smoke alarm installated.

For admins, there are some basic reports that can be generated:

* Requests filtered by date range

* _(optional)_ Requests filtered by state and county

* _(optional)_ CSV export option for any set of report results

# Technologies Used

Node.js, Express, Jade, PostgreSQL, Sequelize, and the usual suspects.

# Installation

Please see [INSTALL.md](INSTALL.md) for detailed installation
instructions and dependency information.

# Deployment Tags

We use tags to mark code versions that have been deployed to the live
site, [getasmokealarm.org](https://getasmokealarm.org).  The tags are
named `deployed-<date of deployment>`.  To create and share an annotated
tag, run:

    $ git tag -a <tagname> -m <tag message>
    $ git push origin <tagname>
    
To each new tag, we attach an annotation saying what the main new
features and/or bugfixes are in this tag, relative to the previous one.
We name the previous tag explicitly in the new tag's message.  It looks
something like this:

```
deployed-exampledate

This deployed version fixes the issue remaining from tag-previousdate in
which the site displayed red text instead of white.

```

We also recommend keeping a separate file, outside this tree, with
specific deployment details like why this commit was deployed to
production and any other commands that were run on the server
(e.g. database changes, new users).