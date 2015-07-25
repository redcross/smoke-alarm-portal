# Installing smoke-alarm-portal

These installation instructions assume a Debian GNU/Linux 'testing'
distribution operating system, but they should be portable without
much difficulty to most other Unix-like operating systems.

1. Get the code.

        $ git clone git@github.com:OpenTechStrategies/smoke-alarm-portal.git
        $ cd smoke-alarm-portal

2. Install [Node](https://nodejs.org/download/) and npm (a package manager).
   On Debian, run:

        $ sudo apt-get install nodejs
        $ sudo apt-get install npm

   On Max OSX, use the Macintosh installer which can be downloaded from https://nodejs.org/download/. This will install both node and npm.

3. Install Postgres

        $ sudo apt-get install postgresql

4. You'll need to set up a postgres user, if you don't already have one:

        $ adduser postgres

5. Set up the live config files.

  * Do `cp config.json.tmpl config.json`, then edit the latter.

        You'll probably want to update `exports.companyName`,
        `exports.projectName`, `exports.systemEmail`, and
        `exports.cryptoKey`.

  * Do `cp config/config.json.tmpl config/config.json`, then edit the latter.

        You'll need to fill in database usernames and passwords, of
        course.  You might also want to set up a whole new
        environment, e.g., "demo" (e.g., based on the "test" example).

6. Create the databases and import the initial data.

        $ su - postgres
        $ psql
        postgres=# CREATE DATABASE smokealarm_development;
        postgres=# CREATE USER <some_username> PASSWORD '<some_password>';
        postgres=# GRANT ALL ON DATABASE smokealarm_development TO <username>;
        postgres=# \q
        $ exit       ### log out of postgres user; you should be yourself now

        $ npm install sequelize

        ### This one needs to be available system-wide
        $ sudo npm install -g sequelize-cli 

        $ npm install pg-hstore
        $ npm install pg

        ### Choose whatever env you want from config/config.json
        $ NODE_ENV="development" 

        ### This will spew a lot of information to the screen and may
        ### take several minutes
        $ node data/import_into_postgres.js

7. Get other required node modules.

        $ npm install

   7a. If you get errors from `npm install`, starting with something like
   `sh: 1: node: not found`, you may need to install the legacy node
   package (see [the
   package](https://packages.debian.org/sid/nodejs-legacy)
   and [this StackOverflow
   answer](stackoverflow.com/questions/21168141/can-not-install-packages-using-node-package-manager-in-ubuntu)
   for more information about what's going on here):

        $ sudo apt-get install nodejs-legacy

8. Start the smoke-alarm-portal app

   For development, you can just do this:

        $ npm start

   For demo or production, you might want to do this instead:

        $ npm install forever
   
    1. See "Appendix A" below about setting up Apache/ProxyPass->nodejs
    2. Install the forever module on the chosen server
    3. Run the forever server:

        $ ./node_modules/.bin/forever -da start --watchDirectory . -l forever.log -o out.log -e err.log ./bin/www

9. See if it's working, by visiting http://localhost:3000/

   TBD: Need instructions for changing to port 80 and eventually 443
   for demo and production.

10. Initialize admin user, test admin area (TBD: this process will change)

   Visit http://localhost:3000/login

   Click "Sign Up" and create a user named "admin", with any password you want.
   
   At http://localhost:3000/admin/requests you can see smoke alarm
   installation requests.  You will have to enter some test requests
   on the front page (http://localhost:3000/) before any requests will
   be listed on the /admin/requests page.

   [This
   ticket](https://github.com/OpenTechStrategies/smoke-alarm-portal/issues/44)
   (and any sub-tickets it links to) describes improvements planned
   for the admin area.

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
        $ ln -s ../sites-available/default-ssl.conf 000-default-ssl.conf

4. _TBD: Do something magical with iptables to block port 3000_

5. Restart Apache:

        $ service apache2 restart  

6. Visit the site and make sure it's working:

   http://yourhost.example.com/ should auto-redirect to
   https://yourhost.example.com/ and show the front page.
