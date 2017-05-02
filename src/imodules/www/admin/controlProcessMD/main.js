define(function() {
    var Module = (function() {
		var baseIModules = project.baseIModules;
        var CON = function(dom) {
            baseIModules.BaseIModule.call(this, dom);
            this.projId = null;

            tlog('I am controlProcessMD');
            tlog('本模块就不自己渲染自己了，要不得多请求一次接口，费。所在页面自己来渲染一下');
        };
        potato.createClass(CON, baseIModules.BaseIModule);
		
        CON.prototype.render = function(proj_detail, is_admin) {
            tlog('good guy, You rendered me');
            $(this.dom).hide();

            var ctrl = this.find('.control');
            if (ctrl.hasClass('active')) { // 说明已经打开过，故清理一下
                ctrl.removeClass('active');
                ctrl.off('click');
            }

            this.find('[data-status=' + proj_detail.status + ']').addClass('active');
            this.projId = proj_detail.id;

            if (is_admin) {
                var _this = this;
                this.find('.control').click(function() {
                    if (!$(this).hasClass('active')) {
                        var to = $(this).attr('data-status');
                        _this.transferToStatus(to);
                    }
                });
            }
        }

        CON.prototype.transferToStatus = function(status) {
            var data = {
                projectId: this.projId,
                status: status
            };
            var _this = this;
            api_ajax_post('project/transfer_status', data, {
                succ: function(json) {
                    project.tip('操作成功', 'succ', '', true);
                    project.getIModule('imodule://demandDetail', null, function (mod) {
                        mod.render(_this.projId);
                    });
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

