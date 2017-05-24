define(["/global/iscripts/libs/time/moment.js"], function(moment) {
    var Module = (function() {
		var baseIModules = project.baseIModules;
        var CON = function(dom) {
            baseIModules.BaseIModule.call(this, dom);
            this.tpl = this._els.tpl[0].text;
        };
        potato.createClass(CON, baseIModules.BaseIModule);

        var APPLY_ENVIRONMENT = {
            1: '户外',
            2: '室内',
            3: '半户外',
        };        
        var SCREEN_COLOR = {
            1: '双色',
            2: '单色',
            3: '全彩',
        };

		CON.prototype.render = function(proj) {
            var worker = proj.service_user || {};
            proj.main_img = proj_img_url(proj.main_img);
            var dom = Mustache.render(this.tpl, {
                proj: proj,
                fn: {
                    apply_environment: function() {
                        return proj.apply_environment = APPLY_ENVIRONMENT[proj.apply_environment];
                    },
                    screen_color: function() {
                        return proj.screen_color = SCREEN_COLOR[proj.screen_color];
                    },
                    hide_main_img: function() {
                        var img = proj.main_img;
                        return (img && img.length > 0) ? '' : 'hide';
                    },
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
