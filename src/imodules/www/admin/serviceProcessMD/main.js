define(function() {
    var Module = (function() {
        var baseIModules = project.baseIModules;
        var CON = function(dom) {
            baseIModules.BaseIModule.call(this, dom);
            this.tpl = this._els.tpl[0].text;
            this.isBackProj = ($(this.dom).attr('data-proj') == 'back');

            this.render();
        };
        potato.createClass(CON, baseIModules.BaseIModule);

        CON.prototype.render = function() {
            var _this =  this;
            var uri = this.isBackProj ? 'project/back_projects_by_status' : 'project/projects_by_status';
            api_ajax(uri, {
                succ: function(json) {
                    _this.doRender(json);
                },
                fail: function(json) {
                    tlog('failed');
                }
            });
        }

        CON.prototype.doRender = function(raw) {
            var list = [];
            var keys = Object.keys(raw);
            for (var i = 0, len = keys.length; i < len; i++) {
                list.push(raw[keys[i]]);
            }
                   
            var _this = this;
            var data = {
                status_list: list,
                fn: {
                    extTask: function() {
                        var st = this.status;
                        if (5 == st || -4 == st) {  // 正数为厂外项目的状态，负数为返修项目的状态
                            return 'task-over';
                        } else if (6 == st) {
                            return 'task-duan';
                        } else {
                            return '';
                        }
                    },
                    showAddBtn: function() {
                        var st = this.status;
                        return (this.status_name == '已立项，待派人' || (_this.isBackProj && 0 == st)) ? 'show' : 'hide';
                    }
                }
            };
            var _this = this;
            var dom = Mustache.render(this.tpl, data); 
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
            var _this = this;
            project.getIModule('imodule://submitContractMD', null, function (mod) {
                mod.setBackProj(_this.isBackProj);
                project.open(mod, '_blank');
            });
        }

        // 将页面上的元素挪地方
        CON.prototype.moveProject = function(projId, statusId) {
            var proj = this.find('[data-id=' + projId + ']');
            var name = proj.find('.task-item-name').text();
            var stat = this.find('[data-status=' + statusId + ']');
            var stat_name = stat.find('.status-name').text();

            tlog('On UI, move project: [' + projId + ']' + name + ' to status: [' + statusId + ']' + stat_name);
            stat.find('.task-list').prepend(proj);
        }

        return CON;
    })();
    return Module;
});
