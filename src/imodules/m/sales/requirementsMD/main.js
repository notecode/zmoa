define(function() {
    var Module = (function() {
		var baseIModules = project.baseIModules;
        var CON = function(dom) {
            baseIModules.BaseIModule.call(this, dom);
            this.openDetail();
        };
        potato.createClass(CON, baseIModules.BaseIModule);

        //点击展开详细信息
        CON.prototype.openDetail = function(){
            $(this._els.openDetail).click(function(){
                var statusone = $(this).parent().find('.has-first');
                var statusother = $(this).parent().find('.has-status');
                if($(this).hasClass('hascurrent')) {
                    statusone.removeHide();
                    statusother.addHide();
                    $(this).removeClass('hascurrent')
                }else{
                    statusone.addHide();
                    statusother.removeHide();
                    $(this).addClass('hascurrent')
                }
                
            })
        }
     
        return CON;
    })();

    return Module;
})
