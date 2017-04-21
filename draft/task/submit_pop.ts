import * as tomato from "@po-to/tomato";
import * as tdom from "@po-to/tomato-jquery";
import * as page from "static/www/page";
import * as funs from "static/www/funs";

class VPresenter extends page.VPresenter {
    constructor(view: tomato.VPView, parent?: tomato.VPresenter, vpid?: string) {
        super(view, parent, vpid);
        this._watchEvent();
        this._els = this._getElements();
        let that=this;
        //获得图片地址
        // project.getIModule('imodule://ImageUploader', null, function (mod) {
        //     mod.initCallback({
        //         on_select: function () {
        //             //submit.text('图片上传中，请稍候...');
        //             $('.fileuploading').removeClass("hide");

        //             //下面这两行是解决删除按钮在上传中和上传后位置不对
        //             $('.remove').css('left', '103px');
        //             $('.remove').css('right', '');
        //         },
        //         succ: function (json) {
        //             console.log('uploaded image: ' + json.image);
        //             $('.file-error').addClass("hide");
        //             that.imgUrl = json.image;
        //             $('.fileuploading').addClass("hide");
        //             project.data.demand.demand.img = json.image;
        //             potato.application.dispatch(new potato.Event('demand-updated', { demand: project.data.demand }));

        //             //下面这两行是解决删除按钮在上传中和上传后位置不对
        //             $('.remove').css('right', '');
        //             $('.remove').css('left', '');
        //         },
        //         fail: function (json) {
        //             $('.file-error').removeClass("hide").find('span').html(json.msg);
        //             debug.error('图片上传失败');
        //             $('.fileuploading').addClass("hide");

        //             //下面这两行是解决删除按钮在上传中和上传后位置不对
        //             $('.remove').css('right', '');
        //             $('.remove').css('left', '');
        //         },
        //         // 删除图片时的回调
        //         on_delete: function (url) {
        //             $('.file-error').addClass("hide");
        //             console.log('you deleted image: ' + url);
        //             that.imgUrl = '';
        //         }
        //     });
        // })

    }
    //提交是调用此方法删除canvas的缓存地址
    private _evt_onDone() {
        console.log("on done");
        // project.getIModule('imodule://ImageUploader', null, function (mod) {
        //     mod.onDone();
        // });
    }
}
export = VPresenter;