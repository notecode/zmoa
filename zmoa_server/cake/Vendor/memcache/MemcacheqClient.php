<?php
define('MEMCACHEQ_HOST', '119.29.55.53');
define('MEMCACHEQ_PORT', 10032);

class MemcacheqClient {
	private static function get_memcache() {
		$memcache_obj = new Memcache();
		$memcache_obj->addServer( MEMCACHEQ_HOST,MEMCACHEQ_PORT );
		return $memcache_obj;
	}

	public static function get( $key ) {
		$memcache_obj = self::get_memcache();
		return $memcache_obj->get($key);
	}

	public static function set( $key, $value ) {
		$memcache_obj = self::get_memcache();
		$memcache_obj->set($key, $value);
	}
}
