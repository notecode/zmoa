//  "/global/iscripts/test/mock/api-4-m-sch.js"], function(moment, Twix, slk, mock) {

define(function() {
    var Module = (function() {
		var baseIModules = project.baseIModules;
        var CON = function(dom) {
            baseIModules.BaseIModule.call(this, dom);
            this.tpl = this._els.tpl[0].text;

            this.foo();
        };
        potato.createClass(CON, baseIModules.BaseIModule);
		
		CON.prototype.foo = function() {
            var dom = Mustache.render(this.tpl, {});
            this.find('#detail-body').append(dom);
		}
		
		CON.prototype._ievent_ = function(data, target, hit) {
		}
        
        return CON;
    })();

    return Module;
})
