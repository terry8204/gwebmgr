var treeMixin = {
    data: {
        readonly: true,
        dateVal: [DateFormat.longToDateStr(Date.now(), timeDifference), DateFormat.longToDateStr(Date.now(), timeDifference)],
        total: 0,
        currentPageIndex: 1,
        lastTableHeight: 100,
        posiDetailHeight: 100,
        placeholder: "",
        sosoValue: '',
        isShowMatchDev: false,
        treeData: [],
        dayNumberType: 0,
        selectedCount: 0,
    },
    methods: {
        clean: function() {
            this.selectedCount = 0;
            this.sosoValue = '';
            this.checkedDevice = [];
            this.treeDeviceList[0].open = true;
            this.zTreeObj = $.fn.zTree.init($("#ztree"), this.setting, this.treeDeviceList);
            if (this.tableData) {
                this.tableData = [];
            }
        },
        cleanSelected: function(treeDataFilter) {
            var that = this;
            for (var i = 0; i < treeDataFilter.length; i++) {
                var item = treeDataFilter[i];
                if (item != null) {
                    item.checked = false;
                    if (item.children && item.children.length > 0) {
                        that.cleanSelected(item.children);
                    }
                }
            }
        },
        cleanSelectedDev: function() {
            this.sosoValue = this.clean();
        },
        changePage: function(index) {
            var offset = index * 20;
            var start = (index - 1) * 20;
            this.currentPageIndex = index;
            this.tableData = this.cmdRecords.slice(start, offset);
        },
        onClickOutside: function(e) {
            this.readonly = false;
            this.isShowMatchDev = false;
        },
        onChange: function(value) {
            this.dateVal = value;
        },
        handleSelectdDate: function(dayNumber) {
            this.dayNumberType = dayNumber;
            var dayTime = 24 * 60 * 60 * 1000;
            if (dayNumber == 0) {
                this.dateVal = [DateFormat.longToDateStr(Date.now(), timeDifference), DateFormat.longToDateStr(Date.now(), timeDifference)];
            } else if (dayNumber == 1) {
                this.dateVal = [DateFormat.longToDateStr(Date.now() - dayTime, timeDifference), DateFormat.longToDateStr(Date.now() - dayTime, timeDifference)];
            } else if (dayNumber == 3) {
                this.dateVal = [DateFormat.longToDateStr(Date.now() - dayTime * 2, timeDifference), DateFormat.longToDateStr(Date.now(), timeDifference)];
            } else if (dayNumber == 7) {
                this.dateVal = [DateFormat.longToDateStr(Date.now() - dayTime * 6, timeDifference), DateFormat.longToDateStr(Date.now(), timeDifference)];
            }
        },
        focus: function() {
            this.readonly = false;
            this.isShowMatchDev = true;
        },
        sosoValueChange: function() {
            this.filterMethod(this.sosoValue.toLowerCase());
        },
        filterMethod: function(value) {
            if (value === '') {
                this.treeDeviceList[0].open = true;
                this.zTreeObj = $.fn.zTree.init($("#ztree"), this.setting, this.treeDeviceList);
            } else {
                var data = this.variableDeepSearch(this.treeDeviceList, value, 0);
                if (data.length == 0) {
                    data.push({
                        name: isZh ? '无数据' : 'No data',
                        nocheck: true
                    })
                }
                this.zTreeObj = $.fn.zTree.init($("#ztree"), this.setting, data);
            }

            this.checkedDevice = [];
            if (this.isShowMatchDev == false) {
                this.isShowMatchDev = true;
            }
        },
        variableDeepSearch: function(treeDataFilter, searchWord, limitcount) {
            var childTemp = [];
            var that = this;
            for (var i = 0; i < treeDataFilter.length; i++) {
                var copyItem = null;
                var item = treeDataFilter[i];
                if (item != null) {

                    var isFound = false;
                    if (item.name.toLowerCase().indexOf(searchWord) != -1 || (item.deviceid && item.deviceid.indexOf(searchWord) != -1)) {
                        copyItem = item;
                        copyItem.open = false;
                        isFound = true;
                    }
                    if (isFound == false && item.children && item.children.length > 0) {
                        // item.expand = true;
                        // childTemp.push(item);
                        var rs = that.variableDeepSearch(item.children, searchWord, limitcount);
                        if (rs && rs.length > 0) {
                            copyItem = deepClone(item);
                            copyItem.children = rs;
                            copyItem.open = true;
                            isFound = true;
                        }
                    }

                    if (isFound == true) {
                        limitcount++;
                        childTemp.push(copyItem);

                        if (limitcount > 1000) {
                            break;
                        }
                    }
                }
            }
            return childTemp;
        },
        sosoSelect: function(item) {
            reportDeviceId = item.deviceid;
            this.sosoValue = item.allDeviceIdTitle;
            this.queryDeviceId = item.deviceid;
            this.isShowMatchDev = false;
        },
        getDeviceTitle: function(deviceid) {
            var title = "";
            this.groupslist.forEach(function(group) {
                var isReturn = false;
                group.devices.forEach(function(device) {
                    if (device.deviceid === deviceid) {
                        isReturn = true;
                        title = device.title;
                        return false;
                    }
                });
                if (isReturn) { return false };
            });
            return title;
        },
        onCheckedDevice: function(arr) {

            this.checkedDevice = arr;
            var sosoValue = "";
            var selectedCount = 0;
            arr.forEach(function(item) {
                if (item.deviceid != null) {
                    sosoValue += item.name + ","
                    selectedCount++;
                }
            });
            this.sosoValue = sosoValue;
            this.selectedCount = selectedCount;
            var allNodes = this.zTreeObj.getNodes();
            GlobalOrgan.getInstance().globalSelectedTreeData = null;
            GlobalOrgan.getInstance().globalSelectedTreeData = deepClone(allNodes);
        },
        initZTree: function(rootuser) {
            var me = this;
            this.treeDeviceList = [utils.castUsersTreeToDevicesTree(rootuser, true, false)];
            if (GlobalOrgan.getInstance().globalSelectedTreeData == null) {
                GlobalOrgan.getInstance().globalSelectedTreeData = this.treeDeviceList;
            }
            this.setting = {
                check: {
                    enable: true,
                    chkStyle: "checkbox",
                    chkboxType: {
                        "Y": "ps",
                        "N": "ps"
                    }
                },
                callback: {
                    onCheck: function(id, ztree) {
                        var checkedNodes = me.zTreeObj.getCheckedNodes();
                        me.onCheckedDevice(checkedNodes);
                    }
                }
            };
            this.zTreeObj = $.fn.zTree.init($("#ztree"), this.setting, GlobalOrgan.getInstance().globalSelectedTreeData);
            this.selectedLastActiveDevice();

        },
        selectedLastActiveDevice: function() {
            var selectedDevices = this.zTreeObj.getCheckedNodes();
            if (selectedDevices.length > 0) {
                var sosoValue = '';
                var selectedCount = 0;
                selectedDevices.forEach(function(item) {
                    if (item.deviceid != null) {
                        sosoValue += item.name + ","
                        selectedCount++;
                    }
                });
                this.sosoValue = sosoValue;
                this.selectedCount = selectedCount;
                this.checkedDevice = selectedDevices;
            }
        },
    },
    mounted: function() {
        var me = this;
        this.calcTableHeight();
        window.onresize = function() {
            me.calcTableHeight();
        }
    },
    destroyed: function() {
        this.zTreeObj && this.zTreeObj.destroy();
    },
    created: function() {
        this.checkedDevice = [];
    },
};

var reportMixin = {
    data: {
        readonly: true,
        dateVal: [DateFormat.longToDateStr(Date.now(), timeDifference), DateFormat.longToDateStr(Date.now(), timeDifference)],
        total: 0,
        currentPageIndex: 1,
        lastTableHeight: 100,
        posiDetailHeight: 100,
        placeholder: "",
        sosoValue: '',
        isShowMatchDev: true,
        filterData: [],
        queryDeviceId: '',
        dayNumberType: 0,
    },
    methods: {
        changePage: function(index) {
            var offset = index * 20;
            var start = (index - 1) * 20;
            this.currentPageIndex = index;
            this.tableData = this.cmdRecords.slice(start, offset);
        },
        onClickOutside: function() {
            this.readonly = true;
            this.isShowMatchDev = false;
        },
        onChange: function(value) {
            this.dateVal = value;
        },
        handleSelectdDate: function(dayNumber) {
            this.dayNumberType = dayNumber;
            var dayTime = 24 * 60 * 60 * 1000;
            if (dayNumber == 0) {
                this.dateVal = [DateFormat.longToDateStr(Date.now(), timeDifference), DateFormat.longToDateStr(Date.now(), timeDifference)];
            } else if (dayNumber == 1) {
                this.dateVal = [DateFormat.longToDateStr(Date.now() - dayTime, timeDifference), DateFormat.longToDateStr(Date.now() - dayTime, timeDifference)];
            } else if (dayNumber == 3) {
                this.dateVal = [DateFormat.longToDateStr(Date.now() - dayTime * 2, timeDifference), DateFormat.longToDateStr(Date.now(), timeDifference)];
            } else if (dayNumber == 7) {
                this.dateVal = [DateFormat.longToDateStr(Date.now() - dayTime * 6, timeDifference), DateFormat.longToDateStr(Date.now(), timeDifference)];
            }
        },
        focus: function() {
            this.readonly = false;
            var me = this;
            if (this.sosoValue && this.sosoValue.trim()) {
                me.sosoValueChange()
            } else {
                this.groupslist.forEach(function(group) {
                    group.devices.forEach(function(device) {
                        device.isOnline = vstore.state.deviceInfos[device.deviceid] ? vstore.state.deviceInfos[device.deviceid].isOnline : false;
                    })
                });
                this.filterData = this.groupslist;
                this.isShowMatchDev = true;
                this.queryDeviceId = '';
                reportDeviceId = null;
            }
        },
        sosoValueChange: function() {
            var me = this;
            var value = this.sosoValue;

            if (this.timeoutIns != null) {
                clearTimeout(this.timeoutIns);
            };

            this.timeoutIns = setTimeout(function() {
                me.filterMethod(value);
            }, 300);
        },
        filterMethod: function(value) {
            var filterData = [];
            value = value.toLowerCase();
            for (var i = 0; i < this.groupslist.length; i++) {
                var group = this.groupslist[i];
                if (
                    group.groupname.toLowerCase().indexOf(value) !== -1 ||
                    group.firstLetter.indexOf(value) !== -1 ||
                    group.pinyin.indexOf(value) !== -1
                ) {
                    group.devices.forEach(function(device) {
                        device.isOnline = vstore.state.deviceInfos[device.deviceid] ? vstore.state.deviceInfos[device.deviceid].isOnline : false;
                    })
                    var copyGroup = deepClone(group);
                    copyGroup.devices = copyGroup.devices.slice(0, 9);
                    filterData.push(copyGroup)
                } else {
                    var devices = group.devices
                    var obj = {
                        groupname: group.groupname,
                        devices: []
                    }
                    for (var j = 0; j < devices.length; j++) {
                        var device = devices[j]
                        var title = device.allDeviceIdTitle
                        device.isOnline = vstore.state.deviceInfos[device.deviceid] ? vstore.state.deviceInfos[device.deviceid].isOnline : false;
                        if (
                            title.toLowerCase().indexOf(value) !== -1 ||
                            device.firstLetter.indexOf(value) !== -1 ||
                            device.pinyin.indexOf(value) !== -1
                        ) {
                            obj.devices.push(device)
                        } else {
                            if (device.remark) {
                                if (device.remark.indexOf(value) !== -1) {
                                    obj.devices.push(device);
                                };
                            };
                        };
                        if (obj.devices.length >= 10) {
                            break;
                        }
                    }
                    if (obj.devices.length) {
                        filterData.push(obj);
                        if (filterData.length >= 10) {
                            break;
                        }
                    };
                };
            };
            this.filterData = filterData;
            if (!this.isShowMatchDev) {
                this.isShowMatchDev = true;
            };
            if (!value) {
                this.queryDeviceId = '';
                reportDeviceId = null;
            }
        },
        sosoSelect: function(item) {
            reportDeviceId = item.deviceid;
            this.sosoValue = item.allDeviceIdTitle;
            this.queryDeviceId = item.deviceid;
            this.isShowMatchDev = false;
        },
        getDeviceTitle: function(deviceid) {
            var title = "";
            this.groupslist.forEach(function(group) {
                var isReturn = false;
                group.devices.forEach(function(device) {
                    if (device.deviceid === deviceid) {
                        isReturn = true;
                        title = device.devicename + '-' + device.deviceid;
                        return false;
                    }
                });
                if (isReturn) { return false };
            });
            return title;
        },
        cleanSelectedDev: function() {
            this.sosoValue = '';
            this.queryDeviceId = '';
        }
    },
    mounted: function() {
        var me = this;
        this.calcTableHeight();
        this.$nextTick(function() {
            if (reportDeviceId) {
                me.queryDeviceId = reportDeviceId;
                me.sosoValue = me.getDeviceTitle(reportDeviceId);
            }
        });
        window.onresize = function() {
            me.calcTableHeight();
            me.chartsIns && me.chartsIns.resize();
        }
    }
}




//  指令查询 DateFormat.longToDateStr(Date.now(),0)
function cmdReport(groupslist) {

    vueInstanse = new Vue({
        el: "#cmd-report",
        i18n: utils.getI18n(),
        data: {
            loading: false,
            groupslist: [],
            columns: [
                { title: vRoot.$t("reportForm.index"), key: "index", width: 90, align: 'center', sortable: true },
                { title: vRoot.$t("alarm.devName"), key: 'deviceName', sortable: true },
                { title: vRoot.$t("user.cmdName"), key: 'cmdname', sortable: true },
                { title: vRoot.$t("reportForm.sendDate"), key: 'cmdtimeStr', sortable: true },
                { title: vRoot.$t("reportForm.content"), key: 'cmdparams', sortable: true },
                { title: vRoot.$t("reportForm.sendResult"), key: 'result', sortable: true },
            ],
            tableData: [],
            cmdRecords: []
        },
        mixins: [reportMixin],
        methods: {
            calcTableHeight: function() {
                var wHeight = window.innerHeight;
                this.lastTableHeight = wHeight - 170 + 40;
                this.posiDetailHeight = wHeight - 144 + 40;
            },
            onClickQuery: function() {
                if (this.queryDeviceId == "") { return };
                var self = this;
                if (this.isSelectAll === null) {
                    this.$Message.error(this.$t("reportForm.selectDevTip"));
                    return;
                };
                var data = {
                    // username: vstore.state.userName,
                    startday: this.dateVal[0],
                    endday: this.dateVal[1],
                    offset: timeDifference,
                    devices: [this.queryDeviceId],
                };
                this.loading = true;
                utils.sendAjax(myUrls.reportCmd(), data, function(resp) {
                    self.loading = false;
                    if (resp.status == 0) {
                        if (resp.cmdrecords) {

                            resp.cmdrecords.forEach(function(item, index) {
                                item.index = ++index;
                                item.cmdtimeStr = DateFormat.longToDateTimeStr(item.cmdtime, timeDifference);
                                item.deviceName = vstore.state.deviceInfos[item.deviceid].devicename;
                            });
                            self.cmdRecords = resp.cmdrecords;
                            self.total = self.cmdRecords.length;
                            self.tableData = self.cmdRecords;
                            self.currentPageIndex = 1;
                        } else {
                            self.$Message.error(self.$t("reportForm.noRecord"));
                        }
                    } else {
                        self.$Message.error(resp.cause);
                    }
                })
            },
            onSortChange: function(column) {

            }
        },
        mounted: function() {
            this.groupslist = groupslist;
        }
    });
}
// 位置报表
function posiReport(groupslist) {
    vueInstanse = new Vue({
        el: "#posi-report",
        i18n: utils.getI18n(),
        data: {
            total: 0,
            currentIndex: 1,
            loading: false,
            mapModal: false,
            trackDetailModal: false,
            mapType: null,
            groupslist: [],
            minuteNum: 5,
            tabValue: "lastPosi",
            markerIns: null,
            isSpin: false,
            lastPosiColumns: [
                { title: vRoot.$t("reportForm.index"), key: 'idx', width: 60, align: 'center', fixed: 'left' },
                { title: vRoot.$t("alarm.devName"), key: 'devicename', width: 150, fixed: 'left' },
                { title: vRoot.$t("alarm.devNum"), key: 'deviceid', width: 150 },
                { title: vRoot.$t("reportForm.lon"), key: 'fixedLon', width: 100 },
                { title: vRoot.$t("reportForm.lat"), key: 'fixedLat', width: 100 },
                { title: vRoot.$t("reportForm.direction"), key: 'direction', width: 100 },
                { title: vRoot.$t("reportForm.speed"), key: 'speed', width: 100 },
                { title: vRoot.$t("reportForm.downOfflineDuration"), key: 'downOfflineDuration', width: 180, },
                { title: vRoot.$t("reportForm.date"), key: 'updatetimeStr', width: 160 },
                { title: vRoot.$t("reportForm.status"), key: isZh ? 'strstatus' : 'strstatusen', width: 180 },
                { title: vRoot.$t("reportForm.posiType"), key: 'positype', width: 115 },
                { title: vRoot.$t("reportForm.address"), key: 'address', width: 410 },
                {
                    title: vRoot.$t("bgMgr.action"),
                    key: 'action',
                    width: 190,
                    fixed: 'right',
                    render: function(h, params) {
                        return h('div', [
                            h('Button', {
                                props: {
                                    type: 'primary',
                                    size: 'small'
                                },
                                style: {
                                    marginRight: '5px'
                                },
                                on: {
                                    click: function() {
                                        vueInstanse.loading = true;
                                        vueInstanse.trackDetailModal = true;
                                        vueInstanse.deviceName = params.row.devicename;
                                        vueInstanse.querySingleDevTracks(params.row.deviceid, function() {
                                            vueInstanse.loading = false;
                                        });
                                    }
                                }
                            }, vRoot.$t("reportForm.AddressDetails")),
                            h('Button', {
                                props: {
                                    type: 'primary',
                                    size: 'small',
                                    disabled: params.row.disabled,
                                },
                                style: {

                                },
                                on: {
                                    click: function() {
                                        vueInstanse.getAddress(0, params);
                                    }
                                }
                            }, vRoot.$t("reportForm.getAddress"))
                        ]);
                    }
                }
            ],
            posiDetailColumns: [
                { title: '#', key: 'index', width: 70, fixed: 'left', },
                { title: vRoot.$t("alarm.devNum"), key: 'deviceid', width: 150, fixed: 'left', },
                { title: vRoot.$t("reportForm.lon"), key: 'fixedLon', width: 100 },
                { title: vRoot.$t("reportForm.lat"), key: 'fixedLat', width: 100 },
                { title: vRoot.$t("reportForm.direction"), key: 'direction', width: 90 },
                { title: vRoot.$t("reportForm.speed"), key: 'speed', width: 100 },
                { title: vRoot.$t("reportForm.date"), key: 'updatetimeStr', width: 160, sortable: true },
                { title: vRoot.$t("reportForm.status"), key: 'strstatus', width: 180, },
                { title: vRoot.$t("reportForm.posiType"), key: 'positype', width: 115 },
                { title: vRoot.$t("reportForm.address"), key: 'address', width: 600 },
                {
                    title: vRoot.$t("bgMgr.action"),
                    key: 'action',
                    width: 210,
                    fixed: 'right',
                    render: function(h, params) {
                        return h('div', [
                            h('Button', {
                                props: {
                                    type: 'primary',
                                    size: 'small'
                                },
                                style: {
                                    marginRight: '5px'
                                },
                                on: {
                                    click: function() {
                                        utils.showWindowMap(vueInstanse, params);
                                    }
                                }
                            }, vRoot.$t("reportForm.seePosi")),
                            h('Button', {
                                props: {
                                    type: 'primary',
                                    size: 'small',
                                    disabled: params.row.disabled,
                                },
                                on: {
                                    click: function() {
                                        vueInstanse.getAddress(1, params);
                                    }
                                }
                            }, vRoot.$t("reportForm.getAddress"))
                        ]);
                    }
                }
            ],
            lastPosiData: [],
            posiDetailData: [],
            tableData: [],
            mapInstance: null,
            deviceName: '',
            idx: 1,
            maxLen: 0,
            queryLoading: false,
            currentIndex: 1,
            total: 0,
            pageSize: 20,

        },
        mixins: [treeMixin],
        methods: {
            changePage: function(index) {
                var offset = index * this.pageSize;
                var start = (index - 1) * this.pageSize;
                this.currentIndex = index;
                this.posiDetailData = this.allPosiDetailData.slice(start, offset);
            },
            getAllTracksAddress: function() {
                var me = this;
                var maxLen = this.posiDetailData.length;
                this.maxLen = maxLen;
                this.queryLoading = true;
                this.idx = 0;
                var hasQueryedLatLon = {};
                this.posiDetailData.forEach(function(track) {
                    var callon = track.fixedLon;
                    var callat = track.fixedLat;
                    var address = LocalCacheMgr.getAddress(callon, callat);
                    if (address == null) {
                        var key = callat + "|" + callon;
                        if (hasQueryedLatLon[key] == null) {
                            hasQueryedLatLon[key] = true;
                            (function(track) {
                                utils.getJiuHuAddressSyn(track.callon, track.callat, function(resp) {
                                    if (resp && resp.address) {
                                        track.address = resp.address;
                                        track.disabled = true;
                                        LocalCacheMgr.setAddress(track.callon, track.callat, track.address);
                                    }
                                    me.idx = me.idx + 1;
                                    if (me.idx >= maxLen) {
                                        me.queryLoading = false;
                                        me.readLocalAddress();
                                    }
                                }, function(e) {
                                    me.idx = me.idx + 1;
                                    if (me.idx >= maxLen) {
                                        me.queryLoading = false;
                                        me.readLocalAddress();
                                    }
                                });
                            })(track);
                        } else {
                            me.idx = me.idx + 1;
                            if (me.idx >= maxLen) {
                                me.queryLoading = false;
                                me.readLocalAddress();
                            }
                        }
                    } else {
                        track.address = address;
                        me.idx = me.idx + 1;
                        if (me.idx >= maxLen) {
                            me.queryLoading = false;
                            me.readLocalAddress();
                        }
                    }
                });
            },
            readLocalAddress: function() {
                this.posiDetailData.forEach(function(track) {
                    var callon = track.fixedLon;
                    var callat = track.fixedLat;
                    var address = LocalCacheMgr.getAddress(callon, callat);
                    if (!track.address) {
                        track.address = address;
                    }
                });
            },
            exportData: function() {
                var tableData = deepClone(this.lastPosiData);
                var columns = deepClone(this.lastPosiColumns);
                columns.pop();
                tableData.forEach(function(item) {
                    item.deviceid = "\t" + item.deviceid;
                    item.updatetimeStr = "\t" + item.updatetimeStr;
                    item.devicename = "\t" + item.devicename;
                });
                this.$refs.lastTable.exportCsv({
                    filename: vRoot.$t('reportForm.posiReport'),
                    original: false,
                    columns: columns,
                    data: tableData
                });
            },
            exportDetailData: function() {
                var tableData = deepClone(this.allPosiDetailData);
                var columns = deepClone(this.posiDetailColumns);
                columns.pop();
                this.$refs.totalTable.exportCsv({
                    filename: isZh ? this.deviceName + " -位置详细报表" : this.deviceName + "-PosiDetailReport",
                    original: false,
                    columns: columns,
                    data: tableData
                });
            },
            calcTableHeight: function() {
                var wHeight = window.innerHeight;
                this.lastTableHeight = wHeight - 130;
                this.posiDetailHeight = wHeight - 146;
            },
            onClickQuery: function() {
                var me = this;
                var deviceids = [];
                this.checkedDevice.forEach(function(group) {
                    if (!group.children) {
                        if (group.deviceid != null) {
                            deviceids.push(group.deviceid);
                        }
                    }
                });
                if (deviceids.length) {

                    this.loading = true;
                    this.getLastPosition(deviceids, function() {
                        me.loading = false;
                    });
                } else {
                    me.$Message.error(me.$t('reportForm.selectDevTip'));
                }

            },
            getLastPosition: function(deviceIds, callback) {
                var me = this;
                var url = myUrls.lastPosition();
                var data = {
                    username: userName,
                    deviceids: deviceIds
                }
                utils.sendAjax(url, data, function(resp) {
                    if (resp.status == 0) {
                        if (resp.records) {
                            var newCored = [];
                            resp.records.forEach(function(item, index) {
                                if (item) {
                                    var time = Date.now() - item.updatetime;
                                    var deviceid = item.deviceid;
                                    item.idx = index + 1;
                                    item.devicename = vstore.state.deviceInfos[deviceid].devicename;
                                    item.updatetimeStr = DateFormat.longToDateTimeStr(item.updatetime, timeDifference);
                                    item.fixedLon = item.callon.toFixed(5);
                                    item.fixedLat = item.callat.toFixed(5);
                                    var address = LocalCacheMgr.getAddress(item.fixedLon, item.fixedLat);
                                    item.address = address ? address : '';
                                    item.disabled = address ? true : false;
                                    newCored.push(item);
                                    item.positype = utils.getPosiType(item);
                                    item.direction = utils.getCarDirection(item.course);
                                    item.downOfflineDuration = time > 600000 ? utils.timeStamp(Date.now() - item.updatetime) : vRoot.$t('monitor.online');
                                    item.speed = item.speed == 0 ? item.speed : (item.speed / 1000).toFixed(2) + "h/km";
                                }
                            });

                            me.lastPosiData = newCored;

                        } else {

                        }
                    }
                })
                callback();
            },
            querySingleDevTracks: function(deviceid, callback) {
                var me = this;
                var url = myUrls.queryTracks();
                var data = {
                    "deviceid": deviceid,
                    "begintime": this.dateVal[0] + " 00:00:00",
                    "endtime": this.dateVal[1] + " 23:59:00",
                    'interval': this.minuteNum * 60,
                    'timezone': timeDifference
                };

                utils.sendAjax(url, data, function(resp) {

                    if (resp.status === 0) {
                        if (resp.records && resp.records.length) {
                            var newArr = [];
                            var devicename = vstore.state.deviceInfos[deviceid].devicename;
                            resp.records.sort(function(a, b) {
                                return b.updatetime - a.updatetime;
                            });
                            resp.records.forEach(function(item, idx) {
                                var fixedLon = item.callon.toFixed(5);
                                var fixedLat = item.callat.toFixed(5);
                                var address = LocalCacheMgr.getAddress(fixedLon, fixedLat);
                                newArr.push({
                                    index: idx + 1,
                                    deviceid: "\t" + deviceid,
                                    devicename: devicename,
                                    updatetimeStr: "\t" + DateFormat.longToDateTimeStr(item.updatetime, timeDifference),
                                    callon: item.callon,
                                    callat: item.callat,
                                    fixedLon: fixedLon,
                                    fixedLat: fixedLat,
                                    strstatus: item.strstatus,
                                    strstatusen: item.strstatusen,
                                    positype: utils.getPosiType(item),
                                    address: address ? address : '',
                                    disabled: address ? true : false,
                                    direction: item.direction = utils.getCarDirection(item.course),
                                    speed: item.speed == 0 ? item.speed : (item.speed / 1000).toFixed(2) + "h/km"
                                })
                            });
                            me.allPosiDetailData = newArr;
                            me.posiDetailData = newArr.slice(0, me.pageSize);
                            me.total = newArr.length;
                            me.currentIndex = 1;

                        } else {
                            me.allPosiDetailData = [];
                            me.posiDetailData = [];
                            me.currentIndex = 1;
                            me.total = 0;
                        }
                    } else {
                        me.allPosiDetailData = [];
                        me.posiDetailData = [];
                        me.currentIndex = 1;
                        me.total = 0;
                    }
                    callback();
                });
            },
            initMap: function() {
                this.markerLayer = null;
                this.mapInstance = utils.initWindowMap('posi-map');
            },
            getAddress: function(type, params) {
                var me = this;
                var row = params.row;
                var index = params.index;
                utils.queryAddress(row, function(address) {
                    if (type === 0) {
                        me.lastPosiData[index].address = address;
                        me.lastPosiData[index].disabled = true;
                    } else if (type === 1) {
                        me.posiDetailData[index].address = address;
                        me.posiDetailData[index].disabled = true;
                    }
                    LocalCacheMgr.setAddress(row.fixedLon, row.fixedLat, address);
                });
            },
            queryDevicesTree: function() {
                var me = this;
                this.isSpin = true;
                GlobalOrgan.getInstance().getGlobalOrganData(function(rootuser) {
                    me.isSpin = false;
                    me.initZTree(rootuser);
                })
            },
        },
        watch: {
            trackDetailModal: function() {
                if (!this.trackDetailModal) {
                    this.posiDetailData = [];
                }
            }
        },
        mounted: function() {
            var me = this;
            this.mapType = utils.getMapType();
            this.initMap();
            this.allPosiDetailData = [];
            this.queryDevicesTree();
        }
    })
}

// 里程详单
function reportMileageDetail(groupslist) {
    vueInstanse = new Vue({
        el: '#mileage-detail',
        i18n: utils.getI18n(),
        mixins: [reportMixin],
        data: {
            loading: false,
            dateVal: [DateFormat.longToDateStr(Date.now(), timeDifference), DateFormat.longToDateStr(Date.now(), timeDifference)],
            lastTableHeight: 100,
            groupslist: [],
            timeoutIns: null,
            isShowMatchDev: true,
            columns: [
                { title: vRoot.$t("alarm.devName"), key: 'deviceName' },
                { title: vRoot.$t("reportForm.date"), key: 'day', sortable: true },
                { title: vRoot.$t("reportForm.minMileage"), key: 'mintotaldistance', sortable: true },
                { title: vRoot.$t("reportForm.maxMileage"), key: 'maxtotaldistance', sortable: true },
                { title: vRoot.$t("reportForm.totalMileage"), key: 'totaldistance', sortable: true },
            ],
            tableData: []
        },
        methods: {
            onChange: function(value) {
                this.dateVal = value;
            },
            calcTableHeight: function() {
                var wHeight = window.innerHeight;
                this.lastTableHeight = wHeight - 130;
                this.posiDetailHeight = wHeight - 104;
            },
            onClickQuery: function() {
                if (this.queryDeviceId) {
                    var me = this;
                    var url = myUrls.reportMileageDetail();
                    var data = {
                        startday: this.dateVal[0],
                        endday: this.dateVal[1],
                        offset: timeDifference,
                        deviceid: this.queryDeviceId
                    }
                    me.loading = true;
                    utils.sendAjax(url, data, function(resp) {
                        me.loading = false;
                        if (resp.status === 0) {
                            if (resp.records.length) {
                                var total = 0;
                                resp.records.forEach(function(item) {
                                    total += item.totaldistance;
                                    item.deviceName = vstore.state.deviceInfos[me.queryDeviceId].devicename;
                                    item.mintotaldistance = utils.getMileage(item.mintotaldistance);
                                    item.maxtotaldistance = utils.getMileage(item.maxtotaldistance);
                                    item.totaldistance = utils.getMileage(item.totaldistance);
                                });
                                resp.records.push({
                                    totaldistance: me.$t("reportForm.total") + utils.getMileage(total),
                                });
                                me.tableData = resp.records;
                            } else {
                                me.tableData = [];
                            };
                        } else {
                            me.tableData = [];
                        }
                    })
                } else {
                    this.$Message.error(this.$t("reportForm.selectDevTip"));
                }
            }
        },
        mounted: function() {
            var me = this;
            this.groupslist = groupslist;
            this.calcTableHeight();
            window.onresize = function() {
                me.calcTableHeight();
            }
        }
    })
}



function mileageMonthReport(groupslist) {
    vueInstanse = new Vue({
        el: '#month-mileage',
        i18n: utils.getI18n(),
        mixins: [treeMixin],
        data: {
            loading: false,
            isSpin: false,
            dateVal: [DateFormat.longToDateStr(Date.now(), timeDifference), DateFormat.longToDateStr(Date.now(), timeDifference)],
            lastTableHeight: 100,
            groupslist: [],
            timeoutIns: null,
            month: '',
            columns: [],
            tableData: [],
            currentIndex: 1,
            dateOptions: {
                disabledDate(date) {
                    return (date && date.valueOf()) > Date.now();
                }
            },
        },
        methods: {
            exportData: function() {
                this.$refs.table.exportCsv({
                    filename: vRoot.$t('reportForm.mileageMonthReport') + '_' + DateFormat.format(this.month, 'yyyy-MM'),
                    original: false,
                    columns: this.columns,
                    data: this.records
                });
            },
            cleanSelected: function(treeDataFilter) {
                var that = this;
                for (var i = 0; i < treeDataFilter.length; i++) {
                    var item = treeDataFilter[i];
                    if (item != null) {
                        item.checked = false;
                        if (item.children && item.children.length > 0) {
                            that.cleanSelected(item.children);
                        }
                    }
                }
            },
            changePage: function(index) {
                var offset = index * 20;
                var start = (index - 1) * 20;
                this.currentIndex = index;
                this.tableData = this.records.slice(start, offset);
            },
            calcTableHeight: function() {
                var wHeight = window.innerHeight;
                this.lastTableHeight = wHeight - 175;
            },
            onClickQuery: function() {
                var deviceids = [];
                this.checkedDevice.forEach(function(group) {
                    if (!group.children) {
                        if (group.deviceid != null) {
                            deviceids.push(group.deviceid);
                        }
                    }
                });
                if (deviceids.length > 0) {
                    var me = this;
                    var url = myUrls.reportMileageMonth();
                    var yearmonth = DateFormat.format(this.month, 'yyyy-MM');
                    var yearmonthArr = yearmonth.split("-");
                    var data = {
                        year: Number(yearmonthArr[0]),
                        month: Number(yearmonthArr[1]),
                        offset: timeDifference,
                        deviceids: deviceids
                    }
                    me.loading = true;
                    utils.sendAjax(url, data, function(resp) {
                        // console.log(resp);
                        me.loading = false;
                        if (resp.status === 0) {
                            var dayLen = me.getTheMonthDays(me.month);
                            if (resp.devices.length) {
                                resp.devices.forEach(function(item, idx) {
                                    item.index = idx + 1;

                                    var deviceid = item.deviceid;
                                    var records = item.records;
                                    var totaldistance = 0;
                                    for (var j = 0; j < dayLen; j++) {
                                        var day = records[j];
                                        if (day) {
                                            var key = day.day.split('-')[2];
                                            var distance = day.maxtotaldistance - day.mintotaldistance;
                                            totaldistance += distance;
                                            item['day' + String(parseInt(key))] = utils.getMileage(distance);
                                        }
                                    }
                                    for (var k = 0; k < dayLen; k++) {
                                        var key = 'day' + (k + 1);
                                        if (!item[key]) {
                                            item[key] = '-';
                                        }
                                    }
                                    item.devicename = "\t" + (vstore.state.deviceInfos[deviceid] ? vstore.state.deviceInfos[deviceid].devicename : deviceid);
                                    item.deviceid = "\t" + deviceid;
                                    item.totaldistance = utils.getMileage(totaldistance);
                                });
                                me.records = resp.devices;
                                me.tableData = me.records.slice(0, 20);
                                me.total = me.records.length;

                            } else {
                                me.tableData = [];
                            };
                            me.currentIndex = 1;
                        } else {
                            me.tableData = [];
                        }
                    })
                } else {
                    this.$Message.error(this.$t("reportForm.selectDevTip"));
                }
            },
            queryDevicesTree: function() {
                var me = this;
                this.isSpin = true;
                GlobalOrgan.getInstance().getGlobalOrganData(function(rootuser) {
                    me.isSpin = false;
                    me.initZTree(rootuser);
                })
            },
            getTheMonthDays: function(date) {
                var year = date.getFullYear();
                var month = date.getMonth() + 1;
                year = month == 12 ? year + 1 : year;
                month = month == 12 ? 1 : month;
                return new Date(new Date(year, month, 1) - 1).getDate();
            },
        },
        watch: {
            month: function(newMonth) {

                var columns = [
                    { key: 'index', width: 70, title: vRoot.$t("reportForm.index"), fixed: 'left' },
                    { title: vRoot.$t("alarm.devName"), key: 'devicename', width: 100, fixed: 'left' },
                    { title: vRoot.$t("alarm.devNum"), key: 'deviceid', width: 100, fixed: 'left' },
                    { title: vRoot.$t("reportForm.totalMileage"), key: 'totaldistance', sortable: true, width: 100, fixed: 'left' },
                ];

                var day = this.getTheMonthDays(newMonth);

                for (var i = 1; i <= day; i++) {
                    columns.push({
                        key: 'day' + i,
                        title: i,
                        width: 80,
                        sortable: true,
                    })
                }

                this.columns = columns;
            },
        },
        mounted: function() {
            var me = this;
            me.month = new Date();
            me.records = [];
            me.queryDevicesTree();
            this.calcTableHeight();
            window.onresize = function() {
                me.calcTableHeight();
            }
        }
    })
}

function groupMileage(groupslist) {
    vueInstanse = new Vue({
        el: '#group-mileage',
        i18n: utils.getI18n(),
        mixins: [treeMixin],
        data: {
            loading: false,
            isSpin: false,
            dateVal: [DateFormat.longToDateStr(Date.now(), timeDifference), DateFormat.longToDateStr(Date.now(), timeDifference)],
            lastTableHeight: 100,
            groupslist: [],
            timeoutIns: null,
            columns: [
                { key: 'index', width: 70, title: vRoot.$t("reportForm.index") },
                { title: vRoot.$t("alarm.devName"), key: 'devicename' },
                { title: vRoot.$t("alarm.devNum"), key: 'deviceid' },
                {
                    title: vRoot.$t("monitor.groupName"),
                    key: 'groupid',
                    render: function(h, params) {
                        var deviceid = params.row.deviceid;
                        var groupName = '';

                        for (var i = 0; i < groupslist.length; i++) {
                            var group = groupslist[i];
                            for (var j = 0; j < group.devices.length; j++) {
                                var device = group.devices[j];

                                if (device.deviceid === deviceid) {
                                    if (group.groupname.indexOf('-') == -1) {
                                        groupName = group.groupname;
                                    } else {
                                        groupName = group.groupname.split('-')[1];
                                    }
                                    break;
                                }
                                if (groupName != '') { break };
                            }
                        }

                        return h('span', {}, groupName)
                    }
                },
                { title: vRoot.$t("reportForm.totalMileage") + '(km)', key: 'totaldistance', sortable: true },
                { title: vRoot.$t("reportForm.startDate"), key: 'starttimeStr' },
                { title: vRoot.$t("reportForm.endDate"), key: 'endtimeStr' },
                { title: vRoot.$t("reportForm.minMileage") + '(km)', key: 'startdistance' },
                { title: vRoot.$t("reportForm.maxMileage") + '(km)', key: 'enddistance' },

            ],
            tableData: [],
            currentIndex: 1,
        },
        methods: {

            cleanSelected: function(treeDataFilter) {
                var that = this;
                for (var i = 0; i < treeDataFilter.length; i++) {
                    var item = treeDataFilter[i];
                    if (item != null) {
                        item.checked = false;
                        if (item.children && item.children.length > 0) {
                            that.cleanSelected(item.children);
                        }
                    }
                }
            },
            changePage: function(index) {
                var offset = index * 20;
                var start = (index - 1) * 20;
                this.currentIndex = index;
                this.tableData = this.records.slice(start, offset);
            },
            calcTableHeight: function() {
                var wHeight = window.innerHeight;
                this.lastTableHeight = wHeight - 170;
            },
            onClickQuery: function() {
                var deviceids = [];
                this.checkedDevice.forEach(function(group) {
                    if (!group.children) {
                        if (group.deviceid != null) {
                            deviceids.push(group.deviceid);
                        }
                    }
                });
                if (deviceids.length > 0) {
                    var me = this;
                    var url = myUrls.reportMileageSummary();
                    var data = {
                        startday: this.dateVal[0],
                        endday: this.dateVal[1],
                        offset: timeDifference,
                        deviceids: deviceids
                    }
                    me.loading = true;
                    utils.sendAjax(url, data, function(resp) {
                        me.loading = false;
                        if (resp.status === 0) {
                            if (resp.records.length) {
                                resp.records.forEach(function(item, index) {
                                    item.index = index + 1;
                                    if (item.starttime == 0) {
                                        item.starttimeStr = me.$t("reportForm.empty");
                                    } else {
                                        item.starttimeStr = DateFormat.longToDateTimeStr(item.starttime, timeDifference);
                                    }
                                    if (item.endtime == 0) {
                                        item.endtimeStr = me.$t("reportForm.empty");;
                                    } else {
                                        item.endtimeStr = DateFormat.longToDateTimeStr(item.endtime, timeDifference);
                                    }
                                    item.devicename = vstore.state.deviceInfos[item.deviceid] ? vstore.state.deviceInfos[item.deviceid].devicename : item.deviceid;
                                    item.enddistance != 0 ? item.enddistance = (item.enddistance / 1000).toFixed(2) : null;
                                    item.startdistance != 0 ? item.startdistance = (item.startdistance / 1000).toFixed(2) : null;
                                    item.totaldistance != 0 ? item.totaldistance = (item.totaldistance / 1000).toFixed(2) : null;
                                });
                                me.records = resp.records;
                                me.tableData = me.records.slice(0, 20);
                                me.total = me.records.length;

                            } else {
                                me.tableData = [];
                            };
                            me.currentIndex = 1;
                        } else {
                            me.tableData = [];
                        }
                    })
                } else {
                    this.$Message.error(this.$t("reportForm.selectDevTip"));
                }
            },
            queryDevicesTree: function() {
                var me = this;
                this.isSpin = true;
                GlobalOrgan.getInstance().getGlobalOrganData(function(rootuser) {
                    me.isSpin = false;
                    me.initZTree(rootuser);
                })
            },
        },
        mounted: function() {
            var me = this;
            me.records = [];
            me.handleSelectdDate(1);
            me.queryDevicesTree();
            this.calcTableHeight();
            window.onresize = function() {
                me.calcTableHeight();
            }
        }
    })
}


// 停车表报
function parkDetails(groupslist) {
    vueInstanse = new Vue({
        el: '#park-details',
        i18n: utils.getI18n(),
        mixins: [reportMixin],
        data: {
            mapModal: false,
            mapType: utils.getMapType(),
            mapInstance: null,
            markerIns: null,
            loading: false,
            dateVal: [DateFormat.longToDateStr(Date.now(), timeDifference), DateFormat.longToDateStr(Date.now(), timeDifference)],
            lastTableHeight: 100,
            groupslist: [],
            timeoutIns: null,
            columns: [
                { type: 'index', width: 60, align: 'center' },
                { title: vRoot.$t("alarm.devName"), key: 'deviceName', width: 160 },
                { title: vRoot.$t("reportForm.startDate"), key: 'startDate', width: 180 },
                { title: vRoot.$t("reportForm.endDate"), key: 'endDate', width: 180 },
                { title: vRoot.$t("reportForm.parkDate"), key: 'parkTime', width: 160 },
                {
                    title: vRoot.$t("reportForm.lon") + "," + vRoot.$t("reportForm.lat"),
                    width: 160,
                    key: 'callon_callat',
                    render: function(h, params) {
                        return h('div', [
                            h('a', {
                                props: {
                                    type: 'primary',
                                    size: 'small'
                                },
                                style: {
                                    marginRight: '5px'
                                },
                                on: {
                                    click: function() {
                                        utils.showWindowMap(vueInstanse, params);
                                    }
                                }
                            }, params.row.callon_callat)
                        ]);
                    }
                },
                {
                    title: vRoot.$t("reportForm.address"),
                    key: 'address',
                    render: function(h, params) {
                        var disabled = params.row.disabled;
                        var node = null;
                        if (disabled) {
                            node = h('div', {
                                props: {},
                                style: {},
                                on: {}
                            }, params.row.address);
                        } else {
                            node = h('Button', {
                                props: {
                                    type: 'primary',
                                    size: 'small',
                                    disabled: params.row.disabled,
                                },
                                on: {
                                    click: function() {
                                        vueInstanse.getAddress(params);
                                    }
                                }
                            }, vRoot.$t("reportForm.getAddress"));
                        }
                        return node;
                    }
                }
            ],
            tableData: []
        },
        methods: {
            onChange: function(value) {
                this.dateVal = value;
            },
            calcTableHeight: function() {
                var wHeight = window.innerHeight;
                this.lastTableHeight = wHeight - 130;
                this.posiDetailHeight = wHeight - 104;
            },

            onClickQuery: function() {
                if (this.queryDeviceId) {
                    var me = this;
                    var url = myUrls.reportParkDetail();
                    var data = {
                        startday: this.dateVal[0],
                        endday: this.dateVal[1],
                        offset: timeDifference,
                        deviceid: this.queryDeviceId
                    }
                    me.loading = true;
                    utils.sendAjax(url, data, function(resp) {
                        me.loading = false;
                        if (resp.status == 0) {
                            if (resp.records && resp.records.length) {
                                var newRecords = [];
                                var deviceName = vstore.state.deviceInfos[me.queryDeviceId].devicename;
                                resp.records.forEach(function(item) {
                                    var callon = item.callon.toFixed(5);
                                    var callat = item.callat.toFixed(5);
                                    var parkTime = utils.timeStamp(item.endtime - item.starttime);
                                    var address = LocalCacheMgr.getAddress(callon, callat);
                                    newRecords.push({
                                        deviceName: deviceName,
                                        startDate: DateFormat.longToDateTimeStr(item.starttime, timeDifference),
                                        endDate: DateFormat.longToDateTimeStr(item.endtime, timeDifference),
                                        parkTime: parkTime,
                                        callon_callat: callon + ',' + callat,
                                        callon: callon,
                                        callat: callat,
                                        address: address,
                                        disabled: address ? true : false
                                    });
                                });
                                me.tableData = newRecords;
                            } else {
                                me.tableData = [];
                            }
                        } else {
                            me.tableData = [];
                        }
                    });
                } else {
                    this.$Message.error(this.$t("reportForm.selectDevTip"));
                }
            },
            getAddress: function(params) {
                var me = this;
                var row = params.row;
                var index = params.index;
                utils.queryAddress(row, function(address) {
                    me.tableData[index].address = address;
                    me.tableData[index].disabled = true;
                    LocalCacheMgr.setAddress(row.callon, row.callat, address);
                });
            },
            initMap: function() {
                this.markerLayer = null;
                this.mapInstance = utils.initWindowMap('posi-map');
            },
        },
        mounted: function() {
            var me = this;
            this.initMap();
            this.groupslist = groupslist;
            this.calcTableHeight();
            window.onresize = function() {
                me.calcTableHeight();
            }
        }
    })
}

//acc报表
function accDetails(groupslist) {
    vueInstanse = new Vue({
        el: '#acc-details',
        i18n: utils.getI18n(),
        mixins: [treeMixin],
        data: {
            isSpin: false,
            activeTab: 'tabTotal',
            mapModal: false,
            mapType: utils.getMapType(),
            mapInstance: null,
            markerIns: null,
            loading: false,
            dateVal: [DateFormat.longToDateStr(Date.now(), timeDifference), DateFormat.longToDateStr(Date.now(), timeDifference)],
            lastTableHeight: 100,
            groupslist: [],
            timeoutIns: null,
            allAccColumns: [
                { title: vRoot.$t("reportForm.index"), width: 70, key: 'index' },
                {
                    title: vRoot.$t("alarm.action"),
                    width: 160,
                    render: function(h, params) {
                        return h('span', {
                            on: {
                                click: function() {
                                    vueInstanse.activeTab = "tabDetail";
                                    vueInstanse.getAccDetailTableData(params.row.records);
                                }
                            },
                            style: {
                                color: '#e4393c',
                                cursor: 'pointer'
                            }
                        }, "[" + vRoot.$t("reportForm.accDetailed") + "]")
                    }
                },
                {
                    title: vRoot.$t("alarm.devName"),
                    key: 'devicename'
                },
                {
                    title: vRoot.$t("alarm.devNum"),
                    key: 'deviceid',
                },
                {
                    title: vRoot.$t("reportForm.accCount"),
                    key: 'opennumber',
                },
                {
                    title: vRoot.$t("reportForm.accDuration"),
                    key: 'duration'
                }
            ],
            allAccTableData: [],
            columns: [
                { title: vRoot.$t("reportForm.index"), width: 70, key: 'index' },
                { title: vRoot.$t("alarm.devName"), key: 'deviceName', width: 160 },
                { title: vRoot.$t("alarm.devNum"), key: 'deviceid', width: 160 },
                { title: vRoot.$t("reportForm.accstatus"), key: 'accStatus', width: 100 },
                { title: vRoot.$t("reportForm.startDate"), key: 'startDate', width: 180 },
                { title: vRoot.$t("reportForm.endDate"), key: 'endDate', width: 180 },
                { title: vRoot.$t("reportForm.duration"), key: 'duration' },
            ],
            tableData: [],
        },
        methods: {
            exportData: function() {
                var startday = this.dateVal[0];
                var endday = this.dateVal[1];
                this.$refs.totalTable.exportCsv({
                    filename: vRoot.$t("reportForm.ignitionStatistics") + startday + '-' + endday,
                    original: false,
                    columns: this.allAccColumns.filter(function(col, index) { return index != 1; }),
                    data: this.allRotateTableData
                });
            },

            onClickTab: function(name) {
                this.activeTab = name;
            },
            onChange: function(value) {
                this.dateVal = value;
            },
            calcTableHeight: function() {
                var wHeight = window.innerHeight;
                this.lastTableHeight = wHeight - 175;
            },
            onClickQuery: function() {
                var deviceids = [];
                this.checkedDevice.forEach(function(group) {
                    if (!group.children) {
                        if (group.deviceid != null) {
                            deviceids.push(group.deviceid);
                        }
                    }
                });

                if (deviceids.length) {
                    var me = this;
                    var url = myUrls.reportAccs();
                    var data = {
                        startday: this.dateVal[0],
                        endday: this.dateVal[1],
                        offset: timeDifference,
                        deviceids: deviceids
                    }
                    me.loading = true;
                    utils.sendAjax(url, data, function(resp) {
                        me.loading = false;
                        if (resp.status == 0) {
                            if (resp.records && resp.records.length) {
                                me.tableData = [];
                                me.allAccTableData = me.getAllaccTableData(resp.records);
                            } else {
                                me.tableData = [];
                                me.allAccTableData = [];
                                me.$Message.error(me.$t("reportForm.noRecord"));
                            }
                        } else {
                            me.tableData = [];
                            me.allAccTableData = [];
                        }
                        if (me.activeTab != "tabTotal") {
                            me.onClickTab("tabTotal");
                        }
                    });
                } else {
                    this.$Message.error(this.$t("reportForm.selectDevTip"));
                }
            },
            getAllaccTableData: function(records) {
                var allAccTableData = [],
                    me = this;
                records.forEach(function(item, index) {
                    var accObj = {
                            index: index + 1,
                            deviceid: "\t" + item.deviceid,
                            opennumber: 0,
                            duration: "",
                            devicename: vstore.state.deviceInfos[item.deviceid].devicename,
                            records: item.records
                        },
                        duration = 0;
                    item.records.forEach(function(deviceAcc) {
                        if (deviceAcc.accstate == 3) {
                            duration += deviceAcc.endtime - deviceAcc.begintime;
                            accObj.opennumber++;
                        }
                    });
                    accObj.duration = utils.timeStamp(duration);
                    allAccTableData.push(accObj);
                });
                return allAccTableData;
            },
            getAccDetailTableData: function(records) {
                var newRecords = [],
                    me = this;
                var accOnTime = 0;
                var accOffTime = 0;
                records.sort(function(a, b) {
                    return a.begintime - b.begintime;
                });
                records.forEach(function(item, index) {
                    var deviceName = vstore.state.deviceInfos[item.deviceid].devicename;
                    var duration = item.endtime - item.begintime;
                    var durationStr = utils.timeStamp(duration);
                    var accStatus = "";
                    if (item.accstate == 0) {
                        accStatus = me.$t("reportForm.notEnabled");
                    } else if (item.accstate == 3) {
                        accStatus = me.$t("reportForm.open");
                        accOnTime += duration;
                    } else if (item.accstate == 2) {
                        accOffTime += duration;
                        accStatus = me.$t("reportForm.stalling");
                    }
                    newRecords.push({
                        index: index + 1,
                        deviceid: item.deviceid,
                        deviceName: deviceName,
                        startDate: DateFormat.longToDateTimeStr(item.begintime, timeDifference),
                        endDate: DateFormat.longToDateTimeStr(item.endtime, timeDifference),
                        accStatus: accStatus,
                        duration: durationStr
                    });
                });
                newRecords.push({
                    duration: this.$t("reportForm.accOnTime") + ':' + utils.timeStamp(accOnTime) + ',' + this.$t("reportForm.accOffTime") + ':' + utils.timeStamp(accOffTime)
                })
                me.tableData = newRecords;
            },
            queryDevicesTree: function() {
                var me = this;
                this.isSpin = true;
                GlobalOrgan.getInstance().getGlobalOrganData(function(rootuser) {
                    me.isSpin = false;
                    me.initZTree(rootuser);
                })
            },
        },
        mounted: function() {
            var me = this;
            me.queryDevicesTree();
            this.calcTableHeight();
            window.onresize = function() {
                me.calcTableHeight();
            }
        }
    })

}

function rotateReport(groupslist) {
    vueInstanse = new Vue({
        el: '#rotate-report',
        i18n: utils.getI18n(),
        mixins: [treeMixin],
        data: {
            isSpin: false,
            activeTab: 'tabTotal',
            mapModal: false,
            mapType: utils.getMapType(),
            mapInstance: null,
            markerIns: null,
            loading: false,
            dateVal: [DateFormat.longToDateStr(Date.now(), timeDifference), DateFormat.longToDateStr(Date.now(), timeDifference)],
            lastTableHeight: 100,
            groupslist: [],
            timeoutIns: null,
            allAccColumns: [
                { title: vRoot.$t("reportForm.index"), width: 70, key: 'index' },
                {
                    title: vRoot.$t("alarm.action"),
                    render: function(h, params) {

                        return h('span', {
                            on: {
                                click: function() {
                                    vueInstanse.activeTab = "tabDetail";
                                    vueInstanse.getRotateDetailTableData(params.row.records);
                                }
                            },
                            style: {
                                color: '#e4393c',
                                cursor: 'pointer'
                            }
                        }, "[" + vRoot.$t("reportForm.rotationDetails") + "]")
                    }
                },
                {
                    title: vRoot.$t("alarm.devName"),
                    key: 'devicename'
                },
                {
                    title: vRoot.$t("alarm.devNum"),
                    key: 'deviceid',
                    width: 160,
                },
                {
                    title: vRoot.$t("reportForm.zzTimes"),
                    key: 'zzTimes'
                },
                {
                    title: vRoot.$t("reportForm.fzTimes"),
                    key: 'fzTimes'
                },
                {
                    title: vRoot.$t("reportForm.tzTimes"),
                    key: 'tzTimes'
                },
                {
                    title: vRoot.$t("reportForm.count"),
                    key: 'count'
                },
            ],
            allRotateTableData: [],
            columns: [
                { title: vRoot.$t("reportForm.index"), width: 70, key: 'index' },
                { title: vRoot.$t("alarm.devName"), key: 'deviceName', width: 160 },
                { title: vRoot.$t("alarm.devNum"), key: 'deviceid', width: 160 },
                { title: vRoot.$t("reportForm.status"), key: 'accStatus', width: 100 },
                { title: vRoot.$t("reportForm.startDate"), key: 'startDate', width: 180 },
                { title: vRoot.$t("reportForm.endDate"), key: 'endDate', width: 180 },
                {
                    title: vRoot.$t("reportForm.address"),
                    width: 145,
                    render: function(h, params) {
                        var row = params.row;
                        var lat = row.slat ? row.slat : null;
                        var lon = row.slon ? row.slon : null;
                        if (lat && lon) {
                            if (row.address == null) {

                                return h('Button', {
                                    props: {
                                        type: 'error',
                                        size: 'small'
                                    },
                                    on: {
                                        click: function() {
                                            utils.getJiuHuAddressSyn(lon, lat, function(resp) {
                                                if (resp && resp.address) {
                                                    vueInstanse.tableData[params.index].address = resp.address;
                                                    LocalCacheMgr.setAddress(lon, lat, resp.address);
                                                }
                                            })
                                        }
                                    }
                                }, lon + "," + lat)

                            } else {
                                return h('Tooltip', {
                                    props: {
                                        content: row.address,
                                        placement: "top-start",
                                        maxWidth: 200
                                    },
                                }, [
                                    h('Button', {
                                        props: {
                                            type: 'primary',
                                            size: 'small'
                                        }
                                    }, lon + "," + lat)
                                ]);
                            }
                        } else {
                            return h('span', {}, '');
                        }
                    },
                },
                { title: vRoot.$t("reportForm.duration"), key: 'duration' },
            ],
            tableData: [],
            deviceNamesArr: [],
            zzTimesArr: [],
            fzTimesArr: [],
            tzTimesArr: [],
        },
        methods: {
            exportData: function() {
                var startday = this.dateVal[0];
                var endday = this.dateVal[1];
                if (this.activeTab == 'tabTotal') {
                    this.$refs.totalTable.exportCsv({
                        filename: vRoot.$t("reportForm.rotationStatistics") + startday + '-' + endday,
                        original: false,
                        columns: this.allAccColumns.filter(function(col, index) { return index != 1; }),
                        data: this.allRotateTableData
                    });
                } else {
                    var columns = deepClone(this.columns);
                    columns[6] = {
                        title: isZh ? '地址' : 'Address',
                        key: 'address',
                    };
                    var tableData = deepClone(this.tableData);
                    tableData.forEach(function(item) {
                        var lat = item.slat ? item.slat : null;
                        var lon = item.slon ? item.slon : null;
                        var address = null;
                        if (lat && lon) {
                            address = LocalCacheMgr.getAddress(lon, lat)
                        }
                        if (address !== null) {
                            item.address = address;
                        } else {
                            item.address = lon + "-" + lat;
                        }
                        item.startDate = "\t" + item.startDate;
                        item.endDate = "\t" + item.endDate;
                        item.dveiceid = "\t" + item.dveiceid;
                    });
                    this.$refs.detailTable.exportCsv({
                        filename: (isZh ? '正反转细节-' : 'Rotate-details-') + startday + '-' + endday,
                        original: false,
                        columns: columns,
                        data: tableData
                    });
                }

            },

            cleanSelected: function(treeDataFilter) {
                var that = this;
                for (var i = 0; i < treeDataFilter.length; i++) {
                    var item = treeDataFilter[i];
                    if (item != null) {
                        item.checked = false;
                        if (item.children && item.children.length > 0) {
                            that.cleanSelected(item.children);
                        }
                    }
                }
            },
            onClickTab: function(name) {
                this.activeTab = name;
            },
            onChange: function(value) {
                this.dateVal = value;
            },
            calcTableHeight: function() {
                var wHeight = window.innerHeight;
                this.lastTableHeight = wHeight - 415;
            },
            onClickQuery: function() {
                var deviceids = [];
                this.checkedDevice.forEach(function(group) {
                    if (!group.children) {
                        if (group.deviceid != null) {
                            deviceids.push(group.deviceid);
                        }
                    }
                });
                if (deviceids.length) {
                    var me = this;
                    var url = myUrls.rotateReports();
                    var data = {
                        startday: this.dateVal[0],
                        endday: this.dateVal[1],
                        offset: timeDifference,
                        deviceids: deviceids
                    }
                    me.loading = true;
                    utils.sendAjax(url, data, function(resp) {
                        me.loading = false;
                        if (resp.status == 0) {
                            if (resp.records && resp.records.length) {
                                me.tableData = [];
                                me.allRotateTableData = me.getAllRotateTableData(resp.records);
                            } else {
                                me.tableData = [];
                                me.allRotateTableData = [];
                                me.deviceNamesArr = [];
                                me.zzTimesArr = [];
                                me.fzTimesArr = [];
                                me.tzTimesArr = [];
                                me.$Message.error(me.$t("reportForm.noRecord"));
                            }
                        } else {
                            me.tableData = [];
                            me.allRotateTableData = [];
                            me.deviceNamesArr = [];
                            me.zzTimesArr = [];
                            me.fzTimesArr = [];
                            me.tzTimesArr = [];
                        }
                        if (me.activeTab != "tabTotal") {
                            me.onClickTab("tabTotal");
                        }
                        me.displayChart();
                    });
                } else {
                    this.$Message.error(this.$t("reportForm.selectDevTip"));
                }
            },
            getAllRotateTableData: function(records) {
                var me = this;
                var allRotateTableData = [];
                var deviceNamesArr = [];
                var zzTimesArr = [];
                var fzTimesArr = [];
                var tzTimesArr = [];
                records.forEach(function(item, index) {
                    var Obj = {
                            index: index + 1,
                            deviceid: "\t" + item.deviceid,
                            devicename: vstore.state.deviceInfos[item.deviceid].devicename,
                            records: item.records,
                        },
                        count = 0,
                        zzTimes = 0,
                        fzTimes = 0,
                        tzTimes = 0;
                    item.records.forEach(function(record) {
                        if (record.rotatestate == 1) {
                            zzTimes += record.endtime - record.begintime;
                        }
                        if (record.rotatestate == 2) {
                            fzTimes += record.endtime - record.begintime;
                        }
                        if (record.rotatestate == 3) {
                            tzTimes += record.endtime - record.begintime;
                        }
                        count++;
                    });
                    Obj.zzTimes = utils.timeStamp(zzTimes);
                    Obj.fzTimes = utils.timeStamp(fzTimes);
                    Obj.tzTimes = utils.timeStamp(tzTimes);
                    Obj.count = count;
                    deviceNamesArr.push(Obj.devicename);
                    zzTimesArr.push((zzTimes / 1000 / 60).toFixed(2));
                    fzTimesArr.push((fzTimes / 1000 / 60).toFixed(2));
                    tzTimesArr.push((tzTimes / 1000 / 60).toFixed(2));
                    allRotateTableData.push(Obj);
                });
                if (deviceNamesArr.length) {
                    this.deviceNamesArr = deviceNamesArr;
                    this.zzTimesArr = zzTimesArr;
                    this.fzTimesArr = fzTimesArr;
                    this.tzTimesArr = tzTimesArr;
                }
                return allRotateTableData;
            },
            getRotateDetailTableData: function(records) {
                var newRecords = [],
                    me = this;
                var zzTimes = 0;
                var fzTimes = 0;
                var tzTimes = 0;
                records.sort(function(a, b) {
                    return a.begintime - b.begintime;
                });
                records.forEach(function(item, index) {
                    var deviceName = vstore.state.deviceInfos[item.deviceid].devicename;
                    var duration = item.endtime - item.begintime;
                    var durationStr = utils.timeStamp(duration);
                    var status = "";
                    var slon = item.slon.toFixed(5);
                    var slat = item.slat.toFixed(5);
                    var address = LocalCacheMgr.getAddress(slon, slat);
                    if (item.rotatestate == 1) {
                        status = me.$t("reportForm.zz");
                        zzTimes += duration;
                    } else if (item.rotatestate == 2) {
                        status = me.$t("reportForm.fz");
                        fzTimes += duration;
                    } else if (item.rotatestate == 3) {
                        tzTimes += duration;
                        status = me.$t("reportForm.tz");
                    }
                    newRecords.push({
                        index: index + 1,
                        deviceid: item.deviceid,
                        deviceName: deviceName,
                        startDate: DateFormat.longToDateTimeStr(item.begintime, timeDifference),
                        endDate: DateFormat.longToDateTimeStr(item.endtime, timeDifference),
                        accStatus: status,
                        address: address,
                        duration: durationStr,
                        slon: slon,
                        slat: slat,
                    });
                });
                newRecords.push({
                    duration: me.$t("reportForm.zz") + ':' + utils.timeStamp(zzTimes) + ',' + me.$t("reportForm.fz") + ':' + utils.timeStamp(fzTimes) + ',' + me.$t("reportForm.tz") + ':' + utils.timeStamp(tzTimes)
                })
                me.tableData = newRecords;
            },
            displayChart: function() {
                var barChartOtion = this.getChartOption();
                this.barChartJourney.setOption(barChartOtion);
            },
            getChartOption: function() {
                var dw_hour = this.$t("reportForm.h");
                var dw_min = this.$t("reportForm.m");
                var car = this.$t("alarm.devName");
                var zz = this.$t("reportForm.zz");
                var fz = this.$t("reportForm.fz");
                var tz = this.$t("reportForm.tz");
                //加载
                option = {
                    tooltip: {
                        show: true,
                        trigger: 'axis',
                        formatter: function(v) {
                            var zStr = "";
                            var fStr = "";
                            var tStr = "";
                            if (v.length == 1) {
                                var item1 = v[0];
                                if (item1.seriesIndex == 0) {
                                    if (v[0].value > 60) {
                                        zStr = parseInt(v[0].value / 60) + dw_hour + (v[0].value % 60).toFixed(2) + dw_min;
                                    } else if (v[0] && v[0].value % 60 == 0 && v[0].value != 0) {
                                        zStr = parseInt(v[0].value / 60) + dw_hour;
                                    } else {
                                        zStr = v[0].value + dw_min;
                                    }
                                    return car + ': ' + v[0].name + '</br>' +
                                        zz + ': ' + zStr + '</br>';
                                } else if (item1.seriesIndex == 1) {
                                    if (v[0].value > 60) {
                                        fStr = parseInt(v[0].value / 60) + dw_hour + (v[0].value % 60).toFixed(2) + dw_min;
                                    } else if (v[0] && v[0].value % 60 == 0 && v[0].value != 0) {
                                        fStr = parseInt(v[0].value / 60) + dw_hour;
                                    } else {
                                        fStr = v[0].value + dw_min;
                                    }
                                    return car + ': ' + v[0].name + '</br>' +
                                        fz + ': ' + fStr + '</br>';

                                } else if (item1.seriesIndex == 2) {
                                    if (v[0].value > 60) {
                                        tStr = parseInt(v[0].value / 60) + dw_hour + (v[0].value % 60).toFixed(2) + dw_min;
                                    } else if (v[0] && v[0].value % 60 == 0 && v[0].value != 0) {
                                        tStr = parseInt(v[0].value / 60) + dw_hour;
                                    } else {
                                        tStr = v[0].value + dw_min;
                                    }
                                    return car + ': ' + v[0].name + '</br>' +
                                        tz + ': ' + tStr;
                                }
                            } else if (v.length == 2) {
                                var item1 = v[0];
                                var item2 = v[1];
                                if (item1.seriesIndex == 0) {
                                    if (item1.value > 60) {
                                        zStr = parseInt(item1.value / 60) + dw_hour + (item1.value % 60).toFixed(2) + dw_min;
                                    } else if (item1 && item1.value % 60 == 0 && item1.value != 0) {
                                        zStr = parseInt(item1.value / 60) + dw_hour;
                                    } else {
                                        zStr = item1.value + dw_min;
                                    }
                                } else if (item1.seriesIndex == 1) {
                                    if (item1.value > 60) {
                                        fStr = parseInt(item1.value / 60) + dw_hour + (item1.value % 60).toFixed(2) + dw_min;
                                    } else if (item1 && item1.value % 60 == 0 && item1.value != 0) {
                                        fStr = parseInt(item1.value / 60) + dw_hour;
                                    } else {
                                        fStr = item1.value + dw_min;
                                    }
                                } else if (item1.seriesIndex == 2) {
                                    if (item1.value > 60) {
                                        tStr = parseInt(item1.value / 60) + dw_hour + (item1.value % 60).toFixed(2) + dw_min;
                                    } else if (item1 && item1.value % 60 == 0 && item1.value != 0) {
                                        tStr = parseInt(item1.value / 60) + dw_hour;
                                    } else {
                                        tStr = item1.value + dw_min;
                                    }
                                }
                                if (item2.seriesIndex == 0) {
                                    if (item2.value > 60) {
                                        zStr = parseInt(item2.value / 60) + dw_hour + (item2.value % 60).toFixed(2) + dw_min;
                                    } else if (item2 && item2.value % 60 == 0 && item2.value != 0) {
                                        zStr = parseInt(item2.value / 60) + dw_hour;
                                    } else {
                                        zStr = item2.value + dw_min;
                                    }
                                } else if (item2.seriesIndex == 1) {
                                    if (item2.value > 60) {
                                        fStr = parseInt(item2.value / 60) + dw_hour + (item2.value % 60).toFixed(2) + dw_min;
                                    } else if (item2 && item2.value % 60 == 0 && item2.value != 0) {
                                        fStr = parseInt(item2.value / 60) + dw_hour;
                                    } else {
                                        fStr = item2.value + dw_min;
                                    }
                                } else if (item2.seriesIndex == 2) {
                                    if (item2.value > 60) {
                                        tStr = parseInt(item2.value / 60) + dw_hour + (item2.value % 60).toFixed(2) + dw_min;
                                    } else if (item2 && item2.value % 60 == 0 && item2.value != 0) {
                                        tStr = parseInt(item2.value / 60) + dw_hour;
                                    } else {
                                        tStr = item2.value + dw_min;
                                    }
                                }

                                if (zStr === "") {
                                    return car + ': ' + v[0].name + '</br>' +
                                        fz + ': ' + fStr + '</br>' +
                                        tz + ': ' + tStr;
                                }
                                if (fStr === "") {
                                    return car + ': ' + v[0].name + '</br>' +
                                        zz + ': ' + zStr + '</br>' +
                                        tz + ': ' + tStr;
                                }
                                if (tStr === "") {
                                    return car + ': ' + v[0].name + '</br>' +
                                        zz + ': ' + zStr + '</br>' +
                                        fz + ': ' + fStr + '</br>';
                                }
                            } else if (v.length == 3) {
                                if (v[0].value > 60) {
                                    zStr = parseInt(v[0].value / 60) + dw_hour + (v[0].value % 60).toFixed(2) + dw_min;
                                } else if (v[0] && v[0].value % 60 == 0 && v[0].value != 0) {
                                    zStr = parseInt(v[0].value / 60) + dw_hour;
                                } else {
                                    zStr = v[0].value + dw_min;
                                }
                                if (v[1] && v[1].value > 60) {
                                    fStr = parseInt(v[1].value / 60) + dw_hour + (v[1].value % 60).toFixed(2) + dw_min;
                                } else if (v[1] && v[1].value % 60 == 0 && v[1].value != 0) {
                                    fStr = parseInt(v[1].value / 60) + dw_hour;
                                } else {
                                    fStr = v[1].value + dw_min;
                                }
                                if (v[2] && v[2].value > 60) {
                                    tStr = parseInt(v[2].value / 60) + dw_hour + (v[2].value % 60).toFixed(2) + dw_min;
                                } else if (v[2] && v[2].value % 60 == 0 && v[2].value != 0) {
                                    tStr = parseInt(v[2].value / 60) + dw_hour;
                                } else {
                                    tStr = v[2].value + dw_min;
                                }
                                return car + ': ' + v[0].name + '</br>' +
                                    zz + ': ' + zStr + '</br>' +
                                    fz + ': ' + fStr + '</br>' +
                                    tz + ': ' + tStr;
                            }

                        }
                    },
                    legend: {
                        data: [zz, fz, tz],
                        y: 13,
                        x: 'center'
                    },
                    toolbox: {
                        show: true,
                        feature: {
                            magicType: { show: true, type: ['line', 'bar'] },
                            restore: { show: true },
                            saveAsImage: {
                                show: true
                            }
                        },
                        itemSize: 14,
                        y: 'top',
                        x: 'right'
                    },
                    grid: {
                        x: 100,
                        y: 40,
                        x2: 80,
                        y2: 30
                    },
                    xAxis: [{
                        type: 'category',
                        //boundaryGap : false,
                        axisLabel: {
                            show: true,
                            interval: 0, // {number}
                            rotate: 0,
                            margin: 8,
                            textStyle: {
                                fontSize: 12
                            }
                        },
                        data: this.deviceNamesArr
                    }],
                    yAxis: [{
                        type: 'value',
                        position: 'bottom',
                        nameLocation: 'end',
                        boundaryGap: [0, 0.2],
                        axisLabel: {
                            formatter: '{value}'
                        }
                    }],
                    series: [{
                            name: zz,
                            type: 'bar',
                            itemStyle: {
                                //默认样式
                                normal: {
                                    label: {
                                        show: true,
                                        textStyle: {
                                            fontSize: '12',
                                            fontFamily: '微软雅黑',
                                            fontWeight: 'bold'
                                        }
                                    }
                                }
                            },
                            data: this.zzTimesArr
                        },
                        {
                            name: fz,
                            type: 'bar',
                            itemStyle: {
                                //默认样式
                                normal: {
                                    label: {
                                        show: true,
                                        textStyle: {
                                            fontSize: '12',
                                            fontFamily: '微软雅黑',
                                            fontWeight: 'bold'
                                        }
                                    }
                                }
                            },
                            data: this.fzTimesArr
                        },
                        {
                            name: tz,
                            type: 'bar',
                            itemStyle: {
                                //默认样式
                                normal: {
                                    label: {
                                        show: true,
                                        textStyle: {
                                            fontSize: '14',
                                            fontFamily: '微软雅黑',
                                            fontWeight: 'bold'
                                        }
                                    }
                                }
                            },
                            data: this.tzTimesArr
                        }
                    ]
                };
                return option;
            },
            queryDevicesTree: function() {
                var me = this;
                this.isSpin = true;
                GlobalOrgan.getInstance().getGlobalOrganData(function(rootuser) {
                    me.isSpin = false;
                    me.initZTree(rootuser);
                })
            },
        },
        mounted: function() {
            var me = this;

            this.queryDevicesTree();
            this.barChartJourney = echarts.init(document.getElementById('barContainer'));
            this.displayChart();
            this.calcTableHeight();
            window.onresize = function() {
                me.calcTableHeight();
                me.barChartJourney.resize();
            }
        }
    })

}

function speedingReport(groupslist) {
    vueInstanse = new Vue({
        el: '#speeding-report',
        i18n: utils.getI18n(),
        mixins: [treeMixin],
        data: {
            isSpin: false,
            activeTab: 'tabTotal',
            mapModal: false,
            mapType: utils.getMapType(),
            mapInstance: null,
            markerIns: null,
            loading: false,
            dateVal: [DateFormat.longToDateStr(Date.now(), timeDifference), DateFormat.longToDateStr(Date.now(), timeDifference)],
            lastTableHeight: 100,
            groupslist: [],
            timeoutIns: null,
            allAccColumns: [
                { title: vRoot.$t("reportForm.index"), width: 70, key: 'index' },
                {
                    title: vRoot.$t("alarm.action"),
                    width: 160,
                    render: function(h, params) {
                        var records = params.row.records;
                        return h('span', {
                            on: {
                                click: function() {

                                    vueInstanse.activeTab = "tabDetail";
                                    vueInstanse.getRotateDetailTableData(records);

                                    if (records.length) {
                                        vueInstanse.isSpin = true;
                                        var row = deepClone(records[0]);
                                        row.startDate = DateFormat.longToDateTimeStr(row.begintime, timeDifference);
                                        row.endDate = DateFormat.longToDateTimeStr(row.endtime, timeDifference);
                                        vueInstanse.querySingleDevTracks('charts', row);
                                    }

                                }
                            },
                            style: {
                                color: '#e4393c',
                                cursor: 'pointer'
                            }
                        }, "[" + vRoot.$t("reportForm.speedingDetails") + "]")
                    }
                },
                {
                    title: vRoot.$t("alarm.devName"),
                    key: 'devicename'
                },
                {
                    title: vRoot.$t("alarm.devNum"),
                    key: 'deviceid',
                    width: 160,
                },
                {
                    title: vRoot.$t("reportForm.speedingDuration"),
                    key: 'duration'
                },
                {
                    title: vRoot.$t("reportForm.speedingMileage"),
                    key: 'distance'
                },
                {
                    title: vRoot.$t("reportForm.speedingCount"),
                    key: 'count'
                },
                {
                    title: vRoot.$t("reportForm.maxSpeed") + '(km/h)',
                    key: 'maxSpeed'
                },
                {
                    title: vRoot.$t("reportForm.minSpeed") + '(km/h)',
                    key: 'minSpeed'
                }
            ],
            allRotateTableData: [],
            columns: [
                { title: vRoot.$t("reportForm.index"), width: 70, key: 'index' },
                { title: vRoot.$t("alarm.devName"), key: 'deviceName' },
                { title: vRoot.$t("alarm.devNum"), key: 'deviceid' },
                { title: vRoot.$t("reportForm.startDate"), key: 'startDate' },
                { title: vRoot.$t("reportForm.endDate"), key: 'endDate' },
                {
                    title: vRoot.$t("reportForm.address"),
                    width: 145,
                    render: function(h, params) {
                        var row = params.row;
                        var lat = row.slat ? row.slat : null;
                        var lon = row.slon ? row.slon : null;
                        if (lat && lon) {
                            if (row.address == null) {

                                return h('Button', {
                                    props: {
                                        type: 'error',
                                        size: 'small'
                                    },
                                    on: {
                                        click: function() {
                                            utils.getJiuHuAddressSyn(lon, lat, function(resp) {
                                                if (resp && resp.address) {
                                                    vueInstanse.tableData[params.index].address = resp.address;
                                                    LocalCacheMgr.setAddress(lon, lat, resp.address);
                                                }
                                            })
                                        }
                                    }
                                }, lon + "," + lat)

                            } else {
                                return h('Tooltip', {
                                    props: {
                                        content: row.address,
                                        placement: "top-start",
                                        maxWidth: 200
                                    },
                                }, [
                                    h('Button', {
                                        props: {
                                            type: 'primary',
                                            size: 'small'
                                        }
                                    }, lon + "," + lat)
                                ]);
                            }
                        } else {
                            return h('span', {}, '');
                        }
                    },
                },
                { title: vRoot.$t("reportForm.duration"), key: 'duration' },
                {
                    title: vRoot.$t("alarm.action"),
                    render: function(h, params) {
                        return h(
                            'div', {}, [
                                h('Button', {
                                    props: {
                                        size: 'small',
                                    },
                                    on: {
                                        click: function(e) {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            vueInstanse.isSpin = true;
                                            vueInstanse.querySingleDevTracks('map', params.row);
                                        }
                                    }
                                }, isZh ? "显示轨迹" : "Show track"),
                            ]
                        )
                    },
                },
            ],
            tableData: [],
            trackDetailModal: false,
        },
        methods: {
            onRowClick: function(row) {
                this.isSpin = true;
                this.querySingleDevTracks('charts', row);
            },
            querySingleDevTracks: function(type, row) {
                var me = this;
                var url = myUrls.queryTracks();
                var data = {
                    deviceid: row.deviceid,
                    begintime: row.startDate,
                    endtime: row.endDate,
                    interval: 10,
                    timezone: timeDifference
                };

                utils.sendAjax(url, data, function(resp) {
                    me.isSpin = false;
                    if (resp.status == 0) {
                        var records = resp.records;
                        if (records && records.length) {
                            if (type == 'map') {
                                utils.markersAndLineLayerToMap(me.records);
                                me.trackDetailModal = true;
                            } else {
                                var distance = []; //总里程;
                                var recvtime = []; //时间
                                var veo = []; //速度
                                me.disMin = 0;

                                records.forEach(function(item, index) {
                                    item.totaldistance = (item.totaldistance / 1000).toFixed(2)
                                    if (index == 0) {
                                        me.disMin = item.totaldistance
                                    }

                                    recvtime.push(DateFormat.longToDateTimeStr(item.updatetime, timeDifference));
                                    veo.push((item.speed / 1000).toFixed(2));
                                    distance.push(item.totaldistance);
                                });
                                me.distance = distance;
                                me.recvtime = recvtime;
                                me.veo = veo;
                                me.speedChart.setOption(me.getSpeedChartsOption());
                            }
                        }
                    }
                }, function() {
                    me.isSpin = false;
                });
            },
            getBdPoints: function(records) {
                var points = [];
                records.forEach(function(item) {
                    var lon_lat = wgs84tobd09(item.callon, item.callat);
                    points.push(new BMap.Point(lon_lat[0], lon_lat[1]));
                });
                return points;
            },
            initMap: function() {
                this.markerLayer = null;
                this.mapInstance = utils.initWindowMap('spedding-map');
            },
            exportData: function() {
                var startday = this.dateVal[0];
                var endday = this.dateVal[1];
                this.$refs.totalTable.exportCsv({
                    filename: vRoot.$t('reportForm.speedingStatistics') + startday + '-' + endday,
                    original: false,
                    columns: this.allAccColumns.filter(function(col, index) { return index != 1; }),
                    data: this.allRotateTableData
                });
            },

            cleanSelected: function(treeDataFilter) {
                var that = this;
                for (var i = 0; i < treeDataFilter.length; i++) {
                    var item = treeDataFilter[i];
                    if (item != null) {
                        item.checked = false;
                        if (item.children && item.children.length > 0) {
                            that.cleanSelected(item.children);
                        }
                    }
                }
            },
            onClickTab: function(name) {
                this.activeTab = name;
            },
            onChange: function(value) {
                this.dateVal = value;
            },
            calcTableHeight: function() {
                var wHeight = window.innerHeight;
                this.lastTableHeight = wHeight - 415;
            },
            onClickQuery: function() {
                var deviceids = [];
                this.checkedDevice.forEach(function(group) {
                    if (!group.children) {
                        if (group.deviceid != null) {
                            deviceids.push(group.deviceid);
                        }
                    }
                });
                if (deviceids.length) {
                    var me = this;
                    var url = myUrls.reportOverSpeeds();
                    var data = {
                        startday: this.dateVal[0],
                        endday: this.dateVal[1],
                        offset: timeDifference,
                        deviceids: deviceids
                    }
                    me.loading = true;
                    utils.sendAjax(url, data, function(resp) {
                        me.loading = false;
                        if (resp.status == 0) {
                            if (resp.records && resp.records.length) {
                                me.tableData = [];

                                me.allRotateTableData = me.getAllRotateTableData(resp.records);
                            } else {
                                me.tableData = [];
                                me.allRotateTableData = [];
                                me.deviceNamesArr = [];
                                me.countArr = [];
                                me.$Message.error(vRoot.$t('reportForm.noRecord'));
                            }
                        } else {
                            me.tableData = [];
                            me.allRotateTableData = [];
                            me.deviceNamesArr = [];
                            me.countArr = [];
                        }
                        if (me.activeTab != "tabTotal") {
                            me.onClickTab("tabTotal");
                        }
                        me.displayChart();
                    });
                } else {
                    this.$Message.error(this.$t("reportForm.selectDevTip"));
                }
            },
            getAllRotateTableData: function(records) {
                var me = this;
                var allRotateTableData = [];
                var deviceNamesArr = [];
                var countArr = [];
                records.forEach(function(item, index) {
                    var Obj = {
                            index: index + 1,
                            deviceid: "\t" + item.deviceid,
                            devicename: vstore.state.deviceInfos[item.deviceid].devicename,
                            records: item.records,
                        },
                        count = 0,
                        duration = 0,
                        distance = 0,
                        maxSpeed = '-',
                        minSpeed = '-';
                    item.records.sort(function(a, b) {
                        return b.endtime - a.endtime;
                    });
                    item.records.forEach(function(record) {
                        duration += record.endtime - record.begintime;
                        distance += record.edistance - record.sdistance;
                        maxSpeed === '-' && (maxSpeed = record.maxspeed);
                        minSpeed === '-' && (minSpeed = record.minspeed);
                        if (record.maxspeed > maxSpeed) {
                            maxSpeed = record.maxspeed;
                        }
                        if (record.minspeed < minSpeed) {
                            minSpeed = record.minspeed;
                        }
                        count++;

                    });
                    Obj.maxSpeed = maxSpeed === '-' ? '-' : (maxSpeed / 1000).toFixed(2);
                    Obj.minSpeed = minSpeed === '-' ? '-' : (minSpeed / 1000).toFixed(2);
                    Obj.count = count;
                    Obj.duration = utils.timeStamp(duration);
                    Obj.distance = (distance / 1000).toFixed(2) + 'km';
                    deviceNamesArr.push(Obj.devicename);
                    countArr.push(count);
                    allRotateTableData.push(Obj);
                });
                if (deviceNamesArr.length) {
                    this.deviceNamesArr = deviceNamesArr;
                    this.countArr = countArr;
                }
                return allRotateTableData;
            },
            getRotateDetailTableData: function(records) {
                var newRecords = [],
                    me = this;
                records.forEach(function(item, index) {
                    var deviceName = vstore.state.deviceInfos[item.deviceid].devicename;
                    var duration = item.endtime - item.begintime;
                    var durationStr = utils.timeStamp(duration);
                    var status = "";
                    var slon = item.slon.toFixed(5);
                    var slat = item.slat.toFixed(5);
                    var address = LocalCacheMgr.getAddress(slon, slat);
                    newRecords.push({
                        index: index + 1,
                        deviceid: item.deviceid,
                        deviceName: deviceName,
                        startDate: DateFormat.longToDateTimeStr(item.begintime, timeDifference),
                        endDate: DateFormat.longToDateTimeStr(item.endtime, timeDifference),
                        accStatus: status,
                        address: address,
                        duration: durationStr,
                        slon: slon,
                        slat: slat,
                    });
                });
                me.tableData = newRecords;
            },
            displayChart: function() {
                var barChartOtion = this.getChartOption();
                this.barChartJourney.setOption(barChartOtion);
            },
            getChartOption: function() {
                var car = isZh ? '车辆' : 'vehicle';
                var cs = this.$t('reportForm.speedingCount');
                //加载
                option = {
                    tooltip: {
                        show: true,
                        trigger: 'axis',

                    },
                    legend: {
                        data: [cs],
                        y: 13,
                        x: 'center'
                    },
                    toolbox: {
                        show: true,
                        feature: {
                            magicType: { show: true, type: ['line', 'bar'] },
                            restore: { show: true },
                            saveAsImage: {
                                show: true
                            }
                        },
                        itemSize: 14,
                        y: 'top',
                        x: 'right'
                    },
                    grid: {
                        x: 100,
                        y: 40,
                        x2: 80,
                        y2: 30
                    },
                    xAxis: [{
                        type: 'category',
                        //boundaryGap : false,
                        axisLabel: {
                            show: true,
                            interval: 0, // {number}
                            rotate: 0,
                            margin: 8,
                            textStyle: {
                                fontSize: 12
                            }
                        },
                        data: this.deviceNamesArr
                    }],
                    yAxis: [{
                        type: 'value',
                        position: 'bottom',
                        nameLocation: 'end',
                        boundaryGap: [0, 0.2],
                        axisLabel: {
                            formatter: '{value}'
                        }
                    }],
                    series: [{
                        name: cs,
                        type: 'bar',
                        itemStyle: {
                            //默认样式
                            normal: {
                                label: {
                                    show: true,
                                    textStyle: {
                                        fontSize: '12',
                                        fontFamily: '微软雅黑',
                                        fontWeight: 'bold'
                                    }
                                }
                            }
                        },
                        data: this.countArr
                    }]
                };
                return option;
            },
            getSpeedChartsOption: function() {
                var speed = this.$t('reportForm.speed');
                var dis = this.$t('reportForm.mileage');
                var time = this.$t('reportForm.date');
                var option = {
                    title: {
                        text: time + (isZh ? '/超速' : '/speeding'),
                        x: 'center',
                        textStyle: {
                            fontSize: 12,
                            fontWeight: 'bolder',
                            color: '#333'
                        }
                    },
                    grid: {
                        x: 50,
                        y: 40,
                        x2: 50,
                        y2: 40
                    },
                    tooltip: {
                        trigger: 'axis',
                        formatter: function(v) {
                            var data = time + ' : ' + v[0].name + '<br/>';
                            for (i in v) {
                                if (v[i].seriesName != time) {
                                    // data += v[i].seriesName + ' : ' + v[i].value + '<br/>';
                                    if (v[i].seriesName == dis) {
                                        data += v[i].seriesName + ' : ' + v[i].value + 'Km<br/>';
                                    } else if (v[i].seriesName == speed) {
                                        data += v[i].seriesName + ' : ' + v[i].value + 'Km/h<br/>';
                                    }
                                }
                            }
                            return data;
                        }
                    },
                    legend: {
                        data: [dis, speed],
                        //selected: {
                        //    '里程' : false
                        // },
                        x: 'left'
                    },
                    toolbox: {
                        show: true,
                        feature: {
                            magicType: {
                                show: true,
                                type: ['line', 'bar']
                            },
                            restore: {
                                show: true
                            },
                            saveAsImage: {
                                show: true
                            }
                        },
                        itemSize: 14
                    },
                    dataZoom: [{
                        show: true,
                        realtime: true,
                        start: 0,
                        end: 100,
                        height: 20,
                        backgroundColor: '#EDEDED',
                        fillerColor: 'rgb(54, 72, 96,0.5)',
                        //fillerColor:'rgb(244,129,38,0.8)',
                        bottom: 0
                    }, {
                        type: "inside",
                        realtime: true,
                        start: 0,
                        end: 100,
                        height: 20,
                        bottom: 0
                    }],
                    xAxis: [{
                        type: 'category',
                        boundaryGap: false,
                        axisLine: {
                            onZero: false
                        },
                        data: this.recvtime
                    }],
                    yAxis: [{
                        name: speed,
                        type: 'value',
                        nameTextStyle: 10,
                        nameGap: 5,

                    }, {
                        name: dis,
                        type: 'value',
                        nameTextStyle: 10,
                        nameGap: 2,
                        min: this.disMin,
                        axisLabel: {
                            formatter: '{value} km',
                        },
                        axisTick: {
                            show: false
                        }
                    }],
                    series: [{
                        name: time,
                        type: 'line',
                        symbol: 'none',
                        yAxisIndex: 1,
                        color: '#F0805A',
                        smooth: true,
                        data: this.recvtime
                    }, {
                        name: dis,
                        type: 'line',
                        symbol: 'none',
                        yAxisIndex: 1,
                        color: '#3CB371',
                        smooth: true,
                        data: this.distance
                    }, {
                        name: speed,
                        type: 'line',
                        symbol: 'none',
                        yAxisIndex: 0,
                        smooth: true,
                        color: '#4876FF',
                        data: this.veo
                    }]
                };
                return option;
            },
            queryDevicesTree: function() {
                var me = this;
                this.isSpin = true;
                GlobalOrgan.getInstance().getGlobalOrganData(function(rootuser) {
                    me.isSpin = false;
                    me.initZTree(rootuser);
                })
            },
        },
        mounted: function() {
            var me = this;
            this.queryDevicesTree();
            this.initMap();
            this.barChartJourney = echarts.init(document.getElementById('barContainer'));
            this.displayChart();
            this.deviceNamesArr = [];
            this.countArr = [];
            this.distance = [];
            this.recvtime = [];
            this.veo = [];
            this.speedChart = echarts.init(document.getElementById('spedding-chart'));
            this.speedChart.setOption(this.getSpeedChartsOption());
            this.calcTableHeight();
            window.onresize = function() {
                me.calcTableHeight();
                me.barChartJourney.resize();
                me.speedChart.resize();
            }
        }
    })
}


function devRecords(groupslist) {
    vueInstanse = new Vue({
        el: '#dev-records',
        i18n: utils.getI18n(),
        mixins: [reportMixin],
        data: {
            loading: false,
            tableHeight: 100,
            groupslist: [],
            timeoutIns: null,
            isShowMatchDev: true,
            columns: [
                { type: 'index', width: 60, align: 'center' },
                { title: vRoot.$t("alarm.devName"), key: 'devicename', width: 200 },
                { title: vRoot.$t("alarm.devNum"), key: 'deviceid', width: 200 },
                { title: vRoot.$t("reportForm.date"), key: 'updatetimeStr', width: 200 },
                {
                    title: vRoot.$t("reportForm.download"),
                    render: function(h, data) {
                        return h(
                            "a", {
                                attrs: {
                                    download: true,
                                    target: "_blank",
                                    href: data.row.url
                                }
                            },
                            vRoot.$t("reportForm.download"))
                    },
                    width: 160,
                },
                {
                    title: vRoot.$t("monitor.media"),
                    render: function(h, data) {
                        return h(
                            "audio", {
                                style: {
                                    marginTop: "5px"
                                },
                                attrs: {
                                    controls: "controls",
                                    src: data.row.url
                                }
                            }
                        )
                    }
                },
            ],
            tableData: []
        },
        methods: {
            calcTableHeight: function() {
                var wHeight = window.innerHeight;
                this.tableHeight = wHeight - 125;
            },
            onClickQuery: function() {
                if (this.queryDeviceId == "") { return };
                var me = this;
                var url = myUrls.reportAudio();
                var data = {
                    deviceid: this.queryDeviceId
                }
                utils.sendAjax(url, data, function(resp) {
                    if (resp.status === 0) {
                        var records = resp.records;
                        var tableData = [];
                        records.forEach(function(record) {
                            tableData.push({
                                devicename: me.sosoValue,
                                deviceid: me.queryDeviceId,
                                updatetimeStr: DateFormat.longToDateTimeStr(record.updatetime, timeDifference),
                                url: record.url
                            })
                        });
                        me.tableData = tableData;
                        if (tableData.length === 0) {
                            vRoot.$t("reportForm.noRecord");
                        }
                    }
                })
            },
        },
        mounted: function() {
            var me = this;
            this.groupslist = groupslist;
            this.calcTableHeight();
            window.onresize = function() {
                me.calcTableHeight();
            }
        }
    });
}


function messageRecords(groupslist) {
    vueInstanse = new Vue({
        el: '#messageRecords',
        i18n: utils.getI18n(),
        mixins: [reportMixin],
        data: {
            loading: false,
            isShowCard: false,
            tableHeight: 100,
            groupslist: [],
            timeoutIns: null,
            isShowMatchDev: true,
            startDate: new Date(),
            columns: [
                { title: vRoot.$t("reportForm.sn"), key: 'sn', width: 80, "sortable": true, fixed: 'left' },
                { title: vRoot.$t("reportForm.messagetype"), key: 'messagetype', width: 110 },
                { title: vRoot.$t("reportForm.typedescr"), key: 'typedescr', width: 120 },
                { title: vRoot.$t("reportForm.status"), key: 'status', width: 80 },
                { title: vRoot.$t("reportForm.strstatus"), key: isZh ? 'strstatus' : 'strstatusen', width: 220 },
                { title: vRoot.$t("reportForm.stralarm"), key: 'stralarm', width: 120 },
                { title: vRoot.$t("reportForm.updatetimeStr"), key: 'updatetimeStr', width: 160 },
                { title: vRoot.$t("reportForm.reportmodeStr"), key: 'reportmodeStr', width: 120 },
                { title: vRoot.$t("reportForm.reissue"), key: 'reissue', width: 80 },
                { title: vRoot.$t("reportForm.callat"), key: 'callat', width: 120 },
                { title: vRoot.$t("reportForm.callon"), key: 'callon', width: 120 },
                { title: vRoot.$t("reportForm.radius"), key: 'radius', width: 80 },
                { title: vRoot.$t("reportForm.speed"), key: 'speed', width: 80 },
                { title: vRoot.$t("reportForm.recorderspeed"), key: 'recorderspeed', width: 120 },
                { title: vRoot.$t("reportForm.totaldistance"), key: 'totaldistance', width: 120 },
                { title: vRoot.$t("reportForm.altitude"), key: 'altitude', width: 100 },
                { title: vRoot.$t("reportForm.course"), key: 'course', width: 100 },
                { title: vRoot.$t("reportForm.gotsrc"), key: 'gotsrc', width: 100 },
                { title: vRoot.$t("reportForm.rxlevel"), key: 'rxlevel', width: 100 },
            ],
            tableData: [],
            data: [],
            currentIndex: 1,
            total: 0,
            contentString: "",
            filterStr: '',
        },
        methods: {
            exportData: function() {
                var columns = [
                    { title: vRoot.$t("reportForm.trackid"), key: 'trackid', fixed: 'left', width: 80 },
                    { title: vRoot.$t("reportForm.updatetimeStr"), key: 'updatetimeStr', width: 160 },
                    { title: vRoot.$t("reportForm.packetdescr"), key: 'packetdescr', width: 160 },
                ];

                this.$refs.table.exportCsv({
                    filename: this.queryDeviceId + (isZh ? '-报文' : '-Records'),
                    original: false,
                    columns: columns,
                    data: this.data
                });
            },
            charts: function(title) {
                var option = {
                    title: {
                        text: title,
                        bottom: 'auto'
                    },
                    tooltip: {
                        trigger: 'item'
                    },
                    legend: {
                        orient: 'vertical',
                        left: 'right',
                    },
                    // grid: {
                    //     top: 5,
                    //     left: 20,
                    //     right: 5,
                    //     bottom: 5,
                    // },
                    series: [{
                        type: 'pie',
                        radius: '70%',
                        data: this.seriesData,
                        emphasis: {
                            itemStyle: {
                                shadowBlur: 10,
                                shadowOffsetX: 0,
                                shadowColor: 'rgba(0, 0, 0, 0.5)'
                            }
                        }
                    }]
                };;
                this.chartsIns.setOption(option);
            },
            onRowClick: function(row) {
                var me = this;
                this.isShowCard = true;
                this.queryTrackDetail(row, function(resp) {
                    if (resp.track) {
                        me.contentString = JSON.stringify(resp.track);
                    } else {
                        vm.$Message.error(me.$t("reportForm.noRecord"));
                    }
                });
            },
            queryTrackDetail: function(row, callback) {
                var data = {
                    deviceid: this.queryDeviceId,
                    updatetime: row.updatetime,
                    trackid: row.trackid
                }
                var url = myUrls.queryTrackDetail();
                utils.sendAjax(url, data, function(resp) {
                    if (resp.status == 0) {
                        callback(resp);
                    }
                })
            },
            closeCard: function() {
                this.isShowCard = false;
            },
            filterTypeDesc: function() {
                if (this.filterStr) {
                    var that = this;
                    var filterArr = [];
                    for (var i = 0; i < this.data.length; i++) {
                        var item = this.data[i];
                        if ((item.typedescr && item.typedescr.indexOf(that.filterStr) != -1) || item.strstatus.indexOf(that.filterStr) != -1 || item.stralarm.indexOf(that.filterStr) != -1 || item.messagetype.indexOf(that.filterStr) != -1) {
                            filterArr.push(item);
                            if (filterArr.length > 80) {
                                break;
                            }
                        }
                    }
                    this.tableData = filterArr;
                };
            },
            onChange: function(index) {
                this.isShowCard = false;
                this.currentIndex = index;
                this.tableData = this.data.slice((index - 1) * 20, (index - 1) * 20 + 20);
            },
            calcTableHeight: function() {
                var wHeight = window.innerHeight;
                this.tableHeight = wHeight - 380;
            },
            nextDay: function() {
                this.startDate = new Date(this.startDate.getTime() + this.dayTime);
            },
            prevDay: function() {
                this.startDate = new Date(this.startDate.getTime() - this.dayTime);

            },
            requestTracks: function(callback) {
                if (!this.queryDeviceId) return;
                this.loading = true;
                var url = myUrls.queryTracksDetail(),
                    me = this;
                var startTimeStr = DateFormat.format(this.startDate, 'yyyy-MM-dd') + ' 00:00:00';
                var endTimeStr = DateFormat.format(this.startDate, 'yyyy-MM-dd') + ' 23:59:00';
                var data = {
                    deviceid: this.queryDeviceId,
                    lbs: 1,
                    timezone: timeDifference,
                    interval: -1,
                    begintime: startTimeStr,
                    endtime: endTimeStr
                };
                utils.sendAjax(url, data, function(resp) {
                    me.loading = false;
                    callback(resp)
                });
            },
            onClickQuery: function() {
                var me = this;
                this.requestTracks(function(resp) {
                    if (resp.status == 0 && resp.records) {
                        var seriesObj = {};
                        resp.records.forEach(function(record) {
                            var type = null;
                            var copyType = null;
                            var status = record.status;
                            var messageType = record.messagetype;
                            var paddedZeroMessageType = "0x" + utils.padPreZero(parseInt(record.messagetype, 10).toString(16), 4);
                            if (messageType == 0x200) {
                                var isLocated = (status & 0x4) == 0x4;
                                if (isLocated) {
                                    type = paddedZeroMessageType + '-1(' + record.messagetype + ')';
                                    copyType = paddedZeroMessageType + '-1(' + record.typedescr + ')';
                                } else {
                                    type = paddedZeroMessageType + '-0(' + record.messagetype + ')';
                                    copyType = paddedZeroMessageType + '-1(' + record.typedescr + ')';
                                }
                            } else {
                                type = paddedZeroMessageType + '(' + record.messagetype + ')';
                                copyType = paddedZeroMessageType + '(' + record.typedescr + ')';
                            }
                            record.messagetype = type;
                            record.reportmodeStr = reportmodeStr = getReportModeStr(record.reportmode);
                            record.updatetimeStr = '\t' + DateFormat.longToDateTimeStr(record.updatetime, timeDifference);
                            if (seriesObj[copyType] == undefined) {
                                seriesObj[copyType] = {
                                    name: copyType,
                                    value: 1
                                };
                            } else {
                                seriesObj[copyType].value++;
                            }
                        });
                        resp.records.sort(function(a, b) {
                            return b.updatetime - a.updatetime;
                        });

                        me.seriesData = Object.values(seriesObj);
                        me.seriesData.sort(function(a, b) {
                            return b.value - a.value;
                        });
                        me.charts(isZh ? "上报比例" : 'Proportion');
                        me.data = Object.freeze(resp.records);
                        me.total = me.data.length;
                        me.tableData = me.data.slice(0, 20);
                        me.currentIndex = 1;
                    } else {
                        me.total = 0;
                        me.data = [];
                        me.tableData = [];
                    }
                })
            }
        },
        watch: {
            filterStr: function() {
                if (this.filterStr == '') {
                    this.tableData = this.data.slice((this.currentIndex - 1) * 20, (this.currentIndex - 1) * 20 + 20);
                }
            }
        },
        mounted: function() {
            var me = this;
            this.groupslist = groupslist;
            this.calcTableHeight();
            this.dayTime = 60 * 60 * 24 * 1000;
            this.seriesData = [];
            this.chartsIns = echarts.init(document.getElementById('msg_charts'));
            this.charts(isZh ? "上报比例" : 'Proportion');
            window.onresize = function() {
                me.calcTableHeight();
            };
        },
    })
}


// 查询报警
function allAlarm(groupslist) {
    vueInstanse = new Vue({
        el: "#all-alarm",
        i18n: utils.getI18n(),
        data: {
            loading: false,
            groupslist: [],
            alarmColumns: [
                { type: 'index', width: 60, align: 'center' },
                {
                    title: vRoot.$t("alarm.devName"),
                    key: 'devicename',
                    width: 120,
                },
                {
                    title: vRoot.$t("reportForm.startAlarmDate"),
                    key: 'startalarmtimeStr',
                    width: 160
                },
                {
                    title: vRoot.$t("reportForm.lastAlarmDate"),
                    key: 'lastalarmtimeStr',
                    width: 160
                },
                {
                    title: vRoot.$t("reportForm.alarmInfo"),
                    key: isZh ? 'stralarm' : 'stralarmen',
                },
                {
                    title: vRoot.$t("reportForm.alarmCount"),
                    key: 'alarmcount',
                    width: 110
                },
                {
                    title: vRoot.$t("reportForm.isDispose"),
                    key: 'isdispose',
                    width: 100
                },
                {
                    title: vRoot.$t("reportForm.disposePerson"),
                    key: 'disposeperson',
                    width: 100
                },
            ],
            alarmData: [],
            tableHeight: 100,
        },
        mixins: [reportMixin],
        methods: {
            calcTableHeight: function() {
                var wHeight = window.innerHeight;
                this.tableHeight = wHeight - 125;
            },
            onClickQuery: function() {
                var self = this;
                if (!this.queryDeviceId) {
                    this.$Message.error(self.$t("reportForm.selectDevTip"));
                    return;
                };
                var data = {
                    devices: [this.queryDeviceId]
                };
                this.loading = true;
                var url = myUrls.reportAlarm();
                utils.sendAjax(url, data, function(resp) {
                    if (resp.status == 0) {
                        var alarmRecords = [];
                        if (resp.alarmrecords && resp.alarmrecords.length) {
                            resp.alarmrecords.sort(function(a, b) { return b.lastalarmtime - a.lastalarmtime; });
                            resp.alarmrecords.forEach(function(record) {
                                var isdispose = record.disposestatus === 0 ? self.$t("reportForm.untreated") : self.$t("reportForm.handled");
                                alarmRecords.push({
                                    devicename: vstore.state.deviceInfos[record.deviceid].devicename,
                                    alarmcount: record.alarmcount,
                                    lastalarmtimeStr: DateFormat.longToDateTimeStr(record.lastalarmtime, timeDifference),
                                    startalarmtimeStr: DateFormat.longToDateTimeStr(record.startalarmtime, timeDifference),
                                    isdispose: isdispose,
                                    stralarm: record.stralarm,
                                    stralarmen: record.stralarmen,
                                    disposeperson: record.disposeperson ? record.disposeperson : '',
                                });
                            });
                            self.alarmData = alarmRecords;
                        } else {
                            self.alarmData = [];
                        }
                    } else {
                        self.alarmData = [];
                    }
                    self.loading = false;
                });
            },
        },
        computed: {
            calcHeight: function() {
                return this.lastTableHeight + 45;
            }
        },
        mounted: function() {
            var me = this;
            me.groupslist = groupslist;
            this.calcTableHeight();
            this.$nextTick(function() {
                if (isToAlarmListRecords) {
                    isToAlarmListRecords = false;
                    me.sosoValue = me.getDeviceTitle(globalDeviceId);
                    me.queryDeviceId = globalDeviceId;
                    me.onClickQuery();
                }
            });
        }
    })
}

//

function phoneAlarm(groupslist) {
    vueInstanse = new Vue({
        el: '#phone-alarm',
        i18n: utils.getI18n(),
        mixins: [reportMixin],
        data: {
            loading: false,
            tableHeight: 100,
            groupslist: [],
            timeoutIns: null,
            isShowMatchDev: true,
            columns: [
                { type: 'index', width: 60, align: 'center' },
                { title: vRoot.$t("alarm.devNum"), key: 'deviceid', width: 200 },
                { title: isZh ? '报警类型' : 'alarm Type', key: 'stralarm' },
                { title: isZh ? '时间' : 'date', key: 'datestr' },
                { title: isZh ? '结果' : 'result', key: 'notifyresult' },
            ],
            tableData: []
        },
        methods: {
            calcTableHeight: function() {
                var wHeight = window.innerHeight;
                this.tableHeight = wHeight - 125;
            },
            onClickQuery: function() {
                if (this.queryDeviceId == "") {
                    this.$Message.error(this.$t('reportForm.selectDevTip'));
                    return
                };
                var me = this;
                var url = myUrls.queryCallAlarm();
                var data = {
                    deviceid: this.queryDeviceId
                }
                this.loading = true;
                utils.sendAjax(url, data, function(resp) {
                    if (resp.status === 0) {
                        var records = resp.records;
                        var tableData = [];
                        records.forEach(function(record) {
                            tableData.push({
                                deviceid: me.queryDeviceId,
                                notifyresult: record.notifyresult,
                                datestr: DateFormat.longToDateTimeStr(new Date(record.lastalarmtime), timeDifference),
                                stralarm: record.stralarm
                            })
                        });
                        me.tableData = tableData;
                    }
                    me.loading = false;
                })
            },
        },
        mounted: function() {
            var me = this;
            this.groupslist = groupslist;
            this.calcTableHeight();
            this.$nextTick(function() {
                if (isToPhoneAlarmRecords) {
                    isToPhoneAlarmRecords = false;
                    me.sosoValue = me.getDeviceTitle(globalDeviceId);
                    me.queryDeviceId = globalDeviceId;
                    me.onClickQuery();
                }
            });
            window.onresize = function() {
                me.calcTableHeight();
            }
        }
    });
}

function wechatAlarm(groupslist) {
    vueInstanse = new Vue({
        el: '#phone-alarm',
        i18n: utils.getI18n(),
        mixins: [reportMixin],
        data: {
            loading: false,
            tableHeight: 100,
            groupslist: [],
            timeoutIns: null,
            isShowMatchDev: true,
            columns: [
                { type: 'index', width: 60, align: 'center' },
                { title: vRoot.$t("alarm.devNum"), key: 'deviceid', width: 200 },
                { title: isZh ? '报警类型' : 'alarm Type', key: 'stralarm' },
                { title: isZh ? '时间' : 'date', key: 'datestr' },
                { title: isZh ? '结果' : 'result', key: 'notifyresult' },
            ],
            tableData: []
        },
        methods: {
            calcTableHeight: function() {
                var wHeight = window.innerHeight;
                this.tableHeight = wHeight - 125;
            },
            onClickQuery: function() {
                if (this.queryDeviceId == "") {
                    this.$Message.error(this.$t('reportForm.selectDevTip'));
                    return
                };
                var me = this;
                var url = myUrls.queryWechatAlarm();
                var data = {
                    deviceid: this.queryDeviceId
                }
                this.loading = true;
                utils.sendAjax(url, data, function(resp) {
                    if (resp.status === 0) {
                        var records = resp.records;
                        var tableData = [];
                        records.forEach(function(record) {
                            tableData.push({
                                deviceid: me.queryDeviceId,
                                notifyresult: record.notifyresult,
                                datestr: DateFormat.longToDateTimeStr(new Date(record.lastalarmtime), timeDifference),
                                stralarm: record.stralarm
                            })
                        });
                        me.tableData = tableData;
                    }
                    me.loading = false;
                })
            },
        },
        mounted: function() {
            var me = this;
            this.groupslist = groupslist;
            this.calcTableHeight();
            this.$nextTick(function() {
                if (isToPhoneAlarmRecords) {
                    isToPhoneAlarmRecords = false;
                    me.sosoValue = me.getDeviceTitle(globalDeviceId);
                    me.queryDeviceId = globalDeviceId;
                    me.onClickQuery();
                }
            });
            window.onresize = function() {
                me.calcTableHeight();
            }
        }
    });
}


function rechargeRecords(groupslist) {
    vueInstanse = new Vue({
        el: '#recharge-records',
        i18n: utils.getI18n(),
        mixins: [reportMixin],
        data: {
            loading: false,
            tableHeight: 100,
            groupslist: [],
            timeoutIns: null,
            isShowMatchDev: true,
            columns: [
                { type: 'index', width: 60, align: 'center' },
                { title: isZh ? '用户' : 'userName', key: 'username' },
                { title: vRoot.$t("alarm.devNum"), key: 'deviceid' },
                { title: isZh ? '时间' : 'date', key: 'chargetimeStr' },
                { title: isZh ? '单号' : 'outtradeno', key: 'outtradeno' },
                { title: isZh ? '价格' : 'Price', key: 'fee' },
            ],
            tableData: []
        },
        methods: {
            calcTableHeight: function() {
                var wHeight = window.innerHeight;
                this.tableHeight = wHeight - 125;
            },
            onClickQuery: function() {

                var me = this;
                var url = myUrls.reportChargeCall();
                var data = {
                    username: userName,
                }

                this.queryDeviceId && (data.deviceid = this.queryDeviceId);

                utils.sendAjax(url, data, function(resp) {
                    if (resp.status === 0) {
                        var records = resp.records;
                        var tableData = [];
                        records.forEach(function(record) {
                            tableData.push({
                                username: record.username,
                                deviceid: record.deviceid,
                                chargetimeStr: DateFormat.longToDateTimeStr(record.chargetime, 0),
                                outtradeno: record.outtradeno,
                                fee: (record.fee / 100) + "元",
                            })
                        });
                        me.tableData = tableData;
                    }
                })
            },
        },
        mounted: function() {
            var me = this;
            this.groupslist = groupslist;
            this.calcTableHeight();
            window.onresize = function() {
                me.calcTableHeight();
            }
        }
    });
}


function insureRecords(groupslist) {
    vueInstanse = new Vue({
        el: '#insure-records',
        i18n: utils.getI18n(),
        mixins: [treeMixin],
        data: {
            exactValue: '',
            dayNumberType: 0,
            clearable: false,
            dateVal: [DateFormat.longToDateStr(Date.now(), timeDifference), DateFormat.longToDateStr(Date.now(), timeDifference)],
            error: 123,
            createrToUser: userName,
            currentIndex: 1,
            total: 0,
            modal: false,
            columns: [{
                    title: vRoot.$t("reportForm.index"),
                    key: 'index',
                    width: 70,
                    fixed: 'left',
                },
                {
                    title: vRoot.$t("reportForm.examine"),
                    key: 'isPay',
                    width: 100,
                    fixed: 'left',
                },
                { title: vRoot.$t("reportForm.name"), key: 'name', width: 100, fixed: 'left', },
                { title: vRoot.$t("reportForm.idNumber"), key: 'cardid', width: 160, fixed: 'left', },
                {
                    title: vRoot.$t("reportForm.policyNumber"),
                    width: 100,
                    fixed: 'left',
                    key: 'policyno',
                    "sortable": true,
                },
                { title: vRoot.$t("reportForm.addDate"), key: 'createtimeStr', width: 150, "sortable": true },
                {
                    title: vRoot.$t("reportForm.purchaseMethod"),
                    key: 'buytype',
                    width: 100,
                    render: function(h, parmas) {
                        var buytype = parmas.row.buytype,
                            reslut = isZh ? '未知' : 'unknown';
                        if (buytype === 1) {
                            reslut = isZh ? '自行购买' : 'Self purchase';
                        } else if (buytype === 2) {
                            reslut = isZh ? '厂家购买' : 'manufactor';
                        }
                        return h('span', {}, reslut);
                    }
                },
                { title: vRoot.$t("reportForm.distributor"), key: 'username', width: 150 },
                { title: vRoot.$t("reportForm.distributorAddress"), key: 'useraddress', width: 150 },
                { title: vRoot.$t("reportForm.distributorPhone"), key: 'usernamephonenum', width: 120 },
                { title: vRoot.$t("reportForm.phonenum"), key: 'phonenum', width: 120 },
                { title: vRoot.$t("reportForm.usingaddress"), key: 'usingaddress', width: 150 },
                { title: vRoot.$t("reportForm.brandtype"), key: 'brandtype', width: 100 },
                { title: vRoot.$t("reportForm.vinno"), key: 'vinno', width: 150 },
                { title: vRoot.$t("reportForm.gpsid"), key: 'deviceid', width: 150 },
                { title: vRoot.$t("reportForm.buycarday"), key: 'buycarday', width: 100 },
                { title: vRoot.$t("reportForm.carvalue"), key: 'carvalue', width: 100 },
                { title: vRoot.$t("reportForm.insureprice"), key: 'insureprice', width: 100 },
                { title: vRoot.$t("reportForm.insurefee"), key: 'insurefee', width: 80 },
                {
                    title: vRoot.$t("reportForm.qualitycert"),
                    key: 'qualitycerturl',
                    width: 100,
                    render: function(h, parmas) {
                        if (parmas.row.qualitycerturl == null) {
                            return h('span', {}, vRoot.$t("reportForm.empty"));
                        }
                        return h('a', { attrs: { href: parmas.row.qualitycerturl, target: '_blank' } }, vRoot.$t("reportForm.clickPreview"));
                    }
                },
                {
                    title: vRoot.$t("reportForm.carpic"),
                    key: 'carpicurl',
                    width: 100,
                    render: function(h, parmas) {
                        if (parmas.row.carpicurl == null) {
                            return h('span', {}, vRoot.$t("reportForm.empty"));
                        }
                        return h('a', { attrs: { href: parmas.row.carpicurl, target: '_blank' } }, vRoot.$t("reportForm.clickPreview"));
                    }
                },
                {
                    title: vRoot.$t("reportForm.positivecardid"),
                    key: 'positivecardidurl',
                    width: 100,
                    render: function(h, parmas) {
                        if (parmas.row.positivecardidurl == null) {
                            return h('span', {}, vRoot.$t("reportForm.empty"));
                        }
                        return h('a', { attrs: { href: parmas.row.positivecardidurl, target: '_blank' } }, vRoot.$t("reportForm.clickPreview"));
                    }
                },
                {
                    title: vRoot.$t("reportForm.negativecardid"),
                    key: 'negativecardidurl',
                    width: 100,
                    render: function(h, parmas) {
                        if (parmas.row.negativecardidurl == null) {
                            return h('span', {}, vRoot.$t("reportForm.empty"));
                        }
                        return h('a', { attrs: { href: parmas.row.negativecardidurl, target: '_blank' } }, vRoot.$t("reportForm.clickPreview"));
                    }
                },
                {
                    title: vRoot.$t("reportForm.invoice"),
                    key: 'invoiceurl',
                    width: 100,
                    render: function(h, parmas) {
                        if (parmas.row.invoiceurl == null) {
                            return h('span', {}, vRoot.$t("reportForm.empty"));
                        }
                        return h('a', { attrs: { href: parmas.row.invoiceurl, target: '_blank' } }, vRoot.$t("reportForm.clickPreview"));
                    }
                },
                {
                    title: vRoot.$t("reportForm.groupphoto"),
                    key: 'groupphotourl',
                    width: 120,
                    render: function(h, parmas) {
                        if (parmas.row.groupphotourl == null) {
                            return h('span', {}, vRoot.$t("reportForm.empty"));
                        }
                        return h('a', { attrs: { href: parmas.row.groupphotourl, target: '_blank' } }, vRoot.$t("reportForm.clickPreview"));
                    }
                },
                {
                    title: vRoot.$t("reportForm.carkeypic"),
                    key: 'carkeypicurl',
                    width: 120,
                    render: function(h, parmas) {
                        if (parmas.row.carkeypicurl == null) {
                            return h('span', {}, vRoot.$t("reportForm.empty"));
                        }
                        return h('a', { attrs: { href: parmas.row.carkeypicurl, target: '_blank' } }, vRoot.$t("reportForm.clickPreview"));
                    }
                },
                {
                    title: vRoot.$t("reportForm.insurenotice"),
                    key: 'insurenoticeurl',
                    width: 120,
                    render: function(h, parmas) {
                        if (parmas.row.insurenoticeurl == null) {
                            return h('span', {}, vRoot.$t("reportForm.empty"));
                        }
                        return h('a', { attrs: { href: parmas.row.insurenoticeurl, target: '_blank' } }, vRoot.$t("reportForm.clickPreview"));
                    }
                },
                {
                    title: vRoot.$t("bgMgr.action"),
                    key: 'action',
                    width: 240,
                    fixed: 'right',
                    render: function(h, params) {
                        var isPay = params.row.insurestate == 1 ? true : false;
                        return h('div', [
                            h('Button', {
                                props: {
                                    type: 'primary',
                                    size: 'small'
                                },
                                style: {
                                    marginRight: '5px'
                                },
                                on: {
                                    click: function() {
                                        vueInstanse.editDeviceIndex = params.index;
                                        vueInstanse.editObjectRow.name = params.row.name;
                                        vueInstanse.editObjectRow.cardid = params.row.cardid;
                                        vueInstanse.editObjectRow.phonenum = params.row.phonenum;
                                        vueInstanse.editObjectRow.vinno = params.row.vinno;
                                        vueInstanse.editObjectRow.usernamephonenum = params.row.usernamephonenum;
                                        vueInstanse.editObjectRow.insureid = params.row.insureid;
                                        vueInstanse.editObjectRow.isRecharge = isPay ? false : true;
                                        vueInstanse.handleEditInsure();
                                    }
                                }
                            }, isPay ? vRoot.$t("reportForm.cancelAudit") : vRoot.$t("reportForm.confirmAudit")),
                            h('Button', {
                                props: {
                                    type: 'primary',
                                    size: 'small'
                                },
                                style: {
                                    marginRight: '5px'
                                },
                                on: {
                                    click: function() {
                                        vueInstanse.editDeviceIndex = params.index;
                                        vueInstanse.editObjectRow.name = params.row.name;
                                        vueInstanse.editObjectRow.cardid = params.row.cardid;
                                        vueInstanse.editObjectRow.phonenum = params.row.phonenum;
                                        vueInstanse.editObjectRow.vinno = params.row.vinno;
                                        vueInstanse.editObjectRow.usernamephonenum = params.row.usernamephonenum;
                                        vueInstanse.editObjectRow.insureid = params.row.insureid;
                                        vueInstanse.editObjectRow.isRecharge = params.row.insurestate == 1 ? true : false;
                                        vueInstanse.editObjectRow.createtime = new Date(params.row.createtimeStr);
                                        vueInstanse.modal = true;
                                    }
                                }
                            }, vRoot.$t("bgMgr.edit")),
                            h('Button', {
                                props: {
                                    type: 'error',
                                    size: 'small',
                                },
                                style: {
                                    marginRight: '5px'
                                },
                                on: {
                                    click: function() {
                                        vueInstanse.editDeviceIndex = params.index;
                                        vueInstanse.handleDelete(params.row);
                                    }
                                }
                            }, vRoot.$t("bgMgr.delete"))
                        ]);
                    }
                }
            ],
            tableHeight: 300,
            tableData: [],
            loading: false,
            isFilter: '2',
            editObjectRow: {
                name: '',
                cardid: '',
                phonenum: '',
                vinno: "",
                usernamephonenum: '',
                isRecharge: false,
                createtime: '',
            },
            disabled: true
        },
        methods: {
            searchValueChange: function() {
                if (this.groupslist !== null) {
                    this.searchfilterMethod(this.sosoValue.toLowerCase());
                } else {
                    console.log('tree数据还未返回');
                }
            },
            searchfilterMethod: function(value) {
                this.treeData = [];
                this.treeData = this.variableDeepSearchIview(this.groupslist, value, 0);
                this.checkedDevice = [];
                if (this.isShowMatchDev == false) {
                    this.isShowMatchDev = true;
                }
            },
            variableDeepSearchIview: function(treeDataFilter, searchWord, limitcount) {
                var childTemp = [];
                var that = this;
                for (var i = 0; i < treeDataFilter.length; i++) {
                    var copyItem = null;
                    var item = treeDataFilter[i];
                    if (item != null) {
                        var isFound = false;
                        if (item.title.toLowerCase().indexOf(searchWord) != -1 || (item.deviceid && item.deviceid.indexOf(searchWord) != -1)) {
                            copyItem = deepClone(item);
                            copyItem.expand = false;
                            isFound = true;
                        }
                        if (isFound == false && item.children && item.children.length > 0) {
                            var rs = that.variableDeepSearchIview(item.children, searchWord, limitcount);
                            if (rs && rs.length > 0) {
                                copyItem = deepClone(item);
                                copyItem.children = rs;
                                copyItem.expand = true;
                                isFound = true;
                            }
                        }
                        if (isFound == true) {
                            limitcount++;
                            childTemp.push(copyItem);
                            if (limitcount > 10) {
                                break;
                            }
                        }
                    }
                }
                return childTemp;
            },
            onChange: function(value) {
                this.dateVal = value;
            },
            handleEditInsure: function() {
                var url = myUrls.editInsure(),
                    me = this;
                this.editObjectRow.insurestate = me.editObjectRow.isRecharge ? 1 : 0;
                var d = deepClone(this.editObjectRow);
                if (d.createtime == "" || d.createtime == null) {
                    this.$Message.error(this.$t('message.plSelectTime'));
                    return;
                };
                d.createtime = new Date(d.createtime).getTime();

                utils.sendAjax(url, d, function(respData) {
                    if (respData.status == 0) {
                        var data = me.tableData[me.editDeviceIndex];
                        var cdata = me.insureRecords[data.index - 1];
                        data.name = me.editObjectRow.name;
                        data.cardid = me.editObjectRow.cardid;
                        data.phonenum = me.editObjectRow.phonenum;
                        data.vinno = me.editObjectRow.vinno;
                        data.usernamephonenum = me.editObjectRow.usernamephonenum;
                        data.insurestate = me.editObjectRow.isRecharge ? 1 : 0;
                        data.isPay = data.insurestate == 1 ? me.$t('reportForm.aeviewed') : me.$t('reportForm.notReviewed');
                        data.createtimeStr = DateFormat.longToDateStr(d.createtime, timeDifference);
                        data.createtime = data.createtime;

                        cdata.name = me.editObjectRow.name;
                        cdata.cardid = me.editObjectRow.cardid;
                        cdata.phonenum = me.editObjectRow.phonenum;
                        cdata.vinno = me.editObjectRow.vinno;
                        cdata.usernamephonenum = me.editObjectRow.usernamephonenum;
                        cdata.insurestate = me.editObjectRow.isRecharge ? 1 : 0;
                        cdata.isPay = data.insurestate == 1 ? me.$t('reportForm.aeviewed') : me.$t('reportForm.notReviewed');
                        cdata.createtimeStr = DateFormat.longToDateStr(d.createtime, timeDifference);
                        cdata.createtime = data.createtime;

                        me.modal = false;
                        me.$Message.success(me.$t('message.changeSucc'));
                    } else {
                        me.$Message.error(me.$t('message.changeFail'));
                    }
                })
            },
            handleDelete: function(row) {
                var index = this.editDeviceIndex,
                    me = this;
                this.$Modal.confirm({
                    title: me.$t('reportForm.tips'),
                    content: me.$t('reportForm.tipsContent'),
                    onOk: function() {
                        var url = myUrls.deleteInsure();
                        utils.sendAjax(url, { insureid: row.insureid }, function(respData) {
                            if (respData.status == 0) {
                                me.$Message.success(me.$t('message.deleteSucc'));
                                me.tableData.splice(index, 1);
                                me.insureRecords.splice(row.index - 1, 1);
                                me.total = me.insureRecords.length;
                            } else {
                                me.$Message.error(me.$t('message.deleteFail'));
                            }
                        });
                    },
                    onCancel: function() {}
                })

            },
            queryUsersTree: function(callback) {
                var url = myUrls.queryUsersTree(),
                    me = this;
                utils.sendAjax(url, { username: userName }, function(respData) {
                    if (respData.status == 0 && respData.rootuser.user) {
                        me.disabled = false;
                        callback([me.castUsersTreeToDevicesTree(respData.rootuser)]);
                    } else {
                        me.$Message.error(me.$t('monitor.queryFail'))
                    }
                });
            },
            castUsersTreeToDevicesTree: function(devicesTreeRecord) {
                var me = this;
                var iViewTree = {
                    render: function(h, params) {
                        var username = params.data.title;
                        return h('span', {
                            on: {
                                'click': function() {
                                    me.createrToUser = username;
                                    me.sosoValue = username;
                                }
                            },
                            style: {
                                cursor: 'pointer',
                                color: (me.createrToUser == username) ? '#2D8CF0' : '#000'
                            }
                        }, [
                            h('span', [
                                h('Radio', {
                                    props: {
                                        value: username == me.createrToUser
                                    },
                                    style: {
                                        marginRight: '4px',
                                        marginLeft: '4px'
                                    }
                                }),
                                h('span', params.data.title)
                            ]),
                        ])
                    },
                    expand: true,
                };
                if (devicesTreeRecord != null) {
                    var username = devicesTreeRecord.user.username;
                    var subusers = devicesTreeRecord.subusers;
                    iViewTree.title = username;
                    if (username != null && subusers != null && subusers.length > 0) {
                        var subDevicesTreeRecord = this.doCastUsersTreeToDevicesTree(subusers);
                        iViewTree.children = subDevicesTreeRecord;

                    }
                }
                return iViewTree;
            },
            doCastUsersTreeToDevicesTree: function(usersTrees) {
                var devicesTreeRecord = [],
                    me = this;
                if (usersTrees != null && usersTrees.length > 0) {
                    for (var i = 0; i < usersTrees.length; ++i) {
                        var usersTree = usersTrees[i];
                        var username = usersTree.user.username;
                        var subusers = usersTree.subusers;
                        var currentsubDevicesTreeRecord = {
                            render: function(h, params) {
                                var username = params.data.title;
                                return h('span', {
                                    on: {
                                        'click': function() {
                                            me.createrToUser = username;
                                            me.sosoValue = username;
                                        }
                                    },
                                    style: {
                                        cursor: 'pointer',
                                        color: (me.createrToUser == username) ? '#2D8CF0' : '#000'
                                    }
                                }, [
                                    h('span', [
                                        h('Radio', {
                                            props: {
                                                value: username == me.createrToUser
                                            },
                                            style: {
                                                marginRight: '4px',
                                                marginLeft: '4px'
                                            }
                                        }),
                                        h('span', params.data.title)
                                    ]),
                                ])
                            },
                        };
                        if (username != null && subusers != null && subusers.length > 0) {
                            var subDevicesTreeRecord = this.doCastUsersTreeToDevicesTree(subusers);
                            currentsubDevicesTreeRecord.children = subDevicesTreeRecord;
                        }
                        currentsubDevicesTreeRecord.title = username;
                        devicesTreeRecord.push(currentsubDevicesTreeRecord);
                    }
                }
                return devicesTreeRecord;
            },
            calcTableHeight: function() {
                var wHeight = window.innerHeight;
                this.tableHeight = wHeight - 165;
            },
            changePage: function(index) {
                var offset = index * 20;
                var start = (index - 1) * 20;
                this.currentPageIndex = index;
                this.tableData = this.insureRecords.slice(start, offset);
            },
            changeTableColumns: function() {
                this.columns = this.getTableColumns();
            },
            queryInsures: function() {
                this.loading = true;
                var url = myUrls.queryInsures(),
                    me = this,
                    startday = DateFormat.format(new Date(this.dateVal[0]), 'yyyy-MM-dd'),
                    endday = DateFormat.format(new Date(this.dateVal[1]), 'yyyy-MM-dd');
                utils.sendAjax(url, { username: this.createrToUser, startday: startday, endday: endday, offset: timeDifference }, function(resp) {
                    me.loading = false;
                    if (resp.status === 0 && resp.insures) {
                        //全部
                        if (me.isFilter == '0') {

                            me.insureRecords = (function() {
                                var tableData = [];
                                resp.insures.forEach(function(item, index) {
                                    item.index = index + 1;
                                    item.createtimeStr = DateFormat.longToDateStr(item.createtime, timeDifference)
                                    if (item.policyno == null) {
                                        item.policyno = vRoot.$t('reportForm.underReview');
                                    };
                                    if (item.insurestate !== 1) {
                                        item.index = tableData.length + 1;
                                        item.isPay = item.insurestate == 1 ? vRoot.$t('reportForm.aeviewed') : vRoot.$t('reportForm.notReviewed');
                                        tableData.push(item);
                                    };
                                })
                                return tableData;
                            })();
                        } else if (me.isFilter == '1') {
                            // me.insureRecords = resp.insures;
                            me.insureRecords = (function() {
                                var tableData = [];

                                resp.insures.forEach(function(item, index) {
                                    item.index = index + 1;
                                    item.createtimeStr = DateFormat.format(new Date(item.createtime), 'yyyy-MM-dd')
                                    if (item.policyno == null) {
                                        item.policyno = vRoot.$t('reportForm.underReview');
                                    };
                                    if (item.insurestate === 1) {
                                        item.index = tableData.length + 1;
                                        item.isPay = item.insurestate == 1 ? vRoot.$t('reportForm.aeviewed') : vRoot.$t('reportForm.notReviewed');
                                        tableData.push(item);
                                    };
                                })
                                return tableData;
                            })();
                        } else if (me.isFilter == '2') {
                            //2代表全部
                            resp.insures.forEach(function(item, index) {
                                item.index = index + 1;
                                if (item.policyno == null) {
                                    item.policyno = vRoot.$t('reportForm.underReview');
                                };
                                item.isPay = item.insurestate == 1 ? vRoot.$t('reportForm.aeviewed') : vRoot.$t('reportForm.notReviewed');
                                item.createtimeStr = DateFormat.format(new Date(item.createtime), 'yyyy-MM-dd')
                            })
                            me.insureRecords = resp.insures;
                        }
                        me.total = me.insureRecords.length;
                        me.currentIndex = 1;
                        me.tableData = me.insureRecords.slice(0, 20);
                    } else {
                        me.total = 0;
                        me.currentIndex = 1;
                        me.tableData = [];
                        me.insureRecords = [];
                    }

                }, function() {
                    me.loading = false;
                })
            },
            exactQueryInsures: function() {
                if (this.exactValue == '') {
                    this.$Message.error(vRoot.$t('reportForm.insurePlaceholder'));
                    return;
                };
                var url = myUrls.queryInsureByKeyWord(),
                    me = this;
                utils.sendAjax(url, { keyword: this.exactValue }, function(resp) {
                    me.loading = false;
                    if (resp.status == 0) {
                        resp.insures.forEach(function(item, index) {
                            item.index = index + 1;
                            if (item.policyno == null) {
                                item.policyno = vRoot.$t('reportForm.underReview');
                            };
                            item.isPay = item.insurestate == 1 ? vRoot.$t('reportForm.aeviewed') : vRoot.$t('reportForm.notReviewed');
                            item.createtimeStr = DateFormat.format(new Date(item.createtime), 'yyyy-MM-dd')
                        })
                        me.insureRecords = resp.insures;
                        me.total = me.insureRecords.length;
                        me.currentIndex = 1;
                        me.tableData = me.insureRecords.slice(0, 20);
                    } else {
                        me.$Message.error(vRoot.$t('monitor.queryFail'));
                    }
                }, function() {
                    me.loading = false;
                });
            },
            exportData: function() {
                var tableData = deepClone(this.insureRecords);
                tableData.forEach(function(item) {
                    item.cardid = "\t" + item.cardid;
                    item.usernamephonenum = "\t" + item.usernamephonenum;
                    item.phonenum = "\t" + item.phonenum;
                    item.policyno = "\t" + item.policyno;
                    item.vinno = "\t" + item.vinno;
                });
                this.$refs.table.exportCsv({
                    filename: vRoot.$t('reportForm.insureData'),
                    original: false,
                    columns: this.columns,
                    data: tableData
                });
            },
        },
        mounted: function() {
            var me = this;
            me.queryUsersTree(function(usersTree) {
                me.groupslist = usersTree;
                me.treeData = usersTree;
            });
            this.sosoValue = userName;
            this.calcTableHeight();
            this.queryInsures();
            this.editDeviceIndex = null;
            this.insureRecords = [];
        },
    })
}

function salesRecord(groupslist) {
    vueInstanse = new Vue({
        el: '#sales-record',
        i18n: utils.getI18n(),
        mixins: [treeMixin],
        data: {
            isFilter: false,
            dayNumberType: 0,
            dateVal: [DateFormat.longToDateStr(Date.now(), timeDifference), DateFormat.longToDateStr(Date.now(), timeDifference)],
            error: 123,
            createrToUser: userName,
            currentIndex: 1,
            total: 0,
            columns: [{
                    title: vRoot.$t("reportForm.index"),
                    key: 'index',
                    width: 70,
                },
                {
                    title: vRoot.$t("reportForm.storeNumber"),
                    key: 'username',
                },
                {
                    title: vRoot.$t("reportForm.storeName"),
                    key: 'companyname'
                }, {
                    title: vRoot.$t("reportForm.name"),
                    key: 'cardname'
                }, {
                    title: vRoot.$t("customer.contactNumber"),
                    key: 'phone'
                }, {
                    title: vRoot.$t("reportForm.address"),
                    key: 'companyaddr'
                }, {
                    title: vRoot.$t("reportForm.cumulativeRecords"),
                    key: 'totalinsurecount'
                },
                {
                    title: vRoot.$t("reportForm.surplus"),
                    key: 'remaininsurecount',
                },
                {
                    title: vRoot.$t("reportForm.exFactory"),
                    key: 'agentinsurecount',
                },
                {
                    title: vRoot.$t("reportForm.buyOneself"),
                    key: 'individualinsurecount',
                },
            ],
            tableHeight: 300,
            tableData: [],
            loading: false,
            disabled: true
        },
        methods: {
            searchValueChange: function() {
                if (this.groupslist !== null) {
                    this.searchfilterMethod(this.sosoValue.toLowerCase());
                } else {
                    console.log('tree数据还未返回');
                }
            },
            searchfilterMethod: function(value) {
                this.treeData = [];
                this.treeData = this.variableDeepSearchIview(this.groupslist, value, 0);
                this.checkedDevice = [];
                if (this.isShowMatchDev == false) {
                    this.isShowMatchDev = true;
                }
            },
            variableDeepSearchIview: function(treeDataFilter, searchWord, limitcount) {
                var childTemp = [];
                var that = this;
                for (var i = 0; i < treeDataFilter.length; i++) {
                    var copyItem = null;
                    var item = treeDataFilter[i];
                    if (item != null) {
                        var isFound = false;
                        if (item.title.toLowerCase().indexOf(searchWord) != -1 || (item.deviceid && item.deviceid.indexOf(searchWord) != -1)) {
                            copyItem = deepClone(item);
                            copyItem.expand = false;
                            isFound = true;
                        }
                        if (isFound == false && item.children && item.children.length > 0) {
                            var rs = that.variableDeepSearchIview(item.children, searchWord, limitcount);
                            if (rs && rs.length > 0) {
                                copyItem = deepClone(item);
                                copyItem.children = rs;
                                copyItem.expand = true;
                                isFound = true;
                            }
                        }
                        if (isFound == true) {
                            limitcount++;
                            childTemp.push(copyItem);
                            if (limitcount > 10) {
                                break;
                            }
                        }
                    }
                }
                return childTemp;
            },
            handleSelectdDate: function(dayNumber) {
                this.dayNumberType = dayNumber;
                var dayTime = 24 * 60 * 60 * 1000;
                if (dayNumber == 0) {
                    this.dateVal = [DateFormat.longToDateStr(Date.now(), timeDifference), DateFormat.longToDateStr(Date.now(), timeDifference)];
                } else if (dayNumber == 1) {
                    this.dateVal = [DateFormat.longToDateStr(Date.now() - dayTime, timeDifference), DateFormat.longToDateStr(Date.now() - dayTime, timeDifference)];
                } else if (dayNumber == 3) {
                    this.dateVal = [DateFormat.longToDateStr(Date.now() - dayTime * 2, timeDifference), DateFormat.longToDateStr(Date.now(), timeDifference)];
                } else if (dayNumber == 7) {
                    this.dateVal = [DateFormat.longToDateStr(Date.now() - dayTime * 6, timeDifference), DateFormat.longToDateStr(Date.now(), timeDifference)];
                }
            },
            onChange: function(value) {
                this.dateVal = value;
            },
            queryUsersTree: function(callback) {
                var url = myUrls.queryUsersTree(),
                    me = this;
                utils.sendAjax(url, { username: userName }, function(respData) {
                    if (respData.status == 0 && respData.rootuser.user) {
                        me.disabled = false;
                        callback([me.castUsersTreeToDevicesTree(respData.rootuser)]);
                    } else {
                        me.$Message.error(me.$t('monitor.queryFail'));
                    }
                });
            },
            castUsersTreeToDevicesTree: function(devicesTreeRecord) {
                var me = this;
                var iViewTree = {
                    render: function(h, params) {
                        var username = params.data.title;
                        return h('span', {
                            on: {
                                'click': function() {
                                    me.createrToUser = username;
                                    me.sosoValue = username;
                                }
                            },
                            style: {
                                cursor: 'pointer',
                                color: (me.createrToUser == username) ? '#2D8CF0' : '#000'
                            }
                        }, [
                            h('span', [
                                h('Radio', {
                                    props: {
                                        value: username == me.createrToUser
                                    },
                                    style: {
                                        marginRight: '4px',
                                        marginLeft: '4px'
                                    }
                                }),
                                h('span', params.data.title)
                            ]),
                        ])
                    },
                    expand: true,
                };
                if (devicesTreeRecord != null) {
                    var username = devicesTreeRecord.user.username;
                    var subusers = devicesTreeRecord.subusers;
                    iViewTree.title = username;
                    if (username != null && subusers != null && subusers.length > 0) {
                        var subDevicesTreeRecord = this.doCastUsersTreeToDevicesTree(subusers);
                        iViewTree.children = subDevicesTreeRecord;
                    }
                }
                return iViewTree;
            },
            doCastUsersTreeToDevicesTree: function(usersTrees) {
                var devicesTreeRecord = [],
                    me = this;
                if (usersTrees != null && usersTrees.length > 0) {
                    for (var i = 0; i < usersTrees.length; ++i) {
                        var usersTree = usersTrees[i];
                        var username = usersTree.user.username;
                        var subusers = usersTree.subusers;
                        var currentsubDevicesTreeRecord = {
                            render: function(h, params) {
                                var username = params.data.title;
                                return h('span', {
                                    on: {
                                        'click': function() {
                                            me.createrToUser = username;
                                            me.sosoValue = username;
                                        }
                                    },
                                    style: {
                                        cursor: 'pointer',
                                        color: (me.createrToUser == username) ? '#2D8CF0' : '#000'
                                    }
                                }, [
                                    h('span', [
                                        h('Radio', {
                                            props: {
                                                value: username == me.createrToUser
                                            },
                                            style: {
                                                marginRight: '4px',
                                                marginLeft: '4px'
                                            }
                                        }),
                                        h('span', params.data.title)
                                    ]),
                                ])
                            },
                        };
                        if (username != null && subusers != null && subusers.length > 0) {
                            var subDevicesTreeRecord = this.doCastUsersTreeToDevicesTree(subusers);
                            currentsubDevicesTreeRecord.children = subDevicesTreeRecord;
                        }

                        currentsubDevicesTreeRecord.title = username;
                        devicesTreeRecord.push(currentsubDevicesTreeRecord);
                    }
                }
                return devicesTreeRecord;
            },
            calcTableHeight: function() {
                var wHeight = window.innerHeight;
                this.tableHeight = wHeight - 165;
            },
            changePage: function(index) {
                var offset = index * 20;
                var start = (index - 1) * 20;
                this.currentPageIndex = index;
                this.tableData = this.insureRecords.slice(start, offset);
            },
            changeTableColumns: function() {
                this.columns = this.getTableColumns();
            },
            queryInsures: function() {
                this.loading = true;
                var url = myUrls.reportInsure(),
                    me = this,
                    startday = DateFormat.format(new Date(this.dateVal[0]), 'yyyy-MM-dd'),
                    endday = DateFormat.format(new Date(this.dateVal[1]), 'yyyy-MM-dd');
                utils.sendAjax(url, { username: this.createrToUser, startday: startday, endday: endday, offset: timeDifference }, function(resp) {
                    me.loading = false;
                    if (resp.status === 0) {
                        if (me.isFilter) {
                            var filters = [];
                            var index = 1;
                            resp.records.forEach(function(item) {
                                if (item.agentinsurecount != 0 || item.individualinsurecount != 0 || item.remaininsurecount != 0) {
                                    filters.push(item);
                                    index++;
                                }
                            });
                            me.insureRecords = filters;
                        } else {
                            resp.records.forEach(function(item, index) {
                                item.index = index + 1;
                            });
                            me.insureRecords = resp.records;
                        }


                        me.total = me.insureRecords.length;
                        me.currentIndex = 1;
                        me.tableData = me.insureRecords.slice(0, 20);
                    } else {
                        me.total = 0;
                        me.currentIndex = 1;
                        me.tableData = [];
                        me.insureRecords = [];
                    }

                }, function() {
                    me.loading = false;
                })
            },
            exportData: function() {
                var tableData = deepClone(this.tableData);
                tableData.forEach(function(item) {
                    item.cardid = "\t" + item.cardid;
                    item.usernamephonenum = "\t" + item.usernamephonenum;
                    item.phonenum = "\t" + item.phonenum;
                });
                this.$refs.table.exportCsv({
                    filename: vRoot.$t('reportForm.insureData'),
                    original: false,
                    columns: this.columns,
                    data: tableData
                });
            },
        },
        mounted: function() {
            var me = this;
            me.queryUsersTree(function(usersTree) {
                me.groupslist = usersTree;
                me.treeData = usersTree;
            });
            this.sosoValue = userName;
            this.calcTableHeight();
            // this.queryInsures();
            this.editDeviceIndex = null;
            this.insureRecords = [];
        },
    })
}




//综合上线统计
function reportOnlineSummary(groupslist) {
    vueInstanse = new Vue({
        i18n: utils.getI18n(),
        el: "#reportonlinesummary",
        mixins: [treeMixin],
        data: {
            multiple: false,
            createrToUser: userName,
            userlists: globalUserList,
            groupslist: [],
            iconState: 'ios-arrow-down',
            columns: [
                { type: 'index', width: 60 },
                { title: vRoot.$t('alarm.devNum'), key: 'deviceid', },
                { title: vRoot.$t('alarm.devName'), key: 'devicename', sortable: true, },
                { title: 'SIM', key: 'simnum', sortable: true },
                {
                    title: vRoot.$t('monitor.groupName'),
                    key: 'groupid',
                    render: function(h, params) {
                        var groupid = params.row.groupid;
                        var deviceid = params.row.deviceid;
                        var groupName = '';
                        if (groupid == 0) {
                            groupName = vRoot.$t('monitor.defaultGroup');
                        } else {
                            for (var i = 0; i < groupslist.length; i++) {
                                var group = groupslist[i];
                                for (var j = 0; j < group.devices.length; j++) {
                                    var device = group.devices[j];
                                    if (device.deviceid === deviceid) {
                                        groupName = group.groupname.split('-')[1];
                                        break;
                                    }
                                    if (groupName != '') { break };
                                }
                            }
                        }
                        return h('span', {}, groupName)
                    }
                },
                {
                    title: vRoot.$t('user.devType'),
                    key: 'devicetype',
                    sortable: true,
                    width: 140,
                    render: function(h, params) {
                        var devicetype = params.row.devicetype;
                        var deviceTypes = vstore.state.deviceTypes;
                        var item = deviceTypes[devicetype];
                        return h('span', {}, item.typename);
                    }
                },
                {
                    title: vRoot.$t('reportForm.operationStatus'),
                    width: 85,
                    render: function(h, params) {
                        var status = vRoot.$t('monitor.offline');
                        var updatetime = params.row.updatetime;

                        if (updatetime > 0 && (Date.now() - updatetime) < 60 * 10 * 1000) {
                            status = vRoot.$t('monitor.online');
                        }
                        return h('span', {}, status)
                    }
                },
                {
                    title: vRoot.$t('reportForm.updateTime'),
                    width: 150,
                    render: function(h, params) {
                        var updatetime = params.row.updatetime;
                        var updatetimeStr = isZh ? '未上报' : 'null';
                        if (updatetime > 0) {
                            updatetimeStr = DateFormat.longToDateTimeStr(updatetime, timeDifference);
                        }
                        return h('span', {}, updatetimeStr)
                    }
                },
                {
                    title: vRoot.$t('reportForm.lastAddress'),
                    render: function(h, params) {
                        var callat = params.row.callat;
                        var callon = params.row.callon;
                        if (callat == 0 && callon == 0) {
                            return h('span', {}, vRoot.$t('reportForm.notLocated'))
                        } else {
                            return h('span', {}, vRoot.$t('reportForm.located'))
                        }

                    }
                },
                { title: vRoot.$t('reportForm.lastState'), key: 'strstatus', },
                {
                    title: vRoot.$t('customer.remark'),
                    key: 'remark',
                    render: function(h, params) {
                        var remark = params.row.remark;
                        return h('div', {
                            style: {
                                maxHeight: '40px',
                                overflow: 'hidden'
                            }
                        }, remark)
                    }
                },
            ],
            tableData: [],
            tableHeight: 300,
            loading: false,
            totalVehicle: 0,
            onlineVehicle: 0,
            offlineVehicle: 0,
            posiVehicle: 0, // 定位数量
            notPosiVehicle: 0, // 不定位数量
        },
        methods: {
            onClickQuery: function() {
                if (globalUserList.indexOf(this.createrToUser) == -1) {
                    this.$Message.error(this.$t("message.selectCorrectAccount"));
                    return;
                }
                this.totalVehicle = 0;
                this.onlineVehicle = 0;
                this.offlineVehicle = 0;
                this.posiVehicle = 0; // 定位数量
                this.notPosiVehicle = 0; // 不定位数量
                this.loading = true;
                var url = myUrls.reportOnlineSummary(),
                    me = this;
                utils.sendAjax(url, { username: this.createrToUser }, function(respData) {
                    me.loading = false;
                    if (respData.status === 0) {
                        if (respData.records == null) return;
                        me.tableData = respData.records;
                        me.totalVehicle = me.tableData.length;
                        me.tableData.forEach(function(item) {
                            var updatetime = item.updatetime;
                            var callat = item.callat;
                            var callon = item.callon;
                            if (updatetime > 0 && (Date.now() - updatetime) < 60 * 10 * 1000) {
                                me.onlineVehicle++;
                            } else {
                                me.offlineVehicle++;
                            }
                            if (callat == 0 && callon == 0) {
                                me.notPosiVehicle++;
                            } else {
                                me.posiVehicle++;
                            }
                        });
                    } else {
                        me.$Message.error('查询失败');
                    }
                });

            },
            calcTableHeight: function() {
                var wHeight = window.innerHeight;
                this.tableHeight = wHeight - 167;
            },
            queryUsersTree: function(callback) {
                var url = myUrls.queryUsersTree(),
                    me = this;
                utils.sendAjax(url, { username: userName }, function(respData) {
                    if (respData.status == 0) {
                        callback([me.castUsersTreeToDevicesTree(respData.rootuser)]);
                    } else {
                        me.$Message.error('查询失败')
                    }
                });
            },
            castUsersTreeToDevicesTree: function(devicesTreeRecord) {
                var me = this;
                var iViewTree = {
                    render: function(h, params) {
                        var username = params.data.title;
                        return h('span', {
                            on: {
                                'click': function() {
                                    me.createrToUser = username;
                                    me.sosoValue = username;
                                }
                            },
                            style: {
                                cursor: 'pointer',
                                color: (me.createrToUser == username) ? '#2D8CF0' : '#000'
                            }
                        }, [
                            h('span', [
                                h('Radio', {
                                    props: {
                                        value: username == me.createrToUser
                                    },
                                    style: {
                                        marginRight: '4px',
                                        marginLeft: '4px'
                                    }
                                }),
                                h('span', params.data.title)
                            ]),
                        ])
                    },
                    expand: true,
                };
                if (devicesTreeRecord != null) {
                    var username = devicesTreeRecord.user.username;
                    var subusers = devicesTreeRecord.subusers;
                    iViewTree.title = username;
                    if (username != null && subusers != null && subusers.length > 0) {
                        var subDevicesTreeRecord = this.doCastUsersTreeToDevicesTree(subusers);
                        iViewTree.children = subDevicesTreeRecord;

                    }
                    var totalCount = 0;
                    if (iViewTree.children) {
                        for (var i = 0; i < iViewTree.children.length; ++i) {
                            totalCount += iViewTree.children[i].totalCount;
                        }
                    }
                    iViewTree.title = username + "(" + totalCount + ")";
                }
                return iViewTree;
            },
            doCastUsersTreeToDevicesTree: function(usersTrees) {
                var devicesTreeRecord = [],
                    me = this;
                if (usersTrees != null && usersTrees.length > 0) {
                    for (var i = 0; i < usersTrees.length; ++i) {
                        var usersTree = usersTrees[i];
                        var username = usersTree.user.username;
                        var subusers = usersTree.subusers;
                        var currentsubDevicesTreeRecord = {
                            render: function(h, params) {
                                var username = params.data.title;
                                return h('span', {
                                    on: {
                                        'click': function() {
                                            me.createrToUser = username;
                                            me.sosoValue = username;
                                        }
                                    },
                                    style: {
                                        cursor: 'pointer',
                                        color: (me.createrToUser == username) ? '#2D8CF0' : '#000'
                                    }
                                }, [
                                    h('span', [
                                        h('Radio', {
                                            props: {
                                                value: username == me.createrToUser
                                            },
                                            style: {
                                                marginRight: '4px',
                                                marginLeft: '4px'
                                            }
                                        }),
                                        h('span', params.data.title)
                                    ]),
                                ])
                            },
                        };
                        if (username != null && subusers != null && subusers.length > 0) {
                            var subDevicesTreeRecord = this.doCastUsersTreeToDevicesTree(subusers);
                            currentsubDevicesTreeRecord.children = subDevicesTreeRecord;
                        }
                        var totalCount = 0;
                        if (currentsubDevicesTreeRecord.children) {
                            for (var j = 0; j < currentsubDevicesTreeRecord.children.length; ++j) {
                                totalCount += currentsubDevicesTreeRecord.children[j].totalCount;
                            }
                        }
                        currentsubDevicesTreeRecord.totalCount = totalCount;
                        currentsubDevicesTreeRecord.title = username + "(" + totalCount + ")";
                        devicesTreeRecord.push(currentsubDevicesTreeRecord);
                    }
                }
                return devicesTreeRecord;
            },
        },
        watch: {
            sosoValue: function(newVal) {
                this.createrToUser = newVal;
            }
        },
        mounted: function() {
            var me = this;
            this.calcTableHeight();
            this.sosoValue = userName;
            this.queryUsersTree(function(usersTree) {
                me.groupslist = usersTree;
                me.treeData = usersTree;
            });
            window.onresize = function() {
                me.calcTableHeight();
            }
        }
    })
}

// 掉线报表
function dropLineReport(groupslist) {
    vueInstanse = new Vue({
        i18n: utils.getI18n(),
        el: "#droplinereport",
        mixins: [treeMixin],
        data: {
            isSpin: false,
            loading: false,
            days: '1',
            groupslist: [],
            columns: [
                { title: vRoot.$t("reportForm.index"), key: 'index', width: 60 },
                { title: vRoot.$t("alarm.devNum"), key: 'deviceid', width: 120 },
                { title: vRoot.$t("alarm.devName"), key: 'devicename', width: 120 },
                { title: vRoot.$t('reportForm.offlineTime'), width: 150, key: 'updatetimeStr' },
                { title: vRoot.$t('reportForm.downOfflineDuration'), width: 180, key: 'downOfflineDuration' },
                { title: vRoot.$t("reportForm.drivername"), key: 'drivername', width: 120 },
                { title: vRoot.$t("customer.contactNumber"), key: 'driverphone', width: 120 },
                { title: 'SIM', key: 'simnum', width: 120 },
                { title: vRoot.$t("monitor.groupName"), key: 'groupName', width: 100 },
                { title: vRoot.$t("user.devType"), key: 'devicetype', width: 85 },
                { title: vRoot.$t("monitor.ownerInfo"), key: 'ownername', width: 100 },
                { title: vRoot.$t("device.contact1"), key: 'phonenum1', width: 120 },
                { title: vRoot.$t("device.contact2"), key: 'phonenum2', width: 120 },
                { title: vRoot.$t('reportForm.stralarm'), width: 200, key: 'stralarm' },
                { title: vRoot.$t('reportForm.strstatus'), width: 200, key: 'strstatus' },
                {
                    title: vRoot.$t("alarm.action"),
                    width: 120,
                    render: function(h, params) {
                        return h('Button', {
                            props: {
                                size: "small",
                            },
                            on: {
                                click: function() {
                                    utils.showWindowMap(vueInstanse, params);
                                }
                            },
                        }, isZh ? '查看地图' : 'See Map')
                    }
                },
            ],
            mapModal: false,
            tableData: [],
            tableHeight: 300,
        },
        methods: {
            exportData: function() {
                var tableData = deepClone(this.tableData);
                var columns = deepClone(this.columns);
                tableData.forEach(function(item) {
                    item.deviceid = "\t" + item.deviceid;
                    item.updatetimeStr = "\t" + item.updatetimeStr;
                    item.devicename = "\t" + item.devicename;
                    item.simnum = "\t" + item.simnum;
                });
                columns.pop();
                this.$refs.totalTable.exportCsv({
                    filename: isZh ? "离线报表" : "OfflineReport",
                    original: false,
                    columns: columns,
                    data: tableData
                });
            },
            initMap: function() {
                this.markerLayer = null;
                this.mapInstance = utils.initWindowMap('posi-map');
            },
            onClickQuery: function() {
                if (this.checkedDevice.length == 0) {
                    this.$Message.error(this.$t('reportForm.selectDevTip'));
                    return;
                }
                this.loading = true;
                var url = myUrls.reportOffline(),
                    me = this;
                var data = {
                    deviceids: [],
                    offlinehours: Number(this.days)
                }
                this.checkedDevice.forEach(function(group) {
                    if (!group.children) {
                        if (group.deviceid) {
                            data.deviceids.push(group.deviceid);
                        }

                    }
                });

                function getUpdatetimeStr(row) {
                    var updatetime = row.updatetime;
                    var updatetimeStr = isZh ? '未上报' : 'null';
                    if (updatetime > 0) {
                        updatetimeStr = DateFormat.longToDateTimeStr(updatetime, timeDifference);
                    }
                    return updatetimeStr;
                }

                utils.sendAjax(url, data, function(respData) {
                    me.loading = false;
                    if (respData.status == 0) {

                        respData.records.forEach(function(item, index) {

                            item.index = index + 1;
                            item.updatetimeStr = getUpdatetimeStr(item);
                            item.devicetype = vstore.state.deviceTypes[item.devicetype].typename;
                            item.downOfflineDuration = utils.timeStamp(Date.now() - item.updatetime);
                            item.groupName = me.getGroupName(groupslist, item);

                            var deviceex = item.deviceex;
                            if (deviceex) {
                                item.ownername = deviceex.ownername;
                                item.phonenum1 = deviceex.phonenum1;
                                item.phonenum2 = deviceex.phonenum2;
                                item.drivername = deviceex.drivername;
                                item.driverphone = deviceex.driverphone;
                            } else {
                                item.ownername = '';
                                item.phonenum1 = '';
                                item.phonenum2 = '';
                                item.drivername = '';
                                item.driverphone = '';
                            }

                            if (!isZh) {
                                item.stralarm = item.stralarmen;
                                item.strstatus = item.strstatusen;
                            }
                        });

                        me.tableData = respData.records;
                    } else {
                        me.$Message.error(me.$t('monitor.queryFail'));
                    }
                });
            },
            getGroupName: function(groupslist, row) {
                var groupid = row.groupid;
                var deviceid = row.deviceid;
                var groupName = '';
                if (groupid == 0) {
                    groupName = vRoot.$t("monitor.defaultGroup");
                } else {
                    for (var i = 0; i < groupslist.length; i++) {
                        var group = groupslist[i];
                        for (var j = 0; j < group.devices.length; j++) {
                            var device = group.devices[j];

                            if (device.deviceid === deviceid) {
                                if (group.groupname.indexOf('-') == -1) {
                                    groupName = group.groupname;
                                } else {
                                    groupName = group.groupname.split('-')[1];
                                }
                                break;
                            }
                            if (groupName != '') { break };
                        }
                    }
                }
                return groupName;
            },

            cleanSelected: function(treeDataFilter) {
                var that = this;
                for (var i = 0; i < treeDataFilter.length; i++) {
                    var item = treeDataFilter[i];
                    if (item != null) {
                        item.checked = false;
                        if (item.children && item.children.length > 0) {
                            that.cleanSelected(item.children);
                        }
                    }
                }
            },
            calcTableHeight: function() {
                var wHeight = window.innerHeight;
                this.tableHeight = wHeight - 125;
            },
            queryDevicesTree: function() {
                var me = this;
                this.isSpin = true;
                GlobalOrgan.getInstance().getGlobalOrganData(function(rootuser) {
                    me.isSpin = false;
                    me.initZTree(rootuser);
                })
            },
        },
        mounted: function() {
            var me = this;
            this.queryDevicesTree();
            this.initMap();
            window.onresize = function() {
                me.calcTableHeight();
            };
        },
        created: function() {
            this.checkedDevice = [];
        },
    })
}

// 每日在线率
function deviceOnlineDaily(groupslist) {

    vueInstanse = new Vue({
        el: "#deviceonlinedaily",
        i18n: utils.getI18n(),
        mixins: [treeMixin],
        data: {
            isSpin: false,
            groupslist: [],
            tableHeight: 300,
            loading: false,
            yearMonth: new Date(),
            daycount: 0,
            columns: [
                { type: 'index', width: 120 },
                { title: vRoot.$t("reportForm.ascriptionUser"), key: 'username' },
                { title: vRoot.$t('alarm.devNum'), key: 'deviceid' },
                { title: vRoot.$t('alarm.devName'), key: 'devicename' },
            ],
            tableData: [],
        },
        methods: {
            onClickQuery: function() {
                if (this.checkedDevice.length == 0) {
                    this.$Message.error(this.$t('reportForm.selectDevTip'));
                    return;
                }
                this.loading = true;
                var url = myUrls.reportDeviceOnlineDaily(),
                    me = this;
                var data = {
                    deviceids: [],
                    offset: timeDifference,
                    year: this.yearMonth.getFullYear(),
                    month: this.yearMonth.getMonth() + 1,
                }
                this.checkedDevice.forEach(function(group) {
                    if (!group.children) {
                        if (group.deviceid != null) {
                            data.deviceids.push(group.deviceid);
                        } else {
                            isNull = true;
                        }
                    }
                });
                if (data.deviceids.length === 0) {
                    this.$Message.error("选择组没有设备!");
                    return;
                }
                utils.sendAjax(url, data, function(respData) {
                    me.loading = false;
                    if (respData.status === 0) {
                        me.daycount = respData.daycount;
                        me.tableData = me.getTableData(respData.records);
                    }
                })
            },
            getTableData: function(records) {
                var tableData = [];
                records.forEach(function(item) {
                    var tableItem = {};
                    var onlineCount = 0;
                    tableItem.deviceid = item.deviceid;
                    item.daysstatus.forEach(function(item, idx) {
                        var isOnline = item == 0 ? false : true;
                        if (isOnline) {
                            onlineCount++;
                            tableItem[String(++idx)] = '1';
                        } else {
                            tableItem[String(++idx)] = '0';
                        }
                    })
                    var onlineRate = (onlineCount / item.daysstatus.length) * 100;
                    tableItem['onlineRate'] = onlineRate.toFixed(2) + '%';
                    tableData.push(tableItem);
                });
                return tableData;
            },

            cleanSelected: function(treeDataFilter) {
                var that = this;
                for (var i = 0; i < treeDataFilter.length; i++) {
                    var item = treeDataFilter[i];
                    if (item != null) {
                        item.checked = false;
                        if (item.children && item.children.length > 0) {
                            that.cleanSelected(item.children);
                        }
                    }
                }
            },
            calcTableHeight: function() {
                var wHeight = window.innerHeight;
                this.tableHeight = wHeight - 125;
            },
            queryDevicesTree: function() {
                var me = this;
                this.isSpin = true;
                GlobalOrgan.getInstance().getGlobalOrganData(function(rootuser) {
                    me.isSpin = false;
                    me.initZTree(rootuser);
                })
            },
        },
        watch: {
            daycount: function(newVla) {
                var columns = [
                    { type: 'index', width: 60, fixed: 'left' },
                    {
                        title: vRoot.$t("reportForm.ascriptionUser"),
                        key: 'username',
                        fixed: 'left',
                        width: 120,
                        render: function(h, parmas) {
                            var deviceid = parmas.row.deviceid;
                            var userName = "";
                            vueInstanse.checkedDevice.forEach(function(group) {
                                if (!group.children) {
                                    if (group.deviceid === deviceid) {
                                        userName = group.username;
                                    }
                                }
                            });
                            return h('span', {}, userName);
                        }
                    },
                    {
                        title: vRoot.$t("alarm.devName"),
                        key: 'devicename',
                        fixed: 'left',
                        width: 140,
                        render: function(h, params) {
                            var deviceid = params.row.deviceid;
                            for (var i = 0; i < groupslist.length; i++) {
                                var group = groupslist[i];
                                for (var j = 0; j < group.devices.length; j++) {
                                    var device = group.devices[j];
                                    if (device.deviceid == deviceid) {
                                        return h('span', {}, device.devicename);
                                    }
                                }
                            };
                            return h('span', {}, '');
                        }
                    },
                    { title: vRoot.$t("alarm.devNum"), key: 'deviceid', fixed: 'left', width: 140 },
                ]
                for (var i = 1; i <= newVla; i++) {
                    var key = String(i);
                    columns.push({
                        title: key,
                        key: key,
                        width: 60,
                    })
                }
                columns.push({
                    key: 'onlineRate',
                    title: vRoot.$t("reportForm.onlineRate"),
                    fixed: 'right',
                    sortable: true,
                    width: 120,
                });
                this.columns = columns;
            },
        },
        mounted: function() {
            var me = this;
            this.queryDevicesTree();
            window.onresize = function() {
                me.calcTableHeight();
            };
        },
        created: function() {
            this.checkedDevice = [];
        },
    })
}

// 车队日在线率
function groupsOnlineDaily(groupslist) {
    vueInstanse = new Vue({
        el: '#groupsonlinedaily',
        i18n: utils.getI18n(),
        mixins: [treeMixin],
        data: {
            isSpin: false,
            groupslist: [],
            tableHeight: 300,
            loading: false,
            yearMonth: new Date(),
            columns: [
                { type: 'index', width: 60 },
                { title: vRoot.$t("reportForm.ascriptionUser"), key: 'username' },
                { title: vRoot.$t("monitor.groupName"), key: 'groupname' },
                {
                    title: vRoot.$t("reportForm.onlinequantityAndTotalquantity"),
                    key: 'onlinecount',
                    render: function(h, params) {
                        var onlinecount = params.row.onlinecount;
                        var totalcount = params.row.totalcount;
                        return h('span', {}, onlinecount + "/" + totalcount);
                    }
                },
                {
                    title: vRoot.$t("reportForm.dailyOnlineRate"),
                    sortable: true,
                    render: function(h, params) {
                        var onlinecount = params.row.onlinecount;
                        var totalcount = params.row.totalcount;
                        var onlineRate = (onlinecount / totalcount) * 100;
                        if (totalcount == 0) {
                            return h('span', {}, "0.00%");
                        }
                        return h('span', {}, onlineRate.toFixed(2) + "%");
                    }
                },
            ],
            tableData: [],
        },
        methods: {
            onClickQuery: function() {
                if (this.checkedDevice.length == 0) {
                    this.$Message.error("请选择分组");
                    return;
                }
                this.loading = true;
                var url = myUrls.reportGroupOnlineDaily(),
                    me = this;
                var data = {
                    groups: [],
                    offset: timeDifference,
                    daystr: DateFormat.format(this.yearMonth, 'yyyy-MM-dd'),
                }

                this.checkedDevice.forEach(function(group) {
                    if (!group.children) {
                        data.groups.push({
                            username: group.username,
                            groupid: group.groupid,
                            groupname: group.groupname,
                        })
                    }
                });

                utils.sendAjax(url, data, function(respData) {
                    me.loading = false;
                    if (respData.status == 0) {
                        if (respData.records != null) {
                            me.tableData = respData.records;
                        }
                    }
                });
            },

            cleanSelected: function(treeDataFilter) {
                var that = this;
                for (var i = 0; i < treeDataFilter.length; i++) {
                    var item = treeDataFilter[i];
                    if (item != null) {
                        item.checked = false;
                        if (item.children && item.children.length > 0) {
                            that.cleanSelected(item.children);
                        }
                    }
                }
            },
            calcTableHeight: function() {
                var wHeight = window.innerHeight;
                this.tableHeight = wHeight - 125;
            },
            queryDevicesTree: function() {
                var me = this;
                this.isSpin = true;
                GlobalOrgan.getInstance().getGlobalOrganData(function(rootuser) {
                    me.isSpin = false;
                    me.initZTree(rootuser);
                })
            },
        },
        mounted: function() {
            var me = this;
            this.queryDevicesTree();
            window.onresize = function() {
                me.calcTableHeight();
            };
        },
        created: function() {
            this.checkedDevice = [];
        },
    })
}

// 车辆月在线
function deviceMonthOnlineDaily(groupslist) {
    vueInstanse = new Vue({
        el: "#devicemonthonlinedaily",
        i18n: utils.getI18n(),
        mixins: [treeMixin],
        data: {
            isSpin: false,
            modal: false,
            textTop: isZh ? ["日", "一", "二", "三", "四", "五", "六"] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            datesArr: [],
            year: 1970,
            month: 1,
            groupslist: [],
            tableHeight: 300,
            loading: false,
            yearMonth: new Date(),
            daycount: 0,
            columns: [
                { type: 'index', width: 60 },
                {
                    title: vRoot.$t("reportForm.ascriptionUser"),
                    key: 'username',
                    width: 130,
                    render: function(h, parmas) {
                        var deviceid = parmas.row.deviceid;
                        var userName = "";
                        vueInstanse.checkedDevice.forEach(function(group) {
                            if (!group.children) {
                                if (group.deviceid === deviceid) {
                                    userName = group.username;
                                }
                            }
                        });
                        return h('span', {}, userName);
                    }
                },
                { title: vRoot.$t("alarm.devNum"), key: 'deviceid' },
                {
                    title: vRoot.$t("alarm.devName"),
                    key: 'devicename',
                    render: function(h, params) {
                        var deviceid = params.row.deviceid;
                        for (var i = 0; i < groupslist.length; i++) {
                            var group = groupslist[i];
                            for (var j = 0; j < group.devices.length; j++) {
                                var device = group.devices[j];
                                if (device.deviceid == deviceid) {
                                    return h('span', {}, device.devicename);
                                }
                            }
                        };
                        return h('span', {}, '');
                    }
                },
                {
                    title: vRoot.$t("reportForm.onlineDaysAndTotalDays"),
                    render: function(h, params) {
                        var onlinecount = params.row.onlinecount;
                        return h('span', {}, onlinecount + "/" + params.row.daysstatus.length);
                    }
                },
                { title: vRoot.$t("reportForm.onlineRate"), key: 'onlineRate', sortable: true },
                {
                    title: vRoot.$t("reportForm.onlineDate"),
                    render: function(h, params) {
                        var onlineDate = vRoot.$t("reportForm.onlineDate");
                        var row = params.row;
                        return h(
                            'Button', {
                                on: {
                                    click: function() {
                                        vueInstanse.year = row.year;
                                        vueInstanse.month = row.month;
                                        vueInstanse.getDatesArr(row.daysstatus);
                                        vueInstanse.modal = true;
                                    }
                                }
                            },
                            onlineDate
                        );
                    }
                }
            ],
            tableData: [],
        },
        methods: {
            onClickQuery: function() {
                if (this.checkedDevice.length == 0) {
                    this.$Message.error(this.$t('reportForm.selectDevTip'));
                    return;
                }
                this.loading = true;
                var url = myUrls.reportDeviceOnlineMonth(),
                    me = this;
                var data = {
                    deviceids: [],
                    offset: timeDifference,
                    year: this.yearMonth.getFullYear(),
                    month: this.yearMonth.getMonth() + 1,
                }
                this.checkedDevice.forEach(function(group) {
                    if (!group.children) {
                        if (group.deviceid != null) {
                            data.deviceids.push(group.deviceid);
                        } else {
                            isNull = true;
                        }
                    }
                });
                if (data.deviceids.length === 0) {
                    this.$Message.error(this.$t('reportForm.selectDevTip'));
                    return;
                }
                utils.sendAjax(url, data, function(respData) {
                    me.loading = false;
                    console.log("respData", respData);
                    if (respData.status === 0) {
                        me.daycount = respData.daycount;
                        me.tableData = me.getTableData(respData.records, data.year, data.month);
                    }
                })
            },
            //得到这个月的第一天是是星期几
            getTheMonthFirstDayWeek: function() {
                return new Date(this.year, this.month - 1, 1).getDay();
            },
            // 得到这个月有多少天
            getTheMonthDays: function() {
                var year = this.month == 12 ? this.year + 1 : this.year;
                var month = this.month == 12 ? 1 : this.month;
                return new Date(new Date(year, month, 1) - 1).getDate();
            },
            // 得到上个月的最后一天
            getPrevMonthLastDate: function() {
                return new Date(new Date(this.year, this.month - 1, 1) - 1).getDate();
            },
            getDatesArr: function(daysstatus) {
                var datesArr = [];
                var weekNum = this.getTheMonthFirstDayWeek();
                var prevMonthDate = this.getPrevMonthLastDate();
                var theDates = this.getTheMonthDays();

                while (weekNum--) {
                    datesArr.unshift({ day: prevMonthDate--, isTheMonth: false });
                }
                var d = 1
                while (theDates--) {
                    var isActive = daysstatus[d - 1] === 1;
                    datesArr.push({ day: d, isTheMonth: true, isActive: isActive });
                    d++;
                }
                var count = 1;
                while (datesArr.length < 42) {
                    datesArr.push({ day: count++, isTheMonth: false });
                }
                this.datesArr = datesArr;
            },
            getTableData: function(records, year, month) {
                var tableData = [];
                records.forEach(function(item) {
                    var tableItem = {};
                    var onlineCount = 0;
                    tableItem.deviceid = item.deviceid;
                    item.daysstatus.forEach(function(item, idx) {
                        var isOnline = item == 0 ? false : true;
                        if (isOnline) {
                            onlineCount++;
                            tableItem[String(++idx)] = '1';
                        } else {
                            tableItem[String(++idx)] = '0';
                        }
                    })
                    var onlineRate = (onlineCount / item.daysstatus.length) * 100;
                    tableItem['onlinecount'] = onlineCount;
                    tableItem['onlineRate'] = onlineRate.toFixed(2) + '%';
                    tableItem.daysstatus = item.daysstatus;
                    tableItem.year = year;
                    tableItem.month = month;
                    tableData.push(tableItem);

                });
                return tableData;
            },

            cleanSelected: function(treeDataFilter) {
                var that = this;
                for (var i = 0; i < treeDataFilter.length; i++) {
                    var item = treeDataFilter[i];
                    if (item != null) {
                        item.checked = false;
                        if (item.children && item.children.length > 0) {
                            that.cleanSelected(item.children);
                        }
                    }
                }
            },
            calcTableHeight: function() {
                var wHeight = window.innerHeight;
                this.tableHeight = wHeight - 125;
            },
            queryDevicesTree: function() {
                var me = this;
                this.isSpin = true;
                GlobalOrgan.getInstance().getGlobalOrganData(function(rootuser) {
                    me.isSpin = false;
                    me.initZTree(rootuser);
                })
            },
        },
        mounted: function() {
            var me = this;
            this.queryDevicesTree();
            window.onresize = function() {
                me.calcTableHeight();
            };
        },
        created: function() {
            this.checkedDevice = [];
        },
    })
}

//新增车辆
function newEquipmentReport() {
    new Vue({
        el: "#new-equipment-report",
        i18n: utils.getI18n(),
        data: {
            loading: false,
            columns: [{
                key: 'index',
                title: '#',
                width: 80,
            }, {
                title: vRoot.$t("alarm.devName"),
                key: 'devicename',
            }, {
                title: vRoot.$t("alarm.devNum"),
                key: 'deviceid'
            }, {
                title: vRoot.$t("user.devType"),
                key: 'devtype'
            }, {
                title: vRoot.$t("bgMgr.addTime"),
                key: 'createtimestr'
            }, {
                title: vRoot.$t("bgMgr.creater"),
                key: 'creater',
            }],
            tableData: [],
            tableHeight: 300,
            days: '7',
            recordRankingArr: [],
            total: 0,
            currentIndex: 1,
        },
        watch: {
            days: function() {
                this.queryAddDevices();
            }
        },
        methods: {
            changePage: function(index) {
                var offset = index * 10;
                var start = (index - 1) * 10;
                this.currentPageIndex = index;
                this.tableData = this.allTableData.slice(start, offset);
            },
            calcTableHeight: function() {
                var wHeight = window.innerHeight;
                this.tableHeight = wHeight - 360;
            },
            setRecordRankingArr: function(recordRanking) {
                var recordRankingArr = [];
                for (var key in recordRanking) {
                    recordRankingArr.push({
                        creater: key,
                        count: recordRanking[key]
                    })
                }
                recordRankingArr.sort(function(a, b) {
                    return b.count - a.count;
                });
                if (recordRankingArr.length > 5) {
                    recordRankingArr.length = 5;
                }
                this.recordRankingArr = recordRankingArr;
            },
            queryAddDevices: function() {
                var me = this;
                var url = myUrls.queryAddDevices();
                var dates = this.getLatestDate();
                var data = {
                    offset: timeDifference,
                    days: Number(this.days),
                };
                this.loading = true;
                this.allTableData = [];
                this.tableData = [];
                this.recordRankingArr = [];
                this.currentIndex = 1;
                this.total = 0;
                utils.sendAjax(url, data, function(respData) {
                    me.loading = false;
                    var devices = respData.devices;
                    var seriesData = [];
                    var tableData = [];
                    var recordRanking = {};
                    if (respData.status === 0 && devices.length) {
                        devices.forEach(function(dev, idx) {
                            var creater = dev.creater;
                            if (recordRanking[creater]) {
                                recordRanking[creater] = recordRanking[creater] + 1;
                            } else {
                                recordRanking[creater] = 1;
                            }
                            tableData.push({
                                devtype: me.getDevType(dev.devicetype),
                                createtimestr: DateFormat.longToDateTimeStr(dev.createtime, timeDifference),
                                devicename: dev.devicename,
                                deviceid: dev.deviceid,
                                creater: creater,
                                createtime: dev.createtime,
                            })
                        });
                        tableData.sort(function(a, b) {
                            return b.createtime - a.createtime;
                        });
                        tableData.forEach(function(item, idx) {
                            item.index = idx + 1;
                        });
                        me.total = tableData.length;
                        me.allTableData = tableData;
                        if (me.total > 10) {
                            me.tableData = tableData.slice(0, 10);
                        } else {
                            me.tableData = tableData;
                        }
                        me.setRecordRankingArr(recordRanking);
                        dates.forEach(function(date) {
                            var count = 0;
                            devices.forEach(function(dev) {
                                var dateStr = DateFormat.longToDateStr(dev.createtime, timeDifference);
                                if (date == dateStr) {
                                    count++;
                                }
                            })
                            seriesData.push(count);
                        });
                        me.charts.setOption(me.getChartsOption(dates, seriesData));
                    }
                }, function() {
                    me.loading = false;
                });
            },
            getDevType: function(devicetype) {
                var devType = "";
                var item = vstore.state.deviceTypes[devicetype];
                var label = item.typename;
                if (item.remark) {
                    label += "(" + item.remark + ")";
                }
                devType = label;
                return devType;
            },
            initCharts: function() {
                this.charts = echarts.init(document.getElementById('charts'));
                this.charts.setOption(this.getChartsOption(this.getLatestDate(), []));
            },
            getChartsOption: function(dates, seriesData) {
                return {
                    title: {
                        text: ""
                    },
                    tooltip: {
                        trigger: 'axis'
                    },
                    // legend: {
                    //     data: ['新增设备']
                    // },
                    grid: {
                        top: '8%',
                        left: '4%',
                        right: '4%',
                        bottom: '4%',
                        containLabel: true
                    },
                    toolbox: {
                        feature: {
                            saveAsImage: {}
                        }
                    },
                    xAxis: {
                        type: 'category',
                        boundaryGap: false,
                        data: dates
                    },
                    yAxis: {
                        type: 'value'
                    },
                    series: [{
                        name: '新增设备',
                        type: 'line',
                        stack: '总量',
                        data: seriesData,
                        smooth: true,
                    }]
                };
            },
            getLatestDate: function() {
                var days = Number(this.days);
                var dates = [];
                var firstDate = DateFormat.format(new Date(Date.now() - (days - 1) * 24 * 3600 * 1000), 'yyyy-MM-dd');
                for (var i = 0; i < days; i++) {
                    var date = DateFormat.addDay(new Date(firstDate), i);
                    var dateStr = DateFormat.format(date, 'yyyy-MM-dd');
                    dates.push(dateStr);
                }
                return dates;
            },
        },
        mounted: function() {
            var me = this;
            this.allTableData = [];
            this.initCharts();
            this.queryAddDevices();
            this.calcTableHeight();
            window.onresize = function() {
                me.calcTableHeight();
                me.charts.resize();
            }
        }
    })
}

function deviceTypeDistribution(groupslist) {
    new Vue({
        el: "#distribution",
        methods: {
            getChartsOption: function(data) {
                var option = {
                    title: {
                        text: vRoot.$t("reportForm.deviceTypeDistribution"),
                        bottom: 'auto'
                    },
                    tooltip: {
                        trigger: 'item',
                        formatter: function(name) {
                            return name.data.name + '<br/>' + name.data.value + '<br/>' + name.data.remark;
                        }
                    },
                    legend: {
                        type: 'scroll',
                        orient: 'vertical',
                        right: 10,
                        top: 20,
                        bottom: 20,
                        data: data.legendData,
                        // orient: 'vertical',
                        // left: 'right',
                    },
                    grid: {
                        top: 5,
                        left: 5,
                        right: 5,
                        bottom: 5,
                    },
                    series: [{
                        type: 'pie',
                        radius: '70%',
                        data: data.seriesData,
                        emphasis: {
                            itemStyle: {
                                shadowBlur: 10,
                                shadowOffsetX: 0,
                                shadowColor: 'rgba(0, 0, 0, 0.5)'
                            }
                        }
                    }]
                };
                return option
            },
            getSeriesData: function() {
                var totalDeviceCountObj = {};
                groupslist.forEach(function(group) {
                    group.devices.forEach(function(device) {
                        var devicetype = device.devicetype;
                        if (totalDeviceCountObj[devicetype]) {
                            totalDeviceCountObj[devicetype] += 1;
                        } else {
                            totalDeviceCountObj[devicetype] = 1;
                        }
                    });
                });

                var seriesData = [];
                var legendData = [];

                for (var key in totalDeviceCountObj) {
                    var nameObj = this.getDevType(key);
                    seriesData.push({
                        value: totalDeviceCountObj[key],
                        name: nameObj.name,
                        remark: nameObj.remark
                    })
                }

                seriesData.sort(function(a, b) {
                    return b.value - a.value;
                })

                seriesData.forEach(function(series) {
                    legendData.push(series.name);
                });



                return {
                    seriesData: seriesData,
                    legendData: legendData,
                };
            },
            getDevType: function(devicetype) {
                var item = vstore.state.deviceTypes[devicetype];
                var typename = item.typename;
                var remark = "";
                if (item.remark) {
                    remark = item.remark;
                }

                return {
                    name: typename,
                    remark: remark,
                };
            },
            initCharts: function() {
                this.charts = echarts.init(document.getElementById('distribution'));
                this.charts.setOption(this.getChartsOption(this.getSeriesData()));
            },
        },
        mounted: function() {
            var me = this;
            this.initCharts();
            window.onresize = function() {
                me.charts.resize();
            }
        },
    })
}


function onlineStatisticsDay() {
    new Vue({
        el: "#online-statistics-day",
        data: {
            isSpin: false,
        },
        methods: {
            queryOnlineStatisticsDay: function() {
                var me = this;
                var url = myUrls.queryOnlineStatisticsDay();
                var data = {};
                me.isSpin = true;
                utils.sendAjax(url, data, function(respData) {
                    me.isSpin = false;
                    if (respData.status == 0) {
                        me.initCharts(respData.records);
                    } else {
                        me.initCharts([]);
                    }
                }, function() {
                    me.initCharts([]);
                    me.isSpin = false;
                    me.$Message.error(vRoot.$t("monitor.queryFail"));
                })
            },
            getChartsOption: function(dates, seriesData) {
                return {
                    title: {
                        text: vRoot.$t("reportForm.onlineStatisticsDay")
                    },
                    tooltip: {
                        trigger: 'axis'
                    },
                    // legend: {
                    //     data: ['新增设备']
                    // },
                    grid: {
                        top: '8%',
                        left: '4%',
                        right: '4%',
                        bottom: '4%',
                        containLabel: true
                    },
                    toolbox: {
                        feature: {
                            saveAsImage: {}
                        }
                    },
                    xAxis: {
                        type: 'category',
                        boundaryGap: false,
                        data: dates
                    },
                    yAxis: {
                        type: 'value',
                        min: "dataMin"
                    },
                    series: [{
                        name: '上线设备',
                        type: 'line',
                        stack: '总量',
                        data: seriesData,
                        smooth: true,

                    }]
                };
            },
            initCharts: function(records) {
                var me = this;
                var datas = [];
                var seriesData = [];

                records.forEach(function(record) {
                    datas.push(record.statisticsday);
                    seriesData.push(record.count);
                });

                this.charts = echarts.init(document.getElementById('statistics-charts'));
                this.charts.setOption(this.getChartsOption(datas, seriesData));

                window.onresize = function() {
                    me.charts.resize();
                }
            }
        },
        mounted: function() {

            this.queryOnlineStatisticsDay();
        },
    })
}

function timeWeightConsumption(groupslist) {
    vueInstanse = new Vue({
        el: "#time-weight-consumption",
        i18n: utils.getI18n(),
        data: {
            loading: false,
            groupslist: [],
            columns: [
                { title: vRoot.$t('reportForm.index'), type: 'index', width: 70 },
                { title: vRoot.$t('alarm.devName'), key: 'devicename', width: 100 },
                { title: vRoot.$t('reportForm.date'), key: 'updatetimeStr', sortable: true, width: 160 },
                { title: vRoot.$t('reportForm.totalMileage') + '(km)', key: 'totaldistance', width: 150 },
                { title: vRoot.$t('reportForm.weight') + '(Kg)', key: 'weight', width: 100 },
                { title: vRoot.$t('reportForm.speed'), key: 'speed', width: 80 },
                { title: vRoot.$t('reportForm.status'), key: 'strstatus' },
                { title: vRoot.$t('reportForm.loadstatus'), key: 'loadstatusStr' },
                {
                    title: vRoot.$t('reportForm.lon') + ',' + vRoot.$t('reportForm.lat'),
                    render: function(h, params) {
                        var row = params.row;
                        var callat = row.callat.toFixed(5);
                        var callon = row.callon.toFixed(5);

                        if (callat && callon) {
                            if (row.address == null) {

                                return h('Button', {
                                    props: {
                                        type: 'error',
                                        size: 'small'
                                    },
                                    on: {
                                        click: function() {
                                            utils.getJiuHuAddressSyn(callon, callat, function(resp) {
                                                if (resp && resp.address) {
                                                    vueInstanse.records[params.index].address = resp.address;
                                                    LocalCacheMgr.setAddress(callon, callat, resp.address);
                                                }
                                            })
                                        }
                                    }
                                }, callon + "," + callat)

                            } else {
                                return h('Tooltip', {
                                    props: {
                                        content: row.address,
                                        placement: "top-start",
                                        maxWidth: 200
                                    },
                                }, [
                                    h('Button', {
                                        props: {
                                            type: 'primary',
                                            size: 'small'
                                        }
                                    }, callon + "," + callat)
                                ]);
                            }
                        } else {
                            return h('span', {}, '');
                        }
                    },
                },
            ],
            tableData: [],
            recvtime: [],
            weights: [],
            veo: [],
            distance: [],
            loadstatuss: [],
            currentIndex: 1,
        },
        mixins: [reportMixin],
        methods: {
            changePage: function(index) {
                var offset = index * 20;
                var start = (index - 1) * 20;
                this.currentPageIndex = index;
                this.tableData = this.records.slice(start, offset);
            },
            charts: function() {
                var speed = vRoot.$t('reportForm.speed');
                var dis = vRoot.$t('reportForm.mileage');
                var time = vRoot.$t('reportForm.time');
                var weight = vRoot.$t('reportForm.weight');
                var status = vRoot.$t('reportForm.status');
                var option = {
                    title: {
                        text: time + '/' + weight,
                        x: 'center',
                        textStyle: {
                            fontSize: 12,
                            fontWeight: 'bolder',
                            color: '#333'
                        }
                    },
                    grid: {
                        x: 50,
                        y: 40,
                        x2: 50,
                        y2: 40
                    },
                    tooltip: {
                        trigger: 'axis',
                        formatter: function(v) {
                            var data = time + ' : ' + v[0].name + '<br/>';
                            for (i in v) {
                                if (v[i].seriesName && v[i].seriesName != time) {
                                    if (v[i].seriesName == weight) {
                                        data += v[i].seriesName + ' : ' + v[i].value + 'Kg<br/>';
                                    } else if (v[i].seriesName == dis) {
                                        data += v[i].seriesName + ' : ' + v[i].value + 'Km<br/>';
                                    } else if (v[i].seriesName == speed) {
                                        data += v[i].seriesName + ' : ' + v[i].value + 'Km/h<br/>';
                                    } else {
                                        data += v[i].seriesName + ' : ' + v[i].value + '<br/>';
                                    }
                                }
                            }
                            return data;
                        }
                    },
                    legend: {
                        data: [speed, dis, weight],
                        x: 'left'
                    },
                    toolbox: {
                        show: true,
                        feature: {
                            magicType: { show: true, type: ['line', 'bar'] },
                            restore: { show: true },
                            saveAsImage: {
                                show: true
                            }
                        },
                        itemSize: 14
                    },
                    dataZoom: [{
                        show: true,
                        realtime: true,
                        start: 0,
                        end: 100,
                        height: 20,
                        backgroundColor: '#EDEDED',
                        fillerColor: 'rgb(54, 72, 96,0.5)',
                        //fillerColor:'rgb(244,129,38,0.8)',
                        bottom: 0
                    }, {
                        type: "inside",
                        realtime: true,
                        start: 0,
                        end: 100,
                        height: 20,
                        bottom: 0
                    }],
                    xAxis: [{
                        type: 'category',
                        boundaryGap: false,
                        axisLine: {
                            onZero: false
                        },
                        data: this.recvtime
                    }],
                    yAxis: [{
                        name: weight + '/' + speed,
                        type: 'value',
                        nameTextStyle: 10,
                        nameGap: 5,

                    }, {
                        name: dis,
                        type: 'value',
                        nameTextStyle: 10,
                        nameGap: 2,
                        min: this.disMin,
                        axisLabel: {
                            formatter: '{value} km',
                        },
                        axisTick: {
                            show: false
                        }
                    }],
                    series: [{
                            name: time,
                            type: 'line',
                            symbol: 'none',
                            yAxisIndex: 1,
                            color: '#F0805A',
                            smooth: true,
                            data: this.recvtime
                        }, {
                            name: speed,
                            type: 'line',
                            symbol: 'none',
                            yAxisIndex: 0,
                            smooth: true,
                            color: '#4876FF',
                            data: this.veo
                        }, {
                            name: dis,
                            type: 'line',
                            symbol: 'none',
                            yAxisIndex: 1,
                            color: '#3CB371',
                            smooth: true,
                            data: this.distance
                        }, {
                            smooth: true,
                            name: weight,
                            type: 'line',
                            symbol: 'none',
                            color: '#C1232B',
                            data: this.weights
                        },
                        {
                            smooth: true,
                            name: status,
                            type: 'line',
                            symbol: 'none',
                            color: '#000',
                            data: this.devStates
                        },
                        {
                            smooth: true,
                            name: vRoot.$t('reportForm.loadstatus'),
                            type: 'line',
                            symbol: 'none',
                            data: this.loadstatuss
                        },
                    ]
                };

                this.chartsIns.setOption(option);
            },
            calcTableHeight: function() {
                var wHeight = window.innerHeight;
                this.lastTableHeight = wHeight - 400;
            },
            onClickQuery: function() {
                if (this.queryDeviceId == "") { return };
                var self = this;
                if (this.isSelectAll === null) {
                    this.$Message.error(this.$t("reportForm.selectDevTip"));
                    return;
                };
                var data = {
                    // username: vstore.state.userName,
                    startday: this.dateVal[0],
                    endday: this.dateVal[1],
                    offset: timeDifference,
                    devices: [this.queryDeviceId],
                };
                this.loading = true;
                utils.sendAjax(myUrls.reportWeightTime(), data, function(resp) {
                    self.loading = false;
                    if (resp.status == 0) {
                        if (resp.records) {
                            var records = [],
                                weights = [],
                                veo = [],
                                distance = [],
                                recvtime = [],
                                loadstatuss = [],
                                devStates = [];
                            var fisstDistance = 0;
                            resp.records.forEach(function(item, index) {
                                records = item.records;
                                var independent = item.independent === 0;
                                records.forEach(function(record, index) {
                                    if (index == 0) {
                                        fisstDistance = record.totaldistance;
                                    }

                                    var callon = record.callon.toFixed(5);
                                    var callat = record.callat.toFixed(5);
                                    var address = LocalCacheMgr.getAddress(callon, callat);
                                    if (address != null) {
                                        record.address = address;
                                    } else {
                                        record.address = null;

                                    }
                                    var ad0 = record.ad0;
                                    var ad1 = record.ad1;
                                    if (ad0 < 0) {
                                        ad0 = 0;
                                    };
                                    if (ad1 < 0) {
                                        ad1 = 0;
                                    };
                                    record.ad0 = ad0 / 100;
                                    record.ad1 = ad1 / 100;
                                    if (independent) {
                                        record.oil = record.ad0 + record.ad1;
                                    } else {
                                        record.oil = record.ad0;
                                    }
                                    record.loadstatusStr = utils.getloadstatusStr(record.loadstatus);
                                    loadstatuss.push(record.loadstatusStr);
                                    record.weight = (record.weight / 10);
                                    record.updatetimeStr = DateFormat.longToDateTimeStr(record.updatetime, timeDifference);
                                    record.devicename = vstore.state.deviceInfos[self.queryDeviceId].devicename;
                                    weights.push(record.weight);
                                    veo.push((record.speed / 1000).toFixed(2));
                                    record.totaldistance = ((record.totaldistance - fisstDistance) / 1000).toFixed(2);
                                    distance.push(record.totaldistance);
                                    recvtime.push(record.updatetimeStr);
                                    devStates.push(record.strstatus);
                                });
                            });

                            self.veo = veo;
                            self.weights = weights;
                            self.distance = distance;
                            self.recvtime = recvtime;
                            self.records = records;
                            self.devStates = devStates;
                            self.loadstatuss = loadstatuss;
                            self.total = records.length;
                            records.sort(function(a, b) {
                                return b.updatetime - a.updatetime;
                            })
                            self.currentPageIndex = 1;
                            self.tableData = records.slice(0, 20);
                            self.charts();
                        } else {
                            self.$Message.error(self.$t("reportForm.noRecord"));
                        }
                    } else {
                        self.$Message.error(resp.cause);
                    }
                })
            },
            onSortChange: function(column) {

            }
        },
        mounted: function() {
            this.groupslist = groupslist;
            this.myChart = null;
            this.records = [];
            this.disMin = 0;
            this.chartsIns = echarts.init(document.getElementById('charts'));
            this.charts();
        }
    });
}


function weightSummary(groupslist) {
    vueInstanse = new Vue({
        el: "#weight-summary",
        i18n: utils.getI18n(),
        data: {
            isSpin: false,
            loading: false,
            groupslist: [],
            columns: [
                { title: vRoot.$t('reportForm.index'), type: 'index', width: 70 },
                { title: vRoot.$t('alarm.devName'), key: 'devicename' },
                { title: vRoot.$t('reportForm.date'), key: 'statisticsday', sortable: true },
                { title: isZh ? '空车时长' : 'Empty Duration', key: 'emptyDurationTime' },
                { title: isZh ? '空车里程' : 'Empty Mileage', key: 'emptyDurationDist' },
                { title: isZh ? '半载时长' : 'Half Load Duration', key: 'halfLoadDurationTime' },
                { title: isZh ? '半载里程' : 'Half Load Mileage', key: 'halfLoadDurationDist' },
                { title: isZh ? '超载时长' : 'Overload Duration', key: 'overDurationTime' },
                { title: isZh ? '超载里程' : 'Overload Mileage', key: 'overDurationDist' },
                { title: isZh ? '满载时长' : 'Full Load Duration', key: 'fullDurationTime' },
                { title: isZh ? '满载里程' : 'Full Load Mileage', key: 'fullDurationDist' },
                { title: isZh ? '装载时长' : 'Loading Duration', key: 'loadingDurationTime' },
                { title: isZh ? '装载里程' : 'Loading Mileage', key: 'loadingDurationDist' },
                { title: isZh ? '卸载时长' : 'Unloading Duration', key: 'unloadDurationTime' },
                { title: isZh ? '卸载里程' : 'Unloading Mileage', key: 'unloadDurationDist' },
            ],
            tableData: [],
            seriesData: [],

            activeTab: 'tabTotal',
            allWeightColumns: [
                { title: vRoot.$t('reportForm.index'), key: 'index', width: 70 },
                {
                    title: vRoot.$t("alarm.action"),
                    width: 100,
                    render: function(h, params) {
                        return h('span', {
                            on: {
                                click: function(e) {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    vueInstanse.activeTab = "tabDetail";
                                    vueInstanse.getDetailTableData(params.row.deviceid, params.row.dailyrecords);
                                }
                            },
                            style: {
                                color: '#e4393c',
                                cursor: 'pointer'
                            }
                        }, isZh ? "[ 明细 ]" : "[ Details ]")
                    }
                },
                { title: vRoot.$t('alarm.devName'), key: 'devicename' },
                // { title: '空车时长', key: 'emptyDurationTime' },
                // { title: '空车里程', key: 'emptyDurationDist' },
                // { title: '半载时长', key: 'halfLoadDurationTime' },
                // { title: '半载里程', key: 'halfLoadDurationDist' },
                // { title: '超载时长', key: 'overDurationTime' },
                // { title: '超载里程', key: 'overDurationDist' },
                // { title: '满载时长', key: 'fullDurationTime' },
                // { title: '满载里程', key: 'fullDurationDist' },
                // { title: '装载时长', key: 'loadingDurationTime' },
                // { title: '装载里程', key: 'loadingDurationDist' },
                // { title: '卸载时长', key: 'unloadDurationTime' },
                // { title: '卸载里程', key: 'unloadDurationDist' },

                { title: isZh ? '空车时长' : 'Empty Duration', key: 'emptyDurationTime' },
                { title: isZh ? '空车里程' : 'Empty Mileage', key: 'emptyDurationDist' },
                { title: isZh ? '半载时长' : 'Half Load Duration', key: 'halfLoadDurationTime' },
                { title: isZh ? '半载里程' : 'Half Load Mileage', key: 'halfLoadDurationDist' },
                { title: isZh ? '超载时长' : 'Overload Duration', key: 'overDurationTime' },
                { title: isZh ? '超载里程' : 'Overload Mileage', key: 'overDurationDist' },
                { title: isZh ? '满载时长' : 'Full Load Duration', key: 'fullDurationTime' },
                { title: isZh ? '满载里程' : 'Full Load Mileage', key: 'fullDurationDist' },
                { title: isZh ? '装载时长' : 'Loading Duration', key: 'loadingDurationTime' },
                { title: isZh ? '装载里程' : 'Loading Mileage', key: 'loadingDurationDist' },
                { title: isZh ? '卸载时长' : 'Unloading Duration', key: 'unloadDurationTime' },
                { title: isZh ? '卸载里程' : 'Unloading Mileage', key: 'unloadDurationDist' },
                //载重状态 0x00：空车；0x01：半载；0x02：超载；0x03：满载 0x04 装载 0x05 卸载
            ],
            allWeightTableData: [],
        },
        mixins: [treeMixin],
        methods: {
            getDetailTableData: function(deviceid, records) {
                var tableData = [];
                records.forEach(function(dayItem) {
                    var item = { deviceid: deviceid };
                    item.statisticsday = dayItem.statisticsday;
                    item.devicename = vstore.state.deviceInfos[deviceid].devicename;
                    dayItem.records.forEach(function(totalRecord) {
                        switch (totalRecord.loadstatus) {
                            case 0:
                                item.emptyDurationTime = utils.timeStampNoSecond(totalRecord.durationtime);
                                item.emptyDurationDist = totalRecord.durationdistance;
                                item.durationtime0 = totalRecord.durationtime / 1000 / 60;
                                break;
                            case 1:
                                item.halfLoadDurationTime = utils.timeStampNoSecond(totalRecord.durationtime);
                                item.halfLoadDurationDist = totalRecord.durationdistance;
                                item.durationtime1 = totalRecord.durationtime / 1000 / 60;
                                break;
                            case 2:
                                item.overDurationTime = utils.timeStampNoSecond(totalRecord.durationtime);
                                item.overDurationDist = totalRecord.durationdistance;
                                item.durationtime2 = totalRecord.durationtime / 1000 / 60;
                                break;
                            case 3:
                                item.fullDurationTime = utils.timeStampNoSecond(totalRecord.durationtime);
                                item.fullDurationDist = totalRecord.durationdistance;
                                item.durationtime3 = totalRecord.durationtime / 1000 / 60;
                                break;
                            case 4:
                                item.loadingDurationTime = utils.timeStampNoSecond(totalRecord.durationtime);
                                item.loadingDurationDist = totalRecord.durationdistance;
                                item.durationtime4 = totalRecord.durationtime / 1000 / 60;
                                break;
                            case 5:
                                item.unloadDurationTime = utils.timeStampNoSecond(totalRecord.durationtime);
                                item.unloadDurationDist = totalRecord.durationdistance;
                                item.durationtime5 = totalRecord.durationtime / 1000 / 60;
                                break;
                        }
                    });
                    tableData.push(item);
                });
                this.tableData = tableData;
            },
            onClickTab: function(name) {
                this.activeTab = name;
            },
            onCurrentChange: function(current) {
                var seriesData = [];
                var titleText = '';
                if (current.statisticsday) {
                    titleText = (isZh ? '载重时长-' : 'Loading Duration-') + current.deviceid + '-' + current.statisticsday;
                } else {
                    titleText = (isZh ? '载重时长-' : 'Loading Duration-') + current.deviceid;
                }
                for (var i = 0; i < 6; i++) {
                    var title = utils.getloadstatusStr(i) + (isZh ? '时长' : 'Duration');
                    seriesData.push({
                        value: current['durationtime' + i],
                        name: title
                    });
                }
                this.seriesData = seriesData;
                this.charts(titleText);
            },
            charts: function(title) {
                var option = {
                    title: {
                        text: title,
                        bottom: 'auto'
                    },
                    tooltip: {
                        trigger: 'item'
                    },
                    legend: {
                        orient: 'vertical',
                        left: 'right',
                    },
                    // grid: {
                    //     top: 5,
                    //     left: 20,
                    //     right: 5,
                    //     bottom: 5,
                    // },
                    series: [{
                        type: 'pie',
                        radius: '70%',
                        data: this.seriesData,
                        emphasis: {
                            itemStyle: {
                                shadowBlur: 10,
                                shadowOffsetX: 0,
                                shadowColor: 'rgba(0, 0, 0, 0.5)'
                            }
                        }
                    }]
                };;
                this.chartsIns.setOption(option);
            },

            calcTableHeight: function() {
                var wHeight = window.innerHeight;
                this.lastTableHeight = wHeight - 570;
            },
            onClickQuery: function() {
                var deviceids = [];
                this.checkedDevice.forEach(function(group) {
                    if (!group.children) {
                        if (group.deviceid != null) {
                            deviceids.push(group.deviceid);
                        }
                    }
                });

                if (deviceids.length) {
                    var self = this;
                    var data = {
                        // username: vstore.state.userName,
                        startday: this.dateVal[0],
                        endday: this.dateVal[1],
                        offset: timeDifference,
                        devices: deviceids,
                    };
                    this.loading = true;
                    this.activeTab = 'tabTotal';
                    utils.sendAjax(myUrls.reportWeightSummary(), data, function(resp) {
                        self.loading = false;
                        console.log('resp', resp);
                        if (resp.status == 0) {
                            if (resp.records) {
                                var tableData = [];

                                resp.records.forEach(function(deyItem, index) {
                                    var totalObj = {
                                        index: index + 1,
                                        deviceid: deyItem.deviceid,
                                        devicename: vstore.state.deviceInfos[deyItem.deviceid].devicename,
                                        dailyrecords: deyItem.dailyrecords,
                                    }
                                    deyItem.totalrecords.forEach(function(totalRecord) {
                                        switch (totalRecord.loadstatus) {
                                            case 0:
                                                totalObj.emptyDurationTime = utils.timeStampNoSecond(totalRecord.durationtime);
                                                totalObj.emptyDurationDist = totalRecord.durationdistance;
                                                totalObj.durationtime0 = totalRecord.durationtime / 1000 / 60;
                                                break;
                                            case 1:
                                                totalObj.halfLoadDurationTime = utils.timeStampNoSecond(totalRecord.durationtime);
                                                totalObj.halfLoadDurationDist = totalRecord.durationdistance;
                                                totalObj.durationtime1 = totalRecord.durationtime / 1000 / 60;
                                                break;
                                            case 2:
                                                totalObj.overDurationTime = utils.timeStampNoSecond(totalRecord.durationtime);
                                                totalObj.overDurationDist = totalRecord.durationdistance;
                                                totalObj.durationtime2 = totalRecord.durationtime / 1000 / 60;
                                                break;
                                            case 3:
                                                totalObj.fullDurationTime = utils.timeStampNoSecond(totalRecord.durationtime);
                                                totalObj.fullDurationDist = totalRecord.durationdistance;
                                                totalObj.durationtime3 = totalRecord.durationtime / 1000 / 60;
                                                break;
                                            case 4:
                                                totalObj.loadingDurationTime = utils.timeStampNoSecond(totalRecord.durationtime);
                                                totalObj.loadingDurationDist = totalRecord.durationdistance;
                                                totalObj.durationtime4 = totalRecord.durationtime / 1000 / 60;
                                                break;
                                            case 5:
                                                totalObj.unloadDurationTime = utils.timeStampNoSecond(totalRecord.durationtime);
                                                totalObj.unloadDurationDist = totalRecord.durationdistance;
                                                totalObj.durationtime5 = totalRecord.durationtime / 1000 / 60;
                                                break;
                                        }
                                    });

                                    tableData.push(totalObj);

                                });

                                self.allWeightTableData = tableData;
                                setTimeout(function name() {
                                    self.$refs.totalTable.$refs.tbody.clickCurrentRow(0);
                                }, 800);

                            } else {
                                self.$Message.error(self.$t("reportForm.noRecord"));
                            }
                        } else {
                            self.$Message.error(resp.cause);
                        }
                    })
                } else {
                    this.$Message.error(this.$t("reportForm.selectDevTip"));
                }

            },
            queryDevicesTree: function() {
                var me = this;
                this.isSpin = true;
                GlobalOrgan.getInstance().getGlobalOrganData(function(rootuser) {
                    me.isSpin = false;
                    me.initZTree(rootuser);
                })
            },
            onSortChange: function(column) {

            }
        },
        mounted: function() {
            this.myChart = null;
            this.records = [];
            this.chartsIns = echarts.init(document.getElementById('charts'));
            this.charts("载重时长");
            this.queryDevicesTree();
        }
    });
}

function timeOilConsumption(groupslist) {
    vueInstanse = new Vue({
        el: "#time-oil-consumption",
        i18n: utils.getI18n(),
        data: {
            loading: false,
            groupslist: [],
            isShowCard: false,
            contentString: "",
            columns: [
                { title: vRoot.$t('reportForm.index'), key: 'index', width: 70 },
                { title: vRoot.$t('alarm.devName'), key: 'devicename', width: 160 },
                { title: vRoot.$t('reportForm.date'), key: 'updatetimeStr', sortable: true, width: 160 },
                { title: vRoot.$t('reportForm.totalMileage') + '(km)', key: 'totaldistance', width: 100 },
                { title: vRoot.$t('reportForm.totalOil'), key: 'totalad', width: 100 },
                { title: vRoot.$t('reportForm.speed'), key: 'speed', width: 80 },
                { title: vRoot.$t('reportForm.reissue'), key: 'reissue', width: 80 },
                { title: vRoot.$t('reportForm.status'), key: 'strstatus', },
                {
                    title: vRoot.$t('reportForm.lon') + ',' + vRoot.$t('reportForm.lat'),
                    width: 210,
                    render: function(h, params) {
                        var row = params.row;
                        var callat = row.callat.toFixed(5);
                        var callon = row.callon.toFixed(5);

                        if (callat && callon) {
                            if (row.address == null) {

                                return h('Button', {
                                    props: {
                                        type: 'error',
                                        size: 'small'
                                    },
                                    on: {
                                        click: function() {
                                            utils.getJiuHuAddressSyn(callon, callat, function(resp) {
                                                if (resp && resp.address) {
                                                    vueInstanse.records[params.index].address = resp.address;
                                                    LocalCacheMgr.setAddress(callon, callat, resp.address);
                                                }
                                            })
                                        }
                                    }
                                }, callon + "," + callat)

                            } else {
                                return h('Tooltip', {
                                    props: {
                                        content: row.address,
                                        placement: "top-start",
                                        maxWidth: 200
                                    },
                                }, [
                                    h('Button', {
                                        props: {
                                            type: 'primary',
                                            size: 'small'
                                        }
                                    }, callon + "," + callat)
                                ]);
                            }
                        } else {
                            return h('span', {}, '');
                        }
                    },
                },
            ],
            tableData: [],
            recvtime: [],
            totalad: [],
            veo: [],
            distance: [],
            oil1: [],
            oil2: [],
            oil3: [],
            oil4: [],
            srcad0: [],
            srcad1: [],
            srcad2: [],
            srcad3: [],
            devReissue: [],
            currentIndex: 1,
        },
        mixins: [reportMixin],
        methods: {
            onRowClick: function(row) {
                var me = this;
                this.isShowCard = true;
                this.queryTrackDetail(row, function(resp) {
                    if (resp.track) {
                        me.contentString = JSON.stringify(resp.track);
                    } else {
                        vm.$Message.error(me.$t("reportForm.noRecord"));
                    }
                });
            },
            queryTrackDetail: function(row, callback) {
                var data = {
                    deviceid: this.queryDeviceId,
                    updatetime: row.updatetime,
                    trackid: row.trackid
                }
                var url = myUrls.queryTrackDetail();
                utils.sendAjax(url, data, function(resp) {
                    if (resp.status == 0) {
                        callback(resp);
                    }
                })
            },
            changePage: function(index) {
                var offset = index * 20;
                var start = (index - 1) * 20;
                this.currentPageIndex = index;
                this.tableData = this.records.slice(start, offset);
            },
            charts: function() {
                var totoil = vRoot.$t('reportForm.totalOil');
                var speed = vRoot.$t('reportForm.speed');
                var dis = vRoot.$t('reportForm.mileage');
                var time = vRoot.$t('reportForm.time');
                var usoil1 = vRoot.$t('reportForm.oil1');
                var usoil2 = vRoot.$t('reportForm.oil2');
                var usoil3 = vRoot.$t('reportForm.oil3');
                var usoil4 = vRoot.$t('reportForm.oil4');

                var srcad0 = vRoot.$t('reportForm.srcad0');
                var srcad1 = vRoot.$t('reportForm.srcad1');
                var srcad2 = vRoot.$t('reportForm.srcad2');
                var srcad3 = vRoot.$t('reportForm.srcad3');

                var cotgasus = vRoot.$t('reportForm.oil');
                var status = vRoot.$t('reportForm.status');
                var reissue = vRoot.$t('reportForm.reissue');

                var option = {
                    title: {
                        // text: time + '/' + cotgasus,
                        // x: 'center',
                        // textStyle: {
                        //     fontSize: 12,
                        //     fontWeight: 'bolder',
                        //     color: '#333'
                        // }
                    },
                    grid: {
                        // x: 50,
                        // y: 40,
                        // x2: 50,
                        // y2: 40
                        top: 30,
                        left: 60,
                        right: 60,
                        bottom: 40,
                    },
                    tooltip: {
                        trigger: 'axis',
                        formatter: function(v) {
                            var data = time + ' : ' + v[0].name + '<br/>';
                            for (i in v) {
                                if (v[i].seriesName && v[i].seriesName != time) {
                                    if (v[i].seriesName == dis) {
                                        var currentDistance = v[i].value;
                                        var totalDistance = (Number(currentDistance) + firstDistance / 1000).toFixed(2);
                                        data += v[i].seriesName + ' : ' + currentDistance + "(T:" + totalDistance + ")" + 'Km<br/>';

                                    } else if (v[i].seriesName == totoil || v[i].seriesName == usoil1 || v[i].seriesName == usoil2 || v[i].seriesName == usoil3 || v[i].seriesName == usoil4) {
                                        data += v[i].seriesName + ' : ' + v[i].value + 'L<br/>';
                                    } else if (v[i].seriesName == speed) {
                                        data += v[i].seriesName + ' : ' + v[i].value + 'Km/h<br/>';
                                    } else {
                                        data += v[i].seriesName + ' : ' + v[i].value + '<br/>';
                                    }
                                }
                            }
                            return data;
                        }
                    },
                    legend: {
                        data: [speed, dis, totoil, usoil1, usoil2, usoil3, usoil4, srcad0, srcad1, srcad2, srcad3],
                        selected: this.selectedLegend,
                        x: 'left',
                        // width: 600,
                    },
                    toolbox: {
                        show: true,
                        feature: {
                            magicType: { show: true, type: ['line', 'bar'] },
                            restore: { show: true },
                            saveAsImage: {
                                show: true
                            }
                        },
                        itemSize: 14
                    },
                    dataZoom: [{
                        show: true,
                        realtime: true,
                        start: 0,
                        end: 100,
                        height: 20,
                        backgroundColor: '#EDEDED',
                        fillerColor: 'rgb(54, 72, 96,0.5)',
                        //fillerColor:'rgb(244,129,38,0.8)',
                        bottom: 0
                    }, {
                        type: "inside",
                        realtime: true,
                        start: 0,
                        end: 100,
                        height: 20,
                        bottom: 0
                    }],
                    xAxis: [{
                        type: 'category',
                        boundaryGap: false,
                        axisLine: {
                            onZero: false
                        },
                        data: this.recvtime
                    }],
                    yAxis: [{
                        name: '', //totoil + '/' + speed
                        type: 'value',
                        nameTextStyle: 10,
                        nameGap: 5,

                    }, {
                        name: '', //dis
                        type: 'value',
                        nameTextStyle: 10,
                        nameGap: 2,
                        min: this.disMin,
                        axisLabel: {
                            formatter: '{value} km',
                        },
                        axisTick: {
                            show: false
                        }
                    }],
                    series: [{
                            name: time,
                            type: 'line',
                            symbol: 'none',
                            yAxisIndex: 1,
                            color: '#F0805A',
                            smooth: true,
                            data: this.recvtime
                        }, {
                            name: speed,
                            type: 'line',
                            symbol: 'none',
                            yAxisIndex: 0,
                            smooth: true,
                            color: '#4876FF',
                            data: this.veo
                        }, {
                            name: dis,
                            type: 'line',
                            symbol: 'none',
                            yAxisIndex: 1,
                            color: '#3CB371',
                            smooth: true,
                            data: this.distance
                        }, {
                            smooth: true,
                            name: totoil,
                            type: 'line',
                            symbol: 'none',
                            color: '#C1232B',
                            data: this.totalad
                        }, {
                            smooth: true,
                            name: usoil1,
                            type: 'line',
                            symbol: 'none',
                            color: '#8E388E',
                            data: this.oil1
                        },

                        {
                            smooth: true,
                            name: usoil2,
                            type: 'line',
                            symbol: 'none',
                            color: '#FF4500',
                            data: this.oil2
                        },
                        {
                            smooth: true,
                            name: usoil3,
                            type: 'line',
                            symbol: 'none',
                            color: '#2177C7',
                            data: this.oil3
                        },
                        {
                            smooth: true,
                            name: usoil4,
                            type: 'line',
                            symbol: 'none',
                            color: '#B05432',
                            data: this.oil4
                        },

                        {
                            smooth: true,
                            name: srcad0,
                            type: 'line',
                            symbol: 'none',
                            color: '#000000',
                            data: this.srcad0
                        },
                        {
                            smooth: true,
                            name: srcad1,
                            type: 'line',
                            symbol: 'none',
                            color: '#000000',
                            data: this.srcad1
                        },
                        {
                            smooth: true,
                            name: srcad2,
                            type: 'line',
                            symbol: 'none',
                            color: '#000000',
                            data: this.srcad2
                        },
                        {
                            smooth: true,
                            name: srcad3,
                            type: 'line',
                            symbol: 'none',
                            color: '#000000',
                            data: this.srcad3
                        },
                        {
                            smooth: true,
                            name: status,
                            type: 'line',
                            symbol: 'none',
                            color: '#000',
                            data: this.devStates
                        },
                        {
                            smooth: true,
                            name: reissue,
                            type: 'line',
                            symbol: 'none',
                            color: '#000',
                            data: this.devReissue
                        },
                    ]
                };

                this.chartsIns.setOption(option);
            },
            calcTableHeight: function() {
                var wHeight = window.innerHeight;
                this.lastTableHeight = wHeight - 360;
            },
            onClickQuery: function() {
                if (this.queryDeviceId == "") { return };
                var self = this;
                if (this.isSelectAll === null) {
                    this.$Message.error(this.$t("reportForm.selectDevTip"));
                    return;
                };
                var data = {
                    // username: vstore.state.userName,
                    startday: this.dateVal[0],
                    endday: this.dateVal[1],
                    offset: timeDifference,
                    devices: [this.queryDeviceId],
                };
                this.loading = true;
                utils.sendAjax(myUrls.reportOilTime(), data, function(resp) {
                    self.loading = false;
                    if (resp.status == 0) {
                        if (resp.records) {
                            var records = [],
                                totalads = [],
                                veo = [],
                                distance = [],
                                recvtime = [],
                                oil1 = [],
                                oil2 = [],
                                oil3 = [],
                                oil4 = [],
                                srcad0 = [],
                                srcad1 = [],
                                srcad2 = [],
                                srcad3 = [],
                                devReissue = [],
                                devStates = [];
                            firstDistance = 0;
                            resp.records.forEach(function(item, index) {
                                records = item.records;
                                // var independent = item.independent === 0;
                                records.forEach(function(record, index) {
                                    if (index == 0) {
                                        firstDistance = record.totaldistance;
                                    };
                                    var callon = record.callon.toFixed(5);
                                    var callat = record.callat.toFixed(5);
                                    var address = LocalCacheMgr.getAddress(callon, callat);
                                    if (address != null) {
                                        record.address = address;
                                    } else {
                                        record.address = null;
                                    }
                                    var totalad = record.totalad;
                                    var ad0 = record.ad0;
                                    var ad1 = record.ad1;
                                    var ad2 = record.ad2;
                                    var ad3 = record.ad3;
                                    if (ad0 < 0) {
                                        ad0 = 0;
                                    };
                                    if (ad1 < 0) {
                                        ad1 = 0;
                                    };
                                    if (ad2 < 0) {
                                        ad2 = 0;
                                    };
                                    if (ad3 < 0) {
                                        ad3 = 0;
                                    };
                                    record.totalad = totalad / 100;
                                    record.ad0 = ad0 / 100;
                                    record.ad1 = ad1 / 100;
                                    record.ad2 = ad2 / 100;
                                    record.ad3 = ad3 / 100;
                                    record.speed = (record.speed / 1000).toFixed(2);
                                    record.updatetimeStr = DateFormat.longToDateTimeStr(record.updatetime, timeDifference);
                                    record.devicename = vstore.state.deviceInfos[self.queryDeviceId].devicename;
                                    totalads.push(record.totalad);
                                    veo.push(record.speed);
                                    record.totaldistance = ((record.totaldistance - firstDistance) / 1000).toFixed(2);
                                    distance.push(record.totaldistance);
                                    recvtime.push(record.updatetimeStr);
                                    oil1.push(record.ad0);
                                    oil2.push(record.ad1);
                                    oil3.push(record.ad2);
                                    oil4.push(record.ad3);
                                    srcad0.push(record.srcad0);
                                    srcad1.push(record.srcad1);
                                    srcad2.push(record.srcad2);
                                    srcad3.push(record.srcad3);
                                    devStates.push(record.strstatus);
                                    devReissue.push(record.reissue == 0 ? self.$t('header.no') : self.$t('header.yes'));
                                });
                            });

                            self.totalad = totalads;
                            self.veo = veo;
                            self.distance = distance;
                            self.recvtime = recvtime;
                            self.oil1 = oil1;
                            self.oil2 = oil2;
                            self.oil3 = oil3;
                            self.oil4 = oil4;
                            self.srcad0 = srcad0;
                            self.srcad1 = srcad1;
                            self.srcad2 = srcad2;
                            self.srcad3 = srcad3;
                            self.records = records;
                            self.devStates = devStates;
                            self.devReissue = devReissue;
                            self.total = records.length;
                            records.sort(function(a, b) {
                                return b.updatetime - a.updatetime;
                            })
                            records.forEach(function(item, index) {
                                item.index = index + 1;
                            })
                            self.currentPageIndex = 1;
                            self.tableData = records.slice(0, 20);
                            self.charts();
                        } else {
                            self.$Message.error(self.$t("reportForm.noRecord"));
                        }
                    } else {
                        self.$Message.error(resp.cause);
                    }
                })
            }
        },
        mounted: function() {
            var me = this;
            this.groupslist = groupslist;
            this.myChart = null;
            this.records = [];
            this.disMin = 0;

            var usoil1 = vRoot.$t('reportForm.oil1');
            var usoil2 = vRoot.$t('reportForm.oil2');
            var usoil3 = vRoot.$t('reportForm.oil3');
            var usoil4 = vRoot.$t('reportForm.oil4');

            var srcad0 = vRoot.$t('reportForm.srcad0');
            var srcad1 = vRoot.$t('reportForm.srcad1');
            var srcad2 = vRoot.$t('reportForm.srcad2');
            var srcad3 = vRoot.$t('reportForm.srcad3');

            this.selectedLegend = {
                [usoil1]: false,
                [usoil2]: false,
                [usoil3]: false,
                [usoil4]: false,
                [srcad0]: false,
                [srcad1]: false,
                [srcad2]: false,
                [srcad3]: false,
            }


            this.chartsIns = echarts.init(document.getElementById('charts'));
            this.charts();

            this.chartsIns.getZr().on('click', function(params) {
                var pointInPixel = [params.offsetX, params.offsetY];
                if (me.chartsIns.containPixel('grid', pointInPixel)) {
                    var tracks = me.records;
                    if (tracks.length) {
                        var xIndex = me.chartsIns.convertFromPixel({
                            seriesIndex: 0
                        }, [params.offsetX, params.offsetY])[0];
                        var currentIndex = Math.ceil((tracks.length - xIndex) / 20);
                        var rowIndex = (tracks.length - xIndex) % 20;
                        if (rowIndex == 0) {
                            rowIndex = 19;
                        } else {
                            rowIndex = rowIndex - 1;
                        }
                        me.changePage(currentIndex);
                        me.currentIndex = currentIndex;

                        setTimeout(function() {
                            console.log(rowIndex);
                            me.$refs.table.$refs.tbody.clickCurrentRow(rowIndex);
                            var rowHeight = $('tr.ivu-table-row')[0].getBoundingClientRect().height
                            $('div.ivu-table-body').animate({
                                scrollTop: (rowIndex * rowHeight) + 'px'
                            }, 300);
                        }, 500)
                    }
                }
            });





            this.chartsIns.on('legendselectchanged', function(param) {

                var columns = [
                    { title: vRoot.$t('reportForm.index'), key: 'index', width: 70 },
                    { title: vRoot.$t('alarm.devName'), key: 'devicename', width: 100 },
                    { title: vRoot.$t('reportForm.date'), key: 'updatetimeStr', sortable: true, width: 160 },
                    { title: vRoot.$t('reportForm.totalMileage') + '(km)', key: 'totaldistance', width: 100 },
                    { title: vRoot.$t('reportForm.totalOil'), key: 'totalad', width: 100 },
                ];

                var selected = param.selected;
                me.selectedLegend[usoil1] = !!selected[usoil1];
                me.selectedLegend[usoil2] = !!selected[usoil2];
                me.selectedLegend[usoil3] = !!selected[usoil3];
                me.selectedLegend[usoil4] = !!selected[usoil4];
                me.selectedLegend[srcad0] = !!selected[srcad0];
                me.selectedLegend[srcad1] = !!selected[srcad1];
                me.selectedLegend[srcad2] = !!selected[srcad2];
                me.selectedLegend[srcad3] = !!selected[srcad3];

                if (selected[usoil1]) {
                    columns.push({ title: vRoot.$t('reportForm.oil1'), key: 'ad0', width: 90 })
                }
                if (selected[usoil2]) {
                    columns.push({ title: vRoot.$t('reportForm.oil2'), key: 'ad1', width: 90 })
                }
                if (selected[usoil3]) {
                    columns.push({ title: vRoot.$t('reportForm.oil3'), key: 'ad2', width: 90 })
                }
                if (selected[usoil4]) {
                    columns.push({ title: vRoot.$t('reportForm.oil4'), key: 'ad3', width: 90 })
                }
                if (selected[srcad0]) {
                    columns.push({ title: vRoot.$t('reportForm.srcad0'), key: 'srcad0', width: 90 })
                }
                if (selected[srcad1]) {
                    columns.push({ title: vRoot.$t('reportForm.srcad1'), key: 'srcad1', width: 90 })
                }
                if (selected[srcad2]) {
                    columns.push({ title: vRoot.$t('reportForm.srcad2'), key: 'srcad2', width: 90 })
                }
                if (selected[srcad3]) {
                    columns.push({ title: vRoot.$t('reportForm.srcad3'), key: 'srcad3', width: 90 })
                }


                me.columns = columns.concat([
                    { title: vRoot.$t('reportForm.speed'), key: 'speed', width: 80 },
                    { title: vRoot.$t('reportForm.reissue'), key: 'reissue', width: 80 },
                    { title: vRoot.$t('reportForm.status'), key: 'strstatus', width: 160, },
                    {
                        title: vRoot.$t('reportForm.lon') + ',' + vRoot.$t('reportForm.lat'),
                        width: 210,
                        render: function(h, params) {
                            var row = params.row;
                            var callat = row.callat.toFixed(5);
                            var callon = row.callon.toFixed(5);

                            if (callat && callon) {
                                if (row.address == null) {

                                    return h('Button', {
                                        props: {
                                            type: 'error',
                                            size: 'small'
                                        },
                                        on: {
                                            click: function() {
                                                utils.getJiuHuAddressSyn(callon, callat, function(resp) {
                                                    if (resp && resp.address) {
                                                        vueInstanse.records[params.index].address = resp.address;
                                                        LocalCacheMgr.setAddress(callon, callat, resp.address);
                                                    }
                                                })
                                            }
                                        }
                                    }, callon + "," + callat)

                                } else {
                                    return h('Tooltip', {
                                        props: {
                                            content: row.address,
                                            placement: "top-start",
                                            maxWidth: 200
                                        },
                                    }, [
                                        h('Button', {
                                            props: {
                                                type: 'primary',
                                                size: 'small'
                                            }
                                        }, callon + "," + callat)
                                    ]);
                                }
                            } else {
                                return h('span', {}, '');
                            }
                        },
                    },
                ]);
            });
        }
    });
}




function dayOil(groupslist) {
    vueInstanse = new Vue({
        el: "#day-oil",
        i18n: utils.getI18n(),
        data: {
            loading: false,
            groupslist: [],
            columns: [
                { title: vRoot.$t('reportForm.index'), type: 'index', width: 70 },
                { title: vRoot.$t('alarm.devName'), key: 'devicename' },
                { title: vRoot.$t('reportForm.date'), key: 'statisticsday', sortable: true },
                { title: vRoot.$t('reportForm.mileage') + '(km)', key: 'distance', },
                { title: vRoot.$t('reportForm.oilConsumption'), key: 'oil', },
                { title: vRoot.$t('reportForm.fuelVolume'), key: 'addoil' },
                { title: vRoot.$t('reportForm.oilLeakage'), key: 'leakoil' },
                { title: vRoot.$t('reportForm.fuelConsumption100km'), key: 'oilPercent' },
            ],
            tableData: [],
            recvtime: [],
            oil: [],
            distance: [],
            currentIndex: 1,
        },
        mixins: [reportMixin],
        methods: {
            changePage: function(index) {
                var offset = index * 20;
                var start = (index - 1) * 20;
                this.currentPageIndex = index;
                this.tableData = this.records.slice(start, offset);
            },
            charts: function() {
                var dis = vRoot.$t('reportForm.mileage');
                var cotgas = vRoot.$t('reportForm.oilConsumption');
                var no_data = vRoot.$t('reportForm.empty');
                var option = {
                    tooltip: {
                        show: true,
                        trigger: 'axis',
                        axisPointer: {
                            type: 'shadow'
                        }
                    },
                    legend: {
                        data: [dis, cotgas],
                        y: 13,
                        x: 'center'
                    },

                    grid: {
                        x: 100,
                        y: 40,
                        x2: 80,
                        y2: 30
                    },
                    xAxis: [{
                        type: 'category',
                        //boundaryGap : false,
                        axisLabel: {
                            show: true,
                            interval: 0, // {number}
                            rotate: 0,
                            margin: 8,
                            textStyle: {
                                fontSize: 12
                            }
                        },
                        data: this.recvtime.length === 0 ? [no_data] : this.recvtime
                    }],
                    yAxis: [{
                        type: 'value',
                        position: 'bottom',
                        nameLocation: 'end',
                        boundaryGap: [0, 0.2],
                        axisLabel: {
                            formatter: '{value}'
                        }
                    }],
                    series: [{
                            name: dis,
                            type: 'bar',
                            itemStyle: {
                                //默认样式
                                normal: {
                                    label: {
                                        show: true,
                                        textStyle: {
                                            fontSize: '12',
                                            fontFamily: '微软雅黑',
                                            fontWeight: 'bold'
                                        }
                                    }
                                }
                                //悬浮式样式
                            },
                            data: this.distance
                        },
                        {
                            name: cotgas,
                            type: 'bar',
                            itemStyle: {
                                //默认样式
                                normal: {
                                    label: {
                                        show: true,
                                        textStyle: {
                                            fontSize: '12',
                                            fontFamily: '微软雅黑',
                                            fontWeight: 'bold'
                                        }
                                    }
                                }
                            },
                            data: this.oil
                        }
                    ]
                };
                this.chartsIns.setOption(option);
            },

            calcTableHeight: function() {
                var wHeight = window.innerHeight;
                this.lastTableHeight = wHeight - 360;
            },
            onClickQuery: function() {
                if (this.queryDeviceId == "") { return };
                var self = this;
                if (this.isSelectAll === null) {
                    this.$Message.error(this.$t("reportForm.selectDevTip"));
                    return;
                };
                var data = {
                    // username: vstore.state.userName,
                    startday: this.dateVal[0],
                    endday: this.dateVal[1],
                    offset: timeDifference,
                    devices: [this.queryDeviceId],
                };
                this.loading = true;
                utils.sendAjax(myUrls.reportOilDaily(), data, function(resp) {
                    self.loading = false;
                    if (resp.status == 0) {
                        if (resp.records) {
                            var records = [],
                                oil = [],
                                distance = [],
                                recvtime = [];
                            resp.records.forEach(function(item, index) {
                                records = item.records;
                                records.forEach(function(record) {
                                    record.devicename = vstore.state.deviceInfos[self.queryDeviceId].devicename;
                                    record.distance = record.enddis - record.begindis;
                                    record.oil = record.beginoil - record.endoil + record.addoil - record.leakoil;
                                    record.oil = record.oil / 100;
                                    record.addoil = record.addoil / 100;
                                    record.leakoil = record.leakoil / 100;

                                    record.distance = (record.distance / 1000).toFixed(2);
                                    if (record.distance != 0) {
                                        record.oilPercent = ((record.oil / (record.distance)) * 100).toFixed(2);
                                    } else {
                                        record.oilPercent = 0;
                                    }
                                    oil.push(record.oil);
                                    distance.push(record.distance);
                                    recvtime.push(record.statisticsday);
                                });
                            });
                            self.oil = oil;
                            self.distance = distance;
                            self.recvtime = recvtime;

                            self.records = records;
                            self.total = records.length;

                            self.currentPageIndex = 1;
                            self.tableData = records.slice(0, 20);
                            self.charts();
                        } else {
                            self.$Message.error(self.$t("reportForm.noRecord"));
                        }
                    } else {
                        self.$Message.error(resp.cause);
                    }
                })
            },
            onSortChange: function(column) {

            }
        },
        mounted: function() {
            this.groupslist = groupslist;
            this.myChart = null;
            this.records = [];
            this.chartsIns = echarts.init(document.getElementById('charts'));
            this.charts();

        }
    });
}

function refuelingReport(groupslist) {
    vueInstanse = new Vue({
        el: "#refueling-report",
        i18n: utils.getI18n(),
        data: {
            loading: false,
            isSpin: false,
            tank: '0',
            activeTab: 'tabTotal',
            groupslist: [],
            allColumns: [{
                    title: vRoot.$t("reportForm.index"),
                    key: 'index',
                    width: 70,
                }, {
                    title: vRoot.$t("alarm.action"),
                    width: 160,
                    render: function(h, params) {
                        return h('span', {
                            on: {
                                click: function() {
                                    vueInstanse.activeTab = "tabDetail";
                                    vueInstanse.getDetailTableData(params.row.deviceid, params.row.records);
                                }
                            },
                            style: {
                                color: '#e4393c',
                                cursor: 'pointer'
                            }
                        }, "[" + vRoot.$t("reportForm.detailed") + "]")
                    }
                },
                {
                    title: vRoot.$t("alarm.devName"),
                    key: 'devicename'
                },
                {
                    title: vRoot.$t("alarm.devNum"),
                    key: 'deviceid'
                },
                {
                    title: vRoot.$t("monitor.groupName"),
                    key: 'groupname',
                },
                {
                    title: vRoot.$t('reportForm.fuelVolume'),
                    key: 'totalOil'
                },
                {
                    title: vRoot.$t('reportForm.refuelingTimes'),
                    key: 'count'
                },
            ],
            allTableData: [],
            columns: [
                { title: vRoot.$t('reportForm.index'), key: 'index', width: 70 },
                { title: vRoot.$t('alarm.devName'), key: 'devicename' },
                { title: vRoot.$t('reportForm.soil'), key: 'soil' },
                { title: vRoot.$t('reportForm.eoil'), key: 'eoil' },
                {
                    title: vRoot.$t('reportForm.fuelVolume') + '(L)',
                    key: 'addoil',
                },
                { title: vRoot.$t('reportForm.startDate'), key: 'begintimeStr' },
                { title: vRoot.$t('reportForm.endDate'), key: 'endtimeStr' },
                {
                    title: vRoot.$t('reportForm.saddress'),
                    render: function(h, params) {
                        var row = params.row;
                        var lat = row.slat ? row.slat.toFixed(5) : null;
                        var lon = row.slon ? row.slon.toFixed(5) : null;
                        if (lat && lon) {
                            if (row.saddress == null) {
                                return h('Button', {
                                    props: {
                                        type: 'error',
                                        size: 'small'
                                    },
                                    on: {
                                        click: function() {
                                            utils.getJiuHuAddressSyn(lon, lat, function(resp) {
                                                if (resp && resp.address) {
                                                    var newRow = deepClone(row);
                                                    newRow.saddress = resp.address;
                                                    vueInstanse.$set(vueInstanse.tableData, params.index, newRow)
                                                    LocalCacheMgr.setAddress(lon, lat, resp.address);
                                                }
                                            })
                                        }
                                    }
                                }, lon + "," + lat)

                            } else {
                                return h('span', {}, row.saddress);
                            }
                        } else {
                            return h('span', {}, '');
                        }
                    },
                },
            ],
            tableData: [],
            recvtime: [],
            oil: [],
        },
        mixins: [treeMixin],
        methods: {
            exportData: function() {
                if (this.activeTab == 'tabTotal') {
                    var allColumns = deepClone(this.allColumns.filter(function(col, index) { return index != 1; }));
                    var allTableData = deepClone(this.allTableData);
                    allTableData.forEach(function(item) {
                        item.deviceid = '\t' + item.deviceid;
                        item.devicename = '\t' + item.devicename;
                    });
                    this.$refs.totalTable.exportCsv({
                        filename: vRoot.$t('reportForm.addOilStatistics'),
                        original: false,
                        columns: allColumns,
                        data: allTableData
                    });
                } else {
                    var columns = deepClone(this.columns);
                    var tableData = deepClone(this.tableData);
                    columns.pop();
                    columns.push({
                        title: isZh ? '地址' : 'Address',
                        key: 'saddress',
                    })
                    tableData.forEach(function(item) {
                        item.deviceid = '\t' + item.deviceid;
                        item.devicename = '\t' + item.devicename;
                        item.begintimeStr = '\t' + item.begintimeStr;
                        item.endtimeStr = '\t' + item.endtimeStr;
                    });
                    this.$refs.detailTable.exportCsv({
                        filename: vRoot.$t('reportForm.addOilDetailed'),
                        original: false,
                        columns: columns,
                        data: tableData
                    });
                }

            },
            charts: function() {
                var cotgas = vRoot.$t('reportForm.fuelVolume');
                var no_data = vRoot.$t('reportForm.empty');
                var option = {
                    tooltip: {
                        show: true,
                        trigger: 'axis',
                        axisPointer: {
                            type: 'shadow'
                        }
                    },
                    legend: {
                        data: [cotgas],
                        y: 13,
                        x: 'center'
                    },

                    grid: {
                        x: 100,
                        y: 40,
                        x2: 80,
                        y2: 30
                    },
                    xAxis: [{
                        type: 'category',
                        //boundaryGap : false,
                        axisLabel: {
                            show: true,
                            interval: 0, // {number}
                            rotate: 0,
                            margin: 8,
                            textStyle: {
                                fontSize: 12
                            }
                        },
                        data: this.recvtime.length === 0 ? [no_data] : this.recvtime
                    }],
                    yAxis: [{
                        type: 'value',
                        position: 'bottom',
                        nameLocation: 'end',
                        boundaryGap: [0, 0.2],
                        axisLabel: {
                            formatter: '{value}L'
                        }
                    }],
                    series: [{
                        name: cotgas,
                        type: 'bar',
                        itemStyle: {
                            //默认样式
                            backgroundColor: '#000',
                            normal: {
                                label: {
                                    show: true,
                                    textStyle: {
                                        fontSize: '12',
                                        fontFamily: '微软雅黑',
                                        fontWeight: 'bold'
                                    }
                                }
                            },
                        },
                        color: '#135DB4',
                        data: this.oil
                    }]
                };
                this.chartsIns.setOption(option);

            },

            calcTableHeight: function() {
                var wHeight = window.innerHeight;
                this.lastTableHeight = wHeight - 415;
            },
            onClickTab: function(name) {
                this.activeTab = name;
            },
            getDetailTableData: function(deviceid, records) {
                records.sort(function(a, b) {
                    return b.begintime - a.begintime;
                })
                records.forEach(function(record, index) {
                    record.index = index + 1;
                    var slat = record.slat.toFixed(5);
                    var slon = record.slon.toFixed(5);
                    var saddress = LocalCacheMgr.getAddress(slon, slat);
                    if (saddress != null) {
                        record.saddress = saddress;
                    } else {
                        record.saddress = null;
                    };
                    var oil = record.eoil - record.soil;
                    oil = oil.toFixed(2);
                    record.devicename = vstore.state.deviceInfos[deviceid].devicename;
                    record.begintimeStr = DateFormat.longToDateTimeStr(record.begintime, timeDifference);
                    record.endtimeStr = DateFormat.longToDateTimeStr(record.endtime, timeDifference);
                    record.addoil = oil;
                });
                this.tableData = records;
            },
            onClickQuery: function() {
                var self = this;
                this.activeTab = 'tabTotal';
                var deviceids = [];
                this.checkedDevice.forEach(function(group) {
                    if (!group.children) {
                        if (group.deviceid != null) {
                            deviceids.push(group.deviceid);
                        }
                    }
                });

                if (deviceids.length == 0) {
                    this.$Message.error(this.$t('reportForm.selectDevTip'));
                    return;
                }
                this.tableData = [];
                var data = {
                    // username: vstore.state.userName,
                    startday: this.dateVal[0],
                    endday: this.dateVal[1],
                    offset: timeDifference,
                    devices: deviceids,
                    oilstate: 1,
                    oilindex: Number(self.tank)
                };
                this.loading = true;
                utils.sendAjax(myUrls.reportOilRecord(), data, function(resp) {
                    self.loading = false;
                    if (resp.status == 0) {
                        if (resp.records) {
                            var oilArr = [],
                                recvtime = [];
                            resp.records.forEach(function(item, index) {
                                item.index = index + 1;
                                item.devicename = vstore.state.deviceInfos[item.deviceid].devicename;
                                item.groupname = utils.getGroupName(groupslist, item.deviceid);
                                var totalOil = 0;
                                var records = item.records;
                                records.forEach(function(record) {

                                    record.eoil = record.eoil / 100;
                                    record.soil = record.soil / 100;
                                    var oil = record.eoil - record.soil;
                                    totalOil += oil;


                                    var lat = record.slat.toFixed(5);
                                    var lon = record.slon.toFixed(5);
                                    var saddress = LocalCacheMgr.getAddress(lon, lat);
                                    if (saddress != null) {
                                        record.saddress = saddress;
                                    } else {
                                        utils.getJiuHuAddressSyn(lon, lat, function(resp) {
                                            if (resp && resp.address) {
                                                (function(lon, lat, record, resp) {
                                                    record.saddress = resp.address;
                                                    LocalCacheMgr.setAddress(lon, lat, resp.address);
                                                })(lon, lat, record, resp)
                                            }
                                        })
                                    };
                                });
                                totalOil = totalOil.toFixed(2);
                                if (totalOil > 0) {
                                    oilArr.push(totalOil);
                                    recvtime.push(item.devicename);
                                }
                                item.totalOil = totalOil;
                                item.count = records.length;
                            });

                            self.oil = oilArr;
                            self.recvtime = recvtime;
                            self.allTableData = resp.records;
                            self.charts();
                        } else {
                            self.$Message.error(self.$t("reportForm.noRecord"));
                        }
                    } else {
                        self.$Message.error(resp.cause);
                    }
                })
            },
            queryDevicesTree: function() {
                var me = this;
                this.isSpin = true;
                GlobalOrgan.getInstance().getGlobalOrganData(function(rootuser) {
                    me.isSpin = false;
                    me.initZTree(rootuser);
                })
            },
            onSortChange: function(column) {

            }
        },
        mounted: function() {
            var me = this;
            this.myChart = null;
            this.records = [];
            this.chartsIns = echarts.init(document.getElementById('charts'));
            this.charts();
            this.queryDevicesTree();
        }
    });
}

function oilLeakageReport(groupslist) {
    vueInstanse = new Vue({
        el: "#oil-leakage-report",
        i18n: utils.getI18n(),
        data: {
            loading: false,
            isSpin: false,
            tank: '0',
            activeTab: 'tabTotal',
            groupslist: [],
            allColumns: [{
                    title: vRoot.$t("reportForm.index"),
                    key: 'index',
                    width: 70,
                }, {
                    title: vRoot.$t("alarm.action"),
                    width: 160,
                    render: function(h, params) {
                        return h('span', {
                            on: {
                                click: function() {
                                    vueInstanse.activeTab = "tabDetail";
                                    vueInstanse.getDetailTableData(params.row.deviceid, params.row.records);
                                }
                            },
                            style: {
                                color: '#e4393c',
                                cursor: 'pointer'
                            }
                        }, "[" + vRoot.$t("reportForm.detailed") + "]")
                    }
                },
                {
                    title: vRoot.$t("alarm.devName"),
                    key: 'devicename'
                },
                {
                    title: vRoot.$t("alarm.devNum"),
                    key: 'deviceid'
                },
                {
                    title: vRoot.$t("monitor.groupName"),
                    key: 'groupname',
                },
                {
                    title: vRoot.$t('reportForm.oilLeakage'),
                    key: 'totalOil'
                },
                {
                    title: vRoot.$t('reportForm.oilLeakageTimes'),
                    key: 'count'
                },
            ],
            allTableData: [],
            columns: [
                { title: vRoot.$t('reportForm.index'), key: 'index', width: 70 },
                { title: vRoot.$t('alarm.devName'), key: 'devicename' },
                { title: vRoot.$t('reportForm.lsoil'), key: 'soil' },
                { title: vRoot.$t('reportForm.leoil'), key: 'eoil' },
                {
                    title: vRoot.$t('reportForm.oilLeakage') + '(L)',
                    key: 'addoil',
                },
                { title: vRoot.$t('reportForm.startDate'), key: 'begintimeStr' },
                { title: vRoot.$t('reportForm.endDate'), key: 'endtimeStr' },
                {
                    title: vRoot.$t('reportForm.saddress'),
                    render: function(h, params) {
                        var row = params.row;
                        var lat = row.slat ? row.slat.toFixed(5) : null;
                        var lon = row.slon ? row.slon.toFixed(5) : null;
                        if (lat && lon) {
                            if (row.saddress == null) {
                                return h('Button', {
                                    props: {
                                        type: 'error',
                                        size: 'small'
                                    },
                                    on: {
                                        click: function() {
                                            utils.getJiuHuAddressSyn(lon, lat, function(resp) {
                                                if (resp && resp.address) {
                                                    var newRow = deepClone(row);
                                                    newRow.saddress = resp.address;
                                                    vueInstanse.$set(vueInstanse.tableData, params.index, newRow)
                                                    LocalCacheMgr.setAddress(lon, lat, resp.address);
                                                }
                                            })
                                        }
                                    }
                                }, lon + "," + lat)

                            } else {
                                return h('span', {}, row.saddress);
                            }
                        } else {
                            return h('span', {}, '');
                        }
                    },
                },
            ],
            tableData: [],
            recvtime: [],
            oil: [],
        },
        mixins: [treeMixin],
        methods: {
            exportData: function() {
                if (this.activeTab == 'tabTotal') {
                    var allColumns = deepClone(this.allColumns.filter(function(col, index) { return index != 1; }));
                    var allTableData = deepClone(this.allTableData);
                    allTableData.forEach(function(item) {
                        item.deviceid = '\t' + item.deviceid;
                        item.devicename = '\t' + item.devicename;
                    });
                    this.$refs.totalTable.exportCsv({
                        filename: vRoot.$t('reportForm.oilLeakageStatistics'),
                        original: false,
                        columns: allColumns,
                        data: allTableData
                    });
                } else {
                    var columns = deepClone(this.columns);
                    var tableData = deepClone(this.tableData);
                    columns.pop();
                    columns.push({
                        title: isZh ? '地址' : 'Address',
                        key: 'saddress',
                    })
                    tableData.forEach(function(item) {
                        item.deviceid = '\t' + item.deviceid;
                        item.devicename = '\t' + item.devicename;
                        item.begintimeStr = '\t' + item.begintimeStr;
                        item.endtimeStr = '\t' + item.endtimeStr;
                    });
                    this.$refs.detailTable.exportCsv({
                        filename: vRoot.$t('reportForm.oilLeakageDetailed'),
                        original: false,
                        columns: columns,
                        data: tableData
                    });
                }

            },
            charts: function() {
                var cotgas = vRoot.$t('reportForm.oilLeakage');
                var no_data = vRoot.$t('reportForm.empty');
                var option = {
                    tooltip: {
                        show: true,
                        trigger: 'axis',
                        axisPointer: {
                            type: 'shadow'
                        }
                    },
                    legend: {
                        data: [cotgas],
                        y: 13,
                        x: 'center'
                    },

                    grid: {
                        x: 100,
                        y: 40,
                        x2: 80,
                        y2: 30
                    },
                    xAxis: [{
                        type: 'category',
                        //boundaryGap : false,
                        axisLabel: {
                            show: true,
                            interval: 0, // {number}
                            rotate: 0,
                            margin: 8,
                            textStyle: {
                                fontSize: 12
                            }
                        },
                        data: this.recvtime.length === 0 ? [no_data] : this.recvtime
                    }],
                    yAxis: [{
                        type: 'value',
                        position: 'bottom',
                        nameLocation: 'end',
                        boundaryGap: [0, 0.2],
                        axisLabel: {
                            formatter: '{value}L'
                        }
                    }],
                    series: [{
                        name: cotgas,
                        type: 'bar',
                        itemStyle: {
                            //默认样式
                            backgroundColor: '#000',
                            normal: {
                                label: {
                                    show: true,
                                    textStyle: {
                                        fontSize: '12',
                                        fontFamily: '微软雅黑',
                                        fontWeight: 'bold'
                                    }
                                }
                            },
                        },
                        color: '#e4393c',
                        data: this.oil
                    }]
                };
                this.chartsIns.setOption(option);

            },

            calcTableHeight: function() {
                var wHeight = window.innerHeight;
                this.lastTableHeight = wHeight - 415;
            },
            onClickTab: function(name) {
                this.activeTab = name;
            },
            getDetailTableData: function(deviceid, records) {
                records.sort(function(a, b) {
                    return b.begintime - a.begintime;
                })
                records.forEach(function(record, index) {
                    record.index = index + 1;
                    var slat = record.slat.toFixed(5);
                    var slon = record.slon.toFixed(5);
                    var saddress = LocalCacheMgr.getAddress(slon, slat);
                    if (saddress != null) {
                        record.saddress = saddress;
                    } else {
                        record.saddress = null;
                    };
                    var oil = record.eoil - record.soil;
                    oil = oil.toFixed(2);
                    record.devicename = vstore.state.deviceInfos[deviceid].devicename;
                    record.begintimeStr = DateFormat.longToDateTimeStr(record.begintime, timeDifference);
                    record.endtimeStr = DateFormat.longToDateTimeStr(record.endtime, timeDifference);
                    record.addoil = oil;
                });
                this.tableData = records;
            },
            onClickQuery: function() {
                var self = this;
                this.activeTab = 'tabTotal';
                var deviceids = [];
                this.checkedDevice.forEach(function(group) {
                    if (!group.children) {
                        if (group.deviceid != null) {
                            deviceids.push(group.deviceid);
                        }
                    }
                });

                if (deviceids.length == 0) {
                    this.$Message.error(this.$t('reportForm.selectDevTip'));
                    return;
                }
                this.tableData = [];
                var data = {
                    // username: vstore.state.userName,
                    startday: this.dateVal[0],
                    endday: this.dateVal[1],
                    offset: timeDifference,
                    devices: deviceids,
                    oilstate: -1,
                    oilindex: Number(self.tank)
                };
                this.loading = true;
                utils.sendAjax(myUrls.reportOilRecord(), data, function(resp) {
                    self.loading = false;
                    if (resp.status == 0) {
                        if (resp.records) {
                            var oilArr = [],
                                recvtime = [];
                            resp.records.forEach(function(item, index) {
                                item.index = index + 1;
                                item.devicename = vstore.state.deviceInfos[item.deviceid].devicename;
                                item.groupname = utils.getGroupName(groupslist, item.deviceid);
                                var totalOil = 0;
                                var records = item.records;
                                records.forEach(function(record) {

                                    record.eoil = record.eoil / 100;
                                    record.soil = record.soil / 100;
                                    var oil = record.soil - record.eoil;
                                    totalOil += oil;


                                    var lat = record.slat.toFixed(5);
                                    var lon = record.slon.toFixed(5);
                                    var saddress = LocalCacheMgr.getAddress(lon, lat);
                                    if (saddress != null) {
                                        record.saddress = saddress;
                                    } else {
                                        utils.getJiuHuAddressSyn(lon, lat, function(resp) {
                                            if (resp && resp.address) {
                                                (function(lon, lat, record, resp) {
                                                    record.saddress = resp.address;
                                                    LocalCacheMgr.setAddress(lon, lat, resp.address);
                                                })(lon, lat, record, resp)
                                            }
                                        })
                                    };
                                });
                                totalOil = totalOil.toFixed(2);
                                if (totalOil > 0) {
                                    oilArr.push(totalOil);
                                    recvtime.push(item.devicename);
                                }
                                item.totalOil = totalOil;
                                item.count = records.length;
                            });

                            self.oil = oilArr;
                            self.recvtime = recvtime;
                            self.allTableData = resp.records;
                            self.charts();
                        } else {
                            self.$Message.error(self.$t("reportForm.noRecord"));
                        }
                    } else {
                        self.$Message.error(resp.cause);
                    }
                })
            },
            queryDevicesTree: function() {
                var me = this;
                this.isSpin = true;
                GlobalOrgan.getInstance().getGlobalOrganData(function(rootuser) {
                    me.isSpin = false;
                    me.initZTree(rootuser);
                })
            },
            onSortChange: function(column) {

            }
        },
        mounted: function() {
            var me = this;
            this.myChart = null;
            this.records = [];
            this.chartsIns = echarts.init(document.getElementById('charts'));
            this.charts();
            this.queryDevicesTree();

        }
    });

}

function oilWorkingHours(groupslist) {
    vueInstanse = new Vue({
        el: "#oil-working-hours",
        i18n: utils.getI18n(),
        data: {
            loading: false,
            isSpin: false,
            startDate: DateFormat.longToDateStr(Date.now(), timeDifference),
            startTime: '00:00:00',
            endDate: DateFormat.longToDateStr(Date.now(), timeDifference),
            endTime: '23:59:59',
            options: {
                disabledDate: function(date) {
                    return date && date.valueOf() > Date.now();
                }
            },
            dateTimeRangeVal: [DateFormat.longToDateStr(Date.now(), timeDifference) + " 00:00:00", DateFormat.longToDateStr(Date.now(), timeDifference) + " 23:59:59"],
            groupslist: [],
            columns: [{
                    title: vRoot.$t("reportForm.index"),
                    key: 'index',
                    width: 70,
                },
                {
                    title: vRoot.$t("alarm.devName"),
                    key: 'devicename'
                },
                {
                    title: vRoot.$t("alarm.devNum"),
                    key: 'deviceid'
                },
                {
                    title: vRoot.$t('reportForm.mileage') + '(Km)',
                    key: 'totaldistance',
                    render: function(h, pramas) {
                        var row = pramas.row;
                        return h('sapn', {}, (row.totaldistance / 1000).toFixed(2));
                    },
                },
                {
                    title: vRoot.$t("reportForm.oilConsumption") + '(L)',
                    key: 'totaloil',
                    render: function(h, pramas) {
                        var row = pramas.row;
                        return h('sapn', {}, (row.totaloil / 100).toFixed(2));
                    },
                },
                {
                    title: vRoot.$t("reportForm.workingHours"),
                    key: 'totalacc',
                    render: function(h, pramas) {
                        var row = pramas.row;
                        return h('sapn', {}, utils.timeStamp(row.totalacc));
                    },
                },
                {
                    title: vRoot.$t('reportForm.fuelConsumption100km') + '(L)',
                    render: function(h, pramas) {
                        var row = pramas.row;
                        var totaldistance = row.totaldistance;
                        var totaloil = row.totaloil / 100;
                        if (totaldistance && totaloil) {
                            totaldistance = totaldistance / 1000;
                            return h('sapn', {}, ((totaloil / totaldistance) * 100).toFixed(2));
                        } else {
                            return h('sapn', {}, '0');
                        }
                    },
                },
                {
                    title: vRoot.$t('reportForm.fuelConsumptionHour') + '(L)',
                    render: function(h, pramas) {
                        var row = pramas.row;
                        var totalacc = row.totalacc;
                        var totaloil = row.totaloil;
                        if (totalacc && totaloil) {
                            totalacc = totalacc / 1000 / 3600;
                            return h('sapn', {}, (totaloil / 100 / totalacc).toFixed(2));
                        } else {
                            return h('sapn', {}, '0');
                        }
                    },
                },

            ],
            tableData: [],
            oil: [],
            recvtime: [],
            chartDataList: [],
        },
        mixins: [treeMixin],
        methods: {
            onTimeRangeChange: function(timeRange) {
                this.dateTimeRangeVal = timeRange;
            },
            exportData: function() {

                var columns = deepClone(this.columns);
                var tableData = deepClone(this.tableData);
                columns.pop();
                columns.push({
                    title: isZh ? '地址' : 'Address',
                    key: 'saddress',
                })
                tableData.forEach(function(item) {
                    item.deviceid = '\t' + item.deviceid;
                    item.devicename = '\t' + item.devicename;
                    item.begintimeStr = '\t' + item.begintimeStr;
                    item.endtimeStr = '\t' + item.endtimeStr;
                });
                this.$refs.detailTable.exportCsv({
                    filename: vRoot.$t('reportForm.oilLeakageDetailed'),
                    original: false,
                    columns: columns,
                    data: tableData
                });


            },
            getChartsOption: function(deviceNames, oils, disArr, hours) {

                var dis = vRoot.$t('reportForm.mileage');
                var cotgas = vRoot.$t('reportForm.oilConsumption');
                var workingHours = vRoot.$t("reportForm.workingHours")

                return {
                    tooltip: {
                        trigger: 'axis',
                        formatter: function(v, a) {
                            var data = v[0].name + '<br/>';
                            for (i in v) {
                                if (v[i].seriesName == dis) {
                                    data += v[i].seriesName + ' : ' + v[i].value + 'Km<br/>';
                                } else if (v[i].seriesName == cotgas) {
                                    data += v[i].seriesName + ' : ' + v[i].value + 'L<br/>';
                                } else if (v[i].seriesName == workingHours) {
                                    data += v[i].seriesName + ' : ' + utils.timeStamp(v[i].value * 1000 * 3600) + '<br/>';
                                }
                            }
                            return data;
                        }
                    },
                    legend: {
                        data: [dis, cotgas, workingHours],
                        y: 13,
                        x: 'center'
                    },

                    grid: {
                        x: 100,
                        y: 40,
                        x2: 80,
                        y2: 30
                    },
                    xAxis: [{
                        type: 'category',
                        //boundaryGap : false,
                        axisLabel: {
                            show: true,
                            interval: 0, // {number}
                            rotate: 0,
                            margin: 8,
                            textStyle: {
                                fontSize: 12
                            }
                        },
                        data: deviceNames
                    }],
                    yAxis: [{
                        type: 'value',
                        position: 'bottom',
                        nameLocation: 'end',
                        boundaryGap: [0, 0.2],
                        axisLabel: {
                            formatter: '{value}'
                        }
                    }],
                    series: [{
                            name: dis,
                            type: 'bar',
                            itemStyle: {
                                //默认样式
                                normal: {
                                    label: {
                                        show: true,
                                        textStyle: {
                                            fontSize: '12',
                                            fontFamily: '微软雅黑',
                                            fontWeight: 'bold'
                                        }
                                    }
                                }
                                //悬浮式样式
                            },
                            data: disArr
                        },
                        {
                            name: cotgas,
                            type: 'bar',
                            itemStyle: {
                                //默认样式
                                normal: {
                                    label: {
                                        show: true,
                                        textStyle: {
                                            fontSize: '12',
                                            fontFamily: '微软雅黑',
                                            fontWeight: 'bold'
                                        }
                                    }
                                }
                            },
                            data: oils
                        },
                        {
                            name: workingHours,
                            type: 'bar',
                            itemStyle: {
                                //默认样式
                                normal: {
                                    label: {
                                        show: true,
                                        textStyle: {
                                            fontSize: '12',
                                            fontFamily: '微软雅黑',
                                            fontWeight: 'bold'
                                        }
                                    }
                                }
                            },
                            data: hours
                        },
                    ]
                };

            },

            calcTableHeight: function() {
                var wHeight = window.innerHeight;
                this.lastTableHeight = wHeight - 365;
            },
            onClickQuery: function() {
                var self = this;
                this.activeTab = 'tabTotal';
                var deviceids = [];
                this.checkedDevice.forEach(function(group) {
                    if (!group.children) {
                        if (group.deviceid != null) {
                            deviceids.push(group.deviceid);
                        }
                    }
                });

                if (deviceids.length == 0) {
                    this.$Message.error(this.$t('reportForm.selectDevTip'));
                    return;
                }


                var begintime = DateFormat.longToDateStr(this.startDate.getTime(), timeDifference) + ' ' + this.startTime;
                var endtime = DateFormat.longToDateStr(this.endDate.getTime(), timeDifference) + ' ' + this.endTime;

                if (new Date(begintime).getTime() > new Date(endtime).getTime()) {
                    this.$Message.error(this.$t('videoback.downloadTips3'));
                    return;
                }

                this.tableData = [];
                this.chartDataList = [];
                var data = {
                    // username: vstore.state.userName,
                    begintime: begintime,
                    endtime: endtime,
                    timezone: timeDifference,
                    devices: deviceids,
                };
                this.loading = true;
                utils.sendAjax(myUrls.reportOilManHour(), data, function(resp) {
                    self.loading = false;
                    if (resp.status == 0) {
                        if (resp.records) {
                            var chartDataList = [];
                            resp.records.forEach(function(item, index) {

                                item.index = index + 1;
                                item.devicename = vstore.state.deviceInfos[item.deviceid] ? vstore.state.deviceInfos[item.deviceid].devicename : item.deviceid;
                                if (index % 4 == 0) {
                                    chartDataList.push({
                                        data: [],
                                        oil: [],
                                        dis: [],
                                        hours: [],
                                    })
                                }
                                var len = chartDataList.length - 1;

                                chartDataList[len].data.push(item.devicename);
                                chartDataList[len].oil.push(item.totaloil / 100);
                                chartDataList[len].dis.push(Number((item.totaldistance / 1000).toFixed(2)));
                                chartDataList[len].hours.push(Number((item.totalacc / 1000 / 3600).toFixed(2)));

                            });

                            self.tableData = resp.records;
                            self.chartDataList = chartDataList;
                            console.log('chartDataList', chartDataList);

                            setTimeout(function() {
                                self.initCharts();
                            }, 300);
                        } else {
                            self.$Message.error(self.$t("reportForm.noRecord"));
                        }
                    } else {
                        self.$Message.error(resp.cause);
                    }
                })
            },
            queryDevicesTree: function() {
                var me = this;
                this.isSpin = true;
                GlobalOrgan.getInstance().getGlobalOrganData(function(rootuser) {
                    me.isSpin = false;
                    me.initZTree(rootuser);
                })
            },
            initCharts: function() {
                var index = 0;
                var len = this.chartDataList.length;
                while (index < len) {
                    var chartsIns = echarts.init(document.getElementById('charts' + index));
                    var data = this.chartDataList[index]
                    chartsIns.setOption(this.getChartsOption(data.data, data.oil, data.dis, data.hours));

                    // chartDataList[len].data.push(item.devicename);
                    // chartDataList[len].oil.push(item.totaloil);
                    // chartDataList[len].dis.push(item.totaldistance);
                    // chartDataList[len].hours.push(item.totalacc);

                    index++;
                }
            }
        },
        mounted: function() {
            this.myChart = null;
            this.records = [];
            this.queryDevicesTree();
        }
    });
}



function temperature(groupslist) {
    vueInstanse = new Vue({
        el: "#temperature",
        i18n: utils.getI18n(),
        data: {
            loading: false,
            groupslist: [],
            columns: [
                { title: vRoot.$t("reportForm.index"), type: 'index', width: 70 },
                { title: vRoot.$t("alarm.devName"), key: 'devicename', width: 110 },
                { title: vRoot.$t("reportForm.time"), key: 'updatetimeStr', sortable: true, width: 150 },
                { title: vRoot.$t("reportForm.speed"), key: 'speed', width: 80 },
                { title: vRoot.$t("reportForm.temp1"), key: 'temp1', width: 80 },
                { title: vRoot.$t("reportForm.temp2"), key: 'temp2', width: 80 },
                { title: vRoot.$t("reportForm.temp3"), key: 'temp3', width: 80 },
                { title: vRoot.$t("reportForm.temp4"), key: 'temp4', width: 80 },
                { title: vRoot.$t("reportForm.averageTemp"), key: 'averageTemp', width: 90 },
                { title: vRoot.$t("reportForm.humi"), key: 'humi1', width: 90 },
                { title: vRoot.$t("reportForm.status"), key: 'strstatus' },
                {
                    title: vRoot.$t("reportForm.lon") + ',' + vRoot.$t("reportForm.lat"),
                    render: function(h, params) {
                        var row = params.row;
                        var callat = row.callat.toFixed(5);
                        var callon = row.callon.toFixed(5);

                        if (callat && callon) {
                            if (row.address == null) {

                                return h('Button', {
                                    props: {
                                        type: 'error',
                                        size: 'small'
                                    },
                                    on: {
                                        click: function() {
                                            utils.getJiuHuAddressSyn(callon, callat, function(resp) {
                                                if (resp && resp.address) {
                                                    vueInstanse.tableData[params.index].address = resp.address;
                                                    LocalCacheMgr.setAddress(callon, callat, resp.address);
                                                }
                                            })
                                        }
                                    }
                                }, callon + "," + callat)

                            } else {
                                return h('Tooltip', {
                                    props: {
                                        content: row.address,
                                        placement: "top-start",
                                        maxWidth: 200
                                    },
                                }, [
                                    h('Button', {
                                        props: {
                                            type: 'primary',
                                            size: 'small'
                                        }
                                    }, callon + "," + callat)
                                ]);
                            }
                        } else {
                            return h('span', {}, '');
                        }
                    },
                },
            ],
            tableData: [],
            recvtime: [],
            veo: [],
            temp1: [],
            temp2: [],
            temp3: [],
            temp4: [],
            averageTemp: [],
            humi1s: [],
            currentIndex: 1,
        },
        mixins: [reportMixin],
        methods: {
            changePage: function(index) {
                var offset = index * 20;
                var start = (index - 1) * 20;
                this.currentPageIndex = index;
                this.tableData = this.records.slice(start, offset);
            },
            charts: function() {
                var speed = vRoot.$t("reportForm.speed");
                var time = vRoot.$t("reportForm.time");
                var temp = vRoot.$t("reportForm.temp");
                var temp1 = vRoot.$t("reportForm.temp1");
                var temp2 = vRoot.$t("reportForm.temp2");
                var temp3 = vRoot.$t("reportForm.temp3");
                var temp4 = vRoot.$t("reportForm.temp4");
                var averageTemp = vRoot.$t("reportForm.averageTemp");
                var humi1 = vRoot.$t("reportForm.humi");
                var option = {
                    title: {
                        text: speed + '/' + temp,
                        x: 'center',
                        textStyle: {
                            fontSize: 12,
                            fontWeight: 'bolder',
                            color: '#333'
                        }
                    },
                    grid: {
                        x: 50,
                        y: 40,
                        x2: 50,
                        y2: 40
                    },
                    tooltip: {
                        trigger: 'axis',
                        formatter: function(v) {
                            var data = time + ' : ' + v[0].name + '<br/>';
                            for (i in v) {
                                if (v[i].seriesName != time) {
                                    if (v[i].seriesName == speed) {
                                        data += v[i].seriesName + ' : ' + v[i].value + 'Km/h<br/>';
                                    } else {
                                        data += v[i].seriesName + ' : ' + v[i].value + '<br/>';
                                    }
                                }
                            }
                            return data;
                        }
                    },
                    legend: {
                        data: [temp1, temp2, temp3, temp4, averageTemp, humi1, speed],
                        x: 'left'
                    },
                    toolbox: {
                        show: true,
                        feature: {
                            magicType: { show: true, type: ['line', 'bar'] },
                            restore: { show: true },
                            saveAsImage: {
                                show: true
                            }
                        },
                        itemSize: 14
                    },
                    dataZoom: [{
                        show: true,
                        realtime: true,
                        start: 0,
                        end: 100,
                        height: 20,
                        backgroundColor: '#EDEDED',
                        fillerColor: 'rgb(54, 72, 96,0.5)',
                        bottom: 0
                    }, {
                        type: "inside",
                        realtime: true,
                        start: 0,
                        end: 100,
                        height: 20,
                        bottom: 0
                    }],
                    xAxis: [{
                        type: 'category',
                        boundaryGap: false,
                        axisLine: {
                            onZero: false
                        },
                        data: this.recvtime
                    }],
                    yAxis: [{
                        name: temp,
                        type: 'value',
                        nameTextStyle: 10,
                        nameGap: 5,
                        axisLabel: {
                            formatter: '{value}℃',
                        },

                    }, {
                        name: speed,
                        type: 'value',
                        nameTextStyle: 10,
                        nameGap: 2,

                        axisLabel: {
                            formatter: '{value} km',
                        },
                        axisTick: {
                            show: false
                        }
                    }],
                    series: [{
                            name: time,
                            type: 'line',
                            symbol: 'none',
                            xAxisIndex: 0,
                            color: '#F0805A',
                            smooth: true,
                            data: this.recvtime
                        }, {
                            name: speed,
                            type: 'line',
                            symbol: 'none',
                            yAxisIndex: 1,
                            smooth: true,
                            color: '#4876FF',
                            data: this.veo,
                        }, {
                            smooth: true,
                            name: temp1,
                            type: 'line',
                            symbol: 'none',
                            color: '#C1232B',
                            data: this.temp1,
                            yAxisIndex: 0,
                        }, {
                            //show:'false',
                            name: temp2,
                            type: 'line',
                            symbol: 'none',
                            color: '#8E388E',
                            data: this.temp2,
                            yAxisIndex: 0,
                            smooth: true,
                        },

                        {
                            smooth: true,
                            name: temp3,
                            type: 'line',
                            symbol: 'none',
                            color: '#FF4500',
                            data: this.temp3,
                            yAxisIndex: 0,
                        },
                        {
                            smooth: true,
                            name: temp4,
                            type: 'line',
                            symbol: 'none',
                            color: '#e4393c',
                            yAxisIndex: 0,
                            data: this.temp4
                        },
                        {
                            name: averageTemp,
                            type: 'line',
                            symbol: 'none',
                            yAxisIndex: 0,
                            color: '#3CB371',
                            smooth: true,
                            data: this.averageTemp
                        },
                        {
                            name: humi1,
                            type: 'line',
                            symbol: 'none',
                            yAxisIndex: 0,
                            color: '#9EEA6A',
                            smooth: true,
                            data: this.humi1s
                        },
                    ]
                };

                this.chartsIns.setOption(option);
            },
            calcTableHeight: function() {
                var wHeight = window.innerHeight;
                this.lastTableHeight = wHeight - 400;
            },
            onClickQuery: function() {
                if (this.queryDeviceId == "") { return };
                var self = this;
                if (this.isSelectAll === null) {
                    this.$Message.error(this.$t("reportForm.selectDevTip"));
                    return;
                };
                var data = {
                    // username: vstore.state.userName,
                    startday: this.dateVal[0],
                    endday: this.dateVal[1],
                    offset: timeDifference,
                    devices: [this.queryDeviceId],
                };
                this.loading = true;
                utils.sendAjax(myUrls.reportTempTime(), data, function(resp) {
                    self.loading = false;
                    if (resp.status == 0) {
                        if (resp.records) {
                            var records = [],
                                veo = [],
                                recvtime = [],
                                temp1 = [],
                                temp2 = [],
                                temp3 = [],
                                temp4 = [],
                                humi1s = [],
                                averageTemp = [];
                            resp.records.forEach(function(item, index) {
                                records = item.records;
                                var independent = item.independent === 0;
                                records.forEach(function(record) {
                                    var averageT = 0;
                                    var averageCount = 0;
                                    var callon = record.callon.toFixed(5);
                                    var callat = record.callat.toFixed(5);
                                    var address = LocalCacheMgr.getAddress(callon, callat);

                                    if (address != null) {
                                        record.address = address;
                                    } else {
                                        record.address = null;
                                    }

                                    record.updatetimeStr = DateFormat.longToDateTimeStr(record.updatetime, timeDifference);
                                    record.devicename = vstore.state.deviceInfos[self.queryDeviceId].devicename;

                                    if (record.temp1 != 0xffff) {
                                        record.temp1 = record.temp1 / 10
                                        averageT += record.temp1;
                                        averageCount++;
                                    } else {
                                        record.temp1 = '无';
                                    }
                                    if (record.temp2 != 0xffff) {
                                        record.temp2 = record.temp2 / 10
                                        averageT += record.temp2;
                                        averageCount++;
                                    } else {
                                        record.temp2 = '无';
                                    }
                                    if (record.temp3 != 0xffff) {
                                        record.temp3 = record.temp3 / 10
                                        averageT += record.temp3;
                                        averageCount++;
                                    } else {
                                        record.temp3 = '无';
                                    }
                                    if (record.temp4 != 0xffff) {
                                        record.temp4 = record.temp4 / 10
                                        averageT += record.temp4;
                                        averageCount++;
                                    } else {
                                        record.temp4 = '无';
                                    }
                                    if (record.humi1 > 0) {
                                        record.humi1 = (record.humi1 / 10).toFixed(1);
                                        humi1s.push(record.humi1)
                                    } else {
                                        record.humi1 = '无';
                                        humi1s.push(record.humi1);
                                    }

                                    veo.push((record.speed / 1000).toFixed(2));
                                    temp1.push(record.temp1)
                                    temp2.push(record.temp2)
                                    temp3.push(record.temp3)
                                    temp4.push(record.temp4)
                                    if (averageCount == 0) {
                                        averageTemp.push('无');
                                        record.averageTemp = '无';
                                    } else {
                                        var temp = (averageT / averageCount).toFixed(1);
                                        record.averageTemp = temp;
                                        averageTemp.push(temp);
                                    }
                                    recvtime.push(record.updatetimeStr);

                                });
                            });

                            self.veo = veo;
                            self.recvtime = recvtime;
                            self.temp1 = temp1;
                            self.temp2 = temp2;
                            self.temp3 = temp3;
                            self.temp4 = temp4;
                            self.humi1s = humi1s;
                            self.averageTemp = averageTemp;
                            self.records = records;
                            self.total = records.length;
                            records.sort(function(a, b) {
                                return b.updatetime - a.updatetime;
                            })
                            self.currentPageIndex = 1;
                            self.tableData = records.slice(0, 20);
                            self.charts();
                        } else {
                            self.$Message.error(self.$t("reportForm.noRecord"));
                        }
                    } else {
                        self.$Message.error(resp.cause);
                    }
                })
            },
            onSortChange: function(column) {

            }
        },
        mounted: function() {
            this.groupslist = groupslist;
            this.myChart = null;
            this.records = [];
            this.chartsIns = echarts.init(document.getElementById('charts'));
            this.charts();

        }
    });
}


function driverWorkDetails() {
    vueInstanse = new Vue({
        el: '#driver-work-details',
        i18n: utils.getI18n(),
        mixins: [treeMixin],
        data: {
            loading: false,
            isSpin: false,
            dateVal: [DateFormat.longToDateStr(Date.now(), timeDifference), DateFormat.longToDateStr(Date.now(), timeDifference)],
            lastTableHeight: 100,
            groupslist: [],
            timeoutIns: null,
            columns: [
                { key: 'index', width: 70, title: vRoot.$t("reportForm.index") },
                { title: vRoot.$t("alarm.devName"), key: 'devicename' },
                { title: vRoot.$t("alarm.devNum"), key: 'deviceid' },
                { title: vRoot.$t("reportForm.drivername"), key: 'drivername' },
                { title: vRoot.$t("reportForm.cardinsertTime"), key: 'uptimeStr', width: 150, },
                {
                    title: vRoot.$t("reportForm.cardinsertAddress"),
                    width: 145,
                    render: function(h, params) {
                        var row = params.row;
                        var lat = row.uplat;
                        var lon = row.uplon;
                        if (lat && lon) {
                            if (row.saddress == null) {

                                return h('Button', {
                                    props: {
                                        type: 'error',
                                        size: 'small'
                                    },
                                    on: {
                                        click: function() {
                                            utils.getJiuHuAddressSyn(lon, lat, function(resp) {
                                                if (resp && resp.address) {
                                                    vueInstanse.records[params.index].saddress = resp.address;
                                                    LocalCacheMgr.setAddress(lon, lat, resp.address);
                                                }
                                            })
                                        }
                                    }
                                }, lon + "," + lat)

                            } else {
                                return h('Tooltip', {
                                    props: {
                                        content: row.saddress,
                                        placement: "top-start",
                                        maxWidth: 200
                                    },
                                }, [
                                    h('Button', {
                                        props: {
                                            type: 'primary',
                                            size: 'small'
                                        }
                                    }, lon + "," + lat)
                                ]);
                            }
                        } else {
                            return h('span', {}, vRoot.$t("reportForm.empty"));
                        }
                    },
                },
                {
                    title: vRoot.$t("reportForm.cardPullTime"),
                    width: 150,
                    key: 'downtimeStr',
                },
                {
                    title: vRoot.$t("reportForm.cardPullAddress"),
                    width: 145,
                    render: function(h, params) {
                        var row = params.row;
                        var lat = row.downlat;
                        var lon = row.downlon;
                        if (lat != '0.00000' && lon != '0.00000') {
                            if (row.eaddress == null) {
                                return h('Button', {
                                    props: {
                                        type: 'error',
                                        size: 'small'
                                    },
                                    on: {
                                        click: function() {
                                            utils.getJiuHuAddressSyn(lon, lat, function(resp) {
                                                if (resp && resp.address) {
                                                    vueInstanse.records[params.index].eaddress = resp.address;
                                                    LocalCacheMgr.setAddress(lon, lat, resp.address);
                                                }
                                            })
                                        }
                                    }
                                }, lon + "," + lat)

                            } else {
                                return h('Tooltip', {
                                    props: {
                                        content: row.eaddress,
                                        placement: "top-start",
                                        maxWidth: 200
                                    },
                                }, [
                                    h('Button', {
                                        props: {
                                            type: 'primary',
                                            size: 'small'
                                        }
                                    }, lon + "," + lat)
                                ]);
                            }
                        } else {
                            return h('span', {}, vRoot.$t("reportForm.empty"));
                        }
                    },
                },
                {
                    title: vRoot.$t("reportForm.workingHours"),
                    key: 'workingHours',
                },
                {
                    title: vRoot.$t("reportForm.mileage") + '(km)',
                    key: 'mileage',
                },
                { title: vRoot.$t("reportForm.certificationcode"), key: 'certificationcode' },
                {
                    title: vRoot.$t("alarm.action"),
                    render: function(h, parmas) {
                        var viewTrack = vRoot.$t("reportForm.viewTrack");
                        return h(
                            'Button', {
                                on: {
                                    click: function() {
                                        vueInstanse.queryTracks(parmas.row);
                                    }
                                },
                                props: {
                                    size: 'small',
                                    type: 'info'
                                }
                            },
                            viewTrack
                        )
                    },
                },
            ],
            tableData: [],
            currentIndex: 1,
            trackDetailModal: false,
            deviceName: '',
        },
        methods: {
            queryAllAddress: function() {
                var records = this.records;
                records.forEach(function(item) {
                    if (item.saddress == null) {
                        var uplat = Number(item.uplat);
                        var uplon = Number(item.uplon);
                        if (uplat && uplon) {
                            utils.getJiuHuAddressSyn(uplon, uplat, function(resp) {
                                if (resp && resp.address) {
                                    item.saddress = resp.address;
                                    LocalCacheMgr.setAddress(uplon, uplat, resp.address);
                                }
                            })
                        }
                    }
                    if (item.eaddress == null) {
                        var downlat = Number(item.downlat);
                        var downlon = Number(item.downlon);
                        if (downlat && downlon) {
                            utils.getJiuHuAddressSyn(downlon, downlat, function(resp) {
                                if (resp && resp.address) {
                                    item.eaddress = resp.address;
                                    LocalCacheMgr.setAddress(downlon, downlat, resp.address);
                                }
                            })
                        }
                    }
                });

                this.$Message.success(this.$t('monitor.querySucc'));
            },
            exportTableData: function() {
                var columns = deepClone(this.columns);
                var records = deepClone(this.records);
                columns.splice(5, 1, { title: vRoot.$t("reportForm.cardinsertAddress"), key: 'saddress' });
                columns.splice(7, 1, { title: vRoot.$t("reportForm.cardPullAddress"), key: 'eaddress' });
                columns.pop();
                records.forEach(function(item) {
                    if (item.saddress == null) {
                        item.saddress = item.uplat + "," + item.uplon;
                    }
                    if (item.eaddress == null) {
                        item.eaddress = '';
                    }
                    item.deviceid = "\t" + item.deviceid;
                    item.devicename = "\t" + item.devicename;
                    item.certificationcode = "\t" + item.certificationcode;
                    item.downtimeStr = "\t" + item.downtimeStr;
                    item.uptimeStr = "\t" + item.uptimeStr;
                });
                this.$refs.table.exportCsv({
                    filename: vRoot.$t("reportForm.driverWorkDetails"),
                    columns: columns,
                    data: records,
                    original: false,
                    quoted: true,
                });
            },
            initMap: function() {
                this.markerLayer = null;
                this.mapInstance = utils.initWindowMap('work-details-map');
            },

            cleanSelected: function(treeDataFilter) {
                var that = this;
                for (var i = 0; i < treeDataFilter.length; i++) {
                    var item = treeDataFilter[i];
                    if (item != null) {
                        item.checked = false;
                        if (item.children && item.children.length > 0) {
                            that.cleanSelected(item.children);
                        }
                    }
                }
            },
            queryTracks: function(row) {
                this.mapInstance.clearOverlays();
                var url = myUrls.queryTracks(),
                    me = this,
                    data = {
                        deviceid: row.deviceid,
                        begintime: row.uptimeStr,
                        endtime: row.downtimeStr,
                        interval: 60,
                        timezone: timeDifference
                    };
                if (row.downtime <= 0) {
                    data.endtime = DateFormat.longToDateTimeStr(row.uptime + 60000, timeDifference)
                }
                utils.sendAjax(url, data, function(respData) {
                    if (respData.status === 0) {
                        var records = respData.records;
                        if (records && records.length) {
                            me.trackDetailModal = true;
                            utils.markersAndLineLayerToMap(me, records);
                        } else {
                            me.$Message.error(vRoot.$t("reportForm.noRecord"));
                        }
                    } else {
                        me.$Message.error(vRoot.$t("reportForm.queryFail"));
                    }

                });
            },
            setViewPortCenter: function(lines) {
                var me = this;
                setTimeout(function() {
                    var view = me.mapInstance.getViewport(eval(lines));
                    var mapZoom = view.zoom;
                    var centerPoint = view.center;
                    me.mapInstance.centerAndZoom(centerPoint, mapZoom);
                }, 300)
            },
            getBdPoints: function(records) {
                var points = [];
                records.forEach(function(item) {
                    var lon_lat = wgs84tobd09(item.callon, item.callat);
                    points.push(new BMap.Point(lon_lat[0], lon_lat[1]));
                });
                return points;
            },
            changePage: function(index) {
                var offset = index * 20;
                var start = (index - 1) * 20;
                this.currentIndex = index;
                this.tableData = this.records.slice(start, offset);
            },
            calcTableHeight: function() {
                var wHeight = window.innerHeight;
                this.lastTableHeight = wHeight - 210;
            },
            onClickQuery: function() {
                var deviceids = [];
                this.checkedDevice.forEach(function(group) {
                    if (!group.children) {
                        if (group.deviceid != null) {
                            deviceids.push(group.deviceid);
                        }
                    }
                });
                if (deviceids.length > 0) {
                    var me = this;
                    var url = myUrls.reportDriverRecords();
                    var data = {
                        startday: this.dateVal[0],
                        endday: this.dateVal[1],
                        offset: timeDifference,
                        deviceids: deviceids
                    }
                    me.loading = true;
                    utils.sendAjax(url, data, function(resp) {
                        console.log(resp);
                        me.loading = false;
                        if (resp.status === 0) {
                            if (resp.records.length) {
                                var records = [],
                                    index = 1;
                                resp.records.forEach(function(item) {
                                    item.records.forEach(function(item) {
                                        item.index = index;
                                        var callat = item.uplat = item.uplat.toFixed(5);
                                        var callon = item.uplon = item.uplon.toFixed(5);
                                        var saddress = LocalCacheMgr.getAddress(callon, callat);
                                        if (saddress != null) {
                                            item.saddress = saddress;
                                        } else {
                                            item.saddress = null;
                                        };
                                        var elat = item.downlat = item.downlat.toFixed(5);
                                        var elon = item.downlon = item.downlon.toFixed(5);
                                        var eaddress = LocalCacheMgr.getAddress(elon, elat);
                                        if (eaddress != null) {
                                            item.eaddress = eaddress;
                                        } else {
                                            item.eaddress = null;
                                        };
                                        item.devicename = vstore.state.deviceInfos[item.deviceid] ? vstore.state.deviceInfos[item.deviceid].devicename : item.deviceid;
                                        item.uptimeStr = DateFormat.longToDateTimeStr(item.uptime, timeDifference);
                                        item.downtimeStr = item.downtime == 0 ? '无' : DateFormat.longToDateTimeStr(item.downtime, timeDifference);
                                        item.workingHours = item.downtime == 0 ? '无' : utils.timeStamp(item.downtime - item.uptime, isZh);
                                        item.mileage = item.downdistance == 0 ? '无' : ((item.downdistance - item.updistance) / 1000).toFixed(2);
                                        if (!item.certificationcode) {
                                            item.certificationcode = '无';
                                        }
                                        records.push(item);
                                        index++;

                                    })
                                });
                                me.records = records.sort(function(a, b) { return b.uptime - a.uptime });
                                me.tableData = records.slice(0, 20);
                                me.total = me.records.length;

                            } else {
                                me.tableData = [];
                                me.total = 1;
                                me.records = [];
                            };
                            me.currentIndex = 1;
                        } else {
                            me.tableData = [];
                        }
                    })
                } else {
                    this.$Message.error(this.$t("reportForm.selectDevTip"));
                }
            },
            queryDevicesTree: function() {
                var me = this;
                this.isSpin = true;
                GlobalOrgan.getInstance().getGlobalOrganData(function(rootuser) {
                    me.isSpin = false;
                    me.initZTree(rootuser);
                })
            },
        },
        mounted: function() {
            var me = this;
            me.records = [];
            me.initMap();
            this.queryDevicesTree();
            this.calcTableHeight();
            window.onresize = function() {
                me.calcTableHeight();
            }
        }
    })
}


function ioReport(groupslist) {
    vueInstanse = new Vue({
        el: '#io-record',
        i18n: utils.getI18n(),
        mixins: [treeMixin],
        data: {
            isSpin: false,
            activeTab: 'tabTotal',
            ioType: [1, 2, 3, 4],
            mapModal: false,
            mapType: utils.getMapType(),
            mapInstance: null,
            markerIns: null,
            loading: false,
            dateVal: [DateFormat.longToDateStr(Date.now(), timeDifference), DateFormat.longToDateStr(Date.now(), timeDifference)],
            lastTableHeight: 100,
            groupslist: [],
            timeoutIns: null,
            allIoColumns: [
                { title: vRoot.$t("reportForm.index"), width: 70, key: 'index' },
                {
                    title: vRoot.$t("alarm.action"),
                    width: 160,
                    render: function(h, params) {
                        return h('span', {
                            on: {
                                click: function() {
                                    vueInstanse.activeTab = "tabDetail";
                                    vueInstanse.getIoDetailTableData(params.row.records);
                                }
                            },
                            style: {
                                color: '#e4393c',
                                cursor: 'pointer'
                            }
                        }, "[" + vRoot.$t("reportForm.ioDetailed") + "]")
                    }
                },
                {
                    title: vRoot.$t("alarm.devName"),
                    key: 'devicename'
                },
                {
                    title: vRoot.$t("alarm.devNum"),
                    key: 'deviceid',
                },
                {
                    title: vRoot.$t("reportForm.ioIndex"),
                    key: 'ioindex',
                },
                { title: vRoot.$t("reportForm.ioname"), key: 'ioname', width: 100 },
                {
                    title: vRoot.$t("reportForm.openCount"),
                    key: 'opennumber',
                },
                {
                    title: vRoot.$t("reportForm.openDuration"),
                    key: 'duration'
                }
            ],
            allIoTableData: [],
            columns: [
                { title: vRoot.$t("reportForm.index"), width: 70, key: 'index' },
                { title: vRoot.$t("alarm.devName"), key: 'deviceName', width: 100 },
                { title: vRoot.$t("alarm.devNum"), key: 'deviceid', width: 120 },
                { title: vRoot.$t("reportForm.ioIndex"), key: 'ioindex', width: 100 },
                { title: vRoot.$t("reportForm.ioname"), key: 'ioname', width: 100 },
                { title: vRoot.$t("reportForm.startDate"), key: 'startDate', width: 150 },
                { title: vRoot.$t("reportForm.endDate"), key: 'endDate', width: 150 },
                { title: vRoot.$t("reportForm.minMileage") + "(km)", key: 'sdistance' },
                { title: vRoot.$t("reportForm.maxMileage") + "(km)", key: 'edistance' },
                { title: vRoot.$t("reportForm.duration"), key: 'duration' },
                {
                    title: '地图',
                    width: 125,
                    render: function(h, params) {
                        var row = params.row;
                        if (row.elat) {
                            return h(
                                'Button', {
                                    on: {
                                        click: function() {
                                            vueInstanse.queryTracks(row);
                                        }
                                    }
                                },
                                '查看地图');
                        } else {
                            return h('span', {}, '');
                        }
                    }
                },
            ],
            tableData: [],
        },
        methods: {
            getBdPoints: function(records) {
                var points = [];
                records.forEach(function(item) {
                    var lon_lat = wgs84tobd09(item.callon, item.callat);
                    points.push(new BMap.Point(lon_lat[0], lon_lat[1]));
                });
                return points;
            },
            queryTracks: function(row) {
                var url = myUrls.queryTracks(),
                    me = this,
                    data = {
                        deviceid: row.deviceid,
                        begintime: row.startDate,
                        endtime: row.endDate,
                        interval: 5,
                        timezone: timeDifference
                    };
                if (row.downtime <= 0) {
                    data.endtime = DateFormat.longToDateTimeStr(row.uptime + 60000, timeDifference)
                }
                utils.sendAjax(url, data, function(respData) {
                    if (respData.status === 0) {
                        var records = respData.records;

                        if (records && records.length > 0) {
                            utils.markersAndLineLayerToMap(me, records)
                            me.mapModal = true;
                        } else {
                            me.$Message.error(vRoot.$t("reportForm.noRecord"));
                        }
                    } else {
                        me.$Message.error(vRoot.$t("reportForm.queryFail"));
                    }

                });
            },
            getLineFeature: function(tracksList) {
                var arrayList = [];
                tracksList.forEach(function(track) {
                    arrayList.push(ol.proj.fromLonLat([track.callon, track.callat]));
                });
                return new ol.Feature(new ol.geom.LineString(arrayList));
            },
            setViewPortCenter: function(lines) {
                var me = this;
                setTimeout(function() {
                    var view = me.mapInstance.getViewport(eval(lines));
                    var mapZoom = view.zoom;
                    var centerPoint = view.center;
                    me.mapInstance.centerAndZoom(centerPoint, mapZoom);
                }, 300)
            },
            getFirstMarkerIcon: function(isStart) {
                var iconName = isStart ? 'marker_qidian.png' : 'marker_zhongdian.png';
                var pathname = location.pathname
                var imgPath = '';
                if (utils.isLocalhost()) {
                    imgPath = myUrls.viewhost + 'images/map/' + iconName;
                } else {
                    imgPath = '../images/map/' + iconName;
                };
                if (utils.getMapType() == 'bMap') {
                    return new BMap.Icon("./images/map/" + iconName, new BMap.Size(32, 32), {
                        imageOffset: new BMap.Size(0, 0)
                    });
                } else if (utils.getMapType() == 'gMap') {
                    return imgPath;
                } else {
                    return new ol.style.Style({
                        image: new ol.style.Icon(({
                            crossOrigin: 'anonymous',
                            src: imgPath,
                            rotation: 0, //角度转化为弧度
                            imgSize: [32, 32]
                        }))
                    });
                }
            },
            initMap: function() {
                this.markerLayer = null;
                this.mapInstance = utils.initWindowMap('posi-map');
            },
            onIoChange: function(list) {
                this.ioType = list;
            },
            exportData: function() {
                var startday = this.dateVal[0];
                var endday = this.dateVal[1];
                if (this.activeTab == "tabTotal") {
                    if (this.allIoTableData.length) {
                        this.$refs.totalTable.exportCsv({
                            filename: "io-total" + startday + '-' + endday,
                            original: false,
                            columns: this.allIoColumns.filter(function(col, index) { return index != 1; }),
                            data: this.allIoTableData
                        });
                    }
                } else {
                    if (this.tableData.length) {
                        this.$refs.detailTable.exportCsv({
                            filename: "io-details" + startday + '-' + endday,
                            original: false,
                            columns: this.columns.filter(function(col, index) { return index != 10; }),
                            data: this.tableData
                        });
                    }
                }
            },

            cleanSelected: function(treeDataFilter) {
                var that = this;
                for (var i = 0; i < treeDataFilter.length; i++) {
                    var item = treeDataFilter[i];
                    if (item != null) {
                        item.checked = false;
                        if (item.children && item.children.length > 0) {
                            that.cleanSelected(item.children);
                        }
                    }
                }
            },
            onClickTab: function(name) {
                this.activeTab = name;
            },
            onChange: function(value) {
                this.dateVal = value;
            },
            calcTableHeight: function() {
                var wHeight = window.innerHeight;
                this.lastTableHeight = wHeight - 220;
            },
            onClickQuery: function() {
                var deviceids = [];
                this.checkedDevice.forEach(function(group) {
                    if (!group.children) {
                        if (group.deviceid != null) {
                            deviceids.push(group.deviceid);
                        }
                    }
                });
                if (deviceids.length) {
                    var me = this;
                    var url = myUrls.reportIoStates();
                    var data = {
                        startday: this.dateVal[0],
                        endday: this.dateVal[1],
                        offset: timeDifference,
                        deviceids: deviceids,
                        ioindexs: this.ioType.map(function(item) { return Number(item) })
                    }
                    me.loading = true;
                    utils.sendAjax(url, data, function(resp) {
                        me.loading = false;
                        if (resp.status == 0) {
                            if (resp.records && resp.records.length) {
                                me.tableData = [];
                                me.allIoTableData = me.getAllIoTableData(resp.records);
                            } else {
                                me.tableData = [];
                                me.allIoTableData = [];
                                me.$Message.error(me.$t("reportForm.noRecord"));
                            }
                        } else {
                            me.tableData = [];
                            me.allIoTableData = [];
                        }
                        if (me.activeTab != "tabTotal") {
                            me.onClickTab("tabTotal");
                        }
                    });
                } else {
                    this.$Message.error(this.$t("reportForm.selectDevTip"));
                }
            },
            getAllIoTableData: function(records) {
                var allIoTableData = [],
                    me = this;
                records.forEach(function(item, index) {
                    var ioname = '';
                    var opennumber = 0;
                    var accObj = {
                            index: index + 1,
                            deviceid: "\t" + item.deviceid,
                            opennumber: 0,
                            duration: "",
                            devicename: vstore.state.deviceInfos[item.deviceid].devicename,
                            records: item.records,
                            ioindex: item.ioindex,
                        },
                        duration = 0;
                    item.records.forEach(function(device) {
                        if (device.iostate == 1) {
                            duration += (device.endtime - device.begintime);
                            ioname = device.ioname;
                            opennumber++;
                        }
                    });
                    accObj.ioname = ioname;
                    accObj.opennumber = opennumber;
                    accObj.duration = utils.timeStamp(duration);
                    allIoTableData.push(accObj);
                });
                return allIoTableData;
            },
            getIoDetailTableData: function(records) {
                var newRecords = [],
                    me = this;
                var ioOpenTime = 0;
                var ioCloseTime = 0;
                var openName = '';
                var closeName = '';
                records.sort(function(a, b) {
                    return a.begintime - b.begintime;
                });
                records.forEach(function(item, index) {
                    var deviceName = vstore.state.deviceInfos[item.deviceid].devicename;
                    var duration = item.endtime - item.begintime;
                    var durationStr = utils.timeStamp(duration);
                    if (item.iostate == 1) {
                        openName = item.ioname;
                        ioOpenTime += duration;
                    } else {
                        closeName = item.ioname;
                        ioCloseTime += duration;
                    }
                    newRecords.push({
                        index: index + 1,
                        ioindex: item.ioindex,
                        deviceid: item.deviceid,
                        deviceName: deviceName,
                        startDate: DateFormat.longToDateTimeStr(item.begintime, timeDifference),
                        endDate: DateFormat.longToDateTimeStr(item.endtime, timeDifference),
                        sdistance: (item.sdistance / 1000).toFixed(2),
                        edistance: (item.edistance / 1000).toFixed(2),
                        ioname: item.ioname,
                        duration: durationStr,
                        slon: item.slon,
                        slat: item.slat,
                        elon: item.elon,
                        elat: item.elat,
                        iostate: item.iostate
                    });
                });
                newRecords.push({
                    duration: openName + ':' + utils.timeStamp(ioOpenTime) + "," + closeName + ":" + utils.timeStamp(ioCloseTime)
                })
                me.tableData = newRecords;
            },
            queryDevicesTree: function() {
                var me = this;
                this.isSpin = true;
                GlobalOrgan.getInstance().getGlobalOrganData(function(rootuser) {
                    me.isSpin = false;
                    me.initZTree(rootuser);
                })
            },
        },
        mounted: function() {
            var me = this;
            this.queryDevicesTree();
            this.calcTableHeight();
            this.initMap();
            window.onresize = function() {
                me.calcTableHeight();
            }
        }
    })

}


function multiMedia() {
    vueInstanse = new Vue({
        el: '#multi-media',
        i18n: utils.getI18n(),
        mixins: [treeMixin],
        data: {
            loading: false,
            isSpin: false,
            dateVal: [DateFormat.longToDateStr(Date.now(), timeDifference), DateFormat.longToDateStr(Date.now(), timeDifference)],
            lastTableHeight: 100,
            groupslist: [],
            timeoutIns: null,
            columns: [
                { key: 'index', width: 70, title: vRoot.$t("reportForm.index") },
                { title: vRoot.$t("alarm.devName"), key: 'devicename' },
                { title: vRoot.$t("alarm.devNum"), key: 'deviceid' },
                {
                    title: vRoot.$t("alarm.fileType"),
                    key: 'fileext',
                    width: 100,
                },
                {
                    title: vRoot.$t("monitor.channel"),
                    key: 'channelid',
                    width: 80,
                },
                {
                    title: vRoot.$t("alarm.alarmType"),
                    key: 'eventcodeStr',
                    width: 150,
                },
                {
                    title: vRoot.$t("alarm.receivingTime"),
                    key: 'endtimeStr',
                    width: 150,
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
                    width: 175,
                    render: function(h, parmas) {
                        return h(
                            'div', {}, [
                                h(
                                    'Button', {
                                        on: {
                                            click: function(e) {
                                                e.stopPropagation();
                                                e.preventDefault();
                                                vueInstanse.viewMap(parmas.row);
                                            }
                                        },
                                        props: {
                                            size: 'small',
                                            type: 'info'
                                        }
                                    },
                                    isZh ? '查看地图' : "View map"
                                ),
                                h(
                                    'Button', {
                                        style: {
                                            marginLeft: '5px'
                                        },
                                        on: {
                                            click: function(e) {
                                                vueInstanse.onRowClick(parmas.row);
                                            }
                                        },
                                        props: {
                                            type: "primary",
                                            size: 'small',
                                        }
                                    },
                                    vRoot.$t('reportForm.viewPicture')
                                ),
                            ]
                        );
                    },
                },
            ],
            tableData: [],
            currentIndex: 1,
            trackDetailModal: false,
            deviceName: '',
            cameraImgModal: false,
            cameraImgUrl: '',
        },
        methods: {
            onClickCameraDownload: function() {
                this.cameraImgUrl && window.open(this.cameraImgUrl);
            },
            queryAllAddress: function() {
                var records = this.records;
                records.forEach(function(item) {
                    if (item.address == null) {
                        var uplat = Number(item.callat);
                        var uplon = Number(item.callon);
                        if (uplat && uplon) {
                            utils.getJiuHuAddressSyn(uplon, uplat, function(resp) {
                                if (resp && resp.address) {
                                    item.address = resp.address;
                                    LocalCacheMgr.setAddress(uplon, uplat, resp.address);
                                }
                            })
                        }
                    }
                });

                this.$Message.success(this.$t('monitor.querySucc'));
            },
            exportTableData: function() {
                var columns = deepClone(this.columns);
                var records = deepClone(this.records);
                columns.pop();
                this.$refs.table.exportCsv({
                    filename: vRoot.$t('reportForm.multiMedia'),
                    columns: columns,
                    data: records,
                    original: false,
                    quoted: true,
                });
            },
            initMap: function() {
                this.markerLayer = null;
                this.mapInstance = utils.initWindowMap('work-details-map');
            },

            cleanSelected: function(treeDataFilter) {
                var that = this;
                for (var i = 0; i < treeDataFilter.length; i++) {
                    var item = treeDataFilter[i];
                    if (item != null) {
                        item.checked = false;
                        if (item.children && item.children.length > 0) {
                            that.cleanSelected(item.children);
                        }
                    }
                }
            },
            viewMap: function(row) {
                utils.showWindowMap(this, row)
                this.trackDetailModal = true;
            },
            getFirstMarkerIcon: function(isStart) {
                var iconName = isStart ? 'marker_qidian.png' : 'marker_zhongdian.png';
                var imgPath = '';
                if (utils.isLocalhost()) {
                    imgPath = myUrls.viewhost + 'images/map/' + iconName;
                } else {
                    imgPath = '../images/map/' + iconName;
                };
                if (utils.getMapType() == 'bMap') {
                    return new BMap.Icon("./images/map/" + iconName, new BMap.Size(32, 32), {
                        imageOffset: new BMap.Size(0, 0)
                    });
                } else if (utils.getMapType() == 'gMap') {
                    return imgPath;
                } else {
                    return new ol.style.Style({
                        image: new ol.style.Icon(({
                            crossOrigin: 'anonymous',
                            src: imgPath,
                            rotation: 0, //角度转化为弧度
                            imgSize: [32, 32]
                        }))
                    });
                }
            },
            changePage: function(index) {
                var offset = index * 20;
                var start = (index - 1) * 20;
                this.currentIndex = index;
                this.tableData = this.records.slice(start, offset);
            },
            calcTableHeight: function() {
                var wHeight = window.innerHeight;
                this.lastTableHeight = wHeight - 210;
            },
            onClickQuery: function() {
                var deviceids = [];
                this.checkedDevice.forEach(function(group) {
                    if (!group.children) {
                        if (group.deviceid != null) {
                            deviceids.push(group.deviceid);
                        }
                    }
                });
                if (deviceids.length > 0) {
                    var me = this;
                    var url = myUrls.reportMultiMedias();
                    var data = {
                        startday: this.dateVal[0],
                        endday: this.dateVal[1],
                        offset: timeDifference,
                        deviceids: deviceids
                    }
                    me.loading = true;
                    utils.sendAjax(url, data, function(resp) {
                        console.log(resp);
                        me.loading = false;
                        if (resp.status === 0) {
                            if (resp.records.length) {
                                var records = [],
                                    index = 1;
                                resp.records.forEach(function(item) {
                                    item.records.forEach(function(item) {
                                        item.index = index;
                                        item.callat = Number(item.callat.toFixed(5));
                                        item.callon = Number(item.callon.toFixed(5));
                                        item.address = LocalCacheMgr.getAddress(item.callon, item.callat);
                                        item.devicename = vstore.state.deviceInfos[item.deviceid] ? vstore.state.deviceInfos[item.deviceid].devicename : item.deviceid;
                                        item.endtimeStr = DateFormat.longToDateTimeStr(item.endtime, timeDifference);
                                        item.eventcodeStr = me.getEventcodeStr(item);
                                        records.push(item);
                                        index++;
                                    })
                                });
                                me.records = records;
                                me.tableData = records.slice(0, 20);
                                me.total = me.records.length;

                            } else {
                                me.tableData = [];
                                me.total = 1;
                                me.records = [];
                            };
                            me.currentIndex = 1;
                        } else {
                            me.tableData = [];
                        }
                    })
                } else {
                    this.$Message.error(this.$t("reportForm.selectDevTip"));
                }
            },
            getEventcodeStr: function(row) {
                var eventcode = row.eventcode;
                var str = '';
                switch (eventcode) {
                    case 0:
                        str = vRoot.$t("alarm.terraceIssued");
                        break;
                    case 1:
                        str = vRoot.$t("alarm.timingAction");
                        break;
                    case 2:
                        str = vRoot.$t("alarm.robberyReport");
                        break;
                    case 3:
                        str = vRoot.$t("alarm.impactRollover");
                        break;
                    default:
                        str = vRoot.$t("alarm.retain");
                }
                return str;
            },
            queryDevicesTree: function() {
                var me = this;
                this.isSpin = true;
                GlobalOrgan.getInstance().getGlobalOrganData(function(rootuser) {
                    me.isSpin = false;
                    me.initZTree(rootuser);
                })
            },
            onRowClick: function(row) {
                this.cameraImgModal = true;
                this.cameraImgUrl = row.url;
            }
        },
        mounted: function() {
            var me = this;
            me.records = [];
            me.initMap();
            this.queryDevicesTree();
            this.calcTableHeight();
            window.onresize = function() {
                me.calcTableHeight();
            }
        }
    })
}




function reportNav(reportNavList) {
    vueInstanse = new Vue({
        el: "#report-nav",
        data: {
            search: isZh ? '搜索' : 'search',
            reportNavList: reportNavList,
            sosoValue: '',
            selectedName: '',
        },
        methods: {
            handleSearch: function() {
                for (var i = 0; i < this.reportNavList.length; i++) {
                    var children = this.reportNavList[i].children
                    for (var j = 0; j < children.length; j++) {
                        var title = children[j].title;
                        if (title.indexOf(this.sosoValue) > -1) {
                            this.selectedName = children[j].name;
                            return;
                        }
                    }
                }
                this.selectedName = "";
            },
            selectdItem: function(name) {
                var vIns = vRoot.$children[3];
                vIns.activeName = name;
                vIns.openedNames = this.getOpenedNames(name);
                vIns.selectditem(name);
                vIns.$nextTick(function() {
                    vIns.$refs.navMenu.updateOpened();
                });
            },
            getOpenedNames: function(sName) {
                var openedNames = [];
                for (var i = 0; i < this.reportNavList.length; i++) {
                    var gName = this.reportNavList[i].name;
                    var children = this.reportNavList[i].children
                    for (var j = 0; j < children.length; j++) {
                        if (children[j].name == sName) {
                            openedNames.push(gName);
                            break;
                        }
                    }
                }
                return openedNames;
            }
        },
        mounted: function() {

        }
    })
}


// 统计报表
var reportForm = {
    template: document.getElementById('report-template').innerHTML,
    data: function() {
        var me = this;
        return {
            theme: "light",
            groupslist: [],
            activeName: "reportNav",
            openedNames: [],
            reportNavList: [{
                    title: me.$t("reportForm.menu"),
                    name: 'reportNav',
                    icon: 'ios-stats',
                },
                {
                    title: me.$t("reportForm.drivingReport"),
                    name: 'drivingReport',
                    icon: 'ios-photos',
                    children: [
                        { title: me.$t("reportForm.cmdReport"), name: 'cmdReport', icon: 'ios-pricetag-outline' },
                        { title: me.$t("reportForm.posiReport"), name: 'posiReport', icon: 'ios-pin' },
                        { title: me.$t("reportForm.reportmileagesummary"), name: 'groupMileage', icon: 'md-globe' },
                        { title: me.$t("reportForm.mileageMonthReport"), name: 'mileageMonthReport', icon: 'ios-basket-outline' },
                        { title: me.$t("reportForm.reportmileagedetail"), name: 'mileageDetail', icon: 'ios-color-wand' },
                        { title: me.$t("reportForm.parkDetails"), name: 'parkDetails', icon: 'md-analytics' },
                        { title: me.$t("reportForm.acc"), name: 'accDetails', icon: 'md-bulb' },
                        { title: me.$t("reportForm.voiceReport"), name: 'records', icon: 'md-volume-up' },
                        { title: me.$t("reportForm.messageReport"), name: 'messageRecords', icon: 'ios-book' },
                        { title: me.$t("reportForm.rotationStatistics"), name: 'rotateReport', icon: 'ios-aperture' },
                        { title: me.$t("reportForm.ioReport"), name: 'ioReport', icon: 'md-contrast' },
                    ]
                },
                {
                    title: me.$t("reportForm.warningReport"),
                    name: 'warningReport',
                    icon: 'logo-wordpress',
                    children: [
                        { title: me.$t("reportForm.allAlarm"), name: 'allAlarm', icon: 'md-warning' },
                        { title: me.$t("reportForm.phoneAlarm"), name: 'phoneAlarm', icon: 'ios-call' },
                        { title: me.$t("reportForm.wechatAlarm"), name: 'wechatAlarm', icon: 'md-ionitron' },
                        { title: me.$t("reportForm.rechargeRecords"), name: 'rechargeRecords', icon: 'ios-list-box-outline' },
                        { title: me.$t("reportForm.speedingReport"), name: 'speedingReport', icon: 'md-remove-circle' },
                        { title: me.$t('reportForm.multiMedia'), name: 'multiMedia', icon: 'ios-ionitron-outline' },
                    ]
                },
                {
                    title: me.$t("reportForm.onlineStatistics"),
                    name: 'operateReport',
                    icon: 'md-stats',
                    children: [
                        { title: me.$t("reportForm.comprehensiveStatistics"), name: 'reportOnlineSummary', icon: 'md-sunny' },
                        { title: me.$t("reportForm.offlineReport"), name: 'dropLineReport', icon: 'ios-git-pull-request' },
                        { title: me.$t("reportForm.dailyVehicleOnlineRate"), name: 'deviceOnlineDaily', icon: 'md-bulb' },
                        { title: me.$t("reportForm.dailyFleetOnlineRate"), name: 'groupsOnlineDaily', icon: 'md-contacts' },
                        { title: me.$t("reportForm.monthlyVehicleOnlineRate"), name: 'deviceMonthOnlineDaily', icon: 'md-contrast' },
                        { title: me.$t("reportForm.newAddedDeviceReport"), name: 'newEquipmentReport', icon: 'md-add' },
                        { title: me.$t("reportForm.deviceTypeDistribution"), name: 'deviceTypeDistribution', icon: 'ios-git-merge' },
                        { title: me.$t("reportForm.onlineStatisticsDay"), name: 'onlineStatisticsDay', icon: 'ios-trending-up' },
                    ]
                },
                {
                    title: me.$t("reportForm.oilReport"),
                    name: 'oilConsumption',
                    icon: 'ios-speedometer-outline',
                    children: [
                        { title: me.$t("reportForm.dayOilConsumption"), name: 'dayOil', icon: 'ios-stopwatch-outline' },
                        { title: me.$t("reportForm.dateOilConsumption"), name: 'timeOilConsumption', icon: 'ios-timer-outline' },
                        { title: me.$t("reportForm.addOil"), name: 'refuelingReport', icon: 'ios-trending-up' },
                        { title: me.$t("reportForm.reduceOil"), name: 'oilLeakageReport', icon: 'ios-trending-down' },
                        { title: me.$t("reportForm.oilWorkingHours"), name: 'oilWorkingHours', icon: 'ios-appstore-outline' },
                    ]
                },
                {
                    title: me.$t("reportForm.weightReport"),
                    name: 'weightReport',
                    icon: 'md-keypad',
                    children: [
                        { title: me.$t("reportForm.timeWeightConsumption"), name: 'timeWeightConsumption', icon: 'ios-timer-outline' },
                        { title: me.$t("reportForm.weightSummary"), name: 'weightSummary', icon: 'ios-bus-outline' },
                    ]
                },
                {
                    title: me.$t("reportForm.tempReport"),
                    name: 'temperatureConsumption',
                    icon: 'ios-color-wand-outline',
                    children: [
                        { title: me.$t("reportForm.temperatureChart"), name: 'temperature', icon: 'ios-stopwatch-outline' },
                    ]
                },
                {
                    title: me.$t("reportForm.logisticsReport"),
                    name: 'logisticsReport',
                    icon: 'ios-bicycle',
                    children: [
                        { title: me.$t("reportForm.driverWorkDetails"), name: 'driverWorkDetails', icon: 'md-car' },
                    ]
                },
                {
                    title: me.$t("reportForm.insurMgr"),
                    name: 'insure',
                    icon: 'md-medkit',
                    children: [
                        { title: me.$t("reportForm.insurRecord"), name: 'insureRecords', icon: 'ios-list-box-outline' },
                        { title: me.$t("reportForm.salesRecord"), name: 'salesRecord', icon: 'ios-book-outline' },
                    ]
                },
            ]
        }
    },
    methods: {
        selectditem: function(name) {
            var pageName = name.toLowerCase() + ".html";
            this.loadPage(pageName);
        },
        loadPage: function(page) {
            vueInstanse && vueInstanse.$destroy && vueInstanse.$destroy();
            var me = this;
            var pagePath = null;
            if (utils.isLocalhost()) {
                pagePath = myUrls.viewhost + 'view/reportform/' + page
            } else {
                pagePath = '../view/reportform/' + page
            }
            this.$Loading.start();
            $('#report-right-wrap').load(pagePath, function() {
                me.$Loading.finish();
                var groupslist = deepClone(me.groupslist);
                window.onresize = null;
                switch (page) {
                    case 'reportnav.html':
                        var reportNavList = deepClone(me.reportNavList);
                        reportNavList.shift();
                        reportNav(reportNavList);
                        break;
                    case 'rechargerecords.html':
                        rechargeRecords(groupslist);
                        break;
                    case 'cmdreport.html':
                        cmdReport(groupslist);
                        break;
                    case 'allalarm.html':
                        allAlarm(groupslist);
                        break;
                    case 'posireport.html':
                        posiReport(groupslist);
                        break;
                    case 'mileagedetail.html':
                        reportMileageDetail(groupslist);
                        break;
                    case 'mileagemonthreport.html':
                        mileageMonthReport(groupslist);
                        break;
                    case 'groupmileage.html':
                        groupMileage(groupslist);
                        break;
                    case 'parkdetails.html':
                        parkDetails(groupslist);
                        break;
                    case 'accdetails.html':
                        accDetails(groupslist);
                        break;
                    case 'rotatereport.html':
                        rotateReport(groupslist);
                        break;
                    case 'speedingreport.html':
                        speedingReport(groupslist);
                        break;
                    case 'multimedia.html':
                        multiMedia(groupslist);
                        break;
                    case 'records.html':
                        devRecords(groupslist);
                        break;
                    case 'messagerecords.html':
                        messageRecords(groupslist);
                        break;
                    case 'phonealarm.html':
                        phoneAlarm(groupslist);
                        break;
                    case 'insurerecords.html':
                        insureRecords(groupslist);
                        break;
                    case 'salesrecord.html':
                        salesRecord(groupslist);
                        break;
                    case 'wechatalarm.html':
                        wechatAlarm(groupslist);
                        break;
                    case 'reportonlinesummary.html':
                        reportOnlineSummary(groupslist);
                        break;
                    case 'droplinereport.html':
                        dropLineReport(groupslist);
                        break;
                    case 'deviceonlinedaily.html':
                        deviceOnlineDaily(groupslist);
                        break;
                    case 'groupsonlinedaily.html':
                        groupsOnlineDaily(groupslist);
                        break;
                    case 'devicemonthonlinedaily.html':
                        deviceMonthOnlineDaily(groupslist);
                        break;
                    case 'newequipmentreport.html':
                        newEquipmentReport();
                        break;
                    case 'devicetypedistribution.html':
                        deviceTypeDistribution(groupslist);
                        break;
                    case 'onlinestatisticsday.html':
                        onlineStatisticsDay(groupslist);
                        break;
                    case 'timeoilconsumption.html':
                        timeOilConsumption(groupslist);
                        break;
                    case 'timeweightconsumption.html':
                        timeWeightConsumption(groupslist);
                        break;
                    case 'weightsummary.html':
                        weightSummary(groupslist);
                        break;
                    case 'dayoil.html':
                        dayOil(groupslist);
                        break;
                    case 'refuelingreport.html':
                        refuelingReport(groupslist);
                        break;
                    case 'oilleakagereport.html':
                        oilLeakageReport(groupslist);
                        break;
                    case 'oilworkinghours.html':
                        oilWorkingHours(groupslist);
                        break;
                    case 'temperature.html':
                        temperature(groupslist);
                        break;
                    case 'driverworkdetails.html':
                        driverWorkDetails(groupslist);
                        break;
                    case 'ioreport.html':
                        ioReport(groupslist);
                        break;
                }
            });
        },
        getMonitorListByUser: function(callback) {
            var me = this;
            var url = myUrls.monitorListByUser();
            utils.sendAjax(url, { username: userName }, function(resp) {
                if (resp.status == 0) {
                    if (resp.groups && resp.groups.length) {
                        callback(resp.groups);
                    } else {
                        callback([]);
                    }
                } else if (resp.status == 3) {
                    me.$Message.error(me.$t("monitor.reLogin"));
                    localStorage.setItem('token', "");
                    setTimeout(function() {
                        window.location.href = 'index.html';
                    }, 2000);
                } else {
                    if (resp.cause) {
                        me.$Message.error(resp.cause)
                    }
                }
            })
        },
        toAlarmRecords: function(activeName, pageHtml) {
            var me = this;
            this.activeName = activeName;
            this.openedNames = ['warningReport'];
            this.$nextTick(function() {
                me.$refs.navMenu.updateOpened();
                me.loadPage(pageHtml);
            })
        },
        getDeviceTypeName: function(deviceTypeId) {
            var typeName = "",
                deviceTypes = this.deviceTypes;
            for (var index = 0; index < deviceTypes.length; index++) {
                var element = deviceTypes[index];
                if (element.devicetypeid === deviceTypeId) {
                    typeName = element.typename;
                    break
                }
            }
            return typeName;
        },
    },
    computed: {
        deviceTypes: function() {
            return this.$store.state.deviceTypes;
        },
    },
    mounted: function() {
        var me = this;
        me.groupslist = globalGroups;
        if (isToAlarmListRecords) {
            me.toAlarmRecords("allAlarm", "allalarm.html");
        } else if (isToPhoneAlarmRecords) {
            me.toAlarmRecords("phoneAlarm", "phonealarm.html");
        } else {
            me.selectditem('reportNav');
        }
    }
};