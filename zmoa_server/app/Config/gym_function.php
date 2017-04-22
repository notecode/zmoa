<?php
function deal_id( $id, $length) {
	$id = str_replace('-', '', $id );
	$len = strlen( $id);
	$tmp_str = '';
	for( $i = 0; $i < $length - $len; $i++ ) {
		$tmp_str = $tmp_str . '0';
	}
	return $tmp_str . $id;
}

//单例模式
function g( $object, $type,$params=null) {
	return App::getInstance( $object , $type,$params );
}



function numberFormat($num,$length){
	$numStr = $num;
	while(strlen($numStr)<$length){
		$numStr = '0'.$numStr;
	}
	return $numStr;
}

function getDateTime(){
		return date('Y-m-d H:i:s');
}

function dateToWeek($date){
	return date('w',strtotime($date));
}

function dateFromToday($date){
	return ceil((strtotime($date)-strtotime(date('Y-m-d')))/86400);
}

function dayBeforeDate($date,$offset){
	return date('Y-m-d',(strtotime($date)-86400*$offset));
}

function dayBeforeDateWithFormat($date,$offset,$format){
	return date($format,(strtotime($date)-86400*$offset));
}

function dateInWeek($date){
	$weekday = dateToWeek($date);
	if($weekday ==0 ){
		$weekday = 7;
	}
	$week = array();
	for($i=1;$i<8;$i++){
		$week[] = dayBeforeDateWithFormat($date,$weekday-$i,'m.d');
	}
	return $week;
}

/**
 * 数组到星期的转换
 * @return [type] [description]
 * @author janeleozhou
 */
function cn_week() {
	return array('日', '一', '二','三', '四', '五', '六');
}

/**
 * 数组到星期的转换
 * @return [type] [description]
 * @author janeleozhou
 */
function full_cn_week() {
	return array('星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六');
}

/**
 * 数组到因为星期的转换
 * @return [type] [description]
 * @author janeleozhou
 */
function en_week() {
	return array( 'SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT' );
}

function compare_time($time1,$time2){
	$start_time1 = substr($time1, 0,5);
	$start_time1 = substr($start_time1, 0,2).substr($start_time1, 3);
	$start_time1 = intval($start_time1);
	$start_time2 = substr($time2, 0,5);
	$start_time2 = substr($start_time2, 0,2).substr($start_time2, 3);
	$start_time2 = intval($start_time2);
	if($start_time1 > $start_time2)
		return 1;
	elseif($start_time1 == $start_time2)
		return 0;
	else
		return -1;
}

function mkdirs($path) {
	if(!is_dir($path)) {
		mkdirs(dirname($path));
		mkdir($path);
	}
	return is_dir($path);
}

function error($errno, $message = '') {
	return array(
		'errno' => $errno,
		'message' => $message,
	);
}

function ihttp_request($url, $post = '', $extra = array(), $timeout = 60) {
	$urlset = parse_url($url);
	if(empty($urlset['path'])) {
		$urlset['path'] = '/';
	}
	if(!empty($urlset['query'])) {
		$urlset['query'] = "?{$urlset['query']}";
	}
	if(empty($urlset['port'])) {
		$urlset['port'] = $urlset['scheme'] == 'https' ? '443' : '80';
	}
	if (strexists($url, 'https://') && !extension_loaded('openssl')) {
		if (!extension_loaded("openssl")) {
			//message('请开启您PHP环境的openssl');
		}
	}
	if(function_exists('curl_init') && function_exists('curl_exec')) {
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $urlset['scheme']. '://' .$urlset['host'].($urlset['port'] == '80' ? '' : ':'.$urlset['port']).$urlset['path'].$urlset['query']);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($ch, CURLOPT_HEADER, 1);
		if($post) {
			if (is_array($post)) {
				$filepost = false;
				foreach ($post as $name => $value) {
					if (substr($value, 0, 1) == '@') {
						$filepost = true;
						break;
					}
				}
				if (!$filepost) {
					$post = http_build_query($post);
				}
			}
			curl_setopt($ch, CURLOPT_POST, 1);
			curl_setopt($ch, CURLOPT_POSTFIELDS, $post);
		}
		curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, $timeout);
		curl_setopt($ch, CURLOPT_TIMEOUT, $timeout);
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
		curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
		curl_setopt($ch, CURLOPT_SSLVERSION, 1);
		if (defined('CURL_SSLVERSION_TLSv1')) {
			curl_setopt($ch, CURLOPT_SSLVERSION, CURL_SSLVERSION_TLSv1);
		}
		curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:9.0.1) Gecko/20100101 Firefox/9.0.1');
		if (!empty($extra) && is_array($extra)) {
			$headers = array();
			foreach ($extra as $opt => $value) {
				if (strexists($opt, 'CURLOPT_')) {
					curl_setopt($ch, constant($opt), $value);
				} elseif (is_numeric($opt)) {
					curl_setopt($ch, $opt, $value);
				} else {
					$headers[] = "{$opt}: {$value}";
				}
			}
			if(!empty($headers)) {
				curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
			}
		}
		$data = curl_exec($ch);
		$status = curl_getinfo($ch);
		$errno = curl_errno($ch);
		$error = curl_error($ch);
		curl_close($ch);
		if($errno || empty($data)) {
			return error(1, $error);
		} else {
			return ihttp_response_parse($data);
		}
	}
	$method = empty($post) ? 'GET' : 'POST';
	$fdata = "{$method} {$urlset['path']}{$urlset['query']} HTTP/1.1\r\n";
	$fdata .= "Host: {$urlset['host']}\r\n";
	if(function_exists('gzdecode')) {
		$fdata .= "Accept-Encoding: gzip, deflate\r\n";
	}
	$fdata .= "Connection: close\r\n";
	if (!empty($extra) && is_array($extra)) {
		foreach ($extra as $opt => $value) {
			if (!strexists($opt, 'CURLOPT_')) {
				$fdata .= "{$opt}: {$value}\r\n";
			}
		}
	}
	$body = '';
	if ($post) {
		if (is_array($post)) {
			$body = http_build_query($post);
		} else {
			$body = urlencode($post);
		}
		$fdata .= 'Content-Length: ' . strlen($body) . "\r\n\r\n{$body}";
	} else {
		$fdata .= "\r\n";
	}
	if($urlset['scheme'] == 'https') {
		$fp = fsockopen('ssl://' . $urlset['host'], $urlset['port'], $errno, $error);
	} else {
		$fp = fsockopen($urlset['host'], $urlset['port'], $errno, $error);
	}
	stream_set_blocking($fp, true);
	stream_set_timeout($fp, $timeout);
	if (!$fp) {
		return error(1, $error);
	} else {
		fwrite($fp, $fdata);
		$content = '';
		while (!feof($fp))
			$content .= fgets($fp, 512);
		fclose($fp);
		return ihttp_response_parse($content, true);
	}
}


