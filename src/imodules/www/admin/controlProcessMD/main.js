define(function() {
    var Module = (function() {
		var baseIModules = project.baseIModules;
        var CON = function(dom) {
            baseIModules.BaseIModule.call(this, dom);

            tlog('I am controlProcessMD');
            tlog('本模块就不自己渲染自己了，要不得多请求一次接口，费。所在页面自己来渲染一下');
        };
        potato.createClass(CON, baseIModules.BaseIModule);
		
        CON.prototype.render = function(proj_detail, is_admin) {
            tlog('good guy, You rendered me');
            this.find('[data-status=' + proj_detail.status + ']').addClass('active');

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
                projectId: qs_proj(),
                status: status
            };
            api_ajax_post('project/transfer_status', data, {
                succ: function(json) {
                    project.tip('操作成功', 'succ', '');
                    setTimeout(function() {
                        location.href = '/project/detail.html?project=' + qs_proj();
                    }, 1000);
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

