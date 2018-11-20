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
            list.forEach(function (itme) {
                if (!itme.children) {
                    deviceids.push(itme.deviceid)
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
    },
}



//  指令查询 DateFormat.longToDateStr(Date.now(),0)
function cmdReport (groupslist) {

    new Vue({
        el: "#cmd-report",
        data: {
            loading: false,
            selectdDeviceList: [],
            // isSelectAll: null,
            // dateVal: [DateFormat.longToDateStr(Date.now(), 0), DateFormat.longToDateStr(Date.now(), 0)],
            // total: 0,
            // currentPageIndex: 1,
            groupslist: [],
            columns: [
                { title: '编号', key: "index", width: 60, align: 'center' },
                { title: '设备名称', key: 'deviceName' },
                { title: '命令名称', key: 'cmdname' },
                { title: '发送时间', key: 'cmdtimeStr', sortable: "custom" },
                { title: '发送内容', key: 'cmdparams' },
                { title: '发送结果', key: 'result' },
            ],
            tableData: [],
            cmdRecords: []
        },
        mixins: [reportMixin],
        methods: {
            onSelectdDeviceIds: function (result) {
                if (result.isAll !== null) {
                    this.selectdDeviceList = result.deviceids;
                } else {
                    this.selectdDeviceList = [];
                }
                console.log(result);
                this.isSelectAll = result.isAll;
            },
            onClickQuery: function () {
                var self = this;
                if (this.isSelectAll === null) {
                    this.$Message.error("请选择设备");
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
                            });
                            self.cmdRecords = resp.cmdrecords;
                            self.total = self.cmdRecords.length;
                            self.tableData = self.cmdRecords.slice(0, 10);
                            self.currentPageIndex = 1;
                        } else {
                            self.$Message.error("没有记录");
                        }
                    } else {
                        self.$Message.error(resp.cause);
                    }
                })
            }
        },
        mounted () {
            this.groupslist = groupslist;
        }
    });
}

// 查询报警
function allAlarm (groupslist) {
    new Vue({
        el: "#all-alarm",
        data: {
            groupslist: [],
            selectdDeviceList: [],
        },
        mixins: [reportMixin],
        methods: {
            onClickQuery: function () {
                console.log('aaa', this.selectdDeviceList);
            }
        },
        mounted () {
            this.groupslist = groupslist;
        }
    })
}



// 统计报表
var reportForm = {
    template: document.getElementById('report-template').innerHTML,
    data: function () {
        return {
            theme: "light",
            groupslist: [],
            reportNavList: [
                {
                    title: '行驶报表',
                    name: 'reportMar',
                    icon: 'ios-photos',
                    children: [
                        { title: '命令报表', name: 'cmdReport', icon: 'ios-subway' },
                    ]
                },
                {
                    title: '报警报表',
                    name: 'warningMar',
                    icon: 'logo-wordpress',
                    children: [
                        { title: '全部报警', name: 'allAlarm', icon: 'md-warning' },
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
                if (page.indexOf('cmdreport') !== -1) {
                    cmdReport(groupslist);
                } else if (page.indexOf('allalarm') !== -1) {
                    allAlarm(groupslist);
                }
            });
        },
        getMonitorListByUser: function (callback) {
            var me = this
            var url = myUrls.monitorListByUser()
            utils.sendAjax(url, { havecompany: 0 }, function (resp) {
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
        }
    },
    mounted: function () {
        var me = this;
        this.getMonitorListByUser(function (groups) {
            me.groupslist = groups;
        })
    }
}