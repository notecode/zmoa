define(function() {
    var Module = (function() {
		var baseIModules = project.baseIModules;
        var CON = function(dom) {
            baseIModules.BaseIModule.call(this, dom);
            this.tpl = this._els.tpl[0].text;
            this.key = '';

            //input触发事件
            $(this._els.LSearch).bind('input propertychange','textarea', debounce(function (e) {
                var $target = $(e.target)
                _this.search($target);
            }, 300));

            var _this = this;
            $(this._els.LProjects).on('click','p',function(e){
                var item = $(this).data();
                _this.key = item.key + '';
                _this.id = item.id;
                setTimeout(function(){
                    $('.input-num').val(item.key + ' ' + item.name);
                },100)
            })
        };
        potato.createClass(CON, baseIModules.BaseIModule);

        // 监听项目列表点击事件
        // CON.prototype._ievent_listP = function(data, target, hit){
        //     var _this = this;
        //     var $this = $(target);
        //     var item = $this.data();
        //     _this.key = item.key + '';
        //     _this.id = item.id;
        //     setTimeout(function(){
        //         $(_this._els.LSearch).val(item.key + ' ' + item.name);
        //     },100)
        // }
        
        // 项目模糊搜索
        CON.prototype.search = function (el) {
            var key = el.val().trim();
            var _this = this;
            if (!!key) {
                api_ajax_post('project/associate_projects', { projectNameOrContract: key }, {
                    succ: function(data) {
                        var renderObj = { arr: false, items: [] }
                        if ($.isArray(data) && data.length > 0) {
                            renderObj.arr = true
                            renderObj.items = data
                        } else if(!$.isEmptyObject(data) && data.errcode) {
                            project.tip('用户未登录','succ','', true);
                        }
                        var domStr = Mustache.render(_this.tpl, renderObj); 
                        $(_this._els.LProjects).html(domStr);
                    },
                    fail: function(json) {
                        project.tip('系统错误','succ','', true);
                    }
                });
            }
        }

        // 添加需求
        CON.prototype._ievent_submitForm = function(data, target) {
            var _this = this;
            var $value = $.trim($(this._els.LSearch).val())
            var key = $value.split(' ')[0];
            if (key === this.key) { //输入项目已经存在
                $value = this.key
                this.reset();
                this.openBasicInfo(this.id, true);
                return false;
            }
            if(!!$value && key !== this.key) { //输入项目为新项目
                api_ajax_post('project/add', { contract: $value }, {
                    succ: function(data) {
                        if (data && data.project_id) {
                            _this.reset();
                            data.project_exist = '1';
                            _this.openBasicInfo(data.project_id, data.project_exist);
                        }
                    },
                    fail: function(json) {
                        console.log(json);
                        project.tip('提交失败','succ','', true);
                    }
                });
            } else {
                $(_this._els.errorNull).addClass('slideUp');
                setTimeout(function(){
                    $(_this._els.errorNull).removeClass('slideUp');
                },4000)
            }
            return false;
        }

        // 根据角色判断打开故障页面还是基本信息页面
        CON.prototype.openBasicInfo = function(id, isExist) {
            console.log(id + '||||' +isExist)
            var _this = this;
            api_ajax('project/detail/' + id, {
                succ: function(json) {
                    //判断有无需求
                    if (json.user_role !== '1' && isExist) {
                        //打开基本信息页面
                        location.href="/sales/demand-detail.html?project_id="+id;
                    } else {
                        //打开故障页面
                        location.href="/sales/fault.html?project_id="+id;
                    }
                },
                fail: function(json) {
                    console.log(json);
                }
            });                     
        }

        // 重置表单数据
        CON.prototype.reset = function() {
            $(this._els.LSearch).val('')
            $(this._els.LProjects).html('');
        }
            
        return CON;
    })();

    return Module;
})
