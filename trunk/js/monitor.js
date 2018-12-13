
// baidu: 'http://api.map.baidu.com/api?v=3.0&ak=e7SC5rvmn2FsRNE4R1ygg44n',
// textIconoverlay: getPath + 'textIconoverlay_min.js',
// distancetool: getPath + 'distancetool_min.js',
// bmarkerclusterer: getPath + "markerclusterer.js",

// google: "http://ditu.google.cn/maps/api/js?v=3.1&sensor=false&language=cn&key=AIzaSyAjWE3yINoltrJcma3fq73wCp04jjEo1zA",
// gmarkerclusterer: getPath + "gmarkerclusterer.js",
// markerwithlabel: getPath + "markerwithlabel.js",

// <!-- <script type="text/javascript" src="http://api.map.baidu.com/library/DistanceTool/1.2/src/DistanceTool_min.js"></script> -->
//     <!-- <script src="http://api.map.baidu.com/api?v=3.0&ak=e7SC5rvmn2FsRNE4R1ygg44n"></script> -->
//     <!-- <script type="text/javascript" src="http://api.map.baidu.com/library/TextIconOverlay/1.2/src/TextIconOverlay_min.js"></script> -->
//     <!-- <script src="js/textIconoverlay_min.js"></script>
//     <script src="js/distancetool_min.js"></script>
//     <script src="js/markerclusterer.js"></script> -->
//     <!-- <script src="http://ditu.google.cn/maps/api/js?v=3.1&sensor=false&language=cn&key=AIzaSyAjWE3yINoltrJcma3fq73wCp04jjEo1zA" type="text/javascript"></script>
//     <script src="js/gmarkerclusterer.js"></script>
//     <script src="js/markerwithlabel.js"></script> -->