function ihttp_response_parse($data, $chunked = false) {
	$rlt = array();
	$pos = strpos($data, "\r\n\r\n");
	$split1[0] = substr($data, 0, $pos);
	$split1[1] = substr($data, $pos + 4, strlen($data));
	
	$split2 = explode("\r\n", $split1[0], 2);
	preg_match('/^(\S+) (\S+) (\S+)$/', $split2[0], $matches);
	$rlt['code'] = $matches[2];
	$rlt['status'] = $matches[3];
	$rlt['responseline'] = $split2[0];
	$header = explode("\r\n", $split2[1]);
	$isgzip = false;
	$ischunk = false;
	foreach ($header as $v) {
		$row = explode(':', $v);
		$key = trim($row[0]);
		$value = trim($row[1]);
		if( empty($rlt['headers']) ) {
			continue;
		}
		if (is_array($rlt['headers'][$key]) ) {
			$rlt['headers'][$key][] = $value;
		} elseif (!empty($rlt['headers'][$key])) {
			$temp = $rlt['headers'][$key];
			unset($rlt['headers'][$key]);
			$rlt['headers'][$key][] = $temp;
			$rlt['headers'][$key][] = $value;
		} else {
			$rlt['headers'][$key] = $value;
		}
		if(!$isgzip && strtolower($key) == 'content-encoding' && strtolower($value) == 'gzip') {
			$isgzip = true;
		}
		if(!$ischunk && strtolower($key) == 'transfer-encoding' && strtolower($value) == 'chunked') {
			$ischunk = true;
		}
	}
	if($chunked && $ischunk) {
		$rlt['content'] = ihttp_response_parse_unchunk($split1[1]);
	} else {
		$rlt['content'] = $split1[1];
	}
	if($isgzip && function_exists('gzdecode')) {
		$rlt['content'] = gzdecode($rlt['content']);
	}

	$rlt['meta'] = $data;
	if($rlt['code'] == '100') {
		return ihttp_response_parse($rlt['content']);
	}
	return $rlt;
}

function ihttp_response_parse_unchunk($str = null) {
	if(!is_string($str) or strlen($str) < 1) {
		return false; 
	}
	$eol = "\r\n";
	$add = strlen($eol);
	$tmp = $str;
	$str = '';
	do {
		$tmp = ltrim($tmp);
		$pos = strpos($tmp, $eol);
		if($pos === false) {
			return false;
		}
		$len = hexdec(substr($tmp, 0, $pos));
		if(!is_numeric($len) or $len < 0) {
			return false;
		}
		$str .= substr($tmp, ($pos + $add), $len);
		$tmp	= substr($tmp, ($len + $pos + $add));
		$check = trim($tmp);
	} while(!empty($check));
	unset($tmp);
	return $str;
}

function strexists($string, $find) {
  return !(strpos($string, $find) === FALSE);
}

function getLocationByIp($ip){
	$loc = @file_get_contents("http://ip.taobao.com/service/getIpInfo.php?ip=".$ip);
	return json_decode($loc,true);
}

function getIP(){
   $ip = '';
   if($_SERVER['REMOTE_ADDR']){
	   $ip = $_SERVER['REMOTE_ADDR'];
   }else if(getenv("HTTP_CLIENT_IP")){
	   $ip = getenv("HTTP_CLIENT_IP");
   }else if(getenv("HTTP_X_FORWARDED_FOR")){
	   $ip = getenv("HTTP_X_FORWARDED_FOR");
   }else {
	   $ip = '';
   }
   return $ip;
}

function client_ip() {
	if (getenv("HTTP_CLIENT_IP") && strcasecmp(getenv("HTTP_CLIENT_IP"), 'unknown')){
		//如果在环境变量中定义了客户端IP，且不为'unknown'
		$ip = getenv("HTTP_CLIENT_IP");
	}else if (getenv("HTTP_X_FORWARDED_FOR") && strcasecmp(getenv("HTTP_X_FORWARDED_FOR"), 'unknown')){
		//如果在环境变量中定义了重定向之前的IP，且不为'unknown'
		$ip = getenv("HTTP_X_FORWARDED_FOR");
	}else if (getenv("HTTP_X_REAL_IP") && strcasecmp(getenv("HTTP_X_REAL_IP"), 'unknown')){
		//如果在环境变量中定义了最基本的IP，且不为'unknown'
		$ip = getenv("HTTP_X_REAL_IP");
	}else if (getenv("REMOTE_ADDR") && strcasecmp(getenv("REMOTE_ADDR"), 'unknown')){
		//如果在_SERVER变量中定义了最基本的IP，且不为'unknown'
		$ip = getenv("REMOTE_ADDR");
	}else{
		$ip = 'unknown';
	}
	return($ip);
}

