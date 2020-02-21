dev:
	docker-compose up

test:
	docker-compose -f docker-compose.testing.yml run --rm test

setup:
	-cp -i .env.tmpl .env
	-cp -i config/recipients.sql.tmpl config/recipients.sql

	docker volume create smokealarm_nodemodules
	docker volume create smokealarm_postgres
	docker-compose -f docker-compose.builder.yml run --rm npm_install

migrate:
	docker-compose -f docker-compose.builder.yml run --rm migrate

clean:
	rm -f config/recipients.sql
	rm -rf node_modules

	docker-compose rm -f
	docker volume rm -f smokealarm_nodemodules
	docker volume rm -f smokealarm_postgres
