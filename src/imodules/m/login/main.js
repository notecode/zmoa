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

            // 防止Enter键触发
            $('form').submit(function() {
                  return false;
            });
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

                    // 如果refer是站内页，就跳过去
                    var refer = $(document).prop('referrer');
                    var origin = document.origin;
                    if (0 == refer.indexOf(origin)) {
                        var path = refer.substring(origin.length);
                        if (path == '/' || path.indexOf('/index.html') == 0) {
                            refer = ''; // 首页（引导）
                        }
                    } else {
                        refer = '';  // 站外页
                    }
                   
                    location.href = (refer.length > 0) ? refer : '/login-succ.html';
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
