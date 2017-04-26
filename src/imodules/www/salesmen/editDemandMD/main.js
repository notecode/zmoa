define(function() {
    var Module = (function() {
        var baseIModules = project.baseIModules;
        var CON = function(dom) {
            baseIModules.BaseIModule.call(this, dom);
        };
        potato.createClass(CON, baseIModules.BaseIModule);
        CON.prototype.setCtx = function(obj, txt) {
            console.log(obj);
            console.log(txt);
        }
        return CON;
    })();
    return Module;
});

