define(function() {
    var Module = (function() {
        var baseIModules = project.baseIModules;
        var CON = function(dom) {
            baseIModules.BaseIModule.call(this, dom);
            this.getProInfo();
            this.getMyPro();
            this.tpl = this._els.tpl[0].text;
        };
        potato.createClass(CON, baseIModules.BaseIModule);

        CON.prototype.getProInfo = function() {
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

        CON.prototype.getMyPro = function() {
            var _this = this;
            api_ajax('project/my_projects', {
                succ: function(json) {
                    //判断有无需求
                    if(json.count <= 0) {
                        json.noDemand = '';
                        json.haveDemand = 'hide';
                    } else {
                        json.noDemand = 'hide';
                        json.haveDemand = '';
                    }
                    _this.proInfoRender(json);
                },
                fail: function(json) {

                }
            });
        }

        CON.prototype.proInfoRender = function(ctx) {
            var _this = this;
            var dom = Mustache.render(this.tpl, ctx); 
            this.find('#myProject').append(dom);
        }

        CON.prototype._ievent_addDemand = function() {
            project.getIModule('imodule://submitContractMD', null, function (modal) {
                project.open(modal, '_blank', 'content');
            });
        }

        return CON;
    })();
    return Module;
});
