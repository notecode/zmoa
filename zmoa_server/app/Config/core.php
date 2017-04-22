<?php
Configure::write('App.encoding', 'UTF-8');
Configure::write('Config.language','en-gb');
//Session设置
Configure::write('Session', array( 'defaults' => 'php'));
Configure::write('Security.salt', 'DYhG93b0qyJfIxfs2guVoUubWwvniR2G0FgaC9mi1');
Configure::write('Security.cipherSeed', '768593096574535424967496836452');
Configure::write('Config.timezone', 'Asia/Shanghai');
Configure::write('debug', 1);

$prefix = 'myapp_';

/*********************缓存设置 start*******************************************/
$duration = '+999 days';
if (Configure::read('debug') > 0) {
	$duration = '+10 seconds';
}
Cache::config('default', array('engine' => 'File'));

Cache::config('_cake_core_', array(
	'engine' => 'File',
	'prefix' => $prefix . 'cake_core_',
	'path' => CACHE . 'persistent' . DS,
	'serialize' => 1,
	'duration' => $duration
));

Cache::config('_cake_model_', array(
	'engine' => 'File',
	'prefix' => $prefix . 'cake_model_',
	'path' => CACHE . 'models' . DS,
	'serialize' => 1,
	'duration' => $duration
));
Cache::config('manufacturer', array(
	'engine' => 'File',
	'prefix' => $prefix . 'jin_manufacturer_',
	'path' => CACHE,
	'serialize' => 1,
	'duration' => $duration
));

/********************缓存设置 end*********************************************/

/********************错误或异常设置 start*********************************************/
Configure::write('Error', array(
	'handler' => 'ErrorHandler::handleError',
	'level' => E_ALL & ~E_DEPRECATED,
	'trace' => true
));

Configure::write('Exception', array(
	'handler' => 'ErrorHandler::handleException',
	'renderer' => 'ExceptionRenderer',
	'log' => false
));
/********************错误或异常设置 end*********************************************/
define( 'ISDEV', true);
define('DIR_IMAGE', WWW_ROOT . 'files/');
if( ISDEV ) {
	define('BASE_PATH','http://zmoa.com/');
	define('UPLOAD_FILE_PATH', BASE_PATH . 'files/');
	define('DOMAIN', 'zmoa.com');
} else {
	define('BASE_PATH','http://zmoa.com/');
	define('UPLOAD_FILE_PATH', BASE_PATH . 'files/');
	define('DOMAIN', 'bxland.com');
}

