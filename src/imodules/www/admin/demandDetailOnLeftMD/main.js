define(function() {
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
		
		CON.prototype.render = function(info, dest, maxHeight, cb) {
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
            $(this._els.leftDetail).html(dom);
            $(dest).html($(this.dom));

            $(this.dom).css('height', maxHeight);
            cb && cb();
		}

        return CON;
    })();

    return Module;
})
