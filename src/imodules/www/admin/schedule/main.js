define(["/global/iscripts/libs/time/moment.js", "/global/iscripts/libs/time/twix.js"], function(moment, Twix) {
    var Module = (function() {
        var baseIModules = project.baseIModules;
        var CON = function(dom) {
            baseIModules.BaseIModule.call(this, dom);
            this.tpl = this._els.tpl[0].text;

            var data = [
                {
                    "name": "太古里SOHO",
                    "in_city": "北京",
                    "day_start": "2017-4-12",
                    "day_end": "2017-4-28",
                },
                {
                    "name": "布达拉宫广场",
                    "in_city": "拉萨",
                    "day_start": "2017-5-1",
                    "day_end": "2017-5-4",
                }
            ];

            if (1 == qs('test')) {
                return;
            }
            
            var ctx = this.prepare(data);
            var toUse = this.genReadyToUseData(ctx);
            this.doRender(toUse);
        };
        potato.createClass(CON, baseIModules.BaseIModule);

        // 排期要点：
        // 1. 给定多个range，得到总体最小、最大日期
        // 2. 计算range开始日期距最小日期的差
        // 3. 因工程名和table必须分开，故可能需要js实现hover联动
        CON.prototype.prepare = function(data) {
            for (var i = 0; i < data.length; i++) {
                data[i].m_start = moment(data[i].day_start);
                data[i].m_end = moment(data[i].day_end);
            }

            var min = data[0].m_start;
            var max = data[0].m_end;

            for (var i = 1; i < data.length; i++) {
                min = moment.min(min, data[i].m_start);
                max = moment.max(max, data[i].m_end);
            }

            var range = [];
            var iter = min.twix(max).iterate("days");
            while(iter.hasNext()) {
                range.push(iter.next());
            }

            for (var i = 0; i < data.length; i++) {
                var the = data[i];
                the.displace = min.twix(the.m_start).length("days");
                the.during = the.m_start.twix(the.m_end).length("days");

                tlog(the.displace);
                tlog(the.during);
            }

            return {range: range, projects: data};
        }

        CON.prototype.genReadyToUseData = function(ctx) {
            var today = moment();
            var cells = [];
            for (var i = 0; i < ctx.range.length; i++) {
                var isToday = today.isSame(ctx.range[i], 'days');
                cells.push(isToday ? 'today' : '');
            }

            var cell_width = 50;
            return {
                total: ctx.projects.length,
                header: {
                    days: ctx.range, // range: [moment]
                    fn: {
                        date: function() {
                            return this.date();
                        },
                        weekday: function() {
                            var wd = ['日', '一', '二', '三', '四', '五', '六'];
                            return wd[this.day()];
                        }
                    },
                },
                // cells 供各行共用
                cells: cells,  // ['', '', 'today', '', ...]
                projects: ctx.projects,
                util: {
                    bar_start: function() {
                        return cell_width * this.displace; 
                    },
                    bar_length: function() {
                        return cell_width * this.during; 
                    }
                }
            };
        }

        CON.prototype.doRender = function(ctx) {
            var _this = this;
            var dom = Mustache.render(this.tpl, ctx); 
            this.find('#main-body').append(dom);
        }

        CON.prototype._ievent_ = function(data, target, hit) {
        }

        return CON;
    })();

    return Module;
})
