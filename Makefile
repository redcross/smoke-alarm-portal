run:
	docker-compose up --remove-orphans

test:
	docker-compose -f docker-compose.testing.yml run --rm test

build:
# Don't overwrite existing config
	cp -n config/recipients.sql.tmpl config/recipients.sql || true
	cp -n config.js.tmpl config.js || true
	cp -n config/config.json.tmpl config/config.json && {\
		sed -ie 's/__YOUR_DEV_DB_USERNAME_HERE__/postgres/' config/config.json; \
		sed -ie 's/__YOUR_DEV_DB_PASSWORD_HERE__/password/' config/config.json; \
		sed -ie 's/127.0.0.1/db/' config/config.json; \
	} || true


# create volumes for docker to persist data
	docker volume create smokealarm_nodemodules
	docker volume create smokealarm_postgres

# install dependencies using this project's node version
	docker-compose -f docker-compose.builder.yml run --rm npm_install

migrate:
	docker-compose -f docker-compose.builder.yml run --rm migrate

setup: build migrate

clean:
	rm -rf node_modules

	docker-compose kill
	docker-compose rm -f
	docker volume rm -f smokealarm_nodemodules
	docker volume rm -f smokealarm_postgres
