define(function() {
    var Module = (function() {
		var baseIModules = project.baseIModules;
        var CON = function(dom) {
            baseIModules.BaseIModule.call(this, dom);

            this.fooQywx();
        };
        potato.createClass(CON, baseIModules.BaseIModule);
		
		CON.prototype.fooQywx = function() {
            var url = location.protocol + '//' + location.host + '/login-succ.html';
            window.WwLogin({
                "id": "wx_reg",  
                "appid": api.qywx.corpID,
                "agentid": api.qywx.agentID,
                "redirect_uri": encodeURIComponent(url),
                "state": "login_on_zmoa",
            });
        }

        return CON;
    })();

    return Module;
})
