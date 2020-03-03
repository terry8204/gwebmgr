
// baidu: 'http://api.map.baidu.com/api?v=3.0&ak=e7SC5rvmn2FsRNE4R1ygg44n',
// textIconoverlay: getPath + 'textIconoverlay_min.js',
// distancetool: getPath + 'distancetool_min.js',
// bmarkerclusterer: getPath + "markerclusterer.js",

// google: "http://ditu.google.cn/maps/api/js?v=3.1&sensor=false&language=cn&key=AIzaSyDXQKVS1Tdp3VlrzBsZbBlLj_uYHVDHe6M",
// gmarkerclusterer: getPath + "gmarkerclusterer.js",
// markerwithlabel: getPath + "markerwithlabel.js",

// <!-- <script type="text/javascript" src="http://api.map.baidu.com/library/DistanceTool/1.2/src/DistanceTool_min.js"></script> -->
//     <!-- <script src="http://api.map.baidu.com/api?v=3.0&ak=e7SC5rvmn2FsRNE4R1ygg44n"></script> -->
//     <!-- <script type="text/javascript" src="http://api.map.baidu.com/library/TextIconOverlay/1.2/src/TextIconOverlay_min.js"></script> -->
//     <!-- <script src="js/textIconoverlay_min.js"></script>
//     <script src="js/distancetool_min.js"></script>
//     <script src="js/markerclusterer.js"></script> -->
//     <!-- <script src="http://ditu.google.cn/maps/api/js?v=3.1&sensor=false&language=cn&key=AIzaSyDXQKVS1Tdp3VlrzBsZbBlLj_uYHVDHe6M" type="text/javascript"></script>
//     <script src="js/gmarkerclusterer.js"></script>
//     <script src="js/markerwithlabel.js"></script> -->
var isLoadLastPositon = false;
// 定位监控
var monitor = {
    template: document.getElementById('monitor-template').innerHTML,
    data: function () {
        var vm = this;
        return {
            cmdSettings: {},
            placeholder: "",
            isLoadGroup: true,
            isSpin: true,
            isShowRecordBtn: false,
            isShowBmsBtn: false,
            isShowObdBtn: false,
            isShowWeightBtn: false,
            isShowWatermeterBtn: false,
            isShowVideoBtn: false,
            isShowActiveSafetyBtn: false,
            map: null,
            placement: "right-start",
            mapType: mapType ? mapType : 'bMap',
            mapList: [
                { label: isZh ? "百度地图" : "BaiduMap", value: "bMap" },
                { label: isZh ? "谷歌地图" : "GoogleMap", value: "gMap" },
                { label: "OpenStreeMap", value: "oMap" },
            ],
            sosoValue: '', // 搜索框的值
            sosoData: [], // 搜索框里面的数据
            openGroupIds: {},
            openCompanyIds: {},
            selectedState: 'all', // 选择nav的状态 all online offline;
            companys: [], //公司名称id
            groups: [], // 原始列表数据
            intervalTime: null, // 多久刷新一次设备
            offlineTime: 10 * 60 * 1000, // 根据这个时间算出是否离线
            allDevCount: 0, // 全部设备的个数
            onlineDevCount: 0, // 在线设备个数
            offlineDevCount: 0, // 离线设备个数
            isMoveTriggerEvent: true, // 地图移动是否触发事件
            intervalInstanse: null, // 定时器实例
            selectedDevObj: {}, // 选中的设备信息
            myDis: null, // 测距实例
            filterData: [],
            timeoutIns: null,
            isShowMatchDev: false,
            editDevModal: false,          // 编辑设备模态
            dispatchDirectiveModal: false, // 下发指令模态
            deviceInfoModal: false,   // 设备基本信息模态
            directiveReportModal: false,//指令记录
            currentDeviceName: "",
            editDevData: {       //编辑的设备信息
                devicename: '',
                simnum: '',
                deviceid: '',
                remark: ''
            },
            currentDeviceType: null,  // 选中设备的类型
            currentDevDirectiveList: [],  // 选中设备的类型对应的设备指令
            selectedCmdInfo: {},  // 选中设备指令的信息
            cmdParams: {},
            deviceBaseInfo: {},
            loading: false,
            selectedTypeVal: null,
            cacheColumns: [
                { title: isZh ? '编号' : 'index', key: "index", width: 90, align: 'center', sortable: true },
                { title: isZh ? '设备序号' : 'Device Number', key: 'deviceid' },
                { title: isZh ? '指令名称' : 'Cmd name', key: 'cmdname', sortable: true },
                { title: isZh ? '发送时间' : 'Send date', key: 'sendtimeStr', width: 170, sortable: true },
                { title: isZh ? '发送参数' : 'Send parmas', key: 'cmdparams', sortable: true },
                {
                    title: isZh ? '操作' : "Action",
                    key: 'action',
                    width: 100,
                    // align: 'center',
                    render: function (h, params) {
                        return h('div', [
                            h('Poptip', {
                                props: {
                                    confirm: true,
                                    title: isZh ? '确定取消吗?' : "cancelled ?"
                                },
                                on: {
                                    'on-ok': function () {
                                        var url = myUrls.deleteCacheCmd();
                                        utils.sendAjax(url, { cachecmdid: params.row.cachecmdid }, function (resp) {
                                            if (resp.status == 0) {
                                                vm.$Message.success(isZh ? "取消成功" : "Cancel successfully");
                                                vm.cacheTableData.splice(params.index, 1);
                                                vm.cacheTableData.forEach(function (item, index) {
                                                    item.index = ++index;
                                                });
                                            } else if (resp.status == 1) {
                                                vm.$Message.error(isZh ? "取消失败" : "Cancel fail");
                                            }
                                        })
                                    }
                                }
                            }, [
                                    h('Button', {
                                        props: {
                                            type: 'primary',
                                            size: 'small'
                                        }
                                    }, isZh ? "取消" : "Cancel")
                                ])
                        ]);
                    },
                }
            ],
            sendColumns: [
                { title: isZh ? '编号' : 'index', key: "index", width: 90, align: 'center', sortable: true },
                { title: isZh ? '设备序号' : '', key: 'deviceid' },
                { title: isZh ? '指令名称' : 'Cmd name', key: 'cmdname', sortable: true },
                { title: isZh ? '发送时间' : 'Send date', key: 'sendtimeStr', width: 170, sortable: true },
                { title: isZh ? '发送参数' : 'Send Params ', key: 'cmdparams', sortable: true },
                { title: isZh ? '结果' : 'Result', key: 'result', sortable: true },
            ],
            cacheTableData: [],
            sendTableData: [],
            cmdPwd: null,  //指令密码
            lastquerypositiontime: 0
        }
    },
    methods: {
        initMap: function () {
            var me = this;
            switch (this.mapType) {
                case 'bMap':
                    try {
                        BMap ? this.map = new BMapClass() : '';
                        me.isSpin = false;
                        (function poll1 () {
                            isLoadLastPositon ? me.map.setMarkerClusterer(me.positionLastrecords) : setTimeout(poll1, 4);
                        }());
                    } catch (error) {
                        me.isSpin = true;
                        asyncLoadJs('baidu', function () {
                            (function poll2 () {
                                if (isLoadBMap && isLoadLastPositon) {
                                    asyncLoadJs('distancetool', function () {
                                        asyncLoadJs('textIconoverlay', function () {
                                            asyncLoadJs('bmarkerclusterer', function () {
                                                me.isSpin = false;
                                                me.map = new BMapClass();
                                                me.map.setMarkerClusterer(me.positionLastrecords);
                                            });
                                        });
                                    });
                                } else {
                                    setTimeout(poll2, 4);
                                }
                            }());
                        });

                    }
                    break;
                case 'gMap':
                    try {
                        google ? this.map = new GoogleMap() : '';
                        me.isSpin = false;
                        (function poll3 () {
                            isLoadLastPositon ? me.map.setMarkerClusterer(me.positionLastrecords) : setTimeout(poll3, 4);
                        }());
                    } catch (error) {
                        me.isSpin = true;
                        asyncLoadJs('google', function () {
                            asyncLoadJs('markerwithlabel', function () {
                                asyncLoadJs('gmarkerclusterer', function () {
                                    (function poll4 () {
                                        if (isLoadLastPositon && google) {
                                            me.isSpin = false;
                                            me.map = new GoogleMap();
                                            me.map.setMarkerClusterer(me.positionLastrecords);
                                        } else {
                                            setTimeout(poll4, 100);
                                        }
                                    }());
                                });
                            });
                        });
                    }
                    break;
                case 'oMap':
                    (function poll4 () {
                        if (isLoadLastPositon) {
                            me.isSpin = false;
                            me.map = new OpenStreeMapCls();
                            me.$nextTick(function () {
                                me.map.setMarkerClusterer(me.positionLastrecords);
                            })
                        } else {
                            setTimeout(poll4, 100);
                        }
                    }());
                    break;
            };

        },
        handleWebSocket: function (data) {
            var me = this;
            var deviceid = data.deviceid;
            data.devicename = this.deviceInfos[deviceid] ? this.deviceInfos[deviceid].devicename : "";
            me.positionLastrecords[deviceid] = data;
            me.updateTreeOnlineState();
            me.updateDevLastPosition(data);
            // console.log('轨迹push', deviceid, DateFormat.longToDateTimeStr(data.updatetime, 0));
            if (me.currentDeviceId == deviceid) {
                me.map && me.map.updateSingleMarkerState(deviceid);
            };
        },
        openDistance: function () {
            if (this.myDis != null) {
                this.myDis.close();
            }
            if (this.mapType == 'bMap') {
                this.myDis = new BMapLib.DistanceTool(this.map.mapInstance);
                this.myDis.open();
            }
        },
        handleClickMore: function (name) {
            switch (name) {
                case 'cmdrecord':
                    this.directiveReportModal = true;
                    this.queryAllCmdRecords();
                    break;
                case 'recordform':
                    this.$emit("jump-report", "reportForm");
                    break;
                case 'devbaseinfo':
                    this.queryDeviceBaseInfo();
                    this.deviceInfoModal = true;
                    break;
                case 'luyin':
                    window.open("record.html?deviceid=" + this.currentDeviceId);
                    break;
                case 'alarmList':
                    isToAlarmListRecords = true;
                    this.$emit("jump-report", "reportForm");
                    break;
                case 'phoneAlarm':
                    isToPhoneAlarmRecords = true;
                    this.$emit("jump-report", "reportForm");
                    break;
                case 'bms':
                    open('bmssys.html?deviceid=' + this.currentDeviceId);
                    break;
                case 'obd':
                    window.open("obd.html?deviceid=" + this.currentDeviceId);
                    break;
                case 'weight':
                    window.open("weighing.html?deviceid=" + this.currentDeviceId + "&token=" + token);
                    break;
                case 'watermeter':
                    alert('watermeter');
                    break;
                case 'camera':

                    break;
                case 'video':
                    window.open(
                        myUrls.hosts + "video.html?deviceid=" +
                        this.currentDeviceId + "&maptype=" +
                        this.mapType + "&token=" +
                        token + '&name=' + encodeURIComponent(this.deviceInfos[this.currentDeviceId].devicename) +
                        '&activesafety=' + (this.isShowActiveSafetyBtn ? 1 : 0)
                    );
                    break;
            }
        },
        queryDeviceBaseInfo: function () {
            this.deviceBaseInfo = {};
            var me = this;
            var url = myUrls.queryDeviceBaseInfo();
            var data = {
                deviceid: globalDeviceId
            };
            utils.sendAjax(url, data, function (resp) {
                resp.overdueDateStr = DateFormat.longToDateStr(resp.overduetime, 0);
                me.deviceBaseInfo = resp;
            })
        },
        handleClickDirective: function (cmdCode) {
            this.cmdParams = {};
            this.selectedCmdInfo = {};
            this.cmdPwd = null;
            var cmdInfo = null;
            var me = this;
            var cmdVal = this.cmdSettings[cmdCode];
            this.currentDevDirectiveList.forEach(function (cmd) {
                if (cmd.cmdcode == cmdCode) {
                    cmdInfo = cmd;
                }
            });
            console.log('cmdVal', cmdVal);
            this.selectedCmdInfo.cmdName = cmdInfo.cmdname;
            this.selectedCmdInfo.cmdcode = cmdInfo.cmdcode;
            this.selectedCmdInfo.cmddescr = cmdInfo.cmddescr;
            this.selectedCmdInfo.cmdpwd = cmdInfo.cmdpwd;
            this.selectedCmdInfo.type = cmdInfo.cmdtype;

            if (cmdInfo.params) {

                var paramsXMLObj = utils.parseXML(cmdInfo.params);
                // this.selectedCmdInfo.type = paramsXMLObj.type;
                console.log('cmdVal', cmdVal);
                this.selectedCmdInfo.params = paramsXMLObj.paramsListObj;

                this.selectedCmdInfo.params.forEach(function (param, index) {
                    if (cmdVal && cmdVal.length && cmdVal[0]) {
                        if (cmdInfo.cmdtype === 'timeperiod') {
                            me.cmdParams[param.type] = cmdVal[index].split("-");
                        } else if (cmdInfo.cmdtype === 'remind') {
                            me.cmdParams[param.type] = me.parserToRemindJson(cmdVal[index]);
                        } else if (cmdInfo.cmdtype === 'weektime') {
                            me.cmdParams[param.type] = me.parserToWeekTimeJson(cmdVal[index]);
                        } else {
                            me.cmdParams[param.type] = cmdVal[index];
                        }
                    } else {
                        if (cmdInfo.cmdtype === 'timeperiod') {
                            var timerArr = param.value ? param.value.split("-") : ["00:00", "00:00"];
                            me.cmdParams[param.type] = timerArr;
                        } else if (cmdInfo.cmdtype === 'remind') {
                            var remindJson = me.parserToRemindJson(param.value);
                            me.cmdParams[param.type] = remindJson;
                        } else if (cmdInfo.cmdtype === 'weektime') {
                            me.cmdParams[param.type] = me.parserToWeekTimeJson(param.value);
                        } else {
                            me.cmdParams[param.type] = param.value;
                        }

                    }
                });


                (cmdInfo.cmdtype !== 'text' || cmdInfo.cmdtype === 'timeperiod') ? this.selectedTypeVal = (cmdVal ? cmdVal[0] : "") : '';
            };

            this.dispatchDirectiveModal = true;
        },
        parserToWeekTimeJson: function (value) {
            var valueArr = value.split("-"),
                remindJson = {
                    time: valueArr[0],
                    weekselected: []
                };
            var weekStr = valueArr[1];
            var week1 = weekStr.charAt(0) == 1 ? '一' : false;
            var week2 = weekStr.charAt(1) == 1 ? '二' : false;
            var week3 = weekStr.charAt(2) == 1 ? '三' : false;
            var week4 = weekStr.charAt(3) == 1 ? '四' : false;
            var week5 = weekStr.charAt(4) == 1 ? '五' : false;
            var week6 = weekStr.charAt(5) == 1 ? '六' : false;
            var week7 = weekStr.charAt(6) == 1 ? '日' : false;

            week1 && remindJson.weekselected.push(week1);
            week2 && remindJson.weekselected.push(week2);
            week3 && remindJson.weekselected.push(week3);
            week4 && remindJson.weekselected.push(week4);
            week5 && remindJson.weekselected.push(week5);
            week6 && remindJson.weekselected.push(week6);
            week7 && remindJson.weekselected.push(week7);

            return remindJson;
        },
        parserToRemindJson: function (value) {
            var valueArr = value.split("-"),
                len = valueArr.length,
                remindJson = {};

            remindJson.time = valueArr[0];
            remindJson.switch = valueArr[1] == 1 ? true : false;
            remindJson.type = valueArr[2];
            remindJson.weekselected = [];
            if (len === 4) {
                var weekStr = valueArr[3];
                var week1 = weekStr.charAt(0) == 1 ? '一' : false;
                var week2 = weekStr.charAt(1) == 1 ? '二' : false;
                var week3 = weekStr.charAt(2) == 1 ? '三' : false;
                var week4 = weekStr.charAt(3) == 1 ? '四' : false;
                var week5 = weekStr.charAt(4) == 1 ? '五' : false;
                var week6 = weekStr.charAt(5) == 1 ? '六' : false;
                var week7 = weekStr.charAt(6) == 1 ? '日' : false;

                week1 && remindJson.weekselected.push(week1);
                week2 && remindJson.weekselected.push(week2);
                week3 && remindJson.weekselected.push(week3);
                week4 && remindJson.weekselected.push(week4);
                week5 && remindJson.weekselected.push(week5);
                week6 && remindJson.weekselected.push(week6);
                week7 && remindJson.weekselected.push(week7);
            }
            return remindJson;
        },
        encodeWeekTimeParams: function (paramsObj) {

            var resultArr = [];
            for (var key in paramsObj) {
                var item = paramsObj[key];
                var weekStr = "",
                    weekArr = item.weekselected;

                weekArr.indexOf("一") !== -1 ? weekStr += '1' : weekStr += '0';
                weekArr.indexOf("二") !== -1 ? weekStr += '1' : weekStr += '0';
                weekArr.indexOf("三") !== -1 ? weekStr += '1' : weekStr += '0';
                weekArr.indexOf("四") !== -1 ? weekStr += '1' : weekStr += '0';
                weekArr.indexOf("五") !== -1 ? weekStr += '1' : weekStr += '0';
                weekArr.indexOf("六") !== -1 ? weekStr += '1' : weekStr += '0';
                weekArr.indexOf("日") !== -1 ? weekStr += '1' : weekStr += '0';
                resultArr.push(item.time + "-" + weekStr);
            }
            return resultArr;
        },
        encodeRemindParams: function (paramsObj) {
            var resultArr = [];
            for (var key in paramsObj) {
                var item = paramsObj[key];
                if (item.type == '3') {
                    var weekStr = "",
                        weekArr = item.weekselected;
                    weekArr.indexOf("一") !== -1 ? weekStr += '1' : weekStr += '0';
                    weekArr.indexOf("二") !== -1 ? weekStr += '1' : weekStr += '0';
                    weekArr.indexOf("三") !== -1 ? weekStr += '1' : weekStr += '0';
                    weekArr.indexOf("四") !== -1 ? weekStr += '1' : weekStr += '0';
                    weekArr.indexOf("五") !== -1 ? weekStr += '1' : weekStr += '0';
                    weekArr.indexOf("六") !== -1 ? weekStr += '1' : weekStr += '0';
                    weekArr.indexOf("日") !== -1 ? weekStr += '1' : weekStr += '0';
                    resultArr.push(item.time + "-" + (item.switch ? '1' : '0') + '-' + item.type + "-" + weekStr)
                } else {
                    resultArr.push(item.time + "-" + (item.switch ? '1' : '0') + '-' + item.type);
                };
            }
            return resultArr;
        },
        queryAllCmdRecords: function () {
            this.loading = true;
            var me = this;
            var url = myUrls.queryAllCmdRecords();
            utils.sendAjax(url, { deviceid: this.currentDeviceId }, function (resp) {

                if (resp.status === 0) {
                    resp.cacherecords.forEach(function (record, index) {
                        record.index = ++index;
                        record.sendtimeStr = DateFormat.longToDateTimeStr(record.cmdtime, 0);
                    });
                    resp.sendrecords.forEach(function (record, index) {
                        record.index = ++index;
                        record.sendtimeStr = DateFormat.longToDateTimeStr(record.cmdtime, 0);
                    });
                    me.cacheTableData = resp.cacherecords;
                    me.sendTableData = resp.sendrecords;
                } else {
                    me.$Message.error(me.$t("queryCmdRecordErr"));
                }
                me.loading = false;
            });
        },

        disposeDirectiveFn: function () {
            var me = this;
            var url = myUrls.sendCmd();
            var params = [];

            switch (this.selectedCmdInfo.type) {
                case 'text':
                    params = Object.values(this.cmdParams);
                    break;
                case 'time':
                    params = Object.values(this.cmdParams);
                    break;
                case 'timeperiod':
                    for (var key in this.cmdParams) {
                        params.push(this.cmdParams[key].join("-"))
                    };
                    break;
                case 'remind':
                    params = this.encodeRemindParams(this.cmdParams);
                    break;
                case 'weektime':
                    params = this.encodeWeekTimeParams(this.cmdParams);
                    break;
                default:
                    params = [this.selectedTypeVal]
            };
            var data = {
                devicetype: this.currentDeviceType,
                cmdcode: this.selectedCmdInfo.cmdcode,
                deviceid: me.currentDeviceId,
                params: params,
                state: -1
            };
            if (this.selectedCmdInfo.cmdpwd && this.selectedCmdInfo.cmdpwd != "") {
                if (this.cmdPwd) {
                    data.cmdpwd = this.cmdPwd;
                } else {
                    me.$Message.error(me.$t("monitor.pwdErr"));
                    return;
                }
            };
            utils.sendAjax(url, data, function (resp) {
                me.cmdSettings[data.cmdcode] = params;
                if (resp.status === 0) {
                    communicate.$emit("disposeAlarm", data.cmdcode);
                    me.$Message.success(me.$t("monitor.sendSucc"));
                    me.dispatchDirectiveModal = false;
                } else if (resp.status === 1) {
                    me.$Message.error(me.$t("monitor.pwdErr"));
                } else if (resp.status === -1) {
                    me.$Message.error(me.$t("monitor.sendCmdAbnormal"));
                } else if (resp.status === 2) {
                    me.$Message.error(me.$t("monitor.sendCmdNoCache"));
                } else if (resp.status === 3) {
                    me.$Message.error(me.$t("monitor.sendCmdAlreadyCache"));
                } else if (resp.status === 4) {
                    me.$Message.error(me.$t("monitor.changePwdSendCmd"));
                }
            });
        },

        focus: function () {
            var me = this;
            if (this.sosoValue.trim()) {
                me.sosoValueChange();
            }
        },
        blur: function () {
            var me = this
            setTimeout(function () {
                me.isShowMatchDev = false;
            }, 300)
        },
        filterMethod: function (value) {
            this.filterData = []
            var me = this;
            value = value.toLowerCase();
            for (var i = 0; i < this.groups.length; i++) {
                var group = this.groups[i]
                if (
                    group.groupname.toLowerCase().indexOf(value) !== -1 ||
                    group.firstLetter.indexOf(value) !== -1 ||
                    group.pinyin.indexOf(value) !== -1
                ) {

                    if (me.selectedState == "all") {
                        group.devices.forEach(function (device) {
                            var isOnline = me.getIsOnline(device.deviceid);
                            device.isOnline = isOnline;
                        })
                        this.filterData.push(group);
                    } else if (me.selectedState == "online") {
                        var cloneGroup = deepClone(group);
                        cloneGroup.devices = [];
                        group.devices.forEach(function (device) {
                            var isOnline = me.getIsOnline(device.deviceid);
                            device.isOnline = isOnline;
                            if (isOnline) {
                                cloneGroup.devices.push(device);
                            }
                        })
                        if (cloneGroup.devices.length > 0) {
                            this.filterData.push(group);
                        }
                    } else if (me.selectedState == "offline") {
                        var cloneGroup = deepClone(group);
                        cloneGroup.devices = [];
                        group.devices.forEach(function (device) {
                            var isOnline = me.getIsOnline(device.deviceid);
                            device.isOnline = isOnline;
                            if (!isOnline) {
                                cloneGroup.devices.push(device);
                            }
                        })
                        if (cloneGroup.devices.length > 0) {
                            this.filterData.push(group);
                        }
                    };
                } else {
                    var devices = group.devices
                    var obj = {
                        groupname: group.groupname,
                        devices: []
                    }
                    for (var j = 0; j < devices.length; j++) {
                        var device = devices[j]
                        var devicename = device.devicename;
                        var isOnline = this.getIsOnline(device.deviceid);
                        device.isOnline = isOnline;
                        if (
                            device.devicetitle.toLowerCase().indexOf(value) !== -1 ||
                            devicename.toLowerCase().indexOf(value) !== -1 ||
                            device.firstLetter.indexOf(value) !== -1 ||
                            device.pinyin.indexOf(value) !== -1 ||
                            device.deviceid.indexOf(value) !== -1
                        ) {
                            if (me.selectedState == "all") {
                                obj.devices.push(device)
                            } else if (me.selectedState == "online") {
                                if (isOnline) {
                                    obj.devices.push(device)
                                }
                            } else if (me.selectedState == "offline") {
                                if (!isOnline) {
                                    obj.devices.push(device)
                                }
                            }
                        } else {
                            if (device.remark) {
                                if (device.remark.indexOf(value) !== -1) {
                                    if (me.selectedState == "all") {
                                        obj.devices.push(device)
                                    } else if (me.selectedState == "online") {
                                        if (isOnline) {
                                            obj.devices.push(device)
                                        }
                                    } else if (me.selectedState == "offline") {
                                        if (!isOnline) {
                                            obj.devices.push(device)
                                        }
                                    }
                                };
                            };
                        };
                    }
                    if (obj.devices.length) {
                        this.filterData.push(obj);
                    };
                };
            };
        },
        sosoSelect: function (value) {
            this.sosoValue = value.devicename;
            this.filterData = [];
            var me = this;
            var deviceid = null

            this.groups.forEach(function (group) {
                group.devices.forEach(function (dev) {
                    if (dev.deviceid == value.deviceid) {
                        dev.isSelected = true;
                        group.expand = true;
                        deviceid = dev.deviceid;
                        me.currentDeviceType = dev.devicetype;
                        me.handleClickDev(dev.deviceid);
                    } else {
                        dev.isSelected = false;
                    };
                });
            });

            this.scrollToCurruntDevice(deviceid);
        },
        scrollToCurruntDevice: function (deviceid) {

            var me = this;
            setTimeout(function () {
                var elWraper = me.$refs.treeWraper;
                var wrapHeight = elWraper.getBoundingClientRect().height;
                var sHeight = 0;

                for (var i = 0; i < me.groups.length; i++) {
                    var group = me.groups[i]
                    var isBreak = false;
                    sHeight += 34;
                    if (group.expand) {
                        var devices = group.devices;
                        for (var j = 0; j < devices.length; j++) {
                            var device = devices[j];
                            sHeight += 29;
                            if (device.deviceid === deviceid) {
                                isBreak = true;
                                sHeight += 60;
                                break;
                            }
                        }
                        sHeight += 10;
                    }
                    if (isBreak) break;
                };

                if (sHeight < wrapHeight) {
                    $(elWraper).animate({ scrollTop: 0 }, 500);
                } else {
                    $(elWraper).animate({ scrollTop: sHeight - (wrapHeight / 3) }, 500);
                }

            }, 500);
        },
        sosoValueChange: function () {
            var me = this;
            var value = this.sosoValue;

            if (this.timeoutIns != null) {
                clearTimeout(this.timeoutIns);
            }

            if (!value.trim()) {
                this.filterData = [];
                return;
            }

            this.timeoutIns = setTimeout(function () {
                me.filterMethod(value);
            }, 300);
        },
        selectedStateNav: function (state) {
            this.selectedState = state;
            this.openGroupIds = {};
            this.openCompanyIds = {};
        },
        openCompany: function (company) {
            var companyid = company.companyid;
            company.expand = !company.expand;
            if (company.expand) {
                this.openCompanyIds[companyid] = "";
            } else {
                delete this.openCompanyIds[companyid];
            }
        },
        openGroupItem: function (groupInfo) {
            groupInfo.expand = !groupInfo.expand;
            if (groupInfo.expand) {
                this.openGroupIds[groupInfo.groupid] = "";
            } else {
                delete this.openGroupIds[groupInfo.groupid];
            }
        },
        selectedDev: function (deviceInfo) {
            var device = this.deviceInfos[deviceInfo.deviceid];
            var devicetype = device.devicetype;
            if (devicetype != this.currentDeviceType) {
                this.currentDeviceType = devicetype;
            };
            this.cancelSelected();
            deviceInfo.isSelected = true;
            this.selectedDevObj = deviceInfo;
            this.handleClickDev(deviceInfo.deviceid);
        },
        handleClickDev: function (deviceid) {
            globalDeviceId = deviceid;
            this.querySingleAllCmdDefaultValue(deviceid);
            if (!this.map) { return; }
            var record = this.getSingleDeviceInfo(deviceid);
            this.currentDeviceName = this.deviceInfos[deviceid].devicename;
            if (record) {
                this.$store.commit('currentDeviceRecord', record);
                this.map.onClickDevice(deviceid);
            } else {
                if (this.mapType == 'bMap') {
                    this.map.mapInstance.closeInfoWindow();
                };
                this.$Message.error(this.$t("monitor.noRecordTrack"))
                this.$store.commit('currentDeviceId', deviceid);
            }
        },
        querySingleAllCmdDefaultValue: function (deviceid) {
            var url = myUrls.queryDeviceSettings(), me = this;
            utils.sendAjax(url, { deviceid: deviceid }, function (resp) {
                if (resp.status === 0) {
                    me.cmdSettings = resp.settings;
                }
            })
        },
        updateTreeOnlineState: function () {
            this.getCurrentStateTreeData(this.selectedState);
        },
        cancelSelected: function () {

            this.groups.forEach(function (group) {
                group.devices.forEach(function (dev) {
                    dev.isSelected = false
                })
            })

        },
        getMonitorListByUser: function (data, callback) {
            var me = this
            var url = myUrls.monitorListByUser()
            utils.sendAjax(url, data, function (resp) {
                if (resp.status == 0) {
                    callback(resp)
                } else {
                    if (resp.cause) {
                        me.$Message.error(resp.cause)
                    }
                }
            })
        },
        getLastPosition: function (deviceIds, callback, errorCall) {
            var me = this;
            var url = myUrls.lastPosition();
            var data = {
                username: this.username,
                deviceids: deviceIds,
                lastquerypositiontime: me.lastquerypositiontime
            };
            $.ajax({
                url: url,
                method: 'post',
                data: JSON.stringify(data),
                dataType: 'json',
                success: function (resp) {
                    if (resp.status == 0) {
                        if (resp.records) {
                            resp.records.forEach(function (item) {
                                if (item) {
                                    var deviceid = item.deviceid;
                                    var b_lon_and_b_lat = wgs84tobd09(item.callon, item.callat)
                                    var g_lon_and_g_lat = wgs84togcj02(item.callon, item.callat);
                                    var online = utils.getIsOnline(item);
                                    item.b_lon = b_lon_and_b_lat[0];
                                    item.b_lat = b_lon_and_b_lat[1];
                                    item.g_lon = g_lon_and_g_lat[0];
                                    item.g_lat = g_lon_and_g_lat[1];
                                    item.online = online;
                                    item.devicename = me.deviceInfos[deviceid] ? me.deviceInfos[deviceid].devicename : "";
                                    item.updatetimeStr = DateFormat.longToDateTimeStr(item.updatetime, 0);
                                    me.positionLastrecords[deviceid] = item;
                                    // console.log("lastPositon", item.devicename, DateFormat.longToDateTimeStr(item.updatetime, 0));
                                }
                            })
                            me.positionLastrecords
                            callback ? callback() : '';
                        }
                    } else if (resp.status > 9000) {
                        me.$Message.error(me.$t("monitor.reLogin"))
                        Cookies.remove('token')
                        setTimeout(function () {
                            window.location.href = 'index.html'
                        }, 2000)
                    }
                    me.lastquerypositiontime = DateFormat.getCurrentUTC();
                    isLoadLastPositon = true;
                },
                error: function (err) {
                    errorCall(err);
                    isLoadLastPositon = true;
                }
            })
        },
        openTreeDeviceNav: function (deviceid) {
            var me = this;
            var devLastInfo = me.getSingleDeviceInfo(deviceid);
            var device = this.deviceInfos[deviceid];
            var devicetype = device.devicetype;
            this.currentDeviceType = devicetype;

            me.$store.commit('currentDeviceId', deviceid);
            me.$store.commit('currentDeviceRecord', devLastInfo);
            globalDeviceId = deviceid;

            me.groups.forEach(function (group) {
                group.devices.forEach(function (device) {
                    if (device.deviceid == deviceid) {
                        device.isSelected = true;
                        group.expand = true;
                    } else {
                        device.isSelected = false;
                    };
                });
            });

            this.scrollToCurruntDevice(deviceid);
        },
        getSingleDeviceInfo: function (deviceid) {
            return this.positionLastrecords[deviceid];
        },
        queryCompanyTree: function (callback) {
            var url = myUrls.queryCompanyTree();
            utils.sendAjax(url, {}, function (resp) {
                callback(resp);
            });
        },
        handleEditDevFn: function () {
            var me = this;
            var data = this.editDevData;
            var sendData = {
                deviceid: data.deviceid,
                devicename: data.devicename,
                remark: data.remark
            };
            var url = myUrls.editDeviceSimple();
            if (data.devicename.length == 0 || data.devicename == '') {
                me.$Message.error(me.$t("monitor.devNameMust"))
                return
            }
            if (data.simnum) {
                sendData.simnum = data.simnum
            }

            utils.sendAjax(url, sendData, function (resp) {
                if (resp.status == 0) {
                    me.editDeviceInfo.title = sendData.devicename;
                    me.editDeviceInfo.simnum = sendData.simnum;
                    utils.changeGroupsDevName(sendData, me.groups);
                    me.editDevModal = false;
                    me.$Message.success(me.$t("message.changeSucc"));
                    me.deviceInfos[data.deviceid].simnum = sendData.simnum;
                    me.deviceInfos[data.deviceid].remark = data.remark;
                    var record = me.getSingleDeviceInfo(data.deviceid);
                    if (record) {
                        me.positionLastrecords[data.deviceid].devicename = sendData.devicename;
                        me.map.onClickDevice(data.deviceid);
                        me.map.updateMarkerLabel(data.deviceid);
                    };
                } else if ((resp.status == -1)) {
                    me.$Message.error(me.$t("message.changeFail"))
                }
            })
        },
        editDevice: function (device) {
            this.$store.commit('editDeviceInfo', device);
            var deviceid = device.deviceid;
            var deviceInfo = this.deviceInfos[deviceid];

            this.editDevData.devicename = deviceInfo.devicename;
            this.editDevData.simnum = deviceInfo.simnum;
            this.editDevData.deviceid = deviceid;
            this.editDevData.remark = deviceInfo.remark;
            this.editDevModal = true;
        },
        playBack: function (deviceid) {
            playBack(deviceid)
        },
        trackMap: function (deviceid) {
            trackMap(deviceid)
        },
        getCurrentStateTreeData: function (state) {
            var me = this;

            this.sosoData = [];
            if (state === 'all') {

                this.getAllHideCompanyTreeData();

            } else if (state === 'online') {

                this.getOnlineHideCompanyTreeData();

            } else if (state === 'offline') {

                this.getOfflineHideCompanyTreeData();

            };



        },
        filterGroups: function (groups) {
            var me = this, all = 0;
            groups.forEach(function (group, index) {
                var devCount = 0;
                if (group.groupname == 'Default') {
                    isZh ? group.groupname = me.$t("monitor.defaultGroup") : '';
                } else if (group.groupname == 'Device') {
                    isZh ? group.groupname = me.$t("monitor.devGroup") : '';
                };
                group.firstLetter = __pinyin.getFirstLetter(group.groupname);
                group.pinyin = __pinyin.getPinyin(group.groupname);
                group.expand = false;

                group.devices.forEach(function (device) {
                    all++;
                    devCount++;
                    device.isSelected = false;
                    device.firstLetter = __pinyin.getFirstLetter(device.devicename);
                    device.pinyin = __pinyin.getPinyin(device.devicename);
                    var deviceTypeName = me.getDeviceTypeName(device.devicetype);
                    if (deviceTypeName) {
                        device.deviceTypeName = deviceTypeName ;
                        device.devicetitle = deviceTypeName + "-" + device.devicename;
                    } else {
                        device.devicetitle = device.devicename;
                    }
                    device.allDeviceIdTitle = device.devicetitle + "-" + device.deviceid;
                });

                group.devices.sort(function (a, b) {
                    return a.deviceTypeName .localeCompare(b.deviceTypeName);
                });

                group.title = group.groupname + "(0/" + devCount + ")";
            });
            this.allDevCount = all;
            this.onlineCount = 0;
            this.offlineDevCount = all;
            return groups.filter(function (group) { return group.devices.length });
        },

        getAllHideCompanyTreeData: function () {
            var me = this;
            this.groups.forEach(function (group) {
                var count = 0;
                var online = 0;
                group.devices.forEach(function (device, index) {
                    count++;
                    var isOnline = me.getIsOnline(device.deviceid);
                    device.isOnline = isOnline;
                    if (isOnline) {
                        online++;
                    };
                });
                group.isShow = true;
                group.title = group.groupname + "(" + online + "/" + count + ")";
            });
        },
        getOnlineHideCompanyTreeData: function () {
            var me = this;
            this.groups.forEach(function (group) {
                var online = 0;
                group.devices.forEach(function (device, index) {
                    var isOnline = me.getIsOnline(device.deviceid);
                    device.isOnline = isOnline;
                    if (isOnline) {
                        online++;
                    };
                });
                if (online != 0) {
                    group.isShow = true;
                } else {
                    group.isShow = false;
                }
                group.title = group.groupname + "(" + online + ")";
            });
        },
        getOfflineHideCompanyTreeData: function () {
            var me = this;
            this.groups.forEach(function (group) {
                var offline = 0;
                group.devices.forEach(function (device, index) {
                    var isOnline = me.getIsOnline(device.deviceid);
                    device.isOnline = isOnline;
                    if (!isOnline) {
                        offline++;
                    };
                });
                if (offline != 0) {
                    group.isShow = true;
                } else {
                    group.isShow = false;
                }
                group.title = group.groupname + "(" + offline + ")";
            });
        },
        getIsOnline: function (deviceid) {
            var me = this
            var isOnline = false;
            var record = this.positionLastrecords[deviceid];
            if (record) {
                var updatetime = record.updatetime;
                var currentTime = new Date().getTime();
                if ((currentTime - updatetime) < me.offlineTime) {
                    isOnline = true;
                };
            }
            return isOnline;
        },
        updateDevLastPosition: function (item) {
            var deviceid = item.deviceid;
            if (this.deviceInfos && this.deviceInfos[deviceid]) {
                var b_lon_and_b_lat = wgs84tobd09(item.callon, item.callat)
                var g_lon_and_g_lat = wgs84togcj02(item.callon, item.callat);
                var online = utils.getIsOnline(item);
                item.b_lon = b_lon_and_b_lat[0];
                item.b_lat = b_lon_and_b_lat[1];
                item.g_lon = g_lon_and_g_lat[0];
                item.g_lat = g_lon_and_g_lat[1];
                item.online = online;
                item.devicename = this.deviceInfos[deviceid].devicename;
                item.updatetimeStr = DateFormat.longToDateTimeStr(item.updatetime, 0);
                this.positionLastrecords[deviceid] = item;
                this.map && this.map.updateLastTracks(this.positionLastrecords);
            }
        },
        setIntervalReqRecords: function () {
            var me = this
            this.intervalInstanse = setInterval(function () {
                me.intervalTime--;
                if (me.intervalTime <= 0) {
                    me.intervalTime = me.stateIntervalTime;
                    // var devIdList = Object.keys(me.deviceInfos);
                    me.getLastPosition([], function () {
                        me.map.updateLastTracks && me.map.updateLastTracks(me.positionLastrecords);
                        me.map.updateMarkersState && me.map.updateMarkersState(me.currentDeviceId);
                        me.updateTreeOnlineState();
                        me.caclOnlineCount();
                    }, function (error) { });
                }
            }, 1000);
        },
        handleMousemove: function (e) {
            var pageY = event.pageY;
            var height = 8 * 38;
            var isOverflow = pageY + height < window.innerHeight
            this.placement = isOverflow ? 'right-start' : 'right-end';
        },
        caclOnlineCount: function () {
            var me = this;
            var online = 0;
            var deviceIds = Object.keys(me.deviceInfos);
            for (var key in this.positionLastrecords) {
                var record = this.positionLastrecords[key];
                var isOnline = me.getIsOnline(record.deviceid);
                if (isOnline) {
                    online++;
                }
            };
            this.allDevCount = deviceIds.length;
            this.onlineDevCount = online;
            this.offlineDevCount = this.allDevCount - this.onlineDevCount;
        },
        onSelectState: function () {

            this.getCurrentStateTreeData(
                this.selectedState
            )

        },
        isShowRecordBtnByDeviceType: function () {
            var deviceTypes = this.deviceTypes;
            var result1 = false;
            var result2 = false;
            var result3 = false;
            var result4 = false;
            var result5 = false;
            var result6 = false;
            var result7 = false;

            for (var i = 0; i < deviceTypes.length; i++) {
                if (this.currentDeviceType == deviceTypes[i].devicetypeid) {
                    var functions = deviceTypes[i].functions;
                    if (functions) {
                        if (functions.indexOf("audio") != -1) {
                            result1 = true;
                        };
                        if (functions.indexOf("bms") != -1) {
                            result2 = true;
                        };
                        if (functions.indexOf("obd") != -1) {
                            result3 = true;
                        };
                        if (functions.indexOf("weight") != -1) {
                            result4 = true;
                        };
                        if (functions.indexOf("watermeter") != -1) {
                            result5 = true;
                        };
                        if (functions.indexOf("video") != -1) {
                            result6 = true;
                        };
                        if (functions.indexOf("activesafety") != -1) {
                            result7 = true;
                        };
                    }
                }
            };
            this.isShowRecordBtn = result1;
            this.isShowBmsBtn = result2;
            this.isShowObdBtn = result3;
            this.isShowWeightBtn = result4;
            this.isShowWatermeterBtn = result5;
            this.isShowVideoBtn = result6;
            this.isShowActiveSafetyBtn = result7;
        },
        getDeviceTypeName: function (deviceTypeId) {
            var typeName = "", deviceTypes = this.deviceTypes;
            for (var index = 0; index < deviceTypes.length; index++) {
                var element = deviceTypes[index];
                if (element.devicetypeid === deviceTypeId) {
                    typeName = element.typename;
                    break
                }
            }
            return typeName;
        },
        getMonitorList: function () {
            var me = this;
            this.getMonitorListByUser({ username: userName }, function (resp) {
                me.groups = me.filterGroups(resp.groups)
                me.groups.sort(function (a, b) {
                    return a.groupname.localeCompare(b.groupname);
                });
                me.$store.dispatch('setdeviceInfos', me.groups);
                me.getLastPosition([], function (resp) {
                    me.lastquerypositiontime = DateFormat.getCurrentUTC();
                    me.caclOnlineCount();
                    me.updateTreeOnlineState();
                    communicate.$on("positionlast", me.handleWebSocket);
                    communicate.$on("on-click-marker", me.openTreeDeviceNav);
                }, function (error) { });
                me.isLoadGroup = false;
                me.setIntervalReqRecords();
            });
        },
        refreshMonitorRestartOpen: function () {
            var me = this;
            if (globalDeviceId) {

                for (var i = 0; i < me.groups.length; i++) {
                    var group = me.groups[i];
                    for (var j = 0; j < group.devices.length; j++) {
                        var device = group.devices[j];
                        if (device.deviceid === globalDeviceId) {
                            device.isSelected = true;
                            group.expand = true;
                            me.selectedDevObj = device;
                            setTimeout(function () { me.handleClickDev(device.deviceid); }, 300);
                            return;
                        }
                    }
                }

            }
        }
    },
    computed: {
        username: function () {
            return Cookies.get('name');
        },
        isShowCompanyName: function () {
            return this.$store.state.isShowCompany;
        },
        stateIntervalTime: function () {
            return this.$store.state.intervalTime;
        },
        editDeviceInfo: function () {
            return this.$store.state.editDeviceInfo;
        },
        currentDeviceRecord: function () {
            return this.$store.state.currentDeviceRecord;
        },
        currentDeviceId: function () {
            return this.$store.state.currentDeviceId;
        },
        deviceInfos: function () {
            return this.$store.state.deviceInfos;
        },
        deviceTypes: function () {
            return this.$store.state.deviceTypes;
        }
    },
    watch: {
        mapType: function (newType) {
            this.initMap();
            console.log('mapType', mapType);
            Cookies.set('app-map-type', this.mapType);
        },
        filterData: function () {
            if (this.filterData.length) {
                this.isShowMatchDev = true;
            } else {
                this.isShowMatchDev = false;
            }
        },
        currentDeviceType: function () {
            var allCmdList = this.$store.state.allCmdList;
            var directiveList = [];
            var type = this.currentDeviceType;
            allCmdList.forEach(function (cmd) {
                if (cmd.devicetype == type) {
                    directiveList.push(cmd);
                } else if (cmd.common == 1) {
                    directiveList.push(cmd);
                };
            });

            directiveList.sort(function (a, b) {
                return a.cmdlevel - b.cmdlevel;
            });
            this.currentDevDirectiveList = directiveList;
            this.isShowRecordBtnByDeviceType();

        },
        selectedState: function () {
            this.onSelectState();
        },
        deviceTypes: function () {
            this.getMonitorList();
        }
    },
    mounted: function () {
        this.intervalTime = Number(this.stateIntervalTime);
        this.placeholder = this.$t("monitor.placeholder");
        this.initMap();
        if (this.deviceTypes.length) {
            this.getMonitorList();
        }
    },
    created: function () {
        this.positionLastrecords = {}; // 全部设备最后一次位置记录
    },
    activated: function () {
        if (isNeedRefresh) {
            var me = this;
            this.getMonitorListByUser({ username: userName }, function (resp) {
                me.groups = me.filterGroups(resp.groups);
                me.groups.sort(function (a, b) {
                    return a.groupname.localeCompare(b.groupname);
                });
                me.$store.dispatch('setdeviceInfos', me.groups);
                me.refreshMonitorRestartOpen();
                me.updateTreeOnlineState();
                isNeedRefresh = false;
            });
        };

    },
    beforeDestroy: function () {
        this.$store.commit('currentDeviceRecord', {});
        clearInterval(this.intervalInstanse);
        communicate.$off('positionlast', this.handleWebSocket);
        communicate.$off("on-click-marker", this.openTreeDeviceNav);
        this.myDis && this.myDis.close();
        isLoadLastPositon = false;
    }
}