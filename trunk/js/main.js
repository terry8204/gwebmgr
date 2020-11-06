// 是否显示公司名字
var isShowCompany = localStorage.getItem('isShowCompany');
var communicate = new Vue({}); // 组件之间通信的vue实例
var userName = localStorage.getItem('name');
var gForcealarm = localStorage.getItem("forcealarm") == "" ? '000000000000000000000000000000000000000000000000000000000000000' : localStorage.getItem("forcealarm");
var isZh = utils.locale === 'zh';
var mapType = utils.getMapType();
var isLoadBMap = false;
var globalDeviceId = "";
var globalDeviceName = "";
var reportDeviceId = null;
var userlists = [];
var globalGroups = [];
var carIconTypes = {};
var rootuser = null; // tree users
var isNeedRefresh = false;
var isToAlarmListRecords = false;
var isToPhoneAlarmRecords = false;
var isNeedRefreshMapUI = false;
var timeDifference = DateFormat.getOffset();
var voiceQueue = []; //语音报警队列
var alarmTypeList = []; //全部报警类型
var isPlayAlarmVoice = false;

document.title = isZh ? "车载视频安全预警平台" : "Location video service platform";

Vue.use(VTree.VTree);
// vuex store
vstore = new Vuex.Store({
    state: {
        isShowCompany: isShowCompany === 'true' ? true : false,
        userType: localStorage.getItem('userType'),
        deviceInfos: {},
        userTypeDescrList: [
            { "name": isZh ? "系统管理员" : 'Admin', "type": 0 },
            { "name": isZh ? "一级管理员" : 'Supervisor', "type": 1 },
            { "name": isZh ? "二级管理员" : 'Manager 2', "type": 2 },
            { "name": isZh ? "三级管理员" : 'Manager 3', "type": 3 },
            { "name": isZh ? "四级管理员" : 'Manager 4', "type": 4 },
            { "name": isZh ? "普通监控员" : 'Monitor', "type": 20 },
            { "name": isZh ? "设备" : 'Device', "type": 99 }
        ], // 用户类型描述
        allCmdList: [], // 所有的指令
        deviceTypes: {},
        headerActiveName: 'monitor', // 选中的header 
        intervalTime: 10, // 定位发送请求的timer
        editDeviceInfo: {}, // 备份监控页面要编辑的设备对象
        currentDeviceRecord: null, // 点击设备的记录
        currentDeviceId: null, // 点击设备的id 

        userName: userName
    },
    actions: {
        setdeviceInfos: function(context, groups) {
            globalGroups = groups;
            context.commit('setdeviceInfos', groups);
        },
        setDeviceTypes: function(context) {
            var url = myUrls.queryDeviceTypeByUser();
            utils.sendAjax(url, {}, function(resp) {
                if (resp.status == 0) {
                    context.commit('setDeviceTypes', resp.devicetypes);
                }
            });
        },
        setUserTypeDescr: function(context) {
            var url = myUrls.queryUserTypeDescr();
            $.ajax({
                url: url,
                method: 'post',
                data: {},
                //contentType: "application/json;charset=utf-8",
                async: false,
                success: function(resp) {
                    if (resp.status == 0) {
                        context.commit('setUserTypeDescr', resp.records);
                    } else {
                        Window.location.href = 'index.html';
                    }
                },
                error: function() {}
            })
        },
        setAllCmdList: function(context) {
            var hadDeviceUrl = myUrls.queryHadDeviceCmdByUser();
            utils.sendAjax(
                hadDeviceUrl, { username: localStorage.getItem('name') },
                function(resp) {
                    if (resp.status == 0) {
                        var cmdList = resp.records;
                        context.commit('setAllCmdList', cmdList);
                    } else {
                        window.location.href = 'index.html';
                    }
                }
            );
        }
    },
    mutations: {
        isShowCompany: function(state, isShowCompany) {
            state.isShowCompany = isShowCompany;
        },
        setdeviceInfos: function(state, groups) {
            groups.forEach(function(group) {
                // group.firstLetter = __pinyin.getFirstLetter(group.groupname);
                // group.pinyin = __pinyin.getPinyin(group.groupname);
                group.devices.forEach(function(device, index) {
                    var deviceid = device.deviceid;
                    // device.firstLetter = __pinyin.getFirstLetter(device.devicename);
                    // device.pinyin = __pinyin.getPinyin(device.devicename);
                    state.deviceInfos[deviceid] = device;
                })
            });
        },
        setUserTypeDescr: function(state, userTypeDescrList) {
            state.userTypeDescrList = userTypeDescrList;
        },
        setAllCmdList: function(state, cmdList) {
            cmdList.forEach(function(item) {
                state.allCmdList.push(item);
            })
        },
        setHeaderActiveName: function(state, activeName) {
            state.headerActiveName = activeName;
        },
        stateIntervalTime: function(state, intervalTime) {
            state.intervalTime = intervalTime;
        },
        editDeviceInfo: function(state, editDeviceInfo) {
            state.editDeviceInfo = editDeviceInfo;
        },
        currentDeviceRecord: function(state, record) {
            // console.log("record",record)
            state.currentDeviceRecord = record;
            state.currentDeviceId = record.deviceid;
        },
        currentDeviceId: function(state, deviceid) {
            state.currentDeviceId = deviceid;
        },
        setDeviceTypes: function(state, devicetypes) {
            var obj = {};
            devicetypes.forEach(function(item) {
                obj[item.devicetypeid] = item;
            });
            state.deviceTypes = obj;
        }
    }
});

