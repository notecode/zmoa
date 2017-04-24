define(function() {
    var Module = (function() {
        var baseIModules = project.baseIModules;
        var CON = function(dom) {
            baseIModules.BaseIModule.call(this, dom);
            this.byStatus();
            this.tpl = this._els.tpl[0].text;
        };
        potato.createClass(CON, baseIModules.BaseIModule);

        CON.prototype.byStatus = function() {
            var _this =  this;
            api_ajax('project/projects_by_status', {
                succ: function(json) {
                    //将返回的数据转为数组
                    var result = [];
                    var keys = Object.keys(json);
                    for (var i = 0, len = keys.length; i < len; i++) {
                        result.push(json[keys[i]]);
                    }

                    //判断图标的颜色
                    for(var j=0; j<result.length; j++){
                        if(result[j].status_name == '已结束'){
                            result[j].iconStatus = 'task-over';
                        }else if(result[j].status_name == '中止'){
                            result[j].iconStatus = 'task-duan';
                        }else{
                            result[j].iconStatus = '';
                        }
                    }

                    //包装成要传入的对象
                    var ctx = {persons: result};
                    //var ctx = result;
                    _this.doRender(ctx);
                },
                fail: function(json) {

                }
            });
        }

        CON.prototype.doRender = function(ctx) {
            var _this = this;
            var dom = Mustache.render(this.tpl, ctx); 
            this.find('#task-pane').append(dom);
        }

        return CON;
    })();
    return Module;
});
