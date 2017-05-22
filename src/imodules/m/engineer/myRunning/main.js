define(["/global/iscripts/test/mock/api-4-project-detail.js"], function(mock) {
    var Module = (function() {
		var baseIModules = project.baseIModules;
        var CON = function(dom) {
            baseIModules.BaseIModule.call(this, dom);
            this.tpl = this._els.tpl[0].text;

            var doRender = function(proj) {
                project.getIModule('imodule://sparesMD', null, function(mod) {
                    mod.render(proj);
                });
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
		
		CON.prototype._ievent_save = function() {
            var _this = this;
            var log = this.find('#repair-log').val();
            if (log.length > 0) {
                var data = {
                    projectId: qs_proj(),
                    comment: filterCR(log)
                };

                api_ajax_post('project/add_comment_to_project', data, {
                    succ: function(json) {
                        _this.transferToComplete();
                    },
                    fail: function(json) {
                        alert(json.errmsg);
                    }
                });
            } else {
                alert('请输入维修记录后，再保存');
            }
		}

        CON.prototype.transferToComplete = function() {
            var data = {
                projectId: qs_proj(),
                status: 4  // 已完成，待回访
            };
            api_ajax_post('project/transfer_status', data, {
                succ: function(json) {
                    project.tip('保存成功', 'succ', '');
                    setTimeout(function() {
                        location.href = '/project/detail.html?project=' + qs_proj();
                    }, 3000);
                },
                fail: function(json) {
                    alert(json.errmsg);
                }
            });
        }
        
        return CON;
    })();

    return Module;
})
