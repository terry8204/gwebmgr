var treeMixin = {
    data: {
        dateVal: [DateFormat.longToDateStr(Date.now(), DateFormat.getOffset()), DateFormat.longToDateStr(Date.now(), DateFormat.getOffset())],
        total: 0,
        currentPageIndex: 1,
        lastTableHeight: 100,
        posiDetailHeight: 100,
        placeholder: "",
        sosoValue: '',
        isShowMatchDev: false,
        treeData: [],
        dayNumberType: 0,
    },
    methods: {
        changePage: function(index) {
            var offset = index * 10;
            var start = (index - 1) * 10;
            this.currentPageIndex = index;
            this.tableData = this.cmdRecords.slice(start, offset);
        },
        onClickOutside: function() {
            this.isShowMatchDev = false;
        },
        onChange: function(value) {
            this.dateVal = value;
        },
        handleSelectdDate: function(dayNumber) {
            this.dayNumberType = dayNumber;
            var dayTime = 24 * 60 * 60 * 1000;
            if (dayNumber == 0) {
                this.dateVal = [DateFormat.longToDateStr(Date.now(), DateFormat.getOffset()), DateFormat.longToDateStr(Date.now(), DateFormat.getOffset())];
            } else if (dayNumber == 1) {
                this.dateVal = [DateFormat.longToDateStr(Date.now() - dayTime, DateFormat.getOffset()), DateFormat.longToDateStr(Date.now() - dayTime, DateFormat.getOffset())];
            } else if (dayNumber == 3) {
                this.dateVal = [DateFormat.longToDateStr(Date.now() - dayTime * 2, DateFormat.getOffset()), DateFormat.longToDateStr(Date.now(), DateFormat.getOffset())];
            } else if (dayNumber == 7) {
                this.dateVal = [DateFormat.longToDateStr(Date.now() - dayTime * 6, DateFormat.getOffset()), DateFormat.longToDateStr(Date.now(), DateFormat.getOffset())];
            }
        },
        focus: function() {
            this.isShowMatchDev = true;
        },
        sosoValueChange: function() {
            var me = this;
            var value = this.sosoValue;
            this.filterMethod(this.sosoValue);
        },
        filterMethod: function(value) {
            value = value.toLowerCase();
            this.treeData = this.variableDeepSearch(this.groupslist, value, 5);
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

                    if (item.title.indexOf(searchWord) != -1) {
                        copyItem = item;
                        copyItem.expand = false;
                        isFound = true;
                    }
                    if (isFound == false && item.children && item.children.length > 0) {
                        // item.expand = true;
                        // childTemp.push(item);
                        var rs = that.variableDeepSearch(item.children, searchWord, limitcount);
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
        sosoSelect: function(item) {
            reportDeviceId = item.deviceid;
            this.sosoValue = item.title;
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
            arr.forEach(function(item) {
                if (item.children) {
                    sosoValue += item.title + ","
                } else {
                    sosoValue += item.title + ","
                }
            });
            this.sosoValue = sosoValue;
        }
    },
    mounted: function() {
        var me = this;
        this.calcTableHeight();
        window.onresize = function() {
            me.calcTableHeight();
        }
    },
    created: function() {
        this.checkedDevice = [];
    },
};

var reportMixin = {
    data: {
        dateVal: [DateFormat.longToDateStr(Date.now(), DateFormat.getOffset()), DateFormat.longToDateStr(Date.now(), DateFormat.getOffset())],
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
            var offset = index * 10;
            var start = (index - 1) * 10;
            this.currentPageIndex = index;
            this.tableData = this.cmdRecords.slice(start, offset);
        },
        onClickOutside: function() {
            this.isShowMatchDev = false;
        },
        onChange: function(value) {
            this.dateVal = value;
        },
        handleSelectdDate: function(dayNumber) {
            this.dayNumberType = dayNumber;
            var dayTime = 24 * 60 * 60 * 1000;
            if (dayNumber == 0) {
                this.dateVal = [DateFormat.longToDateStr(Date.now(), DateFormat.getOffset()), DateFormat.longToDateStr(Date.now(), DateFormat.getOffset())];
            } else if (dayNumber == 1) {
                this.dateVal = [DateFormat.longToDateStr(Date.now() - dayTime, DateFormat.getOffset()), DateFormat.longToDateStr(Date.now() - dayTime, DateFormat.getOffset())];
            } else if (dayNumber == 3) {
                this.dateVal = [DateFormat.longToDateStr(Date.now() - dayTime * 2, DateFormat.getOffset()), DateFormat.longToDateStr(Date.now(), DateFormat.getOffset())];
            } else if (dayNumber == 7) {
                this.dateVal = [DateFormat.longToDateStr(Date.now() - dayTime * 6, DateFormat.getOffset()), DateFormat.longToDateStr(Date.now(), DateFormat.getOffset())];
            }
        },
        focus: function() {
            var me = this;
            if (this.sosoValue.trim()) {
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
                    filterData.push(group)
                } else {
                    var devices = group.devices
                    var obj = {
                        groupname: group.groupname,
                        devices: []
                    }
                    for (var j = 0; j < devices.length; j++) {
                        var device = devices[j]
                        var title = device.title
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
                    }
                    if (obj.devices.length) {
                        filterData.push(obj);
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
            this.sosoValue = item.title;
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
        }
    }
}


//  指令查询 DateFormat.longToDateStr(Date.now(),0)
function cmdReport(groupslist) {

    new Vue({
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
                this.lastTableHeight = wHeight - 170;
                this.posiDetailHeight = wHeight - 144;
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
                    offset: DateFormat.getOffset(),
                    devices: [this.queryDeviceId],
                };
                this.loading = true;
                utils.sendAjax(myUrls.reportCmd(), data, function(resp) {
                    self.loading = false;
                    if (resp.status == 0) {
                        if (resp.cmdrecords) {

                            resp.cmdrecords.forEach(function(item, index) {
                                item.index = ++index;
                                item.cmdtimeStr = DateFormat.longToDateTimeStr(item.cmdtime, 0);
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
            lastPosiColumns: [
                { type: 'index', width: 60, align: 'center', fixed: 'left' },
                { title: vRoot.$t("alarm.devName"), key: 'devicename', width: 150, fixed: 'left' },
                { title: vRoot.$t("reportForm.lon"), key: 'fixedLon', width: 100 },
                { title: vRoot.$t("reportForm.lat"), key: 'fixedLat', width: 100 },
                { title: vRoot.$t("reportForm.direction"), key: 'direction', width: 90 },
                { title: vRoot.$t("reportForm.speed"), key: 'speed', width: 100 },
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
                { type: 'index', width: 60, align: 'center' },
                { title: vRoot.$t("reportForm.lon"), key: 'fixedLon', width: 100 },
                { title: vRoot.$t("reportForm.lat"), key: 'fixedLat', width: 100 },
                { title: vRoot.$t("reportForm.direction"), key: 'direction', width: 90 },
                { title: vRoot.$t("reportForm.speed"), key: 'speed', width: 100 },
                { title: vRoot.$t("reportForm.date"), key: 'updatetimeStr', width: 160, sortable: true },
                { title: vRoot.$t("reportForm.status"), key: 'strstatus', width: 180, },
                { title: vRoot.$t("reportForm.posiType"), key: 'positype', width: 115 },
                { title: vRoot.$t("reportForm.address"), key: 'address' },
                {
                    title: vRoot.$t("bgMgr.action"),
                    key: 'action',
                    width: 210,
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
        },
        mixins: [reportMixin],
        methods: {
            calcTableHeight: function() {
                var wHeight = window.innerHeight;
                this.lastTableHeight = wHeight - 170;
                this.posiDetailHeight = wHeight - 144;
            },
            onClickQuery: function() {
                if (!this.queryDeviceId) { return };
                var me = this;
                this.loading = true;
                this.getLastPosition([this.queryDeviceId], function() {
                    me.loading = false;
                });
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
                            resp.records.forEach(function(item) {

                                if (item) {
                                    var deviceid = item.deviceid;
                                    item.devicename = vstore.state.deviceInfos[deviceid].devicename;
                                    item.updatetimeStr = DateFormat.longToDateTimeStr(item.updatetime, 0);
                                    item.fixedLon = item.callon.toFixed(5);
                                    item.fixedLat = item.callat.toFixed(5);
                                    var address = LocalCacheMgr.getAddress(item.fixedLon, item.fixedLat);
                                    item.address = address ? address : '';
                                    item.disabled = address ? true : false;
                                    newCored.push(item);
                                    item.positype = utils.getPosiType(item);
                                    item.direction = utils.getCarDirection(item.course);
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
                    'timezone': DateFormat.getOffset()
                };

                utils.sendAjax(url, data, function(resp) {

                    if (resp.status === 0) {
                        if (resp.records && resp.records.length) {
                            var newArr = [];
                            var devicename = vstore.state.deviceInfos[deviceid].devicename;
                            resp.records.sort(function(a, b) {
                                return a.updatetime - b.updatetime;
                            });
                            resp.records.forEach(function(item) {
                                var fixedLon = item.callon.toFixed(5);
                                var fixedLat = item.callat.toFixed(5);
                                var address = LocalCacheMgr.getAddress(fixedLon, fixedLat);
                                newArr.push({
                                    deviceid: item.deviceid,
                                    devicename: devicename,
                                    updatetimeStr: DateFormat.longToDateTimeStr(item.updatetime, 0),
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
                            me.posiDetailData = newArr.reverse();
                            me.total = newArr.length;
                            me.currentIndex = 1;
                            // me.tableData = me.posiDetailData.slice(0, 8);

                        } else {
                            me.tableData = [];
                            me.posiDetailData = [];
                            me.currentIndex = 1;
                            me.total = 0;
                        }
                    } else {
                        me.tableData = [];
                        me.posiDetailData = [];
                        me.currentIndex = 1;
                        me.total = 0;
                    }
                    callback();
                });
            },

            initMap: function() {
                if (this.mapType == 'bMap') {
                    this.mapInstance = new BMap.Map('posi-map', { minZoom: 4, maxZoom: 18, enableMapClick: false });
                    this.mapInstance.enableScrollWheelZoom();
                    this.mapInstance.enableAutoResize();
                    this.mapInstance.disableDoubleClickZoom();
                    this.mapInstance.centerAndZoom(new BMap.Point(113.264435, 24.129163), 18);
                } else {
                    var center = new google.maps.LatLng(24.129163, 113.264435);
                    this.mapInstance = new google.maps.Map(document.getElementById('posi-map'), {
                        zoom: 4,
                        center: center,
                        mapTypeId: google.maps.MapTypeId.ROADMAP
                    });
                };
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
            changePage: function(index) {
                var offset = index * 8;
                var start = (index - 1) * 8;
                this.currentIndex = index;
                this.tableData = this.posiDetailData.slice(start, offset);
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
            this.mapType = utils.getMapType();
            this.initMap();
            this.groupslist = groupslist;
        }
    })
}

// 里程详单
function reportMileageDetail(groupslist) {
    new Vue({
        el: '#mileage-detail',
        i18n: utils.getI18n(),
        mixins: [reportMixin],
        data: {
            loading: false,
            dateVal: [DateFormat.longToDateStr(Date.now(), DateFormat.getOffset()), DateFormat.longToDateStr(Date.now(), DateFormat.getOffset())],
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
                this.lastTableHeight = wHeight - 170;
                this.posiDetailHeight = wHeight - 144;
            },
            onClickQuery: function() {
                if (this.queryDeviceId) {
                    var me = this;
                    var url = myUrls.reportMileageDetail();
                    var data = {
                        startday: this.dateVal[0],
                        endday: this.dateVal[1],
                        offset: DateFormat.getOffset(),
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
            dateVal: [DateFormat.longToDateStr(Date.now(), DateFormat.getOffset()), DateFormat.longToDateStr(Date.now(), DateFormat.getOffset())],
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
                this.lastTableHeight = wHeight - 170;
                this.posiDetailHeight = wHeight - 144;
            },

            onClickQuery: function() {
                if (this.queryDeviceId) {
                    var me = this;
                    var url = myUrls.reportParkDetail();
                    var data = {
                        startday: this.dateVal[0],
                        endday: this.dateVal[1],
                        offset: DateFormat.getOffset(),
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
                                        startDate: DateFormat.longToDateTimeStr(item.starttime, 0),
                                        endDate: DateFormat.longToDateTimeStr(item.endtime, 0),
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
                if (this.mapType == 'bMap') {
                    this.mapInstance = new BMap.Map('posi-map', { minZoom: 4, maxZoom: 18, enableMapClick: false });
                    this.mapInstance.enableScrollWheelZoom();
                    this.mapInstance.enableAutoResize();
                    this.mapInstance.disableDoubleClickZoom();
                    this.mapInstance.centerAndZoom(new BMap.Point(113.264435, 24.129163), 18);
                } else {
                    var center = new google.maps.LatLng(24.129163, 113.264435);
                    this.mapInstance = new google.maps.Map(document.getElementById('posi-map'), {
                        zoom: 4,
                        center: center,
                        mapTypeId: google.maps.MapTypeId.ROADMAP
                    });
                };
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
            activeTab: 'tabTotal',
            mapModal: false,
            mapType: utils.getMapType(),
            mapInstance: null,
            markerIns: null,
            loading: false,
            dateVal: [DateFormat.longToDateStr(Date.now(), DateFormat.getOffset()), DateFormat.longToDateStr(Date.now(), DateFormat.getOffset())],
            lastTableHeight: 100,
            groupslist: [],
            timeoutIns: null,
            isShowMatchDev: true,
            allAccColumns: [
                { title: '序号', width: 60, key: 'index' },
                {
                    title: "操作",
                    width: 100,
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
                        }, "[点火明细]")
                    }
                },
                {
                    title: '设备名称',
                    key: 'devicename'
                },
                {
                    title: '设备序号',
                    key: 'deviceid',
                    width: 160,
                },
                {
                    title: '点火次数',
                    key: 'opennumber',
                    width: 100,
                },
                {
                    title: '点火时长',
                    key: 'duration'
                }
            ],
            allAccTableData: [],
            columns: [
                { title: '序号', width: 60, key: 'index' },
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
                    filename: '点火统计数据' + startday + '-' + endday,
                    original: false,
                    columns: this.allAccColumns.filter((col, index) => index != 1),
                    data: this.allAccTableData
                });
            },
            clean: function() {
                this.sosoValue = '';
                this.checkedDevice = [];
                this.cleanSelected(this.groupslist);
                this.treeData = this.groupslist;
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
                this.lastTableHeight = wHeight - 215;
            },
            onClickQuery: function() {
                var deviceids = [];
                this.checkedDevice.forEach(function(group) {
                    if (!group.children) {
                        deviceids.push(group.deviceid);
                    }
                });
                if (deviceids.length) {
                    var me = this;
                    var url = myUrls.reportAccs();
                    var data = {
                        startday: this.dateVal[0],
                        endday: this.dateVal[1],
                        offset: DateFormat.getOffset(),
                        deviceids: deviceids
                    }
                    me.loading = true;
                    utils.sendAjax(url, data, function(resp) {
                        me.loading = false;
                        if (resp.status == 0) {
                            if (resp.records && resp.records.length) {
                                me.tableData = [];
                                me.allAccTableData = me.getAllAccTableData(resp.records);
                            } else {
                                me.tableData = [];
                                me.allAccTableData = [];
                                me.$Message.error("没有数据");
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
            getAllAccTableData: function(records) {
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
                        startDate: DateFormat.longToDateTimeStr(item.begintime, 0),
                        endDate: DateFormat.longToDateTimeStr(item.endtime, 0),
                        accStatus: accStatus,
                        duration: durationStr
                    });
                });
                newRecords.push({
                    duration: this.$t("reportForm.accOnTime") + ':' + utils.timeStamp(accOnTime) + ',' + this.$t("reportForm.accOffTime") + ':' + utils.timeStamp(accOffTime)
                })
                me.tableData = newRecords;
            },
            getTreeGroupslist: function(groupslist) {
                var treeLists = [];
                groupslist.forEach(function(group) {
                    var children = []
                    var treeItem = {
                        expand: false,
                        title: group.groupname,
                        children: children,
                        firstLetter: group.firstLetter,
                        pinyin: group.pinyin
                    }
                    if (group.devices && group.devices.length != 0) {
                        group.devices.forEach(function(device) {
                            children.push({
                                title: device.title,
                                deviceid: device.deviceid,
                                firstLetter: device.firstLetter,
                                pinyin: device.pinyin
                            })
                        });
                    }
                    if (children.length) {
                        treeLists.push(treeItem);
                    }
                });
                return [{
                    title: "所有设备",
                    children: treeLists,
                    expand: true,
                }];
            }
        },
        mounted: function() {
            var me = this;
            // this.groupslist = this.getTreeGroupslist(groupslist);
            // this.treeData = this.groupslist;
            utils.queryDevicesTree(function(rootuser) {
                if (rootuser) {
                    me.groupslist = [utils.castUsersTreeToDevicesTree(rootuser, true)];
                    me.treeData = me.groupslist;
                }
            });
            this.calcTableHeight();
            window.onresize = function() {
                me.calcTableHeight();
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
                { title: isZh ? '时间' : 'date', key: 'updatetimeStr', width: 200 },
                {
                    title: isZh ? '下载' : 'download',
                    render: function(h, data) {
                        return h(
                            "a", {
                                attrs: {
                                    download: true,
                                    target: "_blank",
                                    href: data.row.url
                                }
                            },
                            isZh ? '下载' : 'download')
                    },
                    width: 80,
                },
                {
                    title: isZh ? '录音' : 'record',
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
                                updatetimeStr: DateFormat.longToDateTimeStr(record.updatetime, 0),
                                url: record.url
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


function messageRecords(groupslist) {
    new Vue({
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
                { title: 'trackid', key: 'trackid', fixed: 'left', width: 80 },
                { title: 'sn', key: 'sn', width: 80, "sortable": true },
                { title: 'messagetype', key: 'messagetype', width: 80 },
                { title: 'typedescr', key: 'typedescr', width: 120 },
                { title: 'status', key: 'status', width: 80 },
                { title: 'strstatus', key: 'strstatus', width: 220 },
                { title: 'updatetime', key: 'updatetimeStr', width: 160 },
                { title: 'reportmode', key: 'reportmodeStr', width: 120 },
                { title: 're', key: 'reissue', width: 80 },
                { title: 'callat', key: 'callat', width: 120 },
                { title: 'callon', key: 'callon', width: 120 },
                { title: 'radius', key: 'radius', width: 80 },
                { title: 'speed', key: 'speed', width: 80 },
                { title: 'totaldistance', key: 'totaldistance', width: 120 },
                { title: 'altitude', key: 'altitude', width: 80 },
                { title: 'course', key: 'course', width: 80 },
                { title: 'gotsrc', key: 'gotsrc', width: 80 },
                { title: 'rxlevel', key: 'rxlevel', width: 80 },
                { title: 'servicealive', key: 'servicealive', width: 80 },
                { title: 'connectalive', key: 'connectalive', width: 80 },
            ],
            tableData: [],
            data: [],
            currentIndex: 1,
            total: 0,
            contentString: "",
            filterStr: '',
        },
        methods: {
            onRowClick: function(row) {
                var me = this;
                this.isShowCard = true;
                this.queryTrackDetail(row, function(resp) {
                    if (resp.track) {
                        me.contentString = JSON.stringify(resp.track);
                    } else {
                        vm.$Message.error("没有查询到数据");
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
                    this.data.forEach(function(item) {
                        if (item.typedescr && item.typedescr.indexOf(that.filterStr) != -1) {
                            filterArr.push(item);
                        }
                    });
                    this.tableData = filterArr;
                };
            },
            onChange: function(index) {
                this.isShowCard = false;
                this.currentIndex = index;
                this.tableData = this.data.slice((index - 1) * 30, (index - 1) * 30 + 30);
            },
            calcTableHeight: function() {
                var wHeight = window.innerHeight;
                this.tableHeight = wHeight - 165;
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
                var url = myUrls.queryTracks(),
                    me = this;
                var startTimeStr = DateFormat.format(this.startDate, 'yyyy-MM-dd') + ' 00:00:00';
                var endTimeStr = DateFormat.format(this.startDate, 'yyyy-MM-dd') + ' 23:59:00';
                var data = {
                    deviceid: this.queryDeviceId,
                    lbs: 1,
                    timeorder: 0,
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
                        resp.records.forEach(function(record) {
                            var type = "0x" + parseInt(record.messagetype, 10).toString(16) + '(' + record.messagetype + ')';
                            record.messagetype = type;
                            record.reportmodeStr = getReportModeStr(record.reportmode);
                            record.updatetimeStr = DateFormat.longToDateTimeStr(record.updatetime, 0);
                        });
                        resp.records.sort(function(a, b) {
                            return b.updatetime - a.updatetime;
                        });
                        me.data = Object.freeze(resp.records);
                        me.total = me.data.length;
                        me.tableData = me.data.slice(0, 30);
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
                    this.tableData = this.data.slice((this.currentIndex - 1) * 30, (this.currentIndex - 1) * 30 + 30);
                }
            }
        },
        mounted() {
            var me = this;
            this.groupslist = groupslist;

            this.calcTableHeight();
            this.dayTime = 60 * 60 * 24 * 1000;
            window.onresize = function() {
                me.calcTableHeight();
            };
        },
    })
}


// 查询报警
function allAlarm(groupslist) {
    new Vue({
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
                                    lastalarmtimeStr: DateFormat.longToDateTimeStr(record.lastalarmtime, 0),
                                    startalarmtimeStr: DateFormat.longToDateTimeStr(record.startalarmtime, 0),
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
    new Vue({
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
                    this.$Message.error("请选择设备");
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
                                datestr: DateFormat.longToDateTimeStr(new Date(record.lastalarmtime), 0),
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
    new Vue({
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
                    this.$Message.error("请选择设备");
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
                                datestr: DateFormat.longToDateTimeStr(new Date(record.lastalarmtime), 0),
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
    new Vue({
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
    new Vue({
        el: '#insure-records',
        i18n: utils.getI18n(),
        data: {
            error: 123,
            columns: [{
                    title: '是否付费',
                    key: 'isPay',
                    width: 100,
                    render: function(h, parmas) {
                        return h('span', {}, parmas.row.insurestate == 1 ? '已付款' : '未付款');
                    }
                },
                { title: '姓名', key: 'name', width: 100 },
                { title: '身份证号', key: 'cardid', width: 150 },
                { title: '地址', key: 'usingaddress', width: 150 },
                { title: '手机号', key: 'phonenum', width: 150 },
                // { title: '电动车类型', key: 'phonenum', width: 150 },
                { title: '品牌型号', key: 'brandtype', width: 100 },
                { title: '车架号', key: 'vinno', width: 150 },
                { title: 'GPS序列号', key: 'deviceid', width: 150 },
                { title: '购车日期', key: 'buycarday', width: 100 },
                { title: '销售价格', key: 'carvalue', width: 100 },
                { title: '保险金额', key: 'insureprice', width: 100 },
                { title: '保费', key: 'insurefee', width: 80 },
                {
                    title: '合格证',
                    key: 'carpicurl',
                    width: 100,
                    render: function(h, parmas) {
                        return h('a', { attrs: { href: parmas.row.carpicurl, target: '_blank' } }, '点击预览');
                    }
                },
                {
                    title: '身份证正面',
                    key: 'positivecardidurl',
                    width: 100,
                    render: function(h, parmas) {
                        return h('a', { attrs: { href: parmas.row.positivecardidurl, target: '_blank' } }, '点击预览');
                    }
                },
                {
                    title: '身份证反面',
                    key: 'negativecardidurl',
                    width: 100,
                    render: function(h, parmas) {
                        return h('a', { attrs: { href: parmas.row.negativecardidurl, target: '_blank' } }, '点击预览');
                    }
                },
                {
                    title: '购车发票',
                    key: 'invoiceurl',
                    width: 100,
                    render: function(h, parmas) {
                        return h('a', { attrs: { href: parmas.row.invoiceurl, target: '_blank' } }, '点击预览');
                    }
                },
                {
                    title: '车主与车合影',
                    key: 'groupphotourl',
                    width: 120,
                    render: function(h, parmas) {
                        return h('a', { attrs: { href: parmas.row.groupphotourl, target: '_blank' } }, '点击预览');
                    }
                },
            ],
            tableHeight: 300,
            tableData: [],
            loading: false,
            isFilter: true
        },
        methods: {
            calcTableHeight: function() {
                var wHeight = window.innerHeight;
                this.tableHeight = wHeight - 125;
            },
            changeTableColumns: function() {
                this.columns = this.getTableColumns();
            },
            queryInsures: function() {
                this.loading = true;
                var url = myUrls.queryInsures(),
                    me = this;
                utils.sendAjax(url, { username: userName }, function(resp) {
                    console.log('resp', resp);
                    if (resp.status === 0) {
                        if (me.isFilter) {
                            me.tableData = (function() {
                                var tableData = [];
                                resp.insures.forEach(function(item) {
                                    if (item.insurestate === 1) {
                                        tableData.push(item);
                                    };
                                })
                                return tableData;
                            })();
                        } else {
                            me.tableData = resp.insures;
                        }
                    }
                    me.loading = false;
                })
            },
            exportData: function() {
                // this.$refs.table.exportCsv({
                //     filename: 'device info'
                // });
                var jsonData = this.tableData.map(function(item) {
                    return {
                        name: item.name,
                        cardid: item.cardid,
                        usingaddress: item.usingaddress,
                        phonenum: item.phonenum,
                        brandtype: item.brandtype,
                        vinno: item.vinno,
                        deviceid: item.deviceid,
                        buycarday: item.buycarday,
                        carvalue: item.carvalue,
                        insureprice: item.insureprice,
                        insurefee: item.insurefee,
                        carpicurl: item.carpicurl,
                        positivecardidurl: item.positivecardidurl,
                        negativecardidurl: item.negativecardidurl,
                        invoiceurl: item.invoiceurl,
                        groupphotourl: item.groupphotourl,
                    };
                });

                var columnsStr = [
                    '姓名', '身份证号', '地址', '手机号', '品牌型号',
                    '车架号', 'GPS序列号', '购车日期', '销售价格', '保险金额',
                    '保费', '合格证', '身份证正面', '身份证反面', '购车发票', '车主与车合影'
                ].map(function(item) { return "<td>" + item + "</td>"; });
                var str = '<tr>' + columnsStr.join('') + '</tr>';
                for (var i = 0; i < jsonData.length; i++) {
                    str += '<tr>';
                    for (var item in jsonData[i]) {
                        str += '<td>' + jsonData[i][item] + '\t' + '</td>';
                    }
                    str += '</tr>';
                }

                var worksheet = 'Sheet1'
                var uri = 'data:application/vnd.ms-excel;base64,';
                //下载的表格模板数据
                var template = '<html xmlns:o="urn:schemas-microsoft-com:office:office"xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">' +
                    '<head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>' +
                    '<x:Name>' + worksheet + '</x:Name>'
                '<x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet>' +
                +'</x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->' +
                '</head><body><table>' + str + '</table></body></html>';
                //下载模板
                window.location.href = uri + base64(template)

                function base64(s) { return window.btoa(unescape(encodeURIComponent(s))) }
            },
        },
        mounted: function() {
            this.calcTableHeight();
            this.queryInsures();
        },
    })
}


//综合上线统计
function reportOnlineSummary(groupslist) {
    new Vue({
        i18n: utils.getI18n(),
        el: "#reportonlinesummary",
        mixins: [treeMixin],
        data: {
            multiple: false,
            createrToUser: userName,
            userlists: userlists,
            groupslist: [],
            iconState: 'ios-arrow-down',
            columns: [
                { type: 'index', width: 60 },
                { title: '设备序号', key: 'deviceid', },
                { title: '设备名称', key: 'devicename', sortable: true, },
                { title: '卡号', key: 'simnum', sortable: true },
                {
                    title: '分组',
                    key: 'groupid',
                    render: function(h, params) {
                        var groupid = params.row.groupid;
                        var deviceid = params.row.deviceid;
                        var groupName = '';
                        if (groupid == 0) {
                            groupName = '默认组';
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
                    title: '设备类型',
                    key: 'devicetype',
                    sortable: true,
                    width: 120,
                    render: function(h, params) {
                        var devicetype = params.row.devicetype;
                        var deviceTypes = vstore.state.deviceTypes;
                        for (var i = 0; i < deviceTypes.length; i++) {
                            var item = deviceTypes[i];
                            if (item.devicetypeid == devicetype) {
                                return h('span', {}, item.typename);
                            }
                        }
                    }
                },
                {
                    title: '运营状态',
                    width: 85,
                    render: function(h, params) {
                        var status = '离线';
                        var updatetime = params.row.updatetime;

                        if (updatetime > 0 && (Date.now() - updatetime) < 60 * 10 * 1000) {
                            status = "在线";
                        }
                        return h('span', {}, status)
                    }
                },
                {
                    title: '更新时间',
                    width: 150,
                    render: function(h, params) {
                        var updatetime = params.row.updatetime;
                        var updatetimeStr = '未上报';
                        if (updatetime > 0) {
                            updatetimeStr = DateFormat.longToDateTimeStr(updatetime, 0);
                        }
                        return h('span', {}, updatetimeStr)
                    }
                },
                {
                    title: '最后位置',
                    render: function(h, params) {
                        var callat = params.row.callat;
                        var callon = params.row.callon;
                        if (callat == 0 && callon == 0) {
                            return h('span', {}, '未定位')
                        } else {
                            return h('span', {}, '已定位')
                        }

                    }
                },
                { title: '最后状态', key: 'strstatus', },
                {
                    title: '备注',
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
                if (userlists.indexOf(this.createrToUser) == -1) {
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
                        currentsubDevicesTreeRecord.title = username;
                        if (username != null && subusers != null && subusers.length > 0) {
                            var subDevicesTreeRecord = this.doCastUsersTreeToDevicesTree(subusers);
                            currentsubDevicesTreeRecord.children = subDevicesTreeRecord;
                        }
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
    new Vue({
        i18n: utils.getI18n(),
        el: "#droplinereport",
        mixins: [treeMixin],
        data: {
            loading: false,
            days: '1',
            groupslist: [],
            columns: [
                { type: 'index', width: 60 },
                { title: '设备序号', key: 'deviceid', },
                { title: '设备名称', key: 'devicename', },
                { title: '卡号', key: 'simnum', },
                {
                    title: '分组',
                    key: 'groupid',
                    render: function(h, params) {
                        var groupid = params.row.groupid;
                        var deviceid = params.row.deviceid;
                        var groupName = '';
                        if (groupid == 0) {
                            groupName = '默认组';
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
                        return h('span', {}, groupName)
                    }
                },
                {
                    title: '设备类型',
                    key: 'devicetype',
                    width: 85,
                    render: function(h, params) {
                        var devicetype = params.row.devicetype;
                        var deviceTypes = vstore.state.deviceTypes;
                        for (var i = 0; i < deviceTypes.length; i++) {
                            var item = deviceTypes[i];
                            if (item.devicetypeid == devicetype) {
                                return h('span', {}, item.typename);
                            }
                        }
                    }
                },
                {
                    title: '掉线时间',
                    width: 150,
                    render: function(h, params) {
                        var updatetime = params.row.updatetime;
                        var updatetimeStr = '未上报';
                        if (updatetime > 0) {
                            updatetimeStr = DateFormat.longToDateTimeStr(updatetime, 0);
                        }
                        return h('span', {}, updatetimeStr)
                    }
                },
                {
                    title: '掉线时长',
                    width: 150,
                    render: function(h, params) {
                        var updatetime = params.row.updatetime;
                        return h('span', {}, utils.timeStamp(Date.now() - updatetime))
                    }
                },
                {
                    title: '备注',
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
        },
        methods: {
            onClickQuery: function() {
                if (this.checkedDevice.length == 0) {
                    this.$Message.error("请选择设备");
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
                        data.deviceids.push(group.deviceid);
                    }
                });

                utils.sendAjax(url, data, function(respData) {
                    me.loading = false;
                    if (respData.status == 0) {
                        me.tableData = respData.records;
                    } else {
                        me.$Message.error("查询失败");
                    }
                });
            },
            clean: function() {
                this.sosoValue = '';
                this.checkedDevice = [];
                this.cleanSelected(this.groupslist);
                this.treeData = this.groupslist;
                this.tableData = [];
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
        },
        mounted: function() {
            var me = this;
            utils.queryDevicesTree(function(rootuser) {
                if (rootuser) {
                    me.groupslist = [utils.castUsersTreeToDevicesTree(rootuser, true)];
                    me.treeData = me.groupslist;
                }
            });
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

    new Vue({
        el: "#deviceonlinedaily",
        i18n: utils.getI18n(),
        mixins: [treeMixin],
        data: {
            groupslist: [],
            tableHeight: 300,
            loading: false,
            yearMonth: new Date(),
            daycount: 0,
            columns: [
                { type: 'index' },
                { title: '设备序号', key: 'deviceid' },
                { title: '设备名称', key: 'devicename' },
            ],
            tableData: [],
        },
        methods: {
            onClickQuery: function() {
                if (this.checkedDevice.length == 0) {
                    this.$Message.error("请选择设备");
                    return;
                }
                this.loading = true;
                var url = myUrls.reportDeviceOnlineDaily(),
                    me = this;
                var data = {
                    deviceids: [],
                    offset: DateFormat.getOffset(),
                    year: this.yearMonth.getFullYear(),
                    month: this.yearMonth.getMonth() + 1,
                }
                this.checkedDevice.forEach(function(group) {
                    if (!group.children) {
                        data.deviceids.push(group.deviceid);
                    }
                });
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
            clean: function() {
                this.sosoValue = '';
                this.checkedDevice = [];
                this.cleanSelected(this.groupslist);
                this.treeData = this.groupslist;
                this.tableData = [];
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

        },
        watch: {
            daycount: function(newVla) {
                var columns = [
                    { type: 'index', width: 60, fixed: 'left' },
                    {
                        title: '设备名称',
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
                    { title: '设备序号', key: 'deviceid', fixed: 'left', width: 140 },
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
                    title: '在线率',
                    fixed: 'right',
                    width: 120,
                });
                this.columns = columns;
            }
        },
        mounted: function() {
            var me = this;
            utils.queryDevicesTree(function(rootuser) {
                if (rootuser) {
                    me.groupslist = [utils.castUsersTreeToDevicesTree(rootuser, true)];
                    me.treeData = me.groupslist;
                }
            });
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
    new Vue({
        el: '#groupsonlinedaily',
        i18n: utils.getI18n(),
        mixins: [treeMixin],
        data: {
            groupslist: [],
            tableHeight: 300,
            loading: false,
            yearMonth: new Date(),
            columns: [
                { type: 'index', width: 60 },
                { title: '分组名称', key: 'groupname' },
                {
                    title: '总数量/在线数量',
                    key: 'onlinecount',
                    render: function(h, params) {
                        var onlinecount = params.row.onlinecount;
                        var totalcount = params.row.totalcount;
                        return h('span', {}, onlinecount + "/" + totalcount);
                    }
                },
                {
                    title: '日在线率',
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
                    offset: DateFormat.getOffset(),
                    daystr: DateFormat.format(this.yearMonth, 'yyyy-MM-dd'),
                }

                this.checkedDevice.forEach(function(group) {
                    if (!group.children) {
                        data.groups.push({
                            username: group.username,
                            groupid: group.groupid,
                            groupname: group.title,
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
                    console.log(respData);
                });
            },
            clean: function() {
                this.sosoValue = '';
                this.checkedDevice = [];
                this.cleanSelected(this.groupslist);
                this.treeData = this.groupslist;
                this.tableData = [];
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
        },
        mounted: function() {
            var me = this;
            utils.queryDevicesTree(function(rootuser) {
                if (rootuser) {
                    me.groupslist = [utils.castUsersTreeToDevicesTree(rootuser, false)];
                    me.treeData = me.groupslist;
                }
            });
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
            modal: false,
            textTop: ["日", "一", "二", "三", "四", "五", "六"],
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
                { title: '设备序号', key: 'deviceid' },
                {
                    title: '设备名称',
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
                    title: '在线天数/总天数',
                    render: function(h, params) {
                        var onlinecount = params.row.onlinecount;
                        return h('span', {}, onlinecount + "/" + params.row.daysstatus.length);
                    }
                },
                { title: '在线率', key: 'onlineRate' },
                {
                    title: "在线日期",
                    render: function(h, params) {
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
                            '在线日期'
                        )
                    }
                }
            ],
            tableData: [],
        },
        methods: {
            onClickQuery: function() {
                if (this.checkedDevice.length == 0) {
                    this.$Message.error("请选择设备");
                    return;
                }
                this.loading = true;
                var url = myUrls.reportDeviceOnlineMonth(),
                    me = this;
                var data = {
                    deviceids: [],
                    offset: DateFormat.getOffset(),
                    year: this.yearMonth.getFullYear(),
                    month: this.yearMonth.getMonth() + 1,
                }
                this.checkedDevice.forEach(function(group) {
                    if (!group.children) {
                        data.deviceids.push(group.deviceid);
                    }
                });
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
            getTheMonthFirstDayWeek() {
                return new Date(this.year, this.month - 1, 1).getDay();
            },
            // 得到这个月有多少天
            getTheMonthDays() {
                var year = this.month == 12 ? this.year + 1 : this.year;
                var month = this.month == 12 ? 1 : this.month;
                return new Date(new Date(year, month, 1) - 1).getDate();
            },
            // 得到上个月的最后一天
            getPrevMonthLastDate() {
                return new Date(new Date(this.year, this.month - 1, 1) - 1).getDate();
            },
            getDatesArr(daysstatus) {
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
            clean: function() {
                this.sosoValue = '';
                this.checkedDevice = [];
                this.cleanSelected(this.groupslist);
                this.treeData = this.groupslist;
                this.tableData = [];
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
        },
        mounted: function() {
            var me = this;
            utils.queryDevicesTree(function(rootuser) {
                if (rootuser) {
                    me.groupslist = [utils.castUsersTreeToDevicesTree(rootuser, true)];
                    me.treeData = me.groupslist;
                }
            });
            window.onresize = function() {
                me.calcTableHeight();
            };
        },
        created: function() {
            this.checkedDevice = [];
        },
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
            activeName: "",
            openedNames: [],
            reportNavList: [{
                    title: me.$t("reportForm.drivingReport"),
                    name: 'drivingReport',
                    icon: 'ios-photos',
                    children: [
                        { title: me.$t("reportForm.cmdReport"), name: 'cmdReport', icon: 'ios-pricetag-outline' },
                        { title: me.$t("reportForm.posiReport"), name: 'posiReport', icon: 'ios-pin' },
                        { title: me.$t("reportForm.reportmileagedetail"), name: 'mileageDetail', icon: 'ios-color-wand' },
                        { title: me.$t("reportForm.parkDetails"), name: 'parkDetails', icon: 'md-analytics' },
                        { title: me.$t("reportForm.acc"), name: 'accDetails', icon: 'md-bulb' },
                        { title: isZh ? '语音报表' : 'Voice report', name: 'records', icon: 'md-volume-up' },
                        { title: isZh ? '报文报表' : 'Message report', name: 'messageRecords', icon: 'ios-book' },
                    ]
                },
                {
                    title: me.$t("reportForm.warningReport"),
                    name: 'warningReport',
                    icon: 'logo-wordpress',
                    children: [
                        { title: me.$t("reportForm.allAlarm"), name: 'allAlarm', icon: 'md-warning' },
                        { title: me.$t("reportForm.phoneAlarm"), name: 'phoneAlarm', icon: 'ios-call' },
                        { title: "微信报警", name: 'wechatAlarm', icon: 'md-ionitron' },
                        { title: me.$t("reportForm.rechargeRecords"), name: 'rechargeRecords', icon: 'ios-list-box-outline' },
                        { title: "保险记录", name: 'insureRecords', icon: 'ios-list-box-outline' },
                    ]
                },
                {
                    title: '上线统计',
                    name: 'operateReport',
                    icon: 'md-stats',
                    children: [
                        { title: '综合统计', name: 'reportOnlineSummary', icon: 'md-sunny' },
                        { title: '掉线报表', name: 'dropLineReport', icon: 'ios-git-pull-request' },
                        { title: '每日在线率', name: 'deviceOnlineDaily', icon: 'md-bulb' },
                        { title: '车队日在线率', name: 'groupsOnlineDaily', icon: 'md-bulb' },
                        { title: '车辆月在线率', name: 'deviceMonthOnlineDaily', icon: 'md-bulb' },
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
                    case 'parkdetails.html':
                        parkDetails(groupslist);
                        break;
                    case 'accdetails.html':
                        accDetails(groupslist);
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
                }
            });
        },
        getMonitorListByUser: function(callback) {
            var me = this
            var url = myUrls.monitorListByUser()
            utils.sendAjax(url, { username: userName }, function(resp) {
                if (resp.status == 0) {
                    if (resp.groups && resp.groups.length) {
                        callback(resp.groups);
                    } else {
                        callback([]);
                    }
                } else if (resp.status == 3) {
                    me.$Message.error(me.$t("monitor.reLogin"));
                    Cookies.remove('token');
                    setTimeout(function() {
                        window.location.href = 'index.html'
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
        this.getMonitorListByUser(function(groups) {
            me.groupslist = utils.getPinyin(groups);
            me.groupslist.sort(function(a, b) {
                return a.groupname.localeCompare(b.groupname);
            });
            me.groupslist.forEach(function(group) {
                group.devices.sort(function(a, b) {
                    return a.title.localeCompare(b.title);
                });
            });
            if (isToAlarmListRecords) {
                me.toAlarmRecords("allAlarm", "allalarm.html");
            } else if (isToPhoneAlarmRecords) {
                me.toAlarmRecords("phoneAlarm", "phonealarm.html");
            }
        })
    }
}