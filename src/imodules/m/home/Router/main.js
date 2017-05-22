define(function() {
    var Module = (function() {
		var baseIModules = project.baseIModules;
        var CON = function(dom) {
            baseIModules.BaseIModule.call(this, dom);

            project.events.addListener('login.ensured', function(event) {
                api_ajax('user/user_info', {
                    succ: function(json) {
                        var role = json.role;
                        if (2 == role) {
                            location.href = '/sales/index.html';
                        } else if (3 == role) {
                            location.href = '/engineer/running-project.html';
                        } else {
                            alert('亲爱的管理员，请您在电脑上登录网站进行管理.');
                        }
                    }
                });
            });
        };
        potato.createClass(CON, baseIModules.BaseIModule);
		
        return CON;
    })();

    return Module;
})
