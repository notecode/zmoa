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
            this.contMaxH = maxH;

            var _this = this;
            // if($('#inRepairMD')){
            //     $('#inRepairMD').hide();
            // }
            // $('#inTestingMD').show();
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

                    _this.clickTest()

                    $('#proID').val(proj.id);
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
            $('#tTageNum').html(Math.round(selectedLen/repairLen*100));
            $('#tPercentage').css('width',Math.round(selectedLen/repairLen*100) + '%');

            if($('#tTageNum').html() > 0){
                $('.percent-mit').removeAttr('disabled');
            }else{
                $('.percent-mit').attr("disabled", true);
            }
        }

        CON.prototype.clickTest = function(){
            var _this = this;
            $(this._els.testBox).on('click', '.sch-sel', function(){
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

                _this.submitProgress();
            })
        }

        CON.prototype._ievent_testingSubmit = function(el, target){
            var data = $(target).serializeJSON();
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
                    
                },
                fail: function(json) {
                    alert('提交失败');
                }
            })
        }
       

        return CON;
    })();

    return Module;
})

