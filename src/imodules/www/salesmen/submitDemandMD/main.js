define(['/global/iscripts/libs/blueimp/JQueryFileUpload/jquery.fileupload.js', 
        '/global/iscripts/libs/blueimp/JQueryFileUpload/jquery.fileupload-process.js',
        '/global/iscripts/libs/blueimp/JQueryFileUpload/jquery.fileupload-image.js'], function() {
    var Module = (function() {
        var baseIModules = project.baseIModules;
        var CON = function(dom) {
            var _this = this;
            baseIModules.BaseIModule.call(this, dom);
            this.tpl = this._els.tpl[0].text;
            // 调用图片上传
            this._init();
            // 图片删除
            $(this._els.LUploadContent).on('click', '.js-remove-img', function(e) {                
                _this.removeImg(e.target);            
            });
        };
        potato.createClass(CON, baseIModules.BaseIModule);
        // 初始化图片上传组件
        CON.prototype._init = function() {
            var isLowIE = (isIE(8) || isIE(9));
            var mod = this;
            var now = $.now();
            $(this._els.LImageUpload).fileupload({
                url: 'http://zmoa.bxland.com/project/upload_image/project?time=' + now, 
                dataType: 'json',
                autoUpload: false,
                acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i,
                maxFileSize: 999000,
                previewMaxWidth: 114,
                previewMaxHeight: 70,
                previewThumbnail: false,
                forceIframeTransport: isLowIE, 
                xhrFields: {
                    withCredentials: true
                }
            }).on('fileuploadadd', function (e, data) {
                 var _this = this;
                 $(mod._els.fileError).addHide();
                // 上传数据，隐藏按钮
                $.each(data.files, function (index, file) {
                    $(_this).parent().addHide().next().removeHide();
                    potato.application.addLoadingItem();

                    data.submit().success(function (json, textStatus, jqXHR) {                       
                       $(_this).parent().next().addHide();
                       if (json && !json.error_code) {
                           $(mod._els.LFilePreview).removeHide().find('img').attr('src', json.data.filepath);
                           $(mod._els.LFileName).val(json.data.filename)
                       }
                    }).error(function (jqXHR, textStatus, errorThrown) {
                        $(_this).parent().removeHide().next().addHide();
                        $(mod._els.fileError).removeHide();
                    });
                });
            }).on('fileuploadprogress', function(e, data) {
                var progress = parseInt(data.loaded / data.total * 100, 10);
                console.log(progress);
                $(this).parent().addHide().next().find('span').html(progress + '%')
            }).on('fileuploadprocessalways', function (e, data) {
                var _this = this;
                console.log('一直调用');
            });
        }
        // 删除图片
        CON.prototype.removeImg = function(target) {
            var $el = $(target);
            $el.parent().addHide();
            $(this._els.LFileName).val('');
            $(this._els.LUploadContent).find('.file-add').removeHide();
        }
        // 设置默认值
        CON.prototype.setCtx = function(obj, isAdmin) {
            this.info = obj;
            this.isAdmin = isAdmin;
            $(this._els.LProject).val(obj.contract + ' ' + obj.name);
            if (isAdmin) {
                var domStr = Mustache.render(this.tpl, obj); 
                $(this._els.LAddSales).html(domStr);
            } else {
                var salesStr = '销售员 ' + obj.salesman_name + ' ' + obj.salesman_id;
                $(this._els.LSales).html(salesStr);
            }            
        }        
        // 添加需求
        CON.prototype._ievent_submitForm = function(data, target) {
            var _this = this;
            var data = $(target).serializeJSON();
            data.projectId = this.info.id;
            data.name = this.info.name;

            api_ajax_post('project/edit_project_desc', data, {
                succ: function(res) {
                    _this.reset();
                    _this.parent.close();
                    _this.getDataRender();
                    project.tip('温馨提示','succ','需求提交成功', true);
                },
                fail: function(json) {
                    if(!$.isEmptyObject(json)) {                        
                        $(_this._els.LErrorTip).html(json.errmsg);
                    } else {
                        $(_this._els.LErrorTip).html('系统未知错误');
                    }
                    
                }
            });
            return false;
        }
        // 刷新列表数据
        CON.prototype.getDataRender = function () {
            if (this.isAdmin) {
                debugger
                project.getIModule('imodule://serviceProcess', null, function(mod) {
                    mod.byStatus();
                });
            } else {
                project.getIModule('imodule://demandList', null, function(mod) {
                    mod.getProInfo();
                    mod.getMyPro();
                });                
            }

        }
        // 重置数据
        CON.prototype.reset = function() {
            // 重置表单
            $('.js-reset-filed').val('');
            $('.js-upload-reset').addHide();
            $(this._els.LSales).html('');
            $('.file-add').removeHide();
            $(this._els.LErrorTip).html('');
        }
        return CON;
    })();
    return Module;
});

