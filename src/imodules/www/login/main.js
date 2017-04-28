define(function() {
    var Module = (function() {
		var baseIModules = project.baseIModules;
        var CON = function(dom) {
            baseIModules.BaseIModule.call(this, dom);
        };
        potato.createClass(CON, baseIModules.BaseIModule);
		
        CON.prototype._ievent_login = function() {
            this.find('.error-tips').hide();

            var acc = this.find('#account').val();
            var pwd = this.find('#password').val();

            if (0 == acc.length) {
                this.showTips('请您输入账号');
            } else if (0 == pwd.length) {
                this.showTips('请您输入密码');
            } else {
                var data = {
                    userName: acc,
                    password: pwd
                };
                var _this = this;
                api_ajax_post('user/login', data, {
                    succ: function(json) {
                        tlog('login succ');
                        // 1: 系统管理员，2: 销售人员，3: 服务人员
                        if (1 == json.role) {
                            location.href = '/admin/services.html';
                        } else if (2 == json.role) {
                            location.href = '/sales/index.html';
                        } else {
                            project.tip('工程商暂不支持在电脑端进行操作', 'fail', '我们正在努力中', true);

                            setTimeout(function() {
                                api_ajax('user/logout', {
                                    succ: function(json) {
                                    }
                                })
                            }, 3000);
                        }
                    },
                    fail: function(json) {
                        _this.showTips(json.errmsg);
                    }
                });
            }
        }

        CON.prototype.showTips = function(tips) {
            this.find('.error-data').text(tips);
            this.find('.error-tips').show();
        }
        
        return CON;
    })();

    return Module;
})
