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
	rm Makefile .gitlab-ci.yml .ci_ssh_config
	rsync -av --exclude .git . $(BUILD_REPO)
	cd $(BUILD_REPO) && git add . && git commit -m "$(COMMIT_MESSAGE)" && git push origin master