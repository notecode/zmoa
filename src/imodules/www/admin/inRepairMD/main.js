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
            dest.html($(this.dom));
            cb && cb();


            api_ajax('project/parts_repair_status/' + this.projId, {
                succ: function(json) {
                    if(json.repair_parts){
                        for(var i=0; i<json.repair_parts.length; i++) {
                            if(json.repair_parts[i].status == 0) {//为0是测试通过，1等待维修,2是已完成
                                json.repair_parts[i].isrepair = 'current1';
                            }else if(json.repair_parts[i].status == 1){
                                json.repair_parts[i].isrepair = 'current2';
                            }else if(json.repair_parts[i].status == 2){
                                json.repair_parts[i].isrepair = 'current3';
                            }else {
                                json.repair_parts[i].isrepair = ' ';
                            }
                        }
                    }
                    var dom = Mustache.render(_this.tpl, json);
                    $(_this._els.pairbox).html(dom);
                },
                fail: function(json) {
                    tlog('failed');
                }
            });
        }

        CON.prototype.Progress = function(){
            var _this = this;
            var repairLen = $('.schbody').length;
            var selectedLen = $('.hasVal').length;
            $('#tageNum').html(Math.round(selectedLen/repairLen)*100);
            $('#Percentage').css('width',Math.round(selectedLen/repairLen*100) + '%');

            if($('#tageNum').html() == 100){
                $('.percent-btn').removeAttr('disabled');
            }else{
                $('.percent-btn').attr("disabled", true);
            }
        }

        CON.prototype._ievent_wRepair = function(data, target, hit){
            if($(target).index() == 0){
                $(target).parent().find('.sch-sel').addClass('current1').siblings().removeClass('current2 current3');
                $(target).parent().find('.status').val(0);
                $(target).parent().find('.status').addClass('hasVal');
            }else if($(target).index() == 1){
               $(target).parent().find('.sch-sel').addClass('current2').siblings().removeClass('current1 current3');
               $(target).parent().find('.status').val(1); 
                $(target).parent().find('.status').addClass('hasVal');
            }else if($(target).index() == 2){
                $(target).parent().find('.sch-sel').addClass('current3').siblings().removeClass('current1 current2');
                $(target).parent().find('.status').val(2); 
                $(target).parent().find('.status').addClass('hasVal');
            }else{
                $(target).parent().find('.sch-sel').removeClass('current1 current2 current3');
                $(target).parent().find('.status').val(''); 
                $(target).parent().find('.status').removeClass('hasVal');
            }

            this.Progress();
        }

        return CON;
    })();

    return Module;
})

