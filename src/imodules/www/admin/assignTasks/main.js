define(["/global/iscripts/libs/time/moment.js",
        "/global/iscripts/test/mock/api-4-assign.js",
        "/global/iscripts/tools/slick.js"], 
        function(moment, mock_detail, mock_stat) {
    var Module = (function() {
		var baseIModules = project.baseIModules;
        var CON = function(dom) {
            baseIModules.BaseIModule.call(this, dom);
            
            this.serv = null;
            this.projId = null;
            this.contMaxH = null;
        };
        potato.createClass(CON, baseIModules.BaseIModule);
		
		CON.prototype.render = function(proj, dest, maxH, cb) {
            this.projId = proj.id;
            this.contMaxH = maxH;

            var _this = this;
            var doRenderStat = function(data, dest, cb) {
                _this.renderWorkerStats(data, dest, cb);
                _this.bindEvents();
                _this.bindSlick();
            };

            if (1 == qs('test')) {
                doRenderStat(mock_stat, dest, cb);
            } else {
                var data = {
                    projectId: this.projId,
                    startDate: moment().format('YYYY-MM-DD'),
                    pageSize: 30
                };
                api_ajax_post('project/project_schedule', data, {
                    succ: function(json) {
                        doRenderStat(json, dest, cb);
                    }
                });
            }
        }

		CON.prototype.renderWorkerStats = function(stats, dest, cb) {
            var header = this.prepareStatData(stats);
            var serv_tpl = this.find('#serv-tpl').text();
            var dom = Mustache.render(serv_tpl, {header: header});
            this.find('.content').html(dom);
            this.renderADay(0);

            $(dest).html($(this.dom));
            cb && cb();
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
                arr_workers: ObjectValues(raw_workers),
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
                    worker.busy = {
                        start_date: worker.start_date,
                        end_date: worker.end_date
                    };
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

            var h = this.contMaxH - (60 + 40);
            this.find('.suppliers-list').css('height', h);

            var _this = this;
            this.find('[evt=chooseSupplier]').click(function() {
                var idx = $(this).parent().attr('data-index');
                tlog(idx);
                _this.assignTask(idx); 
            });
        }

        CON.prototype.assignTask = function(userIdx) {
            var data = {
                projectId: this.projId,
                date: this.find('.cur-day').attr('data-date'),
                userId: this.serv.arr_workers[userIdx].user_id
            };
            assert(data.projectId);

            var name = this.find('.proj-name').text();
            var user_name = this.serv.obj_workers[data.userId].name;
            var msg = '您确定将项目 ' + name + ' 指派 ' + user_name + ' 于 ' + data.date + ' 去维修?';
            tlog(msg);

            var _this = this;
            if (true) {
                api_ajax_post('project/assign_person', data, {
                    succ: function(json) {
                        window.onStatusTransfered4UI(_this.projId, 2);
                    },
                    fail: function(json) {
                        console.error('assign worker failed');
                        alert(json.errmsg);
                    }
                })
            }
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
            //ref: http://kenwheeler.github.io/slick/
            $('.slick').slick({
                slidesToShow: 7,
                slidesToScroll: 1,
                speed: 100,
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
