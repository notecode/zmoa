define(["/global/iscripts/test/mock/api-4-project-detail.js"], function(mock) {
    var Module = (function() {
		var baseIModules = project.baseIModules;
        var CON = function(dom) {
            baseIModules.BaseIModule.call(this, dom);
            this.tpl = this._els.tpl[0].text;

            this.renderDetail(mock.project_info);
        };
        potato.createClass(CON, baseIModules.BaseIModule);
		
		CON.prototype.renderDetail = function(proj) {
            var dom = Mustache.render(this.tpl, {
                proj: proj,
                fn: {
                    date_start: function() {
                        var date = proj.created;
                        return date ? moment(date).format('M-DD') : '';
                    },
                    date_end: function() {
                        return 'todo'
                    }
                }
            });
            this.find('#detail-body').append(dom);
		}
		
		CON.prototype._ievent_ = function(data, target, hit) {
		}
        
        return CON;
    })();

    return Module;
})
