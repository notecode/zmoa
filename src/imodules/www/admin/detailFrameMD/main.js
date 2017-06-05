define(function() {
    var Module = (function() {
		var baseIModules = project.baseIModules;
        var CON = function(dom) {
            baseIModules.BaseIModule.call(this, dom);
            //this.tpl = this._els.tpl[0].text;
        };
        potato.createClass(CON, baseIModules.BaseIModule);
		
		CON.prototype.render = function(projId, proj) {
            var _this = this;
            var resize = function() {
                _this.parent.refreshSize();
            }

            project.getIModule('imodule://statusBarMD', null, function(mod) {
                mod.render(proj, _this.find('.status-block'), resize);
            });

            project.getIModule('imodule://demandDetailOnLeftMD', null, function(mod) {
                var h = _this.parentHeight() - 80;
                mod.render(proj, _this.find('.left-detail-block'), h, resize);
            });

            var bodyMod = '';
            switch (proj.status) {
                case '1':
                    bodyMod = 'imodule://assignTasks';
                    break;
                default:
                    bodyMod = 'imodule://demandDetail';
                    break;
            }

            project.getIModule(bodyMod, null, function(mod) {
                var h = _this.parentHeight() - 80;
                mod.render(proj, _this.find('.body-block'), h, resize);
            });
		}

        CON.prototype.parentHeight = function() {
            return parseInt(this.parent.dom.style.height);
        }

        return CON;
    })();

    return Module;
})

