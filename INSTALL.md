# Installation instructions here.

1. Get the code.

        $ git clone git@github.com:OpenTechStrategies/smoke-alarm-portal.git

2. Install [Node](https://nodejs.org/download/) and npm (a package manager).  If
on Debian, run:

        $ sudo apt-get install nodejs
        $ sudo apt-get install npm

  2a. When you try to start the app (below) you may get an error like `sh: 1: node:
  not found`.  If so, install the legacy node package like so.  (See [the
  package](https://packages.debian.org/sid/nodejs-legacy) and [this StackOverflow
  answer](stackoverflow.com/questions/21168141/can-not-install-packages-using-node-package-manager-in-ubuntu)
  for more information about what's going on here.)

        $ sudo apt-get install nodejs-legacy

3. Install (couchdb)[http://couchdb.org/] from source.  On Debian, you may need to install these dependencies first (before building couchdb).

        $ sudo apt-get install build-essential libtool autoconf automake autoconf-archive pkg-config
        # for Debian >-7.0
        $ sudo apt-get install lsb-release
        $ sudo apt-get install erlang-base-hipe
        $ sudo apt-get install erlang-dev
        $ sudo apt-get install erlang-manpages
        $ sudo apt-get install erlang-eunit
        $ sudo apt-get install erlang-nox
        $ sudo apt-get install libicu-dev
        $ sudo apt-get install libcurl4-openssl-dev
        $ sudo apt-get install libmozjs185-dev

4. Start couchdb

        $ couchdb

5. Create database using [Futon](https://wiki.apache.org/couchdb/Getting_started_with_Futon
). Navigate to http://localhost:5984/_utils/ on the local server. Click on the "Create Database" link at the upper left of the screen. Enter "smoke_detector_requests" for the database name

6. Get the required node modules by running npm.

        $ cd smoke-alarm-portal
        $ npm install

7. Start smoke-alarm-portal app

        $ cd smoke-alarm-portal
        $ npm start


