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
            this.map = null;
            this.flyCanvas = null;

            var newData = this.prepare(mock);
            //tlog(newData);
            this.render(newData);
        };
        potato.createClass(CON, baseIModules.BaseIModule);
		
        CON.prototype.prepare = function(data) {
            /*
             * 1. 剔除已经完成的任务
             * 2. “当前”位置可能的三种情况：
             *     > 驻地（还没有完成过任务）
             *     > 正在进行的任务所在地
             *     > 最后一个完成的任务所在地
             *
             * 实现逻辑：projects[]从后往前捣，直到找到今天为临界，进行判断
             */

            var today = moment();
            var result = [];
            for (var ii = 0; ii < data.length; ii++) {
                var raw_worker = data[ii];

                var start = null;
                var follow = [];
                var sch = raw_worker.projects ? raw_worker.projects : [];
                for (var i = sch.length - 1; i >= 0; i--) {
                    var the = sch[i];
                    if (today.isBefore(moment(the.start_date))) {
                        follow.push(the);
                    } else {
                        start = the; 
                        break;
                    }
                }

                // 如果“今天”没有落在某个任务中，或任务后（有已完成任务），则以驻地为起始
                if (!start) {
                    start = {
                        longitude: raw_worker.longitude,
                        latitude: raw_worker.latitude,
                        project_name: raw_worker.city_name
                    };
                }

                follow.push(start);
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

        CON.prototype.render = function(data) {
            this.map = new AMap.Map('container', {
                center: [116.306206, 39.975468],
                zoom: 4
                //zoom: 11 
            }); 

            this.addMarkers(data);

            var _this = this;
            this.addFlyingLayer(function() {
                _this.addAllFlyings(data);
            });
        }

        CON.prototype.addMarkers = function(data) {
            for (var i = 0; i < data.length; i++) {
                var worker = data[i];
                var proj_list = worker.proj_list;

                var cnt = proj_list.length;
                for (var j = 0; j < proj_list.length; j++) {
                    var proj = proj_list[j];
                     
                    if (0 == j) {
                        var pin = this.find('.tpl .marker-pin').clone();
                        var marker = new AMap.Marker({
                            position: [proj.longitude, proj.latitude],
                            content: pin.get(0),
                            offset: new AMap.Pixel(-7, -37)  // 钉子宽14，高37
                        });
                        marker.setMap(this.map);
                        tlog(proj.project_name + ' is pin');
                    } else {
                        var coin = this.find('.tpl .marker-coin').clone();
                        var marker = new AMap.Marker({
                            position: [proj.longitude, proj.latitude],
                            content: coin.get(0),
                            offset: new AMap.Pixel(-4, -4)  // 点宽高8
                        });
                        marker.setMap(this.map);
                    }
                }
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

        CON.prototype.addAllFlyings = function(data) {
            var map = this.map;
            var canvas = this.flyCanvas;
            var ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.setLineDash([6, 4]);
            ctx.lineWidth = 1;

            for (var i = 0; i < data.length; i++) {
                var sch = data[i].projects;
                if (sch) {
                    ctx.beginPath();
                    for (var j = 0; j < sch.length - 1; j++) {
                        var px1 = map.lnglatTocontainer([sch[j].longitude, sch[j].latitude]);
                        var px2 = map.lnglatTocontainer([sch[j+1].longitude, sch[j+1].latitude]);
                        this.addFlying(ctx, px1, px2);
                    }
                }
            }

//            ctx.strokeStyle = '#F6A623';
            ctx.strokeStyle = '#0000ff';
            ctx.stroke();
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

        return CON;
    })();

    return Module;
})
