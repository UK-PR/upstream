<?php
echo "Runnning config_install profile...\n";
passthru('drush site-install --verbose config_installer config_installer_sync_configure_form.sync_directory=sites/default/files/config --yes');
