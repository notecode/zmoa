define(function() {
    var Module = (function() {
		var baseIModules = project.baseIModules;
        var CON = function(dom) {
            baseIModules.BaseIModule.call(this, dom);

            this.gaidLogin();
        };
        potato.createClass(CON, baseIModules.BaseIModule);
		
		CON.prototype.gaidLogin = function() {
            api_ajax('user/user_info', {
                succ: function(json) {
                    tlog('hello, welcome login');
                },
                fail: function(json) {
                    tlog(json.errmsg);
                    location.href = '/login.html?msg=should-login';
                }
            });
		}
		
        return CON;
    })();

    return Module;
})

