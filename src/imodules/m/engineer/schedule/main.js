define(["/global/iscripts/libs/time/moment.js", 
        "/global/iscripts/libs/time/twix.js",
        "/global/iscripts/tools/slick.js",
        "/global/iscripts/test/mock/api-4-m-sch.js"], function(moment, Twix, slk, mock) {
    var Module = (function() {
		var baseIModules = project.baseIModules;
        var CON = function(dom) {
            baseIModules.BaseIModule.call(this, dom);
            this.tpl = this._els.tpl[0].text;
            this.cell_size = $(window).width() / 7 - 1;  // 每个cell只有top/left各一条border. 最后一行加上一个bottom-border

            // 此不完备日历的最小日期
            this.min_date = null;

            this.date_selected1 = null;
            this.selected_range = null;

            this.addSunMon();
            this.addMonthPanes();
            this.bindSlick();
            this.addSchedules(mock);
            this.prepareForSelect(mock);
//            this.foo();
//            this.unitTest();
        };
        potato.createClass(CON, baseIModules.BaseIModule);
		
		CON.prototype.addSunMon = function() {
            var wk = ['日', '一', '二', '三', '四', '五', '六'];
            var week = $('<div class="week-row"></div>');
            for (var i = 0; i < wk.length; i++) {
                week.append('<div class="dayx">' + wk[i] + '</div>');
            }
            this.find('.sun-mon').append(week);
            // 下边会一起调整宽高
        }

		CON.prototype.addMonthPanes = function(sch) {
            var raw = this.genAfewMonthes(sch);
            var monthes = [];
            for (var i = 0; i < raw.length; i++) {
                monthes.push(this.getAMonthPane(raw[i]));
            }

            this.min_date = raw[0] + '-01';

            var dom = Mustache.render(this.tpl, {
                //monthes: [month, month2],
                //monthes: [month],
                monthes: monthes,
                fn: {
                    full_date: function() {
                        return this.mmt.format('YYYY-MM-DD');
                    },
                    date: function() {
                        return this.mmt.date();
                    },
                    date1: function() {
                        return (1 == this.mmt.date() ? 'date1' : '');
                    },
                    weekend: function() {
                        var day = this.mmt.day();
                        return (0 == day || 6 == day) ? 'weekend' : '';
                    },
                    out: function() {
                        return this.in_month ? '' : 'beyond';
                    }
                }
            }); 

            this.find('#month-list').append(dom);

            var size = this.cell_size;
            this.find('.week-row').height(size + 1);
            this.find('.day, .dayx').width(size);
            this.find('.day, .dayx').height(size).css('line-height', size + 'px');
		}

        CON.prototype.genAfewMonthes = function(sch) {
            // todo: 从api数据中得到最小的月份，一般就是近两个月
            var min_month = moment('2017-04');

            // 得到到今年年底，或最少6个月
            var nextYear = min_month.year() + 1;
            var max_month = moment(nextYear + '-01');
            if (min_month.twix(max_month).count('month') < 6) {
                max_month = min_month.clone.add('6', 'month');
            }

            var monthes = [];
            var cur = min_month;
            while (cur.isSameOrBefore(max_month)) {
                var fmt = cur.format('YYYY-MM');
                monthes.push(fmt);

                tlog('month: ' + fmt);
                cur.add('1', 'month');
            };

            return monthes;
        }

        CON.prototype.bindSlick = function() {
            var tgt = '#month-list';
            this.find(tgt).slick({
                infinite: false,
                prevArrow: $('.icon-left'),
                nextArrow: $('.icon-right')
            });

            var cap0 = $('.month').first().attr('data-caption');
            var name = $('.month-name');
            name.text(cap0);

            this.find(tgt).on('afterChange', function(event, slick, cur){
                var cap = $(slick.$slides.get(cur)).attr('data-caption');
                name.text(cap);
            });
        }

        
        CON.prototype.getAMonthPane = function(month) {
            var date1 = month + '-01';

            var m_date1 = moment(date1);
            var day = m_date1.day();
            var orgDay = null;
            if (day > 0) {
                orgDay = m_date1.clone().subtract(day, 'day');
            } else {
                orgDay = m_date1.clone();
            }

            // 得到一个数组：每个week的第0天（即周日）
            var arr_day0 = [];
            var next_day0 = orgDay.clone();
            while (next_day0.isSameOrBefore(m_date1, 'month')) {
                var nb = next_day0.clone();
                //tlog(nb.format('YYYY-MM-DD'));
                arr_day0.push(nb);

                next_day0.add('7', 'day');
            }

            // 得到各week中的每一天
            var a_month = {
                caption: m_date1.format('YYYY年M月'),
                weeks: []
            };

            for (var i = 0; i < arr_day0.length; i++) {
                var day0 = arr_day0[i];
                var day6 = day0.clone().add('6', 'day');

                var days = [];
                var iter = day0.twix(day6).iterate("days");
                while(iter.hasNext()) {
                    var the = iter.next();
                    days.push({
                        mmt: the,
                        in_month: the.isSame(m_date1, 'month') 
                    });
                }

                a_month.weeks.push({
                    weekNum: day0.week(),
                    days: days
                });
            }

            return a_month;
        }

        CON.prototype.addSchedules = function(sch) {
            //var today = moment('2017-04-21');
            var today = moment();
            for (var i = 0; i < sch.length; i++) {
                var the = sch[i];
                var mmt_start = moment(the.start_date);
                var mmt_end = moment(the.end_date);

                // 未来的
                if (mmt_start.isAfter(today, 'day')) {
                    var segs = this.genPassLines(the.start_date, the.end_date);
                    this.renderPassLine(segs, 'future');
                } else if (mmt_end.isAfter(today, 'day')) { // 正在进行中的
                    // 先画今天及以前的
                    var passSegs = this.genPassLines(the.start_date, today.format('YYYY-MM-DD'));
                    this.renderPassLine(passSegs, 'passed');

                    var tomorrow = today.add('1', 'day').format('YYYY-MM-DD');
                    var aheadSegs = this.genPassLines(tomorrow, the.end_date);
                    this.renderPassLine(aheadSegs, 'ahead');
                } else { // 已完成的
                    var segs = this.genPassLines(the.start_date, the.end_date);
                    this.renderPassLine(segs);
                }
            }
        }

        CON.prototype.genPassLines = function(date_from, date_to) {
            var from = moment(date_from);
            var to = moment(date_to);
            var len = from.twix(to).count('days');

            var rules = [7 - from.day(), 7];
            var segs = [];
            var bFirst = true;
            while (len > 0) {
                var rule = bFirst ? rules[0] : rules[1];
                var cut = Math.min(len, rule);

                segs.push({
                    mmt_start: from.clone(),
                    start: from.day(),
                    len: cut
                });

                bFirst = false;
                len -= cut;
                from.add(cut, 'days');
            }

            tlog('[' + date_from + ', ' + date_to + ']');
            for (var i = 0; i < segs.length; i++) {
                var the = segs[i];
                tlog(' (week: ' + the.mmt_start.week() + ')[' + the.start + ', ' + (the.start + the.len - 1) + ']');
            }

            return segs;
        }

        CON.prototype.renderPassLine = function(segs, extClass) {
            var cw = this.cell_size + 1; // 需加上一个border宽
            var adj = cw / 5;
            var count = segs.length;
            for (var i = 0; i < count; i++) {
                var the = segs[i];
                var line = $('<div class="line"></div>');
                if (extClass) {
                    line.addClass(extClass);
                }

                var start = the.start * cw;
                var len = the.len * cw;

                // 首段, 且不是“正在进行中明天的那段"
                if (0 == i && (extClass !== 'ahead')) {
                    start += adj;
                    len -= adj;
                    line.addClass('left-tip');
                } 

                // 末段, 且不是“正在进行中已过去的那段"
                if (i == count - 1 && (extClass !== 'passed')) {
                    len -= adj;
                    line.addClass('right-tip');
                }

                line.css('left', start);
                line.width(len);

                var nweek = the.mmt_start.week();
                this.find('[data-week=' + nweek + ']').append(line);
            }
        }

        CON.prototype.prepareForSelect = function(sch) {
            this.freezeSome(sch);
            this.bindSelectEvents(sch);
        }

        CON.prototype.freezeSome = function(sch) {
            var _this = this;
            var freeze = function(mmt) {
                var date = mmt.format('YYYY-MM-DD');
                _this.find('.day[data-date=' + date + ']').addClass('freeze');
            };

            // 1. 已在排期中的，禁用
            for (var i = 0; i < sch.length; i++) {
                var the = sch[i];
                var mmt_start = moment(the.start_date);
                var mmt_end = moment(the.end_date);

                while (mmt_start.isSameOrBefore(mmt_end, 'day')) {
                    freeze(mmt_start);
                    mmt_start.add('1', 'day');
                }
            }

            // 2. 已经逝去的日子，禁用
            var mmt = moment(this.min_date);
            var today = moment();
            while (mmt.isBefore(today, 'day')) {
                freeze(mmt);
                mmt.add('1', 'day');
            }
        }

        CON.prototype.bindSelectEvents = function(sch) {
            var _this = this;
            this.find('.day:not(.freeze, .beyond)').click(function() {
                var date = $(this).attr('data-date');
                if (null == _this.selected_range) {
                    // 如果我先前未被选中
                    if (!$(this).hasClass('ready')) {

                        // 如果别人也未曾被选中, 则就先选我
                        if (null == _this.date_selected1) {
                            _this.date_selected1 = date;
                            $(this).addClass('ready');
                            tlog('You selected one end: ' + date);
                        } else {
                            // 已有别人被选中，则尝试选择区域
                            _this.tryToSelect(date, $(this), sch);
                        }
                    } else {
                        // 如果我先前曾被选中，你又选我，那就取消
                        $(this).toggleClass('ready');
                        _this.date_selected1 = null;
                        tlog('Cancelled your selection: ' + date);
                    }
                } else {
                    tlog('Sorry, you aleady selected two dates: [' + _this.selected_range.start + ', ' + _this.selected_range.end + ']');
                }
            }); 
        }

        CON.prototype.tryToSelect = function(date, jq, sch) {
            var mmt1 = moment(this.date_selected1);
            var mmt2 = moment(date);

            var rng = null;
            var selectd = null;
            var sRng = '';
            if (mmt1.isBefore(mmt2, 'day')) {
                rng = mmt1.twix(mmt2);
                selected = {
                    start: this.date_selected1, 
                    end: date
                };
                sRng = '[' + mmt1.format('MM-DD') + ', ' + mmt2.format('MM-DD') + ']';
            } else {
                rng = mmt2.twix(mmt1);
                selected = {
                    start: date,
                    end: this.date_selected1
                };
                sRng = '[' + mmt2.format('MM-DD') + ', ' + mmt1.format('MM-DD') + ']';
            }

            var pass = true;
            for (var i = 0; i < sch.length; i++) {
                var the = sch[i];
                var mmt_start = moment(the.start_date);
                var mmt_end = moment(the.end_date);

                var rngx = mmt_start.twix(mmt_end);
                if (rng.overlaps(rngx)) {
                    var sRngx = '[' + mmt_start.format('MM-DD') + ', ' + mmt_end.format('MM-DD') + ']';
                    tlog('[!!]overlapped: ' + sRng + ' vs. ' + sRngx);

                    pass = false;
                    break;
                }
            }

            if (pass) {
                this.selected_range = selected;
                tlog('OK, you selected: ' + sRng);

                var segs = this.genPassLines(selected.start, selected.end);
                this.renderPassLine(segs, 'hot');
                this.find('.ready').removeClass('ready');
            } else {
                ;
            }
        }

        CON.prototype.unitTest0 = function() {
            var seg = this.genPassLines('2017-04-02', '2017-04-05');
            assert(1 == seg.length);
            assert(4 ==seg[0].len);
            assert(0 ==seg[0].start);
        }

        CON.prototype.unitTest1 = function() {
            var seg = this.genPassLines('2017-04-02', '2017-04-10');
            assert(2 == seg.length);
            assert(7 ==seg[0].len);
            assert(2 ==seg[1].len);
        }

        CON.prototype.unitTest2 = function() {
            var seg = this.genPassLines('2017-04-12', '2017-04-26');
            assert(3 == seg.length);
            assert(4 ==seg[0].len);
            assert(7 ==seg[1].len);
            assert(4 ==seg[2].len);
        }

        CON.prototype.unitTest3 = function() {
            var seg = this.genPassLines('2017-04-19', '2017-05-03');
            assert(3 == seg.length);
            assert(4 ==seg[0].len);
            assert(7 ==seg[1].len);
            assert(4 ==seg[2].len);
        }

        CON.prototype.unitTest4 = function() {
            var seg = this.genPassLines('2017-04-30', '2017-05-01');
            assert(1 == seg.length);
            assert(2 ==seg[0].len);
        }
        CON.prototype.unitTest5 = function() {
            var seg = this.genPassLines('2017-04-29', '2017-05-01');
            assert(2 == seg.length);
            assert(1 ==seg[0].len);
            assert(2 ==seg[1].len);
        }

        CON.prototype.unitTest = function() {
            this.unitTest0();
            this.unitTest1();
            this.unitTest2();
            this.unitTest3();
            this.unitTest4();
            this.unitTest5();
        }

        CON.prototype.foo = function() {
            var r1 = moment('2017-04-12').twix('2017-04-05');
            var r2 = moment('2017-04-01').twix('2017-04-07');
            var r3 = moment('2017-04-03').twix('2017-04-07');

            tlog(r1.overlaps(r2));
            tlog(r1.overlaps(r3));
        }
    
        return CON;
    })();

    return Module;
})
