define(function() {
    var Module = (function() {
		var baseIModules = project.baseIModules;
        var CON = function(dom) {
            baseIModules.BaseIModule.call(this, dom);
        };
        potato.createClass(CON, baseIModules.BaseIModule);
		
		CON.prototype.route = function(projId) {
            var _this = this;
            api_ajax('project/detail/' + projId, {
                succ: function(json) {
                    var proj = json.project_info;
                    var imod = (1 == proj.status) ? 'imodule://assignTasks' : 'imodule://demandDetail'; 
                    project.getIModule(imod, null, function (mod) {
                        var h = $(window).height() - 50;
                        project.open(mod, '_self', {size: ['content', h+'px']});
                        mod.render(projId, json);

                        var dest = $(mod.dom).find('.control-process-dest');
                        project.getIModule('imodule://controlProcessMD', null, function(mod2) {
                            mod2.render(proj, dest);
                        });

                    });
                },
                fail: function(json) {
                    _this.parent.close();
                    project.tip('请求数据失败: ' + json.errmsg, 'fail', '', true);
                }
            });
		}
		
        return CON;
    })();

    return Module;
})
