define(["/global/iscripts/libs/time/moment.js"], function(moment) {
    var Module = (function() {
		var baseIModules = project.baseIModules;
        var CON = function(dom) {
            baseIModules.BaseIModule.call(this, dom);
            var _this = this;
        };
        potato.createClass(CON, baseIModules.BaseIModule);
		
		
        
        return CON;
    })();

    return Module;
})
