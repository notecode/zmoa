define(function() {
    var Module = (function() {
		var baseIModules = project.baseIModules;
        var CON = function(dom) {
            baseIModules.BaseIModule.call(this, dom);
        };
        potato.createClass(CON, baseIModules.BaseIModule);
        
        CON.prototype._ievent_reject = function() {
            var _this = this;
            var reas = $(this._els.reason).val();
            if (reas.length > 0) {
                var data = {
                    projectId: qs_proj(),
                    desc: filterCR(reas)
                };
                api_ajax_post('project/reject', data, {
                    succ: function(json) {
                        location.reload();
                    },
                    fail: function(json) {
                        alert(json.errmsg);
                    }
                });
            } else {
                alert('请输入驳回原因');
            }
        }
     
        return CON;
    })();

    return Module;
})
