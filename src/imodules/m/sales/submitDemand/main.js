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
            this.id = qs_proj();
            this.provinceId = '';

            // 最末的“补充说明”稍麻烦：
            // 1. 取comments中最后一条展示
            // 2. 如果修改了，才需提交一条comment给后端（通过edit接口的last_comment参数）
            this.initLastComment = '';

            var _this = this;
            project.events.addListener('login.ensured', function(event) {
                _this.mgetMyPro();
                _this.clickpro();
                _this.clickcit();
                _this.clickarea();
                _this.closemask();
            });
		    project.getIModule("imodule://Gaid"); // 后加载，以保证addListener已执行
        };
        potato.createClass(CON, baseIModules.BaseIModule);

        //获取详细信息
        CON.prototype.mgetMyPro = function() {
            var _this = this;
            var id=this.id;
            var localaddress = window.localStorage.getItem('address');
            api_ajax('project/detail/' + id, {
                succ: function(json) {
                    // 判断面积是否为0
                    if(json.project_info.screen_area == 0){
                        json.project_info.screen_area = '';
                    }

                    // 展示最新一条comment。因返回的数据是以时间由新到旧排的，故取第0条
                    var comments = json.project_info.comments;
                    json.project_info.last_comment = (comments.length > 0) ? comments[0].comment : '';
                    _this.initLastComment = json.project_info.last_comment;

                    var dom = Mustache.render(_this.tpl, json); 
                    $(_this._els.detailInfo).html(dom);

                    _this.addressItems();
                    _this.partsNull();
                },
                fail: function(json) {
                    alert('请求失败')
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
            //$(this._els.selProvice).removeHide();
            $(this._els.selProvice).addClass('slideUp');
        }

        CON.prototype._ievent_city = function(){
            $(this._els.infoMask).removeHide();
            //$(this._els.selCity).removeHide();
            $(this._els.selCity).addClass('slideUp');
        }

        CON.prototype._ievent_district = function(){
            $(this._els.infoMask).removeHide();
            //$(this._els.selDistrict).removeHide();
            $(this._els.selDistrict).addClass('slideUp');
        }

        //CON.prototype._ievent_Mask = function(){
        CON.prototype.closemask = function(){
            var _this = this;
            $(this._els.infoMask).click(function(){
                $(_this._els.infoMask).addHide();
                $(_this._els.selProvice).removeClass('slideUp');
                $(_this._els.selCity).removeClass('slideUp');
                $(_this._els.selDistrict).removeClass('slideUp');
            })
        }

        //CON.prototype._ievent_clickPro = function(data, target, hit){
        CON.prototype.clickpro = function(){
            var _this = this;
            $('.js-addres-city').on('click','li',function(e){
                var $el =  $(e.target);
                var $data = $el.data();
                var $ul = $el.closest('ul');
                var addressId = $data.id + '';
                var type = $ul.data('type');
                $('.proviceval').html($data.name);
                $('#textPro').val($data.id);
                if (!!type) {
                    var cityArr = _this.address[type].filter(function(item) { 
                        return item.parent_id === addressId;
                    });
                    var domStr = Mustache.render(_this.cityTpl, { items: cityArr });
                    $(_this._els.selectedcc).html(domStr);

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
                $(_this._els.infoMask).addHide();
                $(_this._els.selProvice).removeClass('slideUp');
            })
        }

        //CON.prototype._ievent_clickCit = function(data, target, hit){
        CON.prototype.clickcit = function(){
            var _this = this;
            $(_this._els.selectedcc).on('click','li',function(e){
                var $el =  $(e.target);
                var $data = $el.data();
                var $ul = $el.closest('ul');
                var addressId = $data.id + '';
                var type = $ul.data('type');
                $('.cityeval').html($data.name);
                $('#textCity').val($data.id);
                if (!!type) {
                    var cityArr = _this.address[type].filter(function(item) { 
                        return item.parent_id === addressId;
                    });
                    var domStr = Mustache.render(_this.areaTpl, { items: cityArr });
                    $(_this._els.selectedar).html(domStr);

                }

                $(_this._els.infoMask).addHide();
                $(_this._els.selCity).removeClass('slideUp');
            });
        }

        //CON.prototype._ievent_clickDis = function(data, target, hit){
        CON.prototype.clickarea = function(){
            var _this = this;
            $(_this._els.selectedar).on('click','li',function(e){
                var $el =  $(e.target);
                var $data = $el.data();
                var $ul = $el.closest('ul');
                var addressId = $data.id + '';
                var type = $ul.data('type');
                $('.areaeval').html($data.name);
                $('#textArea').val($data.id);
                $(_this._els.infoMask).addHide();
                $(_this._els.selDistrict).removeClass('slideUp');
            });
        }

        //备品数量减少
        CON.prototype._ievent_subtract = function(data, target, hit){
            var num = parseInt($(target).next().text());
            var numName = $(target).parents('li').find('.parts-new').val().trim();
            var $tipEl = $(this._els.LErrorTip);

            //当备品名称不为空时才可点击数量
            if(numName){
                if (num > 0){
                    $(target).next().text(num-1);
                    $(target).next().removeClass('spare-hui');
                    $(target).parent().find('.apareHid').val(num - 1);
                } 

                if(num < 2){
                    $(target).next().addClass('spare-hui');
                }
            } else {
                $tipEl.html('备品名称不能为空');
                $tipEl.addClass('slideUp');
                setTimeout(function(){
                    $tipEl.removeClass('slideUp');
                },4000)
            }
        }

        //备品数量增加
        CON.prototype._ievent_theSum = function(data, target, hit){
            var num = parseInt($(target).prev().text());
            var numName = $(target).parents('li').find('.parts-new').val().trim();
            var $tipEl = $(this._els.LErrorTip);
            
            //当备品名称不为空时才可点击数量
            if(numName){
                $(target).prev().text(num + 1);
                $(target).prev().addClass('spare-hui');
                $(target).parent().find('.apareHid').val(num + 1);

                if(num >= 0){
                    $(target).prev().removeClass('spare-hui');
                }
            } else {
                $tipEl.html('备品名称不能为空');
                $tipEl.addClass('slideUp');
                setTimeout(function(){
                    $tipEl.removeClass('slideUp');
                },4000)
            }
        }
        //备品添加
        CON.prototype._ievent_partsAdd = function(){
            var domStr = Mustache.render(this.stockTpl);
            $('.parts').append(domStr);
        }

        //当备品名称为空时，备品数量设置为0；
        CON.prototype.partsNull = function(){
            $('.parts-new').bind('input propertychange','textarea', debounce(function (e) {
                var $target = $(e.target)
                if($target.val().trim() == ''){
                    $target.parents('li').find('.spare-count').text(0).addClass('spare-hui');
                }
            }, 100));
        }

         // 添加需求
        CON.prototype._ievent_submitForm = function(el, target) {
            var _this = this;
            var $tipEl = $(_this._els.LErrorTip);
            var $checks = $('.js-check-el');
            
            for (var index = 0; index < $checks.length; index++) {
                var $el = $checks.eq(index);
                var $tip = $el.data('tip');
                var $val = $el.val().trim();
                if (!$val) {
                    $tipEl.html($tip);
                    $tipEl.addClass('slideUp');
                    setTimeout(function(){
                        $tipEl.removeClass('slideUp');
                    },4000)
                    return false
                }
            }

            var data = $(target).serializeJSON();
            var lastC = filterCR(data.last_comment);
            data.last_comment = (lastC != this.initLastComment) ? lastC : '';

            var partsArr = [];
            if (!!data.parts) {
                if ($.isArray(data.parts.name)) {
                    data.parts.name.map(function(item, index) {
                        if (item && data.parts.spec[index] && data.parts.backup_number[index]) {
                            partsArr.push({
                                name: item, 
                                spec: data.parts.spec[index],
                                backup_number: data.parts.backup_number[index]
                            })
                        }
                    })
                } else if(!$.isEmptyObject(data.parts) && data.parts.name && data.parts.spec && data.parts.backup_number) {
                    partsArr.push({ 
                        name: data.parts.name, 
                        spec: data.parts.spec,
                        backup_number: data.parts.backup_number
                    });
                }
            }
            data.parts = partsArr;
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
                        $tipEl.addClass('slideUp');
                        setTimeout(function(){
                            $tipEl.removeClass('slideUp');
                        },4000)
                    } else {
                        $tipEl.html('系统错误');
                        $tipEl.addClass('slideUp');
                        setTimeout(function(){
                            $tipEl.removeClass('slideUp');
                        },4000)
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
