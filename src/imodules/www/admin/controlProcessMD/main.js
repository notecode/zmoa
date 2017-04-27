define(function() {
    var Module = (function() {
		var baseIModules = project.baseIModules;
        var CON = function(dom) {
            baseIModules.BaseIModule.call(this, dom);

            tlog('I am controlProcessMD');
            tlog('本模块就不自己渲染自己了，要不得多请求一次接口，费。所在页面自己来渲染一下');
        };
        potato.createClass(CON, baseIModules.BaseIModule);
		
        CON.prototype.render = function(proj_detail) {
            tlog('good guy, You rendered me');
            this.find('[data-status=' + proj_detail.status + ']').addClass('active');
        }

        /*
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
        */

        return CON;
    })();

    return Module;
})