Vue.component('table-dropdown', {
    template: document.getElementById('table-dropdown-template').innerHTML,
    props: ['params'],
    methods: {
        onClickItem: function(name) {
            switch (name) {
                case 'oil':
                    vueInstanse.onClickCalibration(this.params);
                    break;
                case 'io':
                    vueInstanse.onClickIoSetting(this.params);
                    break;
                case 'carMaster':
                    vueInstanse.queryCarMasterInfo(this.params);
                    break;
                case 'insure':
                    vueInstanse.queryInsureInfo(this.params);
                    break;
                case 'resetPass':
                    vueInstanse.resetDevicePwd(this.params.index);
                    break;
                case 'editCarIcon':
                    editObject = this.params.row;
                    vueInstanse.carIconType = carIconTypes[editObject.deviceid];
                    vueInstanse.editCarIconModal = true;
                    break;
                case 'charge':
                    editObject = this.params.row;
                    vueInstanse.devicePrice = vueInstanse.devicePriceObj[editObject.devicetype];
                    vueInstanse.chargeModal = true;
                    break;
            }
        }
    }
});



Vue.component('my-video', {
    props: [],
    data: function() {
        return {
            isPlaying: false,
            isMute: false,
            playerStateTips: '',
            resolvingPower: { width: 0, height: 0 },
            deviceName: '',
            deviceId: '',
            isFullScreen: false,
            networkSpeed: '0KB/S',
            channel: 1,
        }
    },
    methods: {

        init: function() {
            this.startTimes = 0;
            this.flvPlayer = null;
            this.isSendAjaxState = false;
            this.addEventListenerToPlayer();
        },
        setDevicedInfoAndPlay: function(device) {
            if (this.deviceId && this.deviceId != device.deviceid) {
                this.handleStopVideos();
            }
            this.deviceId = device.deviceid;
            this.deviceName = device.devicename;
            this.channel = device.channel;
            this.handleStartVideos();
        },
        cleanDevicedInfo: function() {
            this.deviceId = '';
            this.deviceName = '';
            this.channel = '';
            this.playerStateTips = '';
        },
        switchVideoPlayState: function() {
            if (this.deviceId == '') {
                this.$Message.error(this.$t('monitor.deviceOffline'));
                return;
            }
            if (this.isPlaying) {
                this.handleStopVideos();
            } else {
                this.handleStartVideos();
            }
        },
        initVideo: function(url, hasaudio) {
            var flvPlayer = flvjs.createPlayer({
                type: 'flv',
                url: url,
                isLive: true,
                hasAudio: hasaudio === 1,
                hasVideo: true,
                withCredentials: false,
                // url: 'http://video.gps51.com:81/live/teststream.flv'
            }, {
                enableWorker: false,
                enableStashBuffer: false,
                isLive: true,
                lazyLoad: false
            });
            var me = this;
            flvPlayer.attachMediaElement(this.$refs.player);
            flvPlayer.load(); //加载
            flvPlayer.play();
            flvPlayer.on(flvjs.Events.STATISTICS_INFO, function(e) {
                me.networkSpeed = parseInt(e.speed * 10) / 10 + 'KB/S';
            })
            this.flvPlayer = flvPlayer;
        },
        switchflvPlayer: function(url, hasaudio) {
            try {
                var flvPlayer = this.flvPlayer;
                if (flvPlayer != null) {
                    flvPlayer.pause();
                    flvPlayer.unload();
                    flvPlayer.detachMediaElement();
                    flvPlayer.destroy();
                }
            } catch (error) {

            }
            this.initVideo(url, hasaudio);
        },
        addEventListenerToPlayer: function() {
            var player = this.$refs.player,
                me = this;
            player.addEventListener('loadedmetadata', function(e) {
                me.resolvingPower = {
                    width: e.target.videoWidth,
                    height: e.target.videoHeight,
                }
            })
            player.addEventListener('error', function() {
                me.isSendAjaxState = false;
                me.playerStateTips = me.$t('video.error');
            });
            player.addEventListener('play', function() {
                me.playerStateTips = me.$t('video.play');
            });
            player.addEventListener('playing', function() {
                me.playerStateTips = me.$t('video.playing');
                me.isSendAjaxState = false;
            });
            player.addEventListener('pause', function() {
                me.playerStateTips = me.$t('video.pause');
            });
            player.addEventListener('waiting', function() {
                me.playerStateTips = me.$t('video.waiting');
            });
        },
        flv_photograph: function(playerIndex) {
            if (!this.isPlaying) {
                return;
            };
            var ele = document.createElement('a');
            var now = DateFormat.longToDateTimeStrNoSplit(Date.now(), timeDifference);
            var fileName = this.deviceName + '-' + this.channel + '-' + now;
            ele.setAttribute('href', this.htmlToImage(playerIndex)); //设置下载文件的url地址
            ele.setAttribute('download', fileName); //用于设置下载文件的文件名
            ele.click();
        },
        htmlToImage: function(index) {
            var canvas = document.getElementById('V2I_canvas');
            if (!canvas.getContext) {
                me.$Message.error(me.$t('video.notSupportCanvas'));
                return false;
            } else {
                var context = canvas.getContext("2d");
                context.drawImage(this.$refs.player, 0, 0, this.resolvingPower.width, this.resolvingPower.height);
                return canvas.toDataURL("image/png");
            }
        },
        handlePlayerMute: function() {
            this.isMute = !this.isMute;
        },
        changePlayerMute: function(isMute) {
            this.isMute = isMute;
        },
        onDbClick: function(e) {
            e.stopPropagation();
            e.preventDefault();
            this.handleFullScreen();
        },
        handleFullScreen: function() {
            if (!this.isPlaying) {
                return;
            };
            var video = this.$refs.player;
            if (video.webkitRequestFullScreen) {
                video.webkitRequestFullScreen();
            } else if (video.mozRequestFullScreen) {
                video.mozRequestFullScreen();
            } else if (video.msRequestFullScreen) {
                video.msRequestFullScreen();
            } else if (video.RequestFullScreen) {
                video.RequestFullScreen();
            }
        },
        handleStartVideos: function() {
            var url = myUrls.startVideos(),
                me = this;
            this.playerStateTips = me.$t('video.requestPlay');
            utils.sendAjax(url, {
                deviceid: this.deviceId,
                channels: [Number(this.channel)],
                playtype: ishttps ? 'flvs' : 'flv',
            }, function(resp) {
                me.isSendAjaxState = false;
                var records = resp.records;
                var status = resp.status;

                if (status == CMD_SEND_RESULT_UNCONFIRM) {
                    me.$Message.error(me.$t('monitor.CMD_SEND_RESULT_UNCONFIRM'));
                } else if (status === CMD_SEND_RESULT_PASSWORD_ERROR) {
                    me.$Message.error(me.$t('monitor.CMD_SEND_RESULT_PASSWORD_ERROR'));
                } else if (status === CMD_SEND_RESULT_OFFLINE_NOT_CACHE) {
                    me.$Message.error(me.$t('monitor.CMD_SEND_RESULT_OFFLINE_NOT_CACHE'));
                } else if (status === CMD_SEND_RESULT_OFFLINE_CACHED) {
                    me.$Message.error(me.$t('monitor.CMD_SEND_RESULT_OFFLINE_CACHED'));
                } else if (status === CMD_SEND_RESULT_MODIFY_DEFAULT_PASSWORD) {
                    me.$Message.error(me.$t('monitor.CMD_SEND_RESULT_MODIFY_DEFAULT_PASSWORD'));
                } else if (status === CMD_SEND_RESULT_DETAIL_ERROR) {
                    me.$Message.error(me.$t('monitor.CMD_SEND_RESULT_DETAIL_ERROR') + resp.cause);
                } else if (status === CMD_SEND_CONFIRMED) {
                    var acc = resp.acc
                    var accState = '';
                    if (acc === 3) {
                        accState = me.$t('video.accOpen');
                    } else if (acc === 2) {
                        accState = me.$t('video.accClose');
                    }
                    me.$Message.success(accState + me.$t('video.requestPlaySucc'));
                    me.switchflvPlayer(records[0].playurl, records[0].hasaudio);
                    me.isPlaying = true;
                    me.startTimes = Date.now();
                } else if (status === CMD_SEND_OVER_RETRY_TIMES) {
                    me.$Message.error(me.$t('monitor.CMD_SEND_OVER_RETRY_TIMES'));
                } else if (status === CMD_SEND_SYNC_TIMEOUT) {

                    var accState = '';
                    if (acc === 3) {
                        accState = me.$t('video.accOpen');
                    } else if (acc === 2) {
                        accState = me.$t('video.accClose');
                    }
                    me.$Message.error(accState + me.$t('video.requestPlayTimeout'));
                    me.switchflvPlayer(records[0].playurl, records[0].hasaudio);
                    me.isPlaying = true;
                    me.startTimes = Date.now();
                }

            }, function() {
                me.$Message.error(me.$t('video.requestTimeout'));
                me.isSendAjaxState = false;
            })
        },
        handleStopVideos: function() {

            try {
                var player = this.flvPlayer;
                player.unload();
                player.detachMediaElement();
                player.destroy();
                this.flvPlayer = null;
            } catch (error) {};
            this.isPlaying = false;
            this.playerStateTips = this.$t('video.pausePlay');
            this.isSendAjaxState = false;
            this.networkSpeed = '0KB/S';

            var url = myUrls.stopVideos();
            utils.sendAjax(url, {
                deviceid: this.deviceId,
                channels: [Number(this.channel)]
            }, function(resp) {})


        },
        timeout: function() {

            if (this.isPlaying) {
                var nowTime = Date.now();
                if ((nowTime - this.startTimes) > 1000 * 60 * 3) {
                    this.handleStopVideos();
                    this.playerStateTips = this.$t('video.threeMinutes');
                }
            }
        }
    },
    computed: {
        channelStr: function() {
            return this.channel ? 'CH' + this.channel + ' -' : '';
        }
    },
    mounted: function() {
        this.init();
    },
    template: document.getElementById('video-template').innerHTML
})



