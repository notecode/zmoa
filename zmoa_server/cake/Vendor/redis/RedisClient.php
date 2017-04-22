<?php
if( true ) {
	define('REDIS_HOST', '119.29.53.141');
	define('REDIS_PORT', 6379);
} else {
	define('REDIS_HOST', 'localhost');
	define('REDIS_PORT', 6379);
}
class RedisClient {
	private static function get_redis($serializer = false) {
		$redis = new Redis();
		//$redis->pconnect(REDIS_HOST, REDIS_PORT, 5);
		$redis->connect(REDIS_HOST, REDIS_PORT);
		//$redis->auth('rTaCwjzc'); 
		if($serializer) {
			$redis->setOption(Redis::OPT_SERIALIZER, Redis::SERIALIZER_PHP); 
		}
		return $redis;
	}

	/**
	 * <p>设置单个key缓存</p>
	 *
	 */
	public static function set($key, $value, $expire = '+30 days', $serializer = true) {
		$redis = self::get_redis($serializer);
		
		if(-1 == $expire) {
			$ret = $redis->set($key, $value);
		}else{
			$expire = strtotime($expire) - time();
			$ret = $redis->setex($key, $expire, $value);
		}
		$redis->close();
		return $ret;
	}

	/**
	 * <p>设置key的过期时间</p>
	 * 
	 */
	public static function expire($key, $expire) {
		$redis = self::get_redis();
		$expire = strtotime($expire) - time();
		return $redis->expire($key, $expire);
	}
     
    /*
	 * <p>将key的值设为value，当且仅当key不存在时候</p>
	 * <p>若key已存在，则setnx不做任何动作</p>
	 *
	 */
	public static function setnx($key, $value, $expire = '+30 days', $serializer = true) {
		$redis = self::get_redis($serializer);

		$ret = $redis->setnx($key, $value);
		if(!empty($expire) && -1 != $expire) {
			$redis->expire($key, $expire);
		}
		return $ret;
	}

	/**
	 * <p>设置多个key value</p>
	 * @param mset array
	 *
	 */
	public static function mset($mset = array(), $expire = '+30 days',$serializer = true) {
		$redis = self::get_redis($serializer);
		$ret = $redis->mset($mset);
		if(!empty($expire) && -1 != $expire) {
			foreach ($mset as $key => $value) {
				$redis->expire($key, $expire);
			}
		}
		return $ret;
	}

	/**
	 * <p>获得单个key缓存<p>
	 * 
	 * @param  key string
	 * @return 如果key不存在返回null
	 */
	public static function get($key, $serializer = true) {
		$redis = self::get_redis($serializer);
		$data = $redis->get($key);
		$redis->close();
		return $data;
	}

	/**
	 * <p>获得多个key缓存,不存在的key返回null<p>
	 * 
	 * @param  key array
	 * @return array
	 *
	 */
	public static function mget($keys, $serializer = true) {
		$redis = self::get_redis($serializer);
		return $redis->mget($keys);
	}

	/**
	 * <p>如果是整数类型进行自增</p>
	 * <p>key不存在会在增长之前设置为0</p>
	 */
	public static function incr($key, $incr_range = 1) {
		$redis = self::get_redis();
		$data = $redis->incr($key,$incr_range);
		$redis->close();
		return $data;
	}

	/**
	 * <p>判断单个key是否存在</p>
	 *
	 * @return boolean
	 */
	public static function exists($key) {
		$redis = self::get_redis();
		return $redis->exists($key);
	}

	/**
	 * <p>返回给定key的剩余时间（以秒作为单位）</p>
     * <p>-1表示没有过期时间</p>
	 *
	 */
	public static function ttl($key) {
		$redis = self::get_redis();
		return $redis->ttl($key);
	}

	/**
	 * <p>删除指定key</p>
	 *
	 * @param  key mixed 可以为字符串或数组
	 * @return boolean
	 *
	 */
	public static function del($key) {
		$redis = self::get_redis();
		return $redis->del($key);
	}

