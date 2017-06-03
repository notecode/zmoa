define(["/global/iscripts/libs/time/moment.js"], function(moment) {
    var Module = (function() {
		var baseIModules = project.baseIModules;
        var CON = function(dom) {
            baseIModules.BaseIModule.call(this, dom);
            this.tpl = this._els.tpl[0].text;
            this.popupTpl = this._els.tpl[1].text;

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
                    _this.bindClick();
                },
                fail: function(json) {
                    alert(json.errmsg);
                }
            });
        }

        CON.prototype.bindClick = function(){
            var _this = this;
            $(this._els.proRunning).on('click', '.project', function(e){
                var projId = $(this).data().id;
                if (0 == $(this).data().type) {
                    // 厂外项目
                    location.href='/project/detail.html?projectId=' + projId;
                } else {
                    _this.popupPartsPane(projId);
                }
            })
        }

        CON.prototype.popupPartsPane = function(projId) {
            var _this = this;
            var q = {ignore_done: 1};
            api_ajax_with_query('project/parts_repair_status/' + projId, q, {
                succ: function(json) {
                    var dom = Mustache.render(_this.popupTpl, json); 
                    $(_this._els.popup).empty().append(dom);
                    _this.bindRepairDone(projId);

                    $(_this._els.rMask).removeHide();
                    $(_this._els.depotRepair).addClass('slideUp');
                },
                fail: function(json) {
                    alert(json.errmsg);
                }
            })
        }

        CON.prototype.bindRepairDone = function(projId) {
            var _this = this;
            $(_this._els.popup).off('click.forDone').on('click.forDone', '.repair_done', function() {
                tlog('clicked');
                var jq = $(this);
                var data = {
                    projectId: projId,
                    partsId: $(this).data().id
                };
                api_ajax_post('project/post_parts_repair_done', data, {
                    succ: function(json) {
                        jq.parent().remove();

                        if (0 == json.not_repaired) {
                            location.reload();
                        }
                    },
                    fail: function(json) {
                        alert(json.errmsg);
                    }
                })
            });
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
