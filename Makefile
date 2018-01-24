COMMIT_MESSAGE=$(shell echo git log -1 --pretty=%B | cat | tr -d "\'" )
REMOTE_REPO=git@github.com:ahebrank/test-upstream.git
BUILD_REPO=/tmp/upstream

install:
	composer build-assets

clone:
	git clone $(REMOTE_REPO) $(BUILD_REPO)

replay:
	rsync -av . $(BUILD_REPO)

push:
	cd $(BUILD_REPO) && git add . && git commit -m "BUILD: $(COMMIT_MESSAGE)" && git push origin master