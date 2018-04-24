<?php

// change this to the final domain name to enable trusted host settings
$live_domain = null;

if (isset($_ENV['PANTHEON_ENVIRONMENT']) && php_sapi_name() != 'cli') {
  $primary_domain = $_SERVER['HTTP_HOST'];
  
  // Redirect to https://$primary_domain in the Live environment
  if ($live_domain && $_ENV['PANTHEON_ENVIRONMENT'] === 'live') {
    $primary_domain = $live_domain;
  }

  // domain mismatch? no https? redirect!
  if ($_SERVER['HTTP_HOST'] != $primary_domain
      || !isset($_SERVER['HTTP_USER_AGENT_HTTPS'])
      || $_SERVER['HTTP_USER_AGENT_HTTPS'] != 'ON' ) {

    # Name transaction "redirect" in New Relic for improved reporting (optional)
    if (extension_loaded('newrelic')) {
      newrelic_name_transaction("redirect");
    }

    header('HTTP/1.0 301 Moved Permanently');
    header('Location: https://'. $primary_domain . $_SERVER['REQUEST_URI']);
    exit();
  }
}

/**
 * Load services definition file.
 */
$settings['container_yamls'][] = __DIR__ . '/services.yml';

/**
 * Include the Pantheon-specific settings file.
 *
 * n.b. The settings.pantheon.php file makes some changes
 *      that affect all envrionments that this site
 *      exists in.  Always include this file, even in
 *      a local development environment, to insure that
 *      the site settings remain consistent.
 */
include __DIR__ . "/settings.pantheon.php";

/**
 * override config import path
 */
$is_installer_url = (strpos($_SERVER['SCRIPT_NAME'], '/core/install.php') === 0);
if ($is_installer_url) {
  $config_directories = array(
    CONFIG_SYNC_DIRECTORY => 'sites/default/config',
  );
}

/**
 * use configuration installer profile
 */
$settings['install_profile'] = 'config_installer'; 

/**
 * If there is a local settings file, then include it
 */
$local_settings = __DIR__ . "/settings.local.php";
if (file_exists($local_settings)) {
  include $local_settings;
}

// Drupal 8 Trusted Host Settings
if (isset($_ENV['PANTHEON_ENVIRONMENT']) && php_sapi_name() != 'cli') {
  if ($live_domain && $_ENV['PANTHEON_ENVIRONMENT'] === 'live') {
    $settings['trusted_host_patterns'] = array('^'. preg_quote($live_domain) .'$');
  }
}