<?php
class CourseNoticeShell extends AppShell {
	private $weixin_instance = null;
	private $map_coach = [];
	private $notifyJob = [];
	private $map_member_openid = [];
	private $cur_time;
	public function main() {
		$ret = $this->_init();
		//没有job需要处理
		if( !$ret ) {
			return 0;
		}

		$this->_notify_user();
		//$this->_test_weixn_template('osBhGtx3vHvch0TsG0affDiGHHes', 10000);
	}
	private function _init() {
		$this->cur_time = date('Y-m-d H:i:s', time() );
		$this->notifyJob = g('NotifyJobQueue', 'Model')->find('all',
			[ 'conditions' => ['notify_time <=' => $this->cur_time, 'status' => 0 ] ] );
		if( empty($this->notifyJob) ) {
			return false;
		}
		$coach_ids = [];
		$member_ids = [];
		foreach ($this->notifyJob as $key => $value) {
			$coach_ids[] = $value['coach_id'];
			$member_ids[] = $value['member_id'];
		}
		$coach_ids = array_values( $coach_ids );
		//处理教练
		$coachs = g('Member', 'Model')->find('all', 
			['conditions' => ['id' => $coach_ids ], 'fields' => 'id, name, mobile' ] );
		$this->map_coach = [];
		foreach ($coachs as $key => $value) {
			$this->map_coach[ $value['id'] ] = [ 'name' => $value['name'], 'mobile' => $value['mobile'] ];
		}
		unset($coachs);

		//获取用户id和openid对应关系
		$arr_openid = g('MappingFan', 'Model')->find( 'all', 
				['conditions' => [ 'uid' => $member_ids ], 'fields' => 'uid, openid'] );
		foreach ($arr_openid as $key => $value) {
			$this->map_member_openid[ $value['uid'] ] =$value['openid'];
		}
		unset($arr_openid);

		App::import('Vendor', 'weixin/Weixin');
		$this->weixin_instance = g('Weixin', 'Vendor');
		return true;
	}
	private function _notify_user() {
		foreach ( $this->notifyJob as $key => $job ) {
			$this->_handle_every_job ( $job );
		}
	}

	//获取此刻将来预约的用户
	private function _handle_every_job( $job ) {
		$openid = $this->map_member_openid[ $job['member_id'] ];
		if( empty( $openid ) ) {
			return;
		}
		//获取课程名称
		$course_name = g('Course', 'Model/Et')->find( 'first', ['conditions' => ['id' => $job['course_id'] ], 'fields' => 'name' ] );
		$course_name = isset( $course_name ) ? $course_name['name'] : '';
		$coach_name = isset($this->map_coach[ $job['coach_id'] ]['name']) ? $this->map_coach[ $job['coach_id'] ]['name'] : '';
		$coach_tel = isset($this->map_coach[ $job['coach_id'] ]['mobile']) ? $this->map_coach[ $job['coach_id'] ]['mobile'] : '';
		$course_start_time = $job['course_start_time'];

		$data_arr = ['course_name' => $course_name,
					'coach_name' => $coach_name,
					'coach_tel' => $coach_tel,
					'course_start_time' => $course_start_time ];
		$this->weixin_instance->sendTemplateMsg('course_start_notice', $data_arr, ['from' => $openid] );
		$job['status'] = 1;
		g('NotifyJobQueue', 'Model')->create( $job );
		g('NotifyJobQueue', 'Model')->save( $job );
	}

	private function _test_weixn_template( $openid, $club_id ) {
		$data_arr = ['course_name' => '单车课', 
					'coach_name' => '周正乐', 
					'coach_tel' => '15521036720', 
					'course_start_time' => '2015-06-07 10:30'];
		$message['from'] = $openid;
		App::import('Vendor', 'weixin/Weixin');
		$this->weixin_instance = g('Weixin', 'Vendor');
		$this->weixin_instance->sendTemplateMsg('course_start_notice', $data_arr, $message);
	}
}