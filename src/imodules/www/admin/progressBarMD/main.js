define(function() {
    var Module = (function() {
		var baseIModules = project.baseIModules;
        var CON = function(dom) {
            baseIModules.BaseIModule.call(this, dom);
            this.btn = $(this._els.btn);

            this.bAlwaysEnable = false;
            this.onAction = null;
        };
        potato.createClass(CON, baseIModules.BaseIModule);
		
        CON.prototype.showMe = function(bShow) {
            $(this.dom).showMe(bShow);
        }

		CON.prototype.initRender = function(caption, bAlwaysEnable, percent, onAction) {
            this.find('[idom=btn]').text(caption);
            this.bAlwaysEnable = bAlwaysEnable;
            this.updatePercent(percent);

            this.onAction = onAction;
		}
		
        CON.prototype.updatePercent = function(percent) {
            this.find('#tageNum').html(percent);
            this.find('#Percentage').css('width', percent + '%');

            if (this.bAlwaysEnable || 100 == percent) {
                this.btn.removeAttr('disabled');
            } else {
                this.btn.attr("disabled", true);
            }
        }

        CON.prototype._ievent_action = function() {
            tlog('action');
            this.onAction && this.onAction(this.btn);
        }
        return CON;
    })();

    return Module;
})

