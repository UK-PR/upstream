COMMIT_MESSAGE=BUILD: $(shell git log -1 --pretty=%B | cat | tr -d "\'")
REMOTE_REPO=git@gitlab.com:newcity/uk-d8-upstream-artifact.git
BUILD_REPO=/tmp/upstream

init:
	test -d /root/.ssh || mkdir /root/.ssh
	chmod 700 /root/.ssh
	cp .ci_ssh_config /root/.ssh/config
	chmod 600 /root/.ssh/config
	git config --global user.email "geeks@insidenewcity.com"
	git config --global user.name "CI Bot"

install:
	# clean it out
	rm -rf vendor web/core web/libraries web/modules/contrib web/themes/contrib
	# install
	export COMPOSER_PROCESS_TIMEOUT=600
	composer build-assets

clone: init
	git clone $(REMOTE_REPO) $(BUILD_REPO)
	cd $(BUILD_REPO) && rm -rf *

replay:
	rm -f Makefile .gitlab-ci.yml .ci_ssh_config
	rsync -rlDv --exclude .git --exclude install-config --exclude default-settings --exclude misc-content --exclude test --exclude local-dev . $(BUILD_REPO)
	rsync -rlDv install-config/ $(BUILD_REPO)/web/sites/default/config
	rsync -rdDv default-settings/ $(BUILD_REPO)/web/sites/default/
	rsync -rlDv misc-content/embed_buttons/ $(BUILD_REPO)/web/sites/default/files/embed_buttons
	rsync -rlDv local-dev/ $(BUILD_REPO)/
	mv $(BUILD_REPO) build

push: init
	cd build && git add . && git commit -m "$(COMMIT_MESSAGE)" && git push origin master