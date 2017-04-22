<?php
/**
 *
 * @copyright     谷一科技有限公司
 * @link          http://www.goodease.cn
 * @package       api.Controller
 * @since         2015.11.02
 * @license       谷一科技有限公司版权所有
 * @author 		  janeleozhou
 */


App::uses('Controller', 'Controller');
/**
 * Application Controller
 *
 * Add your application-wide methods in the class below, your controllers
 * will inherit them.
 *
 * @package		app.Controller
 * @link		http://book.cakephp.org/2.0/en/controllers.html#the-app-controller
 */
class AppController extends Controller {
	public $layout = 'none';
	public $autoRender = false;
	public function beforeFilter() {
		g('ConfigService', 'Service')->config();
		//判断用户是否登录
		$this->set('admin_title',  'jincart');
		$this->_set_customer();
		$this->_set_currency();
		$this->_set_language();
		$this->_set_session();
		$route = strtolower($this->request->params['controller']) . '::' . $this->request->params['action'];
		if( !in_array($route, array('checkout::cart_info')) ) {

			//设置
			$this->set('config_name', $GLOBALS['config']['config_name']);
			$this->set('cart_info', g('CartService', 'Service')->cart_info() );

			$this->_set_body_class();
			$this->_set_header();
			$this->_set_nav();
			$this->_startup();
			$this->_set_footer();
		}
	}


}
