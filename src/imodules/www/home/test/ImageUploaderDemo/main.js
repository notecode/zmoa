define(function() {
    var Module = (function() {
		var baseIModules = project.baseIModules;
        var CON = function(dom) {
            baseIModules.BaseIModule.call(this, dom);

            project.getIModule('imodule://ImageUploader', null, function(mod) {
                mod.initCallback({
                    // 选中图片时回调，表示上传开始。为了与下面的succ/fail配对使用，以在等待上传时冻结UI，
                    // 防止出现未等上传完成就提交，造成的带不上image url
                    on_select: function() {
                        tlog('upload started');
                    },

                    // 上传至服务端的结果回调succ/fail
                    succ: function(json) {
                        tlog('uploaded image: ' + json.image);
                    },
                    fail: function(json) {
                        tlog('fail: ' + json.msg);
                    },

                    // 删除图片时的回调
                    on_delete: function(url) {
                        tlog('you deleted image: ' + url);
                    }
                });
            })        

//            var org = 'http://cdn.xxtao.com/cms/pics/demand/7_1/483/760/599/494457_1483760599_67754.jpg';
            var org = 'http://cdn.xxtao.com/cms/pics/demand/7_1/483/783/595/494457_1483783595_29484.jpg';
            project.getIModule('imodule://ImageUploader', null, function(mod) {
                // mod.setOrgImage(org);
            });

            debug.debug('a debug log');
            debug.info('a info log');
            debug.warn('a warn log');
            debug.error('a error log');

            this._input();
        };
        potato.createClass(CON, baseIModules.BaseIModule);

        CON.prototype._ievent_onDone = function() {
          console.log("on done");
            project.getIModule('imodule://ImageUploader', null, function(mod) {
                mod.onDone();
            });
        }

        CON.prototype._ievent_onDad = function() {
          console.log("[ievent]onDad");
        }
		
        CON.prototype._ievent_onSon = function() {
          console.log("[ievent]onSon");
        }

        CON.prototype._input = function() {
            $(this._els.shit).bind('input propertychange','input',function(event) {
                console.log($(this).val());
            })
        }

        return CON;
    })();

    return Module;
})
