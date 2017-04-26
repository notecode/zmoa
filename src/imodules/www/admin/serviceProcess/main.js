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

                   
                    for(var j=0; j<result.length; j++){
                         //判断图标的颜色
                        if(result[j].status_name == '已结束'){
                            result[j].iconStatus = 'task-over';
                        }else if(result[j].status_name == '中止'){
                            result[j].iconStatus = 'task-duan';
                        }else{
                            result[j].iconStatus = '';
                        }

                        //判断是否显示增加新需求的按钮
                        if(result[j].status_name == '已立项，待派人'){
                            result[j].add = '';
                        }else {
                           result[j].add = 'hide'; 
                        }
                    }


                    //包装成要传入的对象
                    var ctx = {persons: result};
                    //var ctx = result;
                    _this.doRender(ctx);
                },
                fail: function(json) {
                    tlog('failed');
                }
            });
        }

        CON.prototype.doRender = function(ctx) {
            var _this = this;
            var dom = Mustache.render(this.tpl, ctx); 
            this.find('#task-pane').append(dom);
        }
        CON.prototype._ievent_addDemand = function() {
            project.getIModule('imodule://submitContractMD', null, function (modal) {
                project.open(modal, '_blank', 'content');
            });
        }

        return CON;
    })();
    return Module;
});
