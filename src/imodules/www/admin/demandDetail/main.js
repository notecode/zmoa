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
                sched: function() {
                    var start = worker.start_date;
                    return (start && start.length > 0) ? 'show' : 'hide';
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
                    return end ? moment(end).format('M月DD日') : '';
                }
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

        CON.prototype._ievent_showStatus = function() {
            this.find('#controlProcessMD').toggle();
            if(this.find('#controlProcessMD').is(':hidden')){
                $('#iunfold').removeClass('unfoldown');
            }else {
                $('#iunfold').addClass('unfoldown');    
            }

            // todo: 点击其他区域，消失
        }

        return CON;
    })();
    return Module;
});
