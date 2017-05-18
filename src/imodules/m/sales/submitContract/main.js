define(function() {
    var Module = (function() {
		var baseIModules = project.baseIModules;
        var CON = function(dom) {
            baseIModules.BaseIModule.call(this, dom);

            this.tpl = this._els.tpl[0].text;
            var _this = this;

            //input触发事件
            $(this._els.LSearch).bind('input propertychange','textarea', debounce(function (e) {
                var $target = $(e.target)
                _this.search($target);
                $(_this._els.errorNull).slideUp();
            }, 300));

            // 监听项目列表点击事件
            $(this._els.LProjects).on('click', 'p', function(e) {
                var $this = $(e.target);
                var item = $this.data();
                _this.key = item.key + '';
                _this.id = item.id;
                setTimeout(function(){
                    $(_this._els.LSearch).val(item.key + ' ' + item.name);
                },100)
                
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
                            project.tip('用户未登陆','succ','', true);
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
                location.href="/sales/demand-detail.html";
                //this.openBasicInfo(this.id, true);
                return false;
            }
            if(!!$value && key !== this.key) { //输入项目为新项目
                api_ajax_post('project/add', { contract: $value }, {
                    succ: function(data) {
                        if (data && data.project_id) {
                            _this.reset();
                            location.href="/sales/demand-detail.html";
                            //_this.openBasicInfo(data.project_id, data.project_exist === '1');
                        }
                    },
                    fail: function(json) {
                        console.log(json);
                        project.tip('提交失败','succ','', true);
                    }
                });
            } else {
                //project.tip('项目不能为空','error','', false);
                $(_this._els.errorNull).addClass('slideUp');
            }
            return false;
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
