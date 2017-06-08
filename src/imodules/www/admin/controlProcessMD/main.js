define(function() {
    var Module = (function() {
		var baseIModules = project.baseIModules;
        var CON = function(dom) {
            baseIModules.BaseIModule.call(this, dom);
            this.tpl = this._els.tpl[0].text;
            this.projId = null;

            tlog('I am controlProcessMD');
        };
        potato.createClass(CON, baseIModules.BaseIModule);
        var servOut = [
            {id: 1, name: '已立项，待派人'},
            {id: 2, name: '排期中'},
            {id: 3, name: '服务中'},
            {id: 4, name: '已完成，待回访'},
            {id: 5, name: '已结束'},
            {id: 6, name: '中止'},
        ];
        var servBack = [
            {id: 0, name: '已收件，待测试'},
            {id: -1, name: '维修中'},
            {id: -2, name: '已完成，待寄件'},
            {id: -3, name: '已寄件，待回访'},
            {id: -4, name: '已结束'},
        ];
		
        CON.prototype.render = function(proj, dest) {
            tlog('good guy, You rendered me');
            $(this.dom).hide();

            var isBackProj = (proj.type == 1); 
            if (0 == $(this._els.list).html().length) {
                // 因为此弹层在一个页面中“是哪种，就总是哪种”。故初始化一次就够了
                var dict = isBackProj ? servBack : servOut;
                var dom = Mustache.render(this.tpl, {dict: dict})
                $(this._els.list).html(dom);
            }

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
                    _this.transferToStatus(to, isBackProj);
                }
            });

            dest.append($(this.dom));
        }

        CON.prototype.transferToStatus = function(status, isBack) {
            var data = {
                projectId: this.projId,
                status: status
            };
            var _this = this;
            var uri = isBack ? 'project/back_project_transfer_status' : 'project/transfer_status';
            api_ajax_post(uri, data, {
                succ: function(json) {
                    window.onStatusTransfered4UI(_this.projId, status);
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

