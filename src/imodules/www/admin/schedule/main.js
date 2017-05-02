define(["/global/iscripts/libs/time/moment.js", 
        "/global/iscripts/libs/time/twix.js",
        "/global/iscripts/test/mock/api-4-gant.js"], function(moment, Twix, mock) {
    var Module = (function() {
        var baseIModules = project.baseIModules;
        var CON = function(dom) {
            baseIModules.BaseIModule.call(this, dom);
            this.tpl = this._els.tpl[0].text;

            var _this = this;
            var dodo = function(raw) {
                var ctx = _this.prepare(raw);
                var toUse = _this.genReadyToUseData(ctx);
                _this.doRender(toUse);
                _this.rowHover();
            };

            if (1 == qs('test')) {
                dodo(mock);
            } else {
                api_ajax('project/project_date_list', {
                    succ: function(json) {
                        dodo(json);
                    },
                    fail: function(json) {
                    }
                });
            }
        };
        potato.createClass(CON, baseIModules.BaseIModule);

        // 排期要点：
        // 1. 给定多个range，得到总体最小、最大日期
        // 2. 计算range开始日期距最小日期的差
        // 3. 因工程名和table必须分开，故可能需要js实现hover联动
        CON.prototype.prepare = function(data) {
            var list = data.project_list;
            for (var i = 0; i < list.length; i++) {
                list[i].m_start = moment(list[i].start_date);
                list[i].m_end = moment(list[i].end_date);
            }

            var min = moment(data.min_date);
            var max = moment(data.max_date);

            var range = [];
            var iter = min.twix(max).iterate("days");
            while(iter.hasNext()) {
                range.push(iter.next());
            }

            // ref: http://isaaccambron.com/twix.js/docs.html#count
            //      https://momentjs.com/docs/
            var tomorrow = moment().add(1, 'days');
            for (var i = 0; i < list.length; i++) {
                var the = list[i];
                the.displace = min.twix(the.m_start).count("days") - 1;
                the.during = the.m_start.twix(the.m_end).count("days");

                tlog('bar ' + i + ': [' + the.displace + ', ' + the.during + ']');

                if (the.m_end.isSameOrAfter(tomorrow, 'days')) {
                    var future_start = the.m_start.isAfter(tomorrow, 'days') ? the.m_start : tomorrow;
                    the.tmr_displace = min.twix(future_start).count("days") - 1;
                    the.tmr_during = future_start.twix(the.m_end).count("days");
                    tlog('  future bar ' + i + ': [' + the.tmr_displace + ', ' + the.tmr_during + ']');
                }
            }

            tlog('If you see NaN above, that means invalid date');
            return {range: range, projects: list};
        }

        CON.prototype.genReadyToUseData = function(ctx) {
            var today = moment();
            var cells = [];
            for (var i = 0; i < ctx.range.length; i++) {
                var isToday = today.isSame(ctx.range[i], 'days');
                cells.push(isToday ? 'today' : '');
            }

            var cell_width = 50;
            var cell_height = 40;
            return {
                width: cell_width * ctx.range.length + 2,
                height: cell_height * (1 + ctx.projects.length) + 2,
                total: ctx.projects.length,
                header: {
                    days: ctx.range, // range: [moment]
                    fn: {
                        is_date1: function() {
                            return (1 == this.date()) ? 'date1' : '';
                        },
                        month: function() {
                            return this.month();
                        },
                        date: function() {
                            return this.date();
                        },
                        weekday: function() {
                            var wd = ['日', '一', '二', '三', '四', '五', '六'];
                            return wd[this.day()];
                        },
                        today: function() {
                            return this.isSame(today, 'days') ? 'today' : ''; 
                        }
                    },
                },
                // cells 供各行共用
                cells: cells,  // ['', '', 'today', '', ...]
                projects: ctx.projects,
                util: {
                    bar_start: function() {
                        return cell_width * this.displace + 1;
                    },
                    bar_length: function() {
                        var dur = this.during || 0;
                        return cell_width * dur;
                    },
                    in_future: function() {
                        return this.tmr_displace ? '' : 'hide';
                    },
                    span_today: function() {
                        return (this.displace < this.tmr_displace) ? "span-today" : "";
                    },
                    future_bar_start: function() {
                        var disp = this.tmr_displace;
                        //return cell_width * (disp ? disp : 0);
                        return disp ? (disp * cell_width + 1) : 0;
                    },
                    future_bar_length: function() {
                        var dur = this.tmr_during;
                        return cell_width * (dur ? dur : 0);
                    },
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

         CON.prototype.rowHover = function() {
            var _this = this;
            var rwopro = $('.a-row-pro');
            $(".proj").hover(function(){
                var index = $(this).index();
                rwopro.eq(index).addClass('active');
                if(index == 0){
                    rwopro.eq(0).find('.cell').css('borderTop','1px dashed #E3E8EE');
                }
            },function(){
                var index = $(this).index();
                setTimeout(function(){
                    rwopro.eq(index).removeClass('active');
                    if(index == 0){
                        rwopro.eq(0).find('.cell').css('borderTop','1px solid #E3E8EE');
                    }
                },10);
            })

            rwopro.hover(function(){
                var index2 = $(this).index();
                $(".proj").eq(index2).addClass('proactive');
            },function(){
                var index2 = $(this).index();
                setTimeout(function(){
                    $(".proj").eq(index2).removeClass('proactive');
                },10);
            })
        }

        return CON;
    })();

    return Module;
})
