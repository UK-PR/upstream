# name your site here
SITE_NAME=xxxx

# shouldn't need to change below
PANTHEON_HOST=dev-$(SITE_NAME).pantheonsite.io
DEV_HOST=localhost:9000

PROJECT_NAME=$(shell pwd | xargs basename | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]*//g' )
DB_SNAPSHOT=/tmp/db.sql

default:
	@echo "Need a target. Pick one of these:"
	@# list the available targets (this cheats a bit)
	@grep '^[a-z]' Makefile | sed 's/:.*$$//' | sort

cr:
	drush cr

kint:
	drush en -y kint

updatedb: create_db_backup get_db_backup push_docker_db cr

updatedb_docs: create_db_backup_docs get_db_backup_docs push_docker_db cr

ssh_config:
	test -d ~/.ssh || mkdir ~/.ssh
	chmod 700 ~/.ssh
	cp ci_ssh_config ~/.ssh/config
	gitlab-variable PIPELINES_PRIVATE_KEY > ~/.ssh/id_rsa
	chmod 600 ~/.ssh/config
	chmod 600 ~/.ssh/id_rsa

login:
	@( ( terminus auth:whoami 2>&1 >/dev/null | grep -q "not logged in" ) && terminus auth:login --machine-token=$(shell gitlab-variable PANTHEON_MACHINE_TOKEN) ) || true

create_db_backup: login
	terminus backup:create $(PANTHEON_SITE).dev --element=db

get_db_backup:
	curl $$(terminus backup:get $(PANTHEON_SITE).dev --element=db) | gunzip > $(DB_SNAPSHOT)

create_db_backup_docs: login
	terminus backup:create $(PANTHEON_SITE)-docs.live --element=db

get_db_backup_docs:
	curl $$(terminus backup:get $(PANTHEON_SITE)-docs.live --element=db) | gunzip > $(DB_SNAPSHOT)

push_docker_db:
	cat $(DB_SNAPSHOT) | mysql -h database -u root drupal

files: create_files_backup get_files_backup

files_docs: create_files_backup_docs get_files_backup_docs

create_files_backup: login
	terminus backup:create $(PANTHEON_SITE).dev --element=files

get_files_backup:
	test -d /app/web/sites/default/files || mkdir /app/web/sites/default/files && chmod 777 /app/web/sites/default/files
	curl $$(terminus backup:get $(PANTHEON_SITE).dev --element=files) | tar zx -C /app/web/sites/default/files --strip-components=1

create_files_backup_docs: login
	terminus backup:create $(PANTHEON_SITE)-docs.live --element=files

get_files_backup_docs:
	test -d /app/web/sites/default/files || mkdir /app/web/sites/default/files && chmod 777 /app/web/sites/default/files
	curl $$(terminus backup:get $(PANTHEON_SITE)-docs.live --element=files) | tar zx -C /app/web/sites/default/files --strip-components=1

cex_remote: login ssh_config
	terminus drush $(PANTHEON_SITE).dev cex -y