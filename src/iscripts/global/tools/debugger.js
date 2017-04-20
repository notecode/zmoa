// AUTHOR:   SongErwei
// ROLE:    	
// CREATED:  2017-01-12 13:57:31
 
// loglevel如下，递增
// DEBUG   调试    
// INFO    数据，用于模块接口
// WARN    警告
// ERROR   错误

// NONE    什么也不输出

// 重要：IE8下，typeof console[m] 为 'object'，此为IE8的bug。故，IE8下debug另行实现
// https://connect.microsoft.com/IE/feedback/details/585896/console-log-typeof-is-object-instead-of-function
        
function Debugger(gLevel) {
    this.debug = {}

    var isIE8 = (typeof console.log === 'object');

    if (!isIE8) {
        for (var m in console) {
            var bFunc = false;
            if (typeof console[m] == 'function') {
                switch (m) {
                    case 'debug':
                    case 'log':
                        bFunc = (gLevel === 'DEBUG');
                        break;
                    case 'info':
                        bFunc = (gLevel === 'DEBUG' || gLevel === 'INFO');
                        break;
                    case 'warn':
                        bFunc = (gLevel === 'DEBUG' || gLevel === 'INFO' || gLevel === 'WARN');
                        break;
                    case 'error':
                        bFunc = (gLevel === 'DEBUG' || gLevel === 'INFO' || gLevel === 'WARN' || gLevel === 'ERROR');
                        break;
                    default:
                        break;
                }
            }

            this.debug[m] = bFunc ? console[m].bind(window.console) : function(){}
        }
    } else {
        // IE下策略简单一些：要么有，要么没有。统一用console.log();
        var doLog = (gLevel === 'DEBUG');
        var fake = function(x) { if (doLog) console.log(x); };
        this.debug = {
            debug: fake,
            log: fake,
            info: fake,
            warn: fake,
            error: fake
        };
    }

    return this.debug;
}

//
// 使用: 
//      logLevel设为NONE，什么也不输出       --适用于生产环境
//      logLevel设为DEBUG，各级别log都输出   --适用于开发环境
//      logLevel设为INFO/WARN/ERROR级别，输出自己及更严重级别的log。如：设为INFO，则输出INFO、DEBUG、ERROR三级
//
//      生产环境，为了重现某个问题，只能在console中先执行debug = Debugger('DEBUG'); 这句，后续js执行将输出log

logLevel = 'DEBUG';
//logLevel = 'INFO';
//logLevel = 'WARN';
//logLevel = 'ERROR';
//logLevel = 'NONE';

debug = Debugger(logLevel);
