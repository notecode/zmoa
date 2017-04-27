define(function() {
    var Module = (function() {
        var baseIModules = project.baseIModules;
        var CON = function(dom) {
            baseIModules.BaseIModule.call(this, dom);
            this.byDetail();
            this.getMydemand();
            this.tpl = this._els.tpl[0].text;
            this.proId;
        };
        potato.createClass(CON, baseIModules.BaseIModule);

        CON.prototype.byDetail = function() {
            var _this =  this;
            api_ajax('project/detail/1', {
                succ: function(json) {
                    //判断有无图片
                    if(json.main_img){
                        json.hasPic = '';
                        json.noPic = 'hide';
                    }else {
                        json.hasPic = 'hide';
                        json.noPic = '';
                    }
                    //状态
                    $(_this._els.deTitle).text(json.status_name);
                    _this.proId = json.id;
                    _this.doRender(json);

                    project.getIModule('imodule://controlProcessMD', null, function(mod) {
                        mod.render(json);
                    });
                },
                fail: function(json) {

                }
            });
        }

        CON.prototype.doRender = function(ctx) {
            var _this = this;
            var dom = Mustache.render(this.tpl, ctx); 
            this.find('#detailCon').append(dom);
        }

        //发表补充说明
        CON.prototype._ievent_recallSave = function() {
            var _this = this;
            var text = $(_this._els.reTextarea).val();
            var data = {
                projectId : _this.proId,
                comment: text
            };
            if (text == ''){
                $(_this._els.tError).removeHide();
            }else{
                $(_this._els.tError).addHide();
                api_ajax_post('project/add_comment_to_project', data, {
                    succ: function(json) {
                        project.getIModule('imodule://SubmitSuccess', null, function (modal) {
                            project.open(modal, '_blank', 'content');
                        });
                    },
                    fail: function(json) {
                        alert('提交失败')
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
