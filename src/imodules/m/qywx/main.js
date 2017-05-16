define(function() {
    var Module = (function() {
		var baseIModules = project.baseIModules;
        var CON = function(dom) {
            baseIModules.BaseIModule.call(this, dom);

            this.foo();
        };
        potato.createClass(CON, baseIModules.BaseIModule);
		
		CON.prototype.foo = function() {
            tlog('hello');
            $('body').append(location.href);

            var code = qs('code');
            var url = 'http://notecode.com:9090/fake-api.php?code=' + code;

            $('body').append('<br>');
            $('body').append(url);
            $.ajax(url);
		}
		
		CON.prototype._ievent_ = function(data, target, hit) {
		}
        
        return CON;
    })();

    return Module;
})
