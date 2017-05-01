define(function() {
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
                    if (proj.main_img) {
                        proj.hasPic = '';
                        proj.noPic = 'hide';
                    } else {
                        proj.hasPic = 'hide';
                        proj.noPic = '';
                    }

                    document.title = proj.name;
                    $(_this._els.deTitle).text(proj.status_name);
                    _this.doRender(proj);

                    project.getIModule('imodule://controlProcessMD', null, function(mod) {
                        mod.render(proj);
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
            }else{
                $(_this._els.tError).addHide();
                api_ajax_post('project/add_comment_to_project', data, {
                    succ: function(json) {
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
