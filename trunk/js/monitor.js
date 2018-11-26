




// 定位监控
var monitor = {
    template: document.getElementById('monitor-template').innerHTML,
    data: function () {
        var vm = this;
        return {
            map: null,
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
            infoWindowInstance: null,  //  信息窗口实例
            loading: false,
            cacheColumns: [
                { title: '编号', key: "index", width: 80, align: 'center', sortable: true },
                { title: '设备序号', key: 'deviceid' },
                { title: '指令名称', key: 'cmdname', sortable: true },
                { title: '发送时间', key: 'sendtimeStr', width: 170, sortable: true },
                { title: '发送参数', key: 'cmdparams', sortable: true },
                {
                    title: '操作',
                    key: 'action',
                    width: 100,
                    // align: 'center',
                    render: function (h, params) {
                        return h('div', [
                            h('Poptip', {
                                props: {
                                    confirm: true,
                                    title: '确定取消吗?'
                                },
                                on: {
                                    'on-ok': function () {
                                        var url = myUrls.deleteCacheCmd();
                                        utils.sendAjax(url, { cachecmdid: params.row.cachecmdid }, function (resp) {
                                            if (resp.status == 0) {
                                                vm.$Message.success("取消成功");
                                                vm.cacheTableData.splice(params.index, 1);
                                                vm.cacheTableData.forEach(function (item, index) {
                                                    item.index = ++index;
                                                });
                                            } else if (resp.status == 1) {
                                                vm.$Message.error("取消失败");
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
                                    }, "取消")
                                ])
                        ]);
                    },
                }
            ],
            sendColumns: [
                { title: '编号', key: "index", width: 80, align: 'center', sortable: true },
                { title: '设备序号', key: 'deviceid' },
                { title: '指令名称', key: 'cmdname', sortable: true },
                { title: '发送时间', key: 'sendtimeStr', width: 170, sortable: true },
                { title: '发送参数', key: 'cmdparams', sortable: true },
                { title: '结果', key: 'result', sortable: true },
            ],
            cacheTableData: [],
            sendTableData: []
        }
    },
    methods: {
        initMap: function () {
            var me = this
            this.map = new BMap.Map('map', { minZoom: 4, maxZoom: 18, enableMapClick: false })
            this.map.enableScrollWheelZoom()
            this.map.enableAutoResize()
            this.map.disableDoubleClickZoom()
            this.map.centerAndZoom(new BMap.Point(108.0017245, 35.926895), 5)
            // var top_left_control = new BMap.ScaleControl({anchor: BMAP_ANCHOR_BOTTOM_LEFT});
            var top_left_control = new BMap.ScaleControl({
                anchor: BMAP_ANCHOR_BOTTOM_LEFT
            }) // 左上角，添加比例尺
            var top_left_navigation = new BMap.NavigationControl() //左上角，添加默认缩放平移控件
            this.map.addControl(top_left_control)
            this.map.addControl(top_left_navigation)
            this.map.addControl(
                new BMap.MapTypeControl({
                    mapTypes: [BMAP_NORMAL_MAP, BMAP_HYBRID_MAP]
                })
            )
            this.map.addEventListener('moveend', function (ev) {
                if (me.isMoveTriggerEvent) {
                    me.clearMarkerOverlays()
                    var pointArr = me.getThePointOfTheCurrentWindow()
                    var range = utils.getDisplayRange(me.map.getZoom())
                    if (pointArr.length) {
                        if (pointArr.length > 300) {
                            var filterArr = me.filterReocrds(range, pointArr)
                            me.addOverlayToMap(filterArr)
                        } else {
                            me.addOverlayToMap(pointArr)
                        }
                        me.openDevInfoWindow()
                    }
                } else {
                    me.isMoveTriggerEvent = true
                }
            })

            this.map.addEventListener('zoomend', function (ev) {
                // me.map.clearOverlays();
                // me.clearMarkerOverlays();
                var pointArr = me.getThePointOfTheCurrentWindow()
                var range = utils.getDisplayRange(me.map.getZoom())
                if (pointArr.length) {
                    if (pointArr.length > 300) {
                        var filterArr = me.filterReocrds(range, pointArr)
                        me.addOverlayToMap(filterArr)
                    } else {
                        me.addOverlayToMap(pointArr)
                    }
                    setTimeout(function () {
                        me.openDevInfoWindow()
                    }, 400);
                }
            });
        },
        handleWebSocket: function (data) {
            var me = this;
            // if (store.componentName != "monitor") return;
            var deviceid = data.deviceid;
            me.positionLastrecords[deviceid] = data;
            me.updateTreeOnlineState();
            me.updateDevLastPosition(data);
            console.log('收到的轨迹push时间', deviceid, DateFormat.longToDateTimeStr(data.arrivedtime, 0));
            if (me.currentDeviceId == deviceid) {
                if (this.infoWindowInstance && this.infoWindowInstance.isOpen()) {
                    var sContent = this.getWindowContent(data);
                    me.refreshInfoWindow(sContent, true);
                };
            };
        },
        refreshInfoWindow: function (sContent, isOpen) {
            var contentWithDivStart = '<div id="info_window">';
            var contentWithDivEnd = '</div>';
            var domStr = contentWithDivStart + sContent + contentWithDivEnd;
            if (isOpen) {
                $("#info_window").html(domStr);
            } else {
                this.infoWindowInstance.setContent(domStr);
            }
        },
        clearMarkerOverlays: function () {
            var me = this;
            var mks = me.map.getOverlays();
            mks.forEach(function (item) {
                if (item.deviceid != undefined) {
                    me.map.removeOverlay(item);
                }
            })
        },
        openDistance: function () {
            if (this.myDis != null) {
                this.myDis.close();
            }
            this.myDis = new BMapLib.DistanceTool(this.map)
            this.myDis.open(); //开启鼠标测距
        },
        getThePointOfTheCurrentWindow: function () {
            var bounds = this.map.getBounds();
            var pointArr = [];
            for (var key in this.positionLastrecords) {
                var item = this.positionLastrecords[key];
                if (item) {
                    var lng_lat = wgs84tobd09(item.callon, item.callat);
                    var point = new BMap.Point(lng_lat[0], lng_lat[1]);
                    if (bounds.containsPoint(point)) {
                        pointArr.push(item);
                    };
                };
            };
            return pointArr;
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
                            utils.addMapFence(me, deviceid, me.fenceDistance);
                        } else {
                            me.$Message.error("设置失败");
                        }
                    })
                } else {
                    me.$Message.error("该设备没有轨迹,无法设防");
                    me.electronicFenceModal = false;
                }
            } else {
                this.$Message.error("范围必须是数字");
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
                    me.$Message.error("查询指令记录失败");
                }
                me.loading = false;
            });
        },
        cancelFence: function () {
            var me = this;
            var deviceid = this.selectedDevObj.deviceid;
            var mks = this.map.getOverlays();
            var url = myUrls.unSetGeofence();

            utils.sendAjax(url, { deviceid: deviceid }, function (resp) {
                if (resp.status == 0) {
                    me.$Message.success("撤防成功");
                    for (var i = 0; i < mks.length; i++) {
                        var mk = mks[i];
                        if (mk.circleid && mk.circleid == deviceid) {
                            me.map.removeOverlay(mk);
                        }
                    }
                } else {
                    me.$Message.error("设置失败");
                }
            })
        },
        disposeDirectiveFn: function () {
            var me = this;
            var url = myUrls.sendCmd();
            var data = { devicetype: this.currentDeviceType, cmdcode: this.selectedCmdInfo.cmdcode, deviceid: me.currentDeviceId, params: Object.values(this.cmdParams), state: 0 };
            utils.sendAjax(url, data, function (resp) {
                if (resp.status === 0) {
                    communicate.$emit("disposeAlarm", data.cmdcode);
                    me.$Message.success("下发成功");
                    me.dispatchDirectiveModal = false;
                } else if (resp.status === 1) {
                    me.$Message.error("密码错误");
                } else if (resp.status === -1) {
                    me.$Message.error("下发指令异常");
                } else if (resp.status === 2) {
                    me.$Message.error("设备离线,指令没有缓存");
                } else if (resp.status === 3) {
                    me.$Message.error("设备离线,指令已经缓存");
                } else if (resp.status === 4) {
                    me.$Message.error("请修改默认密码后再发送指令");
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

            if (this.isShowConpanyName) {
                this.currentStateData.forEach(function (company) {
                    company.children.forEach(function (group) {
                        group.children.forEach(function (dev) {
                            if (dev.deviceid == value.deviceid) {
                                company.expand = true;
                                dev.isSelected = true;
                                group.expand = true;
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
                            me.handleClickDev(dev.deviceid);
                        } else {
                            dev.isSelected = false;
                        };
                    });
                });
            }
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
            var record = this.getSingleDeviceInfo(deviceid);
            this.currentDeviceName = this.$store.state.deviceInfos[deviceid].devicename;

            if (record) {
                this.$store.commit('currentDeviceRecord', record);
                this.isMoveTriggerEvent = false;
                this.map.centerAndZoom(record.point, 18);
                this.openDevInfoWindow();
            } else {
                this.$Message.error('该设备没有上报位置信息')
                this.$store.commit('currentDeviceId', deviceid);
                this.infoWindowInstance.isOpen() && this.map.closeInfoWindow();
            }
            var elTop = this.$refs[deviceid][0].getBoundingClientRect();
            // console.log('resf', elTop);

        },
        updateTreeOnlineState: function () {
            var me = this;
            for (var key in this.positionLastrecords) {
                var item = this.positionLastrecords[key];
                if (item == null) {
                    return;
                };
                var deviceid = item.deviceid;
                var isOnline = (function (record) {
                    var isOnline = false;
                    var arrivedtime = record.arrivedtime;
                    var currentTime = new Date().getTime();
                    if (currentTime - arrivedtime < me.offlineTime) {
                        isOnline = true;
                    }
                    return isOnline;
                })(item);

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
        getMonitorListByUser: function (havecompany, callback) {
            var me = this
            var url = myUrls.monitorListByUser()
            utils.sendAjax(url, { havecompany: havecompany }, function (resp) {
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
                    me.$Message.error('请重新登录,2秒后自动跳转登录页面')
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
        setDeviceIdsList: function (groups) {
            this.$store.dispatch('setdeviceInfos', groups)
        },
        getLastPosition: function (deviceIds, callback) {
            var me = this
            var url = myUrls.lastPosition()
            var data = {
                username: this.username,
                deviceids: deviceIds
            }
            utils.sendAjax(url, data, function (resp) {
                if (resp.status == 0) {
                    callback(resp)
                } else if (resp.status == 3) {
                    me.$Message.error('请重新登录,2秒后自动跳转登录页面')
                    Cookies.remove('token')
                    setTimeout(function () {
                        window.location.href = 'index.html'
                    }, 2000)
                }
            })
        },
        filterReocrds: function (range, records) {
            var me = this
            var filterArr = []
            var firstRecord = records[0]
            if (firstRecord == null) {
                return []
            }
            var first_lng_lat = wgs84tobd09(firstRecord.callon, firstRecord.callat)
            firstRecord.point = new BMap.Point(first_lng_lat[0], first_lng_lat[1])
            filterArr.push(firstRecord)

            records.forEach(function (record) {
                var len = filterArr.length - 1
                var endPoint = null
                if (!record.point) {
                    var end_lng_lat = wgs84tobd09(record.callon, record.callat)
                    endPoint = new BMap.Point(end_lng_lat[0], end_lng_lat[1])
                    record.point = endPoint
                } else {
                    endPoint = record.point
                }
                var rice = me.map.getDistance(filterArr[len].point, endPoint)
                if (rice > range) {
                    filterArr.push(record)
                }
            })

            if (filterArr.length > 300) {
                return filterReocrds(range + 100, filterArr)
            } else {
                return filterArr
            }
        },
        addOverlayToMap: function (records) {
            var me = this;
            records.forEach(function (record) {
                if (record != null) {
                    var deviceid = record.deviceid
                    var point = null;
                    if (!record.point) {
                        var lng_lat = wgs84tobd09(record.callon, record.callat)
                        var point = new BMap.Point(lng_lat[0], lng_lat[1])
                        record.point = point;
                    } else {
                        point = record.point;
                    };

                    var marker = new BMap.Marker(point)
                    marker.setIcon(record.icon);
                    var label = new BMap.Label(
                        me.$store.state.deviceInfos[deviceid].devicename,
                        { position: point, offset: new BMap.Size(20, -3) }
                    )
                    label.setStyle({
                        color: '#000000',
                        border: '1px solid #000000',
                        background: '#F5FCB8',
                        fontSize: '14px',
                        fontFamily: '微软雅黑',
                        padding: '0 2px'
                    });
                    marker.setLabel(label);
                    marker.deviceid = deviceid;
                    me.markerAddEvent(marker, deviceid);
                    me.map.addOverlay(marker);
                }
            })
        },

        markerAddEvent: function (marker, deviceid) {
            var me = this
            marker.addEventListener('click', function () {
                me.isMoveTriggerEvent = false
                var deviceid = this.deviceid
                var devLastInfo = me.getSingleDeviceInfo(deviceid);
                var sContent = me.getWindowContent(devLastInfo);
                me.refreshInfoWindow(sContent, false);
                me.map.openInfoWindow(me.infoWindowInstance, marker.point);
                me.$store.commit('currentDeviceRecord', devLastInfo);
                me.openTreeDeviceNav(deviceid)
            });
        },
        openTreeDeviceNav: function (deviceid) {
            var me = this
            if (me.isShowConpanyName) {
                me.currentStateData.forEach(function (company) {
                    company.children.forEach(function (group) {
                        group.children.forEach(function (dev) {
                            if (dev.deviceid == deviceid) {
                                company.expand = true
                                dev.isSelected = true
                                group.expand = true
                            } else {
                                dev.isSelected = false
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
        openDevInfoWindow: function () {
            var me = this;
            var record = me.currentDeviceRecord;
            if (record) {
                var markers = this.map.getOverlays();
                for (var i = 0; i < markers.length; i++) {
                    var marker = markers[i];
                    if (marker.deviceid == me.currentDeviceId) {
                        var sContent = me.getWindowContent(record);
                        me.refreshInfoWindow(sContent, false);
                        this.map.openInfoWindow(this.infoWindowInstance, record.point);
                    };
                };
            };
        },
        getSingleDeviceInfo: function (deviceid) {
            var info = this.positionLastrecords[deviceid];
            return info;
        },
        getWithInitInfoWindow: function () {

            var contentWithDivStart = '<div id="info_window">';
            var contentWithDivEnd = '</div>';
            //var sContent = this.getWindowContent(info);
            if (this.infoWindowInstance == null) {
                this.infoWindowInstance = new BMap.InfoWindow(contentWithDivStart + contentWithDivEnd, { width: 350, height: 195 });
                this.infoWindowInstance.disableCloseOnClick();
                this.infoWindowInstance.disableAutoPan();
            }
            return this.infoWindowInstance;

        },
        getWindowContent: function (info) {
            var devdata = this.$store.state.deviceInfos[info.deviceid];
            var address = this.getAddress(info);
            var strstatus = info.strstatus ? info.strstatus : '';
            var posiType = (function () {
                var type = null;

                var gotsrc = info.gotsrc;  //cell gps wifi
                switch (gotsrc) {
                    case 'un':
                        type = "未知";
                        break;
                    case 'cell':
                        type = "基站定位";
                        break;
                    case 'gps':
                        type = "卫星定位";
                        break;
                    case 'wifi':
                        type = "WIFI定位";
                        break;
                    default:
                        type = "未知";
                };
                return type;
            })();
            if (info.radius > 0) {
                var radiuDesc = ' (误差范围:' + info.radius + '米)';
                posiType += radiuDesc;
            };

            var content =
                '<p style="margin:0;font-size:13px">' +
                '<p> 设备名称: ' +
                devdata.devicename +
                '</p>' +
                '<p> 设备序号: ' +
                info.deviceid +
                '</p>' +
                '<p> 定位类型: ' +
                posiType +
                '</p>' +
                '<p> 经纬度: ' +
                info.callon.toFixed(5) +
                ',' +
                info.callat.toFixed(5) +
                '</p>' +
                '<p> 最后时间: ' +
                DateFormat.longToDateTimeStr(info.arrivedtime, 0) +
                '</p>' +
                '<p> 状态: ' +
                strstatus +
                '</p>' +
                '<p class="last-address"> 详细地址: ' +
                address +
                '</p>' +
                '<p class="operation">' +
                '<span class="ivu-btn ivu-btn-default ivu-btn-small" onclick="playBack(' +
                info.deviceid +
                ')">轨迹</span>' +
                '<span class="ivu-btn ivu-btn-default ivu-btn-small" onclick="trackMap(' +
                info.deviceid +
                ')">跟踪</span><span class="ivu-btn ivu-btn-default ivu-btn-small" onclick="refreshPostion(' +
                info.deviceid +
                ')">刷新位置</span><span class="ivu-btn ivu-btn-default ivu-btn-small" onclick="openSim(' +
                info.deviceid +
                ')">SIM</span><span class="ivu-btn ivu-btn-default ivu-btn-small" onclick="setFence(' +
                info.deviceid +
                ')">设置围栏</span></p>';
            return content;
        },
        getAddress: function (info) {
            var me = this;
            var callon = info.callon;
            var callat = info.callat;
            var bd09 = wgs84tobd09(callon, callat);
            var lng = bd09[0].toFixed(5);
            var lat = bd09[1].toFixed(5);
            var address = LocalCacheMgr.getAddress(lng, lat);
            if (address !== null) {
                return address;
            }
            utils.getBaiduAddressFromBaidu(lng, lat, function (resp) {
                if (resp.length) {
                    address = resp;
                    $('p.last-address').html(' 详细地址: ' + address);
                    LocalCacheMgr.setAddress(lng, lat, address);
                } else {
                    utils.getJiuHuAddressSyn(callon, callat, function (resp) {
                        address = resp.address;
                        $('p.last-address').html(' 详细地址: ' + address);
                        LocalCacheMgr.setAddress(lng, lat, address);
                    })
                }
            })
            return '地址正在解析...'
        },
        // setNavState: function (state) {
        //     this.isShowConpanyName = state;
        // },
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
                me.$Message.error('设备名称是必填的')
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
                    me.$Message.success('修改成功');

                    me.$store.state.deviceInfos[data.deviceid].remark = data.remark;
                } else if ((resp.status == -1)) {
                    me.$Message.error('修改失败')
                }
            })
        },
        editDevice: function (device) {
            // console.log('editDevice', deviceid);
            this.$store.commit('editDeviceInfo', device);
            var deviceid = device.deviceid
            var deviceInfo = this.$store.state.deviceInfos[deviceid];

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
            var newGroups = []
            me.groups.forEach(function (group, index) {
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
        updateDevLastPosition: function (record) {
            var isOnline = (Date.now() - record.arrivedtime) < this.offlineTime ? true : false;
            var iconState = null;
            var angle = utils.getAngle(record.course);

            iconState = new BMap.Icon(
                utils.getDirectionImage(isOnline, angle),
                new BMap.Size(17, 17),
                { imageOffset: new BMap.Size(0, 0) }
            );

            record.icon = iconState;
            var lng_lat = wgs84tobd09(record.callon, record.callat);
            record.point = new BMap.Point(lng_lat[0], lng_lat[1]);
        },
        setIntervalReqRecords: function () {
            var me = this
            this.intervalInstanse = setInterval(function () {
                me.intervalTime--
                if (me.intervalTime <= 0) {
                    me.intervalTime = me.stateIntervalTime;
                    var devIdList = Object.keys(me.$store.state.deviceInfos);
                    me.getLastPosition(devIdList, function (resp) {
                        if (resp.records) {
                            var newRecord = {};
                            resp.records.forEach(function (record) {
                                if (record) {
                                    me.updateDevLastPosition(record);
                                    newRecord[record.deviceid] = record;
                                }
                            });
                            me.positionLastrecords = newRecord;
                            me.updateTreeOnlineState();
                            me.moveMarkers();
                        }
                    })
                }
            }, 1000);
        },
        moveMarkers: function () {
            var me = this;
            var markers = this.map.getOverlays();
            markers.forEach(function (marker) {
                var deviceid = marker.deviceid;
                var record = me.positionLastrecords[deviceid];
                if (record) {
                    if (deviceid === record.deviceid) {
                        marker.setPosition(record.point);
                        marker.setIcon(record.icon);
                        if (deviceid == me.currentDeviceId) {
                            me.isMoveTriggerEvent = false;
                            if (me.infoWindowInstance) {
                                if (me.infoWindowInstance.isOpen()) {
                                    var content = me.getWindowContent(record);
                                    me.refreshInfoWindow(content, true);
                                    console.log('查询的轨迹时间', deviceid, DateFormat.longToDateTimeStr(record.arrivedtime, 0));
                                }
                            };
                        };
                    };
                };


            });
        },
        setCarIconState: function () {
            var me = this
            for (var key in this.positionLastrecords) {
                var record = this.positionLastrecords[key];

                var isOnline = Date.now() - record.arrivedtime < me.offlineTime ? true : false;
                var iconState = null;

                var angle = utils.getAngle(record.course);

                iconState = new BMap.Icon(
                    utils.getDirectionImage(isOnline, angle),
                    new BMap.Size(17, 17),
                    { imageOffset: new BMap.Size(0, 0) }
                );

                record.icon = iconState;
            };
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
        }
    },
    watch: {
        filterData: function () {
            if (this.filterData.length) {
                this.isShowMatchDev = true
            } else {
                this.isShowMatchDev = false
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
            var deviceIds = Object.keys(me.$store.state.deviceInfos);

            for (var key in this.positionLastrecords) {
                var record = this.positionLastrecords[key];
                var isOnline = me.getIsOnline(record.deviceid);
                if (isOnline) {
                    online++;
                }
            }
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
            var me = this
            if (this.isShowConpanyName) {
                // if(me.groups[0] && me.groups[0].companyid ){
                //     me.getCurrentStateTreeData(me.selectedState,me.isShowConpanyName);
                // }else{
                this.getMonitorListByUser(1, function (resp) {
                    me.groups = resp.groups
                    me.queryCompanyTree(function (response) {
                        me.companys = response.companys
                        me.getCurrentStateTreeData(me.selectedState, me.isShowConpanyName)
                    })
                })
                // }
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
        var havecompany = this.isShowConpanyName == true ? 1 : 0;
        this.intervalTime = Number(this.stateIntervalTime);
        this.initMap();
        this.getWithInitInfoWindow();
        this.getMonitorListByUser(havecompany, function (resp) {
            me.groups = resp.groups;
            me.setDeviceIdsList(resp.groups);
            var devIdList = Object.keys(me.$store.state.deviceInfos)
            me.getLastPosition(devIdList, function (resp) {
                if (resp.records) {
                    var newRecords = {};
                    resp.records.forEach((item) => {
                        if (item) {
                            newRecords[item.deviceid] = item;
                        }
                    })
                    me.positionLastrecords = newRecords;
                } else {
                    me.positionLastrecords = {};
                }
                me.setCarIconState();
                var range = utils.getDisplayRange(me.map.getZoom());
                if (resp.records) {
                    if (resp.records.length > 300) {
                        var filterArr = me.filterReocrds(range, resp.records);
                        me.addOverlayToMap(filterArr);
                    } else {
                        me.addOverlayToMap(resp.records);
                    };
                };
                me.selectedState = 'all';
            });
        });
        this.setIntervalReqRecords();
        communicate.$on("positionlast", this.handleWebSocket);
    },
    beforeDestroy: function () {
        this.$store.commit('currentDeviceRecord', {});
        clearInterval(this.intervalInstanse);
        communicate.$off('positionlast', this.handleWebSocket);
        this.myDis && this.myDis.close();
    }
}