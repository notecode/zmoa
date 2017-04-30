define(["/global/iscripts/test/mock/api-4-project-detail.js"], function(mock) {
    var Module = (function() {
		var baseIModules = project.baseIModules;
        var CON = function(dom) {
            baseIModules.BaseIModule.call(this, dom);

            this.cur_status = -1;

            var _this = this;
            var doRender = function(proj) {
                project.getIModule('imodule://detailsMD', null, function(mod) {
                    mod.render(proj);
                });

                project.getIModule('imodule://sparesMD', null, function(mod) {
                    mod.render(proj);
                });

                _this.renderBottomBtn(proj);
            }

            if (1 == qs('test')) {
                doRender(mock.project_info);
            } else {
                api_ajax('project/detail/' + qs_proj(), {
                    succ: function(json) {
                        doRender(json.project_info);
                    }
                });
            }
        };
        potato.createClass(CON, baseIModules.BaseIModule);
        
        CON.prototype.renderBottomBtn = function(proj) {

        }

        CON.prototype._ievent_action = function(data, target, hit) {
            alert(0);
        }
            
        return CON;
    })();

    return Module;
})
