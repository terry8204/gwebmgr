Vue.component('tree-demo', {
    template: document.getElementById("tree-demo-template"),
    data () {
        return {
            something: "",
            allCount: 0,
            visibleTree: false
        }
    },
    props: {
        groupslist: {
            type: Array,
            default: function () {
                return []
            }
        }
    },
    methods: {
        onClickOutside: function () {
            this.visibleTree = false;
        },
        onFocus: function () {
            this.visibleTree = true;
        },
        onCheckChange: function (list) {
            this.something = list.map(function (item) { return item.title }).join(",");
            var result = this.isCheckAll(list);
            this.$emit("on-selectd-deviceids", result)
        },
        isCheckAll: function (list) {
            var deviceids = [];
            list.forEach(function (item) {
                if (!item.children) {
                    deviceids.push(item.deviceid)
                };
            })
            if (list.length === this.allCount) {
                return {
                    isAll: true,
                    deviceids: deviceids
                }
            } else if (list.length == 0) {
                return {
                    isAll: null,
                }
            } else {
                return {
                    isAll: false,
                    deviceids: deviceids
                }
            }
        }
    },
    watch: {
        groupslist: function () {
            var count = 0;
            this.groupslist.forEach(function (item) {
                count++;
                item.children.forEach(function (device) {
                    count++;
                })
            });
            this.allCount = count;
        }
    },
    mounted: function () {

    }
})