/**
 * unicode转中文
 */
function unicode_to_string($str, $encoding=null) {
    return preg_replace_callback('/\\\\u([0-9a-fA-F]{4})/u', create_function('$match', 'return mb_convert_encoding(pack("H*", $match[1]), "utf-8", "UTF-16BE");'), $str);
}

function ihttp_get($url) {
	return ihttp_request($url);
}

/**
 * 功能：验证输入手机号是否合法
 * 参数：$phone   需要验证的手机号
 * 返回： bool
 * 作者：janeleozhou
 */
function is_mobile( $phone ) {
   $chars ='/^(13[0-9]|14[5|7]|15[0|1|2|3|5|6|7|8|9]|18[0|1|2|3|5|6|7|8|9]|17[0|1|2|3|5|6|7|8|9])\d\d\d\d\d\d\d\d$/';   
   if (preg_match($chars, $phone ) ) {
      return true;
   }
   return false;
}

function isMobile($mobile){
	if(preg_match("/1[3458]{1}\d{9}$/",$mobile) ){
		return true;
	}else{
		return false;
	}
}

function isEmail($email){
	$regex = '/^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/';
	if(preg_match($regex, $email)){
		return true;
	}else{
		return false;
	}
}


function ihttp_post($url, $data) {
	$headers = array('Content-Type' => 'application/x-www-form-urlencoded');
	return ihttp_request($url, $data, $headers);
}

function url($uri = '') {
	return BASE_PATH . $uri;
}

function murl($mid, $segment = '') {
	$url = 'http://' . BASE_PATH . '/mobile/{segment}?mid={mid}';
	return str_replace(array('{mid}', '{segment}'), array($mid, $segment), $url );
}

//清空cookie
function clearcookie($key) {
	//@obclean();
	ssetcookie($key, '', -86400 * 365);
}

//cookie设置
function ssetcookie($var, $value, $life = 0) {
	$cookiepre = 'gym_';
	$cookiedomain = DOMAIN;
	$cookiepath = '/';
	setcookie($cookiepre . $var, $value, $life ? (time() + $life) : 0, $cookiepath, $cookiedomain, $_SERVER['SERVER_PORT'] == 443 ? 1 : 0);
}

//取得cookie
function sgetcookie($var) {
	$cookiepre = 'gym_';
	return isset($_COOKIE[$cookiepre . $var]) ? $_COOKIE[$cookiepre . $var] : '';
}

function json_return($arr) {
	echo json_encode($arr);exit;
}

	function setpage($page, $nums, $perpage = 10, $url = '', $param = '') {
		$allpages = ceil($nums / $perpage);
		$allpages = $allpages <= 0 ? 1 : $allpages;
		if ($page > $allpages) {
			$page = $allpages;
		}
        $url = url($url);
        $arr_param = array();
		if (sizeof($_GET)) {
			foreach ($_GET as $k => $v) {
				if ($k != "page") {
					$arr_param[$k] = $v;
				}
			}
		}
		$arr_ret = array();
		if (!empty($page)) {
			$arr_param['page'] = $page;
		}
		foreach ($arr_param as $k => $v) {
		    if($k != 'page') {
		        $arr_ret[] = $k . "=" . $v;
		    }
		}
        $param = implode("&", $arr_ret);
        
		// $strpage = '<div class="ui-pagination" style="overflow:hidden; margin-bottom:0px;"><form style="float:right;">';
		$strpage = '<div class="ui-pagination" style="overflow:hidden; margin-bottom:0px;">';
		// $strpage .= '1 / ' . $allpages . '<input type="text" class="ui-input-mini" style="padding:0 6px;" name="page">';
		// $strpage .= '<button class="ui-btn"  src="' . url($url) . '?page="';
		// $strpage .= 'onclick="$(\'form\').submit;">';
		// $strpage .= '跳转</button></form>';
		$strpage .= '<ul style="float:right; margin-right:20px;">';
		if ($param != '') {
			$strpage .= "<li> <a href='" . ($url) . "?" . $param . "&page=" . (($page - 1) <= 0 ? 1 : $page - 1) . "' title='上一页'> « </a></li>";
		} else {
			$strpage .= "<li> <a href='" . ($url) . "?page=" . (($page - 1) <= 0 ? 1 : $page - 1) . "' title='上一页'> « </a></li>";
		}
		$startP = $page - 5;
		if ($startP < 1) {
			$startP = 1;
		}
		$endP = $startP + 10;
		if ($endP > $allpages) {
			$endP = $allpages;
		}
		for ($i = $startP; $i <= $endP; $i++) {
			if ($i == $page) {
				if ($param != '') {
					$strpage .= '<li class="active"><a href="' . ($url) . '?' . $param . '&page=' . $i . '">' . $i . '</a></li>';
				} else {
					$strpage .= '<li class="active"><a href="' . ($url) . '?page=' . $i . '">' . $i . '</a></li>';
				}
			} else {
				if ($param != '') {
					$strpage .= '<li><a href="' . ($url) . '?' . $param . '&page=' . $i . '">' . $i . '</a></li>';
				} else {
					$strpage .= '<li><a href="' . ($url) . '?page=' . $i . '">' . $i . '</a></li>';
				}
			}
		}
		if ($param != '') {
			$strpage .= "<li><a href='" . ($url) . "?" . $param . "&page=" . (($page + 1) >= $allpages ? $allpages : $page + 1) . "' title='下一页'> » </a></li>";
		} else {
			$strpage .= "<li><a href='" . ($url) . "?page=" . (($page + 1) >= $allpages ? $allpages : $page + 1) . "' title='下一页'> » </a></li>";
		}
		$strpage .= '</ul></div>';
		return $strpage;
	}


    	/*
	 * 20160157 edit by zdf
	 * 生成url二维码相关数据处理
	 * end
	 */
	 
