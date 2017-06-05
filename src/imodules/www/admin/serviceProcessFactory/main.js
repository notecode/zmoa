define(["/global/iscripts/tools/slick.js"], function() {
    var Module = (function() {
        var baseIModules = project.baseIModules;
        var CON = function(dom) {
            baseIModules.BaseIModule.call(this, dom);
            this.byStatus();
            this.tpl = this._els.tpl[0].text;
        };
        potato.createClass(CON, baseIModules.BaseIModule);

        // 将页面上的元素挪地方
        CON.prototype.moveProject = function(projId, statusId) {
            var proj = this.find('[data-id=' + projId + ']');
            var name = proj.find('.task-item-name').text();
            var stat = this.find('[data-status=' + statusId + ']');
            var stat_name = stat.find('.status-name').text();

            tlog('On UI, move project: [' + projId + ']' + name + ' to status: [' + statusId + ']' + stat_name);
            stat.find('.task-list').prepend(proj);
        }

        CON.prototype.byStatus = function() {
            var _this =  this;
            api_ajax('project/back_projects_by_status', {
                succ: function(json) {
                    //将返回的数据转为数组
                    var result = [];
                    var keys = Object.keys(json);
                    for (var i = 0, len = keys.length; i < len; i++) {
                        var value = json[keys[i]];
                        value.id = keys[i];
                        result.push(value);
                    }
                   
                    for(var j=0; j<result.length; j++){
                         //判断图标的颜色
                        if(result[j].id == 5) {  
                            result[j].iconStatus = 'task-over'; // 已结束
                        }else if(result[j].id == 6){ 
                            result[j].iconStatus = 'task-duan'; // 中止
                        }else{
                            result[j].iconStatus = '';
                        }

                        //判断是否显示增加新需求的按钮
                        if(result[j].status == 0) { // '已收件，待测试'
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
            this.find('#task-pane').html(dom);

            this.find('.task-item').click(function() {
                var projId = $(this).attr('data-id');
                tlog('project id: ' + projId);

                project.getIModule('imodule://detailRouterMD', null, function (mod) {
                    project.open(mod, '_blank', {size: 'content', controls: []});
                    mod.route(projId);
                });
            });
        }
        CON.prototype._ievent_addDemand = function() {
            project.getIModule('imodule://submitContractMD', null, function (modal) {
                project.open(modal, '_blank');
            });
        }

        return CON;
    })();
    return Module;
});
