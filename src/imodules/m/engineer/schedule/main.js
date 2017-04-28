define(["/global/iscripts/libs/time/moment.js", 
        "/global/iscripts/libs/time/twix.js",
        "/global/iscripts/tools/slick.js"], function(moment, Twix) {
    var Module = (function() {
		var baseIModules = project.baseIModules;
        var CON = function(dom) {
            baseIModules.BaseIModule.call(this, dom);
            this.tpl = this._els.tpl[0].text;

            this.foo();
        };
        potato.createClass(CON, baseIModules.BaseIModule);
		
		CON.prototype.foo = function() {
            var month = this.getAMonthPane('2017', '04');
            var month2 = this.getAMonthPane('2017', '05');
            var dom = Mustache.render(this.tpl, {
                monthes: [month, month2],
                fn: {
                    date: function() {
                        return this.mmt.date();
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

            var size = $(window).width() / 7 - 2;
            this.find('.day').width(size);
            this.find('.day').height(size);

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
                tlog(nb.format('YYYY-MM-DD'));
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

                a_month.weeks.push({days: days});
            }

            return a_month;
        }

        return CON;
    })();

    return Module;
})
