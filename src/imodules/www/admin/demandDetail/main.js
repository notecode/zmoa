define(function() {
    var Module = (function() {
        var baseIModules = project.baseIModules;
        var CON = function(dom) {
            baseIModules.BaseIModule.call(this, dom);
            this.byDetail();
            this.tpl = this._els.tpl[0].text;
        };
        potato.createClass(CON, baseIModules.BaseIModule);

        CON.prototype.byDetail = function() {
            var _this =  this;
            api_ajax('project/detail/1', {
                succ: function(json) {
                    //判断有无图片
                    if(json.main_img){
                        json.hasPic = '';
                        json.noPic = 'hide';
                    }else {
                        json.hasPic = 'hide';
                        json.noPic = '';
                    }
                    _this.doRender(json);
                },
                fail: function(json) {

                }
            });
        }

        CON.prototype.doRender = function(ctx) {
            var _this = this;
            var dom = Mustache.render(this.tpl, ctx); 
            this.find('#detailCon').append(dom);
        }
        

        return CON;
    })();
    return Module;
});
