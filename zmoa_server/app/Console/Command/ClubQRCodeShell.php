<?php
class ClubQRCodeShell extends AppShell {
	private $clubs = null;
	private $weixin_instance = null;
	public function main() {
		$ret = $this->_init();
		//没有job需要处理
		if( !$ret ) {
			return 0;
		}

		foreach ( $this->clubs as $key => $club ) {
			$this->_create_qr_code( $club );
		}
	}
	private function _init() {
		$this->clubs = g('Club', 'Model')->find('all', 
			['conditions' => ['qr_code is' => 'null' ], 'fields' => 'id, name,photo, mobile, qr_code' ] );
		if( empty($this->clubs) ) {
			return false;
		}
		App::import('Vendor', 'weixin/Weixin');
		$this->weixin_instance = g('Weixin', 'Vendor');
		return true;
	}

	private function _create_qr_code( $club ) {
		$qr_code = [
					'action_name' => 'QR_LIMIT_STR_SCENE', 
					'action_info' => [
						'scene' => ['scene_str' => $club['id'] ]  ]
					];

		$ticket = $this->weixin_instance->get_limit_qr( json_encode( $qr_code, true ) );

		//保存到数据库
		$club['qr_code'] = $ticket;
		g('Club', 'Model')->save($club);
	}
}