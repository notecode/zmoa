define(function() {
    var Module = (function() {
		var baseIModules = project.baseIModules;
        var CON = function(dom) {
            baseIModules.BaseIModule.call(this, dom);

            this.foo();
        };
        potato.createClass(CON, baseIModules.BaseIModule);
		
		CON.prototype.foo = function() {
            var data = {
                userName: 'test1',
                password: '123456' 
            };
            var _this = this;
            api_ajax_post('user/login', data, {
                succ: function(json) {
                },
                fail: function(json) {
                }
            });
		}
		
		CON.prototype._ievent_ = function(data, target, hit) {
		}
        
        return CON;
    })();

    return Module;
})
