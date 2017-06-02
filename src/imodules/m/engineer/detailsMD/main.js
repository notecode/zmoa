define(["/global/iscripts/libs/time/moment.js"], function(moment) {
    var Module = (function() {
		var baseIModules = project.baseIModules;
        var CON = function(dom) {
            baseIModules.BaseIModule.call(this, dom);
            this.tpl = this._els.tpl[0].text;
        };
        potato.createClass(CON, baseIModules.BaseIModule);

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

		CON.prototype.render = function(proj) {
            var worker = proj.service_user || {};
            proj.main_img = proj_img_url(proj.main_img);
            var dom = Mustache.render(this.tpl, {
                proj: proj,
                fn: {
                    apply_environment: function() {
                        return proj.apply_environment = APPLY_ENVIRONMENT[proj.apply_environment];
                    },
                    screen_color: function() {
                        return proj.screen_color = SCREEN_COLOR[proj.screen_color];
                    },
                    hide_main_img: function() {
                        var img = proj.main_img;
                        return (img && img.length > 0) ? '' : 'hide';
                    },
                    sched: function() {
                        var end = worker.end_date;
                        return (end && end.length > 0) ? 'show' : 'hide';
                    },
                    sch_start: function() {
                        var start = worker.start_date;
                        return start ? moment(start).format('M月DD日') : '';
                    },
                    sch_end: function() {
                        var end = worker.end_date;
                        return end ? moment(end).format('M月DD日') : '';
                    }
                }
            });
            this.find('.details').append(dom);

            this.bindFoldEvents();
            this.detailAddress();
		}
		
		CON.prototype.bindFoldEvents = function() {
            var fold = this.find('.fold-table');
            var unfold = this.find('.unfold-table');
            var table = this.find('.info-table');

            var tog = function() {
                fold.toggle();
                unfold.toggle();
                table.toggle();
            };
            fold.click(tog);
            unfold.click(tog);
		}

        // 获取地址列表
        CON.prototype.detailAddress = function() {   
            var provinceName = '省份';
            var cityName = "城市";
            var areaName = "区/县";

            api_ajax('region/get_region', {
                succ: function(data) {
                    var pId = $('.xm-diqu').data().provice;
                    var cId = $('.xm-diqu').data().city;
                    var aId = $('.xm-diqu').data().area;

                    if (data) {
                        //根据省份id查找省份名称
                        for (var i=0; i<data.province.length; i++){
                            if (parseInt(data.province[i].id) == parseInt(pId)){
                                provinceName = data.province[i].name;
                            }
                        }

                        //根据城市id查找城市名称
                        for (var i=0; i<data.city.length; i++){
                            if (parseInt(data.city[i].id) == parseInt(cId)){
                                cityName = data.city[i].name;
                            }
                        }

                        //根据区域id查找区域名称
                        for (var i=0; i<data.area.length; i++){
                            if (parseInt(data.area[i].id) == parseInt(aId)){
                                areaName = data.area[i].name;
                            }
                        }
                        $('.xm-diqu').html(provinceName+cityName+areaName);
                    }
                },
                fail: function(json) {
                    console.log('获取地址数据失败!');                    
                }
            });  
        }
        
        return CON;
    })();

    return Module;
})
