define(function() {
    var Module = (function() {
		var baseIModules = project.baseIModules;
        var CON = function(dom) {
            baseIModules.BaseIModule.call(this, dom);
            this.projId = null;

            tlog('I am controlProcessMD');
        };
        potato.createClass(CON, baseIModules.BaseIModule);
		
        CON.prototype.render = function(proj_detail, dest) {
            tlog('good guy, You rendered me');
            $(this.dom).hide();

            var ctrl = this.find('.control');
            if (ctrl.hasClass('active')) { // 说明已经打开过，故清理一下
                ctrl.removeClass('active');
                ctrl.off('click');
            }

            this.find('[data-status=' + proj_detail.status + ']').addClass('active');
            this.projId = proj_detail.id;

            var _this = this;
            this.find('.control').click(function() {
                if (!$(this).hasClass('active')) {
                    var to = $(this).attr('data-status');
                    _this.transferToStatus(to);
                }
            });

            // 挂到目标位置(因为是2个module共用，只有一份实例，就共享吧)
            var destId = dest.parents('#assignTasks, #demandDetail').attr('id');
            tlog('hook controlProcessMD for module: ' + destId);
            dest.append($(this.dom));
        }

        CON.prototype.transferToStatus = function(status) {
            var data = {
                projectId: this.projId,
                status: status
            };
            var _this = this;
            api_ajax_post('project/transfer_status', data, {
                succ: function(json) {
                    // 不要加这个提示，因为有副作用
                    // project.tip('操作成功', 'succ', '', true);
                    project.getIModule('imodule://detailRouterMD', null, function (mod) {
                        project.open(mod, '_self', {size: ['100px', '100px']});
                        mod.route(_this.projId);
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