var reportMixin = {
    data: {
        isSelectAll: null,
        dateVal: [DateFormat.longToDateStr(Date.now(), 0), DateFormat.longToDateStr(Date.now(), 0)],
        total: 0,
        currentPageIndex: 1,
        lastTableHeight: 100,
        posiDetailHeight: 100
    },
    methods: {
        changePage: function (index) {
            var offset = index * 10;
            var start = (index - 1) * 10;
            this.currentPageIndex = index;
            this.tableData = this.cmdRecords.slice(start, offset);
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
        onSelectdDeviceIds: function (result) {
            if (result.isAll !== null) {
                this.selectdDeviceList = result.deviceids;
            } else {
                this.selectdDeviceList = [];
            }
            this.isSelectAll = result.isAll;
        },
        calcTableHeight: function () {
            var wHeight = window.innerHeight;
            this.lastTableHeight = wHeight - 170;
            this.posiDetailHeight = wHeight - 144;
        },
    },
    mounted: function () {
        var me = this;
        this.calcTableHeight();
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
            selectdDeviceList: [],
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
            onClickQuery: function () {
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
                    devices: this.selectdDeviceList
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
                            })
                            self.cmdRecords = resp.cmdrecords;
                            self.total = self.cmdRecords.length;
                            self.tableData = self.cmdRecords;
                            // self.tableData = self.cmdRecords.slice(0, 10);
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
            selectdDeviceList: [],
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
                { title: vRoot.$t("reportForm.date"), key: 'arrivedTimeStr', width: 160 },
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
                { title: vRoot.$t("reportForm.date"), key: 'arrivedTimeStr', width: 160, sortable: true },
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
                                        vueInstanse.mapModal = true;
                                        var row = params.row;
                                        if (vueInstanse.mapType == 'bMap') {
                                            var b_lon_lat = wgs84tobd09(Number(row.callon), Number(row.callat));
                                            var point = new BMap.Point(b_lon_lat[0], b_lon_lat[1]);
                                            var marker = new BMap.Marker(point);
                                            setTimeout(function () {
                                                vueInstanse.mapInstance.clearOverlays();
                                                vueInstanse.mapInstance.addOverlay(marker);
                                                vueInstanse.mapInstance.panTo(point);
                                            }, 100);
                                        } else {
                                            if (vueInstanse.markerIns) {
                                                vueInstanse.markerIns.setMap(null);
                                            }
                                            var g_lon_lat = wgs84togcj02(Number(row.callon), Number(row.callat));
                                            var latLng = new google.maps.LatLng(g_lon_lat[1], g_lon_lat[0]);

                                            vueInstanse.markerIns = new MarkerWithLabel({
                                                position: latLng,
                                                map: vueInstanse.mapInstance,
                                            });
                                            vueInstanse.mapInstance.setZoom(18);
                                            setTimeout(function () {
                                                vueInstanse.mapInstance.panTo(latLng);
                                            }, 100);
                                        }
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
            onClickQuery: function () {
                var me = this;
                if (this.selectdDeviceList.length) {
                    this.tabValue = "lastPosi";
                    this.loading = true;
                    this.getLastPosition(this.selectdDeviceList, function () {
                        me.loading = false;
                    });
                } else {
                    this.$Message.error(this.$t("reportForm.selectDevTip"));
                }
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
                            resp.records.forEach((item) => {

                                if (item) {
                                    var deviceid = item.deviceid;
                                    item.devicename = vstore.state.deviceInfos[deviceid].devicename;
                                    item.arrivedTimeStr = DateFormat.longToDateTimeStr(item.arrivedtime, 0);
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
                    } else if (resp.status == 3) {
                        me.$Message.error(me.$t("monitor.reLogin"));
                        Cookies.remove('token');
                        setTimeout(function () {
                            window.location.href = 'index.html';
                        }, 2000);
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
                                return a.arrivedtime - b.arrivedtime;
                            });
                            resp.records.forEach(function (item) {
                                var fixedLon = item.callon.toFixed(5);
                                var fixedLat = item.callat.toFixed(5);
                                var address = LocalCacheMgr.getAddress(fixedLon, fixedLat);
                                newArr.push({
                                    deviceid: item.deviceid,
                                    devicename: devicename,
                                    arrivedTimeStr: DateFormat.longToDateTimeStr(item.arrivedtime, 0),
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
                            me.posiDetailData = newArr;
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
// 里程总览
function reportMileageSummary (groupslist) {
    new Vue({
        el: "#mileage-report",
        i18n: utils.getI18n(),
        mixins: [reportMixin],
        data: {
            loading: false,
            groupslist: [],
            columns: [
                { title: vRoot.$t("alarm.devName"), key: 'deviceName' },
                { title: vRoot.$t("user.grouping"), key: 'groupName' },
                { title: vRoot.$t("reportForm.mileage"), key: 'totalDistance' },
            ],
            tableData: [],
        },
        methods: {
            onClickQuery: function () {
                var me = this;
                if (this.selectdDeviceList.length) {
                    var url = myUrls.reportMileageSummary();
                    var data = {
                        startday: this.dateVal[0],
                        endday: this.dateVal[1],
                        offset: DateFormat.getOffset(),
                        devices: this.selectdDeviceList
                    };
                    me.loading = true;
                    utils.sendAjax(url, data, function (resp) {
                        me.loading = false;
                        if (resp.status == 0) {
                            if (resp.records.length) {
                                var data = me.getTableData(resp.records);
                                me.tableData = data;
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
            getTableData: function (records) {
                var me = this;
                var newArray = [];
                records.forEach(function (item) {
                    newArray.push({
                        deviceName: vstore.state.deviceInfos[item.deviceid].devicename,
                        groupName: me.getGroupName(item.deviceid),
                        totalDistance: utils.getMileage(item.totaldistance)
                    })
                })
                return newArray
            },
            getGroupName: function (deviceid) {
                var groupName = "";
                for (var i = 0; i < this.groupslist.length; i++) {
                    var group = this.groupslist[i];
                    for (var j = 0; j < group.children.length; j++) {
                        var device = group.children[j];
                        if (deviceid == device.deviceid) {
                            groupName = group.title;
                            break;
                        }
                    }
                };
                return groupName;
            },

        },
        mounted: function () {
            this.groupslist = groupslist;
        }
    })

}
// 里程详单
function reportMileageDetail (groupslist) {
    new Vue({
        el: '#mileage-detail',
        i18n: utils.getI18n(),
        data: {
            placeholder: vRoot.$t("monitor.placeholder"),
            loading: false,
            dateVal: [DateFormat.longToDateStr(Date.now(), 0), DateFormat.longToDateStr(Date.now(), 0)],
            lastTableHeight: 100,
            queryDeviceId: '',
            groupslist: [],
            filterData: [],
            sosoValue: '',
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
            focus: function () {
                var me = this;
                if (this.sosoValue.trim()) {
                    me.sosoValueChange()
                } else {
                    this.filterData = this.groupslist;
                    this.isShowMatchDev = true;
                }
            },
            onClickOutside: function () {
                this.isShowMatchDev = false;
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
                this.queryDeviceId = '';
                var firstLetter = __pinyin.getFirstLetter(value)
                var pinyin = __pinyin.getPinyin(value)
                for (var i = 0; i < this.groupslist.length; i++) {
                    var group = this.groupslist[i];
                    if (
                        group.groupname.toUpperCase().indexOf(value.toUpperCase()) !== -1 ||
                        group.firstLetter.indexOf(firstLetter) !== -1 ||
                        group.pinyin.indexOf(pinyin) !== -1
                    ) {
                        filterData.push(group)
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
                            filterData.push(obj);
                        };
                    };
                };
                this.filterData = filterData;
                if (!this.isShowMatchDev) {
                    this.isShowMatchDev = true;
                };
            },
            sosoSelect: function (item) {
                this.sosoValue = item.devicename;
                this.queryDeviceId = item.deviceid;
                this.isShowMatchDev = false;
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
            },
            getPinyin: function (groupslist) {
                var newArr = [];

                groupslist.forEach(function (group) {
                    var groupObj = {
                        firstLetter: __pinyin.getFirstLetter(group.title),
                        pinyin: __pinyin.getPinyin(group.title),
                        groupname: group.title,
                        devices: []
                    };
                    group.children.forEach(function (device) {
                        groupObj.devices.push({
                            deviceid: device.deviceid,
                            devicename: device.title,
                            firstLetter: __pinyin.getFirstLetter(device.title),
                            pinyin: __pinyin.getPinyin(device.title),
                        })
                    })
                    newArr.push(groupObj);
                });
                return newArr;
            }
        },
        mounted: function () {
            var me = this;
            this.groupslist = this.getPinyin(groupslist);
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
        data: {
            mapType: utils.getMapType(),
            placeholder: vRoot.$t("monitor.placeholder"),
            loading: false,
            dateVal: [DateFormat.longToDateStr(Date.now(), 0), DateFormat.longToDateStr(Date.now(), 0)],
            lastTableHeight: 100,
            queryDeviceId: '',
            groupslist: [],
            filterData: [],
            sosoValue: '',
            timeoutIns: null,
            isShowMatchDev: true,
            columns: [
                { type: 'index', width: 60, align: 'center', fixed: 'left' },
                { title: vRoot.$t("alarm.devName"), key: 'deviceName', width: 160, fixed: 'left' },
                { title: vRoot.$t("reportForm.startDate"), key: 'startDate', width: 180 },
                { title: vRoot.$t("reportForm.endDate"), key: 'endDate', width: 180 },
                { title: vRoot.$t("reportForm.parkDate"), key: 'parkTime', width: 160 },
                { title: vRoot.$t("reportForm.lon"), key: 'callon', width: 100 },
                { title: vRoot.$t("reportForm.lat"), key: 'callat', width: 100 },
                { title: vRoot.$t("reportForm.status"), key: 'strStatus', width: 240 },
                { title: vRoot.$t("reportForm.address"), key: 'address', width: 350 },
                {
                    title: vRoot.$t("bgMgr.action"),
                    key: 'action',
                    width: 130,
                    fixed: 'right',
                    render: function (h, params) {
                        return h('Button', {
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
                        }, vRoot.$t("reportForm.getAddress"))
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
            focus: function () {
                var me = this;
                if (this.sosoValue.trim()) {
                    me.sosoValueChange()
                } else {
                    this.filterData = this.groupslist;
                    this.isShowMatchDev = true;
                }
            },
            onClickOutside: function () {
                this.isShowMatchDev = false;
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
                this.queryDeviceId = '';
                var firstLetter = __pinyin.getFirstLetter(value)
                var pinyin = __pinyin.getPinyin(value)
                for (var i = 0; i < this.groupslist.length; i++) {
                    var group = this.groupslist[i];
                    if (
                        group.groupname.toUpperCase().indexOf(value.toUpperCase()) !== -1 ||
                        group.firstLetter.indexOf(firstLetter) !== -1 ||
                        group.pinyin.indexOf(pinyin) !== -1
                    ) {
                        filterData.push(group)
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
                            filterData.push(obj);
                        };
                    };
                };
                this.filterData = filterData;
                if (!this.isShowMatchDev) {
                    this.isShowMatchDev = true;
                };
            },
            sosoSelect: function (item) {
                this.sosoValue = item.devicename;
                this.queryDeviceId = item.deviceid;
                this.isShowMatchDev = false;
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
                                        callon: callon,
                                        callat: callat,
                                        strStatus: isZh ? item.strstatus : item.strstatusen,
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
            getPinyin: function (groupslist) {
                var newArr = [];

                groupslist.forEach(function (group) {
                    var groupObj = {
                        firstLetter: __pinyin.getFirstLetter(group.title),
                        pinyin: __pinyin.getPinyin(group.title),
                        groupname: group.title,
                        devices: []
                    };
                    group.children.forEach(function (device) {
                        groupObj.devices.push({
                            deviceid: device.deviceid,
                            devicename: device.title,
                            firstLetter: __pinyin.getFirstLetter(device.title),
                            pinyin: __pinyin.getPinyin(device.title),
                        })
                    })
                    newArr.push(groupObj);
                });
                return newArr;
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
            }
        },
        mounted: function () {
            var me = this;
            this.groupslist = this.getPinyin(groupslist);
            this.calcTableHeight();
            window.onresize = function () {
                me.calcTableHeight();
            }
        }
    })
}

// 查询报警
function allAlarm (groupslist) {
    new Vue({
        el: "#all-alarm",
        i18n: utils.getI18n(),
        data: {
            loading: false,
            groupslist: [],
            selectdDeviceList: [],
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
        },
        mixins: [reportMixin],
        methods: {
            onClickQuery: function () {
                var self = this;
                if (this.isSelectAll === null) {
                    this.$Message.error(self.$t("reportForm.selectDevTip"));
                    return;
                };
                var data = {
                    devices: this.selectdDeviceList
                };
                this.loading = true;
                var url = myUrls.reportAlarm();
                utils.sendAjax(url, data, function (resp) {
                    if (resp.status == 0) {
                        var alarmRecords = [];
                        if (resp.alarmrecords && resp.alarmrecords.length) {
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
                                })
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
            }
        },
        computed: {
            calcHeight: function () {
                return this.lastTableHeight + 45;
            }
        },
        mounted: function () {
            this.groupslist = groupslist;
        }
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
            reportNavList: [
                {
                    title: me.$t("reportForm.drivingReport"),
                    name: 'drivingReport',
                    icon: 'ios-photos',
                    children: [
                        { title: me.$t("reportForm.cmdReport"), name: 'cmdReport', icon: 'ios-pricetag-outline' },
                        { title: me.$t("reportForm.posiReport"), name: 'posiReport', icon: 'ios-pin' },
                        { title: me.$t("reportForm.reportmileagesummary"), name: 'reportMileageSummary', icon: 'ios-bicycle' },
                        { title: me.$t("reportForm.reportmileagedetail"), name: 'mileageDetail', icon: 'ios-color-wand' },
                        { title: me.$t("reportForm.parkDetails"), name: 'parkDetails', icon: 'md-analytics' },
                    ]
                },
                {
                    title: me.$t("reportForm.warningReport"),
                    name: 'warningReport',
                    icon: 'logo-wordpress',
                    children: [
                        { title: me.$t("reportForm.allAlarm"), name: 'allAlarm', icon: 'md-warning' },
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
            var me = this
            var pagePath = null
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
                if (page.indexOf('cmdreport') !== -1) {
                    cmdReport(groupslist);
                } else if (page.indexOf('allalarm') !== -1) {
                    allAlarm(groupslist);
                } else if (page.indexOf('posireport') !== -1) {
                    posiReport(groupslist);
                } else if (page.indexOf('reportmileagesummary') !== -1) {
                    reportMileageSummary(groupslist);
                } else if (page.indexOf('mileagedetail') !== -1) {
                    reportMileageDetail(groupslist);
                } else if (page.indexOf('parkdetails') !== -1) {
                    parkDetails(groupslist);
                }
            });
        },
        getMonitorListByUser: function (callback) {
            var me = this
            var url = myUrls.monitorListByUser()
            utils.sendAjax(url, { username: userName }, function (resp) {
                if (resp.status == 0) {
                    var newGroups = []
                    resp.groups.forEach(function (group) {
                        if (group.devices.length) {
                            var groupObj = { title: group.groupname, expand: true, children: [] };
                            group.devices.forEach(function (device) {
                                var deviceObj = { title: device.devicename, deviceid: device.deviceid };
                                groupObj.children.push(deviceObj);
                            })
                            if (groupObj.children.length) {
                                newGroups.push(groupObj);
                            }
                        }
                    })
                    if (newGroups.length) {
                        callback(newGroups);
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
        }
    },
    mounted: function () {
        var me = this;
        this.getMonitorListByUser(function (groups) {
            me.groupslist = groups;
        })
    }
}