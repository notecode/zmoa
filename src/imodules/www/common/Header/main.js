define(function() {
    var Module = (function() {
		var baseIModules = project.baseIModules;
        var CON = function(dom) {
            baseIModules.BaseIModule.call(this, dom);
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