Vue.component('rule-allocation', {
    template: document.getElementById('rule-allocation-template').innerHTML,
    props: {
        modal: {
            defaul: false,
            type: Boolean
        }
    },
    data: function() {
        return {
            allocationType: '1',
            sosoValue1: '',
            sosoValue2: '',
            ruleLists1: [],
            ruleLists2: [],
            groupLists1: [],
            groupLists2: [],
        }
    },
    methods: {
        onSearchChange1: function() {
            var me = this;
            var sosoValue1 = this.sosoValue1.trim();
            if (this.timeoutIns1 != null) {
                clearTimeout(this.timeoutIns1);
            }

            this.timeoutIns1 = setTimeout(function() {
                if (me.allocationType == '1') {
                    me.ruleLists1 = me.getFilterRules(sosoValue1);
                } else {
                    me.groupLists2 = me.getFilterGroupLists(sosoValue1);
                }

            }, 300);
        },
        onSearchChange2: function() {
            var me = this;
            var sosoValue2 = this.sosoValue2.trim();

            if (this.timeoutIns2 != null) {
                clearTimeout(this.timeoutIns2);
            }

            this.timeoutIns2 = setTimeout(function() {
                if (me.allocationType == '1') {
                    me.groupLists1 = me.getFilterGroupLists(sosoValue2);
                } else {
                    me.ruleLists2 = me.getFilterRules(sosoValue2);
                }
            }, 300);
        },
        getFilterRules: function(value) {
            if (value != '') {
                var ruleLists = [{
                    title: vRoot.$t('rule,allRule'),
                    children: [],
                    expanded: true,
                }];
                this.ruleLists[0].children.forEach(function(ruleGroup) {
                    var newRuleGroup = deepClone(ruleGroup);
                    if (ruleGroup.firstLetter.indexOf(value) > -1 || ruleGroup.pinyin.indexOf(value) > -1 || ruleGroup.title.indexOf(value) > -1) {
                        ruleGroup.expanded = true;
                        ruleLists[0].children.push(newRuleGroup);
                    } else {
                        newRuleGroup.children = [];
                        ruleGroup.children.forEach(function(rule) {
                            if (rule.firstLetter.indexOf(value) > -1 || rule.pinyin.indexOf(value) > -1 || rule.title.indexOf(value) > 0) {
                                newRuleGroup.children.push(deepClone(rule))
                            }
                        });
                        if (newRuleGroup.children.length) {
                            newRuleGroup.expanded = true;
                            ruleLists[0].children.push(newRuleGroup);
                        }
                    }
                })
            } else {
                ruleLists = deepClone(this.ruleLists)
            }
            return ruleLists;
        },
        getFilterGroupLists: function(value) {
            if (value != '') {
                var groupLists = [{
                    title: vRoot.$t('rule.allDevice'),
                    children: [],
                    expanded: true,
                }];
                this.groupLists[0].children.forEach(function(group) {
                    if (group.title.indexOf(value) > -1 || group.pinyin.indexOf(value) > -1 || group.firstLetter.indexOf(value) > -1) {
                        var newGroup = deepClone(group);
                        newGroup.expanded = true;
                        groupLists[0].children.push(newGroup);
                    } else {
                        var groupObj = {
                            title: group.title,
                            children: [],
                            firstLetter: group.firstLetter,
                            pinyin: group.pinyin,
                            groupid: group.groupid,
                            expanded: true,
                        };
                        group.children.forEach(function(device) {
                            if (device.title.indexOf(value) > -1 || device.pinyin.indexOf(value) > -1 || device.firstLetter.indexOf(value) > -1) {
                                groupObj.children.push({
                                    title: device.title,
                                    deviceid: device.deviceid,
                                    firstLetter: device.firstLetter,
                                    pinyin: device.pinyin,
                                })
                            }
                        });
                        if (groupObj.children.length) {
                            groupLists[0].children.push(groupObj);
                        }
                    }
                })
                return groupLists;
            } else {
                return deepClone(this.groupLists);
            }
        },
        onVisibleChange: function(e) {
            if (e == false) {
                this.$emit('close-model', false);
            }
        },
        onClose: function() {
            this.$emit('close-model', false);
        },
        getGroupLists: function(groups) {
            var groupLists = [{
                title: vRoot.$t('rule.allDevice'),
                children: [],
                expanded: true,
            }];
            groups.forEach(function(group) {
                var groupObj = {
                    title: group.groupname,
                    children: [],
                    firstLetter: group.firstLetter,
                    pinyin: group.pinyin,
                    groupid: group.groupid,
                };
                group.children.forEach(function(device) {
                    groupObj.children.push({
                        title: device.devicename,
                        deviceid: device.deviceid,
                        firstLetter: device.firstLetter,
                        pinyin: device.pinyin,
                    })
                });
                if (groupObj.children.length) {
                    groupLists[0].children.push(groupObj);
                }
            })
            return groupLists;
        },
        queryDeviceRulesByRuleid: function(ruledefineid, callback) {
            var url = myUrls.queryDeviceRulesByRuleid();
            var data = { ruledefineid: ruledefineid };
            utils.sendAjax(url, data, callback)
        },
        queryDeviceRulesByDeviceId: function(deviceid, callback) {
            var url = myUrls.queryDeviceRulesByDeviceId();
            var data = { deviceid: deviceid };
            utils.sendAjax(url, data, callback)
        },
        onSelectRule: function(node) {
            var me = this;
            if (node.children && node.children.length) {
                this.selectedRule = null;
                this.$Message.error(this.$t('rule.selectedRule'));
            } else {
                this.selectedRule = node;
                this.queryDeviceRulesByRuleid(this.selectedRule.ruledefineid, function(resp) {
                    var devices = resp.devices;
                    if (resp.status == 0 && devices) {
                        var groupLists = deepClone(me.groupLists);
                        devices.forEach(function(device) {
                            var deviceid = device.deviceid;
                            groupLists[0].children.forEach(function(group) {
                                var isFound = false;
                                group.children.forEach(function(item) {
                                    if (item.deviceid == deviceid) {
                                        item.checked = true;
                                        isFound = true;
                                    }
                                })
                                isFound && (group.expanded = true);
                            })
                        })
                        me.groupLists1 = groupLists;
                    }
                });
            }
        },
        onSelectDevice: function(node) {
            var me = this;
            if (node.children && node.children.length) {
                this.selectedDevice = null;
                this.$Message.error(this.$t('reportForm.selectDevTip'));
            } else {
                this.selectedDevice = node;
                this.queryDeviceRulesByDeviceId(this.selectedDevice.deviceid, function(resp) {
                    var rules = resp.rules;
                    if (resp.status == 0 && rules) {
                        var ruleLists = deepClone(me.ruleLists);
                        rules.forEach(function(rule) {
                            var ruledefineid = rule.ruledefineid;
                            ruleLists[0].children.forEach(function(ruleGroup) {
                                var isFound = false;
                                ruleGroup.children.forEach(function(rule) {
                                    if (rule.ruledefineid == ruledefineid) {
                                        rule.checked = true;
                                        isFound = true;
                                    }
                                })
                                isFound && (ruleGroup.expanded = true);
                            })
                        })
                        me.ruleLists2 = ruleLists;
                    }
                });
            }
        },
        settingRuleToDevice: function() {
            var me = this;
            if (this.allocationType == '1') {
                var url = myUrls.saveDeviceRulesByRuleid();
                var deviceids = [];
                this.$refs.checkTree1.getCheckedNodes(true, false).forEach(function(item) {
                    if (!item.children && item.deviceid) {
                        deviceids.push(item.deviceid)
                    }
                })
                if (this.selectedRule == null) {
                    this.$Message.error(me.$t('rule.selectedRule'));
                    return;
                }
                if (deviceids.length == 0) {
                    this.$Message.error(me.$t('reportForm.selectDevTip'));
                    return;
                }
                var data = {
                    ruledefineid: this.selectedRule.ruledefineid,
                    deviceids: deviceids
                };
                utils.sendAjax(url, data, function(resp) {
                    if (resp.status == 0) {
                        me.$Message.success(me.$t('monitor.setupSucc'));
                    } else {
                        me.$Message.error(me.$t('monitor.setupFail'));
                    }
                });
            } else if (this.allocationType == '2') {
                var url = myUrls.saveDeviceRulesByDeviceid();
                var ruleids = [];
                this.$refs.checkTree2.getCheckedNodes(true, false).forEach(function(item) {
                    if (!item.children && item.ruledefineid) {
                        ruleids.push(item.ruledefineid)
                    }
                })
                if (this.selectedDevice == null) {
                    this.$Message.error(me.$t('reportForm.selectDevTip'));
                    return;
                }
                if (ruleids.length == 0) {
                    this.$Message.error(me.$t('rule.selectedRule'));
                    return;
                }
                var data = {
                    deviceid: this.selectedDevice.deviceid,
                    ruleids: ruleids
                };
                utils.sendAjax(url, data, function(resp) {
                    if (resp.status == 0) {
                        me.$Message.success(me.$t('monitor.setupSucc'));
                    } else {
                        me.$Message.error(me.$t('monitor.setupFail'));
                    }
                });
            }

        },
        setRuleLists: function() {
            var me = this;
            var url = myUrls.queryRuleDefines();
            utils.sendAjax(url, {}, function(resp) {
                if (resp.status === 0) {
                    var ruleLists = [{
                        title: vRoot.$t('rule.allRule'),
                        children: [],
                        expanded: true,
                    }];
                    var ruleObj = {};
                    resp.records.forEach(function(record) {
                        var firstLetter = __pinyin.getFirstLetter(record.rulename);
                        var pinyin = __pinyin.getPinyin(record.rulename);
                        var ruletype = record.ruletype;
                        record.title = record.rulename;
                        record.firstLetter = firstLetter;
                        record.pinyin = pinyin;
                        if (ruleObj[ruletype] == undefined) {
                            ruleObj[ruletype] = [];
                        }

                        ruleObj[ruletype].push(record);
                    });
                    for (var key in ruleObj) {
                        var title = me.ruleTypeNames[key];
                        ruleLists[0].children.push({
                            title: title,
                            children: ruleObj[key],
                            firstLetter: __pinyin.getFirstLetter(title),
                            pinyin: __pinyin.getPinyin(title),
                        })
                    }
                    me.ruleLists = ruleLists;
                    me.ruleLists1 = deepClone(ruleLists);
                    me.ruleLists2 = ruleLists;
                }
            });
        },
        init: function() {
            this.allocationType = '1';
            this.timeoutIns1 = null;
            this.timeoutIns2 = null;
            this.ruleLists = null;
            this.selectedRule = null;
            this.selectedDevice = null;
            this.groupLists = this.getGroupLists(vRoot.$children[1].groups);
            this.groupLists1 = this.groupLists;
            this.groupLists2 = deepClone(this.groupLists);
            this.ruleTypeNames = {
                overspeed: this.$t('rule.overSpeed'),
                linkalarm: this.$t('rule.linkAlarm'),
            }
            this.setRuleLists();
        }
    },
    mounted: function() {
        this.init();

    }
})


