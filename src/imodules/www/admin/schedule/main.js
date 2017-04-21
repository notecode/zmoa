define(function() {
    var Module = (function() {
        var baseIModules = project.baseIModules;
        var CON = function(dom) {
            baseIModules.BaseIModule.call(this, dom);
            this.tpl = this._els.tpl[0].text;

            //test
            this.foo();
        };
        potato.createClass(CON, baseIModules.BaseIModule);

        CON.prototype.foo = function() {
            var _this = this;
            var data = [
                {
                    "project": "太古里SOHO",
                    "in_city": "北京",
                    "day_start": "2017-4-22",
                    "day_ended": "2017-4-28",
                },
                {
                    "project": "布达拉宫广场",
                    "in_city": "拉萨",
                    "day_start": "2017-5-1",
                    "day_ended": "2017-5-4",
                }
            ];
            var dom = Mustache.render(this.tpl, {
                projects: data,
                cells: ['', '', '', 'today', ''],
                util: {
                    bar_start: function() {
                        return 50; 
                    },
                    bar_length: function() {
                        return 50 * 3;
                    }
                }
            }); 
            this.find('#foo').html(dom);
        }

        CON.prototype._ievent_ = function(data, target, hit) {
        }

        return CON;
    })();

    return Module;
})
