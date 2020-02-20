dev:
	docker-compose up

setup:
	cp -i config.js.tmpl config.js
	cp -i config/config.json.tmpl config/config.json
	cp -i config/recipients.sql.tmpl config/recipients.sql

	docker volume create smokealarm_nodemodules
	docker volume create smokealarm_postgres
	docker-compose -f docker-compose.builder.yml run --rm npm_install

migrate:
	docker-compose -f docker-compose.builder.yml run --rm migrate

clean:
	-rm -f config.js
	-rm -f config/config.json
	-rm -f config/recipients.sql
	-rm -rf node_modules

	docker-compose rm -f
	docker volume rm smokealarm_nodemodules
	docker volume rm smokealarm_postgres
