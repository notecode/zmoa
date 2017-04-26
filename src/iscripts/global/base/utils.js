// Javascript File
// AUTHOR:   SongErwei
// FILE:     utils.js
// ROLE:     some common basic utilities 
// CREATED:  2015-12-17 10:14:02

var config = {
	supplier: 's',
	client: 'c'
};

function tlog(text) {
    debug ? debug.log(text) : console.log(text);
    // console.log(text);
}

function todo(text) {
	tlog("@@todo: " + text);	
}

function olog(pre, obj) {
	var t = pre + JSON.stringify(obj);
	var max = 500;
	if (t.length < max) {
		tlog(t)
	} else {
		tlog(t.substring(0, max) + ' ... [total: ' + t.length + ']')
	}
}

function assert(expr) {
	assert1(expr, "I'm warning you!!!");
}

function assert1(expr, msg) {
	console.assert(expr, msg);
}

function being(obj) {
	return (obj != undefined)
}

// if it is not empty, can be used for array, string, etc, has  .length
function has(s) {
	return (being(s) && s.length > 0)
}


/* get query string */
function qs(name) {
	var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
	return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}

/*
 * 我们约定：若有N部分取后面的N-1部分，例：
 * 		www.xxtao.com  取：xxtao.com
 *      www.some.xxtao.com  取：some.xxtao.com
 */
function get_top_domain_name() {
	var host = location.hostname;
	return host.substring(host.indexOf('.') + 1);
}

/* 
gulp会把把下面的return值替换为如'https://www.xxtao.com:80'的值
*/
function make_api_origin() {
 	return 'gulp_make_api_origin';
}

function is_www(){
	var host_name = location.hostname;
	if(host_name.split('.')[0].contains('m')){
		return false;
	}else{
		return true;
	}
}
function is_on_mobile() {
	return !is_www();
}

function is_wph() {
    return (location.hostname.indexOf('wanpinghui.com') != -1);
}

function as_int(s) {
	return parseInt(s);
}

/* 仅保留整数部分 */
function int_only(num) {
    return Math.floor(num);
}

function all_hanzi(t) {
	// ^表示NOT
	var re = /[^\u4e00-\u9fa5]/;
	return !re.test(t); 
}

// cookie 1-------------

function get_cookies() {
	var pairs = document.cookie.split(";");
	var cookies = {};
	for (var i = 0; i < pairs.length; i++){
		var pair = pairs[i].split("=");
		cookies[pair[0]] = unescape(pair[1]);
	}

	return cookies;
}

function get_cookie(name) {
	return get_cookies()[name];
}

function has_cookie(name) {
	var val = get_cookie(name);
	return (val !== undefined && val.length > 0);
}


// cookie 2-------------
//
// Original JavaScript code by Chirp Internet: www.chirp.com.au
// Please acknowledge use of this code by including this header.

function getCookie(name)
{
	var re = new RegExp(name + "=([^;]+)");
	var value = re.exec(document.cookie);
	return (value != null) ? unescape(value[1]) : null;
}
function setCookie(c_name,value,expiredays)
{
	var exdate=new Date();
    exdate.setDate(exdate.getDate()+expiredays);
    document.cookie=c_name+ "=" +escape(value)+';path=/;'+
                ((expiredays==null) ? "" : "expires="+exdate.toGMTString());

}
function hasCookie(name) {
	var val = getCookie(name);
	return (val !== null); 
}


function is_phone_valid(phone) {
	//var reg = /^0?1[3|4|5|7|8][0-9]\d{8}$/;
	var reg = /^1\d{10}$/; // 放宽手机号的检验，只要以1打头的11位数字即可
	return reg.test(phone);
}

assert(is_phone_valid('13712345678'));
assert(is_phone_valid('10123456789'));
assert(is_phone_valid('10000000000'));
assert(!is_phone_valid('20000000000'));
assert(!is_phone_valid('101234567891'));
assert(!is_phone_valid('010123456789'));
assert(!is_phone_valid('10000000000a'));
assert(!is_phone_valid('+10123456789'));

/* wph specific */

function role_to_num(role) {
	return (config.supplier == role) ? "100" : "1";
}

function num_to_role(num) {
	return ("100" == num) ? config.supplier : config.client; 
}


var cookie_utils = {
	// 登录了？（不管身份）
	is_loggedin: function() {
		//return has_cookie('_identity');
		return hasCookie('_identity');
	},

	// 未登录？（未登录即为游客）
	is_guest: function() {
		return !this.is_loggedin();
	},

	// 登录且是普通用户？
	is_client: function() {
		return (this.is_loggedin() && (num_to_role(getCookie('user_type')) == config.client));
	},
	
	// 登录且是工程商？
	is_supplier: function() {
		return (this.is_loggedin() && (num_to_role(getCookie('user_type')) == config.supplier));
	},

	// （如果登录了），返回身份('100' or '1')
	logged_role: function() {
		assert(this.is_loggedin())
		return (this.is_supplier() ? config.supplier : config.client)	
	}
};

