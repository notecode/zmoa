define(function() {
    var Module = (function() {
		var baseIModules = project.baseIModules;
        var CON = function(dom) {
            baseIModules.BaseIModule.call(this, dom);

            this.role_allow = 3; // 手机端，暂只运行服务人员登录
            this.gaidLogin();
        };
        potato.createClass(CON, baseIModules.BaseIModule);
		
		CON.prototype.gaidLogin = function() {
            var _this = this;
            var allow = this.role_allow;
            api_ajax('user/user_info', {
                succ: function(json) {
                    tlog('hello, welcome login');

                    if (json.role != allow) {
                        api_ajax('user/logout', {
                            always: function() {
                                _this.goLogin('only-role' + allow + '-allowed-but-you-are-role' + json.role);
                            }
                        });
                    }
                },
                fail: function(json) {
                    tlog(json.errmsg);
                    _this.goLogin('you-should-login');
                }
            });
		}

        CON.prototype.goLogin = function(msg) {
            location.href = '/login.html' + (msg ? ('?msg=' + msg) : '');
        }

		
        return CON;
    })();

    return Module;
})

