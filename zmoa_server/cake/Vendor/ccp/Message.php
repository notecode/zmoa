<?php
require_once('lib/CCPRestSDK.php');
define( 'MESSAGE_LOG_PATH', LOGS . 'message' . DS );
class Message {
	//主帐号
	private $accountSid= 'aaf98f894fb19cec014fb2bf23050101';

	//主帐号Token
	private $accountToken= '1b365972f1d640bc8e2919cece36192c';

	//应用Id
	private $appId='8a48b5514fb1a66a014fb2df62cd022e';

	//请求地址，格式如下，不需要写https://
	private $serverIP='sandboxapp.cloopen.com';

	//请求端口 
	private $serverPort='8883';

	//REST版本号
	private $softVersion='2013-12-26';

	private $ccp_rest;

	public function __construct() {
		$this->ccp_rest = new CCPRestSDK($this->serverIP,$this->serverPort,$this->softVersion);
		$this->ccp_rest->setAccount($this->accountSid,$this->accountToken);
		$this->ccp_rest->setAppId($this->appId);
	}

	/**
	* 发送模板短信
	* @param to 手机号码集合,用英文逗号分开
	* @param datas 内容数据 格式为数组 例如：array('Marry','Alon')，如不需替换请填 null
	* @param $tempId 模板Id
	*/
	public function send_template_sms($to,$datas,$tempId) {
		// 发送模板短信
		$result = $this->ccp_rest->sendTemplateSMS($to,$datas,$tempId);
		if($result == NULL ) {
			return false;
		}
		if($result->statusCode != 0 ) {
			$this->log( 'error', 'status_code:' . $result->statusCode . ',' . $result->statusMsg );
			return false;
			//TODO 添加错误处理逻辑
		}
		return true;
	}

	protected function log($level = 'info', $message = '') {
			if( !file_exists( MESSAGE_LOG_PATH ) ) {
				mkdir( MESSAGE_LOG_PATH, 0777, true );
			}
			$filename = MESSAGE_LOG_PATH . 'msg_'.date('Ymd') . '.log';
			$content = date('Y-m-d H:i:s') . " {$level} :\n------------\n" . $message;
			$fp = fopen($filename, 'a+');
			fwrite( $fp, $content );
			fclose( $fp );
		}
}