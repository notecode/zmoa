<?php
/**
 * 同步用户组
 */
class SyncMaterialShell extends AppShell {
	private $clubs = null;
	private $weixin_instance = null;
	public function main() {

		$wx_user_group_model = g('WxUserGroup', 'Model/Company');
		$page_size = 5;
		$offset = 0;
		while(1) {
			$image_list = g('WeixinService', 'Service/Weixin')->batchget_material('image',$offset,$page_size);
			debug($image_list);
			die;
		}
	}
}