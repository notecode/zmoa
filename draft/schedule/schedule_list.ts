import * as tomato from "@po-to/tomato";
import * as tdom from "@po-to/tomato-jquery";
import * as page from "static/www/page";
import * as funs from "static/www/funs";

class VPresenter extends page.VPresenter {
    constructor(view: tomato.VPView, parent?: tomato.VPresenter, vpid?: string) {
        super(view, parent, vpid);
        this._watchEvent();
        var that = this;
        this.find('.r-sec-scroll').scroll(function () {
            that.find('.date-list-pane').scrollLeft(this.scrollLeft);
            that.find('.pro-list－scroll').css('top', -this.scrollTop);
        });
        var start = 1491098461271;
        var end = 1494168461271;

    }

    // 日期渲染方法
    paintCalendar(start_day, end_day) {
        // 日期渲染；假定传入两个日期（最早和最晚）；
        var start = new Date(start_day);
        var end = new Date(start_day);
        //起始日
        var s_year = start.getFullYear();
        var s_month = start.getMonth() + 1;
        var s_date = start.getDate();
        var s_week = start.getDay();
        // 结束日
        var e_year = end.getFullYear();
        var e_month = end.getMonth() + 1;
        var e_date = end.getDate();
        var e_week = end.getDay();
        //星期转化
        var chineseWeek = ['天', '一', '二', '三', '四', '五', '六'];

        // 如果起止在同一年份
        if (s_year == e_year) {
            //各月份的总天数
            var m_days = [31, 28 + this.is_leap(s_year), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
            // 如果起止在同一月份
            if (s_month == e_month) {
                var gap_day = e_date - s_date + 1;//跨度天数

            }
        } else {
            //各月份的总天数
            var m_days1 = [31, 28 + this.is_leap(s_year), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
            var m_days2 = [31, 28 + this.is_leap(e_year), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];


        }

        function date_dom(gapDay, dnow, mnow, wnow) {
            var dateDom = '';
            for (var i = 0; i < gapDay; i++) {
                var dateInfo, cweek, cdate, cmon;
                // 如果日期还没超过当月天数
                if (dnow + i <= m_days[mnow]) {
                    cdate = dnow + i;
                    cmon = mnow + 1;
                } else {
                    cdate = dnow + i - m_days[mnow];
                    cmon = mnow + 2;
                }
                // 如果星期还没超过星期天
                if (wnow + i <= 6) {
                    cweek = chineseWeek[wnow + i];
                } else {
                    var ww = (wnow + i) % 7;
                    cweek = chineseWeek[ww];
                }
                dateInfo = cmon + '-' + cdate + '/' + cweek;
                dateDom += '<p class="date-item"><span>'+ cdate +'</span><span class="week">'+ cweek +'</span></p>' 
            }
        }
    }
    //是否为闰年
    private is_leap(year) {
        var res;
        return (year % 100 == 0 ? res = (year % 400 == 0 ? 1 : 0) : res = (year % 4 == 0 ? 1 : 0));
    }
}
export = VPresenter;