define(function() {
    var Module = (function() {
		var baseIModules = project.baseIModules;
        var CON = function(dom, parent) {
            baseIModules.BaseIModule.call(this, dom, parent, {container: true});
            //this.tpl = this._els.tpl[0].text;
        };
        potato.createClass(CON, baseIModules.BaseIModule);
		
		CON.prototype.render = function(projId, proj) {
            var _this = this;
            var resize = function() {
                _this.parent.refreshSize();
            }

            var ctx = this.genCtx(proj);

            project.getIModule('imodule://statusBarMD', null, function(mod) {
                $(mod.dom).remove();
                mod.render(proj, _this.find('.status-block'), resize);
            });

            project.getIModule('imodule://demandDetailOnLeftMD', null, function(mod) {
                $(mod.dom).remove();

                if (ctx.bLeftDetail) {
                    var h = _this.parentHeight() - 80;
                    mod.render(proj, _this.find('.left-detail-block'), h, resize);
                }
            });

            
            project.getIModule(ctx.bodyMod, null, function(mod) {
                var h = _this.parentHeight() - 80;
                mod.render(proj, _this.find('.body-block'), h, resize);
            });
		}

        CON.prototype.genCtx = function(proj) {
            var bLeftDetail = false; 
            var bodyMod = '';

            if(proj.type == 0){
                switch (proj.status) {
                    case '1':
                        bLeftDetail = true;
                        bodyMod = 'imodule://assignTasks';
                        break;
                    default:
                        bodyMod = 'imodule://demandDetail';
                        break;
                }
            } else {
                switch (proj.status) {
                    case '0':
                        bLeftDetail = true;
                        bodyMod = 'imodule://inTestingMD';
                        break;
                    default:
                        bodyMod = 'imodule://demandDetail';
                        break;
                }
            }
            

            return {
                bLeftDetail: bLeftDetail,
                bodyMod: bodyMod,
            };
        }

        CON.prototype.parentHeight = function() {
            return parseInt(this.parent.dom.style.height);
        }

        return CON;
    })();

    return Module;
})

