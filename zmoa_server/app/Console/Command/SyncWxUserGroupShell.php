<?php
/**
 * 同步用户组
 */
class SyncWxUserGroupShell extends AppShell {
	private $clubs = null;
	private $weixin_instance = null;
	public function main() {
		$weixin_authorization_info_model = g('WeixinAuthorizationInfo', 'Model/System');
		$weixin_open_service = g('WeixinOpenService', 'Service/Weixin');
		$weixin_authorization_info_list = $weixin_authorization_info_model->findAll( array('info_type' => 'authorized'), array('authorizer_appid') );
		foreach ($weixin_authorization_info_list as $key => $value) {
			if( $weixin_open_service->check_authorize( $value['authorizer_appid'], 2) ) {
				$this->sync_open_user_group('wx4478ef40dfb1be08');
			}
		}
		// $company_list = g('Company', 'Model/System')->findAll( null, array('id') );
		// foreach( $company_list as $company ) {
		// 	$this->sync_company_user_group( $company['id'] );
		// }
	}

	/**
	 * 第三方用户组同步
	 * @param  [type] $authorized_appid [description]
	 * @return [type]                   [description]
	 */
	public function sync_open_user_group( $authorized_appid ) {
		$tag_list = g('WeixinOpenUserService', 'Service/Weixin')->get_user_tags( $authorized_appid );
		$sql = 'delete from wx_user_tags';
		if( !empty($tag_list) ) {
			$GLOBALS['company']['id'] = $company_id;
			$wx_user_group_model = g('WxUserGroup', 'Model/Company');
			$wx_user_group_model->query($sql);
			foreach ($tag_list as $key => $value) {
				$data = array('name' => $value['name'], 'count' => $value['count'], 'company_id' => $company_id);
				$wx_user_group_model->create();
				$wx_user_group_model->save($data);
			}
		}
	}

	public function sync_company_user_group( $company_id ) {
		$tag_list = g('WeixinUserService', 'Service/Weixin')->get_user_tags( $company_id );
		$sql = 'delete from wx_user_tags';
		if( !empty($tag_list) ) {
			$GLOBALS['company']['id'] = $company_id;
			$wx_user_group_model = g('WxUserGroup', 'Model/Company');
			$wx_user_group_model->query($sql);
			foreach ($tag_list as $key => $value) {
				$data = array('name' => $value['name'], 'count' => $value['count'], 'company_id' => $company_id);
				$wx_user_group_model->create();
				$wx_user_group_model->save($data);
			}
		}
	}
}