define(["/global/iscripts/libs/time/moment.js", 
        "/global/iscripts/libs/time/twix.js",
        "/global/iscripts/test/mock/api-4-map.js"], function(moment, Twix, mock) {
        // step: 
        // 1. add markers(在同一城市，错开，后续加上)
        // 2. bezier curve
        // 3. progress bar
        // 4. prompt box
    var Module = (function() {
		var baseIModules = project.baseIModules;
        var CON = function(dom) {
            baseIModules.BaseIModule.call(this, dom);
            this.tpl = this._els.tpl[0].text;

            this.map = null;
            this.flyCanvas = null;
            this.markers = [];
            this.topzIndex = 111;

            var _this = this;
            var doRender = function(raw) {
                var newData = _this.prepare(raw);
                _this.render(newData);
                _this.renderWorkerList(raw);
                _this.addWorkerListMouseEvens();
            };

            if (1 == qs('test')) {
                doRender(mock);
            } else {
                api_ajax('project/project_user_schedule', {
                    succ: function(json) {
                        doRender(json);
                    },
                    fail: function(json) {
                        doRender([]);
                    }
                });
            }
        };
        potato.createClass(CON, baseIModules.BaseIModule);
		
        CON.prototype.prepare = function(data) {
            /*
             * 1. 剔除已经完成的任务
             * 2. “当前”位置可能的三种情况：
             *     > 驻地（还没有完成过任务）
             *     > 正在进行的任务所在地
             *     > 最后一个完成的任务所在地(x 不再考虑这种情况，完成了就打厮回去）
             *
             * 实现逻辑：projects[]从后往前捣，直到找到今天为临界，进行判断
             */

            var today = moment();
            var result = [];
            for (var ii = 0; ii < data.length; ii++) {
                var raw_worker = data[ii];
                var task_cnt = 0;

                var start = {
                    longitude: raw_worker.longitude,
                    latitude: raw_worker.latitude,
                    project_name: raw_worker.city_name,
                    city_name: raw_worker.city_name
                };
                var follow = [];
                var proj = raw_worker.projects ? raw_worker.projects : [];
                for (var i = proj.length - 1; i >= 0; i--) {
                    var the = proj[i];
                    if (null == the.start_date || null == the.end_date) {
                        continue;
                    }

                    // 今天之后的排期, 无条件纳入
                    if (today.isBefore(moment(the.start_date))) {
                        follow.push(the);
                        task_cnt++;
                    } else {
                        // 进行中的排期
                        if (today.isSameOrBefore(moment(the.end_date))) {
                            start = the; 
                            task_cnt++;
                        } else {
                            // 因接口返回的数据为进行中、排期中的项目。故，今天之前的，实际还在进行中(gantt图页有同样逻辑)
                            the.end_date = today.format('YYYY-MM-DD');
                            start = the; 
                            task_cnt++;
                        }

                        var nIgnore = proj.length - task_cnt;
                        if (nIgnore > 0) {
                            tlog(raw_worker.user_name + ': ' + nIgnore + '个项目被无视(或因有null时间，或被视为已完成)');
                        }

                        // 后端依然按start_date升序排列，故可信赖。找到一个进行中的，或今天之前的最近一个，即结束。再往前的，就抛掉吧。
                        // 否则，逻辑已经就太乱了
                        break;
                    }
                }

                follow.push(start);
                raw_worker.task_count = task_cnt; // 改变raw数据，供左边列表用
                raw_worker.city_name = start.city_name; // 左边列表显示的城市是当前城市，而不恒为老窝

                var worker = {
                    name: raw_worker.user_name,
                    proj_list: follow.reverse()
                };
                result.push(worker);

                var oo = worker.name + ': ';
                for (var i = 0; i < worker.proj_list.length; i++) {
                    oo += (worker.proj_list[i].project_name + ' -> ');
                }
                tlog(oo);
            }

            return result;
        }

        CON.prototype.render = function(new_data) {
            this.map = new AMap.Map('container', {
                center: [116.396359,39.909346], // 天安门
                //zooms: [1, 5], // 可缩放范围
                zoom: 4
            }); 

            this.addMarkers(new_data);

            var _this = this;
            this.addFlyingLayer(function() {
                _this.addAllFlyings(new_data);
            });

            // 为了在放大后不显示公路（因公路颜色和flying线颜色太近），故加事件
            this.map.on('zoomend', function(e) {
                var zm = this.getZoom();
                // tlog('cur zoom: ' + zm);
                if (zm >= 6) {
                    if (this.getFeatures() === 'all') {
                        this.setFeatures(['bg', 'point', 'building']);
                    }
                } else {
                    if (this.getFeatures() !== 'all') {
                        this.setFeatures('all');
                    }
                }
            });
        }

        CON.prototype.addMarkers = function(new_data) {
            for (var i = 0; i < new_data.length; i++) {
                var marker_list = [];
                var worker = new_data[i];
                var proj_list = worker.proj_list;

                var cnt = proj_list.length;
                for (var j = 0; j < proj_list.length; j++) {
                    var proj = proj_list[j];
                     
                    // 需求: 
                    // 1. 当前正在进行的项目用黄色钉子+pane, 
                    // 2. 若当前无项目(不管未来是否有排期)，用灰色钉子, 无pane
                    // 3. 将来的排期用coin + pane
                    var marker = null;
                    if (0 == j) {
                        var pin = this.find('.tpl .marker-pin').clone();
                        var is_free = (null == proj.start_date);
                        this.renderPin(pin, worker.name, proj, is_free);
                        this.renderPane(pin, proj);
                        marker = new AMap.Marker({
                            position: [proj.longitude, proj.latitude],
                            content: pin.get(0),
                            zIndex: is_free ? 100 : 110,
                            offset: new AMap.Pixel(-7, -33)  // 钉子宽14，高37(我是真晕，搞不明白41px高的图片为啥弄出来就是37，好生费劲)
                        });
                        marker.setMap(this.map);
                    } else {
                        var coin = this.find('.tpl .marker-coin').clone();
                        this.renderPane(coin, proj);
                        marker = new AMap.Marker({
                            position: [proj.longitude, proj.latitude],
                            content: coin.get(0),
                            offset: new AMap.Pixel(-4, -4)  // 点宽高8
                        });
                        marker.setMap(this.map);
                    }

                    marker_list.push(marker);
                }

                this.markers.push(marker_list);
            }
        }
        
        CON.prototype.renderPin = function(pin, name, proj, is_free) {
            if (is_free) {
                pin.addClass('free');
                pin.find('.pane').remove();
                pin.find('.progress-bar').remove();
            } else if (proj.start_date) {
                // 可能的进度：进行中、完成
                var today = moment();
                var start = moment(proj.start_date);
                var end = moment(proj.end_date);

                var perc = 0;
                if (today.isSameOrAfter(end)) {
                    perc = 1;
                } else {
                    var passed = start.twix(today).length("days");
                    var total = start.twix(end).length("days");
                    perc = passed / total;
                }

                pin.find('.worker-name').text(name);
                pin.find('.inner-bar').width((60 - 2) * perc); // 注: 在css中设了一个min-width: 6px，否则若width太小，很难看
                pin.find('.progress-bar').show();
            } else {
                console.error('既不是free状态，又没有start_date，你啥意思');
            }
        }

        CON.prototype.renderPane = function(marker, proj) {
            var pane = marker.find('.pane'); 
            pane.find('.city').text(proj.city_name);

            if (proj.start_date) {
                pane.find('.date-from').text(moment(proj.start_date).format("M月DD日"));
                pane.find('.date-to').text(moment(proj.end_date).format("M月DD日"));
            }
        }

        CON.prototype.addFlyingLayer = function(render) {
            var _this = this;
            var map = this.map;
            map.plugin(['AMap.CustomLayer'], function() {
                _this.flyCanvas = document.createElement('canvas');
                _this.flyCanvas.width = map.getSize().width;
                _this.flyCanvas.height = map.getSize().height;
                var custLayer = new AMap.CustomLayer(_this.flyCanvas, {
                    zooms: [3, 8], 
                    zIndex: 12
                }); 

                custLayer.render = render;
                custLayer.setMap(map);
            }); 
        }

        CON.prototype.addAllFlyings = function(new_data) {
            var map = this.map;
            var canvas = this.flyCanvas;
            var ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.setLineDash([6, 4]);
            ctx.lineWidth = 1;
            ctx.strokeStyle = '#F6A623';

            for (var i = 0; i < new_data.length; i++) {
                var proj = new_data[i].proj_list;
                if (proj && proj.length > 1) {
                    ctx.beginPath();

                    for (var j = 0; j < proj.length - 1; j++) {
                        var px1 = map.lnglatTocontainer([proj[j].longitude, proj[j].latitude]);
                        var px2 = map.lnglatTocontainer([proj[j+1].longitude, proj[j+1].latitude]);
                        this.addFlying(ctx, px1, px2);
                    }

                    ctx.stroke();
                }
            }
        }

        CON.prototype.addFlying = function(ctx, from, to) {
            var pt1 = [from.getX(), from.getY()];
            var pt2 = [to.getX(), to.getY()];
            var deltaX = pt2[0] - pt1[0];
            var deltaY = pt2[1] - pt1[1];

            var c1 = [pt1[0] + deltaX / 2, pt1[1] + deltaY / 4];
            var c2 = [pt1[0] + deltaX * (3/4), pt1[1] + deltaY / 2];
    
            ctx.moveTo(pt1[0], pt1[1]);
//            ctx.lineTo(pt2[0], pt2[1]);
            ctx.bezierCurveTo(c1[0], c1[1], c2[0], c2[1], pt2[0], pt2[1]);
        }

        CON.prototype.renderWorkerList = function(raw_data) {
            var _this = this;
            var cnt = 0;
            var dom = Mustache.render(this.tpl, {
                total: raw_data.length,
                workers: raw_data,
                util: {
                    index: function() {
                        return cnt++;
                    },
                    no_circle: function() {
                        return this.task_count > 0 ? '' : 'no-circle';
                    }
                }
            }); 
            this.find('#left-list').append(dom);
        }

        CON.prototype.addWorkerListMouseEvens = function() {
            var _this = this;
            var togglePanes = function(idx, show) {
                var mlist = _this.markers[idx];
                for (var i = 0; i < mlist.length; i++) {
                    var jq = $(mlist[i].getContent());
                    jq.find('.pane').toggle();
                    jq.find('.progress-bar.alone').toggle();

                    if (show && (jq.find('.pane').length > 0)) {
                        //tlog('top z-index: ' + _this.topzIndex);
                        // 这要一直往上增，会有什么后果？
                        mlist[i].setzIndex(_this.topzIndex++); 
                    }
                }
            }

            $('.worker').mouseenter(function() {
                var i = $(this).attr('data-index');
                //tlog('you enter ' + i);
                togglePanes(i, true);
            });

            $('.worker').mouseleave(function() {
                var i = $(this).attr('data-index');
                //tlog('you leave ' + i);
                togglePanes(i);
            });
        }

        return CON;
    })();

    return Module;
})
