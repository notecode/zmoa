define(function() {
    var Module = (function() {
		var baseIModules = project.baseIModules;
        var CON = function(dom) {
            baseIModules.BaseIModule.call(this, dom);
            this.tpl = this._els.tpl[0].text;
            this.projId = '';
        };
        potato.createClass(CON, baseIModules.BaseIModule);
		
        CON.prototype.render = function(proj, dest, maxH, cb) {
            this.projId = proj.id;
            var _this = this;
            api_ajax('project/parts_repair_status/' + this.projId, {
                succ: function(json) {
                    if(json.repair_parts){
                        for(var i=0; i<json.repair_parts.length; i++) {
                            if(json.repair_parts[i].status == 1) {//为0是无需维修，为1则需要
                                json.repair_parts[i].isrepair = 'active1';
                            }else if(json.repair_parts[i].status == 0){
                                json.repair_parts[i].isrepair = 'active2';
                            }else {
                                json.repair_parts[i].isrepair = ' ';
                            }
                        }
                    }

                    var dom = Mustache.render(_this.tpl, json);
                    $(_this._els.testBox).html(dom);

                    dest.html($(_this.dom));
                    cb && cb();

                    project.getIModule('imodule://progressBarMD', null, function(mod) {
                        mod.initRender('提交', false, 0, function(btn) {
                            _this.find('.btn-submit').click();
                        });
                    });

                    _this.bindClickTest();
                    _this.bindSubm();
                },
                fail: function(json) {
                    tlog('failed');
                }
            });
        }

        CON.prototype.bindClickTest = function(){
            var _this = this;
            $(this._els.testBox).off('click.test').on('click.test', '.sch-sel', function(){
                var obj = $(this).parent();
                if($(this).index() == 0){
                    obj.find('.sch-sel').addClass('active1').siblings().removeClass('active2');
                    obj.find('.status').val(0);
                    obj.find('.status').addClass('hasVal');
                }else if($(this).index() == 1){
                    obj.find('.sch-sel').addClass('active2').siblings().removeClass('active1'); 
                    obj.find('.status').val(1);
                    obj.find('.status').addClass('hasVal');
                }else{
                    obj.find('.sch-sel').removeClass('active1 active2'); 
                    obj.find('.status').val('');
                    obj.find('.status').removeClass('hasVal');
                }

                project.getIModule('imodule://progressBarMD', null, function(mod) {
                    var repairLen = $('.schbody').length;
                    var selectedLen = $('.hasVal').length;
                    var perc = (repairLen / selectedLen) * 100;
                    mod.updatePercent(perc);
                });
            })
        }

        CON.prototype.bindSubm = function() {
            var _this = this;
            $(this._els.testBox).off('click.subm').on('click.subm', '.btn-submit', function() {
                tlog('submit');
                var data = _this.find('[idom=theForm]').serializeJSON();
                var statusArr = [];
                if (!!data.repair_parts) {
                    if ($.isArray(data.repair_parts.id)) {
                        data.repair_parts.id.map(function(item, index) {
                            if (item && data.repair_parts.status[index] && data.repair_parts.id[index]) {
                                statusArr.push({
                                    id: data.repair_parts.id[index],
                                    status: data.repair_parts.status[index]
                                })
                            }
                        })
                    } else if(!$.isEmptyObject(data.repair_parts) && data.repair_parts.id && data.repair_parts.status) {
                        statusArr.push({ 
                            id: data.repair_parts.id,
                            status: data.repair_parts.status
                        });
                    }
                } 
                data.repair_parts = statusArr;

                api_ajax_post('project/post_parts_repair_status', data, {
                    succ: function(json) {
                        if (0 == json.not_tested) {
                            window.onStatusTransfered4UI(_this.projId, -1);
                        }
                    },
                    fail: function(json) {
                        alert(json.errmsg);
                    }
                });
            });
        }
       

        return CON;
    })();

    return Module;
})

