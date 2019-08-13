
var reportMixin = {
    data: {
        dateVal: [DateFormat.longToDateStr(Date.now(), 0), DateFormat.longToDateStr(Date.now(), 0)],
        total: 0,
        currentPageIndex: 1,
        lastTableHeight: 100,
        posiDetailHeight: 100,
        placeholder: "",
        sosoValue: '',
        isShowMatchDev: true,
        filterData: [],
        queryDeviceId: '',
    },
    methods: {
        changePage: function (index) {
            var offset = index * 10;
            var start = (index - 1) * 10;
            this.currentPageIndex = index;
            this.tableData = this.cmdRecords.slice(start, offset);
        },
        onClickOutside: function () {
            this.isShowMatchDev = false;
        },
        onChange: function (value) {
            this.dateVal = value;
        },
        handleSelectdDate: function (dayNumber) {
            var dayTime = 24 * 60 * 60 * 1000;
            if (dayNumber == 0) {
                this.dateVal = [DateFormat.longToDateStr(Date.now(), 0), DateFormat.longToDateStr(Date.now(), 0)];
            } else if (dayNumber == 1) {
                this.dateVal = [DateFormat.longToDateStr(Date.now() - dayTime, 0), DateFormat.longToDateStr(Date.now() - dayTime, 0)];
            } else if (dayNumber == 3) {
                this.dateVal = [DateFormat.longToDateStr(Date.now() - dayTime * 2, 0), DateFormat.longToDateStr(Date.now(), 0)];
            } else if (dayNumber == 7) {
                this.dateVal = [DateFormat.longToDateStr(Date.now() - dayTime * 6, 0), DateFormat.longToDateStr(Date.now(), 0)];
            }
        },
        focus: function () {
            var me = this;
            if (this.sosoValue.trim()) {
                me.sosoValueChange()
            } else {
                this.groupslist.forEach(function (group) {
                    group.devices.forEach(function (device) {
                        device.isOnline = vstore.state.deviceInfos[device.deviceid] ? vstore.state.deviceInfos[device.deviceid].isOnline : false;
                    })
                });
                this.filterData = this.groupslist;
                this.isShowMatchDev = true;
                this.queryDeviceId = '';
                reportDeviceId = null;
            }
        },
        sosoValueChange: function () {
            var me = this;
            var value = this.sosoValue;

            if (this.timeoutIns != null) {
                clearTimeout(this.timeoutIns);
            };

            this.timeoutIns = setTimeout(function () {
                me.filterMethod(value);
            }, 300);
        },
        filterMethod: function (value) {
            var filterData = [];
            value = value.toLowerCase();
            for (var i = 0; i < this.groupslist.length; i++) {
                var group = this.groupslist[i];
                if (
                    group.groupname.toLowerCase().indexOf(value) !== -1 ||
                    group.firstLetter.indexOf(value) !== -1 ||
                    group.pinyin.indexOf(value) !== -1
                ) {
                    group.devices.forEach(function (device) {
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
        sosoSelect: function (item) {
            reportDeviceId = item.deviceid;
            this.sosoValue = item.title;
            this.queryDeviceId = item.deviceid;
            this.isShowMatchDev = false;
        },
        getDeviceTitle: function (deviceid) {
            var title = "";
            this.groupslist.forEach(function (group) {
                var isReturn = false;
                group.devices.forEach(function (device) {
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
    mounted: function () {
        var me = this;
        this.calcTableHeight();
        this.$nextTick(function () {
            if (reportDeviceId) {
                me.queryDeviceId = reportDeviceId;
                me.sosoValue = me.getDeviceTitle(reportDeviceId);
            }
        });
        window.onresize = function () {
            me.calcTableHeight();
        }
    }
}



//  指令查询 DateFormat.longToDateStr(Date.now(),0)
function cmdReport (groupslist) {

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
            calcTableHeight: function () {
                var wHeight = window.innerHeight;
                this.lastTableHeight = wHeight - 170;
                this.posiDetailHeight = wHeight - 144;
            },
            onClickQuery: function () {
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
                utils.sendAjax(myUrls.reportCmd(), data, function (resp) {
                    self.loading = false;
                    if (resp.status == 0) {
                        if (resp.cmdrecords) {

                            resp.cmdrecords.forEach(function (item, index) {
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
            onSortChange: function (column) {

            }
        },
        mounted: function () {
            this.groupslist = groupslist;
        }
    });
}
// 位置报表
function posiReport (groupslist) {
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
                    render: function (h, params) {
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
                                    click: function () {
                                        vueInstanse.loading = true;
                                        vueInstanse.trackDetailModal = true;
                                        vueInstanse.deviceName = params.row.devicename;
                                        vueInstanse.querySingleDevTracks(params.row.deviceid, function () {
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
                                    click: function () {
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
                    render: function (h, params) {
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
                                    click: function () {
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
                                    click: function () {
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
            calcTableHeight: function () {
                var wHeight = window.innerHeight;
                this.lastTableHeight = wHeight - 170;
                this.posiDetailHeight = wHeight - 144;
            },
            onClickQuery: function () {
                if (!this.queryDeviceId) { return };
                var me = this;
                this.loading = true;
                this.getLastPosition([this.queryDeviceId], function () {
                    me.loading = false;
                });
            },
            getLastPosition: function (deviceIds, callback) {
                var me = this;
                var url = myUrls.lastPosition();
                var data = {
                    username: userName,
                    deviceids: deviceIds
                }
                utils.sendAjax(url, data, function (resp) {
                    if (resp.status == 0) {
                        if (resp.records) {
                            var newCored = [];
                            resp.records.forEach(function (item) {

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
            querySingleDevTracks: function (deviceid, callback) {
                var me = this;
                var url = myUrls.queryTracks();
                var data = {
                    "deviceid": deviceid,
                    "begintime": this.dateVal[0] + " 00:00:00",
                    "endtime": this.dateVal[1] + " 23:59:00",
                    'interval': this.minuteNum * 60,
                    'timezone': DateFormat.getOffset()
                };

                utils.sendAjax(url, data, function (resp) {

                    if (resp.status === 0) {
                        if (resp.records && resp.records.length) {
                            var newArr = [];
                            var devicename = vstore.state.deviceInfos[deviceid].devicename;
                            resp.records.sort(function (a, b) {
                                return a.updatetime - b.updatetime;
                            });
                            resp.records.forEach(function (item) {
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

            initMap: function () {
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
            getAddress: function (type, params) {
                var me = this;
                var row = params.row;
                var index = params.index;
                utils.queryAddress(row, function (address) {
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
            changePage: function (index) {
                var offset = index * 8;
                var start = (index - 1) * 8;
                this.currentIndex = index;
                this.tableData = this.posiDetailData.slice(start, offset);
            },
        },
        watch: {
            trackDetailModal: function () {
                if (!this.trackDetailModal) {
                    this.posiDetailData = [];
                }
            }
        },
        mounted: function () {
            this.mapType = utils.getMapType();
            this.initMap();
            this.groupslist = groupslist;
        }
    })
}

// 里程详单
function reportMileageDetail (groupslist) {
    new Vue({
        el: '#mileage-detail',
        i18n: utils.getI18n(),
        mixins: [reportMixin],
        data: {
            loading: false,
            dateVal: [DateFormat.longToDateStr(Date.now(), 0), DateFormat.longToDateStr(Date.now(), 0)],
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
            onChange: function (value) {
                this.dateVal = value;
            },
            handleSelectdDate: function (dayNumber) {
                var dayTime = 24 * 60 * 60 * 1000;
                if (dayNumber == 0) {
                    this.dateVal = [DateFormat.longToDateStr(Date.now(), 0), DateFormat.longToDateStr(Date.now(), 0)];
                } else if (dayNumber == 1) {
                    this.dateVal = [DateFormat.longToDateStr(Date.now() - dayTime, 0), DateFormat.longToDateStr(Date.now() - dayTime, 0)];
                } else if (dayNumber == 3) {
                    this.dateVal = [DateFormat.longToDateStr(Date.now() - dayTime * 2, 0), DateFormat.longToDateStr(Date.now(), 0)];
                } else if (dayNumber == 7) {
                    this.dateVal = [DateFormat.longToDateStr(Date.now() - dayTime * 6, 0), DateFormat.longToDateStr(Date.now(), 0)];
                }
            },
            calcTableHeight: function () {
                var wHeight = window.innerHeight;
                this.lastTableHeight = wHeight - 170;
                this.posiDetailHeight = wHeight - 144;
            },
            onClickQuery: function () {
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
                    utils.sendAjax(url, data, function (resp) {
                        me.loading = false;
                        if (resp.status === 0) {
                            if (resp.records.length) {
                                var total = 0;
                                resp.records.forEach(function (item) {
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
        mounted: function () {
            var me = this;
            this.groupslist = groupslist;
            this.calcTableHeight();
            window.onresize = function () {
                me.calcTableHeight();
            }
        }
    })
}

// 停车表报
function parkDetails (groupslist) {
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
            dateVal: [DateFormat.longToDateStr(Date.now(), 0), DateFormat.longToDateStr(Date.now(), 0)],
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
                    render: function (h, params) {
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
                                    click: function () {
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
                    render: function (h, params) {
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
                                    click: function () {
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
            onChange: function (value) {
                this.dateVal = value;
            },
            handleSelectdDate: function (dayNumber) {
                var dayTime = 24 * 60 * 60 * 1000;
                if (dayNumber == 0) {
                    this.dateVal = [DateFormat.longToDateStr(Date.now(), 0), DateFormat.longToDateStr(Date.now(), 0)];
                } else if (dayNumber == 1) {
                    this.dateVal = [DateFormat.longToDateStr(Date.now() - dayTime, 0), DateFormat.longToDateStr(Date.now() - dayTime, 0)];
                } else if (dayNumber == 3) {
                    this.dateVal = [DateFormat.longToDateStr(Date.now() - dayTime * 2, 0), DateFormat.longToDateStr(Date.now(), 0)];
                } else if (dayNumber == 7) {
                    this.dateVal = [DateFormat.longToDateStr(Date.now() - dayTime * 6, 0), DateFormat.longToDateStr(Date.now(), 0)];
                }
            },
            calcTableHeight: function () {
                var wHeight = window.innerHeight;
                this.lastTableHeight = wHeight - 170;
                this.posiDetailHeight = wHeight - 144;
            },

            onClickQuery: function () {
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
                    utils.sendAjax(url, data, function (resp) {
                        me.loading = false;
                        if (resp.status == 0) {
                            if (resp.records && resp.records.length) {
                                var newRecords = [];
                                var deviceName = vstore.state.deviceInfos[me.queryDeviceId].devicename;
                                resp.records.forEach(function (item) {
                                    var callon = item.callon.toFixed(5);
                                    var callat = item.callat.toFixed(5);
                                    var parkTime = me.getParkTime(item.endtime - item.starttime);
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
            getParkTime: function (mss) {
                var strTime = '';
                var days = parseInt(mss / (1000 * 60 * 60 * 24));
                var hours = parseInt((mss % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                var minutes = parseInt((mss % (1000 * 60 * 60)) / (1000 * 60));
                var seconds = parseInt((mss % (1000 * 60)) / 1000);
                days ? (strTime += days + this.$t("reportForm.d")) : '';
                hours ? (strTime += hours + this.$t("reportForm.h")) : '';
                minutes ? (strTime += minutes + this.$t("reportForm.m")) : '';
                seconds ? (strTime += seconds + this.$t("reportForm.s")) : '';
                return strTime == '' ? 0 : strTime;
            },
            getAddress: function (params) {
                var me = this;
                var row = params.row;
                var index = params.index;
                utils.queryAddress(row, function (address) {
                    me.tableData[index].address = address;
                    me.tableData[index].disabled = true;
                    LocalCacheMgr.setAddress(row.callon, row.callat, address);
                });
            },
            initMap: function () {
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
        mounted: function () {
            var me = this;
            this.initMap();
            this.groupslist = groupslist;
            this.calcTableHeight();
            window.onresize = function () {
                me.calcTableHeight();
            }
        }
    })
}

//acc报表
function accDetails (groupslist) {
    vueInstanse = new Vue({
        el: '#acc-details',
        i18n: utils.getI18n(),
        mixins: [reportMixin],
        data: {
            mapModal: false,
            mapType: utils.getMapType(),
            mapInstance: null,
            markerIns: null,
            loading: false,
            dateVal: [DateFormat.longToDateStr(Date.now(), 0), DateFormat.longToDateStr(Date.now(), 0)],
            lastTableHeight: 100,
            groupslist: [],
            timeoutIns: null,
            isShowMatchDev: true,
            columns: [
                { type: 'index', width: 60, align: 'center' },
                { title: vRoot.$t("alarm.devName"), key: 'deviceName', width: 160 },
                { title: vRoot.$t("alarm.devNum"), key: 'deviceid', width: 160 },
                { title: vRoot.$t("reportForm.accstatus"), key: 'accStatus' },
                { title: vRoot.$t("reportForm.startDate"), key: 'startDate', width: 180 },
                { title: vRoot.$t("reportForm.endDate"), key: 'endDate', width: 180 },
                { title: vRoot.$t("reportForm.duration"), key: 'duration' },
            ],
            tableData: []
        },
        methods: {
            onChange: function (value) {
                this.dateVal = value;
            },
            handleSelectdDate: function (dayNumber) {
                var dayTime = 24 * 60 * 60 * 1000;
                if (dayNumber == 0) {
                    this.dateVal = [DateFormat.longToDateStr(Date.now(), 0), DateFormat.longToDateStr(Date.now(), 0)];
                } else if (dayNumber == 1) {
                    this.dateVal = [DateFormat.longToDateStr(Date.now() - dayTime, 0), DateFormat.longToDateStr(Date.now() - dayTime, 0)];
                } else if (dayNumber == 3) {
                    this.dateVal = [DateFormat.longToDateStr(Date.now() - dayTime * 2, 0), DateFormat.longToDateStr(Date.now(), 0)];
                } else if (dayNumber == 7) {
                    this.dateVal = [DateFormat.longToDateStr(Date.now() - dayTime * 6, 0), DateFormat.longToDateStr(Date.now(), 0)];
                }
            },
            calcTableHeight: function () {
                var wHeight = window.innerHeight;
                this.lastTableHeight = wHeight - 170;
                this.posiDetailHeight = wHeight - 144;
            },
            onClickQuery: function () {
                if (this.queryDeviceId) {
                    var me = this;
                    var url = myUrls.reportAcc();
                    var data = {
                        startday: this.dateVal[0],
                        endday: this.dateVal[1],
                        offset: DateFormat.getOffset(),
                        deviceid: this.queryDeviceId
                    }
                    me.loading = true;
                    utils.sendAjax(url, data, function (resp) {
                        me.loading = false;
                        if (resp.status == 0) {
                            if (resp.records && resp.records.length) {
                                var newRecords = [];
                                var deviceName = vstore.state.deviceInfos[me.queryDeviceId].devicename;
                                resp.records.forEach(function (item) {
                                    var duration = me.getParkTime(item.endtime - item.begintime);
                                    newRecords.push({
                                        deviceid: item.deviceid,
                                        deviceName: deviceName,
                                        startDate: DateFormat.longToDateTimeStr(item.begintime, 0),
                                        endDate: DateFormat.longToDateTimeStr(item.endtime, 0),
                                        accStatus: item.accstate === 1 ? me.$t("reportForm.open") : me.$t("reportForm.stalling"),
                                        duration: duration
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
            getParkTime: function (mss) {
                var strTime = '';
                var days = parseInt(mss / (1000 * 60 * 60 * 24));
                var hours = parseInt((mss % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                var minutes = parseInt((mss % (1000 * 60 * 60)) / (1000 * 60));
                var seconds = parseInt((mss % (1000 * 60)) / 1000);
                days ? (strTime += days + this.$t("reportForm.d")) : '';
                hours ? (strTime += hours + this.$t("reportForm.h")) : '';
                minutes ? (strTime += minutes + this.$t("reportForm.m")) : '';
                seconds ? (strTime += seconds + this.$t("reportForm.s")) : '';
                return strTime == '' ? 0 : strTime;
            },
        },
        mounted: function () {
            var me = this;
            this.groupslist = groupslist;
            this.calcTableHeight();
            window.onresize = function () {
                me.calcTableHeight();
            }
        }
    })

}



function devRecords (groupslist) {
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
                    render: function (h, data) {
                        return h(
                            "a",
                            {
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
                    render: function (h, data) {
                        return h(
                            "audio",
                            {
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
            calcTableHeight: function () {
                var wHeight = window.innerHeight;
                this.tableHeight = wHeight - 125;
            },
            onClickQuery: function () {
                if (this.queryDeviceId == "") { return };
                var me = this;
                var url = myUrls.reportAudio();
                var data = {
                    deviceid: this.queryDeviceId
                }
                utils.sendAjax(url, data, function (resp) {
                    if (resp.status === 0) {
                        var records = resp.records;
                        var tableData = [];
                        records.forEach(function (record) {
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
        mounted: function () {
            var me = this;
            this.groupslist = groupslist;
            this.calcTableHeight();
            window.onresize = function () {
                me.calcTableHeight();
            }
        }
    });
}





// 查询报警
function allAlarm (groupslist) {
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
            calcTableHeight: function () {
                var wHeight = window.innerHeight;
                this.tableHeight = wHeight - 125;
            },
            onClickQuery: function () {
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
                utils.sendAjax(url, data, function (resp) {
                    if (resp.status == 0) {
                        var alarmRecords = [];
                        if (resp.alarmrecords && resp.alarmrecords.length) {
                            resp.alarmrecords.sort(function (a, b) { return b.lastalarmtime - a.lastalarmtime; });
                            resp.alarmrecords.forEach(function (record) {
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
            calcHeight: function () {
                return this.lastTableHeight + 45;
            }
        },
        mounted: function () {
            var me = this;
            me.groupslist = groupslist;
            this.calcTableHeight();
            this.$nextTick(function () {
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

function phoneAlarm (groupslist) {
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
            calcTableHeight: function () {
                var wHeight = window.innerHeight;
                this.tableHeight = wHeight - 125;
            },
            onClickQuery: function () {
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
                utils.sendAjax(url, data, function (resp) {
                    if (resp.status === 0) {
                        var records = resp.records;
                        var tableData = [];
                        records.forEach(function (record) {
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
        mounted: function () {
            var me = this;
            this.groupslist = groupslist;
            this.calcTableHeight();
            this.$nextTick(function () {
                if (isToPhoneAlarmRecords) {
                    isToPhoneAlarmRecords = false;
                    me.sosoValue = me.getDeviceTitle(globalDeviceId);
                    me.queryDeviceId = globalDeviceId;
                    me.onClickQuery();
                }
            });
            window.onresize = function () {
                me.calcTableHeight();
            }
        }
    });
}

function wechatAlarm (groupslist) {
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
            calcTableHeight: function () {
                var wHeight = window.innerHeight;
                this.tableHeight = wHeight - 125;
            },
            onClickQuery: function () {
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
                utils.sendAjax(url, data, function (resp) {
                    if (resp.status === 0) {
                        var records = resp.records;
                        var tableData = [];
                        records.forEach(function (record) {
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
        mounted: function () {
            var me = this;
            this.groupslist = groupslist;
            this.calcTableHeight();
            this.$nextTick(function () {
                if (isToPhoneAlarmRecords) {
                    isToPhoneAlarmRecords = false;
                    me.sosoValue = me.getDeviceTitle(globalDeviceId);
                    me.queryDeviceId = globalDeviceId;
                    me.onClickQuery();
                }
            });
            window.onresize = function () {
                me.calcTableHeight();
            }
        }
    });
}


function rechargeRecords (groupslist) {
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
            calcTableHeight: function () {
                var wHeight = window.innerHeight;
                this.tableHeight = wHeight - 125;
            },
            onClickQuery: function () {

                var me = this;
                var url = myUrls.reportChargeCall();
                var data = {
                    username: userName,
                }

                this.queryDeviceId && (data.deviceid = this.queryDeviceId);

                utils.sendAjax(url, data, function (resp) {
                    if (resp.status === 0) {
                        var records = resp.records;
                        var tableData = [];
                        records.forEach(function (record) {
                            tableData.push({
                                username: userName,
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
        mounted: function () {
            var me = this;
            this.groupslist = groupslist;
            this.calcTableHeight();
            window.onresize = function () {
                me.calcTableHeight();
            }
        }
    });
}


function insureRecords (groupslist) {
    new Vue({
        el: '#insure-records',
        i18n: utils.getI18n(),
        data: {
            error: 123,
            columns: [
                {
                    title: '是否付费', key: 'isPay', width: 100,
                    render: function (h, parmas) {
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
                    title: '合格证', key: 'carpicurl', width: 100,
                    render: function (h, parmas) {
                        return h('a', { attrs: { href: parmas.row.carpicurl, target: '_blank' } }, '点击预览');
                    }
                },
                {
                    title: '身份证正面', key: 'positivecardidurl', width: 100,
                    render: function (h, parmas) {
                        return h('a', { attrs: { href: parmas.row.positivecardidurl, target: '_blank' } }, '点击预览');
                    }
                },
                {
                    title: '身份证反面', key: 'negativecardidurl', width: 100,
                    render: function (h, parmas) {
                        return h('a', { attrs: { href: parmas.row.negativecardidurl, target: '_blank' } }, '点击预览');
                    }
                },
                {
                    title: '购车发票', key: 'invoiceurl', width: 100,
                    render: function (h, parmas) {
                        return h('a', { attrs: { href: parmas.row.invoiceurl, target: '_blank' } }, '点击预览');
                    }
                },
                {
                    title: '车主与车合影', key: 'groupphotourl', width: 120,
                    render: function (h, parmas) {
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
            calcTableHeight: function () {
                var wHeight = window.innerHeight;
                this.tableHeight = wHeight - 125;
            },
            changeTableColumns: function () {
                this.columns = this.getTableColumns();
            },
            queryInsures: function () {
                this.loading = true;
                var url = myUrls.queryInsures(), me = this;
                utils.sendAjax(url, { username: userName }, function (resp) {
                    console.log('resp', resp);
                    if (resp.status === 0) {
                        if (me.isFilter) {
                            me.tableData = (function () {
                                var tableData = [];
                                resp.insures.forEach(function (item) {
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
            exportData: function () {
                // this.$refs.table.exportCsv({
                //     filename: 'device info'
                // });
                var jsonData = this.tableData.map(function (item) {
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
                ].map(function (item) { return "<td>" + item + "</td>"; });
                var str = '<tr>' + columnsStr.join('') + '</tr>';
                for (var i = 0; i < jsonData.length; i++) {
                    str += '<tr>';
                    for (var item in jsonData[i]) {
                        str += `<td>${jsonData[i][item] + '\t'}</td>`;
                    }
                    str += '</tr>';
                }

                var worksheet = 'Sheet1'
                var uri = 'data:application/vnd.ms-excel;base64,';
                //下载的表格模板数据
                var template = `<html xmlns:o="urn:schemas-microsoft-com:office:office" 
                xmlns:x="urn:schemas-microsoft-com:office:excel" 
                xmlns="http://www.w3.org/TR/REC-html40">
                <head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>
                    <x:Name>${worksheet}</x:Name>
                    <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet>
                    </x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
                    </head><body><table>${str}</table></body></html>`;
                //下载模板
                window.location.href = uri + base64(template)

                function base64 (s) { return window.btoa(unescape(encodeURIComponent(s))) }
            },
        },
        mounted: function () {
            this.calcTableHeight();
            this.queryInsures();
        },
    })
}

// 统计报表
var reportForm = {
    template: document.getElementById('report-template').innerHTML,
    data: function () {
        var me = this;
        return {
            theme: "light",
            groupslist: [],
            activeName: "",
            openedNames: [],
            reportNavList: [
                {
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
            ]
        }
    },
    methods: {
        selectditem: function (name) {
            var pageName = name.toLowerCase() + ".html";
            this.loadPage(pageName);
        },
        loadPage: function (page) {
            var me = this;
            var pagePath = null;
            if (myUrls.host.indexOf('gpsserver') != -1) {
                pagePath = myUrls.host + 'view/reportform/' + page
            } else {
                pagePath = '../view/reportform/' + page
            }
            this.$Loading.start();
            $('#report-right-wrap').load(pagePath, function () {
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
                    case 'phonealarm.html':
                        phoneAlarm(groupslist);
                        break;
                    case 'insurerecords.html':
                        insureRecords(groupslist);
                        break;
                    case 'wechatalarm.html':
                        wechatAlarm(groupslist);
                        break;
                }
            });
        },
        getMonitorListByUser: function (callback) {
            var me = this
            var url = myUrls.monitorListByUser()
            utils.sendAjax(url, { username: userName }, function (resp) {
                if (resp.status == 0) {
                    if (resp.groups && resp.groups.length) {
                        callback(resp.groups);
                    }

                } else if (resp.status == 3) {
                    me.$Message.error(me.$t("monitor.reLogin"));
                    Cookies.remove('token');
                    setTimeout(function () {
                        window.location.href = 'index.html'
                    }, 2000);
                } else {
                    if (resp.cause) {
                        me.$Message.error(resp.cause)
                    }
                }
            })
        },
        toAlarmRecords: function (activeName, pageHtml) {
            var me = this;
            this.activeName = activeName;
            this.openedNames = ['warningReport'];
            this.$nextTick(function () {
                me.$refs.navMenu.updateOpened();
                me.loadPage(pageHtml);
            })
        }
    },
    mounted: function () {
        var me = this;
        this.getMonitorListByUser(function (groups) {
            me.groupslist = utils.getPinyin(groups);
            if (isToAlarmListRecords) {
                me.toAlarmRecords("allAlarm", "allalarm.html");
            } else if (isToPhoneAlarmRecords) {
                me.toAlarmRecords("phoneAlarm", "phonealarm.html");
            }
        })
    }
}