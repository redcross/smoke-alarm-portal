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

3. Install [couchdb](http://couchdb.org/) from source.  On Debian, you may need to install these dependencies first (before building couchdb).  There is more detailed information [here](https://cwiki.apache.org/confluence/display/COUCHDB/Debian).

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

5. You'll need to set up a couchdb user:
   
        $ sudo useradd -d /var/lib/couchdb couchdb
        $ sudo mkdir -p /usr/local/{lib,etc}/couchdb /usr/local/var/{lib,log,run}/couchdb /var/lib/couchdb
        $ sudo chown -R couchdb:couchdb /usr/local/{lib,etc}/couchdb /usr/local/var/{lib,log,run}/couchdb
        $ sudo chmod -R g+rw /usr/local/{lib,etc}/couchdb /usr/local/var/{lib,log,run}/couchdb

6. Start couchdb
         
        # We shouldn't need to run this as root.  We'll update the install file
        # when we change this.
        $ sudo couchdb

7. Create database using [Futon](https://wiki.apache.org/couchdb/Getting_started_with_Futon
). Navigate to http://localhost:5984/\_utils/ on the local server. Click on the "Create Database" link at the upper left of the screen. Enter "smoke\_alarm\_requests" for the database name

8. Get the required node modules by running npm.

        $ cd smoke-alarm-portal
        $ npm install

   8a. If you get errors from `npm install`, starting with something like
   `sh: 1: node: not found`, you may need to install the legacy node
   package (see [the
   package](https://packages.debian.org/sid/nodejs-legacy)
   and [this StackOverflow
   answer](stackoverflow.com/questions/21168141/can-not-install-packages-using-node-package-manager-in-ubuntu)
   for more information about what's going on here):

        $ sudo apt-get install nodejs-legacy

9. Start smoke-alarm-portal app

        $ cd smoke-alarm-portal
        $ npm start
