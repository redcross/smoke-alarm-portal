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
  name, address, phone number, and a "can receive txt messages"
  checkbox to indicate if that phone number can receive txts or not.

* We log the request: all the information the user provided, plus the
  date of the request and a unique identifier for the request (i.e., a
  ticket number).

* We geocode the request to find out what Red Cross region should
  handle it.

* If it is one of the regions included in this pilot, send an email to
  the designated email address for that region, giving the details of
  the request, and show the user a confirmation page telling them this
  has been done.  Otherwise, show the user a page with a short message
  explaining that Red Cross is not handling online requests for smoke
  alarm installation in their region yet, but giving contact
  information for the relevant Red Cross office to talk to about smoke
  alarm installation for that location.

For admins, there are some basic reports that can be generated:

* Requests filtered by date range

* _(optional)_ Requests filtered by state and county

* _(optional)_ CSV export option for any set of report results

# Technologies Used

Node.js, Jade templates, PostgreSQL, and the usual suspects.

# Installation and Deployment

Please see [INSTALL.md](INSTALL.md) for detailed installation
instructions and dependency information.
