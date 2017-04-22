<?php
class AccountService {
	public function get_custom_fields($customer_group_id = 0) {
		$custom_field_data = array();
		if (!$customer_group_id) {
			$arr_custom_field = g('CustomField', 'Model')->query("SELECT * FROM `" 
				. DB_PREFIX . "custom_field` cf LEFT JOIN `" 
				. DB_PREFIX . "custom_field_description` cfd ON (cf.custom_field_id = cfd.custom_field_id) WHERE cf.status = '1' AND cfd.language_id = '" . (int)$GLOBALS['config']['config_language_id'] . "' ORDER BY cf.sort_order ASC");
		} else {
			$arr_custom_field = g('CustomField', 'Model')->query("SELECT * FROM `" 
				. DB_PREFIX . "custom_field_customer_group` cfcg LEFT JOIN `" 
				. DB_PREFIX . "custom_field` cf ON (cfcg.custom_field_id = cf.custom_field_id) LEFT JOIN `" 
				. DB_PREFIX . "custom_field_description` cfd ON (cf.custom_field_id = cfd.custom_field_id) WHERE cf.status = '1' AND cfd.language_id = '" . (int)$GLOBALS['config']['config_language_id'] . "' AND cfcg.customer_group_id = '" . (int)$customer_group_id . "' ORDER BY cf.sort_order ASC");
		}
		$custom_field_value_model = g('CustomFieldValue', 'Model');
		foreach ($arr_custom_field as $custom_field) {
			$custom_field_value_data = array();

			if ($custom_field['type'] == 'select' || $custom_field['type'] == 'radio' || $custom_field['type'] == 'checkbox') {
				$custom_field_value_query = $custom_field_value_model->query("SELECT * FROM " 
					. DB_PREFIX . "custom_field_value cfv LEFT JOIN " 
					. DB_PREFIX . "custom_field_value_description cfvd ON (cfv.custom_field_value_id = cfvd.custom_field_value_id) WHERE cfv.custom_field_id = '" . (int)$custom_field['custom_field_id'] 
					. "' AND cfvd.language_id = '" . (int)$GLOBALS['config']['config_language_id'] . "' ORDER BY cfv.sort_order ASC");

				foreach ($custom_field_value_query->rows as $custom_field_value) {
					$custom_field_value_data[] = array(
						'custom_field_value_id' => $custom_field_value['custom_field_value_id'],
						'name'				  => $custom_field_value['name']
					);
				}
			}

			$custom_field_data[] = array(
				'custom_field_id'	=> $custom_field['custom_field_id'],
				'custom_field_value' => $custom_field_value_data,
				'name'			   => $custom_field['name'],
				'type'			   => $custom_field['type'],
				'value'			  => $custom_field['value'],
				'validation'		 => $custom_field['validation'],
				'location'		   => $custom_field['location'],
				'required'		   => empty($custom_field['required']) || $custom_field['required'] == 0 ? false : true,
				'sort_order'		 => $custom_field['sort_order']
			);
		}

		return $custom_field_data;
	}

	public function add_wishlist($customer_id, $product_id) {
		// $customer_wishlist = g('CustomerWishlist', 'Model')->findAll( array('customer_id' => $customer_id, 'product_id' => $product_id) );
		// foreach ($customer_wishlist as $key => $value) {
		// }
		// $this->db->query("DELETE FROM " 
		// 	. DB_PREFIX . "customer_wishlist WHERE customer_id = '" . (int)$this->customer->getId() 
		// 	. "' AND product_id = '" . (int)$product_id . "'");

	}

	public function edit_customer($post_data) {
		$customer_id = g('Customer', 'Model')->get_id();
		$data = array(
			'customer_id' => $customer_id,
			'firstname' => $post_data['firstname'],
			'lastname' => $post_data['lastname'],
			'email' => $post_data['email'],
			'telephone' => $post_data['telephone'],
			'fax' => $post_data['fax'],
			);
		g('Customer', 'Model')->save($data);
	}

