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

replay:
	rm Makefile .gitlab-ci.yml .ci_ssh_config .braids.json
	rsync -rlD --delete --exclude .git --exclude install-config --exclude custom-modules --exclude settings.php . $(BUILD_REPO)
	rsync -rlD install-config/ $(BUILD_REPO)/web/sites/default/config
	rsync settings.php $(BUILD_REPO)/web/sites/default/
	rsync -rlD custom-modules/ $(BUILD_REPO)/web/modules/custom
	cd $(BUILD_REPO) && git add . && git commit -m "$(COMMIT_MESSAGE)" && git push origin master