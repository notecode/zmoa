define(function () {
    var baseIModules = project.baseIModules;
    var Module = (function() {
        var CON = function (dom) {
            baseIModules.BaseIModule.call(this, dom);
            this.nav = this.find('.nav');
            this.userNick = this.find(".user-nick");

            this._listenAsSingleton();

            var _this = this;
            potato.application.addListener('logged-user-data-ready', function (event) {
                _this._onLogin();
            });

            potato.application.addListener('logout-success', function (event) {
                _this._onLogout();
            });

            project.isLogin() ? this._onLogin() : this._onLogout();
        };
        potato.createClass(CON, baseIModules.BaseIModule);

        // 全局只有这一个地方监听这几个Event，其他地方都无需再监听。以免重复请求api
        CON.prototype._listenAsSingleton = function () {

            // 登录成功后获取用户信息和当前项目
            potato.application.addListener('login-success', function (event) {
                /*
                a_profile_req({
                    succ: function (json) {
                        project.data.user = json;
                        potato.application.dispatch(new potato.Event('logged-user-data-ready'));
                    },
                });
                */

                var onReqCurrentItem = function (data) {
                    debug.info(data);
                    project.data.currentItem = data;
                    potato.application.dispatch(new potato.Event('current-item-data-ready'));
                };

                a_auth_req_current_item({
                    succ: function (json) {
                        onReqCurrentItem(json);
                    },
                    fail: function () {
                        onReqCurrentItem(false);
                    }
                });
            });
        }

        CON.prototype._onLogin = function () {
            this.nav.removeClass("login-out");
            this.nav.addClass("login-in");
            this.userNick.text(project.data.user.nick);
        }

        CON.prototype._onLogout = function () {
            this.nav.removeClass("login-in");
            this.nav.addClass("login-out");
        }

        // 显示登录弹窗
        CON.prototype._ievent_showLoginForm = function (data,obj) {
            //获取调用登陆框的target
            var getSucc = function (LoginForm) {
                project.open(LoginForm,"_blank","{'size':['content','content']}");
            };
            var getFail = function () {
            };
            var LoginForm = project.getIModule('imodule://LoginForm',null,getSucc,getFail);

        };

        // 注销登录
        CON.prototype._ievent_loginOut = function () {
            a_auth_logout({
                succ: function(json){
                    $('.user_nav').hide();
                    $('.user_nav .phone').text('');
                    $('#IndexBookin .phone').val('');

//                    project.data.user = {};
//                    project.data.currentItem = false;
//                    potato.application.dispatch(new potato.Event('logout-success'));
        
                    // todo: 欲退出后不刷新，需要进行彻底的清理工作，以免影响以其他账号登录。
                    //       这个工作做起来比较精细，尤其是im模块，始作俑者huhao不支援了，会有很多问题。
                    //       故，退出之后就刷新吧。先只支持登录之后不刷新
                    window.location.reload();
                },
                fail: function(json) {
                    alert('Sorry: ' + json.msg);
                }
            })
        };
        return CON;
    })();

    return Module;
});
