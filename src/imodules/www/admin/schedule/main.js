define(["/global/iscripts/libs/time/twix.js"], function(Twix) {
    var Module = (function() {
        var baseIModules = project.baseIModules;
        var CON = function(dom) {
            baseIModules.BaseIModule.call(this, dom);
            this.tpl = this._els.tpl[0].text;

            //test
            //this.foo();
            this.bar();
        };
        potato.createClass(CON, baseIModules.BaseIModule);

        CON.prototype.bar = function() {
            var itr = new Twix(new Date('2012-01-15'),new Date('2012-01-20')).iterate("days");
            var range=[];
            while(itr.hasNext()){
                range.push(itr.next().format("YYYY-M-D"))
            }
            console.log(range);
        }

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