//从开始时间到结束时间所有的日期
function create_days($begin, $end) {
    
    $today = date("Y-m-d");
    if (empty($begin) && !empty($end)) {
        $end = ($end > $today) ? $today : $end;
        $begin = date('Y-m-d', strtotime('-6 day', strtotime($end)));
    } elseif(!empty($begin) && empty($end)) {
        $end = $today;
    } elseif (empty($begin) && empty($end)) {
        $begin = date('Y-m-d', strtotime('-6 day', time()));
        $end = $today;
    }

    $begin = strtotime($begin);
    $end   = strtotime($end);
    $result = array();
    if (empty($begin) || empty($end)) return $result;
    if ($end <= $begin) {
        $result[] = date("Y-m-d", $begin);
    }
    $current = $begin;
    while ($current <= $end) {

        $result[] = date("Y-m-d", $current);
        $current = strtotime("+1 day", $current);
    }
    return $result;
}

function ch_urlencode($data) {
   if (is_array($data) || is_object($data)) {
       foreach ($data as $k => $v) {
           if (is_scalar($v)) {
               if (is_array($data)) {
                   $data[$k] = urlencode($v);
               } else if (is_object($data)) {
                   $data->$k = urlencode($v);
               }
           } else if (is_array($data)) {
               $data[$k] = ch_urlencode($v); //递归调用该函数
           } else if (is_object($data)) {
               $data->$k = ch_urlencode($v);
           }
       }
   }
   return $data;
}

function ch_json_encode($data) {
   
   
   $ret = ch_urlencode($data);
   $ret = json_encode($ret);
   return urldecode($ret);
}



	/**
	* 用于将params中的url数组组装url字符串
	* 
	* @param array $array_params_url url数组
	* @param array $parent_name url中的key值
	* @param array $except 需要跳过的key
	* @author markguo
	* @return string 组装后的url
	*/
	function convert_urlArray_to_urlString($array_params_url, $parent_name = '', $except = array()) {
		if (!isset($array_params_url) || empty($array_params_url)) {
			return false;
		}
		$url = '';
		foreach ($array_params_url as $key => $params) {
			if (in_array($key,$except))	{
				continue;
			}
			if ('url' === $key) {
				$url .= $params;
				if (count($array_params_url)>1){
					$url .= "?";
				}
			} else {
				$key = urlencode($key);
				if (is_array($params)) {
					$next_parent_name = (!empty($parent_name))?$parent_name . '[' . $key . ']' : $key;
					$url .= convert_urlArray_to_urlString($params, $next_parent_name);
				} else {
					$params = urlencode($params);
					$url .= (!empty($parent_name)) ? $parent_name . '[' . $key . ']=' . $params . '&' : "$key=$params&";
				}
			}
		}
		return $url;
	}

/*
* empty() 返回 FALSE。换句话说，""、0、"0"、NULL、FALSE、array()、var $var; 以及没有任何属性的对象都将被认为是空的，
* tempty()则不认为 0、"0"两种情况为空，其它与empty相同
* @author frankychen
* @access public
*/
function tempty($var) {
	if ($var === 0 || $var === '0') {
		return false;
	} else {
		return empty($var);
	}
}

function cut_str_ch($string, $sublen = 70, $start = 0, $code = 'UTF-8', $sufix=true) {
	if($code == 'UTF-8'){
		$sub_string = '';	//用作返回字符串
		$strlen_en = 0;		//英文字符的长度
		$pa = "/[\x01-\x7f]|[\xc2-\xdf][\x80-\xbf]|\xe0[\xa0-\xbf][\x80-\xbf]|[\xe1-\xef][\x80-\xbf][\x80-\xbf]|\xf0[\x90-\xbf][\x80-\xbf][\x80-\xbf]|[\xf1-\xf7][\x80-\xbf][\x80-\xbf][\x80-\xbf]/";
				//中文字符的正则表达式
		
		preg_match_all($pa, $string, $t_string);	//在 $string 中搜索所有与 $pa 给出的正则表达式匹配的内容并将结果放到 $t_string中
		
		$cut_flag = false;//标记是否截断，修复当$string长度恰好等于$sublen还会添加“...”的bug

		//取得中英文字符串长度,字母长度为1,中文字长度记为2
		foreach($t_string[0] as $currentChar) {
			if($cut_flag){
				//进入这个if说明同时满足两个条件：
				//1是字符串还没读完
				//2是已读取的字符串长度已经达到上限
				return ($sufix) ? $sub_string.'...' : $sub_string;
			}
			$sub_string .= "$currentChar";
			if  (ord($currentChar) < 128) {
				$strlen_en ++;
			} else {
				$strlen_en += 2;
			}
			if($strlen_en > $sublen - 1){
				$cut_flag = true;
			}
		}
		return $sub_string;
	}else {
		//非utf8编码
		$start = $start * 2;
		$sublen = $sublen * 2;
		$strlen = strlen($string);
		$tmpstr = '';
		for($i=0; $i<$strlen; $i++)	{
			if($i >= $start && $i < ($start + $sublen)) {
				if(ord(substr($string, $i, 1)) > 129){
					$tmpstr .= substr($string, $i, 2);
				}else {
					$tmpstr .= substr($string, $i, 1);
				}
			} 
			if(ord(substr($string, $i, 1)) > 129){
				$i++;
			}
		}
		if(strlen($tmpstr) < $strlen ){ 
			$tmpstr.= "...";
		}
		return $tmpstr;
	}
}

