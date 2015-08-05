# Smoke Alarm Portal

An open source web portal to handle requests for smoke alarm installation.

## Overview

The American Red Cross of Chicago and Northern Illinois (ARC-CNI)
seeks to improve smoke alarm installation rates in the Red Cross North
Central Division, which is comprised of 10 regions.  This software is
a lightweight web portal for receiving and routing smoke alarm
installation requests.

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

# Installation and Deployment

Please see [INSTALL.md](INSTALL.md) for detailed installation
instructions and dependency information.
