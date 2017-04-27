define(["/global/iscripts/libs/time/moment.js",
        "/global/iscripts/test/mock/api-4-project-detail.js",
        "/global/iscripts/test/mock/api-4-assign.js",
        "/global/iscripts/tools/slick.js"], 
        function(moment, mock_detail, mock_stat) {
    var Module = (function() {
		var baseIModules = project.baseIModules;
        var CON = function(dom) {
            baseIModules.BaseIModule.call(this, dom);
            this.tpl = this._els.tpl[0].text;
            this.serv = null;

            this.renderDetail(mock_detail);
            this.renderWorkerStats(mock_stat);
            this.bindEvents();
            this.bindSlick();
        };
        potato.createClass(CON, baseIModules.BaseIModule);
		
		CON.prototype.renderDetail = function(mock) {
            var dom = Mustache.render(this.tpl, mock); 
            this.find('.body-block').append(dom);
		}

		CON.prototype.renderWorkerStats = function(mock) {
            var header = this.prepareStatData(mock);
            var serv_tpl = this.find('#serv-tpl').text();
            var dom = Mustache.render(serv_tpl, {header: header});
            this.find('.body-block').append(dom);

            this.renderADay(0);
        }

        CON.prototype.prepareStatData = function(raw) {
            var wd = ['日', '一', '二', '三', '四', '五', '六'];
            var raw_workers = raw.all_service_user_list;

            // 给worker数据加上一个索引（当前所在位置），并将id（即key）也放到value中，方便后边用
            var keys = Object.keys(raw_workers);
            var total = keys.length;
            for (var i = 0; i < total; i++) {
                var id = keys[i];
                raw_workers[id].user_id = id;   // 通过索引找id时用
                raw_workers[id].index = i;      // 通过id找索引时用
            }

            var header = [];
            var servGrid = [];

            var days = raw.date_serving_user_list;
            for (var i = 0; i < days.length; i++) {
                var the = days[i];
                var infoList = the.serving_user_info_list;
                var mmt = moment(the.date);
                header.push({
                    index: i,
                    fullDate: the.date,
                    date: mmt.format('M-D'),
                    weekDay: wd[mmt.day()],
                    free: total - infoList.length
                });

                // 先弄一个填满的列，对应于一天
                var servCol = Array(total).fill(null);
                for (var j = 0; j < infoList.length; j++) {
                    var info = infoList[j];
                    var index = raw_workers[info.user_id].index;
                    servCol[index] = info;
                } 

                servGrid.push(servCol);
            }

            this.serv = {
                obj_workers: raw_workers,
                arr_workers: Object.values(raw_workers),
                grid: servGrid
            }

            return header;
        }

        CON.prototype.renderADay = function(index) {
            // serv: 这一天，各worker的情况
            var todayServ = this.serv.grid[index];
            var workers = [];
            for (var i = 0; i < todayServ.length; i++) {
                if (todayServ[i]) { // 说明在服务中
                    var worker = todayServ[i];
                    worker.name = this.serv.obj_workers[worker.user_id].name;
                    worker.busy = 1;
                    workers.push(worker);
                } else { // 说明空闲
                    workers.push(this.serv.arr_workers[i]);
                }
            }

            var idx = 0;
            var grid_tpl = this.find('#grid-tpl').text();
            var grid = Mustache.render(grid_tpl, {
                workers: workers,
                util: {
                    index: function() {
                        return idx++;
                    },
                    place: function() {
                        return this.city || this.city_name;
                    },
                    during: function() {
                        var s = moment(this.start_date).format('M/D');
                        var e = moment(this.end_date).format('M/D');
                        return (s + '-' + e);
                    }
                }
            });

            this.find('.date-block').append(grid);
            this.find('.date-day[data-index=' + index + ']').addClass('cur-day');

            var _this = this;
            this.find('[evt=chooseSupplier]').click(function() {
                var idx = $(this).parent().attr('data-index');
                tlog(idx);
                _this.assignTask(idx); 
            });
        }

        CON.prototype.assignTask = function(userIdx) {
            var data = {
                projectId: qs('project') || qs('projectId'),
                date: this.find('.cur-day').attr('data-date'),
                userId: this.serv.arr_workers[userIdx].user_id
            };
            assert(data.projectId);

            api_ajax_post('project/assign_person', data, {
                succ: function(json) {
                    project.tip('指派成功', 'succ', '', true);
                },
                fail: function(json) {
                    console.error('assign worker failed');
                }
            })
        }

        CON.prototype.bindEvents = function() {
            var _this = this;
            $('.date-day').click(function() {
                var idx = $(this).attr('data-index');
                var date = $(this).attr('data-date');
                tlog(date);

                _this.find('.suppliers-list').remove();
                $(this).siblings().removeClass('cur-day');

                _this.renderADay(idx);
            });
        }

        CON.prototype.bindSlick = function() {
            $('.slick').slick({
                slidesToShow: 7,
                slidesToScroll: 1,
                autoplay: false,
                infinite: false,
                autoplaySpeed: 2000,
            });
            $('.slick-next').html('<span class="icon-right"></span>');
            $('.slick-prev').html('<span class="icon-left"></span>');
        }
        return CON;
    })();

    return Module;
})
