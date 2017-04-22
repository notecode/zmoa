<?php
class FeedClient {
	public static function add_feed( $data ) {
		require_once('MemcacheqClient.php');
		$data['created'] = date('Y-m-d H:i:s');
		MemcacheqClient::set('feed', json_encode(['kind' => 'feed', 'data' => $data ]) );
	}
}