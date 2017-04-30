define(["/global/iscripts/test/mock/api-4-project-detail.js"], function(mock) {
    var Module = (function() {
		var baseIModules = project.baseIModules;
        var CON = function(dom) {
            baseIModules.BaseIModule.call(this, dom);

            var proj = mock.project_info;
            project.getIModule('imodule://detailsMD', null, function(mod) {
                mod.render(proj);
            });

            project.getIModule('imodule://sparesMD', null, function(mod) {
                mod.render(proj);
            });
        };
        potato.createClass(CON, baseIModules.BaseIModule);
		
		CON.prototype._ievent_action = function(data, target, hit) {
            alert(0);
		}
        
        return CON;
    })();

    return Module;
})
