// Javascript File
// AUTHOR:   SongErwei
// ROLE:     api基础、公用方法和对象 

window.zmoa_env = (function() {
    var host = location.host;
    if (host.indexOf('.wanpinghui.com') != -1) {
        if (host.indexOf('devoa') == 0) { 
            return 'dev'; // 本地开发环境
        } else if (host.indexOf('txoa') == 0) {
            return 'test'; // 测试环境
        } else {
            return 'prod'; // 生产环境
        }
    } else {
        return 'test';  // oschina上的托管，属于测试环境
    }
})();

var api = {
	url: (function() {
		var prefix = 'txoaapi';
        switch (window.zmoa_env) {
            case 'dev':
                prefix = 'devoaapi'; // 本地开发环境
                break;
            case 'test':
                prefix = 'txoaapi'; // 测试环境
                break;
            case 'prod':
                prefix = 'oaapi'; // 生产环境
                break;
            default:
                break;
        }

        var url = location.protocol + '//' + prefix + '.wanpinghui.com/';

        // temp
        //if (window.zmoa_env == 'test') {
        //    url = 'http://zmoa.bxland.com/';
        //}

        tlog('env: ' + window.zmoa_env);
		tlog('api: ' + url);
		return url;
	})(),

    // notecode
    qywx: (function() {
        var acc = {};
        switch (window.zmoa_env) {
            case 'dev':
                acc = {
                    corpID: 'wwe85720d4242f660f',
                    agentID: 1000002,
                };
                break;
            case 'test':
                acc = {
                    corpID: 'wwe85720d4242f660f',
                    agentID: 1000003,
                };
                break;
            case 'prod':
                acc = {
                    corpID: 'wx2fa18b521c5cf0b0',
                    agentID: 37,
                };
                break;
            default:
                break;
        }

        tlog('qywx: ' + JSON.stringify(acc));
        return acc;
    })(),
}; 

function proj_img_url(raw) {
    if (raw && raw.length > 0) {
        return (api.url + 'files/project/' + raw);
    } else {
        return '';
    }
}

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
			var ec = json.errcode;
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