Vue.component('s-checkbox', {
    props: {
        ioCount: {
            type: Number,
            default: 4,
        }
    },
    data: function() {
        return {
            isAll: true,
            isShowCheckbox: false,
            checkboxList: [],
        }
    },
    methods: {
        onClickOutside: function() {
            this.isShowCheckbox = false;
        },
        onChange: function(val) {
            if (val) {
                this.checkboxList = [1, 2, 3, 4];
            } else {
                this.checkboxList = [];
            }
        }
    },
    computed: {
        checkboxStr: function() {
            var str = '';
            this.checkboxList.forEach(function(item) {
                str += " io_" + item;
            })
            return str;
        }
    },
    mounted: function() {
        this.checkboxList = [1, 2, 3, 4];
    },
    watch: {
        checkboxList: function(list) {
            if (list.length == this.ioCount) {
                this.isAll = true;
            } else {
                this.isAll = false;
            }
            this.$emit('change-io', this.checkboxList);
        }
    },
    template: document.getElementById("select-checkbox-template"),
})



// 头部组建
var appHeader = {
    template: document.getElementById('header-template').innerHTML,
    props: ['componentid'],
    data: function() {
        var me = this;
        return {
            dark: 'dark',
            name: '',
            isManager: true,
            modal: false,
            intervalTime: null,
            multilogin: localStorage.getItem(userName + "-multilogin"),
            isShowCompany: false,
            serviceModal: false,
            headMenuList: [
                { name: "monitor", icon: "md-contacts", title: me.$t("header.monitor"), isShow: true },
                { name: "reportForm", icon: "ios-paper-outline", title: me.$t("header.reportForm"), isShow: true },
                { name: "bgManager", icon: "md-settings", title: me.$t("header.bgManager"), isShow: true },
                { name: "ruleManager", icon: "ios-book-outline", title: me.$t("header.ruleManagr"), isShow: true },
                { name: "systemParam", icon: "ios-options", title: me.$t("header.systemParam"), isShow: true },
            ],
            modalPass: false,
            oldPass: '',
            newPass: '',
            confirmPass: '',
            creatername: sessionStorage.getItem("creatername"),
            createrqq: sessionStorage.getItem("createrqq"),
            createrphone: sessionStorage.getItem("createrphone"),
            createrwechat: sessionStorage.getItem("createrwechat"),
            createremail: sessionStorage.getItem("createremail"),
            email: sessionStorage.getItem("email"),
            nickname: sessionStorage.getItem("nickname"),
            phone: sessionStorage.getItem("phone"),
            qq: sessionStorage.getItem("qq"),
            wechat: sessionStorage.getItem("wechat"),
            selfConcatInfo: {
                email: sessionStorage.getItem("email"),
                nickname: sessionStorage.getItem("nickname"),
                phone: sessionStorage.getItem("phone"),
                qq: sessionStorage.getItem("qq"),
                wechat: sessionStorage.getItem("wechat"),
            },
        }
    },
    methods: {
        jumpMessageHtml: function() {
            open("message.html?token=" + token);
        },
        changeNav: function(navName) {
            this.$emit('change-nav', navName);
        },
        getManagerType: function(type) {
            var name = ''
            for (var i = 0; i < this.userTypeDescrList.length; i++) {
                var item = this.userTypeDescrList[i]
                if (item.type == type) {
                    name = item.name
                    break;
                }
            }
            return '[' + name + ']'
        },
        changeUserPass: function() {
            var me = this
            var url = myUrls.changeUserPass()
            var data = {
                username: localStorage.getItem('name'),
                newpass: $.md5(this.newPass),
                oldpass: $.md5(this.oldPass)
            }
            if (this.newPass.length < 4) {
                this.$Message.error(this.$t("header.error_1"));
                return
            }
            if (
                this.oldPass == '' ||
                this.newPass == '' ||
                this.confirmPass == ''
            ) {
                this.$Message.error(me.$t("header.error_2"));
                return
            }
            if (this.confirmPass !== this.newPass) {
                this.$Message.error(me.$t("header.error_3"));
                return
            }

            utils.sendAjax(url, data, function(resp) {
                if (resp.status == 0) {
                    me.$Message.success(me.$t("header.changePwdSucc"))
                    if (me.userType != 99) {
                        localStorage.setItem('accountpass', me.newPass, { expires: 7 })
                    } else {
                        localStorage.setItem('devicepass', me.newPass, { expires: 7 })
                    }

                    me.modalPass = false;
                } else {
                    me.$Message.error(me.$t("header.error_4"))
                }
            })
        },
        logout: function() {
            var me = this
            var url = myUrls.logout()
            utils.sendAjax(url, {}, function(resp) {
                if (resp.status == 0) {
                    localStorage.setItem('token', "");
                    window.location.href = 'index.html';
                } else {
                    me.$Message.error(resp.cause)
                }
            })
        },
        changePassword: function() {
            this.modal = false;
            this.modalPass = true;
            this.oldPass = '';
            this.newPass = '';
            this.confirmPass = '';
        },
        showSetup: function() {
            this.modal = true;
        },
        changeShowCompany: function(state) {
            this.$store.commit('isShowCompany', state);
            localStorage.setItem('isShowCompany', state, { expires: 7 });
        },
        reqUserType: function() {
            var url = myUrls.queryUserType()
            utils.sendAjax(url, {}, function(resp) {
                console.log(resp)
            })
        },
        navJurisdiction: function(userType) {
            if (userType == -1 || userType == 99 || userType == 20 || userType == 11) {
                this.headMenuList[2].isShow = false;
                this.headMenuList[3].isShow = false;
                this.headMenuList[4].isShow = false;
                // this.$emit('change-nav', 'monitor');
            } else if (userType == 0) {
                // this.headMenuList[0].isShow = false;
                // this.$emit('change-nav', 'reportForm')
            } else if (userType == 1 || userType == 2) {
                this.headMenuList[4].isShow = false;
                // this.$emit('change-nav', 'monitor')
            } else {
                this.headMenuList[4].isShow = false;

            }
            // console.log(this.headMenuList);
            this.$emit('change-nav', 'monitor')
        },
        handleEditMyInfo: function() {
            var me = this;
            var url = myUrls.editMyInfo();
            var data = {
                email: this.email,
                nickname: this.nickname,
                phone: this.phone,
                qq: this.qq,
                wechat: this.wechat,
                username: userName,
                multilogin: Number(this.multilogin)
            };
            utils.sendAjax(url, data, function(resp) {
                if (resp.status === 0) {
                    delete data.username;
                    me.selfConcatInfo = data;
                    localStorage.setItem(userName + "-multilogin", me.multilogin);
                    me.$Message.success(me.$t("message.changeSucc"));
                } else {
                    me.$Message.error(me.$t("message.changeFail"));
                }
            });
        }
    },
    computed: {
        userTypeDescrList: function() {
            return this.$store.state.userTypeDescrList;
        },
        stateIntervalTime: function() {
            return this.$store.state.intervalTime;
        },
        userType: function() {
            return this.$store.state.userType;
        },
        aHref: function() {
            return 'tencent://message/?uin=' + this.createrqq + '&amp;Site=' + this.creatername + '&amp;Menu=yes';
        }
    },
    mounted: function() {
        var me = this;
        this.$nextTick(function() {
            var mgrType = me.getManagerType(me.userType)
            me.name = localStorage.getItem('name') + mgrType;
            me.intervalTime = me.stateIntervalTime;
            me.navJurisdiction(me.userType)
            var isShowCompany = localStorage.getItem('isShowCompany')
            if (isShowCompany == 'true') {
                me.isShowCompany = true;
            } else if (isShowCompany == 'false') {
                me.isShowCompany = false;
            }
        })
    },
    watch: {
        intervalTime: function() {
            var intervalTime = Number(this.intervalTime)
            this.$store.commit('stateIntervalTime', intervalTime);
        },
        modal: function() {
            if (!this.modal) {
                this.email = this.selfConcatInfo.email;
                this.nickname = this.selfConcatInfo.nickname;
                this.phone = this.selfConcatInfo.phone;
                this.qq = this.selfConcatInfo.qq;
                this.wechat = this.selfConcatInfo.wechat;
                this.multilogin = localStorage.getItem(userName + "-multilogin");
            }
        }
    }
}

