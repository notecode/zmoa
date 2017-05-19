define(["/global/iscripts/libs/time/moment.js", 
        "/global/iscripts/libs/time/twix.js",
        "/global/iscripts/test/mock/api-4-gant.js"], function(moment, Twix, mock) {
    var Module = (function() {
        var baseIModules = project.baseIModules;
        var CON = function(dom) {
            baseIModules.BaseIModule.call(this, dom);
            this.tpl = this._els.tpl[0].text;

            this.leftWidth = 290;
            this.topHeight = 110; // header和日历高度和
            this.cellWidth = 50;
            this.cellHeight = 40;
            
            var _this = this;
            var dodo = function(raw) {
                var ctx = _this.prepare(raw);
                var toUse = _this.genReadyToUseData(ctx);
                _this.doRender(toUse);
                _this.rowHover();
                _this.scrollFix();
            };

            if (1 == qs('test')) {
                if (1 == qs('dummy')) {
                    dodo({});
                } else {
                    dodo(mock);
                }
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

        // 为了横向铺满，故须知最少要展示多少天
        CON.prototype.minDayCount = function() {
            var rightWidth = $(window).width() - this.leftWidth;
            var dayCnt = Math.floor(rightWidth / this.cellWidth);
            return dayCnt;
        }

        CON.prototype.makeDummyData = function() {
            var dayCnt = this.minDayCount();
            tlog('no schedule data got, so gen days: ' + dayCnt);

            var first = moment().subtract('7', 'days');
            var last = first.clone().add(dayCnt, 'days');

            var tableHeight = $(window).height() - this.topHeight;
            var projCnt = Math.floor(tableHeight / this.cellHeight);
            var projList = Array(projCnt).fill({
                name: 'dummy',
                start_date: first.format('YYYY-MM-DD'), 
                end_date: '' 
            });

            return {
                min_date: first.format('YYYY-MM-DD'),
                max_date: last.format('YYYY-MM-DD'),
                project_list: projList 
            };
        }

        // 排期要点：
        // 1. 给定多个range，得到总体最小、最大日期
        // 2. 计算range开始日期距最小日期的差
        // 3. 因工程名和table必须分开，故可能需要js实现hover联动
        CON.prototype.prepare = function(data) {
            var list = data.project_list;
            var dummy = false; 
            if (null == list || 0 == list.length) {
                data = this.makeDummyData();
                list = data.project_list;
                dummy = true;
            }

            for (var i = 0; i < list.length; i++) {
                list[i].m_start = moment(list[i].start_date);
                list[i].m_end = moment(list[i].end_date);
            }

            var minDays = this.minDayCount();
            var min = moment(data.min_date);
            var max = moment(data.max_date);

            if (min.twix(max).count('days') < minDays) {
                max = min.clone().add(minDays, 'days');
                data.max_date = max.format('YYYY-MM-DD');
            }

            tlog('date range: [' + data.min_date + ', ' + data.max_date + ']');

            var range = [];
            var iter = min.twix(max).iterate("days");
            while(iter.hasNext()) {
                range.push(iter.next());
            }

            // ref: http://isaaccambron.com/twix.js/docs.html#count
            //      https://momentjs.com/docs/
            var today = moment();
            var tomorrow = moment().add(1, 'days');
            for (var i = 0; i < list.length; i++) {
                var the = list[i];
                the.displace = min.twix(the.m_start).count("days") - 1;
                // 因接口返回的数据本不含已结束的项目，故，end_date在今天之前的实为还未结束(工程商未及时点“已完成”按钮)，故UI显示成绵延到今天
                var end = the.m_end.isSameOrAfter(today) ? the.m_end : today;
                the.during = the.m_start.twix(end).count("days");

                tlog('bar ' + i + ': [' + the.displace + ', ' + the.during + ']');

                if (the.m_end.isSameOrAfter(tomorrow, 'days')) {
                    var future_start = the.m_start.isAfter(tomorrow, 'days') ? the.m_start : tomorrow;
                    the.tmr_displace = min.twix(future_start).count("days") - 1;
                    the.tmr_during = future_start.twix(the.m_end).count("days");
                    tlog('  future bar ' + i + ': [' + the.tmr_displace + ', ' + the.tmr_during + ']');
                }
            }

            tlog('If you see NaN above, that means invalid date');
            return {range: range, projects: list, dummy: dummy};
        }

        CON.prototype.genReadyToUseData = function(ctx) {
            var today = moment();
            var cells = [];
            for (var i = 0; i < ctx.range.length; i++) {
                var isToday = today.isSame(ctx.range[i], 'days');
                cells.push(isToday ? 'today' : '');
            }

            var cell_width = this.cellWidth;
            var cell_height = this.cellHeight;
            return {
                dummy: ctx.dummy ? 'dummy' : '',
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
                            return this.month() + 1;
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
                        return cell_width * this.displace;
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
                        return disp ? (disp * cell_width) : 0;
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

        CON.prototype.scrollFix = function(){
            $('#mtable').scroll(function(){
                //console.log($('#mtable').scrollLeft())
                var scrLeft = 290 - parseInt($('#mtable').scrollLeft());
                $('#rowScroll').css('left',scrLeft);
            })
        }

        return CON;
    })();

    return Module;
})
