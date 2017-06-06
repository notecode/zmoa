define(function() {
    var Module = (function() {
		var baseIModules = project.baseIModules;
        var CON = function(dom) {
            baseIModules.BaseIModule.call(this, dom);
        };
        potato.createClass(CON, baseIModules.BaseIModule);
		
		CON.prototype.route = function(projId) {
            // 显示loading动画
            $(this.dom).show();
            this.parent.refreshSize();

            var _this = this;
            api_ajax('project/detail/' + projId, {
                succ: function(json) {
                    project.getIModule('imodule://detailFrameMD', null, function (mod) {
                        var h = $(window).height() - 50;
                        project.open(mod, '_blank', {size: ['content', h+'px']});
                        mod.render(projId, json.project_info);

                        // 因此时所在modal没有x按钮，而详情页需要有，故关掉旧的开新的
                        _this.parent.close();
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