/**
 * 随机生成16位字符串
 * @return string 生成的字符串
 */
function random_str() {

	$str = "";
	$str_pol = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz";
	$max = strlen($str_pol) - 1;
	for ($i = 0; $i < 16; $i++) {
		$str .= $str_pol[mt_rand(0, $max)];
	}
	return $str;
}

/**
* 提供方法支持菜单多级的情况,和面包屑
* 
* 得到当前位置位置在的菜单层级数量， 例如 某个链接为2级菜单 那么层级数量就为2
*
*/
function get_current_memu_level($current_location ,& $locations) {
	$level = 1;
	while(!empty($locations[$current_location]['parent'])) {
		$current_location = $locations[$current_location]['parent'];
		$level++;
	}
	return $level;
}

/**
* 提供方法支持菜单多级的情况,和面包屑
* 以现在位置为标准得到，某一层级上的menu信息
*/
function get_memu_by_level($level, $current_location, $locations){
	$total_level = get_current_memu_level($current_location, $locations);
	$temp_level = 1;
	while(!empty($locations[$current_location])) {
		if(($total_level-$temp_level) == $level) {
			return array($current_location=>$locations[$current_location]);
		}
		$current_location = $locations[$current_location]['parent'];
		$temp_level++;
	}
	return array();
}


	function utf8_strlen($string) {
		return iconv_strlen($string, 'UTF-8');
	}

	function utf8_strpos($string, $needle, $offset = 0) {
		return iconv_strpos($string, $needle, $offset, 'UTF-8');
	}

	function utf8_strrpos($string, $needle) {
		return iconv_strrpos($string, $needle, 'UTF-8');
	}

	function utf8_substr($string, $offset, $length = null) {
		if ($length === null) {
			return iconv_substr($string, $offset, utf8_strlen($string), 'UTF-8');
		} else {
			return iconv_substr($string, $offset, $length, 'UTF-8');
		}
	}

	function utf8_strtolower($string) {
		static $upper_to_lower;

		if ($upper_to_lower == null) {
			$upper_to_lower = array(
				0x0041 => 0x0061,
				0x03A6 => 0x03C6,
				0x0162 => 0x0163,
				0x00C5 => 0x00E5,
				0x0042 => 0x0062,
				0x0139 => 0x013A,
				0x00C1 => 0x00E1,
				0x0141 => 0x0142,
				0x038E => 0x03CD,
				0x0100 => 0x0101,
				0x0490 => 0x0491,
				0x0394 => 0x03B4,
				0x015A => 0x015B,
				0x0044 => 0x0064,
				0x0393 => 0x03B3,
				0x00D4 => 0x00F4,
				0x042A => 0x044A,
				0x0419 => 0x0439,
				0x0112 => 0x0113,
				0x041C => 0x043C,
				0x015E => 0x015F,
				0x0143 => 0x0144,
				0x00CE => 0x00EE,
				0x040E => 0x045E,
				0x042F => 0x044F,
				0x039A => 0x03BA,
				0x0154 => 0x0155,
				0x0049 => 0x0069,
				0x0053 => 0x0073,
				0x1E1E => 0x1E1F,
				0x0134 => 0x0135,
				0x0427 => 0x0447,
				0x03A0 => 0x03C0,
				0x0418 => 0x0438,
				0x00D3 => 0x00F3,
				0x0420 => 0x0440,
				0x0404 => 0x0454,
				0x0415 => 0x0435,
				0x0429 => 0x0449,
				0x014A => 0x014B,
				0x0411 => 0x0431,
				0x0409 => 0x0459,
				0x1E02 => 0x1E03,
				0x00D6 => 0x00F6,
				0x00D9 => 0x00F9,
				0x004E => 0x006E,
				0x0401 => 0x0451,
				0x03A4 => 0x03C4,
				0x0423 => 0x0443,
				0x015C => 0x015D,
				0x0403 => 0x0453,
				0x03A8 => 0x03C8,
				0x0158 => 0x0159,
				0x0047 => 0x0067,
				0x00C4 => 0x00E4,
				0x0386 => 0x03AC,
				0x0389 => 0x03AE,
				0x0166 => 0x0167,
				0x039E => 0x03BE,
				0x0164 => 0x0165,
				0x0116 => 0x0117,
				0x0108 => 0x0109,
				0x0056 => 0x0076,
				0x00DE => 0x00FE,
				0x0156 => 0x0157,
				0x00DA => 0x00FA,
				0x1E60 => 0x1E61,
				0x1E82 => 0x1E83,
				0x00C2 => 0x00E2,
				0x0118 => 0x0119,
				0x0145 => 0x0146,
				0x0050 => 0x0070,
				0x0150 => 0x0151,
				0x042E => 0x044E,
				0x0128 => 0x0129,
				0x03A7 => 0x03C7,
				0x013D => 0x013E,
				0x0422 => 0x0442,
				0x005A => 0x007A,
				0x0428 => 0x0448,
				0x03A1 => 0x03C1,
				0x1E80 => 0x1E81,
				0x016C => 0x016D,
				0x00D5 => 0x00F5,
				0x0055 => 0x0075,
				0x0176 => 0x0177,
				0x00DC => 0x00FC,
				0x1E56 => 0x1E57,
				0x03A3 => 0x03C3,
				0x041A => 0x043A,
				0x004D => 0x006D,
				0x016A => 0x016B,
				0x0170 => 0x0171,
				0x0424 => 0x0444,
				0x00CC => 0x00EC,
				0x0168 => 0x0169,
				0x039F => 0x03BF,
				0x004B => 0x006B,
				0x00D2 => 0x00F2,
				0x00C0 => 0x00E0,
				0x0414 => 0x0434,
				0x03A9 => 0x03C9,
				0x1E6A => 0x1E6B,
				0x00C3 => 0x00E3,
				0x042D => 0x044D,
				0x0416 => 0x0436,
				0x01A0 => 0x01A1,
				0x010C => 0x010D,
				0x011C => 0x011D,
				0x00D0 => 0x00F0,
				0x013B => 0x013C,
				0x040F => 0x045F,
				0x040A => 0x045A,
				0x00C8 => 0x00E8,
				0x03A5 => 0x03C5,
				0x0046 => 0x0066,
				0x00DD => 0x00FD,
				0x0043 => 0x0063,
				0x021A => 0x021B,
				0x00CA => 0x00EA,
				0x0399 => 0x03B9,
				0x0179 => 0x017A,
				0x00CF => 0x00EF,
				0x01AF => 0x01B0,
				0x0045 => 0x0065,
				0x039B => 0x03BB,
				0x0398 => 0x03B8,
				0x039C => 0x03BC,
				0x040C => 0x045C,
				0x041F => 0x043F,
				0x042C => 0x044C,
				0x00DE => 0x00FE,
				0x00D0 => 0x00F0,
				0x1EF2 => 0x1EF3,
				0x0048 => 0x0068,
				0x00CB => 0x00EB,
				0x0110 => 0x0111,
				0x0413 => 0x0433,
				0x012E => 0x012F,
				0x00C6 => 0x00E6,
				0x0058 => 0x0078,
				0x0160 => 0x0161,
				0x016E => 0x016F,
				0x0391 => 0x03B1,
				0x0407 => 0x0457,
				0x0172 => 0x0173,
				0x0178 => 0x00FF,
				0x004F => 0x006F,
				0x041B => 0x043B,
				0x0395 => 0x03B5,
				0x0425 => 0x0445,
				0x0120 => 0x0121,
				0x017D => 0x017E,
				0x017B => 0x017C,
				0x0396 => 0x03B6,
				0x0392 => 0x03B2,
				0x0388 => 0x03AD,
				0x1E84 => 0x1E85,
				0x0174 => 0x0175,
				0x0051 => 0x0071,
				0x0417 => 0x0437,
				0x1E0A => 0x1E0B,
				0x0147 => 0x0148,
				0x0104 => 0x0105,
				0x0408 => 0x0458,
				0x014C => 0x014D,
				0x00CD => 0x00ED,
				0x0059 => 0x0079,
				0x010A => 0x010B,
				0x038F => 0x03CE,
				0x0052 => 0x0072,
				0x0410 => 0x0430,
				0x0405 => 0x0455,
				0x0402 => 0x0452,
				0x0126 => 0x0127,
				0x0136 => 0x0137,
				0x012A => 0x012B,
				0x038A => 0x03AF,
				0x042B => 0x044B,
				0x004C => 0x006C,
				0x0397 => 0x03B7,
				0x0124 => 0x0125,
				0x0218 => 0x0219,
				0x00DB => 0x00FB,
				0x011E => 0x011F,
				0x041E => 0x043E,
				0x1E40 => 0x1E41,
				0x039D => 0x03BD,
				0x0106 => 0x0107,
				0x03AB => 0x03CB,
				0x0426 => 0x0446,
				0x00DE => 0x00FE,
				0x00C7 => 0x00E7,
				0x03AA => 0x03CA,
				0x0421 => 0x0441,
				0x0412 => 0x0432,
				0x010E => 0x010F,
				0x00D8 => 0x00F8,
				0x0057 => 0x0077,
				0x011A => 0x011B,
				0x0054 => 0x0074,
				0x004A => 0x006A,
				0x040B => 0x045B,
				0x0406 => 0x0456,
				0x0102 => 0x0103,
				0x039B => 0x03BB,
				0x00D1 => 0x00F1,
				0x041D => 0x043D,
				0x038C => 0x03CC,
				0x00C9 => 0x00E9,
				0x00D0 => 0x00F0,
				0x0407 => 0x0457,
				0x0122 => 0x0123
			);
		}

		$unicode = utf8_to_unicode($string);

		if (!$unicode) {
			return false;
		}

		for ($i = 0; $i < count($unicode); $i++) {
			if (isset($upper_to_lower[$unicode[$i]])) {
				$unicode[$i] = $upper_to_lower[$unicode[$i]];
			}
		}

		return unicode_to_utf8($unicode);
	}

	function utf8_strtoupper($string) {
		static $lower_to_upper;

		if ($lower_to_upper == null) {
			$lower_to_upper = array(
				0x0061 => 0x0041,
				0x03C6 => 0x03A6,
				0x0163 => 0x0162,
				0x00E5 => 0x00C5,
				0x0062 => 0x0042,
				0x013A => 0x0139,
				0x00E1 => 0x00C1,
				0x0142 => 0x0141,
				0x03CD => 0x038E,
				0x0101 => 0x0100,
				0x0491 => 0x0490,
				0x03B4 => 0x0394,
				0x015B => 0x015A,
				0x0064 => 0x0044,
				0x03B3 => 0x0393,
				0x00F4 => 0x00D4,
				0x044A => 0x042A,
				0x0439 => 0x0419,
				0x0113 => 0x0112,
				0x043C => 0x041C,
				0x015F => 0x015E,
				0x0144 => 0x0143,
				0x00EE => 0x00CE,
				0x045E => 0x040E,
				0x044F => 0x042F,
				0x03BA => 0x039A,
				0x0155 => 0x0154,
				0x0069 => 0x0049,
				0x0073 => 0x0053,
				0x1E1F => 0x1E1E,
				0x0135 => 0x0134,
				0x0447 => 0x0427,
				0x03C0 => 0x03A0,
				0x0438 => 0x0418,
				0x00F3 => 0x00D3,
				0x0440 => 0x0420,
				0x0454 => 0x0404,
				0x0435 => 0x0415,
				0x0449 => 0x0429,
				0x014B => 0x014A,
				0x0431 => 0x0411,
				0x0459 => 0x0409,
				0x1E03 => 0x1E02,
				0x00F6 => 0x00D6,
				0x00F9 => 0x00D9,
				0x006E => 0x004E,
				0x0451 => 0x0401,
				0x03C4 => 0x03A4,
				0x0443 => 0x0423,
				0x015D => 0x015C,
				0x0453 => 0x0403,
				0x03C8 => 0x03A8,
				0x0159 => 0x0158,
				0x0067 => 0x0047,
				0x00E4 => 0x00C4,
				0x03AC => 0x0386,
				0x03AE => 0x0389,
				0x0167 => 0x0166,
				0x03BE => 0x039E,
				0x0165 => 0x0164,
				0x0117 => 0x0116,
				0x0109 => 0x0108,
				0x0076 => 0x0056,
				0x00FE => 0x00DE,
				0x0157 => 0x0156,
				0x00FA => 0x00DA,
				0x1E61 => 0x1E60,
				0x1E83 => 0x1E82,
				0x00E2 => 0x00C2,
				0x0119 => 0x0118,
				0x0146 => 0x0145,
				0x0070 => 0x0050,
				0x0151 => 0x0150,
				0x044E => 0x042E,
				0x0129 => 0x0128,
				0x03C7 => 0x03A7,
				0x013E => 0x013D,
				0x0442 => 0x0422,
				0x007A => 0x005A,
				0x0448 => 0x0428,
				0x03C1 => 0x03A1,
				0x1E81 => 0x1E80,
				0x016D => 0x016C,
				0x00F5 => 0x00D5,
				0x0075 => 0x0055,
				0x0177 => 0x0176,
				0x00FC => 0x00DC,
				0x1E57 => 0x1E56,
				0x03C3 => 0x03A3,
				0x043A => 0x041A,
				0x006D => 0x004D,
				0x016B => 0x016A,
				0x0171 => 0x0170,
				0x0444 => 0x0424,
				0x00EC => 0x00CC,
				0x0169 => 0x0168,
				0x03BF => 0x039F,
				0x006B => 0x004B,
				0x00F2 => 0x00D2,
				0x00E0 => 0x00C0,
				0x0434 => 0x0414,
				0x03C9 => 0x03A9,
				0x1E6B => 0x1E6A,
				0x00E3 => 0x00C3,
				0x044D => 0x042D,
				0x0436 => 0x0416,
				0x01A1 => 0x01A0,
				0x010D => 0x010C,
				0x011D => 0x011C,
				0x00F0 => 0x00D0,
				0x013C => 0x013B,
				0x045F => 0x040F,
				0x045A => 0x040A,
				0x00E8 => 0x00C8,
				0x03C5 => 0x03A5,
				0x0066 => 0x0046,
				0x00FD => 0x00DD,
				0x0063 => 0x0043,
				0x021B => 0x021A,
				0x00EA => 0x00CA,
				0x03B9 => 0x0399,
				0x017A => 0x0179,
				0x00EF => 0x00CF,
				0x01B0 => 0x01AF,
				0x0065 => 0x0045,
				0x03BB => 0x039B,
				0x03B8 => 0x0398,
				0x03BC => 0x039C,
				0x045C => 0x040C,
				0x043F => 0x041F,
				0x044C => 0x042C,
				0x00FE => 0x00DE,
				0x00F0 => 0x00D0,
				0x1EF3 => 0x1EF2,
				0x0068 => 0x0048,
				0x00EB => 0x00CB,
				0x0111 => 0x0110,
				0x0433 => 0x0413,
				0x012F => 0x012E,
				0x00E6 => 0x00C6,
				0x0078 => 0x0058,
				0x0161 => 0x0160,
				0x016F => 0x016E,
				0x03B1 => 0x0391,
				0x0457 => 0x0407,
				0x0173 => 0x0172,
				0x00FF => 0x0178,
				0x006F => 0x004F,
				0x043B => 0x041B,
				0x03B5 => 0x0395,
				0x0445 => 0x0425,
				0x0121 => 0x0120,
				0x017E => 0x017D,
				0x017C => 0x017B,
				0x03B6 => 0x0396,
				0x03B2 => 0x0392,
				0x03AD => 0x0388,
				0x1E85 => 0x1E84,
				0x0175 => 0x0174,
				0x0071 => 0x0051,
				0x0437 => 0x0417,
				0x1E0B => 0x1E0A,
				0x0148 => 0x0147,
				0x0105 => 0x0104,
				0x0458 => 0x0408,
				0x014D => 0x014C,
				0x00ED => 0x00CD,
				0x0079 => 0x0059,
				0x010B => 0x010A,
				0x03CE => 0x038F,
				0x0072 => 0x0052,
				0x0430 => 0x0410,
				0x0455 => 0x0405,
				0x0452 => 0x0402,
				0x0127 => 0x0126,
				0x0137 => 0x0136,
				0x012B => 0x012A,
				0x03AF => 0x038A,
				0x044B => 0x042B,
				0x006C => 0x004C,
				0x03B7 => 0x0397,
				0x0125 => 0x0124,
				0x0219 => 0x0218,
				0x00FB => 0x00DB,
				0x011F => 0x011E,
				0x043E => 0x041E,
				0x1E41 => 0x1E40,
				0x03BD => 0x039D,
				0x0107 => 0x0106,
				0x03CB => 0x03AB,
				0x0446 => 0x0426,
				0x00FE => 0x00DE,
				0x00E7 => 0x00C7,
				0x03CA => 0x03AA,
				0x0441 => 0x0421,
				0x0432 => 0x0412,
				0x010F => 0x010E,
				0x00F8 => 0x00D8,
				0x0077 => 0x0057,
				0x011B => 0x011A,
				0x0074 => 0x0054,
				0x006A => 0x004A,
				0x045B => 0x040B,
				0x0456 => 0x0406,
				0x0103 => 0x0102,
				0x03BB => 0x039B,
				0x00F1 => 0x00D1,
				0x043D => 0x041D,
				0x03CC => 0x038C,
				0x00E9 => 0x00C9,
				0x00F0 => 0x00D0,
				0x0457 => 0x0407,
				0x0123 => 0x0122
			);
		}

		$unicode = utf8_to_unicode($string);

		if (!$unicode) {
			return false;
		}

		for ($i = 0; $i < count($unicode); $i++) {
			if (isset($lower_to_upper[$unicode[$i]])) {
				$unicode[$i] = $lower_to_upper[$unicode[$i]];
			}
		}

		return unicode_to_utf8($unicode);
	}

	function utf8_to_unicode($string) {
		$unicode = array();

		for ($i = 0; $i < strlen($string); $i++) {
			$chr = ord($string[$i]);

			if ($chr >= 0 && $chr <= 127) {
				$unicode[] = (ord($string[$i]) * pow(64, 0));
			}

			if ($chr >= 192 && $chr <= 223) {
				$unicode[] = ((ord($string[$i]) - 192) * pow(64, 1) + (ord($string[$i + 1]) - 128) * pow(64, 0));
			}

			if ($chr >= 224 && $chr <= 239) {
				$unicode[] = ((ord($string[$i]) - 224) * pow(64, 2) + (ord($string[$i + 1]) - 128) * pow(64, 1) + (ord($string[$i + 2]) - 128) * pow(64, 0));
			}

			if ($chr >= 240 && $chr <= 247) {
				$unicode[] = ((ord($string[$i]) - 240) * pow(64, 3) + (ord($string[$i + 1]) - 128) * pow(64, 2) + (ord($string[$i + 2]) - 128) * pow(64, 1) + (ord($string[$i + 3]) - 128) * pow(64, 0));
			}

			if ($chr >= 248 && $chr <= 251) {
				$unicode[] = ((ord($string[$i]) - 248) * pow(64, 4) + (ord($string[$i + 1]) - 128) * pow(64, 3) + (ord($string[$i + 2]) - 128) * pow(64, 2) + (ord($string[$i + 3]) - 128) * pow(64, 1) + (ord($string[$i + 4]) - 128) * pow(64, 0));
			}

			if ($chr == 252 || $chr == 253) {
				$unicode[] = ((ord($string[$i]) - 252) * pow(64, 5) + (ord($string[$i + 1]) - 128) * pow(64, 4) + (ord($string[$i + 2]) - 128) * pow(64, 3) + (ord($string[$i + 3]) - 128) * pow(64, 2) + (ord($string[$i + 4]) - 128) * pow(64, 1) + (ord($string[$i + 5]) - 128) * pow(64, 0));
			}
		}

		return $unicode;
	}

	function unicode_to_utf8($unicode) {
		$string = '';

		for ($i = 0; $i < count($unicode); $i++) {
			if ($unicode[$i] < 128) {
				$string .= chr($unicode[$i]);
			}

			if ($unicode[$i] >= 128 && $unicode[$i] <= 2047) {
				$string .= chr(($unicode[$i] / 64) + 192) . chr(($unicode[$i] % 64) + 128);
			}

			if ($unicode[$i] >= 2048 && $unicode[$i] <= 65535) {
				$string .= chr(($unicode[$i] / 4096) + 224) . chr(128 + (($unicode[$i] / 64) % 64)) . chr(($unicode[$i] % 64) + 128);
			}

			if ($unicode[$i] >= 65536 && $unicode[$i] <= 2097151) {
				$string .= chr(($unicode[$i] / 262144) + 240) . chr((($unicode[$i] / 4096) % 64) + 128) . chr((($unicode[$i] / 64) % 64) + 128) . chr(($unicode[$i] % 64) + 128);
			}

			if ($unicode[$i] >= 2097152 && $unicode[$i] <= 67108863) {
				$string  .= chr(($unicode[$i] / 16777216) + 248) . chr((($unicode[$i] / 262144) % 64) + 128) . chr((($unicode[$i] / 4096) % 64) + 128) . chr((($unicode[$i] / 64) % 64) + 128) . chr(($unicode[$i] % 64) + 128);
			}

			if ($unicode[$i] >= 67108864 && $unicode[$i] <= 2147483647) {
				$string .= chr(($unicode[$i] / 1073741824) + 252) . chr((($unicode[$i] / 16777216) % 64) + 128) . chr((($unicode[$i] / 262144) % 64) + 128) . chr(128 + (($unicode[$i] / 4096) % 64)) . chr((($unicode[$i] / 64) % 64) + 128) . chr(($unicode[$i] % 64) + 128);
			}
		}

		return $string;
	}

function token($length = 32) {
	// Create random token
	$string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	
	$max = strlen($string) - 1;
	
	$token = '';
	
	for ($i = 0; $i < $length; $i++) {
		$token .= $string[mt_rand(0, $max)];
	}	
	
	return $token;
}