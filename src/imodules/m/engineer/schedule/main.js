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

            this.addMonthPanes();
            this.addSchedules();
//            this.unitTest();
        };
        potato.createClass(CON, baseIModules.BaseIModule);
		
		CON.prototype.addMonthPanes = function() {
            var month = this.getAMonthPane('2017', '04');
            var month2 = this.getAMonthPane('2017', '05');
            var dom = Mustache.render(this.tpl, {
                monthes: [month, month2],
                //monthes: [month],
                fn: {
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

            this.find('#main-body').append(dom);

            var size = this.cell_size;
            this.find('.week-row').height(size + 1);
            this.find('.day').width(size);
            this.find('.day').height(size).css('line-height', size + 'px');

            this.find('#main-body').slick({
                infinite: false
            });
		}
        
        CON.prototype.getAMonthPane = function(year, month) {
            var date1 = year + '-' + month + '-01';

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
                title: date1,
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

        CON.prototype.addSchedules = function() {
            for (var i = 0; i < mock.length; i++) {
                var the = mock[i];
                var segs = this.genPassLines(the.start_date, the.end_date);
                this.renderPassLine(segs);
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

        CON.prototype.renderPassLine = function(segs) {
            for (var i = 0; i < segs.length; i++) {
                var the = segs[i];

                var line = $('<div class="line"></div>');
                line.css('left', this.cell_size * the.start);
                line.width(this.cell_size * the.len);

                var nweek = the.mmt_start.week();
                this.find('[data-week=' + nweek + ']').append(line);
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
        return CON;
    })();

    return Module;
})
