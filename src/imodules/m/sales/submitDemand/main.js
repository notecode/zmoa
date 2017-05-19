define(function() {
    var Module = (function() {
		var baseIModules = project.baseIModules;
        var CON = function(dom) {
            baseIModules.BaseIModule.call(this, dom);
            this.tpl = this._els.tpl[0].text;
            this.addressTpl = this._els.tpl[1].text;
            this.id = qs('project_id');
            this.provinceId = '';
            this.mgetMyPro();
            
        };
        potato.createClass(CON, baseIModules.BaseIModule);

        //获取详细信息
        CON.prototype.mgetMyPro = function() {
            var _this = this;
            var id=this.id;
            var localaddress = window.localStorage.getItem('address');

            api_ajax('project/detail/' + id, {
                succ: function(json) {
                    //颜色

                    var dom = Mustache.render(_this.tpl, json); 
                    $(_this._els.detailInfo).html(dom);

                    _this.addressItems();
                },
                fail: function(json) {

                }
            });
        }

        // 获取地址列表
        CON.prototype.addressItems = function() {      
            var dtd = $.Deferred();
            var _this = this;
            var addressCache = window.localStorage.getItem('address');
            var addressObj = '';
            var proviceId = $('.proviceval').data().provice;
            try {
                addressObj = JSON.parse(addressCache);   
                _this.address = addressObj;
                dtd.resolve();
            } catch (error) {
                addressObj = {};
                dtd.reject()
            }  

            
            api_ajax('region/get_region', {
                succ: function(data) {
                    if (data) {
                        dtd.resolve();
                        _this.address = data;
                        for (var i=0; i<data.province.length; i++){
                            if (data.province[i].id == proviceId){
                                data.province[i].proname = data.province[i].name;
                            }
                        }

                        var domStr = Mustache.render(_this.addressTpl, { items: data.province });
                        $('.js-addres-city').html(domStr);
                        window.localStorage.setItem('address', JSON.stringify(data))
                    }
                },
                fail: function(json) {
                    dtd.reject();
                    console.log('获取地址数据失败!');                    
                }
            });  
            return dtd.promise();
        }

        
        
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
