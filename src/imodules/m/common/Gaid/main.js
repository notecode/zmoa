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

        /*
         * 企业号授权登录流程:
         * 1. 点击"进入系统"，则打开router.html页(该页加载有本模块，即Gaid)，并带有#from_qywx标识
         * 2. 向api请求user_info，以确定当前是否是登录。若已登录，则emitEvent('login.ensured')，通知router跳转到身份相应的首页;
         *    若未登录，带上本页(即router.html)作为redirect_uri，去open.weixin.qq.com请求授权
         * 3. 若授权成功(会带回code参数)，自然就再加载本页(router.html)。(此时自然是又请求user_info，当然又是未登录)。发现有code，
         *    则带上code到我们api请求登录(即qywx_login接口，后端拿code换回用户id及详细信息等)
         * 4. 若登录成功，则同第2步中登录成功一样逻辑：emitEvent('login.ensured')，router跳转相应身份首页
         *
         * 总结：
         *   1. 未登录时到router页，会加载两次（第2次是微信授权跳回来，这个无法避免）
         *   2. 若本已登录，则只需加载一次router页
         *
         */

		CON.prototype.gaidLogin = function() {
            var _this = this;
            var allow = this.role_allow;
            api_ajax('user/user_info', {
                succ: function(json) {
                    _this.emitLoginEnsured(json);
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
                    _this.emitLoginEnsured(json);
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

        CON.prototype.emitLoginEnsured = function(json) {
            this.dbg('logged in');

            // 确保当前是有用户登录状态，这个前提下，再通知其他地方去请求api
            tlog('Yeah, you logged in properly. Now notify others...');
            project.events.emitEvent('login.ensured', [json]); // 注意: 参数必须用数组，这是apply方法的要求。花掉我近1小时
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

