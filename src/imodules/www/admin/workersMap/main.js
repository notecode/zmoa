define(function() {
    var Module = (function() {
		var baseIModules = project.baseIModules;
        var CON = function(dom) {
            baseIModules.BaseIModule.call(this, dom);

            tlog('workers map');
            this.foo();
        };
        potato.createClass(CON, baseIModules.BaseIModule);
		
        CON.prototype.foo = function() {
            var map = new AMap.Map('container', {
                center: [116.306206, 39.975468],
                zoom:3
            }); 
        }
		
		CON.prototype._ievent_ = function(data, target, hit) {
		}
        
        return CON;
    })();

    return Module;
})
