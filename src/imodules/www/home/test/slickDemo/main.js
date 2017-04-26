define(["/global/iscripts/tools/slick.js"], function(mock_detail) {
    var Module = (function() {
		var baseIModules = project.baseIModules;
        var CON = function(dom) {
            baseIModules.BaseIModule.call(this, dom);
            //this.tpl = this._els.tpl[0].text;

            //this.renderDetail(mock_detail);
            
            $('.slick').slick({
              slidesToShow: 7,
              slidesToScroll: 1,
              autoplay: false,
              infinite: false,
              autoplaySpeed: 2000,

            });
            $('.slick-next').html('<span class="icon-right"></span>');
            $('.slick-prev').html('<span class="icon-left"></span>');


            
        };
        potato.createClass(CON, baseIModules.BaseIModule);
		
		
        return CON;
    })();

    return Module;
})
