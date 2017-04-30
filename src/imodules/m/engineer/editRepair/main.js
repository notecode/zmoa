define(["/global/iscripts/test/mock/api-4-project-detail.js"], function(mock) {
    var Module = (function() {
		var baseIModules = project.baseIModules;
        var CON = function(dom) {
            baseIModules.BaseIModule.call(this, dom);
            this.tpl = this._els.tpl[0].text;

            var proj = mock.project_info;
            project.getIModule('imodule://sparesMD', null, function(mod) {
                mod.render(proj);
            });
        };
        potato.createClass(CON, baseIModules.BaseIModule);
		
		CON.prototype.x = function() {
		}
		
		CON.prototype._ievent_ = function(data, target, hit) {
		}
        
        return CON;
    })();

    return Module;
})
