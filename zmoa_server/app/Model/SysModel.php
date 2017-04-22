<?php
/**
 * 集成Cake Model，主要是切换数据库访问，以减小数据库访问压力
 *
 * @copyright     
 * @link          
 * @package       
 * @since         
 * @license       
 */
App::uses('Model', 'Model');
class SysModel extends Model {

	public function findAll( $conditions= array(), $fields=array(), $order='', $limit=null, $page=null ) {
		$con = array();
		if( !empty($conditions) ) {
			$con['conditions'] = $conditions;
		}
		if( !empty($fields) ) {
			$con['fields'] = $fields;
		}
		if( !empty($order) ) {
			$con['order'] = $order;
		}
		if( !empty($limit) ) {
			$con['limit'] = $limit;
		}
		if( !empty($page) ) {
			$con['page'] = $page;
		}
		$result = parent::find('all', $con );
		foreach ($result as $key => $value) {
			$result[$key] = $value[ $this->name ];
		}
		return $result;
	}

	public function findFirst( $conditions=array(), $fields=array(), $order='' ) {
		$con = array();
		if( !empty($conditions) ) {
			$con['conditions'] = $conditions;
		}
		if( !empty($fields) ) {
			$con['fields'] = $fields;
		}
		if( !empty($order) ) {
			$con['order'] = $order;
		}
		$result = parent::find('first', $con );
		if( !empty($result) ) {
			return $result[$this->name];
		}
		return array();
	}

	public function save($data = null, $validate = true, $fieldList = array()) {
		parent::save($data, $validate, $fieldList);
		return parent::getLastInsertID();
	}

	public function findById($id, $fields=array()) {
		$con = array( 'conditions' => array('id' => $id) );
		if( !empty($fields) ) {
			$con['fields'] = $fields;
		}
		$result = parent::find('first', $con );
		if( !empty($result) ) {
			return $result[$this->name];
		}
		return array();
	}

	public function findCount( $conditions= array() ) {
		return parent::find('count', array('conditions' => $conditions) );
	}

	public function query( $sql ) {
		$query_results = parent::query($sql);
		$rows = array();
		if($query_results === true) {
			return true;
		}
		foreach ($query_results as $key => $results) {
			$r = array();
			foreach ($results as $k => $v) {
				$r = array_merge($v,$r);
			}
			$rows[] = $r;
		}
		unset($query_results);
		return $rows;
	}

	/**
	 * 传一个数据库一个字段
	 * @param  array  $conditions [description]
	 * @param  string $fields     [description]
	 * @return [type]             [description]
	 */
	public function findMax( $conditions=array(), $fields = 'id' ) {
		$dbo = $this->getDataSource();
		if( !empty($conditions) ) {
			$con['conditions'] = $conditions;
		}
		if( !empty($fields) ) {
			if( is_array($fields) ) {
				$fields = $fields[0];
			}
			$con['fields'] = array( $dbo->calculate( $this, 'max', array($fields) ) );
		}
		$result = parent::find('all', $con);
		foreach ($result as $value) {
			foreach ($value as $k => $v ) {
				if( empty($v) ) {
					return 0;
				} else {
					return $v[ $fields ];
				}
			}
		}
		return 0;
	}
}