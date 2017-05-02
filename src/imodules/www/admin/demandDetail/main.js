define(["/global/iscripts/libs/time/moment.js"], function(moment) {
    var Module = (function() {
        var baseIModules = project.baseIModules;
        var CON = function(dom) {
            baseIModules.BaseIModule.call(this, dom);
            this.byDetail();
            this.getMydemand();
            this.tpl = this._els.tpl[0].text;
        };
        potato.createClass(CON, baseIModules.BaseIModule);

        CON.prototype.byDetail = function() {
            var _this =  this;
            api_ajax('project/detail/' + qs_proj(), {
                succ: function(json) {
                    var proj = json.project_info;

                    // 若是“待派人”状态，且是管理员登录，就跳到派人页
                    if (1 == proj.status && 1 == json.user_role) {
                        location.href = '/admin/assign.html?project=' + qs_proj();
                    }

                    if (proj.main_img) {
                        proj.hasPic = '';
                        proj.noPic = 'hide';
                    } else {
                        proj.hasPic = 'hide';
                        proj.noPic = '';
                    }

                    document.title = proj.name;
                    $(_this._els.deTitle).text(proj.status_name);
                    _this.addScheduleFn(proj);
                    _this.doRender(proj);

                    project.getIModule('imodule://controlProcessMD', null, function(mod) {
                        var is_admin = (1 == json.user_role);
                        mod.render(proj, is_admin);
                    });

                    // 后显示“添加补充说明”那块
                    _this.find('.comment-block').toggle();
                },
                fail: function(json) {
                    alert(json.errmsg);
                }
            });
        }

        CON.prototype.doRender = function(proj) {
            var _this = this;
            var dom = Mustache.render(this.tpl, proj); 
            this.find('#detailCon').append(dom);
        }

        CON.prototype.addScheduleFn = function(proj) {
            var worker = proj.service_user || {};
            proj.fn = {
                sched: function() {
                    var start = worker.start_date;
                    return (start && start.length > 0) ? 'show' : 'hide';
                },
                worker: function() {
                    var name = worker.name;
                    return (name ? name : '');
                },
                sch_start: function() {
                    var start = worker.start_date;
                    return start ? moment(start).format('M月DD日') : '';
                },
                sch_end: function() {
                    var end = worker.end_date;
                    return end ? moment(end).format('M月DD日') : '';
                }
            }
        }

        //发表补充说明
        CON.prototype._ievent_recallSave = function() {
            var _this = this;
            var text = $(_this._els.reTextarea).val();
            var data = {
                projectId : qs_proj(),
                comment: text
            };

            if (text == ''){
                $(_this._els.tError).removeHide();
            } else {
                $(_this._els.tError).addHide();
                api_ajax_post('project/add_comment_to_project', data, {
                    succ: function(json) {
                        var cmt = _this.find('.comment-tpl > div').clone();
                        cmt.find('.comment-words').text(text);
                        _this.find('.comment-list').prepend(cmt);
                        $(_this._els.reTextarea).val('');
                    },
                    fail: function(json) {
                        alert(json.errmsg);
                    }
                }); 
            }
        }

        //获取我的需求数
        CON.prototype.getMydemand = function() {
            var _this =  this;
            api_ajax('project/my_projects', {
                succ: function(json) {
                    $(_this._els.mydemandCount).text(json.count)
                },
                fail: function(json) {
                }
            });
        }

        CON.prototype._ievent_showStatus = function() {
            this.find('#controlProcessMD').toggle();

            // todo: 点击其他区域，消失
        }

        return CON;
    })();
    return Module;
});
