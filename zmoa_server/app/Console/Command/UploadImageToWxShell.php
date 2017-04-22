<?php
/**
 * 上传图片到微信
 */
class UploadImageToWxShell extends AppShell {
	public function main() {
		//$ret = $this->_init();
		//上传暂时图片
		//微信会在3天时间删除
		$delete_time  = 3200*24*3;
		$expire_time = date('Y-m-d, H:i:s',time() - $delete_time);

		$company_list = g('Company', 'Model/System')->findAll();
		foreach ($company_list as $key => $value) {
			if( WEIXIN_COMMON_ACCESS == $value['type'] ) {
				$this->_handle_common_upload($value, $expire_time);
			} else if( WEIXIN_AUTHORIZE_ACCESS == $value['type'] ) {
				$this->_handle_authorized_upload($value, $expire_time);
			}
		}
	}

	private function _handle_authorized_upload( & $company, $expire_time) {
		$image_model = g('Image', 'Model/Company');
		$GLOBALS['company']['id'] = $company['id'];
		
		$image_list = $image_model->findAll(array('type' => 'wx_picture', 'is_temp' => 1, 'is_deleted' => 0, 'upload_time <=' => $expire_time ), array('id', 'media_id', 'upload_time' ,'is_upload', 'path'),'id asc' );
		$weixin_open_material_service = g('WeixinOpenMaterialService', 'Service/Weixin');
		foreach ($image_list as $key => $value) {
			$filepath = APP . 'webroot' . DS . 'files' . DS . 'wx_picture' . DS . $company['id'] . DS .$value['path'];
			if(!file_exists( $filepath) ) {
				$this->out('更新图片到微信成功：id=' . $value['id'] . ' 图片不存在' );
				continue;
			}
			//更新图片
			$ret = $weixin_open_material_service->media_temp_upload( $company['appid'], $filepath, 'image');
			if( is_array($ret) && !isset($ret['errcode']) ) {
				$data = array(
					'id' => $value['id'],
					'is_upload' => 1,
					'media_id' => $ret['media_id'],
					'upload_time' => date('Y-m-d H:i:s'),
					);
				$image_model->save( $data );
				$this->out('更新图片到微信成功：id=' . $value['id'] . '  media_id=' . $ret['media_id'] );
			}
		}

		//上传音频
		$standard_voice_model =g('StandardVoice', 'Model/Company');
		$standard_voice_list = $standard_voice_model->findAll(array( 'type' => 'wx_standard_voice','is_temp' => 1, 'is_deleted' => 0, 'upload_time <=' => $expire_time ), array('id', 'media_id', 'upload_time', 'path', 'type'), 'id asc' );
		foreach ($standard_voice_list as $key => $value) {
			$filepath = APP . 'webroot' . DS . 'files' . DS . 'wx_standard_voice' . DS . $company['id'] . DS . $value['path'];
			if(!file_exists( $filepath) ) {
				$this->out('更新语音到微信成功：id=' . $value['id'] . ' 语音不存在' );
				continue;
			}
			//更新图片
			$ret = $weixin_open_material_service->media_temp_upload( $company['appid'], $filepath, 'voice');
			if( is_array($ret) && !isset($ret['errcode']) ) {
				$data = array(
					'id' => $value['id'],
					'media_id' => $ret['media_id'],
					'upload_time' => date('Y-m-d H:i:s'),
					);
				$standard_voice_model->save( $data );
				$this->out('更新语音到微信成功：id=' . $value['id'] . '  media_id=' . $ret['media_id'] );
			}
		}
	}

	private function _handle_common_upload( & $company, $expire_time) {
		$image_model = g('Image', 'Model/Company');
		$wx_image_model = g('WxImage', 'Model/Et');
		$GLOBALS['company']['id'] = $company['id'];
		$image_list = $image_model->findAll(array('type' => 'wx_picture', 'is_temp' => 1, 'is_deleted' => 0, 'upload_time <=' => $expire_time ), array('id', 'media_id', 'upload_time' ,'is_upload', 'path'),'id asc' );
		$weixin_service = g('WeixinService', 'Service/Weixin');
		foreach ($image_list as $key => $value) {
			$filepath = APP . 'webroot' . DS . 'files' . DS . 'wx_picture' . DS .$value['path'];
			if(!file_exists( $filepath) ) {
				$this->out('更新图片到微信成功：id=' . $value['id'] . ' 图片不存在' );
				continue;
			}
			//更新图片
			$ret = $weixin_service->media_temp_upload( 10231, $filepath, 'image');
			if( is_array($ret) && !isset($ret['errcode']) ) {
				$data = array(
					'id' => $value['id'],
					'is_upload' => 1,
					'media_id' => $ret['media_id'],
					'upload_time' => date('Y-m-d H:i:s'),
					);
				$image_model->save( $data );
				//更新到客户端
				$wx_image_model->save( array('id' => $value['id'], 'type' => 'wx_picture', 'path' => $value['path'],'media_id' => $ret['media_id']) );
				$this->out('更新图片到微信成功：id=' . $value['id'] . '  media_id=' . $ret['media_id'] );
			}
		}

		//上传音频
		$standard_voice_model =g('StandardVoice', 'Model/Company');
		$wx_standard_voice_model = g('WxStandardVoice', 'Model/Et');
		$standard_voice_list = $standard_voice_model->findAll(array( 'type' => 'wx_standard_voice','is_temp' => 1, 'is_deleted' => 0, 'upload_time <=' => $expire_time ), array('id', 'media_id', 'upload_time', 'path'), 'id asc' );
		foreach ($standard_voice_list as $key => $value) {
			$filepath = APP . 'webroot' . DS . 'files' . DS . 'wx_standard_voice' . DS .$value['path'];
			if(!file_exists( $filepath) ) {
				$this->out('更新语音到微信成功：id=' . $value['id'] . ' 语音不存在' );
				continue;
			}
			//更新图片
			$ret = $weixin_service->media_temp_upload( 10231, $filepath, 'voice');
			if( is_array($ret) && !isset($ret['errcode']) ) {
				$data = array(
					'id' => $value['id'],
					'media_id' => $ret['media_id'],
					'upload_time' => date('Y-m-d H:i:s'),
					);
				$standard_voice_model->save( $data );
				$wx_standard_voice_model->save( array('id' => $value['id'], 'path'=>$value['path'], 'type' => $value['type'], 'media_id' => $ret['media_id']) );
				$this->out('更新语音到微信成功：id=' . $value['id'] . '  media_id=' . $ret['media_id'] );
			}
		}
	}

}