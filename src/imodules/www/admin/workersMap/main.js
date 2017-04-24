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
                zoom:3
            }); 

            for (var i = 0; i < data.length; i++) {
                var item = data[i];
                marker = new AMap.Marker({
                    position: [item.lng, item.lat]
                });
                marker.setMap(map);
            }
        }

        CON.prototype.addAllFlyings(data) {
            var map = this.map;
            var flyCanvas = this.flyCanvas;
            this.map.plugin(['AMap.CustomLayer'], function() {
                flyCanvas = document.createElement('canvas');
                flyCanvas.width = map.getSize().width;
                flyCanvas.height = map.getSize().height;
                var custLayer = new AMap.CustomLayer(flyCanvas, {
                    zooms: [3, 8], 
                    zIndex: 12
                }); 

                custLayer.render = function() {
                    bezier(canvas);
                }   

                custLayer.setMap(map);
            }); 
        }

        CON.prototype.addFlying(from, to) {

        }

		CON.prototype._ievent_ = function(data, target, hit) {
		}
        
        return CON;
    })();

    return Module;
})
