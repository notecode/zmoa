<?php
/**
 * 分页
 * @copyright     Copyright (c) Cake Software Foundation, Inc. (http://cakefoundation.org)
 * @link          http://cakephp.org CakePHP(tm) Project
 * @package       Cake.Controller.Component
 * @since         CakePHP(tm) v 1.2.0.3467
 * @license       http://www.opensource.org/licenses/mit-license.php MIT License
 */

App::uses('Component', 'Controller');

class PagerComponent extends Component {

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

	public function init(&$model,$page_size = 10, $conditions=array(), $fields= array(), $order='created desc' ) {
		$query = $this->_controller->request->query;
		$current_page = isset( $query['page']) ? $query['page'] : 1;
		$url = isset($query['url']) ? $query['url'] : '';
		unset($query['url']);
		unset($query['page']);
		if( !empty($query) ) {
			$url .= '?'. http_build_query($query) . '&';
		} else {
			$url .= '?';
		}
		$total_records = $model->findCount($conditions);
		$total_pages = ceil($total_records/$page_size);
		$this->_controller->set('current_page', $current_page);
		$this->_controller->set('page_base_url', $url );
		$this->_controller->set('total_records', $total_records);
		$this->_controller->set('total_pages', $total_pages );

		return $model->findAll( $conditions, $fields, $order, $page_size, $current_page );
	}

	public function init2(&$model,$cur_page=1,$page_size = 10, $conditions=array(), $fields= array(), $order='created desc' ) {
		$query = $this->_controller->request->query;
		
		$total_records = $model->findCount($conditions);
		$total_pages = ceil($total_records/$page_size);
		$this->_controller->set('current_page', $cur_page);
		$this->_controller->set('total_records', $total_records);
		$this->_controller->set('total_pages', $total_pages );

		return $model->findAll( $conditions, $fields, $order, $page_size, $cur_page );
	}
}