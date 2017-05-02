define(["/global/iscripts/libs/time/moment.js"], function(moment) {
    var Module = (function() {
		var baseIModules = project.baseIModules;
        var CON = function(dom) {
            baseIModules.BaseIModule.call(this, dom);
            this.tpl = this._els.tpl[0].text;
        };
        potato.createClass(CON, baseIModules.BaseIModule);
		
		CON.prototype.render = function(proj) {
            var worker = proj.service_user || {};
            var dom = Mustache.render(this.tpl, {
                proj: proj,
                fn: {
                    sched: function() {
                        var start = worker.start_date;
                        return (start && start.length > 0) ? 'show' : 'hide';
                    },
                    sch_start: function() {
                        var start = worker.start_date;
                        return start ? moment(start).format('M月DD日') : '';
                    },
                    sch_end: function() {
                        var end = worker.end_date;
                        return end ? moment(end).format('M月DD日') : '';
                    }
                }
            });
            this.find('.details').append(dom);

            this.bindFoldEvents();
		}
		
		CON.prototype.bindFoldEvents = function() {
            var fold = this.find('.fold-table');
            var unfold = this.find('.unfold-table');
            var table = this.find('.info-table');

            var tog = function() {
                fold.toggle();
                unfold.toggle();
                table.toggle();
            };
            fold.click(tog);
            unfold.click(tog);
		}
        
        return CON;
    })();

    return Module;
})
