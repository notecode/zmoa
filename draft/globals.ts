function appendCss(css:string){
    
}
declare let requirejs : {
    (desps:string[]):void;
    config : (options:any)=>void
}

function globalsConfig(initData:any){
    requirejs.config({
        paths:{
            "static/www" : "www",
        },
        waitSeconds : 60
    });
    requirejs.config({
        baseUrl : "`$$STATICURL`",
        paths: `$$LIBS`
    });

    
    let mainjs = document.body.getAttribute("data-vpcon") as string;
    requirejs([mainjs]);
    
}