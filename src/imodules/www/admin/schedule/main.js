define(function() {
    var Module = (function() {
        var baseIModules = project.baseIModules;
        var CON = function(dom) {
            baseIModules.BaseIModule.call(this, dom);
            this.tpl = this._els.tpl[0].text;

            //test
            this.foo();
        };
        potato.createClass(CON, baseIModules.BaseIModule);

        CON.prototype.foo = function() {
            var _this = this;
            var dom = Mustache.render(this.tpl, {
                count: [1, 1, 1, 3] 
            }); 
            this.find('#foo').html(dom);
        }

        CON.prototype._ievent_ = function(data, target, hit) {
        }

        return CON;
    })();

    return Module;
})
