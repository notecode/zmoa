// Javascript File
// AUTHOR:   SongErwei
// ROLE:     api基础、公用方法和对象 

var api = {
	url: (function() {
		var url = 'http://zmoa.bxland.com/';
		tlog(url);
		return url;
	})(),
}; 

function api_ajax(uri, cb, config) {
	_api_ajax('get', uri, null, cb, {}, config);
}

function api_ajax_with_query(uri, q, cb, config) {
	_api_ajax('get', uri, q, cb, {}, config);
}

function api_ajax_post(uri, data, cb, config) {
	_api_ajax('post', uri, data, cb, {}, config);
}

function _api_ajax(method, uri, data, cb, ext, config) {
	var url = api.url + uri;
	olog("[>" + method + "](" + uri + "): ", data);
	$.ajax(url, $.extend({
		method: method,
		data: data,
		dataType: "json",
		timeout: 30000,
		xhrFields: {
			withCredentials: true
		},
		success: function(json, status, xhr) {
			olog("[<resp](" + uri + "): ", json);

			cb && cb.always && cb.always(json, json.now);
			var ec = json.errCode;
			if (null == ec || 0 == ec) {
				cb && cb.succ && cb.succ(json);
			} else {
				cb && cb.fail && cb.fail(json);
			}
		},

		error: function(xhr, status, thrown) {
			// https://en.wikipedia.org/wiki/List_of_HTTP_status_codes
			if (status == "timeout") {
				tlog(uri + ' 请求超时!');
			}
			var code = as_int(xhr.status);
			var body = xhr.responseJSON;
			tlog("[!err!](" + uri + "): status: " + code + ", msg: " + thrown);
			olog("body: ", body);
			cb && cb.always && cb.always();

			var ecb = (cb.error || cb.fail);
			ecb && ecb(body);
		}
	}, ext || {}));
}
