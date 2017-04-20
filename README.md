# web 前端 html/css/js
包括 pc 版（www 域名），mobile 版（m 域名）。

注意：目录结构、文件、页面元素、变量的命名要一致、含义清晰、高可读性。


# 关于登录、退出不重新加载页面的实现

## 为了做到用户主动登录、退出后不刷新页面（即重新加载），从而提高一点用户体验，需面对的问题：

1. 登录/退出模块在完成动作后如何通知其他模块（使用事件机制）
2. 其他模块需根据当前状态，正确展示相应UI
3. 初始加载页面时，若已登录（因登录状态是保存在cookie中），此时的处理应与第1步中收到登录事件时同逻辑处理


## 会导致用户处于登录状态的几个入口：
1. cookie中存有已登录标识（即此时加载页面自然就处于登录，此情况我们已熟知）
2. 用户通过登录框，登录（也已熟知）
3. 用户询价时，校验验证码通过，此时也会进入登录状态。
4. 未来还可能有的...

以上除第1点外，都应该提交“登录成功”事件，以便相关模块进行状态更新。
第1点的情况下，（若已登录）immy框架会在加载模块前请求api获取用户基本信息。其他模块在constructor中若需要，可直接使用project.data.user中所存


一般，若某个模块依赖于登录状态（如Header、询价），那么此模块的constructor应长这样：

```
var CON = function (dom) {
    baseIModules.BaseIModule.call(this, dom);
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

CON.prototype._onLogin = function () {
    // 登录状态的UI展示
}

CON.prototype._onLogout = function () {
    // 退出状态的UI展示
}

```



