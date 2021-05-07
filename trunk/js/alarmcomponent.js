// 报警组件
var waringComponent = {
    template: document.getElementById('waring-template'),
    data: function() {
        return {
            isZh: isZh,
            isMute: false,
            isPopup: false,
            isLargen: 0,
            index: 4,
            waringRowIndex: null,
            componentName: 'emergencyAlarm',
            searchValue: '',
            checkAll: false,
            disposeModal: false,
            settingModal: false,
            checkboxObj: {},
            waringRecords: [],
            overdueDevice: [],
            alarmTypeList: [],
            emergencyAlarmList: [],
            overdueinfolist: [],
            mediaFileLists: [],
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
        searchValue: function(newVal) {
            if (newVal.length == 0) {
                this.alarmTypeList.forEach(function(item) {
                    item.show = true;
                });
            } else {
                this.alarmTypeList.forEach(function(item) {
                    if (isZh) {
                        if (item.alarmname.indexOf(newVal) != -1) {
                            item.show = true;
                        } else {
                            item.show = false;
                        }
                    } else {
                        if (item.alarmnameen.indexOf(newVal) != -1) {
                            item.show = true;
                        } else {
                            item.show = false;
                        }
                    }

                });
            }
        },
        isMute: function() {
            if (this.lock) return;
            this.setForceAlarm(true, true);
        },
        isPopup: function() {
            if (this.lock) return;
            this.setForceAlarm(true, true);
        },
        settingModal: function(newVal) {
            if (newVal) {
                var checkboxObjLength = this.checkboxObjLength;
                for (var i = 0; i < checkboxObjLength; i++) {
                    this.checkboxObj[i] = gForcealarm.charAt(i) == '1' ? true : false;
                }
            }
        }
    },
    methods: {
        checkingSelectState: function() {
            var me = this;
            setTimeout(function() {
                var isCheckAll = true;
                for (var i = 0; i < alarmTypeList.length; i++) {
                    var result = me.checkboxObj[i];
                    if (!result) {
                        isCheckAll = false;
                        break;
                    }
                }
                me.checkAll = isCheckAll;
            }, 300)
        },
        onCheckAll: function() {
            var me = this;
            this.checkAll = !this.checkAll;
            for (var key in me.checkboxObj) {
                me.checkboxObj[key] = this.checkAll;
            }
        },
        getIsWaring: function() {
            var isWaring = false;
            var waringRecords = this.waringRecords;
            for (var index = 0; index < waringRecords.length; index++) {
                var item = waringRecords[index];
                if (item.disposestatus == 0) {
                    isWaring = true;
                    break;
                }
            }
            return isWaring;
        },
        changeWrapperCls: function() {
            var type = this.isLargen;
            if (type === 0) {

                this.wrapperWidth = 130;
                this.wrapperHeight = 22;

            } else if (type === 1) {
                var clientWidth = document.documentElement.clientWidth || document.body.clientWidth;
                this.wrapperWidth = clientWidth - 320;
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
            // this.isWaring = false;
        },
        changeLargen2: function() {
            if (this.isLargen == 1) {
                this.isLargen = 2;
            } else if (this.isLargen == 2) {
                this.isLargen = 1;
            }
        },
        getForceAlarmData: function() {
            var str = "";

            var checkboxObjLength = this.checkboxObjLength;
            for (var i = 0; i < checkboxObjLength; i++) {
                var val = this.checkboxObj[i];
                if (val) {
                    str += "1";
                } else {
                    str += "0";
                }
            }
            return str;
        },
        setAlarmAction: function() {
            var alarmaction = Number(localStorage.getItem("alarmaction"));
            if ((alarmaction & 0x01) == 1) {
                this.isMute = true;
            }
            if ((alarmaction & 0x02) == 2) {
                this.isPopup = true;
            }
        },
        setForceAlarmClick: function() {
            gForcealarm = this.getForceAlarmData();
            this.setForceAlarm(true, false);
        },
        setForceAlarm: function(e, tip) {
            var me = this;
            var url = myUrls.setForceAlarm();
            var forcealarm = gForcealarm; //this.getForceAlarmData();
            var alarmaction = 0x0;
            if (this.isMute) {
                alarmaction = alarmaction | 0x01;
            }

            if (this.isPopup) {
                alarmaction = alarmaction | 0x02;
            }

            if (this.isMute && this.isPopup) {
                alarmaction = alarmaction | 0x03;
            }

            var data = {
                forcealarm: forcealarm,
                alarmaction: alarmaction,
                updatemask: 0x01 | 0x02
            }
            utils.sendAjax(url, data, function(resp) {
                if (resp.status === 0) {
                    gForcealarm = data.forcealarm;
                    localStorage.setItem("forcealarm", data.forcealarm);
                    localStorage.setItem("alarmaction", data.alarmaction);
                    !tip && me.$Message.success('设置成功');
                } else {
                    !tip && me.$Message.error('设置失败');
                }
            });
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
                case 4:
                    this.componentName = 'emergencyAlarm'
                    break;
                case 5:
                    this.componentName = 'mediaFiles'
                    break;
            }
        },
        queryWaringMsg: function() {
            if (!$.isEmptyObject(this.deviceInfos)) {
                var me = this;
                var url = myUrls.queryAlarm();
                utils.sendAjax(url, { lastqueryallalarmtime: me.lastQueryAllAlarmTime }, function(resp) {
                    if (resp.status == 0) {
                        if (resp.records) {
                            resp.records.forEach(function(item) {
                                me.alarmMgr.addRecord(item);
                            });
                            me.queryAlarmAudioTip(resp.records);
                            me.refreshAlarmToUi();
                        }
                        me.lastQueryAllAlarmTime = resp.lastqueryallalarmtime;
                    }
                })
            }
        },
        queryLastDeviceMedias: function() {
            if (!$.isEmptyObject(this.deviceInfos)) {
                var me = this;
                var url = myUrls.queryLastDeviceMedias();
                utils.sendAjax(url, { lastquerydevicemediastime: me.lastquerydevicemediastime }, function(resp) {
                    if (resp.status == 0) {
                        var records = resp.records;
                        if (records) {
                            var mediaFileLists = deepClone(me.mediaFileLists);
                            records.forEach(function(item) {
                                var device = me.deviceInfos[item.deviceid];
                                var callon = item.callon.toFixed(5);
                                var callat = item.callat.toFixed(5);

                                if (device) {
                                    item.devicename = device.devicename;
                                } else {
                                    item.devicename = item.deviceid;
                                }

                                item.address = LocalCacheMgr.getAddress(callon, callat);
                                item.callon = callon;
                                item.callat = callat;
                            });
                            var newMediaFileLists = mediaFileLists.concat(records);
                            newMediaFileLists.sort(function(a, b) {
                                return b.endtime - a.endtime;
                            });
                            me.mediaFileLists = newMediaFileLists.delRepeat('endtime');
                        }
                        me.lastquerydevicemediastime = resp.lastquerydevicemediastime;
                    }
                })
            }
        },
        queryAlarmAudioTip: function(records) {
            var me = this;
            if (records && records.length) {
                for (var i = 0; i < records.length; i++) {
                    var item = records[i];
                    if (me.isNeedForceAlarm(item.alarmbitsstr)) {
                        if (me.isMute) {
                            audio.play().then(function() {
                                console.log('可以自动播放')
                            }).catch(function(err) {
                                // 不支持自动播放
                                console.log('不支持自动播放')
                            })
                        }
                        if (me.isPopup) {
                            var deviceInfo = me.$store.state.deviceInfos[item.deviceid];
                            var desc = '';
                            var alarm = isZh ? item.stralarm : item.stralarmen;
                            if (deviceInfo) {
                                desc = DateFormat.longToDateTimeStr(item.lastalarmtime, timeDifference) + "<br/>" + deviceInfo.devicename + " : " + alarm;
                            } else {
                                desc = DateFormat.longToDateTimeStr(item.lastalarmtime, timeDifference) + "<br/>" + item.deviceid + " : " + alarm;
                            }
                            me.$Notice.warning({
                                title: isZh ? '设备报警提醒' : 'Device alarm',
                                duration: 6,
                                desc: desc
                            });
                        }
                        break;
                    }
                }
            }
        },
        refreshAlarmToUi: function() {
            var me = this;
            var alarmList = me.alarmMgr.getAlarmList();
            var emergencyAlarmList = [];
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
                if (me.isNeedForceAlarm(item.alarmbitsstr)) {
                    emergencyAlarmList.push(item);
                }
            });
            me.waringRecords = alarmList;
            me.emergencyAlarmList = emergencyAlarmList;
            me.isWaring = me.getIsWaring();
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
                me.queryLastDeviceMedias();
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
        showDisposeModalFrame: function(param) {
            console.log('showDisposeModalFrame', param);
            this.waringRowIndex = param.index;
            var deviceInfos = this.$store.state.deviceInfos;

            var row = param.row;
            var deviceid = row.deviceid;
            var devicetype = deviceInfos[deviceid].devicetype;

            this.cmdRowWaringObj = {
                deviceid: deviceid,
                devicetype: devicetype,
                params: null,
                state: row.state,
                alarm: row.alarm
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
                    var records = resp.records;
                    records.forEach(function(item, index) {
                        item.show = true;
                        alarmTypeList.push(item);
                        me.checkboxObj[item.index] = false;
                    });
                    me.checkboxObjLength = records.length;
                    me.alarmTypeList = alarmTypeList;
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
        },
        isNeedForceAlarm: function(alarmBitsStr) {
            var result = false;
            if (alarmBitsStr && gForcealarm) {
                var alarmLength = alarmBitsStr.length;
                var gForcealarmLength = gForcealarm.length;
                var minLength = Math.min(alarmLength, gForcealarmLength);
                for (var i = 0; i < minLength; ++i) {
                    var alarmBit = alarmBitsStr.charAt(i);
                    var forceAlarmBit = gForcealarm.charAt(i);

                    if (forceAlarmBit == '1' && alarmBit == '1') {
                        result = true;
                        break;
                    }
                }
            }
            return result;
        }
    },
    components: {
        waringMsg: {
            template: '<Table size="small" :height="tabheight" border :columns="columns" @on-row-click="onRowClick" :data="waringrecords"></Table>',
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
                            render: function(h, params) {
                                return h('div', [
                                    h(
                                        'Button', {
                                            props: {
                                                type: 'primary',
                                                size: 'small'
                                            },
                                            on: {
                                                click: function(e) {
                                                    e.stopPropagation();
                                                    e.preventDefault();
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
                onRowClick: function(row) {
                    vRoot.$children[1].selectedDev(row);
                    communicate.$emit("on-click-marker", row.deviceid);
                }
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
        },
        deviceMsg: {
            template: '<Table size="small" :height="tabheight" border :columns="columns" @on-row-click="onRowClick" :data="deviceinfolist"></Table>',
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
                                                click: function(e) {
                                                    e.stopPropagation();
                                                    e.preventDefault();
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
                onRowClick: function(row) {
                    vRoot.$children[1].selectedDev(row);
                    communicate.$emit("on-click-marker", row.deviceid);
                }
            },
            mounted: function() {

            }
        },
        emergencyAlarm: {
            template: '<Table size="small" :height="tabheight" border :columns="columns" @on-row-click="onRowClick" :data="emergencyAlarmList"></Table>',
            props: ['emergencyAlarmList', 'tabletype', 'wrapperheight'],
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
            computed: {
                tabheight: function() {
                    return this.wrapperheight - 24;
                }
            },
            methods: {
                onRowClick: function(row) {
                    vRoot.$children[1].selectedDev(row);
                    communicate.$emit("on-click-marker", row.deviceid);
                }
            },
        },
        mediaFiles: {
            template: '<Table size="small" :height="tabheight" border :columns="columns" highlight-row  :data="mediaFileList" @on-row-click="onRowClick"></Table>',
            props: ['mediaFileList', 'tabletype', 'wrapperheight'],
            data: function() {
                var me = this;
                return {
                    columns: [{
                            type: 'index',
                            width: 60,
                        },
                        {
                            title: me.$t("alarm.devName"),
                            key: 'devicename',
                            width: 160,
                        },
                        {
                            title: me.$t("alarm.devNum"),
                            key: 'deviceid',
                            width: 130,
                        },
                        {
                            title: me.$t("alarm.fileType"),
                            key: 'fileext',
                            width: 100,
                        },
                        {
                            title: me.$t("monitor.channel"),
                            key: 'channelid',
                            width: 80,
                        },
                        {
                            title: me.$t("alarm.alarmType"),
                            key: 'eventcode',
                            width: 150,
                            render: function(h, params) {
                                var eventcode = params.row.eventcode;
                                var str = '';
                                switch (eventcode) {
                                    case 0:
                                        str = me.$t("alarm.terraceIssued");
                                        break;
                                    case 1:
                                        str = me.$t("alarm.timingAction");
                                        break;
                                    case 2:
                                        str = me.$t("alarm.robberyReport");
                                        break;
                                    case 3:
                                        str = me.$t("alarm.impactRollover");
                                        break;
                                    default:
                                        str = me.$t("alarm.retain");
                                }
                                return h('span', {}, str);
                            }
                        },
                        {
                            title: me.$t("alarm.receivingTime"),
                            key: 'endtime',
                            width: 150,
                            render: function(h, params) {
                                var endtime = params.row.endtime;
                                return h('span', {}, DateFormat.longToDateTimeStr(endtime, timeDifference))
                            }
                        },
                        {
                            title: vRoot.$t("reportForm.address"),
                            render: function(h, params) {
                                var row = params.row;
                                var lat = Number(row.callat);
                                var lon = Number(row.callon);
                                if (lat && lon) {
                                    if (row.address == null) {
                                        return h('Button', {
                                            props: {
                                                type: 'error',
                                                size: 'small'
                                            },
                                            on: {
                                                click: function(e) {
                                                    e.stopPropagation();
                                                    e.preventDefault();
                                                    utils.getJiuHuAddressSyn(lon, lat, function(resp) {
                                                        if (resp && resp.address) {
                                                            vRoot.$children[2].mediaFileLists[params.index].address
                                                            LocalCacheMgr.setAddress(lon, lat, resp.address);
                                                        }
                                                    })
                                                }
                                            }
                                        }, lon + "," + lat)

                                    } else {
                                        return h('span', {}, row.address);
                                    }
                                } else {
                                    return h('span', {}, vRoot.$t("reportForm.empty"));
                                }
                            },
                        },
                        {
                            title: vRoot.$t("alarm.action"),
                            width: 105,
                            render: function(h, params) {
                                var row = params.row;
                                return h(
                                    "Button", {
                                        props: {
                                            type: "primary",
                                            size: 'small',
                                        },
                                        on: {
                                            click: function(e) {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                me.clickImage(row);
                                            }
                                        }
                                    },
                                    me.$t('reportForm.viewPicture')
                                )
                            },
                        }
                    ],
                }
            },
            computed: {
                tabheight: function() {
                    return this.wrapperheight - 24;
                }
            },
            methods: {
                onRowClick: function(row) {
                    vRoot.$children[1].selectedDev(row);
                    communicate.$emit("on-click-marker", row.deviceid);

                },
                clickImage: function(row) {
                    vRoot.$children[1].cameraImgUrl = row.url
                    vRoot.$children[1].cameraImgDeviceTime = row.endtime;
                    vRoot.$children[1].cameraImgModal = true;

                }

            },
        },
        overdueInfo: {
            template: '<Table size="small" :height="tabheight" border :columns="columns" @on-row-click="onRowClick" :data="overdueinfolist"></Table>',
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
                            title: me.$t("alarm.maturityDays"),
                            render: function(h, params) {
                                var mss = params.row.days;
                                var days = parseInt(mss / (1000 * 60 * 60 * 24));
                                var dayStr = "";
                                if (mss > 0) {
                                    if (isZh) {
                                        dayStr += "剩" + days + "天过期";
                                    } else {
                                        dayStr += days + " days to expire";
                                    }

                                } else if (mss < 0) {
                                    if (isZh) {
                                        dayStr += "已过期" + Math.abs(days) + "天";
                                    } else {
                                        dayStr += Math.abs(days) + " days overdue";
                                    }

                                }
                                return h('span', {}, dayStr);
                            }
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
                                                click: function(e) {
                                                    e.stopPropagation();
                                                    e.preventDefault();
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
            methods: {
                onRowClick: function(row) {
                    vRoot.$children[1].selectedDev(row);
                    communicate.$emit("on-click-marker", row.deviceid);
                }
            },
        }
    },
    mounted: function() {
        var me = this;
        this.lock = true;
        this.alarmMgr = new AlarmMgr();
        this.queryDeviceMsgList();
        this.timingRequestMsg();
        this.queryAlarmDescr();
        this.changeWrapperCls();
        this.setAlarmAction();
        setTimeout(function() {
            me.lock = false;
        }, 1000)
        this.lastquerydevicemediastime = 0;
        communicate.$on("remindmsg", function(data) {
            me.alarmMgr.addRecord(data);
            me.refreshAlarmToUi();
            if (me.isNeedForceAlarm(data.alarmbitsstr)) {
                if (me.isMute) {
                    audio.play().then(function() {
                        console.log('可以自动播放')
                    }).catch(function(err) {
                        // 不支持自动播放
                        console.log('不支持自动播放')
                    });
                }
                if (me.isPopup) {
                    var alarm = isZh ? data.stralarm : data.stralarmen;
                    me.$Notice.warning({
                        title: isZh ? '设备报警提醒' : 'Alarm Notice',
                        duration: 6,
                        desc: data.lastalarmtimeStr + "<br/>" + data.devicename + " : " + alarm
                    });
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
            me.overdueinfolist = me.getOverdueInfoList(groups).slice(0, 100);
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