define(function() {
    var Module = (function() {
		var baseIModules = project.baseIModules;
        var CON = function(dom) {
            baseIModules.BaseIModule.call(this, dom);
            //this.tpl = this._els.tpl[0].text;
        };
        potato.createClass(CON, baseIModules.BaseIModule);

        CON.prototype.render = function(proj, dest, cb) {
            // todo: 显示status
            $(this._els.serviceTit).text('todo');
            
            var _this = this;
            project.getIModule('imodule://controlProcessMD', null, function(mod) {
                var dest = _this.find('.control-process-dest');
                mod.render(proj, dest);
            });

            dest.append($(this.dom));
            cb && cb();
        }
		
        /*
            $(this._els.deTitle).text(proj.status_name);
            if (5 == proj.status || 6 == proj.status) {
                // 结束或中止的，就不让显示下拉的菜单了
                $(this._els.btnDropdown).hide();
            }
         */
        return CON;
    })();

    return Module;
})
