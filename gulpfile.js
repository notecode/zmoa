var gulp = require('gulp');
var connect = require('gulp-connect');
var plugins = require('gulp-load-plugins')({DEBUG: false, config: __dirname + '/package.json'});
// 当--ver=1.0时，会被解释为1。故，用string()
var argv = require('yargs').default('site', 'www').string(['ver']).argv; 
var clean = require('gulp-clean');
var runSequence = require('run-sequence');

var site = (argv.site == 'm' || argv.device == 'mobi') ? 'm' : 'www';
var unsite = (site == 'www') ? 'm' : 'www';

//var host = (site == "www" ? "txoa2.wanpinghui.com" : "txoam2.wanpinghui.com");
var host = (site == "www" ? "www2.xxtao.com" : "m2.xxtao.com");
var port = (site == "www" ? '8000' : '8080');
if (argv.dev == 1) {
    host = (site == "www" ? "devoa.wanpinghui.com" : "devoam.wanpinghui.com");
    port = (site == "www" ? '7000' : '7080');
}

var use_cdn = argv.use_cdn || 0;
var cdn = argv.cdn || ('http://cdn2.xxtao.com:' + port + '/');
var ver = argv.ver || '';
var dist = './dist/' + (ver ? ver + '/' : '');
var distSite = dist + site;

// stub: DIY版桩数据
var stub = argv.stub || 0;
// mock: mock-server版桩数据
var mock = argv.mock || 0;
var min = argv.min || 0;

console.log('===site===     : ' + site);
console.log('===distSite=== : ' + distSite);

var cfg = {
    gulp: gulp,
    plugins: plugins,
    src: './src',
    dist: dist,
    distSite : distSite,
    site: site,
    unsite: unsite,
    includePath:'./src/imodules',
    iscriptsPath:'./src/iscripts',
    rev: 'jpg|png|gif|jpeg|css|js|tpl|svg',
	cdn: cdn,
	local_server: {host: host, port: port},
    ver: ver
};

var getTask = function(task) {
    return require('./tasks.gulp/' + task)(cfg);
};

gulp.task('local_server', function () {
    connect.server({
        host: cfg.local_server.host, 
        port: cfg.local_server.port, 
        root: [cfg.distSite,cfg.dist],
        livereload: false
    });
});

gulp.task('clean',function () {
    return gulp.src([cfg.distSite, 
		cfg.src + '/imodules/global/**/*.min', 
		cfg.src + '/imodules/' + cfg.site + '/**/*.min',
		cfg.src + '/iwidgets/' + cfg.site + '/**/*.min'])
		.pipe(clean());
});
gulp.task('reload',function () {
    return gulp.src(cfg.distSite+"/index.html")
        .pipe(connect.reload());
});
gulp.task('null',function() {});

//********************************************
// 1. 核心构建任务

// gulp.task('sprity', getTask('sprity'));
// gulp.task('sprites', getTask('spritesmith'));
// gulp.task('test', function(callback){runSequence('sprites', 'imodulesSass')});
gulp.task('test-default-param', getTask('test-default-param'));

gulp.task('sass', getTask('sass'));
gulp.task('assets', getTask('assets'));
gulp.task('font', getTask('font'));
gulp.task('sassImage', getTask('sass_image'));
gulp.task('images', getTask('images'));
gulp.task('iscripts', getTask('iscripts'));
gulp.task('iroot', getTask('iroot'));
gulp.task('imodulesImage', getTask('imodules_image'));
gulp.task('imodulesTpl', getTask('imodules_tpl'));
gulp.task('imodulesSass', getTask('imodules_sass'));
gulp.task('imodulesJS', getTask('imodules_js'));
gulp.task('imodulesModule', getTask('imodules_module'));
gulp.task('imodulesPage', getTask('imodules_page'));

gulp.task('iwidgetsImage', getTask('iwidgets_image'));
gulp.task('iwidgetsTpl', getTask('iwidgets_tpl'));
gulp.task('iwidgetsSass', getTask('iwidgets_sass'));
gulp.task('iwidgetsJS', getTask('iwidgets_js'));
gulp.task('replaceVerison', getTask('verReplace'));//替换所有"/xxxxx.html"为"/v0.8/xxxx.html"
gulp.task('build', function(callback){runSequence('clean',['assets','sass','font','sassImage', 'images', 'iscripts','iroot','imodulesImage','iwidgetsImage','imodulesTpl','iwidgetsTpl','imodulesSass','iwidgetsSass'],['imodulesJS','iwidgetsJS','imodulesModule','imodulesPage'],callback)});

// stub是我们自己DIY的假数据机制，mock是比较流行的第三方实现的。暂先保留stub，喜新不厌旧
gulp.task('api_stub', getTask('api_stub.js'));
gulp.task('cat_api_stub', ['api_stub'], getTask('cat_api_stub.js'));
function task_stub() { return stub?'cat_api_stub':'null'; }

gulp.task('mock_expes', getTask('mock_expes'));
function task_mock() { return mock?'mock_expes':'null'; }

//********************************************
// 2. 将global分发到站点下

