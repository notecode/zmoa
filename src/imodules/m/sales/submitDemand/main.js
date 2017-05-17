define(function() {
    var Module = (function() {
		var baseIModules = project.baseIModules;
        var CON = function(dom) {
            baseIModules.BaseIModule.call(this, dom);
            
            
        };
        potato.createClass(CON, baseIModules.BaseIModule);
        
        CON.prototype._ievent_provice = function(){
            $(this._els.infoMask).removeHide();
            $(this._els.selProvice).removeHide();
        }

        CON.prototype._ievent_city = function(){
            $(this._els.infoMask).removeHide();
            $(this._els.selCity).removeHide();
        }

        CON.prototype._ievent_district = function(){
            $(this._els.infoMask).removeHide();
            $(this._els.selDistrict).removeHide();
        }

        CON.prototype._ievent_Mask = function(){
            $(this._els.infoMask).addHide();
            $(this._els.selProvice).addHide();
            $(this._els.selCity).addHide();
            $(this._els.selDistrict).addHide();
        }

        CON.prototype._ievent_clickPro = function(data, target, hit){
            $(this._els.infoMask).addHide();
            $(this._els.selProvice).addHide();
        }

        CON.prototype._ievent_clickCit = function(data, target, hit){
            $(this._els.infoMask).addHide();
            $(this._els.selCity).addHide();
        }

        CON.prototype._ievent_clickDis = function(data, target, hit){
            $(this._els.infoMask).addHide();
            $(this._els.selDistrict).addHide();
        }
        return CON;
    })();

    return Module;
})
