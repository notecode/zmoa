define(["/global/iscripts/test/mock/api-4-project-detail.js"], function(mock) {
    var Module = (function() {
		var baseIModules = project.baseIModules;
        var CON = function(dom) {
            baseIModules.BaseIModule.call(this, dom);

            this.btn_action = null;

            var _this = this;
            var doRender = function(proj) {
                project.getIModule('imodule://detailsMD', null, function(mod) {
                    mod.render(proj);
                });

                project.getIModule('imodule://sparesMD', null, function(mod) {
                    mod.render(proj);
                });

                _this.renderBottomBtn(proj);
            }

            if (1 == qs('test')) {
                doRender(mock.project_info);
            } else {
                //project.events.addListener('login.ensured', function(event) {
                    api_ajax('project/detail/' + qs_proj(), {
                        succ: function(json) {
                            doRender(json.project_info);
                        },
                        fail: function(json) {
                            alert(json.errmsg);
                        }
                    });
                //});
            }
        };
        potato.createClass(CON, baseIModules.BaseIModule);
        
        CON.prototype.renderBottomBtn = function(proj) {
            var showBtn = true;
            var btn = this.find('.bottom-btn');
            var status = parseInt(proj.status);
            var srv_u = proj.service_user || {};
            var sched = (srv_u.start_date && srv_u.end_date);

            switch (status) {
                case 1: // 已立项，待派人 
                    var msg = '已立项，待派人';
                    tlog(msg + ' (手机端理论上不应在这个阶段打开此项目)');
                    btn.text(msg).prop('disabled', true);
                    break;
                case 2: // 排期中(又细分2个阶段：已派人，但未排期；已排期，但未开始服务)
                    if (!sched) {
                        btn.text('立即排期');
                        this.btn_action = function() {
                            // 跳到排期页
                            location.href = '/engineer/schedule.html?project=' + qs_proj();
                        }
                    } else {
                        btn.text('开始现场服务');
                        this.btn_action = function() {
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
                    btn.text('完成现场服务');
                    this.btn_action = function() {
                        // 跳到提交“维修记录”页
                        location.href = '/engineer/log-repair.html?project=' + qs_proj();
                    }
                    break;
                case 4: // (服务)已完成，待回访
                    var msg = '服务已完成，待回访' 
                    tlog(msg);
                    btn.text(msg).prop('disabled', true);
                    break;
                case 5: // 已结束
                    var msg = '已结束' 
                    tlog(msg);
                    btn.text(msg).prop('disabled', true);
                    break;
                case 6: // 已终止
                    var msg = '已终止' 
                    tlog(msg);
                    btn.text(msg).prop('disabled', true);
                    break;
                default:
                    tlog('[!!!]Unknown status: ' + status);
                    showBtn = false;
                    break;
            }

            if (showBtn) {
                btn.toggle();
            }
        }

        CON.prototype._ievent_action = function(data, target, hit) {
            this.btn_action();
        }
            
        return CON;
    })();

    return Module;
})
