define(function() {
    var Module = (function() {
		var baseIModules = project.baseIModules;
        var CON = function(dom) {
            baseIModules.BaseIModule.call(this, dom);

            var _this = this;
            // 校验用户名和密码
            $('.js-check-field').keydown(debounce(function (e) {
                console.log('action');
                _this.fieldCheck();
            }, 300))
        };
        potato.createClass(CON, baseIModules.BaseIModule);
		// 校验方法
        CON.prototype.fieldCheck = function() {
            var $name = $.trim($(this._els.LName).val());
            var $password = $.trim($(this._els.LPassword).val());
            var $loginButton = $(this._els.LButton);
            if ( !!$name && $password ) {
                $loginButton.removeAttr('disabled');
            } else {
                $loginButton.attr('disabled', true);
            }
        }
        CON.prototype._ievent_login = function() {
            var user = $(this._els.LForm).serializeJSON();
            api_ajax_post('user/login', user, {
                succ: function(json) {
                    tlog('login succ');
                    // 1: 系统管理员，2: 销售人员，3: 服务人员

                    // 如果refer是站内页，就跳过去
                    var refer = $(document).prop('referrer');
                    if (refer.indexOf(document.domain) != -1) {
                        project.tip('登录成功', 'succ', '正在为您跳转...', true);
                        window.location.href = url;
                    }
                },
                fail: function(json) {
                    if (!$.isEmptyObject(json)) {
                        project.tip('登录失败', 'fail', json.errmsg || '未知错误' , true);
                    } else {
                        project.tip('登录失败', 'fail', '未知错误', true);
                    }
                }
            });            
        }
        
        return CON;
    })();

    return Module;
})