	/**
	 * <p>将value插入到key的列表头</p>
	 * <p>如果key不存在，则创建key</p>
	 * <p>当key的存在不是列表类型时，返回null</p>
	 *
	 * @return list size
	 */
	public static function lpush($key, $value) {
		$redis = self::get_redis();
		return $redis->lpush($key, $value);
	}

	/**
	 * <p>将value插入到key的列表头</p>
	 * <p>如果key不存在，则不做任何操作</p>
	 * <p>当key的存在不是列表类型时，返回null</p>
	 *
	 * @return list size
	 */
	public static function lpushx($key, $value) {
		$redis = self::get_redis();
		return $redis->lpushx($key, $value);
	}

	/**
	 * <p>将value插入到key的列表尾</p>
	 * <p>如果key不存在，则创建key</p>
	 * <p>当key的存在不是列表类型时，返回null</p>
	 *
	 * @return list size
	 */
	public static function rpush($key, $value) {
		$redis = self::get_redis();
		return $redis->rpush($key, $value);
	}

	/**
	 * <p>将value插入到key的列表尾</p>
	 * <p>如果key不存在，则不做任何操作</p>
	 * <p>当key的存在不是列表类型时，返回null</p>
	 *
	 * @return list size
	 */
	public static function rpushx($key, $value) {
		$redis = self::get_redis();
		return $redis->rpushx($key, $value);
	}

	/**
	 * <p>从列表头返回key的元素，并将该元素从list中移除</p>
	 * <p>如果key不存在返回null</p>
	 */
	public static function lpop($key) {
		$redis = self::get_redis();
		return $redis->lpop($key);
	}

	/**
	 * <p>从列表尾返回key的元素，并将该元素从list中移除</p>
	 * <p>如果key不存在返回null</p>
	 */
	public static function rpop($key) {
		$redis = self::get_redis();
		return $redis->rpop($key);
	}

	/**
	 * <p>返回list长度</p>
	 * <p>不存在key，return 0</p>
	 *
	 */
	public static function llen($key) {
		$redis = self::get_redis();
		return $redis->llen($key);
	}

	/**
	 * <p>返回list对应的value</p>
	 *
	 */
	public static function lvalue($key) {
		return self::lrange($key, 0, -1);
	}

	/**
	 * <p>返回list对应索引范围的数组</p>
	 *
	 * @param start 下标从0开始，-1表示最后一个元素，-2倒数第二个元素，以此类推...
	 * @param end 结束下标，-1表示最后一个元素，-2倒数第二个元素，以此类推...
	 * @return array
	 *
	 */
	public static function lrange($key, $start, $end) {
		$redis = self::get_redis();
		return $redis->lrange($key, $start, $end);
	}

	/**
	 * <p>返回list中指定index的value</p>
	 *
	 * @param index从0开始，-1表示最后一个元素，-2倒数第二个元素，以此类推...
	 * 
	 */
	public static function lindex($key, $index) {
		$redis = self::get_redis();
		return $redis->lindex($key, $index);
	}

	/**
	 * <p>修改list中指定index的value</p>
	 *
	 * @param index从0开始，-1表示最后一个元素，-2倒数第二个元素，以此类推...
	 */
	public static function lset($key, $index, $value) {
		$redis = self::get_redis();
		return $redis->lset($key, $index, $value);
	}

	/**
	 * <p>将value添加到集合中</p>
	 * <p>当key的存在不是集合类型时，返回null</p>
	 *
	 * @return boolean  如果这个值已经在这个key中，返回false
	 *
	 */
	public static function sadd($key, $value) {
		$redis = self::get_redis();
		return $redis->sadd($key, $value);
	}

	/**
	 * <p>集合中是否存在指定元素</p>
	 *
	 * @return boolean
	 */
	public static function scontains($key, $value) {
		$redis = self::get_redis();
		return $redis->scontains($key, $value);
	}

	/**
	 * <p>删除集合中指定元素</p>
	 *
	 * @return boolean
	 */
	public static function sremove($key, $value) {
		$redis = self::get_redis();
		return $redis->sremove($key, $value);
	}

