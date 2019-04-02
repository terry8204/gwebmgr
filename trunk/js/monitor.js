
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
var isLoadLastPositon = false;
// 定位监控
var monitor = {
    template: document.getElementById('monitor-template').innerHTML,
    data: function () {
        var vm = this;
        return {
            placeholder: "",
            isLoadGroup: true,
            isSpin: true,
            isShowRecordBtn: false,
            map: null,
            placement: "right-start",
            mapType: mapType ? mapType : 'bMap',
            mapList: [{ label: isZh ? "百度地图" : "BaiduMap", value: "bMap" }, { label: isZh ? "谷歌地图" : "GoogleMap", value: "gMap" }],
            sosoValue: '', // 搜索框的值
            sosoData: [], // 搜索框里面的数据
            openGroupIds: {},
            openCompanyIds: {},
            selectedState: 'all', // 选择nav的状态 all online offline;
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
            };

        },
        handleWebSocket: function (data) {
            var me = this;
            var deviceid = data.deviceid;
            data.devicename = this.deviceInfos[deviceid] ? this.deviceInfos[deviceid].devicename : "";
            me.positionLastrecords[deviceid] = data;
            me.updateTreeOnlineState();
            me.updateDevLastPosition(data);
            //console.log('收到的轨迹push时间', deviceid, DateFormat.longToDateTimeStr(data.updatetime, 0));
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
                case 'luyin':
                    window.open("record.html?deviceid=" + this.currentDeviceId);
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
            this.cmdPwd = null;
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
            this.selectedCmdInfo.cmdpwd = cmdInfo.cmdpwd;
            this.selectedCmdInfo.type = cmdInfo.cmdtype;
            if (cmdInfo.params) {
                var paramsXMLObj = utils.parseXML(cmdInfo.params);
                // this.selectedCmdInfo.type = paramsXMLObj.type;
                this.selectedCmdInfo.params = paramsXMLObj.paramsListObj;
                this.selectedCmdInfo.params.forEach(function (param) {
                    me.cmdParams[param.type] = param.value;
                });
                cmdInfo.cmdtype !== 'text' ? this.selectedTypeVal = null : '';
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
            var params = this.selectedCmdInfo.type === 'text' ? Object.values(this.cmdParams) : [this.selectedTypeVal];
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
            if (this.isShowCompanyName) {
                this.currentStateData.forEach(function (company) {
                    company.children.forEach(function (group) {
                        group.children.forEach(function (dev) {
                            if (dev.deviceid == value.deviceid) {
                                company.expand = true;
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
                });
            } else {
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
            }


            setTimeout(function () {
                if (me.isShowCompanyName) return;
                var elWraper = me.$refs.treeWraper;
                var wrapHeight = elWraper.getBoundingClientRect().height;
                var sHeight = 0;
                for (var i = 0; i < me.groups.length; i++) {
                    var group = me.groups[i]
                    var isBreak = false;
                    sHeight += 32;
                    if (group.expand) {
                        var devices = group.devices;
                        for (var j = 0; j < devices.length; j++) {
                            var device = devices[j];
                            sHeight += 27;
                            if (device.deviceid === deviceid) {
                                isBreak = true;
                                sHeight += 60;
                                break;
                            }
                        }
                    }
                    if (isBreak) break;
                };
                if (sHeight < wrapHeight) {
                    $(elWraper).animate({ scrollTop: 0 }, 500);
                } else {
                    $(elWraper).animate({ scrollTop: sHeight - (wrapHeight / 2) }, 500);
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
            this.getCurrentStateTreeData(this.selectedState, this.isShowCompanyName);
        },
        cancelSelected: function () {
            //currentStateData
            if (this.isShowCompanyName) {
                this.currentStateData.forEach(function (company) {
                    company.children.forEach(function (group) {
                        group.children.forEach(function (dev) {
                            dev.isSelected = false
                        })
                    })
                })
            } else {
                this.groups.forEach(function (group) {
                    group.devices.forEach(function (dev) {
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
                                        item.devicename = me.deviceInfos[deviceid] ? me.deviceInfos[deviceid].devicename : "";
                                        item.updatetimeStr = DateFormat.longToDateTimeStr(item.updatetime, 0);
                                        me.positionLastrecords[deviceid] = item;
                                    }
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
            me.$store.commit('currentDeviceId', deviceid);
            me.$store.commit('currentDeviceRecord', devLastInfo);
            if (me.isShowCompanyName) {
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
                    me.$Message.success(me.$t("message.changeSucc"));
                    me.deviceInfos[data.deviceid].simnum = sendData.simnum;
                    me.deviceInfos[data.deviceid].remark = data.remark;
                } else if ((resp.status == -1)) {
                    me.$Message.error(me.$t("message.changeFail"))
                }
            })
        },
        editDevice: function (device) {
            // console.log('editDevice', deviceid);
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
        getCurrentStateTreeData: function (state, isShowCompanyName) {
            var me = this;
            this.currentStateData = [];
            this.sosoData = [];
            if (state === 'all') {
                if (isShowCompanyName) {
                    this.getAllShowCompanyTreeData();
                } else {
                    this.getAllHideCompanyTreeData();
                };
            } else if (state === 'online') {
                if (isShowCompanyName) {
                    this.getOnlineShowCompanyTreeData();
                } else {
                    this.getOnlineHideCompanyTreeData();
                };
            } else if (state === 'offline') {
                if (isShowCompanyName) {
                    this.getOfflineShowCompanyTreeData();
                } else {
                    this.getOfflineHideCompanyTreeData();
                };
            };

            if (isShowCompanyName) {
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
            var newArray = [];
            var me = this;
            this.companys.forEach(function (company) {
                var companyid = company.companyid
                var companyObj = {
                    title: company.companyname,
                    companyname: company.companyname,
                    companyid: companyid,
                    children: [],
                    expand: Object.keys(me.openCompanyIds).includes(company.companyid + "")
                };
                newArray.push(companyObj);
            });
            var logintype = Cookies.get('logintype')
            if (logintype !== 'DEVICE' && this.isShowCompanyName) {
                newArray.unshift({
                    title: this.$t("monitor.defaultCustomer"),
                    companyname: this.$t("monitor.defaultCustomer"),
                    companyid: 0,
                    children: [],
                    expand: Object.keys(me.openCompanyIds).includes("0")
                })
            }
            if (newArray.length === 0) {
                if (logintype == 'DEVICE') {
                    newArray.push({
                        title: this.$t("monitor.defaultCustomer"),
                        children: [],
                        companyname: this.$t("monitor.defaultCustomer"),
                        expand: Object.keys(me.openCompanyIds).includes("0"),
                        companyid: 0
                    })
                }
            }
            return newArray
        },
        filterGroups: function (groups) {
            var me = this, all = 0;
            groups.forEach(function (group) {
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
                });
                group.title = group.groupname + "(0/" + devCount + ")";
            });
            this.allDevCount = all;
            this.onlineCount = 0;
            this.offlineDevCount = all;
            return groups;
        },
        getAllShowCompanyTreeData: function () {
            var me = this;
            var newArray = me.getNewCompanyArr();
            me.groups.forEach(function (group) {
                var companyid = group.companyid
                var onlineCount = 0
                var groupObj = {
                    companyid: companyid,
                    title: group.groupname,
                    expand: Object.keys(me.openGroupIds).includes(group.groupid + ""),
                    name: group.groupname,
                    children: [],
                    groupid: group.groupid
                };
                group.devices.forEach(function (device, index) {
                    var isOnline = me.getIsOnline(device.deviceid)
                    var deviceObj = {
                        title: me.getDeviceTypeName(device.devicetype) + "-" + device.devicename,
                        deviceid: device.deviceid,
                        isOnline: isOnline,
                        isSelected: false,
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
        getAllHideCompanyTreeData: function () {
            var me = this;
            this.groups.forEach(function (group) {
                var count = 0;
                var online = 0;
                group.devices.forEach(function (device, index) {
                    count++;
                    var isOnline = me.getIsOnline(device.deviceid);
                    var deviceTypeName = me.getDeviceTypeName(device.devicetype);
                    device.devicetitle = deviceTypeName + "-" + device.devicename;
                    device.isOnline = isOnline;
                    if (isOnline) {
                        online++;
                    };
                });
                group.isShow = true;
                group.title = group.groupname + "(" + online + "/" + count + ")";
            });
        },
        getOnlineShowCompanyTreeData: function () {
            var me = this
            var newArray = me.getNewCompanyArr()
            var groupsArray = []

            me.groups.forEach(function (group) {
                var companyid = group.companyid
                var onlineCount = 0
                var groupObj = {
                    companyid: companyid,
                    title: group.groupname,
                    expand: Object.keys(me.openGroupIds).includes(group.groupid + ""),
                    children: [],
                    name: group.groupname,
                    groupid: group.groupid
                }

                group.devices.forEach(function (device) {
                    var isOnline = me.getIsOnline(device.deviceid)
                    var deviceObj = {
                        title: me.getDeviceTypeName(device.devicetype) + "-" + device.devicename,
                        deviceid: device.deviceid,
                        isOnline: isOnline,
                        isSelected: false
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
        getOfflineShowCompanyTreeData: function () {
            var me = this
            var newArray = me.getNewCompanyArr()
            var groupsArray = []

            me.groups.forEach(function (group) {
                var companyid = group.companyid

                var groupObj = {
                    companyid: companyid,
                    title: group.groupname,
                    expand: Object.keys(me.openGroupIds).includes(group.groupid + ""),
                    children: [],
                    name: group.groupname,
                    groupid: group.groupid
                }

                group.devices.forEach(function (device) {
                    var isOnline = me.getIsOnline(device.deviceid)
                    var deviceObj = {
                        title: me.getDeviceTypeName(device.devicetype) + "-" + device.devicename,
                        deviceid: device.deviceid,
                        isOnline: isOnline,
                        isSelected: false
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
                if (currentTime - updatetime < me.offlineTime) {
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
                me.intervalTime--
                if (me.intervalTime <= 0) {
                    me.intervalTime = me.stateIntervalTime;
                    // var devIdList = Object.keys(me.deviceInfos);
                    me.getLastPosition([], function () {
                        me.map.updateLastTracks(me.positionLastrecords);
                        me.map.updateMarkersState(me.currentDeviceId);
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
            var me = this
            if (this.isShowCompanyName && this.companys.length == 0) {
                this.queryCompanyTree(function (response) {
                    me.companys = response.companys
                    me.getCurrentStateTreeData(me.selectedState, me.isShowCompanyName)
                });
            } else {
                this.getCurrentStateTreeData(
                    this.selectedState,
                    this.isShowCompanyName
                )
            }
        },
        isShowRecordBtnByDeviceType: function () {
            var deviceTypes = this.deviceTypes;
            var result = false;
            for (var i = 0; i < deviceTypes.length; i++) {
                if (this.currentDeviceType == deviceTypes[i].devicetypeid) {
                    var functions = deviceTypes[i].functions;
                    if (functions) {
                        if (functions.indexOf("audio") != -1) {
                            result = true;
                        }
                    }
                }
            };
            this.isShowRecordBtn = result;
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
                me.$store.dispatch('setdeviceInfos', me.groups);
                me.isShowCompanyName && me.onSelectState();
                me.getLastPosition([], function (resp) {
                    me.lastquerypositiontime = DateFormat.getCurrentUTC();
                    me.caclOnlineCount();
                    me.updateTreeOnlineState();
                    communicate.$on("positionlast", me.handleWebSocket);
                }, function (error) { });
                me.isLoadGroup = false;
                me.setIntervalReqRecords();
            });
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
        mapType: function () {
            this.initMap();
            // this.map.setMarkerClusterer(this.positionLastrecords);
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
        isShowCompanyName: function () {
            var me = this;
            if (this.isShowCompanyName) {
                me.queryCompanyTree(function (response) {
                    me.companys = response.companys
                    me.getCurrentStateTreeData(me.selectedState, me.isShowCompanyName)
                });
            } else {
                this.getCurrentStateTreeData(
                    this.selectedState,
                    this.isShowCompanyName
                )
            }
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
    activated: function () {
        // console.log('activated', this.groups.length)
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