function safe_func(func) {
	if (func != undefined) {
		return func
	} else {
		return function(x) {}
	}
}
//
function can_click_now(cla){
	if($(cla).attr("work")==undefined){
		$(cla).attr("work","yes");
		tlog("can`t click for 5s")
		setTimeout(function(){
			$(cla).removeAttr("work");
			tlog("can click")
		},3000)
		return true;
	}else{
		return false;
	}

}
$("input").focus(function(){
	$(this).parent().css("border-bottom-color","#4785f9")
})
$("input").blur(function(){
	$(this).parent().css("border-bottom-color","#efefef")
})
// 有时，只能用px值。故，需自己将rem转换为px
function rem_to_px(rem) {                                   
      return rem * parseFloat($('html').css('font-size'));
}
function is_supplier_map(){
	return location.pathname.contains('maintenance');
}


// 
// 标准规则：
// 0. 加上逗号分隔符(三位一分隔)
// 1. 最多保留两位小数(即, 可出现1, 1.3, 1.32型; 不应出现1.00, 1.10型)
function std_num_format(num) {
	num += '';
	var parts = num.split('.');
	var float_cnt = 0;
	if (parts.length > 1) {
		var deci = parts[1];
		float_cnt = (parseInt(deci) > 0) ? deci.length : 0;
	}

	var pureRes = number_format(num, Math.min(2, float_cnt));
    var ptIndex = pureRes.indexOf('.');
    if (ptIndex === -1) {
        // 整数
        return pureRes;
    } else {
        // 下面这些处理，是为了死也要保证小数点后末尾不能为0。即使这是不科学的四舍五入，产品及相关人员也认为这比科学要更好。好吧，我妥协
        var num = parseInt(pureRes.substr(ptIndex + 1));
        if (0 === num) {
            // 123.00型
            return pureRes.substr(0, ptIndex);
        } else if (0 === num % 10) {
            // 123.40型
            return pureRes.substr(0, pureRes.length - 1);
        } else {
            return pureRes;
        }
    }
}

// 多么伟大的单元测试!
assert('100' === std_num_format('100'));
assert('100' === std_num_format('100.0'));
assert('100' === std_num_format('100.00'));
assert('100' === std_num_format(100));
assert('100' === std_num_format(100.0));
assert('100' === std_num_format(100.00));

assert('100.1' === std_num_format(100.1));
assert('100.6' === std_num_format(100.6));
assert('100.12' === std_num_format(100.12));
assert('100.16' === std_num_format(100.16));
assert('100.12' === std_num_format(100.124));
assert('100.13' === std_num_format(100.125));
assert('10,000.13' === std_num_format(10000.125));

assert('100.01' === std_num_format(100.009));
assert('100' === std_num_format(100.0009));
assert('100' === std_num_format(99.9999));
assert('100' === std_num_format('99.9999'));
assert('99.1' === std_num_format('99.099'));
assert('1,099.1' === std_num_format('1099.099'));

// 标准金额（最多保留2位小数）
// 暂和std_num_format无差别，名字取成不一样的，方便未来扩展
function std_money_format(money) {
	return std_num_format(money);
}

// 标准预算（以万或者千为单位），仅保留整数(michael认为，如此才合理 2017/1/14对bug会议决定)
function std_budget_format(money) {
    assert(money != undefined);

    var num = parseFloat(money);
    if (num < 100) {
		return {"budget": number_format(num),"unit":""};
    } else if (Math.round(num / 100) < 10) {
		return {"budget": number_format(num / 100),"unit":"百"}
    } else if (Math.round(num / 1000) < 10) {
		return {"budget": number_format(num / 1000),"unit":"千"}
    } else {
		return {"budget": number_format(num / 10000),"unit":"万"}
    }
}

(function() {
    var res; 
    res = std_budget_format('999999');
    assert('100' === res.budget);
    assert('万' === res.unit);
    
    res = std_budget_format('9999');
    assert('1' === res.budget);
    assert('万' === res.unit);

    res = std_budget_format('9500');
    assert('1' === res.budget);
    assert('万' === res.unit);

    res = std_budget_format('9499');
    assert('9' === res.budget);
    assert('千' === res.unit);

    res = std_budget_format('4500');
    assert('5' === res.budget);
    assert('千' === res.unit);

    res = std_budget_format('999');
    assert('1' === res.budget);
    assert('千' === res.unit);

    res = std_budget_format('950');
    assert('1' === res.budget);
    assert('千' === res.unit);

    res = std_budget_format('949');
    assert('9' === res.budget);
    assert('百' === res.unit);

    res = std_budget_format('99');
    assert('99' === res.budget);
    assert('' === res.unit);

    res = std_budget_format('10.99');
    assert('11' === res.budget);
    assert('' === res.unit);

    res = std_budget_format('1');
    assert('1' === res.budget);
    assert('' === res.unit);
})();

