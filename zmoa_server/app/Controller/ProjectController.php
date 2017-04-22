<?php
App::uses('AppController', 'Controller');
class ProjectController extends AppController {
	public function account() {
		$this->breadcrumbs('account');
		$credit_cards = false;
	}
}