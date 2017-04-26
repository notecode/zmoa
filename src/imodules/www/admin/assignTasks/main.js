define(["/global/iscripts/libs/time/moment.js",
        "/global/iscripts/test/mock/api-4-project-detail.js",
        "/global/iscripts/test/mock/api-4-assign.js"], 
        function(moment, mock_detail, mock_stat) {
    var Module = (function() {
		var baseIModules = project.baseIModules;
        var CON = function(dom) {
            baseIModules.BaseIModule.call(this, dom);
            this.tpl = this._els.tpl[0].text;

            this.renderDetail(mock_detail);
            //this.renderWorkerStats(mock_stat);

            this.serv = null;
        };
        potato.createClass(CON, baseIModules.BaseIModule);
		
		CON.prototype.renderDetail = function(mock) {
            var dom = Mustache.render(this.tpl, mock); 
            this.find('.body-block').append(dom);
		}

		CON.prototype.renderWorkerStats = function(mock) {
            var tpl = this.find('#day-header-tpl').text();

            var newData = this.prepareStatData(mock);
            //var dom = Mustache.render(tpl, newData);
            //this.find('.body-block').append(dom);
        }

        CON.prototype.prepareStatData = function(raw) {
            var wd = ['日', '一', '二', '三', '四', '五', '六'];

            var new_data = {
                header: [],
                free: []
            };

            var workers = raw.all_service_user_list;
            var servGrid = [];

            var total = workers.length;
            var days = raw.date_serving_user_ids;
            for (var i = 0; i < days.length; i++) {
                var the = days[i];
                var infoList = the.serving_user_info_list;
                var mmt = moment(the.date);
                new_data.header.push({
                    date: mmt.format('M-DD'),
                    weekDay: wd[mmt.day()],
                    free: total - infoList.length
                });

                // 先弄一个填满的列，对应于一天
                var servCol = Array(infoList.length).fill(null);
                for (var i = 0; i < infoList.length; i++) {
                    var info = infoList[i];
                    servCol[info.user_id] = info;
                } 

                servGrid.push(servCol);
            }

            this.serv = {
                home: 
                grid: servGrid
            }
            tlog(new_data);
            return new_data;
        }

        return CON;
    })();

    return Module;
})