	/**
	 * <p>返回集合size</p>
	 *
	 * @return array
	 *
	 */
	public static function ssize($key) {
		$redis = self::get_redis();
		return $redis->ssize($key);
	} 

	/**
	 * <p>返回集合所有元素</p>
	 *
	 * @return array
	 *
	 */
	public static function smembers($key) {
		$redis = self::get_redis();
		return $redis->smembers($key);
	}

	/**
	 * <p>将哈希表key中域field的值设为value</p>
	 * <p>如果key不存在，新的哈希表被创建</p>
	 * <p>如果field已经存在于hash表中，旧值将被覆盖</p>
	 * <p>如果keywield一个已经存在的不为hash类型，将返回null</p>
	 *
	 * @return boolean 如果field是哈希表中的一个新建域，并且值设置成功，返回1。如果哈希表中域field已经存在且旧值已被新值覆盖，返回0。
	 *
	 */
	public static function hset($key, $field, $value) {
		$redis = self::get_redis();
		return $redis->hset($key, $field, $value);
	}

	/**
	 * <p>当且仅当域field不存在,将哈希表key中的域field的值设置为value</p>
	 * <p>若域field已经存在，该操作无效。如果key不存在，一个新哈希表被创建并执行</p>
	 */
	public static function hsetnx($key, $field, $value) {
		$redis = self::get_redis();
		return $redis->hsetnx($key, $field, $value);
	}

	/**
	 * <p>获得指定key中的field值</p>
	 */
	public static function hget($key, $field) {
		$redis = self::get_redis();
		return $redis->hget($key, $field);
	}

	/**
	 * <p>key对应的哈希表同时设置多个field</p>
	 *
	 * @param fields多个field的数组
	 * @return boolean
	 *
	 */
	public static function hmset($key, $fields = array()) {
		$redis = self::get_redis();
		return $redis->hmset($key, $fields);
	}

	/**
	 * <p>返回指定key的hash数组</p>
	 *
	 * @return array
	 *
	 */
	public static function hgetall($key) {
		$redis = self::get_redis();
		return $redis->hgetall($key);
	}

	/**
	 * <p>删除哈希表中的field</p>
	 *
	 */
	public static function hdel($key, $field) {
		$redis = self::get_redis();
		return $redis->hdel($key, $field);
	}

	/**
	 * <p>返回hash表中field的数量</p>
	 *
	 * @return int
	 * 
	 */
	public static function hlen($key) {
		$redis = self::get_redis();
		return $redis->hlen($key);
	}
 	
 	/**
	 * <p>hash表中field是否存在</p>
	 *
	 * @return boolean
	 * 
	 */
	public static function hexists($key, $field) {
		$redis = self::get_redis();
		return $redis->hexists($key, $field);
	}

	/**
	 * <p>返回hash表中所有field</p>
	 *
	 * @return array
	 * 
	 */
	public static function hkeys($key) {
		$redis = self::get_redis();
		return $redis->hkeys($key);
	}

	/**
	 * <p>返回hash表中所有value</p>
	 *
	 * @return array
	 * 
	 */
	public static function hvals($key) {
		$redis = self::get_redis();
		return $redis->hvals($key);
	}

	/**
	 * <p>判断key的类型</p>
	 *
	 * @return string
	 *
	 */
	public static function type($key) {
		$redis = self::get_redis();

		$type = 'none';

		$ret = $redis->type($key);
		switch ($ret) {
			case 1:
				$type = 'string';
				break;
			case 2:
				$type = 'set';
				break;
			case 3:
				$type = 'list';
				break;
			case 4:
				$type = 'zset';
				break;
			case 5:
				$type = 'hash';
				break;
			default:
				$type = 'none';
				break;
		}

		return $type;
	}

	/**
	 * <p>清除所有数据所有key</p>
	 */
	private static function flushall() {
		$redis = self::get_redis();
		return $redis->flushall();
	}

	/**
     * <p>查找key</p>
     * <p>不传入参数就是查找所有key
	 */
	public static function keys($pattern = null) {
		if(null == $pattern) {
			$pattern = '*';
		}
		$redis = self::get_redis();
		return $redis->keys($pattern);
	}
}