	public function edit_password($post_data) {
		$customer_id = g('Customer', 'Model')->get_id();
		$salt = token(9);
		$data = array(
			'customer_id' => $customer_id,
			'password' => sha1($salt . sha1($salt . sha1($post_data['password']))),
			);
		g('Customer', 'Model')->save($data);
	}

	public function address_validate($post_data) {

	}

	public function password_validate($post_data) {
		$error = array();
		if ((utf8_strlen(html_entity_decode($post_data['password'], ENT_QUOTES, "UTF-8")) < 4) 
			|| (utf8_strlen(html_entity_decode($post_data['password'], ENT_QUOTES, "UTF-8")) > 20)) {
			$error['password'] = __d('account/password', 'error_password');
		}

		if ($post_data['confirm'] != $post_data['password']) {
			$error['confirm'] = __d('account/password', 'error_confirm');
		}
		return $error;
	}

	public function edit_validate($post_data) {
		$error = array();
		if ((utf8_strlen(trim($post_data['firstname'])) < 1) || (utf8_strlen(trim($post_data['firstname'])) > 32)) {
			$error['firstname'] = __d('account/edit', 'error_firstname');
		}

		if ((utf8_strlen(trim($post_data['lastname'])) < 1) || (utf8_strlen(trim($post_data['lastname'])) > 32)) {
			$error['lastname'] = __d('account/edit', 'error_lastname');
		}

		if ((utf8_strlen($post_data['email']) > 96) || !filter_var($post_data['email'], FILTER_VALIDATE_EMAIL)) {
			$error['email'] = __d('account/edit', 'error_email');
		}
		$customer_model = g('Customer', 'Model');
		if (($customer_model->get_email() != $post_data['email']) 
			&& $customer_model->get_total_customers_by_email($post_data['email'])) {
			$error['warning'] = __d('account/edit', 'error_exists');
		}

		if ((utf8_strlen($post_data['telephone']) < 3) || (utf8_strlen($post_data['telephone']) > 32)) {
			$error['telephone'] = __d('account/edit', 'error_telephone');
		}

		// Custom field validation
		// $this->load->model('account/custom_field');

		// $custom_fields = $this->model_account_custom_field->getCustomFields($this->config->get('config_customer_group_id'));

		// foreach ($custom_fields as $custom_field) {
		// 	if (($custom_field['location'] == 'account') && $custom_field['required'] && empty($this->request->post['custom_field'][$custom_field['custom_field_id']])) {
		// 		$this->error['custom_field'][$custom_field['custom_field_id']] = sprintf($this->language->get('error_custom_field'), $custom_field['name']);
		// 	} elseif (($custom_field['location'] == 'account') && ($custom_field['type'] == 'text') && !empty($custom_field['validation']) && !filter_var($this->request->post['custom_field'][$custom_field['custom_field_id']], FILTER_VALIDATE_REGEXP, array('options' => array('regexp' => $custom_field['validation'])))) {
		// 		$this->error['custom_field'][$custom_field['custom_field_id']] = sprintf($this->language->get('error_custom_field'), $custom_field['name']);
		// 	}
		// }
		return $error;
	}

	public function add_activity($key, $data) {
		if (isset($data['customer_id'])) {
			$customer_id = $data['customer_id'];
		} else {
			$customer_id = 0;
		}
		g('CustomerActivity', 'Model')->save( array(
			'customer_id' => $customer_id,
			'key' => $key,
			'data' => json_encode($data),
			'ip' => $_SERVER['REMOTE_ADDR'],
			'date_added' => date('Y-m-d H:i:s')
			) );
	}

