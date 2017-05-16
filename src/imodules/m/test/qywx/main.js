define(function() {
    var Module = (function() {
		var baseIModules = project.baseIModules;
        var CON = function(dom) {
            baseIModules.BaseIModule.call(this, dom);

            this.fooQywx();
        };
        potato.createClass(CON, baseIModules.BaseIModule);
		
		CON.prototype.fooQywx = function() {
            window.WwLogin({
                "id": "wx_reg",  
                "appid": "wwd166efb0a45a080f",
                "agentid": "1000002",
                "redirect_uri": encodeURIComponent("http://m2.xxtao.com:8080/login.html"),
                "state": "SONG",
            });
        }

        return CON;
    })();

    return Module;
})
