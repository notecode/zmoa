define(["/global/iscripts/libs/time/moment.js"], function(moment) {
    var Module = (function() {
		var baseIModules = project.baseIModules;
        var CON = function(dom) {
            baseIModules.BaseIModule.call(this, dom);
            this.tpl = this._els.tpl[0].text;
            this.turnFor();
            var _this = this;
            project.events.addListener('login.ensured', function(event) {
                _this.getList();
            });
		    project.getIModule("imodule://Gaid"); // 后加载，以保证addListener已执行
        };
        potato.createClass(CON, baseIModules.BaseIModule);
		
		CON.prototype.getList = function() {
            var _this = this;
            api_ajax('project/projects_for_engineer', {
                succ: function(json) {
                    var list0 = json.projects.list;
                    for (var i = 0; i < list0.length; i++){
                        // notecode: 没有end_date，视为未排期(因为排期必须是有起止时间的)。
                        //           如果仅有start_date，那是管理员派人的时间
                        if (list0[i].start_date && list0[i].end_date) {
                            list0[i].start = moment(list0[i].start_date).format('M月DD日');
                            list0[i].end = moment(list0[i].end_date).format('M月DD日');
                        }
                    }

                    var dom = Mustache.render(_this.tpl, json); 
                    $(_this._els.proRunning).html(dom);
                },
                fail: function(json) {
                    alert(json.errmsg);
                }
            });
        }

        CON.prototype.turnFor = function(){
            var _this = this;
            $(this._els.proRunning).on('click','.list-implement',function(e){
                var pid = $(this).data().id;
                location.href='/project/detail.html?projectId=' + pid;
            })

            $(this._els.proRunning).on('click','.list-depot',function(e){
                $(_this._els.rMask).removeHide();
                $(_this._els.depotRepair).addClass('slideUp');
            })
        }

        CON.prototype._ievent_closeMask = function(data, target, hit){
            var _this = this;
            $(target).addHide();
            $(_this._els.depotRepair).removeClass('slideUp');
        }
        
        return CON;
    })();

    return Module;
})
