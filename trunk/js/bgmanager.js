// 后台管理
var bgManager = {
    template: document.getElementById('manager-template').innerHTML,
    data: function () {
        var me = this;
        return {
            userType: null,
            theme: 'light',
            navList: [
                {
                    title: me.$t("bgMgr.customerMgr"),
                    name: 'customerMar',
                    icon: 'md-contact',
                    children: [
                        { title: me.$t("bgMgr.addCustomer"), name: 'addCustomer', icon: 'md-person-add' },
                        { title: me.$t("bgMgr.queryCustomer"), name: 'queryCustomer', icon: 'md-search' }
                    ]
                },
                {
                    title: me.$t("bgMgr.userMgr"),
                    name: 'userMar',
                    icon: 'md-person',
                    children: [
                        { title: me.$t("bgMgr.addUser"), name: 'addUser', icon: 'ios-person-add' },
                        { title: me.$t("bgMgr.queryUser"), name: 'queryUser', icon: 'md-search' }
                    ]
                },
                {
                    title: me.$t("bgMgr.groupMgr"),
                    name: 'groupMar',
                    icon: 'ios-albums',
                    children: [
                        { title: me.$t("bgMgr.addGroup"), name: 'addGroup', icon: 'ios-photos-outline' },
                        { title: me.$t("bgMgr.queryGroup"), name: 'queryGroup', icon: 'md-search' }
                    ]
                },
                {
                    title: me.$t("bgMgr.devMgr"),
                    name: 'deviceMar',
                    icon: 'md-phone-portrait',
                    children: [
                        { title: me.$t("bgMgr.queryDev"), name: 'queryDevice', icon: 'md-search' },
                        { title: me.$t("bgMgr.addDev"), name: 'addDevice', icon: 'md-add' },
                        { title: "批量添加", name: 'batchAddDevice', icon: 'md-add' },
                        { title: "续费管理", name: 'chargeMgr', icon: 'ios-apps-outline' }
                    ]
                }
            ]
        }
    },
    methods: {
        selectditem: function (name) {
            if (this.currentPage == name) {
                return
            }
            var page = null
            switch (name) {
                case 'addCustomer':
                    page = 'addcustomer.html'
                    break
                case 'queryCustomer':
                    page = 'querycustomer.html'
                    break
                case 'addGroup':
                    page = 'addgroup.html'
                    break
                case 'queryGroup':
                    page = 'querygroup.html'
                    break
                case 'addDevice':
                    page = 'adddevice.html'
                    break
                case 'batchAddDevice':
                    page = 'batchadddevice.html'
                    break
                case 'queryDevice':
                    page = 'querydevice.html'
                    break
                case 'addUser':
                    page = 'adduser.html'
                    break
                case 'queryUser':
                    page = 'queryuser.html'
                    break
                case 'chargeMgr':
                    page = 'chargemgr.html'
                    break
            }
            this.currentPage = name
            this.loadPage(page)
        },
        loadPage: function (page) {
            var me = this
            var pagePath = null
            if(page == "chargemgr.html"){
                if (myUrls.host.indexOf('gpsserver') != -1) {
                    pagePath = myUrls.host + '/' + page
                } else {
                    pagePath = './' + page
                }
                window.open(pagePath+ '?token=' + token);
                $('#mar-view').html("");
                return;
            }
            if (myUrls.host.indexOf('gpsserver') != -1) {
                pagePath = myUrls.host + 'view/manager/' + page
            } else {
                pagePath = '../view/manager/' + page
            }
            this.$Loading.start()
            $('#mar-view').load(pagePath, function () {
                me.$Loading.finish()
            })
        }
    },
    mounted: function () {
        this.userType = Cookies.get('userType');
        if (this.userType == "2") {
            this.navList.splice(0, 1);
            this.navList[0].children.splice(0, 1);
        };
    }
}

// 系统参数
var systemParam = {
    template: document.getElementById('systemparam-template'),
    data: function () {
        return {
            selectdItemName: null,
            theme: 'light',
            navList: [
                {
                    title: '设备指令',
                    name: 'deviceDirective',
                    icon: 'ios-pricetag-outline',
                    children: [
                        { title: '新增指令', name: 'addDirective', icon: 'md-add' },
                        { title: '查询指令', name: 'queryDirective', icon: 'md-search' }
                    ]
                },
                {
                    title: '设备类型',
                    name: 'deviceType',
                    icon: 'ios-albums'
                    // children:[
                    //     {title:"新增设备类型",name:"addDeviceType",icon:"md-add"},
                    //     {title:"查询设备类型",name:"queryDeviceType",icon:"md-search"}
                    // ]
                },
                {
                    title: '车辆类型',
                    name: 'carType',
                    icon: 'ios-car'
                    // children:[
                    //     {title:"新增车辆类型",name:"addCarType",icon:"md-add"},
                    //     {title:"查询车辆类型",name:"queryCarType",icon:"md-search"}
                    // ]
                }
            ]
        }
    },
    methods: {
        selectditem: function (name) {
            if (this.selectdItemName != name  && name != "") {
                this.selectdItemName = name
                this.changeItem()
            }
        },
        changeItem: function () {
            var page = null

            switch (this.selectdItemName) {
                case 'queryDirective':
                    page = 'devicedirective.html'
                    break
                case 'addDirective':
                    page = 'adddirective.html'
                    break
                case 'deviceType':
                    page = 'devicetype.html'
                    break
                case 'carType':
                    page = 'cartype.html'
                    break
            }

            this.loadPage(page)
        },
        loadPage: function (page) {
            var me = this
            var pagePath = null
            if (myUrls.host.indexOf('gpsserver') != -1) {
                pagePath = myUrls.host + 'view/systemparam/' + page
            } else {
                pagePath = '../view/systemparam/' + page
            }
            this.$Loading.start()
            $('#system-view').load(pagePath, function () {
                me.$Loading.finish();
            });
        }
    }
}