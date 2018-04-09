COMMIT_MESSAGE=BUILD: $(shell git log -1 --pretty=%B | cat | tr -d "\'")
REMOTE_REPO=git@github.com:uk-d8/test-upstream.git
BUILD_REPO=/tmp/upstream

init:
	test -d /root/.ssh || mkdir /root/.ssh
	chmod 700 /root/.ssh
	cp .ci_ssh_config /root/.ssh/config
	chmod 600 /root/.ssh/config

install:
	composer build-assets

clone:
	git clone $(REMOTE_REPO) $(BUILD_REPO)
	git config --global user.email "geeks@insidenewcity.com"
	git config --global user.name "CI Bot"
	cd $(BUILD_REPO) && rm -rf *

replay:
	rm Makefile .gitlab-ci.yml .ci_ssh_config .braids.json
	rsync -rlDv --exclude .git --exclude install-config --exclude default-settings --exclude misc-content --exclude test . $(BUILD_REPO)
	rsync -rlDv install-config/ $(BUILD_REPO)/web/sites/default/config
	rsync -rdDv default-settings/ $(BUILD_REPO)/web/sites/default/
	rsync -rlDv misc-content/embed_buttons/ $(BUILD_REPO)/web/sites/default/files/embed_buttons
	mv $(BUILD_REPO) build

push:
	cd app && git add . && git commit -m "$(COMMIT_MESSAGE)" && git push origin master