define(function() {
    var Module = (function() {
		var baseIModules = project.baseIModules;
        var CON = function(dom) {
            baseIModules.BaseIModule.call(this, dom);
            this.tpl = this._els.tpl[0].text;
        };
        potato.createClass(CON, baseIModules.BaseIModule);
		
        CON.prototype.render = function(proj, dest, maxH, cb) {
            this.projId = proj.id;
            this.contMaxH = maxH;

            var _this = this;
            api_ajax('project/parts_repair_status/' + this.projId, {
                succ: function(json) {
                    if (json.repair_parts) {
                        for(var i=0; i<json.repair_parts.length; i++) {
                            if(json.repair_parts[i].status == 0) {//为0是测试通过，1等待维修,2是已完成
                                json.repair_parts[i].isrepair = 'current1';
                                json.repair_parts[i].haveStatus = 'hasVal';
                            }else if(json.repair_parts[i].status == 1){
                                json.repair_parts[i].isrepair = 'current2';
                                json.repair_parts[i].haveStatus = 'hasVal';
                            }else if(json.repair_parts[i].status == 2){
                                json.repair_parts[i].isrepair = 'current3';
                                json.repair_parts[i].haveStatus = 'hasVal';
                            }else {
                                json.repair_parts[i].isrepair = ' ';
                                json.repair_parts[i].haveStatus = '';
                            }
                        }
                    }
                    var dom = Mustache.render(_this.tpl, json);
                    $(_this._els.pairbox).html(dom);

                    dest.html($(_this.dom));
                    cb && cb();

                    project.getIModule('imodule://progressBarMD', null, function(mod) {
                        var perc = _this.find('.hasVal').length / _this.find('.schbody').length;
                        mod.initRender4Switch('指派', true, perc * 100, proj);
                    });
                },
                fail: function(json) {
                    tlog('failed');
                }
            });
        }

        return CON;
    })();

    return Module;
})

