define(["/global/iscripts/test/mock/api-4-project-detail.js"], function(mock_detail) {
    var Module = (function() {
		var baseIModules = project.baseIModules;
        var CON = function(dom) {
            baseIModules.BaseIModule.call(this, dom);
            this.tpl = this._els.tpl[0].text;

            this.renderDetail(mock_detail);
        };
        potato.createClass(CON, baseIModules.BaseIModule);
		
		CON.prototype.renderDetail = function(mock) {
            var dom = Mustache.render(this.tpl, mock); 
            this.find('.body-block').append(dom);
		}
		
		CON.prototype._ievent_ = function(data, target, hit) {
		}
        
        return CON;
    })();

    return Module;
})
