define(function() {
    var Module = (function() {
		var baseIModules = project.baseIModules;
        var CON = function(dom) {
            baseIModules.BaseIModule.call(this, dom);
            this.tpl = this._els.tpl[0].text;
        };
        potato.createClass(CON, baseIModules.BaseIModule);
		
		CON.prototype.render = function(proj) {
            var dom = Mustache.render(this.tpl, {
                proj: proj,
                fn: {
                    hide_comment: function() {
                        return (this.comment.length > 0) ? '' : 'hide';
                    }
                }
            });

            this.find('.parts').append(dom);
		}
		
		CON.prototype._ievent_newParts = function(data, target, hit) {
            tlog('newParts');
            var parts = $(this.tpl).find('.parts-tpl > div').clone();
            parts.addClass('newbie');
            this.find('.parts-list').append(parts);

            this.find('[idom=btnAdd]').addHide();
            this.find('[idom=btnPost]').removeHide();
        }

        CON.prototype._ievent_postParts = function(type, num, ui) {
            var _this = this;
            var jq = this.find('.newbie');
            var name = jq.find('[idom=name]').val();
            var spec = jq.find('[idom=spec]').val();
            var num =  jq.find('[idom=num]').val();

            if (name != '' && spec != '' && num > 0) {
                var data = {
                    projectId: qs_proj(),
                    parts: [
                        { name: name, spec: spec, backup_number: num },
                    ]
                };
                api_ajax_post('project/post_more_parts', data, {
                    succ: function(json) {
                        _this.find('.newbie').removeClass('newbie');
                        _this.find('[idom=btnPost]').addHide();
                        _this.find('[idom=btnAdd]').removeHide();
                    },
                    fail: function(json) {
                        alert(json.errmsg);
                    }
                })

            } else {
                if (name == '') {
                    alert('请输入配件名称');
                } else if (spec == '') {
                    alert('请输入配件规格');
                } else {
                    alert('配件数量不正确');
                }
            }
        }

        CON.prototype._ievent_submitComment = function() {
            var _this = this;
            var txt = this.find('#my-comment').val();
            if (txt.length > 0) {
                var data = {
                    projectId: qs_proj(),
                    comment: txt
                };

                api_ajax_post('project/add_comment_to_project', data, {
                    succ: function(json) {
                        var cmt = $(_this.tpl).find('.comment-tpl > p').clone();
                        cmt.find('.words').text(txt);
                        _this.find('.comment-list').prepend(cmt);
                        _this.find('#my-comment').val('');
                    },
                    fail: function(json) {
                        alert(json.errmsg);
                    }
                });
            } else {
                tlog('say a word');
            }
        }
        
        return CON;
    })();

    return Module;
})
