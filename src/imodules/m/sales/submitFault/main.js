define(['/global/iscripts/libs/blueimp/JQueryFileUpload/jquery.fileupload.js', 
        '/global/iscripts/libs/blueimp/JQueryFileUpload/jquery.fileupload-process.js',
        '/global/iscripts/libs/blueimp/JQueryFileUpload/jquery.fileupload-image.js'], function() {
    var Module = (function() {
		var baseIModules = project.baseIModules;
        var CON = function(dom) {
            baseIModules.BaseIModule.call(this, dom);

            var _this = this;
            //project.events.addListener('login.ensured', function(event) {
                _this.setDefault();
            //});

            this._init();
            this.isAdmin;
            this.name;

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
            var url = api.url + 'project/upload_image/project?time=' + $.now();
            $(this._els.LImageUpload).fileupload({
                url: url,
                dataType: 'json',
                autoUpload: false,
                acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i,
                maxFileSize: 5000000,
                previewMaxWidth: 320,
                previewMaxHeight: 214,
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
                       console.log(json)
                       if (json && !json.error_code) {
                           $(mod._els.LFilePreview).removeHide().find('img').attr('src', json.data.filepath);
                           $(mod._els.LFileName).val(json.data.filename)
                       }else{
                       }
                    }).error(function (jqXHR, textStatus, errorThrown) {
                        console.log(1111)
                        $('.file-add').removeHide();
                        $('.fileuploading').addHide();
                        $(mod._els.fileError).removeHide();
                    });
                });
            }).on('fileuploadprogress', function(e, data) {
                var progress = parseInt(data.loaded / data.total * 100, 10);
                console.log(progress);
                $(this).parent().addHide().next().find('span').html(progress + '%')
            }).on('fileuploadprocessalways', function (e, data) {
                var _this = this;
                //console.log('一直调用');
            });
        }

         // 删除图片
        CON.prototype.removeImg = function(target) {
            var $el = $(target);
            $el.parent().addHide();
            $(this._els.LFileName).val('');
            $(this._els.LUploadContent).find('.file-add').removeHide();
        }
        
        //设置默认值
        CON.prototype.setDefault = function(){
            var _this = this;
            var id = qs('project_id');
            api_ajax('project/detail/' + id, {
                succ: function(json) {
                    var data = json.project_info;
                    _this.isAdmin = json.user_role;
                    _this.name = data.name;
                    $(_this._els.infoContract).html(data.contract+'&nbsp;&nbsp;'+data.name);
                    $(_this._els.infoSales).html('销售&nbsp;&nbsp;' + data.salesman_name+'&nbsp;&nbsp;'+data.job_number);
                },
                fail: function(json) {
                    if(!$.isEmptyObject(json)) {  
                        project.tip(json.errmsg,'fail','', true);
                        setTimeout(function(){
                            location.href="/sales/index.html";
                        },3000)
                    } else {
                        project.tip('系统错误','fail','', true);
                        setTimeout(function(){
                            location.href="/sales/index.html";
                        },3000)
                    }
                }
            });
        }

        // 提交数据
        CON.prototype._ievent_submitForm = function(data, target) {
            var _this = this;
            var data = $(target).serializeJSON();
            data.description = filterCR(data.description);

            var $tipEl = $(_this._els.LErrorTip);
            data.projectId = qs('project_id');
            data.name = this.name;
            var $checks = $('.js-checki-field');
            for (var index = 0; index < $checks.length; index++) {
                var $el = $checks.eq(index);
                var $tip = $el.data().tip;
                var $val = $el.val();
                if (!$val) {
                    $tipEl.html($tip);
                    $tipEl.addClass('slideUp');
                    setTimeout(function(){
                        $tipEl.removeClass('slideUp');
                    },4000)
                    return false
                }
            }
            api_ajax_post('project/edit_project_desc', data, {
                succ: function(res) {
                    //_this.getDataRender();
                    project.tip('需求提交成功','succ','', true);
                    setTimeout(function(){
                        location.href = '/sales/index.html';
                    },800)
                },
                fail: function(json) {
                    if(!$.isEmptyObject(json)) {                        
                        $(_this._els.LErrorTip).html(json.errmsg);
                        $(_this._els.LErrorTip).addClass('slideUp');
                        setTimeout(function(){
                            $(_this._els.LErrorTip).removeClass('slideUp');
                        },4000)
                    } else {
                        $(_this._els.LErrorTip).html('系统未知错误');
                        $(_this._els.LErrorTip).addClass('slideUp');
                        setTimeout(function(){
                            $(_this._els.LErrorTip).removeClass('slideUp');
                        },4000)
                    }
                    
                }
            });
            return false;
        }
            
        return CON;
    })();

    return Module;
})
