#!/usr/bin/php -q
<?php
if (!defined('DS')) {
	define('DS', DIRECTORY_SEPARATOR);
}
define('CAKE_CORE_INCLUDE_PATH', 'E:\WWW\cake' );

$dispatcher = CAKE_CORE_INCLUDE_PATH . DS . 'Cake' . DS . 'Console' . DS . 'ShellDispatcher.php';

if (!defined('CORE_PATH')) {
	define('CORE_PATH', CAKE_CORE_INCLUDE_PATH . DS);
}

if (function_exists('ini_set')) {
	$root = dirname(dirname(dirname(__FILE__)));
	$appDir = basename(dirname(dirname(__FILE__)));
	$install = $root . DS . 'lib';
	$composerInstall = $root . DS . $appDir . DS . 'Vendor' . DS . 'cakephp' . DS . 'cakephp' . DS . 'lib';

	// the following lines differ from its sibling
	// /lib/Cake/Console/Templates/skel/Console/cake.php
	if (file_exists($composerInstall . DS . $dispatcher)) {
		$install = $composerInstall;
	}

	ini_set('include_path', $install . PATH_SEPARATOR . ini_get('include_path'));
	unset($root, $appDir, $install, $composerInstall);
}

if (!include $dispatcher) {
	trigger_error('Could not locate CakePHP core files.', E_USER_ERROR);
}
unset($dispatcher);

return ShellDispatcher::run($argv);
