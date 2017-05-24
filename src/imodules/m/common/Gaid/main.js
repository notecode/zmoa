define(function() {
    var Module = (function() {
		var baseIModules = project.baseIModules;
        var CON = function(dom) {
            baseIModules.BaseIModule.call(this, dom);

            this.role_allow = 3; // 手机端，暂只运行服务人员登录
            this.gaidLogin();

            this.isDbg = false;
            //this.isDbg = true;
            //this.dbg('loaded');
        };
        potato.createClass(CON, baseIModules.BaseIModule);

		CON.prototype.gaidLogin = function() {
            var _this = this;
            var allow = this.role_allow;
            api_ajax('user/user_info', {
                succ: function(json) {
                    _this.emitLoginEnsured();
                },
                fail: function(json) {
                    tlog(json.errmsg);

                    var qywxCode = qs('code');
                    if (qywxCode && qywxCode.length > 0) {
                        _this.dbg('qywxAuthSucc');
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
            var _this = this;
            var q = {code: code, state: qs('state')};
            api_ajax_with_query('user/qywx_login', q, {
                succ: function(json) {
                    _this.dbg('qywx_login succ');
                    _this.emitLoginEnsured();
                },
                fail: function(json) {
                    _this.dbg(JSON.stringify(json));
                    alert(json.errmsg);
                }
            });
        }

        CON.prototype.gotoQywxAuth = function() {
            var corpID = api.qywx.corpID;
            var agentID = api.qywx.agentID;
            // 必须要清掉末尾的hash(即#xxx部分)，否则在微信中不往下进行
            var toUrl = location.href.split('#')[0];
            this.dbg(toUrl);
            var baseUrl = "https://open.weixin.qq.com/connect/oauth2/authorize?";
            var q = "appid={{corpID}}&redirect_uri={{to}}&response_type=code&scope=snsapi_privateinfo&agentid={{agentID}}&state=login_in_qywx#wechat_redirect";
            var url = Mustache.render(baseUrl + q, {
                corpID: corpID,
                to: encodeURIComponent(toUrl),
                agentID: agentID
            });
            this.dbg(url);
            location.href = url;
        }

        CON.prototype.emitLoginEnsured = function() {
            this.dbg('logged in');

            // 确保当前是有用户登录状态，这个前提下，再通知其他地方去请求api
            tlog('Yeah, you logged in properly. Now notify others...');
            project.events.emitEvent('login.ensured');
        }

        CON.prototype.goLogin = function(msg) {
            location.href = '/login.html' + (msg ? ('?msg=' + msg) : '');
        }

        CON.prototype.dbg = function(msg) {
            if (this.isDbg) {
                alert(msg);
            }
        }
		
        return CON;
    })();

    return Module;
})