// 定位监控
var monitor = {
    template: document.getElementById('monitor-template').innerHTML,
    data: function () {
        var vm = this;
        return {
            placeholder: "",
            isSpin: false,
            map: null,
            placement: "right-start",
            mapType: mapType ? mapType : 'bMap',
            mapList: [{ label: isZh ? "百度地图" : "BaiduMap", value: "bMap" }, { label: isZh ? "谷歌地图" : "GoogleMap", value: "gMap" }],
            sosoValue: '', // 搜索框的值
            sosoData: [], // 搜索框里面的数据
            selectedState: '', // 选择nav的状态 all online offline;
            currentStateData: [], // 当前tree的数据
            positionLastrecords: {}, // 全部设备最后一次位置记录
            companys: [], //公司名称id
            groups: [], // 原始列表数据
            intervalTime: null, // 多久刷新一次设备
            offlineTime: 5 * 60 * 1000, // 根据这个时间算出是否离线
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
            electronicFenceModal: false,   //电子围栏
            deviceInfoModal: false,   // 设备基本信息模态
            directiveReportModal: false,//指令记录
            currentDeviceName: "",
            fenceDistance: 1000,
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
            sendTableData: []
        }
    },
    methods: {
        initMap: function () {
            var me = this;
            switch (this.mapType) {
                case 'bMap':
                    try {
                        BMap ? this.map = new BMapClass() : '';
                    } catch (error) {
                        me.isSpin = true;
                        asyncLoadJs('baidu', function () {
                            (function poll () {
                                if (isLoadBMap) {
                                    asyncLoadJs('distancetool', function () {
                                        asyncLoadJs('textIconoverlay', function () {
                                            asyncLoadJs('bmarkerclusterer', function () {
                                                me.map = new BMapClass();
                                                me.map.setMarkerClusterer(me.positionLastrecords);
                                                me.isSpin = false;
                                            });

                                        });
                                    });
                                } else {
                                    setTimeout(poll, 4);
                                }
                            }());
                        });

                    }
                    break;
                case 'gMap':
                    try {
                        google ? this.map = new GoogleMap() : '';
                    } catch (error) {
                        me.isSpin = true;
                        asyncLoadJs('google', function () {
                            asyncLoadJs('markerwithlabel', function () {
                                asyncLoadJs('gmarkerclusterer', function () {
                                    me.map = new GoogleMap();
                                    me.map.setMarkerClusterer(me.positionLastrecords);
                                    me.isSpin = false;
                                });
                            });
                        });
                    }
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
            console.log('收到的轨迹push时间', deviceid, DateFormat.longToDateTimeStr(data.arrivedtime, 0));
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
                case 'name3':
                    this.directiveReportModal = true;
                    this.queryAllCmdRecords();
                    break;
                case 'name4':
                    this.$emit("jump-report", "reportForm");
                    break;
                case 'name5':
                    this.queryDeviceBaseInfo();
                    this.deviceInfoModal = true;
                    break;
            }
        },
        queryDeviceBaseInfo: function () {
            this.deviceBaseInfo = {};
            var me = this;
            var deviceId = me.selectedDevObj.deviceid;
            var url = myUrls.queryDeviceBaseInfo();
            var data = {
                deviceid: deviceId
            };
            utils.sendAjax(url, data, function (resp) {
                resp.overdueDateStr = DateFormat.longToDateStr(resp.overduetime, 0);
                me.deviceBaseInfo = resp;
            })
        },
        handleClickDirective: function (cmdCode) {
            this.cmdParams = {};
            this.selectedCmdInfo = {};
            var cmdInfo = null;
            var me = this;
            this.currentDevDirectiveList.forEach(function (cmd) {
                if (cmd.cmdcode == cmdCode) {
                    cmdInfo = cmd;
                }
            });
            this.selectedCmdInfo.cmdName = cmdInfo.cmdname;
            this.selectedCmdInfo.cmdcode = cmdInfo.cmdcode;
            this.selectedCmdInfo.cmddescr = cmdInfo.cmddescr;
            if (cmdInfo.params) {
                this.selectedCmdInfo.params = utils.parseXML(cmdInfo.params)
                this.selectedCmdInfo.params.forEach(function (param) {
                    me.cmdParams[param.type] = param.value;
                });
            };

            this.dispatchDirectiveModal = true;
        },
        handleClickFence: function (name) {
            switch (name) {
                case 'shefang':
                    this.electronicFenceModal = true;
                    break;
                case 'chexiao':
                    this.cancelFence();
                    break;
            }
        },
        setFence: function () {
            var me = this;
            var deviceid = this.selectedDevObj.deviceid;
            var track = this.getSingleDeviceInfo(deviceid);
            var distance = this.fenceDistance;

            if (!isNaN(distance)) {
                if (track) {
                    var url = myUrls.setGeofence();
                    utils.sendAjax(url, { deviceid: deviceid, radius: this.fenceDistance, lat: track.callat, lon: track.callon }, function (resp) {
                        if (resp.status == 0) {
                            me.electronicFenceModal = false;
                            // utils.addMapFence(me, deviceid, me.fenceDistance);
                            me.map.addMapFence(deviceid, me.fenceDistance);
                        } else {
                            me.$Message.error(me.$t("monitor.settingFail"));
                        }
                    })
                } else {
                    me.$Message.error(me.$t("monitor.noTrackError"));
                    me.electronicFenceModal = false;
                }
            } else {
                this.$Message.error(me.$t("monitor.rangeNumErr"));
            }
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
        cancelFence: function () {
            var me = this;
            var deviceid = this.selectedDevObj.deviceid;
            var url = myUrls.unSetGeofence();
            utils.sendAjax(url, { deviceid: deviceid }, function (resp) {
                if (resp.status == 0) {
                    me.$Message.success(me.$t("monitor.cancelFenceSucc"));
                    me.map.cancelFence(deviceid);
                } else {
                    me.$Message.error(me.$t("monitor.settingFail"));
                }
            })
        },
        disposeDirectiveFn: function () {
            var me = this;
            var url = myUrls.sendCmd();
            var data = { devicetype: this.currentDeviceType, cmdcode: this.selectedCmdInfo.cmdcode, deviceid: me.currentDeviceId, params: Object.values(this.cmdParams), state: -1 };
            utils.sendAjax(url, data, function (resp) {
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
            var me = this
            if (this.sosoValue.trim()) {
                me.sosoValueChange()
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
            var firstLetter = __pinyin.getFirstLetter(value)
            var pinyin = __pinyin.getPinyin(value)
            for (var i = 0; i < this.groups.length; i++) {
                var group = this.groups[i]
                if (
                    group.groupname.toUpperCase().indexOf(value.toUpperCase()) !== -1 ||
                    group.firstLetter.indexOf(firstLetter) !== -1 ||
                    group.pinyin.indexOf(pinyin) !== -1
                ) {
                    this.filterData.push(group)
                } else {
                    var devices = group.devices
                    var obj = {
                        groupname: group.groupname,
                        devices: []
                    }
                    for (var j = 0; j < devices.length; j++) {
                        var device = devices[j]
                        var devicename = device.devicename
                        if (
                            devicename.toUpperCase().indexOf(value.toUpperCase()) !== -1 ||
                            device.firstLetter.indexOf(firstLetter) !== -1 ||
                            device.pinyin.indexOf(pinyin) !== -1
                        ) {
                            obj.devices.push(device)
                        } else {
                            if (device.remark) {
                                if (device.remark.indexOf(value) !== -1) {
                                    obj.devices.push(device);
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
            if (this.isShowConpanyName) {
                this.currentStateData.forEach(function (company) {
                    company.children.forEach(function (group) {
                        group.children.forEach(function (dev) {
                            if (dev.deviceid == value.deviceid) {
                                company.expand = true;
                                dev.isSelected = true;
                                group.expand = true;
                                deviceid = dev.deviceid;
                                me.handleClickDev(dev.deviceid);
                            } else {
                                dev.isSelected = false;
                            };
                        });
                    });
                });
            } else {
                this.currentStateData.forEach(function (group) {
                    group.children.forEach(function (dev) {
                        if (dev.deviceid == value.deviceid) {
                            dev.isSelected = true;
                            group.expand = true;
                            deviceid = dev.deviceid;
                            me.handleClickDev(dev.deviceid);
                        } else {
                            dev.isSelected = false;
                        };
                    });
                });
            }
            var elWraper = this.$refs.treeWraper;
            var wrapY = elWraper.getBoundingClientRect().y;
            var wrapHeight = elWraper.getBoundingClientRect().height;
            var elY = this.$refs[deviceid][0].getBoundingClientRect().y;
            // if (wrapHeight >= 380 && ) {
            //     elWraper.scroolTo(elWraper - wrapHeight);
            // }
            // console.log('elTop', elY - wrapY, wrapHeight);
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
        },
        openCanpany: function (conpany) {
            conpany.expand = !conpany.expand;
        },
        openGroupItem: function (groupInfo) {
            groupInfo.expand = !groupInfo.expand;
        },
        selectedDev: function (deviceInfo) {
            var devicetype = deviceInfo.devicetype;
            if (devicetype != this.currentDeviceType) {
                this.currentDeviceType = devicetype;
            };
            this.cancelSelected();
            deviceInfo.isSelected = true;
            this.selectedDevObj = deviceInfo;
            this.handleClickDev(deviceInfo.deviceid);
        },
        handleClickDev: function (deviceid) {
            if (!this.map) { return; }
            var record = this.getSingleDeviceInfo(deviceid);
            this.currentDeviceName = this.deviceInfos[deviceid].devicename;
            if (record) {
                this.$store.commit('currentDeviceRecord', record);
                this.map.onClickDevice(deviceid);
            } else {
                this.$Message.error(this.$t("monitor.noRecordTrack"))
                this.$store.commit('currentDeviceId', deviceid);
            }
        },
        updateTreeOnlineState: function () {
            var me = this;
            for (var key in this.positionLastrecords) {
                var item = this.positionLastrecords[key];
                if (item == null) {
                    return;
                };
                var deviceid = item.deviceid;
                var isOnline = utils.getIsOnline(item);
                if (me.isShowConpanyName) {
                    me.currentStateData.forEach(function (company) {
                        company.children.forEach(function (group) {
                            group.children.forEach(function (dev) {
                                if (dev.deviceid == deviceid) {
                                    dev.isOnline = isOnline
                                };
                            });
                        });
                    });

                    me.currentStateData.forEach(function (company) {
                        company.children.forEach(function (group) {
                            var onlineCount = 0
                            group.children.forEach(function (dev) {
                                if (dev.isOnline) {
                                    onlineCount++
                                }
                            })
                            if (me.selectedState == 'all') {
                                group.title =
                                    group.name +
                                    '(' +
                                    onlineCount +
                                    '/' +
                                    group.children.length +
                                    ')'
                            } else {
                                group.title = group.name + '(' + group.children.length + ')'
                            };
                        });
                    });
                } else {
                    me.currentStateData.forEach(function (group) {
                        group.children.forEach(function (dev) {
                            if (dev.deviceid == deviceid) {
                                dev.isOnline = isOnline
                            };
                        });
                    });
                    me.currentStateData.forEach(function (group) {
                        var onlineCount = 0
                        group.children.forEach(function (dev) {
                            if (dev.isOnline) {
                                onlineCount++
                            };
                        });
                        if (me.selectedState == 'all') {
                            group.title =
                                group.name +
                                '(' +
                                onlineCount +
                                '/' +
                                group.children.length +
                                ')'
                        } else {
                            group.title = group.name + '(' + group.children.length + ')'
                        };
                    });
                };
            };
        },
        cancelSelected: function () {
            if (this.isShowConpanyName) {
                this.currentStateData.forEach(function (company) {
                    company.children.forEach(function (group) {
                        group.children.forEach(function (dev) {
                            dev.isSelected = false
                        })
                    })
                })
            } else {
                this.currentStateData.forEach(function (group) {
                    group.children.forEach(function (dev) {
                        dev.isSelected = false
                    })
                })
            }
        },
        getMonitorListByUser: function (data, callback) {
            var me = this
            var url = myUrls.monitorListByUser()
            utils.sendAjax(url, data, function (resp) {
                if (resp.status == 0) {
                    resp.groups.forEach(function (group) {
                        group.firstLetter = __pinyin.getFirstLetter(group.groupname)
                        group.pinyin = __pinyin.getPinyin(group.groupname)
                        group.devices.forEach(function (device, index) {
                            var deviceid = device.deviceid
                            device.firstLetter = __pinyin.getFirstLetter(device.devicename)
                            device.pinyin = __pinyin.getPinyin(device.devicename)
                        })
                    })
                    callback(resp)
                } else if (resp.status == 3) {
                    me.$Message.error(me.$t("monitor.reLogin"))
                    Cookies.remove('token')
                    setTimeout(function () {
                        window.location.href = 'index.html'
                    }, 2000)
                } else {
                    if (resp.cause) {
                        me.$Message.error(resp.cause)
                    }
                }
            })
        },
        getLastPosition: function (deviceIds, callback) {
            var me = this;
            var url = myUrls.lastPosition();
            var data = {
                username: this.username,
                deviceids: deviceIds
            }
            utils.sendAjax(url, data, function (resp) {
                if (resp.status == 0) {
                    if (resp.records) {
                        var newRecords = {};
                        resp.records.forEach((item) => {
                            if (item) {
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
                                    item.devicename = me.deviceInfos[deviceid].devicename;
                                    item.arrivedTimeStr = DateFormat.longToDateTimeStr(item.arrivedtime, 0);
                                    newRecords[deviceid] = item;
                                }
                            }
                        })
                        me.positionLastrecords = newRecords;
                        callback ? callback() : '';
                    }
                } else if (resp.status == 3) {
                    me.$Message.error(me.$t("monitor.reLogin"))
                    Cookies.remove('token')
                    setTimeout(function () {
                        window.location.href = 'index.html'
                    }, 2000)
                }
            })
        },
        openTreeDeviceNav: function (deviceid) {
            var me = this;
            var devLastInfo = me.getSingleDeviceInfo(deviceid);
            me.$store.commit('currentDeviceId', deviceid);
            me.$store.commit('currentDeviceRecord', devLastInfo);
            if (me.isShowConpanyName) {
                me.currentStateData.forEach(function (company) {
                    company.children.forEach(function (group) {
                        group.children.forEach(function (dev) {
                            if (dev.deviceid == deviceid) {
                                company.expand = true;
                                dev.isSelected = true;
                                group.expand = true;
                            } else {
                                dev.isSelected = false;
                            }
                        })
                    })
                })
            } else {
                me.currentStateData.forEach(function (group) {
                    group.children.forEach(function (dev) {
                        if (dev.deviceid == deviceid) {
                            dev.isSelected = true;
                            group.expand = true;
                        } else {
                            dev.isSelected = false;
                        };
                    });
                });
            }
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
                    me.$Message.success(me.$t("monitor.changeSucc"));

                    me.deviceInfos[data.deviceid].remark = data.remark;
                } else if ((resp.status == -1)) {
                    me.$Message.error(me.$t("monitor.changeFail"))
                }
            })
        },
        editDevice: function (device) {
            // console.log('editDevice', deviceid);
            this.$store.commit('editDeviceInfo', device);
            var deviceid = device.deviceid
            var deviceInfo = this.deviceInfos[deviceid];

            this.editDevData.devicename = deviceInfo.devicename;
            this.editDevData.simnum = deviceInfo.simnum;
            this.editDevData.deviceid = deviceid;
            this.editDevData.remark = deviceInfo.remark;
            this.editDevModal = true
        },
        playBack: function (deviceid) {
            playBack(deviceid)
        },
        trackMap: function (deviceid) {
            trackMap(deviceid)
        },
        getCurrentStateTreeData: function (state, isShowConpanyName) {
            var me = this;
            this.currentStateData = [];
            this.sosoData = [];
            if (state === 'all') {
                if (isShowConpanyName) {
                    this.getAllShowConpanyTreeData();
                } else {
                    this.getAllHideConpanyTreeData();
                };
            } else if (state === 'online') {
                if (isShowConpanyName) {
                    this.getOnlineShowConpanyTreeData();
                } else {
                    this.getOnlineHideConpanyTreeData();
                };
            } else if (state === 'offline') {
                if (isShowConpanyName) {
                    this.getOfflineShowConpanyTreeData();
                } else {
                    this.getOfflineHideConpanyTreeData();
                };
            };

            if (isShowConpanyName) {
                this.currentStateData.forEach(function (company) {
                    company.children.forEach(function (group) {
                        group.children.forEach(function (dev) {
                            me.sosoData.push(dev.title)
                        });
                    });
                });
            } else {
                this.currentStateData.forEach(function (item) {
                    item.children.forEach(function (dev) {
                        me.sosoData.push(dev.title)
                    });
                });
            };
        },
        getNewCompanyArr: function () {
            var newArray = []
            this.companys.forEach(function (company) {
                var companyid = company.companyid
                var companyObj = {
                    title: company.companyname,
                    companyname: company.companyname,
                    companyid: companyid,
                    children: [],
                    expand: false
                };
                newArray.push(companyObj);
            })
            var logintype = Cookies.get('logintype')
            if (logintype !== 'DEVICE' && this.isShowConpanyName) {
                newArray.unshift({
                    title: '默认客户',
                    companyname: '默认客户',
                    companyid: 0,
                    children: [],
                    expand: false
                })
            }
            if (newArray.length === 0) {
                if (logintype == 'DEVICE') {
                    newArray.push({
                        title: '默认客户',
                        children: [],
                        companyname: '默认客户',
                        expand: false,
                        companyid: 0
                    })
                }
            }
            return newArray
        },
        filterGroups: function (groups) {
            var newGroups = []
            var newObject = {}
            groups.forEach(function (item) {
                var groupid = item.groupid
                var devices = item.devices
                if (newObject[groupid] == undefined) {
                    newObject[groupid] = {
                        groupname: item.groupname,
                        devices: [],
                        groupid: item.groupid,
                        remark: item.remark
                    }
                };
                newObject[groupid].devices = newObject[groupid].devices.concat(
                    devices
                );
            })

            for (var key in newObject) {
                if (newObject.hasOwnProperty(key)) {
                    newGroups.push(newObject[key])
                }
            }

            return newGroups
        },
        getAllShowConpanyTreeData: function () {
            var me = this
            var newArray = me.getNewCompanyArr()

            me.groups.forEach(function (group) {
                var companyid = group.companyid
                var onlineCount = 0
                var groupObj = {
                    companyid: companyid,
                    title: group.groupname,
                    expand: false,
                    name: group.groupname,
                    children: []
                }
                group.devices.forEach(function (device, index) {
                    var isOnline = me.getIsOnline(device.deviceid)
                    var deviceObj = {
                        title: device.devicename,
                        deviceid: device.deviceid,
                        isOnline: isOnline,
                        isSelected: false,
                        simnum: device.simnum,
                        devicetype: device.devicetype
                    }
                    if (isOnline) {
                        onlineCount++
                    }
                    if (device.deviceid == me.currentDeviceId) {
                        groupObj.expand = true
                        deviceObj.isSelected = true
                    }
                    groupObj.children.push(deviceObj)
                })
                groupObj.title +=
                    '(' + onlineCount + '/' + groupObj.children.length + ')'

                newArray.forEach(function (company) {
                    if (company.companyid == companyid) {
                        if (groupObj.children.length) {
                            company.children.push(groupObj)
                        }
                        company.title =
                            company.companyname + '(' + company.children.length + ')'
                    } else {
                        var logintype = Cookies.get('logintype')
                        if (logintype == 'DEVICE') {
                            company.children.push(groupObj)
                            company.title =
                                company.companyname + '(' + company.children.length + ')'
                        }
                    }
                })
            })
            var treeData = []
            for (var i = 0; i < newArray.length; i++) {
                var item = newArray[i]
                if (item.children.length !== 0) {
                    treeData.push(item)
                }
            }
            me.currentStateData = treeData
        },
        getAllHideConpanyTreeData: function () {
            var me = this
            var groups = this.filterGroups(this.groups)
            groups.forEach(function (group) {
                var onlineCount = 0
                var groupData = {
                    title: group.groupname,
                    expand: false,
                    children: [],
                    name: group.groupname
                }

                group.devices.forEach(function (device, index) {
                    var isOnline = me.getIsOnline(device.deviceid)
                    var dev = {
                        title: device.devicename,
                        isSelected: false,
                        isOnline: isOnline,
                        deviceid: device.deviceid,
                        simnum: device.simnum,
                        devicetype: device.devicetype
                    }
                    if (device.deviceid == me.currentDeviceId) {
                        groupData.expand = true
                        dev.isSelected = true
                    }
                    if (isOnline) {
                        onlineCount++
                    }
                    groupData.children.push(dev)
                })

                if (groupData.children.length) {
                    groupData.title +=
                        '(' + onlineCount + '/' + groupData.children.length + ')'
                    if (groupData.title == '默认组') {
                        me.currentStateData.unshift(groupData)
                    } else {
                        me.currentStateData.push(groupData)
                    }
                }
            })
        },
        getOnlineShowConpanyTreeData: function () {
            var me = this
            var newArray = me.getNewCompanyArr()
            var groupsArray = []

            me.groups.forEach(function (group) {
                var companyid = group.companyid
                var onlineCount = 0
                var groupObj = {
                    companyid: companyid,
                    title: group.groupname,
                    expand: false,
                    children: [],
                    name: group.groupname
                }

                group.devices.forEach(function (device) {
                    var isOnline = me.getIsOnline(device.deviceid)
                    var deviceObj = {
                        title: device.devicename,
                        deviceid: device.deviceid,
                        isOnline: isOnline,
                        isSelected: false,
                        simnum: device.simnum,
                        devicetype: device.devicetype
                    }

                    if (device.deviceid == me.currentDeviceId) {
                        groupObj.expand = true
                        deviceObj.isSelected = true
                    }
                    if (isOnline) {
                        onlineCount++
                        groupObj.children.push(deviceObj)
                    }
                })
                if (groupObj.children.length) {
                    groupObj.title += '(' + groupObj.children.length + ')'
                    groupsArray.push(groupObj)
                }
            })

            newArray.forEach(function (company, index) {
                var companyid = company.companyid
                groupsArray.forEach(function (group) {
                    if (companyid == group.companyid) {
                        company.children.push(group)
                    } else {
                        var logintype = Cookies.get('logintype')
                        if (logintype == 'DEVICE') {
                            company.children.push(group)
                        }
                    }
                })
                if (company.children.length) {
                    company.title =
                        company.companyname + '(' + company.children.length + ')'
                    me.currentStateData.push(company)
                }
            })
        },
        getOnlineHideConpanyTreeData: function () {
            var me = this
            var groups = this.filterGroups(this.groups)
            groups.forEach(function (group) {
                var groupData = {
                    title: group.groupname,
                    expand: false,
                    children: [],
                    name: group.groupname
                }

                group.devices.forEach(function (device, index) {
                    var isOnline = me.getIsOnline(device.deviceid)
                    var dev = {
                        title: device.devicename,
                        isSelected: false,
                        isOnline: isOnline,
                        deviceid: device.deviceid,
                        simnum: device.simnum,
                        devicetype: device.devicetype
                    }
                    if (device.deviceid == me.currentDeviceId) {
                        groupData.expand = true
                        dev.isSelected = true
                    }
                    if (isOnline) {
                        groupData.children.push(dev)
                    }
                })

                if (groupData.children.length) {
                    if (groupData.title == '默认组') {
                        if (groupData.children.length) {
                            me.currentStateData.unshift(groupData)
                        }
                    } else {
                        if (groupData.children.length) {
                            me.currentStateData.push(groupData)
                        }
                    }
                    groupData.title += '(' + groupData.children.length + ')'
                }
            })
        },
        getOfflineShowConpanyTreeData: function () {
            var me = this
            var newArray = me.getNewCompanyArr()
            var groupsArray = []

            me.groups.forEach(function (group) {
                var companyid = group.companyid

                var groupObj = {
                    companyid: companyid,
                    title: group.groupname,
                    expand: false,
                    children: [],
                    name: group.groupname
                }

                group.devices.forEach(function (device) {
                    var isOnline = me.getIsOnline(device.deviceid)
                    var deviceObj = {
                        title: device.devicename,
                        deviceid: device.deviceid,
                        isOnline: isOnline,
                        isSelected: false,
                        simnum: device.simnum,
                        devicetype: device.devicetype
                    }

                    if (device.deviceid == me.currentDeviceId) {
                        groupObj.expand = true
                        deviceObj.isSelected = true
                    }
                    if (!isOnline) {
                        groupObj.children.push(deviceObj)
                    }
                })
                if (groupObj.children.length) {
                    groupObj.title += '(' + groupObj.children.length + ')'
                    groupsArray.push(groupObj)
                }
            })
            newArray.forEach(function (company, index) {
                var companyid = company.companyid
                groupsArray.forEach(function (group) {
                    if (companyid == group.companyid) {
                        company.children.push(group)
                    } else {
                        var logintype = Cookies.get('logintype')
                        if (logintype == 'DEVICE') {
                            company.children.push(group)
                        }
                    }
                })
                if (company.children.length) {
                    company.title =
                        company.companyname + '(' + company.children.length + ')'
                    me.currentStateData.push(company)
                }
            })
        },
        getOfflineHideConpanyTreeData: function () {
            var me = this
            var groups = this.filterGroups(this.groups)
            groups.forEach(function (group) {
                var groupData = {
                    title: group.groupname,
                    expand: false,
                    children: [],
                    name: group.groupname
                }

                group.devices.forEach(function (device, index) {
                    var isOnline = me.getIsOnline(device.deviceid)
                    var dev = {
                        title: device.devicename,
                        isSelected: false,
                        isOnline: isOnline,
                        deviceid: device.deviceid,
                        simnum: device.simnum,
                        devicetype: device.devicetype
                    }
                    if (device.deviceid == me.currentDeviceId) {
                        groupData.expand = true;
                        dev.isSelected = true;
                    }
                    if (!isOnline) {
                        groupData.children.push(dev);
                    };
                })

                if (groupData.children.length) {
                    if (groupData.title == '默认组') {
                        if (groupData.children.length) {
                            me.currentStateData.unshift(groupData);
                        };
                    } else {
                        if (groupData.children.length) {
                            me.currentStateData.push(groupData);
                        };
                    };
                    groupData.title += '(' + groupData.children.length + ')'
                };
            });
        },
        getIsOnline: function (deviceid) {
            var me = this
            var isOnline = false;
            var record = this.positionLastrecords[deviceid];
            if (record) {
                var arrivedtime = record.arrivedtime;
                var currentTime = new Date().getTime();
                if (currentTime - arrivedtime < me.offlineTime) {
                    isOnline = true;
                };
            }
            return isOnline;
        },
        updateDevLastPosition: function (item) {
            var deviceid = item.deviceid;
            var b_lon_and_b_lat = wgs84tobd09(item.callon, item.callat)
            var g_lon_and_g_lat = wgs84togcj02(item.callon, item.callat);
            var online = utils.getIsOnline(item);
            item.b_lon = b_lon_and_b_lat[0];
            item.b_lat = b_lon_and_b_lat[1];
            item.g_lon = g_lon_and_g_lat[0];
            item.g_lat = g_lon_and_g_lat[1];
            item.online = online;
            item.devicename = this.deviceInfos[deviceid].devicename;
            item.arrivedTimeStr = DateFormat.longToDateTimeStr(item.arrivedtime, 0);
            this.positionLastrecords[deviceid] = item;
            this.map && this.map.updateLastTracks(this.positionLastrecords);
        },
        setIntervalReqRecords: function () {
            var me = this
            this.intervalInstanse = setInterval(function () {
                me.intervalTime--
                if (me.intervalTime <= 0) {
                    me.intervalTime = me.stateIntervalTime;
                    var devIdList = Object.keys(me.deviceInfos);
                    me.getLastPosition(devIdList, function () {
                        me.map.updateLastTracks(me.positionLastrecords);
                        me.map.updateMarkersState(me.currentDeviceId);
                        me.updateTreeOnlineState();
                    });
                }
            }, 1000);
        },
        handleMousemove: function (e) {
            var pageY = event.pageY;
            var height = 8 * 38;
            var isOverflow = pageY + height < window.innerHeight
            this.placement = isOverflow ? 'right-start' : 'right-end';
        }
    },
    computed: {
        username: function () {
            return Cookies.get('name');
        },
        isShowConpanyName: function () {
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
        }
    },
    watch: {
        mapType: function () {
            this.initMap();
            this.map.setMarkerClusterer(this.positionLastrecords);
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
                return a.cmdlevel > b.cmdlevel;
            });
            this.currentDevDirectiveList = directiveList;
        },
        positionLastrecords: function () {
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
        selectedState: function () {
            var me = this
            if (this.isShowConpanyName && this.companys.length == 0) {
                this.queryCompanyTree(function (response) {
                    me.companys = response.companys
                    me.getCurrentStateTreeData(me.selectedState, me.isShowConpanyName)
                });
            } else {
                this.getCurrentStateTreeData(
                    this.selectedState,
                    this.isShowConpanyName
                )
            }
        },
        isShowConpanyName: function () {
            var me = this;
            if (this.isShowConpanyName) {
                me.queryCompanyTree(function (response) {
                    me.companys = response.companys
                    me.getCurrentStateTreeData(me.selectedState, me.isShowConpanyName)
                });
            } else {
                this.getCurrentStateTreeData(
                    this.selectedState,
                    this.isShowConpanyName
                )
            }
        }
    },
    mounted: function () {
        var me = this;
        this.intervalTime = Number(this.stateIntervalTime);
        this.placeholder = this.$t("monitor.placeholder");
        this.initMap();
        this.getMonitorListByUser({ username: userName }, function (resp) {
            me.groups = resp.groups;
            me.$store.dispatch('setdeviceInfos', me.groups);
            var devIdList = Object.keys(me.deviceInfos);
            me.getLastPosition(devIdList, function (resp) {
                me.map ? me.map.setMarkerClusterer(me.positionLastrecords) : '';
                me.selectedState = 'all';
            });
        });
        this.setIntervalReqRecords();
        communicate.$on("positionlast", this.handleWebSocket);
        communicate.$on("on-click-marker", this.openTreeDeviceNav);
    },
    beforeDestroy: function () {
        this.$store.commit('currentDeviceRecord', {});
        clearInterval(this.intervalInstanse);
        communicate.$off('positionlast', this.handleWebSocket);
        communicate.$off("on-click-marker", this.openTreeDeviceNav);
        this.myDis && this.myDis.close();
    }
}