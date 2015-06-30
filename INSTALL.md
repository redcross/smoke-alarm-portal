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

3. Install Postgres

        $ sudo apt-get install postgresql 


4. You'll need to set up a postgres user, if you don't already have one:

        $ adduser postgres

5. Add a "staging" environment to `config/config.json`, following the
"test" example.

6. Create the databases and initialize the data.

        $ su - postgres
        $ psql
        postgres=# CREATE DATABASE smokealarm_development;
        postgres=# CREATE USER <username> PASSWORD '<change_this>';
        postgres=# GRANT ALL ON DATABASE smokealarm_development TO <username>;

           
        $ npm install --save sequelize
        $ sudo npm install -g sequelize-cli #this needs to be available system-wide

        $ npm install pg-hstore
        $ npm install --save pg
        
        # do these if you are installing on a remote server
        $ NODE_ENV="staging" # or whatever you have in config.json

        # this will spew a lot of information to the screen
        $ node data/import_into_postgres.js
        
        $ forever -da start --watchDirectory . -l forever.log -o out.log -e err.log ./bin/www
        
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

        $ npm start

9. Step for staging or production server deployment

    1. Install the forever module on the chosen server
    2. Run the forever server:

        $  forever -da start --watchDirectory . -l forever.log -o out.log -e err.log ./bin/www