define(function() {
    var Module = (function() {
        var baseIModules = project.baseIModules;
        var CON = function(dom) {
            baseIModules.BaseIModule.call(this, dom);
            // 初始化内容可以在这里做
            this.tpl = this._els.tpl[0].text;
            var _this = this;
            $(this._els.LSearch).on('keyup', debounce(function (e) {
                var $target = $(e.target)
                _this.search($target)
            }, 300));
            // 监听项目列表点击事件
            $(this._els.LProjects).on('click', 'p', function(e) {
                var $this = $(e.target);
                var item = $this.data();
                _this.key = item.key + '';
                _this.id = item.id;
                $(_this._els.LSearch).val(item.key + ' ' + item.name);
            })            
        };
        potato.createClass(CON, baseIModules.BaseIModule);

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
                            project.tip('温馨提示','succ','用户未登陆', true);
                        }
                        var domStr = Mustache.render(_this.tpl, renderObj); 
                        $(_this._els.LProjects).html(domStr);
                    },
                    fail: function(json) {
                        project.tip('温馨提示','succ','系统错误', true);
                    }
                });
            }
        }
        // 重置表单数据
        CON.prototype.reset = function() {
            $(this._els.LSearch).val('')
            $(this._els.LProjects).html('');
        }
        // 打开项目基本信息框
        CON.prototype.openBasicInfo = function(id, isExist) {
            var _this = this;
            api_ajax('project/detail/' + id, {
                succ: function(json) {
                    //判断有无需求
                    if (json.user_role !== '1' && isExist) {
                        _this.demandInfo(json)
                    } else {
                        _this.basicInfo(json)
                    }
                },
                fail: function(json) {
                    console.log(json);
                }
            });                     
        }
        // 打开项目基本信息模态框
        CON.prototype.basicInfo = function(json) {
            var onBack = function(mod) {
                // 项目基本信息
                mod.setCtx(json.project_info, json.user_role === '1');
                if(mod.parent){
                    mod.parent.close();
                }
                project.open(mod, '_blank', { size: ['content', '600px'], maskCloseable: false });
            };
            project.getIModule('imodule://editDemandMD', null, onBack);
        }
        // 打开项目故障模态框
        CON.prototype.demandInfo = function(json) {
            var onBack = function(mod) {
                // 项目基本信息
                mod.setCtx(json.project_info, json.user_role === '1');
                if(mod.parent){
                    mod.parent.close();
                }
                project.open(mod, '_blank', { size: 'content', maskCloseable: false});
            };
            project.getIModule('imodule://submitDemandMD', null, onBack);
        }        
        // 添加需求
        CON.prototype._ievent_submitForm = function(data, target) {
            var _this = this;
            var $value = $.trim($(this._els.LSearch).val())
            var key = $value.split(' ')[0];
            if (key === this.key) {
                $value = this.key
                this.reset();
                this.parent.close();
                this.openBasicInfo(this.id, true);
                return false;
            }
            if(!!$value && key !== this.key) {
                api_ajax_post('project/add', { contract: $value }, {
                    succ: function(data) {
                        if (data && data.project_id) {
                            _this.reset();
                            _this.parent.close();
                            _this.openBasicInfo(data.project_id, data.project_exist === '1');
                        }
                    },
                    fail: function(json) {
                        console.log(json);
                        project.tip('温馨提示','succ','提交失败', true);
                    }
                });
            } else {
                project.tip('温馨提示','succ','项目不能为空', true);
            }
            return false;
        }

        return CON;
    })();
    return Module;
});