	public function get_addresses() {
		$address_data = array();
		$array_address = g('Address', 'Model')->findAll( array('customer_id' => g('Customer', 'Model')->get_id() ) );
		foreach ($array_address as $result) {
			$country_ins = g('Country', 'Model')->findFirst( array('country_id' => $result['country_id']) );
			if ( !empty($country_ins) ) {
				$country = $country_ins['name'];
				$iso_code_2 = $country_ins['iso_code_2'];
				$iso_code_3 = $country_ins['iso_code_3'];
				$address_format = $country_ins['address_format'];
			} else {
				$country = '';
				$iso_code_2 = '';
				$iso_code_3 = '';
				$address_format = '';
			}
			$zone_ins = g('Zone', 'Model')->findFirst( array('zone_id' => $result['zone_id']));
			if (!empty($zone_ins)) {
				$zone = $zone_ins['name'];
				$zone_code = $zone_ins['code'];
			} else {
				$zone = '';
				$zone_code = '';
			}
			$address_data[$result['address_id']] = array(
				'address_id'     => $result['address_id'],
				'firstname'      => $result['firstname'],
				'lastname'       => $result['lastname'],
				'company'        => $result['company'],
				'address_1'      => $result['address_1'],
				'address_2'      => $result['address_2'],
				'postcode'       => $result['postcode'],
				'city'           => $result['city'],
				'zone_id'        => $result['zone_id'],
				'zone'           => $zone,
				'zone_code'      => $zone_code,
				'country_id'     => $result['country_id'],
				'country'        => $country,
				'iso_code_2'     => $iso_code_2,
				'iso_code_3'     => $iso_code_3,
				'address_format' => $address_format,
				'custom_field'   => json_decode($result['custom_field'], true)
			);
		}
		return $address_data;
	}

	public function get_address($address_id ) {
		$address = g('Address', 'Model')->findFirst(array('address_id' => $address_id));
		if ( !empty($address) ) {
			$country = g('Country', 'Model')->findFirst( array('country_id' => $address['country_id'] ) );
			if ( !empty($country) ) {
				$country_name = $country['name'];
				$iso_code_2 = $country['iso_code_2'];
				$iso_code_3 = $country['iso_code_3'];
				$address_format = $country['address_format'];
			} else {
				$country_name = '';
				$iso_code_2 = '';
				$iso_code_3 = '';
				$address_format = '';
			}

			$zone_query = g('Zone','Model')->findFirst( array('zone_id' => $address['zone_id']) );

			if ($zone_query) {
				$zone = $zone_query['name'];
				$zone_code = $zone_query['code'];
			} else {
				$zone = '';
				$zone_code = '';
			}
			$address_data = array(
				'address_id'     => $address['address_id'],
				'firstname'      => $address['firstname'],
				'lastname'       => $address['lastname'],
				'company'        => $address['company'],
				'address_1'      => $address['address_1'],
				'address_2'      => $address['address_2'],
				'postcode'       => $address['postcode'],
				'city'           => $address['city'],
				'zone_id'        => $address['zone_id'],
				'zone'           => $zone,
				'zone_code'      => $zone_code,
				'country_id'     => $address['country_id'],
				'country'        => $country_name,
				'iso_code_2'     => $iso_code_2,
				'iso_code_3'     => $iso_code_3,
				'address_format' => $address_format,
				'custom_field'   => json_decode($address['custom_field'], true)
			);
			return $address_data;
		} else {
			return false;
		}
	}

	public function add_address($post_data) {
		$data = array(
			'customer_id' => g('Customer', 'Model')->get_id(),
			'firstname' => $post_data['firstname'],
			'lastname' => $post_data['lastname'],
			'company' => $post_data['company'],
			'address_1' => $post_data['address_1'],
			'address_2' => $post_data['address_2'],
			'postcode' => $post_data['postcode'],
			'city' => $post_data['city'],
			'zone_id' => $post_data['zone_id'],
			'country_id' => $post_data['country_id'],
			'custom_field' => isset($post_data['custom_field']) ? json_encode($post_data['custom_field']) : '',
			);
		if( !empty($post_data['address_id']) ) {
			$data['address_id'] = $post_data['address_id'];
		}
		return g('Address', 'Model')->save($data);
	}

	public function edit_newsletter($post_data) {
		$data = array(
			'customer_id' => g('Customer', 'Model')->get_id(),
			'newsletter' => $post_data['newsletter'],
			);
		g('Customer', 'Model')->save($data);
	}
}