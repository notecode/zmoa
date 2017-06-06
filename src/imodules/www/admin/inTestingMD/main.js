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
            dest.append($(this.dom));
            cb && cb();


            api_ajax('project/parts_repair_status/' + this.projId, {
                succ: function(json) {
                    if(json.repair_parts){
                        for(var i=0; i<json.repair_parts.length; i++) {
                            if(json.repair_parts[i].status == 0) {//为0是需要维修，为1则不需要
                                json.repair_parts[i].isrepair = 'active1';
                            }else if(json.repair_parts[i].status == 1){
                                json.repair_parts[i].isrepair = 'active2';
                            }else {
                                json.repair_parts[i].isrepair = ' ';
                            }
                        }
                    }
                    var dom = Mustache.render(_this.tpl, json);
                    $(_this._els.testBox).html(dom);

                    _this.submitProgress();
                },
                fail: function(json) {
                    tlog('failed');
                }
            });
        }

        CON.prototype.submitProgress = function(){
            var _this = this;
            var repairLen = $('.needRepair').length;
            var selectedLen = $('.active1').length/2;
            $('#tageNum').html(selectedLen/repairLen*100);
            $('#Percentage').css('width',selectedLen/repairLen*100 + '%');

            if($('#tageNum').html() > 0){
                $('.percent-mit').removeAttr('disabled');
            }else{
                $('.percent-mit').attr("disabled", true);
            }
        }

        CON.prototype._ievent_Repair = function(data, target, hit){
            if($(target).index() == 0){
                $(target).addClass('active1').siblings().removeClass('active2');
            }else{
               $(target).addClass('active2').siblings().removeClass('active1'); 
            }

            this.submitProgress();
        }
       

        return CON;
    })();

    return Module;
})

