<?php

# override config import path
$is_installer_url = (strpos($_SERVER['SCRIPT_NAME'], '/core/install.php') === 0);
if ($is_installer_url) {
  $config_directories = array(
    CONFIG_SYNC_DIRECTORY => 'sites/default/config',
  );
}