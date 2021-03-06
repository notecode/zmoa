define(function() {
    var Module = (function() {
		var baseIModules = project.baseIModules;
        var CON = function(dom) {
            baseIModules.BaseIModule.call(this, dom);

            this.find('.links .active').attr('href', '#').attr('target', '_self');
            this.role_allow = parseInt(this.find('#role-allow').text());
            this.reqUserInfo();
        };
        potato.createClass(CON, baseIModules.BaseIModule);
		
		CON.prototype.reqUserInfo = function() {
            var _this = this;
            var allow = this.role_allow;
            api_ajax('user/user_info', {
                succ: function(json) {
                    _this.find('#user-name').text(json.name);

                    if (json.role != allow) {
                        api_ajax('user/logout', {
                            always: function() {
                                _this.goLogin('only-role' + allow + '-allowed-but-you-are-role' + json.role);
                            },
                            succ: function(json) {
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

		CON.prototype._ievent_logout = function(data, target, hit) {
            var _this = this;
            api_ajax('user/logout', {
                always: function() {
                    _this.goLogin('intended-logout');
                }
            });
		}
        
        return CON;
    })();

    return Module;
})
