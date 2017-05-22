define(function() {
    var Module = (function() {
		var baseIModules = project.baseIModules;
        var CON = function(dom) {
            baseIModules.BaseIModule.call(this, dom);

            this.foo();
        };
        potato.createClass(CON, baseIModules.BaseIModule);
		
		CON.prototype.foo = function() {
            //api_ajax('project/my_projects');
            api_ajax('project/engineer_going_projects');
        }
        
        return CON;
    })();

    return Module;
})
