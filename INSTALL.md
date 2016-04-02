# Installing smoke-alarm-portal

These installation instructions assume a Debian GNU/Linux 'testing'
distribution operating system, but they should be portable without
much difficulty to most other Unix-like operating systems.

1. Download the code.

        $ git clone https://github.com/OpenTechStrategies/smoke-alarm-portal.git
        $ cd smoke-alarm-portal

2. Install [Node](https://nodejs.org/download/) and npm (a package manager).
   On Debian, run:

        $ sudo apt-get install nodejs
        $ sudo apt-get install npm

   On Max OSX, use the Macintosh installer which can be downloaded
   from https://nodejs.org/download/, to install both node and
   npm.  In Terminal, run:

        $ sudo npm install npm -g

3. Install PostgreSQL, at least version 9.2 (to support `JSON` column type).

   On Debian:

        $ sudo apt-get install postgresql-9.4  # for example

   (This may result in your having multiple versions of PostgreSQL
   installed, which in turn can lead to mysterious errors in the
   coming import step.  If you encounter such errors, see the
   appropriate part of the "Troubleshooting" section later on.)

   On Mac OS X:

   Install PostgreSQL via Brew (http://exponential.io/blog/2015/02/21/install-postgresql-on-mac-os-x-via-brew/)

        $ brew update
        $ brew install postgres

4. OPTIONAL: PostgreSQL probably created a `postgres` user, but if it
didn't, you might want to add one:

        $ adduser postgres

5. Set up the live config files.  Note that there are multiple files to
be edited here.

  1. Do `cp config.js.tmpl config.js` and edit the `config.js` file:

        * Update `exports.companyName`,
        `exports.projectName`, `exports.signupEnabled`,`exports.systemEmail`, and
        `exports.cryptoKey`.

  2. Do `cp config/config.json.tmpl config/config.json`, edit the `config/config.json`:

        * Fill in database usernames and passwords, and
        the Mailgun.com API key and sender information that the app will use to send out email notifications.  You can modify one of the existing top-level environments listed in `config.json` or set up a whole new environment, e.g., "demo" (e.g., based
        on the "test" example).

        (Don't worry if you don't know how to set up a database
        username / password; that will be explained in a later step.)

  3. Do `cp config/recipients.sql.tmpl config/recipients.sql`, edit the `config/recipients.sql` file:

        * Fill in appropriate contact names and email
        addresses.  
        * For dev, just leave the placeholders intact.

6. Get other required node modules.

        $ npm install

   6a. If you get errors from `npm install`, starting with something like
   `sh: 1: node: not found`, you may need to install the legacy node
   package (see [the
   package](https://packages.debian.org/sid/nodejs-legacy)
   and [this StackOverflow
   answer](stackoverflow.com/questions/21168141/can-not-install-packages-using-node-package-manager-in-ubuntu)
   for more information about what's going on here):

        $ sudo apt-get install nodejs-legacy

7. Create the databases and import the initial data.

        ### become a postgres user.  We use "postgres" here but it could
        ### also be your regular user, assuming that you have the
        ### correct privileges in psql.
        $ su - postgres
        $ psql
        postgres=# CREATE DATABASE smokealarm_development;
        postgres=# CREATE USER <some_username> PASSWORD '<some_password>';
        postgres=# GRANT ALL ON DATABASE smokealarm_development TO <username>;
        postgres=# \q
        ### if you were postgres, log out; you should be yourself now
        $ exit       

        ### This one needs to be available system-wide
        $ sudo npm install -g sequelize-cli 

        ### Choose whatever env you want from config/config.json
        $ NODE_ENV="development" 

        ### Before you run this command, update the config/config.json with the recently created database username and password.
        ### 
        ### This will spew a lot of information to the screen and may
        ### take several minutes.  It creates the tables and loads data
        ### into UsAddress and SelectedCounties.
        $ node data/import_into_postgres.js
        
        ### Load the active regions and recipients.  
        $ psql smokealarm_development
        ### Import the regions and recipients to the "activeRegions" table.
        smokealarm_development=# \i config/recipients.sql

        ### Run the migrations

        # use the most recent region codes in all places
        smokealarm_development=# \i migrations/20150916-update-regions.sql
        # add internal codes to regions
        smokealarm_development=# \i migrations/20150916-internal-regions.sql
        # add a "no region found" region
        smokealarm_development=# \i migrations/20151208-create-nonregion.sql
        
        # If you already have requests, update them.  Otherwise (e.g. if
        # you're setting up an empty database) you can skip these migrations.
        smokealarm_development=# \i migrations/20151208-add-nonregion-code.sql
        smokealarm_development=# \i migrations/20151217-set-new-status.sql

        ### exit psql
        smokealarm_development=# \q        

        ### FOR DEVELOPMENT, load sample requests:
        $ node data/fake_request_data.js 

8. Start the smoke-alarm-portal app

   For development, you can just do this:

        $ npm start

   For production, you might want to do this instead:

        $ npm install forever
   
    1. See "Appendix A" below about setting up Apache/ProxyPass->nodejs
    2. Install the forever module on the chosen server
    3. Run the forever server:

        $ ./node_modules/.bin/forever -da start --watchDirectory . -l forever.log -o out.log -e err.log ./bin/www

9. See if it's working, by visiting http://localhost:3000/

   TBD: Need instructions for changing to port 80 and eventually 443
   for demo and production.

10. Create an admin user.

   To create the admin user, you must first temporarily re-enable
   signups, which are disabled by default.

   1. In `config.js`, change `exports.signupEnabled` from `false` to `true`.  

   2. Visit http://localhost:3000/signup in your browser

   3. Create a user named `admin` there (remember the password you choose)

   4. In `config.js`, change `exports.signupEnabled` back to `false`.
      (If you don't do this step, anyone who can figure out the URL can
      create a user account with administrative privileges, which would
      obviously be bad.)

   5. Grant your new admin user permission to view requests from all
      regions, using this file:
      [migrations/20151208-admin-access.sql.tmpl](migrations/20151208-admin-access.sql.tmpl).
      Following the instructions in the file, copy it to
      `migrations/20151208-admin-access.sql` and replace the
      `__USER_ID__` with the id of your new admin user (if the admin
      user was the first user you created, then this will probably be
      `1`).  Once you've done that, run the following commands:

      ```
      $ psql smokealarm_development  
      smokealarm_development=# \i migrations/20151208-admin-access.sql
      ```

   Now you can visit http://localhost:3000/login/ at any time, log in
   as `admin`, and from there click on "Smoke Alarm Installation Requests"
   to get to http://localhost:3000/admin/requests/, which is the
   primary admin area for this application -- it's where you can list
   installation requests, run reports, etc.

   (Of course, you'd have to enter some test requests from the front
   page (http://localhost:3000/) before any requests would be listed
   on the /admin/requests page.)

11. Manually perform tests listed in [TESTING.md](docs/TESTING.md).

Appendix A: Setting up Apache->Node ProxyPass with https://
-----------------------------------------------------------

A standard way to set up this service is with Apache HTTPD as the
front-end server, with http:// redirecting to https://, and with all
requests sent via a ProxyPass directive to the node server running on
some random local port (e.g., 3000) protected from non-localhost
access by iptables rules.  Below we describe this setup in detail.

1. Edit `/etc/apache2/sites-available/default-ssl.conf` to serve port
   3000 over https:// by default without showing ":3000" to browsers:

        <IfModule mod_ssl.c>
            NameVirtualHost *:80
            <VirtualHost *:80>
                   ServerName your_host.example.com
                   Redirect permanent / https://your_host.example.com/
            </VirtualHost>
            <VirtualHost _default_:443>
                    ServerAdmin webmaster@example.com
                    ProxyPreserveHost On
                    ProxyPass / http://127.0.0.1:3000/
                    ProxyPassReverse / http://127.0.0.1:3000/
                    ServerName localhost
                    # Available loglevels: trace8...trace1, debug, info, notice,
                    # warn, error, crit, alert, emerg.  It is also possible to
                    # configure the loglevel for particular modules, e.g.:
                    #LogLevel info ssl:warn
                    ErrorLog ${APACHE_LOG_DIR}/error.log
                    CustomLog ${APACHE_LOG_DIR}/access.log combined
                    # Enable SSL
                    SSLEngine on
                    SSLCertificateFile    /etc/ssl/certs/YOUR_HOST_OR_DOMAIN.crt
                    SSLCertificateKeyFile /etc/ssl/private/YOUR_HOST_OR_DOMAIN.key
                    SSLCertificateChainFile /etc/ssl/certs/YOUR_CERT_PROVIDER.crt
                    # SSL Engine Options (documented elsewhere)
                    #SSLOptions +FakeBasicAuth +ExportCertData +StrictRequire
                    <FilesMatch "\.(cgi|shtml|phtml|php)$">
                                        SSLOptions +StdEnvVars
                    </FilesMatch>
                    <Directory /usr/lib/cgi-bin>
                                    SSLOptions +StdEnvVars
                    </Directory>
                    # Notice: Most problems of broken clients are also related to the HTTP
                    # keep-alive facility, so you usually additionally want to disable
                    # keep-alive for those clients, too. Use variable "nokeepalive" for this.
                    # Similarly, one has to force some clients to use HTTP/1.0 to workaround
                    # their broken HTTP/1.1 implementation. Use variables "downgrade-1.0" and
                    # "force-response-1.0" for this.
                    BrowserMatch "MSIE [2-6]" \
                                    nokeepalive ssl-unclean-shutdown \
                                    downgrade-1.0 force-response-1.0
                    # MSIE 7 and newer should be able to use keepalive
                    BrowserMatch "MSIE [17-9]" ssl-unclean-shutdown
            </VirtualHost>
        </IfModule>

2. Enable mod\_rewrite, mod\_proxy, and mod\_proxy\_http

        $ sudo apt-get update
        $ sudo apt-get install libapache2-mod-proxy-html
        $ sudo a2enmod rewrite proxy  
        $ sudo a2enmod proxy_http
        $ sudo a2enmod ssl

3. Make sure the right config file is installed.

        $ cd /etc/apache2/sites-enabled
        $ ls -l
        total 0
        lrwxrwxrwx 1 root root 35 Jun  4 22:58 000-default.conf \
        -> ../sites-available/000-default.conf
        $ sudo rm 000-default.conf
        $ sudo ln -s ../sites-available/default-ssl.conf 000-default-ssl.conf

4. _TBD: Do something magical with iptables to block port 3000_

5. Restart Apache:

        $ service apache2 restart  

6. Visit the site and make sure it's working:

   http://yourhost.example.com/ should auto-redirect to
   https://yourhost.example.com/ and show the front page.

Appendix B: Troubleshooting
---------------------------

* Problems importing the initial static data.

  If you get an error like

        Unhandled rejection SequelizeDatabaseError: type "json" does not exist

  when you run the `data/import_into_postgres.js` script, the problem
  is most likely that you are connecting to an old version of
  PostgreSQL that doesn't support JSON columns -- this can happen
  even when a newer version of PostgreSQL that *does* support JSON is
  also installed on your system.  Here's how you can ask what `psql`
  connects to

        $ psql
        postgres=# \pset pager off
        postgres=# SELECT version()
        PostgreSQL 9.1.13 on x86_64-unknown-linux-gnu, ...etc...
        postgres=#

  Oops!  You need at least PostgreSQL 9.2 for JSON support.  On
  Debian, you can use this to check whether a version of PostgreSQL
  is installed:

        $ dpkg -l postgresql-9.1
        $ dpkg -l postgresql-9.4

   etc, etc.  If you don't need the older versions. just remove them,
   e.g.:

        $ apt-get purge postgresql-9.1

   Note you may have to purge everything, including the newest
   version, and then reinstall the newest version; at least, the
   theoretical minimal set of purges doesn't always seem to do the
   trick.  Obviously, don't purge a version if it is managing data.
   If you need to keep older versions, then you'll need to find some
   other way to make sure that `psql` and this application connect to
   a new enough version of PostgreSQL to support the JSON type.
