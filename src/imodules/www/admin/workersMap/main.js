define(function() {
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

            var data = [
                {
                    name: "张三",
                    in_city: "北京",
                    lng: "116.306206",
                    lat: "39.975468",

                    schedule: [
                        {
                            from: "2017-4-26",        
                            to: "2017-4-26",        

                            in_city: "西安",
                            lng: "108.945964",
                            lat: "34.269558",
                        },
                        {
                            from: "2017-4-26",        
                            to: "2017-4-26",        

                            in_city: "昆明",
                            lng: "102.712938",
                            lat: "25.038912",
                        },
                        {
                            from: "2017-4-26",        
                            to: "2017-4-26",        

                            in_city: "武汉",
                            lng: "114.291019",
                            lat: "30.579196",
                        }
                    ]
                },
                {
                    name: "张三1",
                    in_city: "深圳",
                    lng: "113.907306",
                    lat: "22.527573"
                }
            ];
            this.foo(data);
        };
        potato.createClass(CON, baseIModules.BaseIModule);
		
        CON.prototype.foo = function(data) {
            this.map = new AMap.Map('container', {
                center: [116.306206, 39.975468],
                zoom: 4
            }); 

            for (var i = 0; i < data.length; i++) {
                var item = data[i];
                marker = new AMap.Marker({
                    position: [item.lng, item.lat]
                });
                marker.setMap(this.map);
            }

            var _this = this;
            this.addFlyingLayer(function() {
                _this.addAllFlyings(data);
            });
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
                var sch = data[i].schedule;
                if (sch) {
                    ctx.beginPath();
                    for (var j = 0; j < sch.length - 1; j++) {
                        var px1 = map.lnglatTocontainer([sch[j].lng, sch[j].lat]);
                        var px2 = map.lnglatTocontainer([sch[j+1].lng, sch[j+1].lat]);
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
