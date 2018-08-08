Composer-based scaffolding for a UK D8 site. Designed as an upstream for Pantheon; includes docker-based local development. 

Note: this local dev strategy can slooowww on OSX docker. To try to improve the speed, [delegated](https://docs.docker.com/docker-for-mac/osxfs-caching/#delegated) shared volumes are used so consistency between host and container (particularly for core and vendor libraries) may not be perfect.

## Local dev quickstart

1. modify `docker/tty/Makefile` to set the name of the site.
2. run `docker-compose up`
3. browse to `http://localhost:9001` and run the Drupal installation: `drush si config_installer` (you can do this in the web GUI, but it's slower)
4. if you already have a remote dev site set up on Pantheon, browse to `http://localhost:9001` and run `make updatedb`. Otherwise, use `drush uli` to log in as an admin.
5. use `composer`, `drush`, and `drupal` within the web shell container to install or generate new components

