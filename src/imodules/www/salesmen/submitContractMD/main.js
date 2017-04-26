define(function() {
    var Module = (function() {
        var baseIModules = project.baseIModules;
        var CON = function(dom) {
            baseIModules.BaseIModule.call(this, dom);
            // 初始化内容可以在这里做
            this.tpl = this._els.tpl[0].text;
            var _this = this;
            $(this._els.LSearch).on('keypress', debounce(function (e) {
                var $target = $(e.target)
                _this.search($target)
            }, 300))
        };
        potato.createClass(CON, baseIModules.BaseIModule);

        // 项目模糊搜索
        CON.prototype.search = function (el) {
            var key = el.val().trim();
            var _this = this;
            if (!!key) {
                api_ajax_post('project/associate_projects', { projectNameOrContract: key }, {
                    succ: function(data) {
                        var renderObj = { arr: false, items: [] }
                        if ($.isArray(data) && data.length > 0) {
                            renderObj.arr = true
                            renderObj.items = data
                        }
                        var domStr = Mustache.render(_this.tpl, renderObj); 
                        $(_this._els.LProjects).html(domStr);
                    },
                    fail: function(json) {
                        alert('提交失败')
                    }
                });
            }
        }
        CON.prototype.proInfoRender = function(ctx) {
            var _this = this;
            var dom = Mustache.render(this.tpl, ctx); 
            this.find('#myProject').append(dom);
        }
        // 添加需求
        CON.prototype._ievent_addDemand = function() {
            project.getIModule('imodule://submitContractMD', null, function (modal) {
                project.open(modal, '_blank', 'content');
            });
        }

        return CON;
    })();
    return Module;
});
