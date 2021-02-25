// 后台管理

var bgManager = {
    template: document.getElementById('manager-template').innerHTML,
    data: function() {
        var me = this;
        return {
            userType: null,
            theme: 'light',
            activeName: "bgNav",
            openedNames: [],
            navList: [],
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
                case 'bgNav':
                    page = 'bgnav.html'
                    break
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
                case 'employees':
                    page = 'employees.html'
                    break
                case 'onlineUsers':
                    page = 'onlineusers.html'
                    break
                case 'loginRecords':
                    page = 'loginrecords.html'
                    break
                case 'organStructure':
                    page = 'organstructure.html'
                    break
                case 'chargeMgr':
                    page = 'chargemgr.html'
                    break
                case 'batchMgrDevice':
                    page = 'batchmgr.html'
                    break
                case 'travelingDataRecorder':
                    page = 'travelingdatarecorder.html'
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
                case 'bonusList':
                    page = 'bonuslist.html'
                    break
                case 'transferRecord':
                    page = 'transferrecord.html'
                    break
                case 'accessPlatformList':
                    page = 'accessplatformlist.html'
                    break
                case 'forwardingSetting':
                    page = 'forwardingsetting.html'
                    break
                case 'yongZhouEnterpriseInfo':
                    page = 'yongzhouenterpriseinfo.html'
                    break
                case 'yongZhouVehicleInfo':
                    page = 'yongzhouvehicleinfo.html'
                    break
                case 'yongZhouDriverInfo':
                    page = 'yongzhoudriverinfo.html'
                    break
            }
            this.currentPage = name;
            this.loadPage(page)
        },
        loadPage: function(page) {
            vueInstanse && vueInstanse.$destroy && vueInstanse.$destroy();
            var me = this
            var pagePath = null
            if (utils.isLocalhost()) {
                pagePath = myUrls.viewhost + 'view/manager/' + page
            } else {
                pagePath = '../view/manager/' + page
            }
            this.$Loading.start()
            $('#mar-view').load(pagePath, function() {
                me.$Loading.finish()
            })
        },
        getAllNavList: function name() {
            var me = this;
            return [{
                    title: isZh ? "管理导航" : "Menu",
                    name: 'bgNav',
                    icon: 'ios-stats',
                    maxShowUserType: 99,
                },
                {
                    title: me.$t("bgMgr.organizationMgr"),
                    name: 'userMar',
                    icon: 'md-person',
                    maxShowUserType: 99,
                    children: [
                        { title: me.$t("bgMgr.organStructure"), name: 'organStructure', icon: 'md-git-network', maxShowUserType: 99 },
                        // { title: me.$t("bgMgr.addUser"), name: 'addUser', icon: 'ios-person-add' },
                        { title: me.$t("bgMgr.queryUser"), name: 'queryUser', icon: 'md-search', maxShowUserType: 99 },
                        { title: me.$t("user.employees"), name: 'employees', icon: 'md-person-add', maxShowUserType: 99 },
                        { title: me.$t("bgMgr.onlineUsers"), name: 'onlineUsers', icon: 'ios-analytics', maxShowUserType: 99 },
                        { title: me.$t("header.loginRecords"), name: 'loginRecords', icon: 'ios-clipboard-outline', maxShowUserType: 99 },
                    ]
                },
                // {   <Icon type="" />
                //     title: me.$t("bgMgr.groupMgr"),
                //     name: 'groupMar',
                //     icon: 'ios-albums',
                //     children: [
                //         { title: me.$t("bgMgr.addGroup"), name: 'addGroup', icon: 'ios-photos-outline' },
                //         { title: me.$t("bgMgr.queryGroup"), name: 'queryGroup', icon: 'md-search' }
                //     ]
                // },
                {
                    title: me.$t("bgMgr.devMgr"),
                    name: 'deviceMar',
                    icon: 'md-phone-portrait',
                    maxShowUserType: 99,
                    children: [
                        { title: me.$t("bgMgr.queryDev"), name: 'queryDevice', icon: 'md-search', maxShowUserType: 99 },
                        { title: me.$t("bgMgr.addDev"), name: 'addDevice', icon: 'md-add', maxShowUserType: 99 },
                        { title: me.$t("bgMgr.batchAdd"), name: 'batchAddDevice', icon: 'md-add', maxShowUserType: 99 },
                        { title: me.$t("bgMgr.batchMgr"), name: 'batchMgrDevice', icon: 'ios-folder-outline', maxShowUserType: 99 },
                        { title: me.$t("bgMgr.travelingDataRecorder"), name: 'travelingDataRecorder', icon: 'ios-car-outline', maxShowUserType: 99 },
                        { title: me.$t("bgMgr.stockDev"), name: 'stockDev', icon: 'md-cube', maxShowUserType: 99 },
                        { title: me.$t("bgMgr.unclaimed"), name: 'notPutIntoStorage', icon: 'md-basket', maxShowUserType: 99 },
                        // { title: me.$t("bgMgr.clearRecord"), name: "clearRecord", icon: "ios-paw" },
                        // { title: me.$t("bgMgr.setMileage"), name: "setMileage", icon: "md-paper" },
                    ]
                },
                {
                    title: me.$t("bgMgr.operateMgr"),
                    name: 'operateMar',
                    icon: 'ios-analytics',
                    maxShowUserType: 99,
                    children: [
                        { title: me.$t("bgMgr.importOwnerInfo"), name: 'ImportOwner', icon: 'md-add', maxShowUserType: 99 },
                        { title: me.$t("bgMgr.importInsureInfo"), name: 'ImportInsure', icon: 'md-add', maxShowUserType: 99 },
                        { title: me.$t("bgMgr.importPolicyInfo"), name: 'ImportInsure2', icon: 'md-add', maxShowUserType: 99 },
                        { title: me.$t("bgMgr.importVin"), name: 'ImportVehicleNumber', icon: 'md-add', maxShowUserType: 99 },
                        { title: me.$t("bgMgr.importOfflineInsurePolicyInfo"), name: 'ImportOfflineInsure', icon: 'md-add', maxShowUserType: 99 },
                        { title: me.$t("bgMgr.importSimInfo"), name: 'ImportSim', icon: 'md-add', maxShowUserType: 99 },
                        { title: me.$t("bgMgr.importDeviceName"), name: 'ImportDeviceName', icon: 'md-add', maxShowUserType: 99 },
                    ]
                },
                {
                    title: me.$t("bgMgr.repairMgr"),
                    name: 'repairMar',
                    icon: 'md-build',
                    maxShowUserType: 99,
                    children: [
                        { title: me.$t("bgMgr.addRepair"), name: 'addRepair', icon: 'ios-add', maxShowUserType: 99 },
                        { title: me.$t("bgMgr.repairRecord"), name: 'repairRecord', icon: 'ios-document', maxShowUserType: 99 },
                    ]
                },
                {
                    title: me.$t("bgMgr.bonusList"),
                    name: 'priceMar',
                    icon: 'logo-windows',
                    maxShowUserType: 1,
                    children: [
                        { title: me.$t("bgMgr.priceList"), name: 'priceList', icon: 'logo-apple', maxShowUserType: 1 },
                        { title: me.$t("bgMgr.memberSwitch"), name: 'bonusList', icon: 'ios-barcode', maxShowUserType: 1 },
                        { title: me.$t("bgMgr.transferRecords"), name: 'transferRecord', icon: 'ios-paper-outline', maxShowUserType: 1 },
                        { title: vRoot.$t("bgMgr.renewMgr"), name: 'chargeMgr', icon: 'ios-apps-outline', maxShowUserType: 1 }
                    ]
                },
                {
                    title: me.$t("bgMgr.manageDataTransfer"),
                    name: 'forward809',
                    icon: 'ios-laptop',
                    maxShowUserType: 99,
                    children: [
                        { title: me.$t("bgMgr.referredPlatformList"), name: 'accessPlatformList', icon: 'md-git-merge', maxShowUserType: 99 },
                        { title: me.$t("bgMgr.setTransferRules"), name: 'forwardingSetting', icon: 'md-git-merge', maxShowUserType: 99 },
                    ]

                },
                {
                    title: '第三方平台',
                    name: 'thirdPlatform',
                    icon: 'ios-analytics',
                    maxShowUserType: 99,
                    children: [{
                            title: '永州企业基本信息',
                            name: 'yongZhouEnterpriseInfo',
                            icon: 'md-add',
                            maxShowUserType: 99
                        },
                        {
                            title: '永州车辆基本信息',
                            name: 'yongZhouVehicleInfo',
                            icon: 'md-add',
                            maxShowUserType: 99
                        },
                        {
                            title: '永州驾驶员基本信息',
                            name: 'yongZhouDriverInfo',
                            icon: 'md-add',
                            maxShowUserType: 99
                        },
                    ]
                },
            ];
        },
        filterNavFunctions: function name(currentUserType) {
            var filterNavList = [];
            var allNavList = this.getAllNavList();
            allNavList.forEach(function name(category) {
                var copyCategory = deepClone(category);
                if (category.children) {
                    copyCategory.children = [];
                    category.children.forEach(function name(child) {
                        if (child.maxShowUserType >= currentUserType) {
                            copyCategory.children.push(child)
                        }
                    })
                    if (copyCategory.children.length) {
                        filterNavList.push(copyCategory);
                    }
                } else {
                    filterNavList.push(copyCategory);
                }
            })
            this.navList = filterNavList;
        }
    },
    mounted: function() {
        this.userType = Number(vstore.state.userType);
        this.filterNavFunctions(this.userType);
        this.selectditem('bgNav');
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

            vueInstanse && vueInstanse.$destroy && vueInstanse.$destroy();
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