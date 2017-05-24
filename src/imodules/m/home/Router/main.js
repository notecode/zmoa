define(function() {
    var Module = (function() {
		var baseIModules = project.baseIModules;
        var CON = function(dom) {
            baseIModules.BaseIModule.call(this, dom);

            tlog('addListener for event login.ensured');
            project.events.addListener('login.ensured', function(event) {
                tlog('got event login.ensured');
                api_ajax('user/user_info', {
                    succ: function(json) {
                        var role = json.role;
                        if (2 == role) {
                            location.href = '/sales/index.html';
                        } else if (3 == role) {
                            location.href = '/engineer/running-project.html';
                        } else {
                            alert('亲爱的管理员，请您在电脑上登录网站进行管理.');
                            api_ajax('user/logout');
                        }
                    },
                    fail: function(json) {
                        alert(json.errmsg);
                    }
                });
            });
            
            // 重要: 为了保证event在addListener之后emit，故后加载Gaid模块
		    project.getIModule("imodule://Gaid");
        };
        potato.createClass(CON, baseIModules.BaseIModule);
		
        return CON;
    })();

    return Module;
})
