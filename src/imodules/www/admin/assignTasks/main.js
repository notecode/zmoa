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
            this.projId = null;
        };
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
        potato.createClass(CON, baseIModules.BaseIModule);
		
		CON.prototype.render = function(projId, json) {
            this.projId = projId;
            this.find('.body-block').empty();
            $(this.dom).show();

            var _this = this;
            var doRenderDetail = function(data) {
                var proj = json.project_info;
                _this.renderDetail(proj);
            };
            var doRenderStat = function(data) {
                _this.renderWorkerStats(data);
                _this.bindEvents();
                _this.bindSlick();
            };

            if (1 == qs('test')) {
                doRenderDetail(mock_detail);
                doRenderStat(mock_stat);
            } else {
                doRenderDetail(json);

                var data = {
                    projectId: projId,
                    startDate: moment().format('YYYY-MM-DD'),
                    pageSize: 30
                };
                api_ajax_post('project/project_schedule', data, {
                    succ: function(json) {
                        doRenderStat(json);
                    }
                });
            }
        }

		CON.prototype.renderDetail = function(info) {
            info.main_img = proj_img_url(info.main_img);
            info.fn = {
                applyEnvironment: function() {
                    return APPLY_ENVIRONMENT[this.apply_environment];
                },
                screenColor: function() {
                    return SCREEN_COLOR[this.screen_color];
                },
                hide_comment: function() {
                    return (this.comment.length > 0) ? '' : 'hide';
                }
            };
            var dom = Mustache.render(this.tpl, info); 
            this.find('.body-block').append(dom);
            this.parent.refreshSize();
		}

		CON.prototype.renderWorkerStats = function(stats) {
            var header = this.prepareStatData(stats);
            var serv_tpl = this.find('#serv-tpl').text();
            var dom = Mustache.render(serv_tpl, {header: header});
            this.find('.body-block').append(dom);

            this.renderADay(0);
            this.parent.refreshSize();
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
            //if (confirm(msg)) {
            if (true) {
                api_ajax_post('project/assign_person', data, {
                    succ: function(json) {
                        // 不要加这个提示，因为有副作用
                        // project.tip('指派成功', 'succ', '', true);
                        project.getIModule('imodule://serviceProcess').moveProject(_this.projId, 2);
                        project.getIModule('imodule://detailRouterMD', null, function (mod) {
                            project.open(mod, '_self', {size: ['100px', '100px']});
                            mod.route(_this.projId);
                        });
                    },
                    fail: function(json) {
                        console.error('assign worker failed');
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

        CON.prototype._ievent_showStatus = function(obj) {
            this.find('#controlProcessMD').toggle();
            if(this.find('#controlProcessMD').is(':hidden')){
                $('#iunfold').removeClass('unfoldown');
            }else {
                $('#iunfold').addClass('unfoldown');    
            }

            // todo: 点击其他区域，消失
        }

        return CON;
    })();

    return Module;
})
