// 报警组件
var waringComponent = {
    template: document.getElementById('waring-template'),
    data: function () {
        return {
            isLargen: 0,
            index: 1,
            waringRowIndex: null,
            componentName: 'waringMsg',
            waringModal: false,
            disposeModal: false,
            checkboxObj: {},
            waringRecords: [],
            overdueDevice: [],
            alarmTypeList: [],
            alarmCmdList: [[]],
            isWaring: false,
            interval: 10000,
            cmdRowWaringObj: {},
            currentDevTypeCmdList: [],
            disposeAlarm: '',
            params: '', //参数,
            paramsInputList: [],
            paramsInputObj: {},
            wrapperWidth: null,
            wrapperHeight: null,
            waringWraperStyle: { width: '130px', height: '22px' },
            paramsCmdCodeArr: [],
            lastQueryAllAlarmTime: 0,  //查询报警备份的时间
        }
    },
    computed: {
        deviceInfos: function () {
            return this.$store.state.deviceInfos;
        },
        currentDeviceId: function () {
            return this.$store.state.currentDeviceId;
        }
    },
    watch: {
        isLargen: function () {
            this.changeWrapperCls();
        },
        waringRecords: function () {
            if (this.waringRecords.length) {
                this.isWaring = true;
            } else {
                this.isWaring = false;
            }
        },
        disposeModal: function () {
            var me = this
            if (this.disposeModal) {
                var devicetype = this.cmdRowWaringObj.devicetype
                var cmdList = this.$store.state.allCmdList
                var beforeCmdList = []
                cmdList.forEach(function (item) {
                    if (!item.devicetype) {
                        beforeCmdList.push(item)
                    } else {
                        if (item.devicetype == devicetype) {
                            beforeCmdList.push(item)
                        }
                    }
                })
                me.currentDevTypeCmdList = beforeCmdList
                var twoArr = [];
                beforeCmdList.forEach(function (item, index) {
                    if (index % 4 == 0) {
                        twoArr.push([])
                    }
                    twoArr[twoArr.length - 1].push(item);

                })
                this.alarmCmdList = twoArr;

                me.disposeAlarm = beforeCmdList[0].cmdcode;
                me.params = beforeCmdList[0].params;
            }
        },
        disposeAlarm: function () {
            var me = this
            this.currentDevTypeCmdList.forEach(function (item) {
                if (me.disposeAlarm == item.cmdcode) {
                    me.params = item.params;
                }
            })
        },
        params: function () {
            this.paramsInputList = [];
            this.paramsInputObj = {};
            if (this.params) {
                var params = '<params>' + this.params + '</params>';
                var parser = new DOMParser();
                var xmlDoc = parser.parseFromString(params, 'text/xml');
                this.parseXML(xmlDoc);
            };
        }
    },
    methods: {
        changeWrapperCls: function () {
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
                this.wrapperWidth = clientWidth - 295;
                this.wrapperHeight = clientHeight - 65;
            }
            this.setWaringWraperStyle();
        },
        setWaringWraperStyle: function () {
            this.waringWraperStyle = { width: this.wrapperWidth + 'px', height: this.wrapperHeight + 'px' };
        },
        parseXML: function (xmlDoc) {
            this.paramsCmdCodeArr = [];
            var parent = xmlDoc.children[0]
            var children = parent.children
            for (var i = 0; i < children.length; i++) {
                var item = children[i]
                var text = item.innerHTML
                var type = item.getAttribute('type');
                if (type && text) {
                    this.paramsCmdCodeArr.push(type)
                    // this.paramsInputObj[type] = '';
                    this.$set(this.paramsInputObj, type, "");
                    this.paramsInputList.push({ type: type, text: text });
                }
            };

        },
        changeLargen: function (type) {
            this.isLargen = type;
            this.isWaring = false;
        },
        changeLargen2: function () {
            if (this.isLargen == 1) {
                this.isLargen = 2;
            } else if (this.isLargen == 2) {
                this.isLargen = 1;
            }
        },
        changeComponent: function (index) {
            this.index = index
            switch (index) {
                case 1:
                    this.componentName = 'waringMsg'
                    break
                case 2:
                    this.componentName = 'deviceMsg'
                    break
            }
        },
        queryWaringMsg: function () {
            var me = this
            var url = myUrls.queryAlarm();
            this.checkboxObj.lastqueryallalarmtime = me.lastQueryAllAlarmTime;
            utils.sendAjax(url, this.checkboxObj, function (resp) {
                if (resp.status == 0) {
                    me.lastQueryAllAlarmTime = DateFormat.getCurrentUTC();
                    if (resp.records) {
                        resp.records.forEach(function (item) {
                            me.alarmMgr.addRecord(item);
                        });
                        me.refreshAlarmToUi();
                    }
                }
            })
        },
        refreshAlarmToUi: function () {
            var me = this;
            var alarmList = me.alarmMgr.getAlarmList();
            alarmList.forEach(function (item) {
                var deviceid = item.deviceid;
                var deviceInfo = me.$store.state.deviceInfos[deviceid];
                if (deviceInfo) {
                    var deviceName = deviceInfo.devicename;
                    item.devicename = deviceName;
                    item.lastalarmtimeStr = DateFormat.longToDateTimeStr(item.lastalarmtime, 0);
                    item.isdispose = item.disposestatus === 0 ? "未处理" : "已处理";
                };
            });
            me.waringRecords = alarmList;
        },
        filterWaringType: function () {
            this.settingCheckboxObj()
            this.waringModal = true
        },
        settingCheckboxObj: function () {
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
        pushOverdueDeviceInfo: function () {
            var interval = null
            var me = this
            interval = setInterval(function () {
                if (!$.isEmptyObject(me.deviceInfos)) {
                    for (var key in me.deviceInfos) {
                        var item = me.deviceInfos[key]
                        var currentTime = Date.now()
                        var overduetime = item.overduetime
                        var isOverdue = overduetime > currentTime ? false : true
                        if (isOverdue) {
                            me.overdueDevice.push({
                                devicename: item.devicename,
                                deviceid: item.deviceid,
                                overduetime: DateFormat.longToDateTimeStr(overduetime, 0),
                                isoverdue: '已过期'
                            })
                        }
                    }
                    clearInterval(interval)
                }
            }, 1000)
        },
        timingRequestMsg: function () {
            var me = this

            setInterval(function () {
                me.queryWaringMsg();
            }, this.interval)
        },
        disposeMsg: function (data) {
            if (data && data.length) {
                var newArr = []
                for (var i = 0; i < data.length; i++) {
                    var msgTiem = data[i]
                    for (var j = 0; j < this.waringRecords.length; j++) {
                        var waringItem = this.waringRecords[j]
                        if (
                            msgTiem.deviceid == waringItem.deviceid &&
                            msgTiem.arrivedtime !== waringItem.arrivedtime
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
                                            isdispose: '未处理',
                                            messageSerialNo: msgTiem.messageSerialNo,
                                            messageId: msgTiem.messageId
                                        });
                                    }
                                } else if (msgTiem.type == 2) {
                                } else if (msgTiem.type == 3) {
                                } else if (msgTiem.type == 4) {
                                }
                            }
                        }
                    }
                }
                // this.waringRecords = newArr.concat(this.waringRecords);
            }
        },
        saveReqMsgParameter: function () {
            Cookies.set('checkboxObj', this.checkboxObj)
            this.waringModal = false
        },
        showDisposeModalFrame: function (param) {
            this.waringRowIndex = param.index
            var deviceInfos = this.$store.state.deviceInfos;

            var row = param.row;
            var deviceid = row.deviceid;
            var devicetype = deviceInfos[deviceid].devicetype

            this.cmdRowWaringObj = {
                deviceid: deviceid,
                devicetype: devicetype,
                params: null,
                state: row.state
            }

            this.disposeModal = true;

            console.log('alarmCmdList', this.alarmCmdList);
        },
        sendDisposeWaring: function () {
            var me = this;
            var sendCmdUrl = myUrls.sendCmd();
            // var disposeAlarmUrl = myUrls.disposeAlarm();
            var isHasParams = true;
            var paramsArr = [];
            me.cmdRowWaringObj.cmdcode = this.disposeAlarm;

            me.paramsCmdCodeArr.forEach(function (cmdCode) {
                var val = me.paramsInputObj[cmdCode]
                paramsArr.push(val);
                if (val == '') {
                    isHasParams = false;
                };
            });

            if (!isHasParams) {
                this.$Message.error('所有参数都是必填的');
                return;
            };

            if (this.params && paramsArr.length) {
                this.cmdRowWaringObj.params = paramsArr;
            };

            utils.sendAjax(sendCmdUrl, this.cmdRowWaringObj, function (resp) {
                if (resp.status == 0) {
                    me.disposeModal = false;
                    me.$Message.success("解除成功!");
                    me.alarmMgr.updateDisposeStatus(me.cmdRowWaringObj.deviceid, me.cmdRowWaringObj.state);
                    me.refreshAlarmToUi();
                } else {
                    me.$Message.error(resp.cause);
                }
            })
        },
        queryAlarmDescr: function () {
            var me = this
            var url = myUrls.queryAlarmDescr()
            utils.sendAjax(url, {}, function (resp) {
                if (resp.status == 0) {
                    var records = resp.records
                    records.forEach(function (item, index) {
                        if (index % 3 == 0) {
                            var newArr = []
                            newArr.push(item)
                            me.alarmTypeList.push(newArr)
                        } else {
                            me.alarmTypeList[me.alarmTypeList.length - 1].push(item)
                        }
                        me.checkboxObj[item.alarmcode] = true
                    })
                    me.queryWaringMsg()
                }
            })
        }
    },
    components: {
        waringMsg: {
            template:
                '<Table :height="tabheight" border :columns="columns" :data="waringrecords"></Table>',
            props: ['waringrecords', 'tabletype', 'wrapperheight'],
            data: function () {
                var me = this;
                return {
                    columns: [
                        {
                            title: '设备名称',
                            key: 'devicename',
                            width: 120,
                        },
                        {
                            title: '设备序号',
                            key: 'deviceid',
                            width: 120,
                        },
                        {
                            title: '报警时间',
                            key: 'lastalarmtimeStr',
                            width: 160
                        },
                        {
                            title: '报警信息',
                            key: 'stralarm',
                        },
                        {
                            title: '报警次数',
                            key: 'alarmcount',
                            width: 100
                        },
                        {
                            title: '是否处理',
                            key: 'isdispose',
                            width: 100
                        },
                        {
                            title: '操作',
                            key: 'action',
                            width: 120,
                            render: function (h, params, a) {
                                return h('div', [
                                    h(
                                        'Button',
                                        {
                                            props: {
                                                type: 'primary',
                                                size: 'small'
                                            },
                                            on: {
                                                click: function () {
                                                    // me.removeWaring(index);
                                                    me.$emit('showdisposemodal', params)
                                                }
                                            }
                                        },
                                        '报警处理'
                                    )
                                ])
                            }
                        }
                    ],
                }
            },
            methods: {
                removeWaring: function (index) {
                    console.log(index)
                },
            },
            watch: {
                tabletype: function () {

                }
            },
            computed: {
                tabheight: function () {
                    return this.wrapperheight - 24;
                }
            },
            mounted: function () {

            }
        },
        deviceMsg: {
            template:
                '<Table :height="tabheight" :columns="columns" :data="deviceinfolist"></Table>',
            props: ['deviceinfolist', 'tabletype', 'wrapperheight'],
            data: function () {
                return {
                    columns: [
                        {
                            title: '设备名称',
                            key: 'devicename'
                        },
                        {
                            title: '设备序号',
                            key: 'deviceid'
                        },
                        {
                            title: '过期时间',
                            key: 'overduetime'
                        },
                        {
                            title: '是否过期',
                            key: 'isoverdue'
                        }
                    ]
                }
            },
            computed: {
                tabheight: function () {
                    return this.wrapperheight - 24;
                }
            },
            methods: {

            },
            mounted: function () {

            }
        }
    },
    mounted: function () {
        var me = this;
        this.alarmMgr = new AlarmMgr();
        this.settingCheckboxObj();
        this.pushOverdueDeviceInfo();
        this.timingRequestMsg();
        this.queryAlarmDescr();
        this.changeWrapperCls();
        communicate.$on("remindmsg", function (data) {
            me.alarmMgr.addRecord(data);
            me.refreshAlarmToUi();
        });
        communicate.$on("disposeAlarm", function (cmdCode) {
            me.alarmMgr.updateDisposeStatus(me.currentDeviceId, 0);
            me.refreshAlarmToUi();
        });
        // timeout定时器
        var timeout = null;
        window.onresize = function () {
            if (timeout != null) {
                clearTimeout(timeout);
            };
            timeout = setTimeout(function () {
                me.changeWrapperCls();
            }, 300);
        }
    }
}