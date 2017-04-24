define(function() {
    var Module = (function() {
		var baseIModules = project.baseIModules;
        var CON = function(dom) {
            baseIModules.BaseIModule.call(this, dom);

            this.fooGet();
            this.fooPost();
        };
        potato.createClass(CON, baseIModules.BaseIModule);
		
		CON.prototype.fooGet = function() {
            // to 悦姐：
            //  0. 总共有三个方法：
            //    api_ajax();
            //    api_ajax_with_query();
            //    api_ajax_post();
            //    根据需要选用，见下面使用例子
            //
            //  1.  不必要再像原来那样再封装成一个a_demand_req_info()方法了，
            //      直接在你的main.js中使用 api_ajax / api_ajax_with_query / api_ajax_post 之一就行了。
            //      那样再封装一层意义不是很大
            //
            //  2.  现在一些接口需要先登录，现在登录页面还没弄。可以本页中写死了一个登录，你在浏览器访问一下
            //      http://www2.xxtao.com:8000/test/api.html，就登录了。
            //

            // 最简单的get请求
            api_ajax('project/statistic', {
                succ: function(json) {
                    tlog(json);
                },
                fail: function(json) {
                }
            });

            // 若需要带上query，则：
            var q = {'foo': 'xx'};
            api_ajax_with_query('region/get_region', q, {
                succ: function(json) {
                },
                fail: function(json) {
                }
            });
		}

        CON.prototype.fooPost = function() {
            /* 
             * todo: 发布之前得删掉，要不就坏事了
             * test1 密码123456,  角色系统管理员 
             * test2 密码123456,  角色销售人员
             * test3 密码123456,  角色服务人员
             */
            var data = {
                userName: 'test1',
                password: '123456'
            };
            api_ajax_post('user/login', data, {
                succ: function(json) {
                },
                fail: function(json) {
                }
            }); 
        }
		
		CON.prototype._ievent_ = function(data, target, hit) {
		}
        
        return CON;
    })();

    return Module;
})
