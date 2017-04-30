define(function() {
    var Module = (function() {
		var baseIModules = project.baseIModules;
        var CON = function(dom) {
            baseIModules.BaseIModule.call(this, dom);
            this.tpl = this._els.tpl[0].text;
        };
        potato.createClass(CON, baseIModules.BaseIModule);
		
		CON.prototype.render = function(proj) {
            var dom = Mustache.render(this.tpl, {
                proj: proj
            });

            this.find('.spares').append(dom);
            this.addBlankSpare();
		}
		
		CON.prototype._ievent_newSpare = function(data, target, hit) {
            tlog('newSpare');
            this.addBlankSpare(this.find('.spares'));
		}

        CON.prototype.addBlankSpare = function() {
            var spare = $(this.tpl).find('.spare-tpl > div').clone();
            this.find('.spare-list').append(spare);
        }
        
        return CON;
    })();

    return Module;
})
