define(function() {
    var Module = (function() {
        var baseIModules = project.baseIModules;
        var CON = function(dom) {
            var _this = this;
            baseIModules.BaseIModule.call(this, dom);
            this.tpl = this._els.tpl[0].text;
            this.addressTpl = this._els.tpl[1].text;
            this.stockTpl = this._els.tpl[2].text;

            // 关于lastComment，请参见m端本功能的代码。可查找last_comment
            this.initLastComment = '';

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
            var _this = this;
            this.isAdmin = isAdmin;            
            this.data = obj;
            // 初始化地址数据
            this.addressItems().then(function() {
                var last_comment = (obj.comments.length > 0) ? obj.comments[0].comment : '';
                _this.initLastComment = last_comment;
                obj.last_comment = last_comment;

                var filter = {
                    show_if_back_proj: function() {
                        return (this.type == 1) ? 'show' : 'hide';
                    },
                    province: function () {
                        var _id = this.province_id;
                        var _name = '所在省份';
                        if (_id) {
                            _name = _this.address.province.find(function(item) { return item.id === _id }).name;
                        }
                        return _name;
                    },
                    city: function () {
                        var _id = this.city_id;
                        var _name = '城市';
                        if (_id) {
                            _name = _this.address.city.find(function(item) { return item.id === _id }).name;
                        }
                        return _name;                            
                    },
                    screenArea: function() {
                        var _screenArea = '';
                        if ($.isNumeric(this.screen_area)) {
                            _screenArea = parseInt(this.screen_area, 10);
                        }
                        return _screenArea || '';
                    },
                    area: function () {
                        var _id = this.area_id;
                        var _name = '区/县';
                        if (_id) {
                            _name = _this.address.area.find(function(item) { return item.id === _id }).name;
                        }
                        return _name;                              
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
                obj.all_region_data = _this.address;
                var renderObj = $.extend(obj, filter);
                var domStr = Mustache.render(_this.tpl, renderObj);
                $(_this._els.LContent).html(domStr);

                var serv = (obj.type == 1) ? '返修服务' : '厂外服务';
                _this.find('.service-type').text(serv);
            });
        }

        // 提交项目基本信息
        // 添加需求
        CON.prototype._ievent_submitForm = function(el, target) {
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
            var lastC = filterCR(data.last_comment);
            data.last_comment = (lastC != this.initLastComment) ? lastC : ''; 

            data.parts = this.collectParts(data.parts, 'backup_number');
            if (this.data.type == 1) {
                // 返修项目的维修配件
                data.repair_parts = this.collectParts(data.repair_parts, 'number');
            }

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

        CON.prototype.collectParts = function(parts, num_key) {
            var partsArr = [];
            if (parts) {
                if ($.isArray(parts.name)) {
                    parts.name.map(function(item, index) {
                        if (item && parts.spec[index] && parts[num_key][index]) {
                            var obj = {};
                            obj.name = item;
                            obj.spec = parts.spec[index];  
                            obj[num_key] = parts[num_key][index];

                            partsArr.push(obj);
                        }
                    })
                } else if (parts.name && parts.spec && parts[num_key]) {
                    partsArr.push(parts);
                }
            }
            return partsArr;
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
                project.open(mod, '_blank');
            };
            project.getIModule('imodule://submitDemandMD', null, onBack);
        }
        // 获取地址列表
        CON.prototype.addressItems = function() {      
            var dtd = $.Deferred();
            var _this = this;
            var addressCache = window.localStorage.getItem('address');
            var addressObj = '';
            try {
                addressObj = JSON.parse(addressCache);   
                _this.address = addressObj;
                dtd.resolve();
            } catch (error) {
                addressObj = {};
                dtd.reject()
            }            
            if ($.isEmptyObject(addressObj)) {
                api_ajax('region/get_region', {
                    succ: function(data) {
                        if (data && !$.isEmptyObject(data)) {
                            dtd.resolve();
                            _this.address = data;
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
            }
            return dtd.promise();
        }
        return CON;
    })();
    return Module;
});

