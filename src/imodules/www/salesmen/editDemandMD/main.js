define(function() {
    var Module = (function() {
        var baseIModules = project.baseIModules;
        var CON = function(dom) {
            var _this = this;
            baseIModules.BaseIModule.call(this, dom);
            this.tpl = this._els.tpl[0].text;
            this.addressTpl = this._els.tpl[1].text;
            this.stockTpl = this._els.tpl[2].text;
            // 基础信息下拉
            $(this._els.LContent).on('click', '.js-event-drop', function(e) {
                e.preventDefault();
                _this.dropDown(e.target)
            });
            // 地址下拉
            $(this._els.LContent).on('click', '.js-address-drop', function(e) {
                e.preventDefault();
                _this.addressDrop(e.target)
            });
            // 添加备品
            $(this._els.LContent).on('click', '.js-add-stock', function(e) {
                e.preventDefault();
                var domStr = Mustache.render(_this.stockTpl);
                $('.js-stock-list').append(domStr);
            });
            
        };
        potato.createClass(CON, baseIModules.BaseIModule);
        // 地址下拉框
        CON.prototype.addressDrop = function(target) {
            var $el =  $(target);
            var $data = $el.data();
            var $ul = $el.closest('ul');
            var $button = $ul.prev('button');
            var $input = $button.prev('input');
            var addressId = $data.id + '';
            var type = $ul.data('type');
            $button.children('.js-address-name').html($data.name);
            $input.val($data.id);
            if (!!type) {
                var cityArr = this.address[type].filter(function(item) { 
                    return item.parent_id === addressId;
                });
                var domStr = Mustache.render(this.addressTpl, { items: cityArr });
                $(this._els.LContent).find('.js-'+ type +'-drop').html(domStr);
                if (type === 'city') {
                    $(this._els.LContent).find('.js-city-name').html('城市');
                    $(this._els.LContent).find('.js-area-name').html('区/县');
                } else {
                    $(this._els.LContent).find('.js-area-name').html('区/县');
                }
            }

        }
        // 颜色选择下拉框
        CON.prototype.dropDown = function(target) {
            var $el = $(target);
            var $button = $el.closest('ul').prev('button');
            var $input = $button.prev('input');
            var $obj = $el.data();
            $button.children('.js-drop-name').html($obj.name);
            $input.val($obj.key);
        }
        // 设置默认值
        CON.prototype.setCtx = function(obj, isAdmin) {
            this.isAdmin = isAdmin;
            this.address = obj.all_region_data;
            this.data = obj;
            var filter = {
                province: function () {
                    return this.province_name || '所在省份';
                },
                city: function () {
                    return this.city_name || '城市';
                },
                area: function () {
                    return this.area_name || '区/县';
                },                                
                color: function () {
                    var name = '屏幕颜色';
                    if (!!this.screen_color) {
                        name = this.all_screen_color[parseInt(this.screen_color)] || '屏幕颜色'
                    }
                    return name
                },
                environment: function () {
                    var name = '应用环境';
                    if (!!this.apply_environment) {
                        name = this.all_apply_environment[parseInt(this.apply_environment)] || '应用环境'
                    }
                    return name                    
                }
            }
            var renderObj = $.extend(obj, filter);
            var domStr = Mustache.render(this.tpl, renderObj);
            $(this._els.LContent).html(domStr);
        }
        // 提交项目基本信息
        // 添加需求
        CON.prototype._ievent_submitForm = function(data, target) {
            var _this = this;
            var $tipEl = $(this._els.LErrorTip);
            var $checks = $('.js-check-el');
            for (var index = 0; index < $checks.length; index++) {
                var $el = $checks.eq(index);
                var $tip = $el.data('tip');
                var $val = $el.val();
                if (!$val) {
                    $tipEl.html($tip);
                    return false
                }
            }
            var data = $(target).serializeJSON();
            var preparationArr = [];
            if ($.isArray(data.preparation.name)) {
                data.preparation.name.map(function(item, index) {
                    preparationArr.push({ name: item, number: data.preparation.number[index] })
                })
            }
            data.preparation = preparationArr;
            api_ajax_post('project/edit', data, {
                succ: function(res) {
                    $tipEl.html('');
                    _this.showDemand(data);
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
        // 跳转到故障描述
        CON.prototype.showDemand = function(data) {
            var _this = this;
            data.id = this.data.id;
            data.job_number = this.data.job_number;
            data.salesman_id = this.data.salesman_id;
            data.salesman_name = this.data.salesman_name;
            // 关闭基本信息框
            this.parent.close();
            var onBack = function(mod) {
                // 项目基本信息
                mod.setCtx(data, _this.isAdmin);
                if(mod.parent){
                    mod.parent.close();
                }
                project.open(mod, '_blank', 'content');
            };
            project.getIModule('imodule://submitDemandMD', null, onBack);
        } 
        return CON;
    })();
    return Module;
});

