<?php
/**
 *
 *
 * CakePHP(tm) : Rapid Development Framework (http://cakephp.org)
 * Copyright (c) Cake Software Foundation, Inc. (http://cakefoundation.org)
 *
 * Licensed under The MIT License
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright	 Copyright (c) Cake Software Foundation, Inc. (http://cakefoundation.org)
 * @link		  http://cakephp.org CakePHP(tm) Project
 * @package	   app.Config
 * @since		 CakePHP(tm) v 0.2.9
 * @license	   http://www.opensource.org/licenses/mit-license.php MIT License
 */

/**
 * Database configuration class.
 *
 * You can specify multiple configurations for production, development and testing.
 *
 * datasource => The name of a supported datasource; valid options are as follows:
 *  Database/Mysql - MySQL 4 & 5,
 *  Database/Sqlite - SQLite (PHP5 only),
 *  Database/Postgres - PostgreSQL 7 and higher,
 *  Database/Sqlserver - Microsoft SQL Server 2005 and higher
 *
 * You can add custom database datasources (or override existing datasources) by adding the
 * appropriate file to app/Model/Datasource/Database. Datasources should be named 'MyDatasource.php',
 *
 *
 * persistent => true / false
 * Determines whether or not the database should use a persistent connection
 *
 * host =>
 * the host you connect to the database. To add a socket or port number, use 'port' => #
 *
 * prefix =>
 * Uses the given prefix for all the tables in this database. This setting can be overridden
 * on a per-table basis with the Model::$tablePrefix property.
 *
 * schema =>
 * For Postgres/Sqlserver specifies which schema you would like to use the tables in.
 * Postgres defaults to 'public'. For Sqlserver, it defaults to empty and use
 * the connected user's default schema (typically 'dbo').
 *
 * encoding =>
 * For MySQL, Postgres specifies the character encoding to use when connecting to the
 * database. Uses database default not specified.
 *
 * sslmode =>
 * For Postgres specifies whether to 'disable', 'allow', 'prefer', or 'require' SSL for the 
 * connection. The default value is 'allow'.
 *
 * unix_socket =>
 * For MySQL to connect via socket specify the `unix_socket` parameter instead of `host` and `port`
 *
 * settings =>
 * Array of key/value pairs, on connection it executes SET statements for each pair
 * For MySQL : http://dev.mysql.com/doc/refman/5.6/en/set-statement.html
 * For Postgres : http://www.postgresql.org/docs/9.2/static/sql-set.html
 * For Sql Server : http://msdn.microsoft.com/en-us/library/ms190356.aspx
 *
 * flags =>
 * A key/value array of driver specific connection options.
 */
define('ZMOA_DB_HOST', '123.207.37.183');
define('ZMOA_DB_DB_USER', 'root');
define('ZMOA_DB_DB_PWD', 'Zzl131421');
define('ZMOA_DB_DB_NAME', '');
define('ZMOA_DB_DB_NAME', 'zmoa');
define('ZMOA_DB_DB_PORT', 3306);

class DATABASE_CONFIG {
	//系统库
	public $default = array( 
		'datasource' => 'Database/Mysql',
		'persistent' => false,
		'host' => ZMOA_DB_HOST,
		'login' => ZMOA_DB_DB_USER,
		'password' => ZMOA_DB_DB_PWD,
		'database' => ZMOA_DB_DB_NAME,
		'serverid' => 1,
		'port' => ZMOA_DB_DB_PORT,
		'prefix' => DB_PREFIX,
		'encoding' => 'utf8',
	);

	function __isset($property) {
		if(strstr($property, 'company_db')) {
			return true;
		}
		return false;
	}

	// function __get($property) {
	// 	if( strstr($property, 'company_db') ) {
	// 		return $this->get_company_db_info();
	// 	}
	// }
	// //动态获取分库
	// private function get_company_db_info() {
	// 	$company_id = $GLOBALS['company']['id'];
	// 	// if( empty($_SESSION) ) {
	// 	// 	header(BASE_PATH . 'admin/login');
	// 	// }
	// 	//$user = g('User', 'Model')->findbyId($_SESSION['user']['id'], array('id', 'company_id') );
	// 	$db_config = g('DbConfig', 'Model/System')->findFirst( array('config_name' => $company_id), array('host', 'port', 'login', 'database', 'password') );
	// 	$db_connnect = array(
	// 		'datasource' => 'Database/Mysql',
	// 		'persistent' => false,
	// 		'host' => $db_config['host'],
	// 		'port' => $db_config['port'],
	// 		'login' => $db_config['login'],
	// 		'password' => $db_config['password'],
	// 		'database' => $db_config['database'],
	// 		'prefix' => '',
	// 		'encoding' => 'utf8'
	// 	);
	// 	return $db_connnect;
	// }
}
