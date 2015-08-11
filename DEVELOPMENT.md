#Red Cross Smoke Alarm Portal Development

This file contains information on development ideas as well as HOWTOs
for specific tasks

## HOWTOs:

### HOWTO Add a filter to the requests admin (http://<host>/admin/requests)

1. In `views/admin/requests/index.jade`, add a filter to the list of filters
   in the Underscore template id `tmpl-filters`. Note; there are currently 6
   filter boxes on this page, so if more are to be added, it might be good 
   to have a UI person check those out.

2. In the `find()` function in `views/admin/requests/index.js`, the query that
	 returns the requests to the frontend is the [Sequelize](http://sequelize.readthedocs.org/en/latest/) [findAll()](http://sequelize.readthedocs.org/en/latest/docs/querying/#where)
	 function. This is located in the getResults() function expression.

	 Currently, certain query parameters are used for certain filters. 
	 * The `beginDate` and `endDate` params are used for date range filtering
	 
	 * The `search` param is used for an ILIKE query. 
	 
	 * The `offset` and `limit` params are used for limiting ranges
	 
	 * The `region` param is used to filter by region

	 Each of these maps to a [Sequelize operator](http://sequelize.readthedocs.org/en/latest/docs/querying/#operators) or clause.

	 * `beginDate` and `endDate` are used with the $between operator.

	 * `offset` and `limit` are optional parameters to the findAll query

	 

