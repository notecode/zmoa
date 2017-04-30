define(["/global/iscripts/libs/time/moment.js"], function(moment) {
    var Module = (function() {
		var baseIModules = project.baseIModules;
        var CON = function(dom) {
            baseIModules.BaseIModule.call(this, dom);
            this.tpl = this._els.tpl[0].text;
        };
        potato.createClass(CON, baseIModules.BaseIModule);
		
		CON.prototype.render = function(proj) {
            var dom = Mustache.render(this.tpl, {
                proj: proj,
                fn: {
                    date_start: function() {
                        var date = proj.created;
                        return date ? moment(date).format('M月DD日') : '';
                    },
                    date_end: function() {
                        // todo: 不知用哪个时间
                        var date = proj.xxx;
                        // return date ? moment(date).format('M月DD日') : '';
                        return 'todo'
                    }
                }
            });
            this.find('.details').append(dom);
		}
		
		CON.prototype._ievent_ = function(data, target, hit) {
		}
        
        return CON;
    })();

    return Module;
})