// 根据当前语言来设置 iview 使用使用设么语言
iview.lang(isZh ? 'zh-CN' : 'en-US');


//0x00 定时上报
//0x01 定距上报
//0x02 拐点上传
//0x03 ACC 状态改变上传
//0x04 从运动变为静止状态后，补传最后一个定位点
//0x05 网络断开重连后，上报之前最后一个有效上传点
//0X06 星历更新强制上传 GPS 点
//0X07 按键上传定位点
//0X08 开机上报位置信息
//0X09 未使用
//0X0A 设备静止后上报最后的经纬度，但时间更新
//0X0B WiFi解析经纬度上传包
//0X0C 立即定位指令上报
//0X0D 设备静止后上报最后的经纬度
//0X0E 下静止状态定时上传

function getReportModeStr(reportmode) {
    var reportModeStr = "0x" + reportmode.toString(16);
    switch (reportmode) {
        case 0x00:
            reportModeStr += "定时上报";
            break;
        case 0x01:
            reportModeStr += "定距上报";
            break;
        case 0x02:
            reportModeStr += "拐点上传";
            break;
        case 0x03:
            reportModeStr += "ACC状态改变上传";
            break;
        case 0x04:
            reportModeStr += "运动变静止最后一个点";
            break;
        case 0x05:
            reportModeStr += "网络重连最后一个有效点";
            break;
        case 0X06:
            reportModeStr += "星历更新强制上传 GPS点";
            break;
        case 0X07:
            reportModeStr += "按键上传定位点";
            break;
        case 0X08:
            reportModeStr += "开机上报位置信息";
            break;
        case 0X09:
            reportModeStr += "未使用";
            break;
        case 0X0A:
            reportModeStr += "静止后上报最后的经纬度且时间更新";
            break;
        case 0X0B:
            reportModeStr += "WiFi解析经纬度上传包";
            break;
        case 0X0C:
            reportModeStr += "立即定位指令上报";
            break;
        case 0X0D:
            reportModeStr += "设备静止后上报最后的经纬度";
            break;
        case 0X0E:
            reportModeStr += "静止状态定时上传";
            break;
        case -1:
            reportModeStr += "-1";
            break;
    }

    return reportModeStr;
}




