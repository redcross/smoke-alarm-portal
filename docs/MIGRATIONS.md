# Database Migrations

Contains instructions for migrating a schema as a part of deployment
as well as a mapping of migrations to commits.


## Structural Migration

This app uses Sequelize [migrations](http://docs.sequelizejs.com/en/latest/docs/migrations/)
to handle structural migrations. Creating a migration file requires
that the `npm` packages `sequelize` and `sequelize-cli` be installed.
Once that has occurred, the new migration can be created with the
following command:

`sequelize migration:create`

This will create a file `migrations/<timestamp>-unnamed-migration.js

More options for the migration command are available by typing:

`sequelize help:migration:create`

Once the migration file is created, use the methods in the
documentation to make the desired schema changes.

## Procedure to migrate the rc_region DB schema and data update:

This update involved both schema structural changes as well as the 
contents of a couple of tables.

1. Truncate the SelectedCounties and UsAddress tables in Postgres
2. Run `sequelize db:migrate` after getting the latest from git
3. Run `node data/import_into_postgres.js` to import the seed data with the new regions
4. Run `npm start` to start the server.

## Mapping of migrations to code commits

Since Sequelizejs does not stop all other commands if there is a 
pending migration (unlike Rails), it is important to know when 
a change was introduced at a glance. Here is a rough table.

- Changed 'address_2' to 'rc_region' - This change was introduced
  with commit c338cd60 and continues until HEAD as of 8.19.2015

- Drywall admin changed - This added Drywall administration to 
  the app for Request reports. This was introduced with 46718d6e
  and was valid until 599079e7.



