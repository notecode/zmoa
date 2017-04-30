define(["/global/iscripts/test/mock/api-4-project-detail.js"], function(mock) {
    var Module = (function() {
		var baseIModules = project.baseIModules;
        var CON = function(dom) {
            baseIModules.BaseIModule.call(this, dom);
            this.tpl = this._els.tpl[0].text;

            var proj = mock.project_info;
            project.getIModule('imodule://sparesMD', null, function(mod) {
                mod.render(proj);
            });

            this.bindSubmit();
        };
        potato.createClass(CON, baseIModules.BaseIModule);
		
		CON.prototype.bindSubmit = function() {
            var _this = this;
            this.find('.paiqi-btn').click(function() {
                var log = _this.find('#repair-log').val();
                if (log.length > 0) {
                    var data = {
                        projectId: qs_proj(),
                        comment: log 
                    };

                    api_ajax_post('project/add_comment_to_project', data, {
                        succ: function(json) {
                            alert('保存成功');
                        },
                        fail: function(json) {
                            alert(json.errmsg);
                        }
                    });
                } else {
                    alert('请输入维修记录后，再保存');
                }
            });
		}
        
        return CON;
    })();

    return Module;
})
