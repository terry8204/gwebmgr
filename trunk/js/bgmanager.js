// 后台管理
var bgManager = {
    template: document.getElementById('manager-template').innerHTML,
    data: function() {
        var me = this;
        return {
            userType: null,
            theme: 'light',
            navList: [

                {
                    title: me.$t("bgMgr.userMgr"),
                    name: 'userMar',
                    icon: 'md-person',
                    children: [
                        { title: me.$t("bgMgr.addUser"), name: 'addUser', icon: 'ios-person-add' },
                        { title: me.$t("bgMgr.queryUser"), name: 'queryUser', icon: 'md-search' },
                        { title: me.$t("bgMgr.onlineUsers"), name: 'onlineUsers', icon: 'ios-analytics' },
                        { title: me.$t("header.loginRecords"), name: 'loginRecords', icon: 'ios-clipboard-outline' },
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
                        { title: me.$t("bgMgr.batchAdd"), name: 'batchAddDevice', icon: 'md-add' },
                        { title: me.$t("bgMgr.batchMgr"), name: 'batchMgrDevice', icon: 'ios-folder-outline' },
                        { title: me.$t("bgMgr.stockDev"), name: 'stockDev', icon: 'md-cube' },
                        { title: me.$t("bgMgr.notPutIntoStorage"), name: 'notPutIntoStorage', icon: 'md-basket' },
                        { title: me.$t("bgMgr.renewMgr"), name: 'chargeMgr', icon: 'ios-apps-outline' },
                        { title: me.$t("bgMgr.clearRecord"), name: "clearRecord", icon: "ios-paw" },
                        { title: me.$t("bgMgr.setMileage"), name: "setMileage", icon: "md-paper" },
                    ]
                },
                {
                    title: me.$t("bgMgr.operateMgr"),
                    name: 'operateMar',
                    icon: 'ios-analytics',
                    children: [
                        { title: me.$t("bgMgr.importOwnerInfo"), name: 'ImportOwner', icon: 'md-add' },
                        { title: me.$t("bgMgr.importInsureInfo"), name: 'ImportInsure', icon: 'md-add' },
                        { title: me.$t("bgMgr.importPolicyInfo"), name: 'ImportInsure2', icon: 'md-add' },
                        { title: me.$t("bgMgr.importVin"), name: 'ImportVehicleNumber', icon: 'md-add' },
                        { title: me.$t("bgMgr.importOfflineInsurePolicyInfo"), name: 'ImportOfflineInsure', icon: 'md-add' },
                        { title: me.$t("bgMgr.importSimInfo"), name: 'ImportSim', icon: 'md-add' },
                        { title: me.$t("bgMgr.importDeviceName"), name: 'ImportDeviceName', icon: 'md-add' },
                    ]
                },
                {
                    title: me.$t("bgMgr.repairMgr"),
                    name: 'repairMar',
                    icon: 'md-build',
                    children: [
                        { title: me.$t("bgMgr.addRepair"), name: 'addRepair', icon: 'ios-add' },
                        { title: me.$t("bgMgr.repairRecord"), name: 'repairRecord', icon: 'ios-document' },
                    ]
                },
                {
                    title: "续费管理",
                    name: 'priceMar',
                    icon: 'logo-windows',
                    children: [
                        { title: "价格表", name: 'priceList', icon: 'logo-apple' },
                    ]
                },
            ]
        }
    },
    methods: {
        selectditem: function(name) {
            window.onresize = null;
            utils.deviceInfos = {};
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
                case 'onlineUsers':
                    page = 'onlineusers.html'
                    break
                case 'loginRecords':
                    page = 'loginrecords.html'
                    break
                case 'chargeMgr':
                    page = 'chargemgr.html'
                    break
                case 'batchMgrDevice':
                    page = 'batchmgr.html'
                    break
                case 'stockDev':
                    page = 'stockdev.html'
                    break
                case 'notPutIntoStorage':
                    page = 'notputintostorage.html'
                    break
                case 'ImportOwner':
                    page = 'importowner.html'
                    break
                case 'ImportInsure':
                    page = 'importinsure.html'
                    break
                case 'ImportInsure2':
                    page = 'importinsure2.html'
                    break
                case 'ImportVehicleNumber':
                    page = 'Importvehiclenumber.html'
                    break
                case 'ImportOfflineInsure':
                    page = 'importofflineinsure.html'
                    break
                case 'ImportSim':
                    page = 'importsim.html'
                    break
                case 'ImportDeviceName':
                    page = 'importdevicename.html'
                    break
                case 'repairRecord':
                    page = 'repairrecord.html'
                    break
                case 'addRepair':
                    page = 'addrepair.html'
                    break
                case 'clearRecord':
                    page = 'clearrecord.html'
                    break
                case 'setMileage':
                    page = 'setmileage.html'
                    break
                case 'priceList':
                    page = 'pricelist.html'
                    break
            }
            this.currentPage = name
            this.loadPage(page)
        },
        loadPage: function(page) {
            var me = this
            var pagePath = null
            if (page == "chargemgr.html") {
                if (utils.isLocalhost()) {
                    pagePath = myUrls.viewhost + '/' + page
                } else {
                    pagePath = './' + page
                }
                window.open(pagePath + '?token=' + token + "&username=" + userName);
                $('#mar-view').html("");
                return;
            }
            if (utils.isLocalhost()) {
                pagePath = myUrls.viewhost + 'view/manager/' + page
            } else {
                pagePath = '../view/manager/' + page
            }
            this.$Loading.start()
            $('#mar-view').load(pagePath, function() {
                me.$Loading.finish()
            })
        }
    },
    mounted: function() {
        this.userType = localStorage.getItem('userType');
        if (this.userType == "3") {
            this.navList.splice(0, 1);
            // this.navList[0].children.splice(0, 1);
        };
    }
}

// 系统参数
var systemParam = {
    template: document.getElementById('systemparam-template'),
    data: function() {
        return {
            selectdItemName: null,
            theme: 'light',
            navList: [{
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
                },
                {
                    title: '车辆类型',
                    name: 'carType',
                    icon: 'ios-car'
                },
                {
                    name: "systemManager",
                    icon: "ios-bug",
                    title: "系统管理",
                    children: [{
                            title: "系统参数",
                            name: "serverSetting",
                            icon: "ios-bug"
                        },
                        {
                            title: "登录记录",
                            name: "loginRecords",
                            icon: "ios-bug"
                        },
                    ]
                }
            ]
        }
    },
    methods: {
        selectditem: function(name) {
            if (this.selectdItemName != name && name != "") {
                this.selectdItemName = name
                this.changeItem()
            }
        },
        changeItem: function() {
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
                case 'serverSetting':
                    window.open('serversetting.html?token=' + token);
                    break
                case 'loginRecords':
                    window.open("loginrecords.html?token=" + token);
                    break
            }

            page && (this.loadPage(page));
        },
        loadPage: function(page) {
            var me = this
            var pagePath = null
            if (utils.isLocalhost()) {
                pagePath = myUrls.viewhost + 'view/systemparam/' + page
            } else {
                pagePath = '../view/systemparam/' + page
            }
            this.$Loading.start()
            $('#system-view').load(pagePath, function() {
                me.$Loading.finish();
            });
        }
    }
}