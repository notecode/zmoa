define(function() {
    var Module = (function() {
		var baseIModules = project.baseIModules;
        var CON = function(dom) {
            baseIModules.BaseIModule.call(this, dom);

            tlog('I am controlProcessMD');
            this.init();
        };
        potato.createClass(CON, baseIModules.BaseIModule);
		
		CON.prototype.init = function() {
            var _this = this;
            var uri = 'project/detail/' + qs_proj();
            api_ajax(uri, {
                succ: function(json) {
                    _this.find('[data-status=' + json.status + ']').addClass('active');
                },
                fail: function(json) {
                }
            });
		}
		
        return CON;
    })();

    return Module;
})

