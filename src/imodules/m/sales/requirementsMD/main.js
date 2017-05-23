define(function() {
    var Module = (function() {
		var baseIModules = project.baseIModules;
        var CON = function(dom) {
            baseIModules.BaseIModule.call(this, dom);
            this.tpl = this._els.tpl[0].text;

            var _this = this;
            project.events.addListener('login.ensured', function(event) {
                _this.mgetMyPro();
            });
        };
        potato.createClass(CON, baseIModules.BaseIModule);

        CON.prototype.mgetMyPro = function() {
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
            this.find('#myProject').html(dom);
        }

       

        CON.prototype._ievent_oaa = function(data, target, hit){
            var statusone = $(target).parent().find('.has-first');
            var statusother = $(target).parent().find('.has-status');
            if($(target).hasClass('hascurrent')) {
                statusone.removeHide();
                statusother.addHide();
                $(target).removeClass('hascurrent')
            }else{
                statusone.addHide();
                statusother.removeHide();
                $(target).addClass('hascurrent')
            }
        }
     
        return CON;
    })();

    return Module;
})