gulp.task('globalCopy',function () {
    return gulp.src([cfg.dist + '/global/**/*.*','!'+cfg.dist + '/global/**/imodules/**/*','!'+cfg.dist + '/global/**/iwidgets/**/*','!'+cfg.dist + '/global/**/*.html']).pipe(gulp.dest(cfg.dist + '/' + site + '/global'));
});
gulp.task('globalMerge',function () {
    return gulp.src([cfg.dist + '/global/**/imodules/**/*.*',cfg.dist + '/global/**/iwidgets/**/*.*', cfg.dist + '/global/**/*.html']).pipe(gulp.dest(cfg.dist + '/' + site));
});
gulp.task('globalClean', function () {
    return gulp.src(cfg.dist+'/global').pipe(clean());
});

gulp.task('global', function(callback){runSequence(['globalCopy','globalMerge'],'globalClean','replaceVerison',callback)});

//********************************************
// 3. 加版本号，为cdn做准备 

// rev: 将原始文件名加上md5
// revReplace: 将应用这些文件的地方替换文件名
gulp.task('rev', getTask('rev'));
gulp.task('preRevReplace',  getTask('preRevReplace'));
gulp.task('doRevReplace',   getTask('revReplace'));
gulp.task('postRevReplace', getTask('postRevReplace'));
gulp.task('revReplace', function(callback) {runSequence('rev','preRevReplace','doRevReplace','postRevReplace',callback)});

//********************************************
// 3.1 压缩
gulp.task('min_js', getTask('min_js'));
gulp.task('min_css', getTask('min_css'));

// 入库前压缩图片（每次发布都压缩，太费时），故这个任务不连入主流程了，需要时执行一下
gulp.task('min_img', getTask('min_img'));

//********************************************
// 4. 本地调试相关

gulp.task('images_update', function(callback){runSequence('images','global','reload',callback)});
gulp.task('iscripts_update', function(callback){runSequence('iscripts',task_stub(),'global','reload',callback)});;
gulp.task('sass_update', function(callback){runSequence('sass','global','reload',callback)});
gulp.task('sassImage_update', function(callback){runSequence('sassImage','global','reload',callback)});
gulp.task('imodulesJS_update', function(callback){runSequence('imodulesJS','global','reload',callback)});
gulp.task('imodulesHtml_update', function(callback){runSequence(['imodulesModule','imodulesPage'],'global','reload',callback)});
gulp.task('mtpl_update',function(callback){runSequence('imodulesTpl',['imodulesModule','imodulesPage'],'global','reload',callback)});
gulp.task('msass_update',function(callback){runSequence('imodulesSass',['imodulesJS','imodulesModule','imodulesPage'],'global','reload',callback)});

gulp.task('iwidgetsJS_update', function(callback){runSequence('iwidgetsJS','global','reload',callback)});
gulp.task('iwidgetsHtml_update', function(callback){runSequence(['imodulesModule','imodulesPage'],'global','reload',callback)});
gulp.task('wtpl_update',function(callback){runSequence('iwidgetsTpl',['imodulesModule','imodulesPage'],'global','reload',callback)});
gulp.task('wsass_update',function(callback){runSequence('iwidgetsSass',['iwidgetsJS','imodulesModule','imodulesPage'],'global','reload',callback)});

gulp.task('watch', function() {
    gulp.watch([cfg.src + '/images/**/*'], ['images_update']);
    gulp.watch([cfg.src + '/iscripts/**/*'], ['iscripts_update']);
    gulp.watch([cfg.src + '/sass/**/*.*', '!'+cfg.src + '/sass/**/*.scss'], ['sassImage_update']);
    gulp.watch([cfg.src + '/sass/**/*.scss'], ['sass_update']);
    gulp.watch([cfg.src + '/imodules/**/*.js'], ['imodulesJS_update']);
    gulp.watch([cfg.src + '/imodules/**/*.html','!'+cfg.src + '/imodules/**/*.mus.html'], ['imodulesHtml_update']);
    gulp.watch([cfg.src + '/imodules/**/*.mus.html'], ['mtpl_update']);
    gulp.watch([cfg.src + '/imodules/**/*.scss'], ['msass_update']);

    gulp.watch([cfg.src + '/iwidgets/**/*.js'], ['iwidgetsJS_update']);
    gulp.watch([cfg.src + '/iwidgets/**/*.html','!'+cfg.src + '/iwidgets/**/*.mus.html'], ['iwidgetsHtml_update']);
    gulp.watch([cfg.src + '/iwidgets/**/*.mus.html'], ['wtpl_update']);
    gulp.watch([cfg.src + '/iwidgets/**/*.scss'], ['wsass_update']);

	if (mock) {
		gulp.watch(['./my-mock-responses.js', './expes.mock/**/*'], ['mock_expes']);
	}
});

gulp.task('default',function(callback){runSequence('build',task_stub(),'global',use_cdn?'revReplace':'null',(min?['min_js','min_css']:'null'),'local_server',task_mock(),'watch',callback)});
//gulp.task('release', function(callback){runSequence('build','global',use_cdn?'revReplace':'null',['min_js','min_css'],callback)});
gulp.task('release', function(callback){runSequence('build','global',use_cdn?'revReplace':'null',callback)});

// 为专题（仅着陆页，部署到百度idc，域名zt.wanpinghui.com），多做一步
gulp.task('zhuanti', ['release'], function() {
    return gulp.src([cfg.distSite + '/track/*']).pipe(gulp.dest(cfg.distSite + '/landing/track/'));
});

gulp.task('dist', function() {
	return gulp.src('dist/www/**/*').pipe(gulp.dest('../notecode/'));
});
gulp.task('distm', function() {
	return gulp.src('dist/m/**/*').pipe(gulp.dest('../martinly/'));
});
gulp.task('dist2', ['dist', 'distm']);
