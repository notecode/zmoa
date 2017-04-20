/**
 * SDK连接 功能相关
 */
var webimConfigs = (function () {
    /*
    * !!!!!  -- 切换im账户 注意事项:
    *       1, 更换 appkey;
    *       2, 更换游客token
    *
    * */
    var _this = this;
    var isSwitch = false;
    var data = {};
    var appKey = is_wph() ? '211cf33f06ece9b9934e91612362e2b8' : '23604735bd9420bbe97a73ddd524cf73';

    function login(user, cb) {
        var token = user.nim_user_token;
        var account = user.user_id;
        if (user.guesttoken) {
            token = user.guesttoken;
            account = user.guestid;
        }
        window.nim = this.nim = new NIM({
            debug: false,
            db: false,
            appKey: appKey,
            account: account,
            token: token,
            currSess: '',
            onconnect: function onConnect() {
                // potato.application.dispatch(new potato.Event('IMLogined'));
                console.log('网易IM连接成功');
                cb && cb.succ();
            },
            onwillreconnect: onWillReconnect,
            ondisconnect: onDisconnect,
            onerror: onError,
            // 群组
            onteams: onTeams,
            onsynccreateteam: onCreateTeam,
            onteammembers: onTeamMembers,
            onsyncteammembersdone: onSyncTeamMembersDone,
            // 会话
            onsessions: onSessions,
            onupdatesession: onUpdateSession,
            setCurrSession: setCurrSession,
            // 消息
            onroamingmsgs: onRoamingMsgs,
            onofflinemsgs: onOfflineMsgs,
            onmsg: onMsg,
            // 系统通知
            onsysmsg: onSysMsg,
            onupdatesysmsg: onUpdateSysMsg,
            onsysmsgunread: onSysMsgUnread,
            onupdatesysmsgunread: onUpdateSysMsgUnread,
            // 同步完成
            onsyncdone: onSyncDone,
        });
        nimMsgPool.init();
    }

    function logout() {
        window.nim.disconnect();
    }
    var nimMsgPool = (function () {
        var _autoID = 0;
        var _historyLoading = {};
        var _msgDataStr = '{ "version": '+_autoID+' }', _updateList = [];
        var _inited = false;
        function setMsgData(data) {
            _autoID++;
            data.version = _autoID;
            _msgDataStr = JSON.stringify(data);
        }
        function getMsgData() {
            return JSON.parse(_msgDataStr);
        }
        function setInfo(type, sid, info) {
            var msgData = getMsgData();
            function check(_sid, _info) {
                if(_sid == undefined){
                    throw "sid is not string!";
                }
                if (!msgData[_sid]) {
                    msgData[_sid] = { history: null, news: [], unread: 0, pullMsg: null, "largeGroup":0, lastMsg:'' };
                }
                msgData[_sid][type] = _info;
            }
            if (info!==undefined) {
                check(sid, info);
                setMsgData(msgData);
            } else {
                var map = sid;
                for (sid in map) {
                    check(sid, map[sid][type]);
                }
                setMsgData(msgData);
            }
        }
        function setMsgs(type, sid, arr) {
            var msgData = getMsgData();
            function check(_sid, _arr) {
                if(_sid == undefined){
                    throw "sid is not string!";
                }
                if (!msgData[_sid]) {
                    msgData[_sid] = { history: null, news: [], unread: 0, pullMsg: null, "largeGroup":0, lastMsg:'' };
                }
                if (!msgData[_sid][type] || !msgData[_sid][type].length) {
                    msgData[_sid][type] = _arr;
                } else {
                    var list = msgData[_sid][type];
                    var map = {};
                    for (var i = 0, k = list.length; i < k; i++) {
                        var item = list[i];
                        map[item.idClient] = item;
                    }
                    for (var i = 0, k = _arr.length; i < k; i++) {
                        var item = _arr[i];
                        if (!map[item.idClient]) {
                            list.push(item)
                        }
                    }
                }
            }
            if (arr !== undefined) {
                check(sid, arr);
                setMsgData(msgData);
            } else {
                var map = sid;
                for (sid in map) {
                    check(sid, map[sid][type]);
                }
                setMsgData(msgData);
            }
        }
        setInterval(function () {
            if (!_inited) { return false; }
            var msgData = getMsgData();
            for (var i = 0, k = _updateList.length; i < k; i++) {
                var mod = _updateList[i];
                var session = mod.session;
                if (session) {
                    if (session == "all") {
                        if (mod.messages.version != msgData.version) {
                            mod.messages = msgData;
                            mod.update(msgData);
                        }
                    } else {
                        var msgList = msgData[session];
                        if (!msgList) {
                            msgList = msgData[session] = { "history": null, "news": [], "unread": 0, "pullMsg": null, "largeGroup":0, lastMsg:'' };
                        }
                        if(msgList.pullMsg === null){
                            console.log('null');
                            msgData[session].pullMsg = webimConfigs.hasNotJoinedGroup(session);
                            webimConfigs.setPullMsg(session,msgData[session].pullMsg);
                        }
                        if (!msgList.history || msgList.pullMsg) {
                            getLastHistroyMsg(session);
                        }
                        // if(!msgList.groupInfo){
                        //     getGroupInfo(session);
                        // }
                        var nnum = msgList.news.length;
                        var onum = mod.messages.news.length;
                        if (nnum > onum) {
                            mod.messages.news = msgList.news.map(function (item) {
                                return item;
                            });
                            mod.update(msgList.news.slice(onum));
                        }
                        if (msgList.history) {
                            var nnum = msgList.history.length;
                            var onum = mod.messages.history.length;
                            if (nnum > onum) {
                                mod.messages.history = msgList.history.map(function (item) {
                                    return item;
                                });
                                mod.history(msgList.history.slice(onum));
                            }
                        }
                    }
                }
            }
        }, 1000);
        //获取上一屏历史消息并缓存
        function getLastHistroyMsg(session) {
            if (_historyLoading[session]) {
                return;
            }
            _historyLoading[session] = true;
            webimConfigs.loadHistroy(session, function (msgList) {
                    setHistory(msgList);
                },
                function () {
                    setHistory([]);
                })
            function setHistory(msgs) {
                exports.setHistory(session, msgs);
                setTimeout(function () {
                    _historyLoading[session] = false;
                }, 3000)//防止过快刷新
            }
        }
        var exports = {
            setUnread: function (sid, n) {
                setInfo("unread", sid, n);
            },
            setHistory: function (sid, history) {
                setMsgs("history", sid, history);
            },
            setNews: function (sid, news) {
                setMsgs("news", sid, news);
            },
            setPullMsg: function (sid, pull) {
                setInfo("pullMsg", sid, pull);
            },
            setLargeGroup: function (sid, bool) {
                setInfo("largeGroup", sid, bool);
            },
            setLastMsg : function(sid, msg) {
                setInfo("lastMsg", sid, msg);
            },
            addListener: function (mod) {
                _updateList.push(mod);
            },
            clearListeners: function () {
                _updateList = [];
            },
            init: function () {
                _inited = true;
            },
            getMsgData : getMsgData
        }
        return exports;
    })();
    function onWillReconnect(obj) {
        // 此时说明 `SDK` 已经断开连接, 请开发者在界面上提示用户连接已断开, 而且正在重新建立连接
        console.log('即将重连');
        // console.log(obj.retryCount);
        // console.log(obj.duration);
    }

    function onDisconnect(error) {
        // 此时说明 `SDK` 处于断开状态, 开发者此时应该根据错误码提示相应的错误信息, 并且跳转到登录页面
        console.log('丢失连接');
        console.log(error);
        if (error) {
            switch (error.code) {
                // 账号或者密码错误, 请跳转到登录页面并提示错误
                case 302:
                    break;
                // 被踢, 请提示错误后跳转到登录页面
                case 'kicked':
                    break;
                default:
                    break;
            }
        }
    }

    function onError(error) {
        console.log(error);
    }

    function onTeams(teams) {
        // console.log('群列表', teams);
        data.teams = nim.mergeTeams(data.teams, teams);
    }

    function onCreateTeam(team) {
        console.log('你创建了一个群', team);
        data.teams = nim.mergeTeams(data.teams, team);
        // refreshTeamsUI();
        onTeamMembers({
            teamId: team.teamId,
            members: owner
        });
    }

    function onTeamMembers(obj) {
        var teamId = obj.teamId;
        var members = obj.members;
        // console.log('群id', teamId, '群成员', members);
        data.teamMembers = data.teamMembers || {};
        data.teamMembers[teamId] = nim.mergeTeamMembers(data.teamMembers[teamId], members);
        // data.teamMembers[teamId] = nim.cutTeamMembers(data.teamMembers[teamId], members.invalid);
        // refreshTeamMembersUI();
    }

    function onSyncTeamMembersDone() {
        console.log('IMSyncSuccess');
        if(potato.application.dispatch){
            potato.application.dispatch(new potato.Event('IMSyncSuccess'));
        }
    }

    function onSessions(sessions) {
        // console.log('收到会话列表', sessions);
        data.sessions = nim.mergeSessions(data.sessions, sessions);

        //获取所有会话的未读消息
        var msgData = {};
        for (var i = 0; i < sessions.length; i++) {
            var group = sessions[i];
            var session = group.to;
            if(!msgData[session]){
                msgData[session] = {};
            }
            msgData[session].unread = group.unread;
            msgData[session].pullMsg = 0;
            if(group.lastMsg.type == 'image'){
                group.lastMsg.text = '[图片]'
            }
            msgData[session].lastMsg = group.lastMsg;
        }
        nimMsgPool.setUnread(msgData);
        nimMsgPool.setPullMsg(msgData);
        nimMsgPool.setLastMsg(msgData);
    }

    function onUpdateSession(session) {
        /*
        * isSwitch这个变量用于判断是否是 网易切换会话导致的此方法的调用;
        * 因为此方法始终会返回一个lastmsg字段,在切换会话时并非是新消息,所以不应该加入新消息;
        * */
        if(isSwitch){
            isSwitch = false;
            return
        }
        console.log('会话更新了', session);
        data.sessions = nim.mergeSessions(data.sessions, session);

        session.lastMsg = parseMsg(session.lastMsg);
        nimMsgPool.setNews(session.to,[session.lastMsg]);

        if(session.lastMsg.text.indexOf('chat-img') > 0){
            group.lastMsg.text = '[图片]'
        }
        nimMsgPool.setLastMsg(session.to,session.lastMsg);
        if(session.to == nim.currSess){
            nimMsgPool.setUnread(session.to, 0);
        }else{
            nimMsgPool.setUnread(session.to, session.unread);
        }
        nimMsgPool.setPullMsg(session.to, 0);
        if(session.lastMsg.type = 'text'){
            potato.application.dispatch(new potato.Event('newMsg',{msg:session.lastMsg}));
        }
    }

    function onRoamingMsgs(obj) {
        // console.log('漫游消息', obj);
        pushMsg(obj.msgs);
    }

    function onOfflineMsgs(obj) {
        // console.log('离线消息', obj);
        pushMsg(obj.msgs);
    }

    function onMsg(msg) {
        console.log('收到消息', msg.scene, msg.type, msg);
    }
    function sendImage() {
        $('.sendImgPending').removeClass('hide');
        nim.sendFile({
            scene: 'team',
            to: nim.currSess,
            type: 'image',
            fileInput: 'imgFile',
            beginupload: function(upload) {
                // - 如果开发者传入 fileInput, 在此回调之前不能修改 fileInput
                // - 在此回调之后可以取消图片上传, 此回调会接收一个参数 `upload`, 调用 `upload.abort();` 来取消文件上传
            },
            uploadprogress: function(obj) {
                console.log('文件总大小: ' + obj.total + 'bytes');
                console.log('已经上传的大小: ' + obj.loaded + 'bytes');
                console.log('上传进度: ' + obj.percentage);
                console.log('上传进度文本: ' + obj.percentageText);
            },
            uploaddone: function(error, file) {
                console.log(error);
                console.log(file);
                console.log('上传' + (!error?'成功':'失败'));
                if(!error){
                    $('.sendImgPending').addClass('hide');
                }
            },
            beforesend: function(msg) {
                console.log('正在发送image消息, id=' + msg.idClient);
            },
            done: function () {
                console.log('发送完成')
            }
        });
    }
    function parseMsg(msg) {
        //如果是图片消息,改造一下
        if (msg.type == 'image') {
            msg.type = 'text';
            msg.text = "<img class='chat-img' src='" + msg.file.url + "' ievent='scanBig' />"
        }
        return msg
    }

    function pushMsg(msgs) {
        if (!Array.isArray(msgs)) {
            msgs = [msgs];
        }
        var sessionId = msgs[0].sessionId;
        data.msgs = data.msgs || {};
        data.msgs[sessionId] = nim.mergeMsgs(data.msgs[sessionId], msgs);
    }

    function onSysMsg(sysMsg) {
        console.log('收到系统通知', sysMsg);
        pushSysMsgs(sysMsg);
    }

    function onUpdateSysMsg(sysMsg) {
        pushSysMsgs(sysMsg);
    }

    function pushSysMsgs(sysMsgs) {
        data.sysMsgs = nim.mergeSysMsgs(data.sysMsgs, sysMsgs);
    }

    function onSysMsgUnread(obj) {
        // console.log('收到系统通知未读数', obj);
        data.sysMsgUnread = obj;
    }

    function onUpdateSysMsgUnread(obj) {
        // console.log('系统通知未读数更新了', obj);
        data.sysMsgUnread = obj;
    }

    function onSyncDone() {
        // console.log('同步完成');
    }
    function hasNotJoinedGroup(session) {
        getMyGroup({
            succ: function (teams) {
                var hasJoined = 1;
                for (var i = 0; i < teams.length; i++) {
                    if (teams[i].teamId == session) {
                        hasJoined = 0;
                        break;
                    }
                }
                return hasJoined
            },
            fail: function () {
                return 1;
            }
        })
    }
    //设置当前会话
    function setCurrSession(sel,isLargeGroup) {
        //将切换前的会话的未读数置为0
        if(nim.currSess){
            nimMsgPool.setUnread(nim.currSess, 0);
        }
        isSwitch = true;
        nim.currSess = sel;
        //调用网易切换会话的方法,是为了将消息未读数重置为0;
        nim.setCurrSession("team-" + sel);

        //将切换后的会话的未读数置为0
        nimMsgPool.setUnread(sel, 0);
        nim.isOthersGroup = isLargeGroup;
    }

    function loadHistroy(sid,succ,fail){
        var isLargeGroup = nimMsgPool.getMsgData()[sid].largeGroup;
        if(isLargeGroup || nim.isOthersGroup){
            //通过接口取到公共群的所有历史纪录;
            getHistoryMsgByServer(sid,{
                succ: function (obj) {
                    var msgs = obj.msgs;
                    for (var i = 0, j = msgs.length; i < j; i++) {
                        if (msgs[i].type == 0) {
                            msgs[i].type = 'text';
                            msgs[i].text = msgs[i].body.msg;

                        } else if (msgs[i].type == 1) {
                            msgs[i].type = 'text';
                            msgs[i].text = "<img class='chat-img' src='" + msgs[i].body.url + "' ievent='scanBig' />"
                        }
                        msgs[i].flow = 'in';
                        if (msgs[i].from == nim.account){
                            msgs[i].flow = 'out';
                        }
                        msgs[i].idClient = msgs[i].msgid;
                    }
                    succ(obj.msgs);
                },
                fail:function () {
                    fail();
                }
            });
        }else{
            //网易获取的私聊群 云端记录
            var lastMsgId = undefined;
            var msgData = nimMsgPool.getMsgData();
            if(msgData[sid].news && msgData[sid].news.length > 0){
                lastMsgId = msgData[sid].news[0].time;
            }
            nim.getHistoryMsgs({
                scene: 'team',
                to: sid,
                endTime: lastMsgId,
                done: function (error, obj) {
                    if (error) {
                        fail();
                    }
                    var cloudMsg = obj.msgs;
                    if(cloudMsg){
                        for (var i = 0, j = cloudMsg.length; i < j; i++) {
                            cloudMsg[i] = parseMsg(cloudMsg[i]);
                        }
                        succ(cloudMsg);
                    }
                }
            });
        }
    }


    /**
     * 发送普通文本消息
     */
    function sendTextMessage(text, cb) {
        nim.sendText({
            scene: 'team',
            to: nim.currSess,
            text: text,
            done: function (error, msg) {
                if (!error) {
                    cb && cb.succ(msg);
                } else {
                    cb && cb.fail(error)
                }
            }
        });
    };
    /**
     * 发送图片消息
     */
    function sendImage() {
        $('.sendImgPending').removeClass('hide');
        nim.sendFile({
            scene: 'team',
            to: nim.currSess,
            type: 'image',
            fileInput: 'imgFile',
            beginupload: function(upload) {
                // - 如果开发者传入 fileInput, 在此回调之前不能修改 fileInput
                // - 在此回调之后可以取消图片上传, 此回调会接收一个参数 `upload`, 调用 `upload.abort();` 来取消文件上传
            },
            uploadprogress: function(obj) {
                console.log('文件总大小: ' + obj.total + 'bytes');
                console.log('已经上传的大小: ' + obj.loaded + 'bytes');
                console.log('上传进度: ' + obj.percentage);
                console.log('上传进度文本: ' + obj.percentageText);
            },
            uploaddone: function(error, file) {
                console.log(error);
                console.log(file);
                console.log('上传' + (!error?'成功':'失败'));
                if(!error){
                    $('.sendImgPending').addClass('hide');
                }
            },
            beforesend: function(msg) {
                console.log('正在发送image消息, id=' + msg.idClient);
            },
            done: function () {
                console.log('发送完成')
            }
        });
    }
    /**
     * 设置当前会话，当前会话未读数会被置为0，同时开发者会收到 onupdatesession回调
     * @param {String} scene
     * @param {String} to
     */

    //创建高级群
    function createGroup(option, cb) {
        var options = option;
        options.done = function (error, obj) {
            console.log(obj);
            console.log('创建' + obj.team.type + '群' + (!error ? '成功' : '失败'));
            if (!error) {
                cb && cb.succ(obj);
            } else {
                cb && cb.fail(error);
                console.log(error);
            }
        };
        nim.createTeam(options);
    };

    //获取我的群列表
    function getMyGroup(cb) {
        nim.getTeams({
            done: getTeamsDone
        });
        function getTeamsDone(error, teams) {
            console.log(teams);
            console.log('获取群列表' + (!error ? '成功' : '失败'));
            if (!error) {
                cb && cb.succ(teams);
            } else {
                cb && cb.fail();
                console.log(error);
            }
        }
    };

    //搜索群
    function searchGroup(teamId, cb) {
        nim.getTeam({
            teamId: teamId,
            done: getTeamDone
        });
        function getTeamDone(error, teams) {
            console.log('搜索群' + (!error ? '成功' : '失败'));
            if (!error) {
                cb && cb.succ();
                console.log(teams);
            } else {
                cb && cb.fail();
                console.log(error);
            }
        }
    };

    //加入群
    function applyJoinGroup(teamId, cb) {
        nim.applyTeam({
            teamId: teamId,
            done: applyTeamDone
        });
        function applyTeamDone(error, obj) {
            console.log(obj);
            console.log('申请入群' + (!error ? '成功' : '失败'));
            if (!error) {
                cb && cb.succ(obj);
            } else {
                cb && cb.fail(error);
                console.log(error);
            }
        }
    };

    return {
        setPullMsg: function (session) {
            nimMsgPool.setPullMsg(session,true);
        },
        setLargeGroup: function (session) {
            nimMsgPool.setLargeGroup(session,true);
        },
        addListener: function (mod) {
            nimMsgPool.addListener(mod);
        },
        clearListeners: function () {
            nimMsgPool.clearListeners();
        },
        getPool: function () {
          return nimMsgPool.getMsgData();
        },
        loadHistroy: loadHistroy,
        onSendMsg: sendTextMessage,
        sendImage: sendImage,
        applyJoinGroup: applyJoinGroup,
        getMyGroup: getMyGroup,
        searchGroup: searchGroup,
        createGroup: createGroup,
        parseMsg: parseMsg,
        setCurrSession: setCurrSession,
        sendImage: sendImage,
        login: login,
        logout: logout,
        hasNotJoinedGroup: hasNotJoinedGroup,
        nimMsgPool:nimMsgPool
    }
})();

//更新工程商的参与状态, im03 接口
function setSupplierChatStatus(demand_id, ChatStatus, cb) {

    // has_chat ==> 是否已聊天，0：未聊天；1：已聊天；
    var data = {
        "demand_id": demand_id,
        "has_chat": ChatStatus
    };
    api_ajax_post("im/im03", data, cb);
}
//通过服务端拉取群消息, im01 接口
function getHistoryMsgByServer(gid,cb) {
    // has_chat ==> 是否已聊天，0：未聊天；1：已聊天；
    var data = {
        "group_id": gid,
        "end_tm": '',
        "pagesize": 100,
    };
    api_ajax_post("im/im01", data, cb, {loading: false});
}
//客户主动跟工程商私聊时，给工程商发送短信提醒 
function sendSmsToSupplier(did,sid,cb) {

    // has_chat ==> 是否已聊天，0：未聊天；1：已聊天；
    var data = {
        "demand_id": did,
        "supplier_id": sid,
    };
    api_ajax_post("sms/sms01", data, cb);
}
