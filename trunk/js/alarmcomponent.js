// 报警组件
var waringComponent = {
    template: document.getElementById('waring-template'),
    data: function() {
        return {
            isZh: isZh,
            isMute: false,
            isLargen: 0,
            index: 1,
            waringRowIndex: null,
            componentName: 'waringMsg',
            disposeModal: false,
            waringModal: false,
            checkboxObj: {},
            waringRecords: [],
            overdueDevice: [],
            alarmTypeList: [],
            overdueinfolist: [],
            // alarmCmdList: [[]],
            isWaring: false,
            interval: 10000,
            cmdRowWaringObj: {},
            currentDevTypeCmdList: [],
            disposeAlarm: 'TYPE_SERVER_DIS_ALARM',
            params: '', //参数,
            paramsInputList: [],
            paramsInputObj: {},
            wrapperWidth: null,
            wrapperHeight: null,
            waringWraperStyle: { width: '130px', height: '22px' },
            paramsCmdCodeArr: [],
            lastQueryAllAlarmTime: 0, //查询报警备份的时间
            lastqueryallmsgtime: 0,
            msgListObj: new MsgMgr(),
            type: null, // 解除报警的参数类型 是 text | list
            selectedTypeVal: null,
        }
    },
    computed: {
        deviceInfos: function() {
            return this.$store.state.deviceInfos;
        },
        currentDeviceId: function() {
            return this.$store.state.currentDeviceId;
        },
        userType: function() {
            return this.$store.state.userType;
        },
        activeComponent: function() {
            return this.$store.state.headerActiveName;
        }
    },
    watch: {
        isLargen: function() {
            this.changeWrapperCls();
        },
        waringRecords: function() {
            if (this.waringRecords.length) {
                this.isWaring = true;
            } else {
                this.isWaring = false;
            }
        },
        isMute: function(val) {
            audio.muted = val;
        },
        disposeAlarm: function() {
            // var me = this
            // this.currentDevTypeCmdList.forEach(function (item) {
            //     if (me.disposeAlarm == item.cmdcode) {
            //         me.params = item.params;
            //     }
            // })
            console.log('this.disposeAlarm', this.disposeAlarm);
        }
    },
    methods: {
        changeWrapperCls: function() {
            var type = this.isLargen;
            if (type === 0) {

                this.wrapperWidth = 130;
                this.wrapperHeight = 22;

            } else if (type === 1) {

                this.wrapperWidth = 900;
                this.wrapperHeight = 400;

            } else if (type === 2) {

                var clientWidth = document.documentElement.clientWidth || document.body.clientWidth;
                var clientHeight = document.documentElement.clientHeight || document.body.clientHeight;
                if (clientWidth < 1300) {
                    clientWidth = 1300;
                }
                if (clientHeight < 580) {
                    clientHeight = 580;
                }
                this.wrapperWidth = clientWidth - 320;
                this.wrapperHeight = clientHeight - 61;

            }

            this.setWaringWraperStyle();

        },
        setWaringWraperStyle: function() {
            this.waringWraperStyle = { width: this.wrapperWidth + 'px', height: this.wrapperHeight + 'px' };
        },
        changeLargen: function(type) {
            this.isLargen = type;
            this.isWaring = false;
        },
        changeLargen2: function() {
            if (this.isLargen == 1) {
                this.isLargen = 2;
            } else if (this.isLargen == 2) {
                this.isLargen = 1;
            }
        },
        changeComponent: function(index) {
            this.index = index
            switch (index) {
                case 1:
                    this.componentName = 'waringMsg'
                    break;
                case 2:
                    this.componentName = 'deviceMsg'
                    break;
                case 3:
                    this.componentName = 'overdueInfo'
                    break;
            }
        },
        queryWaringMsg: function() {
            if (!$.isEmptyObject(this.deviceInfos)) {
                var me = this;
                var url = myUrls.queryAlarm();
                this.checkboxObj.lastqueryallalarmtime = me.lastQueryAllAlarmTime;
                utils.sendAjax(url, this.checkboxObj, function(resp) {
                    if (resp.status == 0) {
                        me.lastQueryAllAlarmTime = DateFormat.getCurrentUTC();
                        if (resp.records) {
                            resp.records.forEach(function(item) {
                                me.alarmMgr.addRecord(item);
                            });
                            me.refreshAlarmToUi();
                        }
                    }
                })
            }
        },
        refreshAlarmToUi: function() {
            var me = this;
            var alarmList = me.alarmMgr.getAlarmList();
            alarmList.forEach(function(item) {
                var deviceid = item.deviceid;
                var deviceInfo = me.$store.state.deviceInfos[deviceid];
                if (deviceInfo) {
                    var deviceName = deviceInfo.devicename;
                    item.devicename = deviceName;
                    item.lastalarmtimeStr = DateFormat.longToDateTimeStr(item.lastalarmtime, timeDifference);
                    if (isZh) {
                        item.isdispose = item.disposestatus === 0 ? "未处理" : "已处理";
                    } else {
                        item.isdispose = item.disposestatus === 0 ? "Untreated" : "Handled";
                    }
                };
            });
            me.waringRecords = alarmList;
        },
        filterWaringType: function() {
            this.settingCheckboxObj();
            this.waringModal = true;
        },
        settingCheckboxObj: function() {
            var checkboxObjJson = Cookies.get('checkboxObj')
            if (checkboxObjJson) {
                var checkboxObj = JSON.parse(checkboxObjJson)
                for (var key in this.checkboxObj) {
                    if (this.checkboxObj.hasOwnProperty(key)) {
                        this.checkboxObj[key] = checkboxObj[key]
                    }
                }
            }
        },
        queryDeviceMsgList: function() {
            var me = this;
            if (!$.isEmptyObject(this.deviceInfos)) {
                setTimeout(function() {
                    var url = myUrls.queryMsg();
                    utils.sendAjax(url, { lastqueryallmsgtime: me.lastqueryallmsgtime }, function(resp) {
                        me.lastqueryallmsgtime = DateFormat.getCurrentUTC();
                        if (resp.status === 0 && resp.records) {
                            var records = resp.records;
                            records.forEach(function(item) {
                                item.devicename = me.getDeviceName(item.deviceid);
                                item.createtimeStr = DateFormat.longToDateTimeStr(item.createtime, timeDifference);
                                me.msgListObj.addMsg(item);
                            });
                            me.overdueDevice = me.msgListObj.getMsgList().reverse();
                        };
                    })
                }, 1000);
            }
        },
        getDeviceName: function(deviceid) {
            var deviceName = null;
            var deviceInfos = this.deviceInfos;
            for (var key in deviceInfos) {
                var item = deviceInfos[key];
                if (item.deviceid == deviceid) {
                    deviceName = item.devicename;
                    break;
                };
            };
            return deviceName;
        },
        deleteMsg: function(row) {
            this.$delete(this.overdueDevice, row._index);
            this.msgListObj.deleteMsg(row);
        },
        timingRequestMsg: function() {
            var me = this;
            setInterval(function() {
                me.queryWaringMsg();
                me.queryDeviceMsgList();
            }, this.interval);
        },
        disposeMsg: function(data) {
            if (data && data.length) {
                var newArr = [];
                for (var i = 0; i < data.length; i++) {
                    var msgTiem = data[i]
                    for (var j = 0; j < this.waringRecords.length; j++) {
                        var waringItem = this.waringRecords[j];
                        if (
                            msgTiem.deviceid == waringItem.deviceid &&
                            msgTiem.updatetime !== waringItem.updatetime
                        ) {
                            if (newArr.indexOf(msgTiem) == -1) {
                                newArr.push(msgTiem)
                                if (msgTiem.type == 1) {
                                    var deviceid = msgTiem.deviceid;
                                    var lock = true;
                                    for (var i = 0; i < this.waringRecords.length; i++) {
                                        var item = this.waringRecords[i];
                                        if (item.gpstime == msgTiem.createtime) {
                                            lock = false;
                                            break;
                                        };
                                    }
                                    // 判断是否重复消息
                                    if (lock) {
                                        this.waringRecords.unshift({
                                            devicename: this.$store.state.deviceInfos[deviceid].devicename,
                                            deviceid: deviceid,
                                            gpstime: msgTiem.createtime,
                                            stralarm: msgTiem.content,
                                            isdispose: isZh ? '未处理' : 'Untreated',
                                            messageSerialNo: msgTiem.messageSerialNo,
                                            messageId: msgTiem.messageId
                                        });
                                    }
                                } else if (msgTiem.type == 2) {} else if (msgTiem.type == 3) {} else if (msgTiem.type == 4) {}
                            }
                        }
                    }
                }
                // this.waringRecords = newArr.concat(this.waringRecords);
            }
        },
        saveReqMsgParameter: function() {
            Cookies.set('checkboxObj', this.checkboxObj)
            this.waringModal = false
        },
        showDisposeModalFrame: function(param) {
            this.waringRowIndex = param.index;
            var deviceInfos = this.$store.state.deviceInfos;

            var row = param.row;
            var deviceid = row.deviceid;
            var devicetype = deviceInfos[deviceid].devicetype;

            this.cmdRowWaringObj = {
                deviceid: deviceid,
                devicetype: devicetype,
                params: null,
                state: row.state
            };

            this.disposeModal = true;

        },
        sendDisposeWaring: function() {
            var me = this;
            var sendCmdUrl = myUrls.sendCmd();
            // var disposeAlarmUrl = myUrls.disposeAlarm();
            var isHasParams = true;
            var paramsArr = [];
            me.cmdRowWaringObj.cmdcode = this.disposeAlarm;

            me.paramsCmdCodeArr.forEach(function(cmdCode) {
                var val = me.paramsInputObj[cmdCode]
                paramsArr.push(val);
                if (val == '') {
                    isHasParams = false;
                };
            });

            if (!isHasParams) {
                this.$Message.error(me.$t("alarm.errorNeedParams"));
                return;
            };

            if (this.params && paramsArr.length) {
                this.cmdRowWaringObj.params = paramsArr;
            };

            if (this.type === 'list') {
                if (this.selectedTypeVal) {
                    this.cmdRowWaringObj.params = [this.selectedTypeVal];
                } else {
                    return;
                }
            };

            utils.sendAjax(sendCmdUrl, this.cmdRowWaringObj, function(resp) {
                if (resp.status == 0) {
                    me.disposeModal = false;
                    me.$Message.success(me.$t("alarm.successfulRelease"));
                    me.alarmMgr.updateDisposeStatus(me.cmdRowWaringObj.deviceid, me.cmdRowWaringObj.alarm);
                    me.refreshAlarmToUi();
                } else {
                    resp.cause && me.$Message.error(resp.cause);
                }
            })
        },
        queryAlarmDescr: function() {
            var me = this
            var url = myUrls.queryAlarmDescr()
            utils.sendAjax(url, {}, function(resp) {
                if (resp.status == 0) {
                    var records = resp.records
                    records.forEach(function(item, index) {
                        if (index % 3 == 0) {
                            var newArr = [];
                            newArr.push(item);
                            me.alarmTypeList.push(newArr);
                        } else {
                            me.alarmTypeList[me.alarmTypeList.length - 1].push(item);
                        };
                        me.checkboxObj[item.alarmcode] = true;
                    });
                    me.queryWaringMsg();
                }
            })
        },
        getOverdueInfoList: function(groups) {
            var list = [];
            var monthTime = 30 * 24 * 60 * 60 * 1000;
            groups.forEach(function(group) {
                group.devices.forEach(function(device) {
                    if (device.expirenotifytime > 0) {
                        var time = device.expirenotifytime - Date.now();
                        if (time < monthTime) {
                            list.push({
                                devicename: device.devicename,
                                deviceid: device.deviceid,
                                expirenotifytime: device.expirenotifytime,
                                days: time
                            });
                        }
                    }
                });
            });
            list.sort(function(a, b) {
                return b.days - a.days;
            });
            return list;
        }
    },
    components: {
        waringMsg: {
            template: '<Table :height="tabheight" border :columns="columns" :data="waringrecords"></Table>',
            props: ['waringrecords', 'tabletype', 'wrapperheight'],
            data: function() {
                var me = this;
                return {
                    columns: [{
                            title: me.$t("alarm.devName"),
                            key: 'devicename',
                            width: 120,
                        },
                        {
                            title: me.$t("alarm.devNum"),
                            key: 'deviceid',
                            width: 130,
                        },
                        {
                            title: me.$t("alarm.alarmTime"),
                            key: 'lastalarmtimeStr',
                            width: 160
                        },
                        {
                            title: me.$t("alarm.alarmMsg"),
                            key: isZh ? 'stralarm' : 'stralarmen',
                        },
                        {
                            title: me.$t("alarm.alarmCount"),
                            key: 'alarmcount',
                            width: 120
                        },
                        {
                            title: me.$t("alarm.isDispose"),
                            key: 'isdispose',
                            width: 100
                        },
                        {
                            title: me.$t("alarm.action"),
                            key: 'action',
                            width: 120,
                            render: function(h, params, a) {
                                return h('div', [
                                    h(
                                        'Button', {
                                            props: {
                                                type: 'primary',
                                                size: 'small'
                                            },
                                            on: {
                                                click: function() {
                                                    me.$emit('showdisposemodal', params);
                                                }
                                            }
                                        },
                                        me.$t("alarm.alarmDispose")
                                    )
                                ])
                            }
                        }
                    ],
                }
            },
            methods: {
                removeWaring: function(index) {
                    console.log(index)
                },
            },
            watch: {
                tabletype: function() {

                }
            },
            computed: {
                tabheight: function() {
                    return this.wrapperheight - 24;
                }
            },
            mounted: function() {

            }
        },
        deviceMsg: {
            template: '<Table :height="tabheight" border :columns="columns" :data="deviceinfolist"></Table>',
            props: ['deviceinfolist', 'tabletype', 'wrapperheight'],
            data: function() {
                var me = this;
                return {
                    columns: [{
                            title: me.$t("alarm.devName"),
                            width: 200,
                            key: 'devicename'
                        },
                        {
                            title: me.$t("alarm.devNum"),
                            width: 200,
                            key: 'deviceid'
                        },
                        {
                            title: me.$t("alarm.createTime"),
                            key: 'createtimeStr',
                            width: 200,
                        },
                        {
                            title: me.$t("alarm.content"),
                            key: 'content'
                        },
                        {
                            title: me.$t("alarm.action"),
                            key: 'action',
                            width: 120,
                            render: function(h, params) {
                                return h('div', [
                                    h(
                                        'Button', {
                                            props: {
                                                type: 'primary',
                                                size: 'small'
                                            },
                                            on: {
                                                click: function() {
                                                    var devicemsgid = params.row.devicemsgid;
                                                    var url = myUrls.deleteMsg();
                                                    utils.sendAjax(url, { devicemsgid: devicemsgid }, function(resp) {
                                                        if (resp.status === 0) {
                                                            me.$emit('deletemsg', params.row);
                                                        }
                                                    });

                                                }
                                            }
                                        },
                                        me.$t("bgMgr.delete")
                                    )
                                ])

                            }
                        }
                    ]
                }
            },
            computed: {
                tabheight: function() {
                    return this.wrapperheight - 24;
                },
            },
            methods: {

            },
            mounted: function() {

            }
        },
        overdueInfo: {
            template: '<Table :height="tabheight" border :columns="columns" :data="overdueinfolist"></Table>',
            props: ['overdueinfolist', 'tabletype', 'wrapperheight'],
            data: function() {
                var me = this;
                return {
                    columns: [{
                            type: 'index',
                            width: 60
                        },
                        {
                            title: me.$t("alarm.devName"),
                            key: 'devicename'
                        },
                        {
                            title: me.$t("alarm.devNum"),
                            key: 'deviceid'
                        },
                        {
                            title: me.$t("alarm.overdueTime"),
                            render: function(h, params) {
                                var expirenotifytime = params.row.expirenotifytime;
                                return h('span', {}, DateFormat.format(new Date(expirenotifytime), 'yyyy-MM-dd'));
                            }
                        },
                        {
                            title: '到期天数',
                            render: function(h, params) {
                                var mss = params.row.days;
                                var days = parseInt(mss / (1000 * 60 * 60 * 24));
                                var dayStr = "";
                                if (mss > 0) {
                                    dayStr += "剩" + days + "天过期";
                                } else if (mss < 0) {
                                    dayStr += "已过期" + Math.abs(days) + "天";
                                }
                                return h('span', {}, dayStr);
                            }
                        },
                        {
                            title: me.$t("alarm.action"),
                            key: 'action',
                            width: 120,
                            render: function(h, params, a) {
                                return h('div', [
                                    h(
                                        'Button', {
                                            props: {
                                                type: 'primary',
                                                size: 'small'
                                            },
                                            on: {
                                                click: function() {
                                                    communicate.$emit('on-click-expiration', params.row.deviceid);
                                                }
                                            }
                                        },
                                        me.$t("monitor.edit")
                                    )
                                ])
                            }
                        }
                    ]
                }
            },
            computed: {
                tabheight: function() {
                    return this.wrapperheight - 24;
                },
            },
        }
    },
    mounted: function() {
        var me = this;
        // if (this.userType) {
        this.alarmMgr = new AlarmMgr();
        this.settingCheckboxObj();
        this.queryDeviceMsgList();
        this.timingRequestMsg();
        this.queryAlarmDescr();
        this.changeWrapperCls();

        communicate.$on("remindmsg", function(data) {
            me.alarmMgr.addRecord(data);
            me.refreshAlarmToUi();

            if (data.action == 'sound') {
                console.log(data);
                if (me.isMute == false) {
                    for (var i = 0; i < data.actionloopcount; i++) {
                        voiceQueue.push(data.devicename + data.stralarm);
                    }
                    if (voiceQueue.length > 0) {
                        if (isPlayAlarmVoice == false) {
                            utils.playTextVoice(voiceQueue.shift());
                        }
                    }
                }
            }
        });
        communicate.$on("disposeAlarm", function() {
            me.alarmMgr.updateDisposeStatus(me.currentDeviceId, 0);
            me.refreshAlarmToUi();
        });
        communicate.$on("reminddevicemsg", function(data) {
            data.devicename = me.getDeviceName(data.deviceid);
            data.createtimeStr = DateFormat.longToDateTimeStr(data.createtime, timeDifference);
            me.msgListObj.addMsg(data);
            me.overdueDevice = me.msgListObj.getMsgList().reverse();
        });
        communicate.$on("monitorlist", function(groups) {
            me.overdueinfolist = me.getOverdueInfoList(groups);
        });
        // timeout定时器
        var timeout = null;

        window.addEventListener('resize', function() {
                // window.onresize = function () {
                if (timeout != null) {
                    clearTimeout(timeout);
                };
                timeout = setTimeout(function() {
                    me.changeWrapperCls();
                }, 300);
                // }
            })
            // }
    }
}