define(function() {
    var Module = (function() {
		var baseIModules = project.baseIModules;
        var CON = function(dom) {
            baseIModules.BaseIModule.call(this, dom);

            var _this = this;
            //project.events.addListener('login.ensured', function(event) {
                _this.mgetProInfo();
            //});
        };
        potato.createClass(CON, baseIModules.BaseIModule);
        
        CON.prototype.mgetProInfo = function() {
            var _this = this;
            api_ajax('project/statistic', {
                succ: function(json) {
                    $(_this._els.lRunning).text(json.running);
                    $(_this._els.lWaitingSend).text(json.waiting_send);
                    $(_this._els.lScheduling).text(json.scheduling);
                    $(_this._els.lServing).text(json.serving);
                    $(_this._els.lWaitingReturn).text(json.waiting_return);
                },
                fail: function(json) {

                }
            });
        }

        // 添加新需求
        CON.prototype._ievent_addDemand = function() {
           location.href="/sales/contract.html";
        }

            
        return CON;
    })();

    return Module;
})
