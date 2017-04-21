import * as tomato from "@po-to/tomato";
import * as tdom from "@po-to/tomato-jquery";
import * as ptcache from '@po-to/pt-cache';

ptcache.setConfig({
    taskCounter: tomato.taskCounter,
    request: function (requestOptions, success, fail) {
        let data = Object.assign({
            xhrFields: {
                withCredentials: true
            },
            success: function (data, textStatus, jqXHR) {
                if (data.status == 200) {
                    let body = data;
                    let cacheSet = jqXHR.getResponseHeader('X-Cache');
                    let cache;
                    if (cacheSet) {
                        cacheSet = cacheSet.split(",");
                        cache = { type: cacheSet[0], expired: cacheSet[1], version: cacheSet[2], encryption: cacheSet[3] };
                    }
                    success({ dataType: "json", data: body, cache: cache, notModified: jqXHR.status == 304 });
                } else {
                    fail(new tomato.PError(data.status, data.info));
                }
            },
            error: function (data) {
                fail(new tomato.PError('500',data.toString()));
            }
        }, requestOptions, { headers: { "X-Cache-Version": requestOptions.version } })
        $.ajax(data);
    }
});

tomato.setConfig({
    application: new tomato.Application(
        null,
        {
            view:$("#application"),
            dialog:$("#application_dialog"),
            mask:$("#application_mask"),
            body:$("#application_dialog")
        }
    ),
});

export class VPresenter extends tdom.VPresenter {
    protected _$dom: JQuery;

    constructor(view: tomato.VPView, parent?: tomato.VPresenter, vpid?: string) {
        super(view, parent, vpid);
    }
    _evt_goback(n?:number){
        history.go(-1);
    }
    // _evt_load(url:string){
    //     tomato.getVPresenter<tomato.VPresenter>(funs.moduleToUrl(url), (mod:tomato.VPresenter) => {
    //         funs.loadPage(mod);
    //     });
    // }
    _evt_close(){
       this.getDialog().close();
    }
}