// 检查IE版本; 如果非IE，返回false
// http://stackoverflow.com/questions/19999388/check-if-user-is-using-ie-with-jquery
function detectIE() {
  var ua = window.navigator.userAgent;

  var msie = ua.indexOf('MSIE ');
  if (msie > 0) {
	  // IE 10 or older => return version number
	  return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
  }

  var trident = ua.indexOf('Trident/');
  if (trident > 0) {
	  // IE 11 => return version number
	  var rv = ua.indexOf('rv:');
	  return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
  }

  var edge = ua.indexOf('Edge/');
  if (edge > 0) {
	  // IE 12 => return version number
	  return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
  }

  // other browser
  return false;
}

/*   功能: 计算某个时间与现在的间隔, 并返回文本
*    参数: 传入的时间格式为 "1479475441" 标准
*    说明: 已经和服务端约定好: _init/_uptm 等以后均须以"1479475441"格式返回。曾经的"2016-11-18T21:24:01"格式，恕前端不支持
*/
function count_date_gap(startTime) {
	startTime = startTime + '';
  assert(-1 == startTime.indexOf('-'));

	var text;
	// var stime = new Date(startTime).getTime();//转换
	var stime = startTime * 1000;
	var date = new Date().getTime();
	var gapMin = parseInt((date - stime)/1000/60);
	if(gapMin <= 0){
		//防止偶尔出现的js取时间不准确
		gapMin = 1;
	}
	var gapHour = parseInt((date - stime)/1000/60/60);

	if(gapHour <= 24){
		text = gapHour + '小时前';
		if(gapMin < 60){
			text = gapMin + '分钟前';
		}
	}else if(gapHour <= 24*30){
		gapHour = parseInt(gapHour/24);
		text = gapHour + '天前'
	}else if(gapHour <= 24*30*12){
		gapHour = parseInt(gapHour/24/30);
		text = gapHour + '个月前'
	}else{
		//防止意外情况，暂时如此处理
		text = '刚刚'
	}
	return text;
}
function to_count_data_gap(time){
	time = time * 1000;
	var date = new Date(time);
	Y = date.getFullYear() + '-';
	M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
	D = date.getDate() + 'T';
	h = date.getHours() + ':';
	m = date.getMinutes() + ':';
	s = date.getSeconds();
	if (date.getSeconds()<10) {
		s = "0" + s;
	} 
	if(date.getMinutes()<10){
		m = "0"+m;
	}
	return Y+M+D+h+m+s;
}

function thin_address(raw) {
 	var rgx = new RegExp(/^中国.{2,3}[省市]/g);
	var val = rgx.exec(raw);
	return (val) ? raw.replace(val[0], '') : raw;
}

assert('郑州市' === thin_address('中国河南省郑州市'));
assert('北京市朝阳区' === thin_address('中国北京市北京市朝阳区'));
assert('哈尔滨市' === thin_address('中国黑龙江省哈尔滨市'));
assert('郑州市三七区' === thin_address('郑州市三七区'));


function isAndroid() {
    var md = new MobileDetect(window.navigator.userAgent);
    tlog(md.os());
    return /android/i.test(md.os());
}

// 函数防抖 @Turbo: 691209942
// debounce接收三个参数:
// @params fn: 需要进行函数防抖的函数;
// @params wait: 需要等待的时间, 单位为毫秒;
// @params immediate: 如果为true, 则debounce会在调用时立刻执行一次fn,而不需要等到wait结束后.

function debounce (fn, wait, immediate) {
    var timeout,
        args,
        context,
        timestamp,
        result;

    var later = function() {
        var last = (+new Date()) - timestamp;

        if(last < wait && last >= 0) {
            timeout = setTimeout(later, wait - last);
        } else {
            timeout = null;
            if(!immediate) {
                result = fn.apply(context, args);

                if(!timeout) {
                    context = args = null;
                }
            }
        }
    };

    return function() {
        context = this;
        args = arguments;
        timestamp = +new Date();
        var callNow = immediate && !timeout;

        if(!timeout) {
            timeout = setTimeout(later, wait);
        }

        if(callNow) {
            result = fn.apply(context, args);
            context = args = null;
        }

        return result;
    }
};