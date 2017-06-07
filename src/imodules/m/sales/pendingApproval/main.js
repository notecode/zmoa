define(function() {
    var Module = (function() {
		var baseIModules = project.baseIModules;
        var CON = function(dom) {
            baseIModules.BaseIModule.call(this, dom);
            this.tpl = this._els.tpl[0].text;

            var _this = this;
            project.events.addListener('login.ensured', function(event) {
                _this.render();
            });
		    project.getIModule("imodule://Gaid"); // 后加载，以保证addListener已执行
        };
        potato.createClass(CON, baseIModules.BaseIModule);
        
        CON.prototype.render = function() {
            var _this = this;
            api_ajax('project/projects_waiting_approve', {
                succ: function(json) {
                    _this.doRender(json);
                },
                fail: function(json) {
                    alert(json.errmsg);
                }
            });
        }

        CON.prototype.doRender = function(json) {
            var dom = Mustache.render(this.tpl, json);
            $(this._els.proRunning).html(dom);

            $(this._els.proRunning).on('click', '.project', function(e){
                var projId = $(this).data().id;
                location.href='/project/detail.html?projectId=' + projId;
            })
        }
            
        return CON;
    })();

    return Module;
})
