define(["/global/iscripts/test/mock/api-4-project-detail.js"], function(mock) {
    var Module = (function() {
		var baseIModules = project.baseIModules;
        var CON = function(dom) {
            baseIModules.BaseIModule.call(this, dom);

            this.main_action = null;
            this.left_action = null;

            var _this = this;
            var doRender = function(proj, role) {
                project.getIModule('imodule://detailsMD', null, function(mod) {
                    mod.render(proj);
                });

                project.getIModule('imodule://sparesMD', null, function(mod) {
                    mod.render(proj);
                });

                _this.renderBottomBtn(proj, role);
            }

            if (1 == qs('test')) {
                doRender(mock.project_info);
            } else {
                project.events.addListener('login.ensured', function(event) {
                    api_ajax('project/detail/' + qs_proj(), {
                        succ: function(json) {
                            doRender(json.project_info, json.user_role);
                        },
                        fail: function(json) {
                            alert(json.errmsg);
                        }
                    });
                });
            }

		    project.getIModule("imodule://Gaid"); // 后加载，以保证addListener已执行
        };
        potato.createClass(CON, baseIModules.BaseIModule);
        
        CON.prototype.renderBottomBtn = function(proj, role) {
            var isAppr = (role == 4); 
            var showBtn = true;
            var showBoth = false;
            var btn_main = this.find('.btn-main');
            var btn_left = this.find('.btn-left');
            var status = parseInt(proj.status);
            var srv_u = proj.service_user || {};
            var sched = (srv_u.start_date && srv_u.end_date);

            switch (status) {
                case -1: // 被驳回
                    if (isAppr) {
                        var msg = '已驳回';
                        btn_main.text(msg).prop('disabled', true);
                    } else {
                        alert('todo: 跳到编辑页');
                    }
                    break;
                case 0: // 待审批
                    if (isAppr) {
                        showBoth = true;
                        btn_left.text('驳回');
                        btn_main.text('通过');
                        this.left_action = function() {
                            project.open('imodule://rejectMD', '_blank');
                        }
                        this.main_action = function() {
                            api_ajax_post('project/approve', {projectId: qs_proj()}, {
                                succ: function(json) {
                                    location.reload();
                                },
                                fail: function(json) {
                                    alert(json.errmsg);
                                }
                            });
                        }
                    } else {
                        var msg = '待审批';
                        btn_main.text(msg).prop('disabled', true);
                    }
                    break;
                case 1: // 已立项，待派人 
                    var msg = '已通过';
                    btn_main.text(msg).prop('disabled', true);
                    break;
                case 2: // 排期中(又细分2个阶段：已派人，但未排期；已排期，但未开始服务)
                    if (!sched) {
                        showBoth = true;
                        btn_left.text('已远程服务');
                        btn_main.text('立即排期');
                        this.left_action = function() {
                            // todo: 就地完成项目
                        }
                        this.main_action = function() {
                            location.href = '/engineer/schedule.html?project=' + qs_proj();
                        }
                    } else {
                        btn_main.text('开始现场服务');
                        this.main_action = function() {
                            // status: 2 -> 3, reload
                            var data = {
                                projectId: qs_proj(),
                                status: 3
                            };
                            api_ajax_post('project/transfer_status', data, {
                                succ: function(json) {
                                    project.tip('已开始', 'succ', '');
                                    setTimeout(function() {
                                        location.reload();
                                    }, 3000);
                                },
                                fail: function(json) {
                                    alert(json.errmsg);
                                }
                            });
                        }
                    }
                    break;
                case 3: // 服务中(已点击“开始服务”)
                    btn_main.text('完成现场服务');
                    this.main_action = function() {
                        // 跳到提交“维修记录”页
                        location.href = '/engineer/log-repair.html?project=' + qs_proj();
                    }
                    break;
                case 4: // (服务)已完成，待回访
                    var msg = '服务已完成，待回访' 
                    tlog(msg);
                    btn_main.text(msg).prop('disabled', true);
                    break;
                case 5: // 已结束
                    var msg = '已结束' 
                    tlog(msg);
                    btn_main.text(msg).prop('disabled', true);
                    break;
                case 6: // 已终止
                    var msg = '已终止' 
                    tlog(msg);
                    btn_main.text(msg).prop('disabled', true);
                    break;
                default:
                    tlog('[!!!]Unknown status: ' + status);
                    showBtn = false;
                    break;
            }

            if (showBtn) {
                if (showBoth) {
                    $('.two-btns').removeHide();
                } else {
                    $('.single-btn').removeHide();
                }
            }
        }

        CON.prototype._ievent_mainAction = function(data, target, hit) {
            this.main_action();
        }
        CON.prototype._ievent_leftAction = function(data, target, hit) {
            this.left_action();
        }
            
        return CON;
    })();

    return Module;
})
