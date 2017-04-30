define(function() {
    var Module = (function() {
		var baseIModules = project.baseIModules;
        var CON = function(dom) {
            baseIModules.BaseIModule.call(this, dom);
            this.tpl = this._els.tpl[0].text;

            this.old_spares = [];
        };
        potato.createClass(CON, baseIModules.BaseIModule);
		
		CON.prototype.prepareData = function(proj) {
            var spares = proj.preparations;
            for (var i = 0; i < spares.length; i++) {
                this.old_spares.push(spares[i].preparation_type);
            } 
        }

		CON.prototype.render = function(proj) {
            this.prepareData(proj);

            var dom = Mustache.render(this.tpl, {
                proj: proj
            });

            this.find('.spares').append(dom);
            this.bindSpareEvents(this.find('.spare-list'));

            this.addBlankSpare();
		}
		
		CON.prototype._ievent_newSpare = function(data, target, hit) {
            tlog('newSpare');
            this.addBlankSpare(this.find('.spares'));
		}

        CON.prototype.addBlankSpare = function() {
            var spare = $(this.tpl).find('.spare-tpl > div').clone();
            this.bindSpareEvents(spare);
            this.find('.spare-list').append(spare);
        }

        CON.prototype.bindSpareEvents = function(jq) {
            var _this = this;
            var update = function(tgt, up) {
                var jq = $(tgt).siblings('.spare-count');
                var jqT = $(tgt).parent().siblings('.spare-type').val();
                var org = parseInt(jq.text());
                if (up) {
                    if ('' == jqT) {
                        alert('请先填写备料类型');
                    } else {
                        var n = org + 1;
                        jq.text(n);
                        _this.postSpare(jqT, n);
                    }
                } else {
                    if (org > 0) {
                        var n = org - 1;
                        jq.text(n);
                        _this.postSpare(jqT, n);
                    }
                }
            }

            $(jq).find('.up-count').click(function(e) {
                update(e.target, true);
            });
            $(jq).find('.down-count').click(function(e) {
                update(e.target, false);
            });
        }

        CON.prototype.postSpare = function(type, num) {
            var uri = '';
            var add = false;
            if (-1 == this.old_spares.indexOf(type)) {
                add = true;
                uri = 'project/mobile_add_preparation';
                tlog('new spare type: ' + type + ', num: ' + num);
            } else {
                uri = 'project/mobile_update_preparation_number';
                tlog('update spare num for: ' + type + ' to num: ' + num);
            }

            var data = {
                projectId: qs_proj(),
                preparationType: type,
                preparationTypeNumber: num
            };

            var _this = this;
            api_ajax_post(uri, data, {
                //always: function(json) {
                succ: function(json) {
                    if (add) {
                        _this.old_spares.push(type);
                    }
                }
            });
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
                    always: function(json) {
                    //succ: function(json) {
                        var cmt = $(_this.tpl).find('.comment-tpl > p').clone();
                        cmt.find('.words').text(txt);
                        _this.find('.comment-list').append(cmt);
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
