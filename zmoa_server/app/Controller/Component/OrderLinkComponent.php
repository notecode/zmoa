<?php
/**
 * 表头排序
 * @copyright     Copyright (c) Cake Software Foundation, Inc. (http://cakefoundation.org)
 * @link          http://cakephp.org CakePHP(tm) Project
 * @package       Cake.Controller.Component
 * @since         CakePHP(tm) v 1.2.0.3467
 * @license       http://www.opensource.org/licenses/mit-license.php MIT License
 */

App::uses('Component', 'Controller');

/**
 * EmailComponent
 *
 * This component is used for handling Internet Message Format based
 * based on the standard outlined in http://www.rfc-editor.org/rfc/rfc2822.txt
 *
 * @package       Cake.Controller.Component
 * @link          http://book.cakephp.org/2.0/en/core-libraries/components/email.html
 * @link          http://book.cakephp.org/2.0/en/core-utility-libraries/email.html
 * @deprecated    3.0.0 Will be removed in 3.0. Use Network/CakeEmail instead
 */
class OrderLinkComponent extends Component {

/**
 * Controller reference
 *
 * @var Controller
 */
	protected $_controller = null;

/**
 * Constructor
 *
 * @param ComponentCollection $collection A ComponentCollection this component can use to lazy load its components
 * @param array $settings Array of configuration settings.
 */
	public function __construct(ComponentCollection $collection, $settings = array()) {
		$this->_controller = $collection->getController();
		parent::__construct($collection, $settings);
	}

/**
 * Initialize component
 *
 * @param Controller $controller Instantiating controller
 * @return void
 */
	public function initialize(Controller $controller) {
		// if (Configure::read('App.encoding') !== null) {
		// 	$this->charset = Configure::read('App.encoding');
		// }
	}

	/**
	 * 根据表头排序
	 *
	 * @author andycwang
	 * @modified 2012-11-12
	 */
	function sort_by_head(){
		//排序start	
		$sort_name = 'enddate';//默认按照结束时间排序
		$order = 'desc';
		$order_base_url = $this->_controller->params['url'];
		unset($order_base_url["sort_name"]);
		unset($order_base_url["order"]);
		$order_base_url = BASE_PATH . convert_urlArray_to_urlString($order_base_url);
		$this->_controller->set('order_base_url',$order_base_url);
		$query = $this->_controller->request->query;
		//按照新的排序条件排序
		if(!empty($query['sort_name']) && !empty($query['order']) ) {
			$sort_name = $query['sort_name'];
			$order = $query['order'];
		}
		$order_by = ' '.$sort_name.' '.$order.' ';
		$this->_controller->set("user_order_setting", array('sort_name'=>$sort_name, 'order'=>$order, 'order_by'=>$order_by, 'order_base_url'=>$order_base_url) );
		return $order_by;
	}

}
