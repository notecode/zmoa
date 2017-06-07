define(["/global/iscripts/libs/time/moment.js"], function(moment) {
    var Module = (function() {
        var baseIModules = project.baseIModules;
        var CON = function(dom) {
            baseIModules.BaseIModule.call(this, dom);
            this.tpl = this._els.tpl[0].text;
            this.projId = null;
        };
        var APPLY_ENVIRONMENT = {
            1: '户外',
            2: '室内',
            3: '半户外',
        };
        var SCREEN_COLOR = {
            1: '双色',
            2: '单色',
            3: '全彩',
        };        
        potato.createClass(CON, baseIModules.BaseIModule);

        CON.prototype.render = function(proj, dest, maxHeight, cb) {
            tlog('will render project: ' + proj.id);
            this.projId = proj.id;
            this.clearPrev();
            $(this.dom).show();

            if (proj.main_img) {
                proj.hasPic = '';
                proj.noPic = 'hide';
            } else {
                proj.hasPic = 'hide';
                proj.noPic = '';
            }

            this.addScheduleFn(proj);
            this.doRender(proj);

            $(dest).html($(this.dom));
            cb && cb();
        }

        CON.prototype.clearPrev = function() {
            this.find('#detailCon').empty();
            this.find('.comment-block').hide();
        }

        CON.prototype.doRender = function(proj) {
            proj.main_img = proj_img_url(proj.main_img)            
            var dom = Mustache.render(this.tpl, proj); 
            this.find('#detailCon').append(dom);
            this.find('.comment-block').show();
        }

        CON.prototype.addScheduleFn = function(proj) {
            var worker = proj.service_user || {};
            var done = (worker.end_date || worker.stroy == 5); // 5为远程服务
            proj.fn = {
                applyEnvironment: function() {
                    return APPLY_ENVIRONMENT[this.apply_environment];
                },
                screenColor: function() {
                    return SCREEN_COLOR[this.screen_color];
                },                
                hide_comment: function() {
                    return (this.comment.length > 0) ? '' : 'hide';
                },

                // 提供维修服务的人相关
                showService: function() {
                    var start = worker.start_date;
                    return (start && start.length > 0) ? '' : 'hide';
                },
                showNotDone: function() {
                    return (!done) ? '' : 'hide';
                },
                showDone: function() {
                    return done ? '' : 'hide';
                },
                showNotRemote: function() {
                    return (worker.story != 5) ? '' : 'hide'; 
                },
                showRemote: function() {
                    return (worker.story == 5) ? '' : 'hide';  
                },

                worker: function() {
                    var name = worker.name;
                    return (name ? name : '');
                },
                sch_start: function() {
                    var start = worker.start_date;
                    return start ? moment(start).format('M月DD日') : '';
                },
                sch_end: function() {
                    var end = worker.end_date;
                    return end ? moment(end).format('-M月DD日') : '';
                },

                showRepairParts: function() {
                    return (this.repair_parts && this.repair_parts.length > 0) ? '' : 'hide';
                },
                showExpSend: function() {
                    return (this.type == 1) ? '' : 'hide';
                },
                showEnterNum: function() {
                    return (this.status == -3 || this.status == -4) ? 'hide' : '';
                },
            }
        }

        //发表补充说明
        CON.prototype._ievent_recallSave = function() {
            var _this = this;
            var text = $(_this._els.reTextarea).val();
            var data = {
                projectId: this.projId,
                comment: filterCR(text)
            };

            if (text == ''){
                $(_this._els.tError).removeHide();
            } else {
                $(_this._els.tError).addHide();
                api_ajax_post('project/add_comment_to_project', data, {
                    succ: function(json) {
                        var cmt = _this.find('.comment-tpl > div').clone();
                        cmt.find('.comment-words').text(text);
                        _this.find('.comment-list').prepend(cmt);
                        $(_this._els.reTextarea).val('');
                    },
                    fail: function(json) {
                        alert(json.errmsg);
                    }
                }); 
            }
        }

        return CON;
    })();
    return Module;
});
