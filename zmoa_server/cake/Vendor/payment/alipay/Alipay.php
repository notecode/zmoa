<?php
class Alipay {
	/**
	 * 支付
	 */
	public function doalipay( $trade_info ) {
		$alipay_config = $this->get_alipay_config();
		//构造要请求的参数数组，无需改动
		$parameter = [
			"service" => "create_direct_pay_by_user",
			"partner" => trim($alipay_config['partner']),
			"payment_type"	=> 1,
			"notify_url"	=> $alipay_config['notify_url'],
			"return_url"	=> $alipay_config['return_url'],
			"seller_email"	=> $alipay_config['seller_email'],
			"out_trade_no"	=> $trade_info['trade_no'],
			"subject"	=> $trade_info['subject'],
			"total_fee"	=> $trade_info['total_fee'],
			"body"			=> $trade_info['body'],
			"show_url"	=> $trade_info['show_url'],
			"anti_phishing_key"	=> '',
			"exter_invoke_ip"	=> get_client_ip(),
			"_input_charset"	=> 'utf-8'
			];
		//建立请求
		$alipaySubmit = new AlipaySubmit( $alipay_config );
		$html_text = $alipaySubmit->buildRequestForm( $parameter,"post", "确认");
		echo $html_text;
	}

	/******************************
	服务器异步通知页面方法(该函数被业务函数继承)
	其实这里就是将notify_url.php文件中的代码复制过来进行处理
	*******************************/
	protected function notify_url( $trade_info, $trade_status ){
		//计算得出通知验证结果
		$alipayNotify = new AlipayNotify( $this->get_alipay_config() );
		$verify_result = $alipayNotify->verifyNotify();
		if($verify_result) {
			//获取支付宝的通知返回参数，可参考技术文档中服务器异步通知参数列表
			$parameter = [
				//商户订单编号
				"out_trade_no" => $trade_info['out_trade_no'],
				//支付宝交易号
				"trade_no" => $trade_info['trade_no'],
				//交易金额
				"total_fee" => $trade_info['total_fee'],
				//交易状态
				"trade_status" => $trade_info['trade_status'],
				//通知校验ID
				"notify_id" => $trade_info['notify_id'],
				//通知的发送时间
				"notify_time" => $trade_info['notify_time'],
				//买家支付宝帐号
				"buyer_email"  => $trade_info['buyer_email'],
				];
			if( $trade_status == 'TRADE_FINISHED') {
				//TODO
			} else if ($trade_status == 'TRADE_SUCCESS') {
				//TODO
			}
			//请不要修改或删除
			echo "success";
		 } else {
			//验证失败
			echo "fail";
		}
	}

	/*
	页面跳转处理方法；(该函数被业务函数继承)
	这里其实就是将return_url.php这个文件中的代码复制过来，进行处理； 
	*/
	public function returnurl( $trade_info, $trade_status ) {
		//头部的处理跟上面两个方法一样，这里不罗嗦了！
		$alipayNotify = new AlipayNotify( $this->get_alipay_config() );
		$verify_result = $alipayNotify->verifyReturn();
		if($verify_result) {
			$parameter = [
				//商户订单编号
				"out_trade_no" => $trade_info['out_trade_no'],
				//支付宝交易号
				"trade_no" => $trade_info['trade_no'],
				//交易金额
				"total_fee" => $trade_info['total_fee'],
				//交易状态
				"trade_status" => $trade_info['trade_status'],
				//通知校验ID
				"notify_id" => $trade_info['notify_id'],
				//通知的发送时间
				"notify_time" => $trade_info['notify_time'],
				//买家支付宝帐号
				"buyer_email"  => $trade_info['buyer_email'],
				];
			if($trade_status == 'TRADE_FINISHED' || $trade_status == 'TRADE_SUCCESS') {
					//TODO 订单处理
					//$this->redirect(C('alipay.successpage'));
				}else {
					//跳转到配置项中配置的支付失败页面；
					//$this->redirect(C('alipay.errorpage'));
				}
		} else {
				//验证失败
				//如要调试，请看alipay_notify.php页面的verifyReturn函数
				echo "支付失败！";
		}
	}

	protected function get_alipay_config() {
		return [
			//合作身份者id，以2088开头的16位纯数字
			'partner' => '',
			//收款支付宝账号
			'seller_email' => '',
			//安全检验码，以数字和字母组成的32位字符
			'key' => '',
			//签名方式 不需修改
			'sign_type' => 'MD5',
			//字符编码格式
			'input_charset' => 'utf-8',
			'cacert' => CAKE_VENDORS . 'payment/alipay/cacert.pem',
			//访问模式,根据自己的服务器是否支持ssl访问，若支持请选择https；若不支持请选择http
			'transport' => 'http'
		];
	}
}
