import * as tomato from "@po-to/tomato";
import * as tdom from "@po-to/tomato-jquery";
import * as page from "static/www/page";
import * as funs from "static/www/funs";

class VPresenter extends page.VPresenter {
    constructor(view: tomato.VPView, parent?: tomato.VPresenter, vpid?: string) {
        super(view, parent, vpid);
        //this._watchEvent();
        //this._els = this._getElements();
        let aaa = funs.moduleToUrl('www/header');
        console.log(aaa);
    }
}
export = VPresenter;