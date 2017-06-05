define(function() {
    var Module = (function() {
		var baseIModules = project.baseIModules;
        var CON = function(dom) {
            baseIModules.BaseIModule.call(this, dom);
            this.projId = null;

            tlog('I am controlProcessMD');
        };
        potato.createClass(CON, baseIModules.BaseIModule);
		
        CON.prototype.render = function(proj, dest) {
            tlog('good guy, You rendered me');
            $(this.dom).hide();

            var ctrl = this.find('.control');
            if (ctrl.hasClass('active')) { // 说明已经打开过，故清理一下
                ctrl.removeClass('active');
                ctrl.off('click');
            }

            this.find('[data-status=' + proj.status + ']').addClass('active');
            this.projId = proj.id;

            var _this = this;
            this.find('.control').click(function() {
                if (!$(this).hasClass('active')) {
                    var to = $(this).attr('data-status');
                    _this.transferToStatus(to);
                }
            });

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
                    // 无法直接拿到我所在的dialog，故用这种方式取当前dialog，关闭它
                    potato.getCurDialog().close();

                    project.getIModule('imodule://serviceProcess').moveProject(_this.projId, status);
                    project.getIModule('imodule://detailRouterMD', null, function (mod) {
                        project.open(mod, '_blank', {size: 'content', controls: []});
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

