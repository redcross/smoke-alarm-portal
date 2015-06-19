# Installing smoke-alarm-portal

These installation instructions assume a Debian GNU/Linux 'testing'
distribution operating system, but they should be portable without
much difficulty to most other Unix-like operating systems.

1. Get the code.

        $ git clone git@github.com:OpenTechStrategies/smoke-alarm-portal.git

2. Install [Node](https://nodejs.org/download/) and npm (a package manager).
   On Debian, run:

        $ sudo apt-get install nodejs
        $ sudo apt-get install npm

   On Max OSX, use the Macintosh installer which can be downloaded from https://nodejs.org/download/. This will install both node and npm.

3. Install [couchdb](http://couchdb.org/) from source.

   On Debian, you may need to install these dependencies first (before building couchdb).  There is more detailed information [here](https://cwiki.apache.org/confluence/display/COUCHDB/Debian).

        $ sudo apt-get install build-essential libtool autoconf automake autoconf-archive pkg-config
        # for Debian >-7.0
        $ sudo apt-get install lsb-release
        $ sudo apt-get install erlang
        $ sudo apt-get install erlang-base-hipe
        $ sudo apt-get install erlang-dev
        $ sudo apt-get install erlang-manpages
        $ sudo apt-get install erlang-eunit
        $ sudo apt-get install erlang-nox
        $ sudo apt-get install libicu-dev
        $ sudo apt-get install libcurl4-openssl-dev
        $ sudo apt-get install libmozjs185-dev

   On Mac OSX, use the Mac OSX installer which can be downloaded from http://couchdb.apache.org/#download. The installer should create the couchdb user automatically and start couchdb. You should now be able to skip directly to step 6 below and follow the remainder of the instructions to the end.

4. You'll need to set up a couchdb user:

        $ sudo useradd -d /var/lib/couchdb couchdb
        $ sudo mkdir -p /usr/local/{lib,etc}/couchdb /usr/local/var/{lib,log,run}/couchdb /var/lib/couchdb
        $ sudo chown -R couchdb:couchdb /usr/local/{lib,etc}/couchdb /usr/local/var/{lib,log,run}/couchdb
        $ sudo chmod -R g+rw /usr/local/{lib,etc}/couchdb /usr/local/var/{lib,log,run}/couchdb

5. Start couchdb

        # We shouldn't need to run this as root.  We'll update the install file
        # when we change this.
        $ sudo couchdb

6. Create database using wget or CURL to make a PUT request to the Couch server
        $ curl -X PUT http://127.0.0.1:5984/smoke_alarm_requests

7. Get the required node modules by running npm.

        $ cd smoke-alarm-portal
        $ npm install

   7a. If you get errors from `npm install`, starting with something like
   `sh: 1: node: not found`, you may need to install the legacy node
   package (see [the
   package](https://packages.debian.org/sid/nodejs-legacy)
   and [this StackOverflow
   answer](stackoverflow.com/questions/21168141/can-not-install-packages-using-node-package-manager-in-ubuntu)
   for more information about what's going on here):

        $ sudo apt-get install nodejs-legacy

8. Start smoke-alarm-portal app

        $ cd smoke-alarm-portal
        $ npm start
