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

3. Get the required node modules by running npm.

        $ cd smoke-alarm-portal
        $ npm install

4. Start smoke-alarm-portal app

        $ cd smoke-alarm-portal
        $ npm start


