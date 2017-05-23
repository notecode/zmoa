define(["/global/iscripts/libs/time/moment.js"], function(moment) {
    var Module = (function() {
		var baseIModules = project.baseIModules;
        var CON = function(dom) {
            baseIModules.BaseIModule.call(this, dom);
            this.tpl = this._els.tpl[0].text;
            this.turnFor();
            var _this = this;
            //project.events.addListener('login.ensured', function(event) {
                _this.getList();
            //});
        };
        potato.createClass(CON, baseIModules.BaseIModule);
		
		CON.prototype.getList = function() {
            var _this = this;
            api_ajax('project/engineer_going_projects', {
                succ: function(json) {
                    if (json.userName) {
                        document.title = json.userName;
                    }

                    for (var i=0; i<json.list.length; i++){
                        if(json.list[i].start_date) {
                            json.list[i].start_date = moment(json.list[i].start_date).format('M月DD日');
                        }
                        if(json.list[i].end_date) {
                            json.list[i].end_date = moment(json.list[i].end_date).format('M月DD日');
                        }
                    }
                    var dom = Mustache.render(_this.tpl, json); 
                    $(_this._els.proRunning).html(dom);
                },
                fail: function(json) {

                }
            });
        }

        CON.prototype.turnFor = function(){
            var _this = this;
            $(this._els.proRunning).on('click','.mr-lsit',function(e){
                var pid = $(this).data().id;
                location.href='/project/detail.html?projectId=' + pid;
            })
        }
        
        return CON;
    })();

    return Module;
})
