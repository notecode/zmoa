define(function() {
    var Module = (function() {
		var baseIModules = project.baseIModules;
        var CON = function(dom) {
            baseIModules.BaseIModule.call(this, dom);
            this.tpl = this._els.tpl[0].text;

            var _this = this;
            project.events.addListener('login.ensured', function(event) {
                _this.mgetMyPro();
            });

            // 此为module，不是page。所在page已有下面这句，故这里就不需要了
		    // project.getIModule("imodule://Gaid"); 
        };
        potato.createClass(CON, baseIModules.BaseIModule);

        CON.prototype.mgetMyPro = function() {
            var _this = this;
            api_ajax('project/my_projects', {
                succ: function(json) {
                    //判断有无需求
                    if(json.count <= 0) {
                        json.noDemand = '';
                        json.haveDemand = 'hide';
                    } else {
                        json.noDemand = 'hide';
                        json.haveDemand = '';
                    }

                    //未展开时的当前状态
                    if(json.list){
                        for(var i=0; i<json.list.length; i++){
                            switch (parseInt(json.list[i].status)) {
                                case 1: // 已立项，待派人 
                                    //$(_this._els.curStage).text('xxx');
                                    json.list[i].currentStatus = '已审批，待派人';
                                    break;
                                case 2: // 排期中(又细分2个阶段：已派人，但未排期；已排期，但未开始服务)
                                    json.list[i].currentStatus = '排期中';
                                    break;
                                case 3: // 服务中(已点击“开始服务”)
                                    json.list[i].currentStatus = '服务中';
                                    break;
                                case 4: // (服务)已完成，待回访
                                    json.list[i].currentStatus = '已完成，待回访';
                                    break;
                                case 5: // 已结束
                                    json.list[i].currentStatus = '已结束';
                                    break;
                                default: // -1(待审批), -2(已驳回)暂都这里来
                                    json.list[i].currentStatus = '已立项，待审批';
                                    break;
                            }
                        }
                    }
                    _this.proInfoRender(json);


                },
                fail: function(json) {

                }
            });
        }

        CON.prototype.proInfoRender = function(ctx) {
            var _this = this;
            var dom = Mustache.render(this.tpl, ctx); 
            this.find('#myProject').html(dom);
        }

       

        CON.prototype._ievent_oaa = function(data, target, hit){
            var statusone = $(target).parent().find('.has-first');
            var statusother = $(target).parent().find('.has-status');
            if($(target).hasClass('hascurrent')) {
                statusone.removeHide();
                statusother.addHide();
                $(target).removeClass('hascurrent')
            }else{
                statusone.addHide();
                statusother.removeHide();
                $(target).addClass('hascurrent')
            }
        }
     
        return CON;
    })();

    return Module;
})