Vue.devtools = false;
// 根组件
var vRoot = new Vue({
    el: '#app',
    store: vstore,
    i18n: utils.getI18n(),
    data: {
        // isShowAlarm: true
    },
    methods: {
        changeComponent: function(activeName) {
            window.onresize = null;
            isToAlarmListRecords = false;
            isToPhoneAlarmRecords = false;
            this.$store.commit('setHeaderActiveName', activeName);
        },
        jumpReport: function(activeName) {
            this.$store.commit('setHeaderActiveName', activeName);
        },
    },
    computed: {
        activeName: function() {
            return this.$store.state.headerActiveName;
        },
        userType: function() {
            return this.$store.state.userType;
        }
    },
    components: {
        appHeader: appHeader,
        bgManager: bgManager,
        monitor: monitor,
        reportForm: reportForm,
        waringComponent: waringComponent,
        systemParam: systemParam,
        ruleManager: ruleManager
    },
    mounted: function() {
        // this.isShowAlarm = this.userType == 0 ? false : true;
        // this.$store.dispatch('setUserTypeDescr');
        this.$store.dispatch('setAllCmdList');
        this.$store.dispatch('setDeviceTypes');
        vueInstanse = this; // 备份monitor实例
        utils.getUserInfoList();
        utils.queryAllSubgroups();

    }
});

var audio = document.getElementById('myaudio');
// audio.addEventListener('canplay', function() {
//     console.log('语音加载成功');
//     audio.play();
// }, true)

// audio.addEventListener('ended', function() {
//     console.log('语音成功');
//     isPlayAlarmVoice = false;
//     if (voiceQueue.length > 0) {
//         utils.playTextVoice(voiceQueue.shift());
//     }
// }, false);