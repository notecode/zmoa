<?php
/**
 * 同步
 */
class SyncWxUserQrcodeShell extends AppShell {
	public function main() {
		$wx_user_qrcode_model = g('WxUserQrcode', 'Model/Et');
		$weixin_service = g('WeixinService', 'Service/Weixin');
		$wx_user_qrcode_list = $wx_user_qrcode_model->findAll( array('is_sync' => 0,'type' => 2), array('id','user_id', 'ticket') );
		foreach ($wx_user_qrcode_list as $key => $value) {
			$weixin_service->download_qrcode( $value['user_id'], $value['ticket'] );
			$wx_user_qrcode_model->save( array('id' => $value['id'], 'is_sync' => 1) );
		}
	}
}