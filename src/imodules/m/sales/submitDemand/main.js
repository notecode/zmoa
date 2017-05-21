define(function() {
    var Module = (function() {
		var baseIModules = project.baseIModules;
        var CON = function(dom) {
            baseIModules.BaseIModule.call(this, dom);
            this.tpl = this._els.tpl[0].text;
            this.addressTpl = this._els.tpl[1].text;
            this.cityTpl = this._els.tpl[2].text;
            this.areaTpl = this._els.tpl[3].text;
            this.stockTpl = this._els.tpl[4].text;
            this.id = qs('project_id');
            this.provinceId = '';
            this.mgetMyPro();
            
        };
        potato.createClass(CON, baseIModules.BaseIModule);

        //获取详细信息
        CON.prototype.mgetMyPro = function() {
            var _this = this;
            var id=this.id;
            var localaddress = window.localStorage.getItem('address');

            api_ajax('project/detail/' + id, {
                succ: function(json) {
                    //颜色

                    var dom = Mustache.render(_this.tpl, json); 
                    $(_this._els.detailInfo).html(dom);

                    _this.addressItems();
                },
                fail: function(json) {

                }
            });
        }

        // 获取地址列表
        CON.prototype.addressItems = function() {      
            var dtd = $.Deferred();
            var _this = this;
            var addressCache = window.localStorage.getItem('address');
            var addressObj = '';
            var provinceName = '省份';
            var cityName = "城市";
            var areaName = "区/县";
            try {
                addressObj = JSON.parse(addressCache);   
                _this.address = addressObj;
                dtd.resolve();
            } catch (error) {
                addressObj = {};
                dtd.reject()
            }  
            
            api_ajax('region/get_region', {
                succ: function(data) {
                    var pId = $('.proviceval').data().provice;
                    var cId = $('.cityeval').data().city;
                    var aId = $('.areaeval').data().area;
                    if (data) {
                        dtd.resolve();
                        _this.address = data;
                        //根据省份id查找省份名称
                        for (var i=0; i<data.province.length; i++){
                            if (parseInt(data.province[i].id) == parseInt(pId)){
                                provinceName = data.province[i].name;
                            }
                        }
                        $('.proviceval').text(provinceName);

                        //根据城市id查找城市名称
                        for (var i=0; i<data.city.length; i++){
                            if (parseInt(data.city[i].id) == parseInt(cId)){
                                cityName = data.city[i].name;
                            }
                        }
                        $('.cityeval').text(cityName);

                        //根据区域id查找区域名称
                        for (var i=0; i<data.area.length; i++){
                            if (parseInt(data.area[i].id) == parseInt(aId)){
                                areaName = data.area[i].name;
                            }
                        }
                        $('.areaeval').text(areaName);
                        

                        var domStr = Mustache.render(_this.addressTpl, { items: data.province });
                        $('.js-addres-city').html(domStr);
                        window.localStorage.setItem('address', JSON.stringify(data))
                    }
                },
                fail: function(json) {
                    dtd.reject();
                    console.log('获取地址数据失败!');                    
                }
            });  
            return dtd.promise();
        }

        
        
        CON.prototype._ievent_provice = function(){
            $(this._els.infoMask).removeHide();
            $(this._els.selProvice).removeHide();
        }

        CON.prototype._ievent_city = function(){
            $(this._els.infoMask).removeHide();
            $(this._els.selCity).removeHide();
        }

        CON.prototype._ievent_district = function(){
            $(this._els.infoMask).removeHide();
            $(this._els.selDistrict).removeHide();
        }

        CON.prototype._ievent_Mask = function(){
            $(this._els.infoMask).addHide();
            $(this._els.selProvice).addHide();
            $(this._els.selCity).addHide();
            $(this._els.selDistrict).addHide();
        }

        CON.prototype._ievent_clickPro = function(data, target, hit){
            var $el =  $(target);
            var $data = $el.data();
            var $ul = $el.closest('ul');
            var addressId = $data.id + '';
            var type = $ul.data('type');
            $('.proviceval').html($data.name);
            $('#textPro').val($data.id);
            if (!!type) {
                var cityArr = this.address[type].filter(function(item) { 
                    return item.parent_id === addressId;
                });
                var domStr = Mustache.render(this.cityTpl, { items: cityArr });
                $(this._els.selectedcc).html(domStr);

                if (type === 'city') {
                    $('.cityeval').html('城市');
                    $('.areaeval').html('区/县');
                    $('#textCity').val('');
                    $('#textArea').val('');
                } else {
                    $('.areaeval').html('区/县');
                    $('#textArea').val('');
                }
            }
            $(this._els.infoMask).addHide();
            $(this._els.selProvice).addHide();
        }

        CON.prototype._ievent_clickCit = function(data, target, hit){
            var $el =  $(target);
            var $data = $el.data();
            var $ul = $el.closest('ul');
            var addressId = $data.id + '';
            var type = $ul.data('type');
            $('.cityeval').html($data.name);
            $('#textCity').val($data.id);
            if (!!type) {
                var cityArr = this.address[type].filter(function(item) { 
                    return item.parent_id === addressId;
                });
                var domStr = Mustache.render(this.areaTpl, { items: cityArr });
                $(this._els.selectedar).html(domStr);

            }

            $(this._els.infoMask).addHide();
            $(this._els.selCity).addHide();
        }

        CON.prototype._ievent_clickDis = function(data, target, hit){
            var $el =  $(target);
            var $data = $el.data();
            var $ul = $el.closest('ul');
            var addressId = $data.id + '';
            var type = $ul.data('type');
            $('.areaeval').html($data.name);
            $('#textArea').val($data.id);
            $(this._els.infoMask).addHide();
            $(this._els.selDistrict).addHide();
        }

        //备品数量减少
        CON.prototype._ievent_subtract = function(data, target, hit){
            var num = parseInt($(target).next().text());
            if (num > 0){
                $(target).next().text(num-1);
                $(target).next().removeClass('spare-hui');
                $(target).parent().find('.apareHid').val(num - 1);
            } 

            if(num < 2){
                $(target).next().addClass('spare-hui');
            }
        }

        //备品数量增加
        CON.prototype._ievent_theSum = function(data, target, hit){
            var num = parseInt($(target).prev().text());
            $(target).prev().text(num + 1);
            $(target).prev().addClass('spare-hui');
            $(target).parent().find('.apareHid').val(num + 1);

            if(num >= 0){
                $(target).prev().removeClass('spare-hui');
            }
        }
        //备品添加
        CON.prototype._ievent_partsAdd = function(){
            var domStr = Mustache.render(this.stockTpl);
            $('.parts').append(domStr);
        }

         // 添加需求
        CON.prototype._ievent_submitForm = function(el, target) {
            var _this = this;
            var $tipEl = $(this._els.LErrorTip);
            var $checks = $('.js-check-el');
            
            for (var index = 0; index < $checks.length; index++) {
                var $el = $checks.eq(index);
                var $tip = $el.data('tip');
                var $val = $el.val().trim();
                if (!$val) {
                    $tipEl.html($tip);
                    $tipEl.addClass('slideUp');
                    return false
                }
            }

            var data = $(target).serializeJSON();
            data.description = filterCR(data.description);

            var preparationArr = [];
            if (!!data.preparation) {
                if ($.isArray(data.preparation.name)) {
                    data.preparation.name.map(function(item, index) {
                        if (item && data.preparation.number[index]) {
                            preparationArr.push({ name: item, number: data.preparation.number[index] })
                        }
                    })
                } else if(!$.isEmptyObject(data.preparation) && data.preparation.name && data.preparation.number) {
                    preparationArr.push({ name: data.preparation.name, number: data.preparation.number })
                }
            }
            data.preparation = preparationArr;
            api_ajax_post('project/edit', data, {
                succ: function(res) {
                    $tipEl.html('');
                    $tipEl.removeClass('slideUp');
                    //打开故障页面
                    location.href="/sales/fault.html?project_id="+_this.id;
                },
                fail: function(json) {
                    if(!$.isEmptyObject(json)) {
                        $tipEl.html(json.errmsg);
                    } else {
                        $tipEl.html('系统错误');
                    }
                    
                }
            });
            return false;
        }

        //给颜色的input赋值
        CON.prototype._ievent_selColor = function(data, target){
            var colorId = parseInt($(target).data().color);
            $('#basiColor').removeClass();
            $('#basiColor').addClass('basics-select');
            $('#basiColor').addClass('colorActive'+colorId);
            $('#basiColor').prev().prev().val(colorId);
        }

        //给颜环境的input赋值
        CON.prototype._ievent_selenvir = function(data, target){
            var colorId = parseInt($(target).data().color);
            $('#basiEnvir').removeClass();
            $('#basiEnvir').addClass('basics-select');
            $('#basiEnvir').addClass('envirActive'+colorId);
            $('#basiEnvir').prev().prev().val(colorId);
        }

        return CON;
    })();

    return Module;
})
