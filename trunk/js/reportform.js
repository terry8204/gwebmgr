// DateFormat.longToDateStr(Date.now(),0)
function cmdReport (groupslist) {
    console.log('groupslist', groupslist);
    new Vue({
        el: "#cmd-report",
        data: {
            isSelectAll: null,
            dateVal: [DateFormat.longToDateStr(Date.now(), 0), DateFormat.longToDateStr(Date.now(), 0)],
            selectdDeviceList: [],
            groupslist: [],
            columns: [
                { type: 'index', width: 60, align: 'center' },
                { title: '设备名称', key: 'deviceName' },
                { title: '发送时间', key: 'sendtime' },
                { title: '发送命令', key: 'sendcmd' },
                { title: '发送内容', key: 'sendcontent' },
            ],
            tableData: [
                { deviceName: 12121 },
                { deviceName: 12121 },
                { deviceName: 12121 },
                { deviceName: 12121 },
                { deviceName: 12121 },
            ],
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
            onSelectdDeviceIds: function (result) {
                if (result.isAll !== null) {
                    if (result.isAll) {
                        this.selectdDeviceList = [];
                    } else {
                        this.selectdDeviceList = result.deviceids;
                    }
                }
                this.isSelectAll = result.isAll;
                console.log('result', result);
            },
            onClickQuery: function () {
                if (this.isSelectAll === null) {
                    this.$Message.error("请选择设备");
                    return;
                }
                var data = {
                    username: vstore.state.userName,
                    startday: this.dateVal[0],
                    endday: this.dateVal[1],
                    offset: DateFormat.getCurrentUTC()
                }

                if (this.isSelectAll === false) {
                    data.devices = this.selectdDeviceList;
                    console.log('result', "bushi全部");
                }
                console.log('data', data);
                var url = myUrls.reportCmd();
                utils.sendAjax(url, data, function (resp) {
                    console.log('resp', resp);
                })
            }
        },
        components: {
            treeDemo: {
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

                        if (list.length === this.allCount) {
                            return {
                                isAll: true,
                            }
                        } else if (list.length == 0) {
                            return {
                                isAll: null,
                            }
                        } else {
                            var deviceids = [];
                            list.forEach(function (itme) {
                                if (!itme.children) {
                                    deviceids.push(itme.deviceid)
                                };
                            })
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
                        console.log('tag', count);
                    }
                }
            }
        },
        mounted () {
            this.groupslist = groupslist;
        }
    });
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
                        { title: '超速报表', name: 'chaosuReport', icon: 'ios-subway' },
                        { title: '位置报表', name: 'weizhiReport', icon: 'md-pin' }
                    ]
                },
                {
                    title: '报警报表',
                    name: 'warningMar',
                    icon: 'logo-wordpress',
                    children: [
                        { title: '全部报警', name: 'allWarning', icon: 'md-warning' },
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
                if (page.indexOf('cmdreport') !== -1) {
                    cmdReport(me.groupslist);
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