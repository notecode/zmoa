<?php
App::uses('AppController', 'Controller');
class UserController extends AppController {
	private $error = array();
	public function account() {
		$this->breadcrumbs('account');
		//$files = glob(DIR_APPLICATION . 'controller/extension/credit_card/*.php');
		//信用卡
		$credit_cards = false;

		if ($GLOBALS['config']['reward_status']) {
			$reward = BASE_PATH . 'account/reward';
		} else {
			$reward = '';
		}

		$this->web_meta(__d('account/account', 'heading_title'));
		$this->set( compact('credit_cards','reward') );
		$this->layout_modules();
	}
}