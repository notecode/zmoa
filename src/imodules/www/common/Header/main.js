define(function() {
    var Module = (function() {
		var baseIModules = project.baseIModules;
        var CON = function(dom) {
            baseIModules.BaseIModule.call(this, dom);

            this.reqUserInfo();
        };
        potato.createClass(CON, baseIModules.BaseIModule);
		
		CON.prototype.reqUserInfo = function() {
            var _this = this;
            api_ajax('user/user_info', {
                succ: function(json) {
                    _this.find('#user-name').text(json.name);

                    if (3 == json.role) {
                        api_ajax('user/logout', {
                            always: function() {
                                _this.goLogin('you-are-role3');
                            },
                            succ: function(json) {
                            }
                        });
                    }
                },
                fail: function(json) {
                    console.error('尚未登录，或登录已失效');
                    _this.goLogin('you-should-login');
                }
            });
		}
		
        CON.prototype.goLogin = function(msg) {
            location.href = '/login.html' + (msg ? ('?msg=' + msg) : '');
        }

		CON.prototype._ievent_logout = function(data, target, hit) {
            this.goLogin('intended-logout');
		}
        
        return CON;
    })();

    return Module;
})
