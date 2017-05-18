define(function() {
    var Module = (function() {
		var baseIModules = project.baseIModules;
        var CON = function(dom) {
            baseIModules.BaseIModule.call(this, dom);

            this.role_allow = 3; // 手机端，暂只运行服务人员登录
            this.gaidLogin();

            //this.dbg('loaded');
        };
        potato.createClass(CON, baseIModules.BaseIModule);

        CON.prototype.dbg = function(msg) {
            if (0) {
                alert(msg);
            }
        }
		
		CON.prototype.gaidLogin = function() {
            var _this = this;
            var allow = this.role_allow;
            api_ajax('user/user_info', {
                succ: function(json) {
                    tlog('hello, welcome login');

//                    if (json.role != allow) {
//                        api_ajax('user/logout', {
//                            always: function() {
//                                _this.goLogin('only-role' + allow + '-allowed-but-you-are-role' + json.role);
//                            }
//                        });
//                    }
                },
                fail: function(json) {
                    tlog(json.errmsg);

                    var qywxCode = qs('code');
                    if (qywxCode && qywxCode.length > 0) {
                        _this.dbg('almost succ: qywxAuthSucc');
                        _this.qywxAuthSucc(qywxCode);
                    } else if ('#from_qywx' == location.hash) {
                        _this.dbg('gotoQywxAuth');
                        _this.gotoQywxAuth();
                    } else {
                        _this.dbg('goto normal login page');
                        _this.goLogin('you-should-login');
                    }
                }
            });
		}

        CON.prototype.qywxAuthSucc = function(code) {
            var q = {code: code};
            api_ajax_with_query('user/login_by_qywx_code', q, {
                succ: function(json) {
                    alert('login with code succ');
                },
                fail: function(json) {
                    alert('failed');
                }
            });
        }

        CON.prototype.gotoQywxAuth = function() {
            var corpID = api.qywx.corpID;
            var agentID = api.qywx.agentID;
            // 必须要清掉末尾的hash(即#xxx部分)，否则在微信中不往下进行
            var toUrl = location.href.split('#')[0];
            this.dbg(toUrl);
            var urlTpl = "https://open.weixin.qq.com/connect/oauth2/authorize?appid={{corpID}}&redirect_uri={{to}}&response_type=code&scope=snsapi_userinfo&agentid={{agentID}}&state=foo#wechat_redirect";
            var url = Mustache.render(urlTpl, {
                corpID: corpID,
                to: encodeURIComponent(toUrl),
                agentID: agentID
            });
            //this.dbg(url);
            location.href = url;
        }

        CON.prototype.goLogin = function(msg) {
            location.href = '/login.html' + (msg ? ('?msg=' + msg) : '');
        }
		
        return CON;
    })();

    return Module;
})

