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

                },
                fail: function(json) {
                    tlog('failed');
                }
            });
        }

        CON.prototype.submitProgress = function(){
            var _this = this;
            var repairLen = $('.schbody').length;
            var selectedLen = $('.hasVal').length;
            $('#tageNum').html(selectedLen/repairLen*100);
            $('#Percentage').css('width',selectedLen/repairLen*100 + '%');

            if($('#tageNum').html() > 0){
                $('.percent-mit').removeAttr('disabled');
            }else{
                $('.percent-mit').attr("disabled", true);
            }
        }

        CON.prototype._ievent_Repair = function(data, target, hit){
            var obj = $(target).parent();
            if($(target).index() == 0){
                obj.find('.sch-sel').addClass('active1').siblings().removeClass('active2');
                obj.find('.status').val(0);
                obj.find('.status').addClass('hasVal');
            }else if($(target).index() == 1){
                obj.find('.sch-sel').addClass('active2').siblings().removeClass('active1'); 
                obj.find('.status').val(1);
                obj.find('.status').addClass('hasVal');
            }else{
                $(target).removeClass('active1 active2'); 
                obj.find('.status').val('');
                obj.find('.status').removeClass('hasVal');
            }

            this.submitProgress();
        }
       

        return CON;
    })();

    return Module;
})

