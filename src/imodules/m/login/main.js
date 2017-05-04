define(function() {
    var Module = (function() {
		var baseIModules = project.baseIModules;
        var CON = function(dom) {
            baseIModules.BaseIModule.call(this, dom);
            this.via_pwd = (qs('via') != 'phone');  // 只要不是?pwd=phone，均以用户名+密码方式登录
            this.timing = false;

            if (this.via_pwd) {
                this.find('.via-user-pwd').removeClass('hide');
            } else {
                this.find('.via-phone').removeClass('hide');
            }

            var _this = this;
            // 校验用户名和密码
            $('.js-check-field').keydown(debounce(function (e) {
                if (_this.via_pwd) {
                    _this.fieldCheckForPwd();
                } else {
                    _this.fieldCheckForPhone();
                }
            }, 300))

            // 防止Enter键触发
            $('form').submit(function() {
                  return false;
            });
        };
        potato.createClass(CON, baseIModules.BaseIModule);

		// 校验方法
        CON.prototype.fieldCheckForPwd = function() {
            var $name = $.trim($(this._els.LName).val());
            var $password = $.trim($(this._els.LPassword).val());
            var $loginButton = $(this._els.LButton);
            if ( !!$name && $password ) {
                $loginButton.removeAttr('disabled');
            } else {
                $loginButton.attr('disabled', true);
            }
        }

        CON.prototype.fieldCheckForPhone = function() {
            var phone = $(this._els.phone).val();
            var pass = $(this._els.passcode).val();
            var getPass = $(this._els.getcode); 
            var login = $(this._els.LButton);

            // 这几个数字，是预期“快输够”的时候，可用
            if (phone.length > 9) {
                if (!this.timing) {
                    getPass.attr('disabled', false);
                }

                if (pass.length >= 3) {
                    login.attr('disabled', false);
                }
            }
        }

        CON.prototype._ievent_getPasscode = function(data, target, hit) {
            tlog('you clicked get passcode');

            var phone = $(this._els.phone).val();
            if (!is_phone_valid(phone)) {
                project.tip('请输入有效手机号', 'fail', '', true);
                return false;
            }

            var max_cnt = 60;
            //var max_cnt = 10;
            var getPass = $(this._els.getcode); 
            getPass.attr('disabled', true);
            this.timing = true;
            var cnt = max_cnt;
            var timerId = setInterval(function() {
                var txt = --cnt + 's后重新获取';
                getPass.text(txt);
            }, 1000);

            var _this = this;
            setTimeout(function() {
                tlog(max_cnt + 's passed, enable button again');
                getPass.attr('disabled', false);
                getPass.text('获取验证码');
                clearInterval(timerId);
                _this.timing = false;
            }, max_cnt * 1000);

            var dbging = (1 == qs('not-get-passcode'));
            if (!dbging) {
                api_ajax_post('user/mobile_send_msg', {mobile: phone}, {
                    succ: function(json) {
                        tlog('send passcode succ');
                    },
                    fail: function(json) {
                        tlog(json.errmsg);
                    }
                });
            } else {
                tlog('You are debugging, not call api to get passcode');
            }
        }

        CON.prototype._ievent_login = function() {
            var uri = '';
            var data = null;
            if (this.via_pwd) {
                uri = 'user/login';
                data = {
                    userName: $.trim($(this._els.LName).val()),
                    password: $.trim($(this._els.LPassword).val())
                }
            } else {
                uri = 'user/mobile_login';
                data = {
                    mobile: $(this._els.phone).val(),
                    msgCode: $(this._els.passcode).val()
                };
            }

            api_ajax_post(uri, data, {
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
