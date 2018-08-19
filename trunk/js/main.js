(function(){
    //方向数组
    var directionList = [ 0 , 45 , 90 , 135 , 180 , 225 , 270 , 315 ];  
    //全局变量
    var store = {
        navState : false,
        intervalTime:10,
        currentDeviceId:null,
        currentDeviceRecord:{},
        deviceNames:{}
    };
    // 头部组建
    var appHeader = {
        template:document.getElementById("header-template").innerHTML,
        props:["componentid"],
        data:function(){
            return {
                dark:"dark",
                name:"",
                isManager:true,
                modal:false,
                isShowCompany:false,
                intervalTime:10,
                activeName:null,
                navData:[],
                isShowMonitor:true,
                isShowReportForm:true,
                isShowBgManager:true,
                modalPass:false
            }
        },
        methods:{
            changeNav:function(navName){
                this.$emit("change-nav",navName);
            },
            getManagerType:function(userType){
                var mgr = "";
                    if(userType == -1){
                        mgr = "[普通监控员]";
                        this.isManager = false;
                    }else if(userType == 0){
                        mgr = "[系统管理员]";
                    }else if(userType == 1){
                        mgr = "[一级管理员]";
                    }else if(userType == 2){
                        mgr = "[二级管理员]";
                    }else if(userType == 99){
                        this.isManager = false;
                        mgr = "[设备]";
                    }
                return mgr;
            },
            loginOut:function () {
                var me = this;
                var url = myUrls.loginOut();
                utils.sendAjax(url,{},function(resp){

                    if(resp.status == 0){
                        Cookies.remove("token");
                        window.location.href = "index.html";
                    }else{
                        me.$Message.error(resp.cause);
                    }
                })
            },
            changePassword:function () { 
                this.modalPass = true;
            },
            showSetup:function () {
                this.modal = true;
            },
            changeShowCompany:function (state) {
                this.$emit("change-tree",state);
                store.navState = state;
                Cookies.set("isShowCompany", state ,{ expires: 7 });
            },
            reqUserType:function () {
                var url = myUrls.queryUserType();
                utils.sendAjax(url,{},function (resp) {
                    console.log(resp);
                })
            },
            navJurisdiction:function (userType) {
                if(userType == -1 || userType == 99){
                    this.isShowBgManager = false;
                    this.$emit("change-nav","monitor");
                }else if(userType == 0){
                    this.isShowMonitor = false;
                    this.$emit("change-nav","reportForm");
                }else{
                    this.$emit("change-nav","monitor");
                };
            }
        },
        mounted:function () {
            var me = this;
            this.activeName = "reportForm";
            this.$nextTick(function () {
                me.userType = Cookies.get("userType");
                var mgr = me.getManagerType(me.userType);
                me.name = Cookies.get("name") + mgr;
                me.navJurisdiction(me.userType);

                var isShowCompany = Cookies.get("isShowCompany");
                if(isShowCompany == "true"){
                    me.isShowCompany = true;
                    store.navState = true;
                }else if(isShowCompany == "false"){
                    me.isShowCompany = false;
                    store.navState = false;
                } 
            })
        },
        watch: {
            intervalTime:function () {
                this.$emit("change-intervaltime",this.intervalTime);
                store.intervalTime = this.intervalTime;
            }
        }
    };

    // 监控页面的 rander 函数
    var render = function (h, info){
        var data = info.data;
        var root = info.root;
        var node = info.node;
        return h('span', {
            style: {
                display: 'inline-block',
                cursor: 'pointer',
                width: '100%'
            },
            on:{
                click:function () {
                    data.expand = !data.expand;
                }
            }
        }, [
            h('span', [
                h('Icon', {
                    props: {
                        type: 'edit',
                    },
                    style: {
                        marginRight: '8px'
                    }
                }),
                h('span', data.title)
            ])
        ]);
    };

    // 定位监控
    var monitor = {
        template:document.getElementById("monitor-template").innerHTML,
        data:function () {
            return {
                map:null,
                isShowConpanyName:false, // 0 不显示公司   1 显示公司名
                sosoValue: '',           // 搜索框的值
                sosoData: [],            // 搜索框里面的数据
                selectedState:'',        // 选择nav的状态 all online offline;
                currentStateData:[],     // 当前tree的数据
                records:[],              // 全部设备最后一次位置记录
                companys:[],             //公司名称id
                groups:[],               // 原始列表数据
                intervalTime:null,       // 多久刷新一次设备
                offlineTime:5*60*1000,   // 根据这个时间算出是否离线
                allDevCount:0,           // 全部设备的个数
                onlineDevCount:0,        // 在线设备个数
                offlineDevCount:0,       // 离线设备个数
                isMoveTriggerEvent:true, // 地图移动是否触发事件
                intervalInstanse:null    // 定时器实例
            }
        },
        methods: {
            initMap:function () {
                var me = this;
                this.map = new BMap.Map("map",{minZoom:4,maxZoom:18});
                this.map.enableScrollWheelZoom();
                this.map.enableAutoResize();
                this.map.disableDoubleClickZoom();
                this.map.centerAndZoom(new BMap.Point(108.0017245,35.926895),5);
                // var top_left_control = new BMap.ScaleControl({anchor: BMAP_ANCHOR_BOTTOM_LEFT});
                var top_left_control = new BMap.ScaleControl({anchor: BMAP_ANCHOR_TOP_LEFT});// 左上角，添加比例尺
	            var top_left_navigation = new BMap.NavigationControl();  //左上角，添加默认缩放平移控件
                this.map.addControl(top_left_control);
                this.map.addControl(top_left_navigation);
                this.map.addControl(new BMap.MapTypeControl({
                    mapTypes:[
                        BMAP_NORMAL_MAP,
                        BMAP_HYBRID_MAP
                    ]
                }));    
                this.map.addEventListener("moveend",function (ev) {
                    if(me.isMoveTriggerEvent){
                        me.map.clearOverlays();
                        var pointArr = me.getThePointOfTheCurrentWindow();
                        var range = utils.getDisplayRange(me.map.getZoom());
                        if(pointArr.length){
                            if(pointArr.length > 300){
                                var filterArr = me.filterReocrds(range,pointArr);
                                me.addOverlayToMap(filterArr);
                            }else{
                                me.addOverlayToMap(pointArr); 
                            }
                            me.openDevInfoWindow();
                        }
                    }else{
                        me.isMoveTriggerEvent = true;
                    }
                });

                this.map.addEventListener("zoomend",function (ev) {
                        me.map.clearOverlays();
                        var pointArr = me.getThePointOfTheCurrentWindow();
                        var range = utils.getDisplayRange(me.map.getZoom());
                        if(pointArr.length){
                            if(pointArr.length > 300){
                                var filterArr = me.filterReocrds(range,pointArr);
                                me.addOverlayToMap(filterArr);
                            }else{
                                me.addOverlayToMap(pointArr); 
                            }
                            setTimeout(function () {
                                me.openDevInfoWindow();
                            },400);
                        }
                });

                this.map.addEventListener("click",function (event) {
                    var overlay = event.overlay;
                    if(overlay == null || overlay.deviceid == undefined){
                        store.currentDeviceId = null;
                        store.currentDeviceRecord = null;
                    };
                });
        
            },
            getThePointOfTheCurrentWindow:function () {
                var bounds = this.map.getBounds();
				var pointArr = [];
				this.records.forEach(function(item,index){
                    if(item){
                        var lng_lat = wgs84tobd09(item.callon,item.callat);
                        var point = new BMap.Point(lng_lat[0],lng_lat[1]);
                        if(bounds.containsPoint(point)){
                            pointArr.push(item);
                        }
                    }
                });
                return pointArr;
            },
            filterMethod :function(value, option) {
                 if(value){
                    return option.toUpperCase().indexOf(value.toUpperCase()) !== -1;
                 }else{
                     return true;
                 }
            },
            sosoSelect:function (value) {
                var me = this;
                if(value){
                    if(this.isShowConpanyName){
                        this.currentStateData.forEach(function (company) {
                            company.children.forEach(function (group) {
                                group.children.forEach(function (dev) {
                                    if(dev.title == value){
                                        company.expand = true;
                                        dev.isSelected = true;
                                        group.expand = true;
                                        me.handleClickDev(dev.deviceid);
                                    }else{
                                        dev.isSelected = false;
                                    }
                                });
                            });
                        });
                    }else{
                        this.currentStateData.forEach(function (group) {
                            group.children.forEach(function (dev) {
                                if(dev.title == value){
                                    dev.isSelected = true;
                                    group.expand = true;
                                    me.handleClickDev(dev.deviceid);
                                }else{
                                    dev.isSelected = false;
                                }
                            });
                        });
                    };
                };
            },
            selectedStateNav:function (state) {
                this.selectedState = state;
            },
            renderContent:function (h, info) {
                var me = this;
                var data = info.data;
                var root = info.root;
                var node = info.node;
                return h('span', {
                    style: {
                        display: 'inline-block',
                        cursor: 'pointer',
                        width: '100%',
                        background:data.isSelected ? "#FFF5C2":"",
                        color:node.node.isOnline ? "#2D8CF0" : "#999999"
                    },
                    on:{
                        click: function(){
                            me.cancelSelected();
                            data.isSelected = true;
                            me.handleClickDev(data.deviceid);
                        }
                    }
                }, [
                    h('span', [
                        h('Icon', {
                            props: {
                                type: 'md-person'
                            },
                            style: {
                                marginRight: '8px'
                            }
                        }),
                        h('span', data.title)
                    ])
                ]);
            },
            handleClickDev:function (deviceid) {
                var me = this;
                me.getLastPosition([deviceid],function (resp) {
                    if(resp.records != null && resp.records.length && resp.records[0]!==null){
                        var record = resp.records[0];
                        var callon = record.callon;
                        var callat = record.callat;
                        var lng_lat = wgs84tobd09(callon,callat);
                        var point = new BMap.Point(lng_lat[0],lng_lat[1]);
                        record.point = point;
                        var isOnline = (Date.now() - record.arrivedtime) < me.offlineTime ? true : false ; 
                        var iconState = null;
                        var angle = directionList[parseInt(Math.random()*8)];  
                        if(isOnline){
                            iconState = new BMap.Icon("../images/carstate/green_"+angle+".png", new BMap.Size(16, 16), { imageOffset: new BMap.Size(0, 0)}); 
                        }else{
                            iconState = new BMap.Icon("../images/carstate/gray_"+angle+".png", new BMap.Size(16, 16), { imageOffset: new BMap.Size(0, 0)}); 
                        };
                        record.icon = iconState;
                        store.currentDeviceId = deviceid;
                        store.currentDeviceRecord = record;
                        me.updateRecords(record);
                        me.isMoveTriggerEvent = false;
                        me.map.centerAndZoom(point,17);
                        me.openDevInfoWindow();
                    }else{
                        me.$Message.error("该设备没有上报位置信息");
                    };
                });
            },
            updateRecords:function (record) {
                var records = this.records;
                for(var i = 0 ; i < records.length ; i++){
                    if(records[i]!=null){
                        var deviceid = records[i].deviceid;
                        if(record.deviceid == deviceid){
                            records.splice(i,1,record);
                        }
                    }
                };
            },
            updateTreeOnlineState:function () {
                var me = this;
                this.records.forEach(function (item) { 
                    if(item == null ){ return; }
                    var deviceid = item.deviceid;
                    var isOnline = (function (record) {
                        var isOnline = false;
                        var arrivedtime = record.arrivedtime;
                        var currentTime = new Date().getTime();
                        if((currentTime - arrivedtime) < me.offlineTime){
                                isOnline = true;
                        }  
                        return isOnline;
                      })(item);
                    
                    if(me.isShowConpanyName){
                        me.currentStateData.forEach(function (company) { 
                            company.children.forEach(function (group) { 
                                group.children.forEach(function (dev) { 
                                    if(dev.deviceid == deviceid){
                                        dev.isOnline = isOnline;
                                    };
                                });
                            });
                        });

                        me.currentStateData.forEach(function (company) { 
                            company.children.forEach(function (group) { 
                                var onlineCount = 0;
                                group.children.forEach(function (dev) { 
                                    if(dev.isOnline){
                                        onlineCount++;
                                    }
                                });
                                if(me.selectedState == "all" ){
                                    group.title = group.name + "(" + onlineCount+ "/" + group.children.length  + ")"; 
                                }else{
                                    group.title = group.name + "(" + group.children.length  + ")"; 
                                }
                            });
                        });
                    }else{            
                        me.currentStateData.forEach(function (group) { 
                            group.children.forEach(function (dev) { 
                                if(dev.deviceid == deviceid){
                                    dev.isOnline = isOnline;
                                }
                            })
                        });
                        me.currentStateData.forEach(function (group) { 
                            var onlineCount = 0;
                            group.children.forEach(function (dev) { 
                                if(dev.isOnline){
                                    onlineCount++;
                                };
                            });
                            if(me.selectedState == "all" ){
                                group.title = group.name + "(" + onlineCount+ "/" + group.children.length  + ")"; 
                            }else{
                                group.title = group.name + "(" + group.children.length  + ")"; 
                            }                         
                        });
                    }
                })
            },
            cancelSelected:function () {
                if(this.isShowConpanyName){
                    this.currentStateData.forEach(function (company) {
                        company.children.forEach(function (group) {
                            group.children.forEach(function (dev) {
                                dev.isSelected = false;
                            });
                        })
                    })
                }else{
                    this.currentStateData.forEach(function (group) {
                        group.children.forEach(function (dev) {
                            dev.isSelected = false;
                        })
                    })
                }
            },
            getMonitorListByUser:function (havecompany,callback) {
                var me = this;
                var url = myUrls.monitorListByUser();
                utils.sendAjax(url,{"havecompany":havecompany},function (resp) {
                    if(resp.status == 0 ){
                        callback(resp);
                    }else if(resp.status == 3){
                        me.$Message.error("请重新登录,2秒后自动跳转登录页面");
                        Cookies.remove("token");
                        setTimeout(function () {
                            window.location.href = "index.html";
                        },2000);
                    }else{
                        if(resp.cause){
                            me.$Message.error(resp.cause);
                        }
                    }

                });
            },
            setDeviceIdsList:function (groups) {
                var me = this;
                groups.forEach(function (group) {
                    group.devices.forEach(function (device,index) {
                        var deviceid = device.deviceid;
                        store.deviceNames[deviceid] = device;
                    });
                });
            },
            getLastPosition:function (deviceIds,callback) {
                var me = this;
                var url = myUrls.lastPosition();
                var data = {
                    username: this.username,
                    deviceids: deviceIds
                };
                utils.sendAjax(url,data,function (resp) {
                    if(resp.status == 0){
                        callback(resp);
                    }else if(resp.status == 3){
                        me.$Message.error("请重新登录,2秒后自动跳转登录页面");
                        Cookies.remove("token");
                        setTimeout(function () {
                            window.location.href = "index.html";
                        },2000);
                    }
                });
            },
            filterReocrds:function (range , records) {
                var me = this;
                var filterArr = [];
                var firstRecord = records[0];
                    if(firstRecord == null){ return [];};
                var first_lng_lat = wgs84tobd09(firstRecord.callon,firstRecord.callat);
                    firstRecord.point = new BMap.Point(first_lng_lat[0],first_lng_lat[1]);
                    filterArr.push(firstRecord);

                records.forEach(function (record) {
                    var len = filterArr.length-1;
                    var endPoint = null;
                    if(!record.point){
                        var end_lng_lat = wgs84tobd09(record.callon,record.callat);
                            endPoint = new BMap.Point(end_lng_lat[0],end_lng_lat[1]);
                            record.point = endPoint;
                    }else{
                        endPoint = record.point;
                    };
                    var rice =  me.map.getDistance(filterArr[len].point,endPoint);
                    if(rice > range){
                        filterArr.push(record);
                    }
                });

                if( filterArr.length > 300){
                    return filterReocrds(range+100,filterArr);
                }else{
                    return filterArr;
                }
            },
            addOverlayToMap:function (records) {
                var me = this;
                records.forEach(function (record){
                    if(record != null){
                        var deviceid = record.deviceid;
                        var point = null
                        if(!record.point){
                            var lng_lat = wgs84tobd09(record.callon,record.callat);
                            var point = new BMap.Point(lng_lat[0],lng_lat[1]);
                            record.point = point;
                        }else{
                             point = record.point;
                        };
                        var isOnline = (Date.now() - record.arrivedtime) < me.offlineTime ? true : false ;
                        
                        var marker = new BMap.Marker(point);
                            marker.setIcon(record.icon);
                        var label =  new BMap.Label(store.deviceNames[deviceid].devicename,{ position : point, offset   : new BMap.Size(20, -3) });
                            label.setStyle({
                                color : "#000000",
                                border:"1px solid #000000",
                                background:"#F5FCB8",
                                fontSize : "14px",
                                fontFamily:"微软雅黑",
                                padding:"0 2px"
                            });
                            marker.setLabel(label);
                            marker.deviceid = deviceid;
                        me.markerAddEvent(marker,deviceid);
                        me.map.addOverlay(marker);
                    };
                });
            },

            markerAddEvent:function (marker,deviceid) {
                var me = this;
                marker.addEventListener("click", function(){
                    me.isMoveTriggerEvent = false;
                    var deviceid = this.deviceid;
                    var devLastInfo = me.getSingleDeviceInfo(deviceid);
                    store.currentDeviceId = deviceid;
                    store.currentDeviceRecord = devLastInfo;
                    var infoWindow = me.getInfoWindow(devLastInfo);
                    marker.openInfoWindow(infoWindow,marker.point);
                    me.openTreeDeviceNav(deviceid);
                });
            },
            openTreeDeviceNav:function (deviceid) { 
                var me = this;
                if(me.isShowConpanyName){
                    me.currentStateData.forEach(function (company) {
                        company.children.forEach(function (group) {
                            group.children.forEach(function (dev) {
                                if(dev.deviceid == deviceid){
                                    company.expand = true;
                                    dev.isSelected = true;
                                    group.expand = true;
                                }else{
                                    dev.isSelected = false;
                                }
                            });
                        });
                    });
                }else{
                    me.currentStateData.forEach(function (group) {
                        group.children.forEach(function (dev) {
                            if(dev.deviceid == deviceid){
                                dev.isSelected = true;
                                group.expand = true;
                            }else{
                                dev.isSelected = false;
                            }
                        });
                    });
                };
            },
            openDevInfoWindow:function () {
                var me = this;
                var record = store.currentDeviceRecord;
                var markers = this.map.getOverlays();
                for(var i = 0 ; i < markers.length ; i++){
                    var marker = markers[i];
                    if(marker.deviceid == store.currentDeviceId){              
                        var infoWindow = me.getInfoWindow(record);
                         marker.openInfoWindow(infoWindow,record.point)
                    };
                };
            },
            getSingleDeviceInfo:function(deviceid){
                var info = null;
                for(var i = 0 ; i <  this.records.length ; i++){
                    if(this.records[i]){
                        var item = this.records[i];
                        if(item.deviceid == deviceid){
                            info = item;
                        };
                    }
                };
                return info;
            },
            getInfoWindow:function (info) {
                var devdata = store.deviceNames[info.deviceid];
                var address = this.getAddress(info);
                var sContent = '<div><p style="margin:0;font-size:13px">' +
                '<p> 设备名称: ' +devdata.devicename+'</p>' +
                '<p> 设备ID: ' +info.deviceid+'</p>' +
                '<p> 经纬度: ' +info.callon+","+ info.callat +'</p>' +
                '<p> 最后时间: ' +DateFormat.longToDateTimeStr(info.arrivedtime,0)+'</p>' +
                '<p> 到期时间: ' +DateFormat.longToDateTimeStr(devdata.overduetime,0)+'</p>' +
                '<p class="last-address"> 详细地址: '+address+'</p>' +
                '<p class="operation">'+
                    '<span class="ivu-btn ivu-btn-default ivu-btn-small" onclick="playBack('+info.deviceid+')">回放</span>'+
                    '<span class="ivu-btn ivu-btn-default ivu-btn-small" onclick="alert('+info.deviceid+')">跟踪</span> </p></div>';
                var opts = {
                    width:300,
                };
                return new BMap.InfoWindow(sContent,opts);
            },
            getAddress:function (info) {
                var callon = info.callon;
                var callat = info.callat;
                var bd09 = wgs84tobd09(callon,callat)
                var lng = bd09[0].toFixed(5);
                var lat = bd09[1].toFixed(5);
                var address = LocalCacheMgr.getAddress(lng,lat);
                if(address !== null){
                    return address;
                }
                utils.getBaiduAddressFromBaidu(lng,lat,function (resp) {

                    if(resp.length){
                        address = resp;
                        $("p.last-address").html(" 详细地址: " + address);
                        LocalCacheMgr.setAddress(lng,lat,address);
                    }else{
                       utils.getJiuHuAddressSyn(callon,callat,function (resp) {
                            address = resp.address
                            $("p.last-address").html(" 详细地址: " + address);
                            LocalCacheMgr.setAddress(lng,lat,address);
                       });
                    }
                });
                return "地址正在解析..."
            },
            setNavState:function (state) {
                this.isShowConpanyName = state;
            },
            setIntervalTime:function (interval) {
                this.intervalTime = interval*1000;
                clearInterval(this.intervalInstanse);
                this.setIntervalReqRecords();
            },
            queryCompanyTree:function (callback) {
                var url = myUrls.queryCompanyTree();
                utils.sendAjax(url,{},function (resp) {
                    callback(resp)
                })
            },
            getCurrentStateTreeData:function (state,isShowConpanyName) {
                var me = this;
                this.currentStateData = [];
                this.sosoData = [];
                if(state === "all"){
                    if(isShowConpanyName){
                        this.getAllShowConpanyTreeData();
                    }else{
                        this.getAllHideConpanyTreeData();
                    }
                }else if(state === "online"){
                    if(isShowConpanyName){
                        this.getOnlineShowConpanyTreeData();
                    }else{
                        this.getOnlineHideConpanyTreeData();
                    }
                }else if(state === "offline"){
                    if(isShowConpanyName){
                        this.getOfflineShowConpanyTreeData();
                    }else{
                        this.getOfflineHideConpanyTreeData();
                    }
                }

                if(isShowConpanyName){
                    this.currentStateData.forEach(function (company) {
                        company.children.forEach(function (group) {
                            group.children.forEach(function (dev) {
                                me.sosoData.push(dev.title);
                            })
                        })
                    })
                }else{
                    this.currentStateData.forEach(function (item) {
                        item.children.forEach(function (dev) {
                            me.sosoData.push(dev.title);
                        })
                    })
                }

            },
            getNewCompanyArr :function () { 
                var newArray = [];
                this.companys.forEach(function (company) {
                    var companyid =  company.companyid;
                    var companyObj = {
                            title:company.companyname,
                            companyname:company.companyname,
                            companyid:companyid,
                            children:[],
                            expand: false,
                            render:render
                        };
                        newArray.push(companyObj);
                });
                if(newArray.length === 0 ){
                    var logintype = Cookies.get("logintype");
                    if(logintype == "DEVICE"){
                        newArray.push({
                            title:"默认客户",
                            children:[],
                            companyname:"默认客户",
                            expand: false,
                            render:render
                        })
                    }
                };
                return newArray;
            },
            getAllShowConpanyTreeData:function () {
                var me = this;
                var newArray = me.getNewCompanyArr();
                var newGroups = [] ; 
                me.groups.forEach(function (group,index) {
                    var companyid = group.companyid;
                    var onlineCount = 0;
                    var groupObj = {
                        companyid:companyid,
                        title    :group.groupname,
                        expand: false,
                        render:render,
                        name:group.groupname,
                        children:[],
                    };
                    group.devices.forEach(function (device,index) {
                        var isOnline = me.getIsOnline(device.deviceid);
                        var deviceObj = {
                            title:device.devicename,
                            deviceid:device.deviceid,
                            isOnline:isOnline,
                            isSelected:false,
                        }
                        if(isOnline){
                            onlineCount++;
                        }
                        if(device.deviceid == store.currentDeviceId){
                            groupObj.expand = true;
                            deviceObj.isSelected = true;
                        }
                        groupObj.children.push(deviceObj);
                    });
                    groupObj.title += "("+ onlineCount + "/" + groupObj.children.length+")";
                
                    newArray.forEach(function (company) {
                        if(company.companyid == companyid){
                            company.children.push(groupObj);
                            company.title = company.companyname + "("+ company.children.length + ")";
                        }else{
                            var logintype = Cookies.get("logintype");
                            if(logintype == "DEVICE"){
                                company.children.push(groupObj);
                                company.title = company.companyname + "("+ company.children.length + ")";
                            }
                        }
                    });

                })
                me.currentStateData = newArray;
            },
            getAllHideConpanyTreeData:function () {
                var me = this;

                    this.groups.forEach(function (group) {
                        var onlineCount = 0;
                        var groupData =  {
                            title: group.groupname,
                            expand: false,
                            render:render,
                            children: [],
                            name:group.groupname,
                        };

                        group.devices.forEach(function (device,index) {
                            var isOnline = me.getIsOnline(device.deviceid);
                            var dev = {
                                    title:device.devicename,
                                    isSelected:false,
                                    isOnline:isOnline,
                                    deviceid:device.deviceid
                                };
                                if(device.deviceid == store.currentDeviceId){
                                    groupData.expand = true;
                                    dev.isSelected = true;
                                }
                                if(isOnline){
                                    onlineCount++;
                                }
                                groupData.children.push(dev);
                        });

                        if(groupData.children.length){
                            groupData.title += "("+ onlineCount +"/"+ groupData.children.length +")";
                            if(groupData.title == "默认组"){
                                me.currentStateData.unshift(groupData);
                            }else{
                                me.currentStateData.push(groupData);
                            }
                        }
                    })

            },
            getOnlineShowConpanyTreeData:function () {
                var me = this;
                var newArray = me.getNewCompanyArr();
                var groupsArray = [];
                

                me.groups.forEach(function (group) {

                    var companyid = group.companyid;
                    var onlineCount = 0;
                    var groupObj = {
                        companyid:companyid,
                        title    :group.groupname,
                        expand: false,
                        render:render,
                        children:[],
                        name:group.groupname,
                    }

                    group.devices.forEach(function (device) {
                        var isOnline = me.getIsOnline(device.deviceid);
                        var deviceObj = {
                            title:device.devicename,
                            deviceid:device.deviceid,
                            isOnline:isOnline,
                            isSelected:false,
                        }

                        if(device.deviceid == store.currentDeviceId){
                            groupObj.expand = true;
                            deviceObj.isSelected = true;
                        };
                        if(isOnline){
                            onlineCount++;
                            groupObj.children.push(deviceObj);
                        }
                    });
                    if(groupObj.children.length){
                        groupObj.title += "("+ groupObj.children.length +")";
                        groupsArray.push(groupObj);
                    }

                })

                 newArray.forEach(function (company,index) {
                    var companyid = company.companyid;
                    groupsArray.forEach(function(group){
                        if(companyid == group.companyid){
                            company.children.push(group);
                        }else{
                            var logintype = Cookies.get("logintype");
                            if(logintype == "DEVICE"){
                                company.children.push(group);
                            }
                        }
                    });
                    if(company.children.length){
                        company.title = company.companyname + "(" + company.children.length + ")";
                        me.currentStateData.push(company);
                    }
                 });


            },
            getOnlineHideConpanyTreeData:function () {
                var me = this;

                    this.groups.forEach(function (group) {
                        var groupData =  {
                            title: group.groupname,
                            expand: false,
                            render:render,
                            children: [],
                            name:group.groupname,
                        };

                        group.devices.forEach(function (device,index) {
                            var isOnline = me.getIsOnline(device.deviceid);
                            var dev = {
                                    title:device.devicename,
                                    isSelected:false,
                                    isOnline:isOnline,
                                    deviceid:device.deviceid
                                };
                                if(device.deviceid == store.currentDeviceId){
                                    groupData.expand = true;
                                    dev.isSelected = true;
                                }
                                if(isOnline){
                                    groupData.children.push(dev);
                                }
                        });

                        if(groupData.children.length){
                            if(groupData.title == "默认组"){
                                if(groupData.children.length){
                                    me.currentStateData.unshift(groupData);
                                }
                            }else{
                                if(groupData.children.length){
                                    me.currentStateData.push(groupData);
                                }
                            }
                            groupData.title += "("+groupData.children.length +")";
                        }
                    })

            },
            getOfflineShowConpanyTreeData:function () {
                var me = this;
                var newArray = me.getNewCompanyArr();
                var groupsArray = [];

                me.groups.forEach(function (group) {

                    var companyid = group.companyid;

                    var groupObj = {
                        companyid:companyid,
                        title    :group.groupname,
                        expand: false,
                        render:render,
                        children:[],
                        name:group.groupname,
                    }

                    group.devices.forEach(function (device) {
                        var isOnline = me.getIsOnline(device.deviceid);
                        var deviceObj = {
                            title:device.devicename,
                            deviceid:device.deviceid,
                            isOnline:isOnline,
                            isSelected:false,
                        }

                        if(device.deviceid == store.currentDeviceId){
                            groupObj.expand = true;
                            deviceObj.isSelected = true;
                        };
                        if(!isOnline){                           
                            groupObj.children.push(deviceObj);
                        }
                    });
                    if(groupObj.children.length){
                        groupObj.title += "("+ groupObj.children.length+")";
                        groupsArray.push(groupObj);
                    }
                });
                 newArray.forEach(function (company,index) {
                    var companyid = company.companyid;
                    groupsArray.forEach(function(group){
                         if(companyid == group.companyid){   
                            company.children.push(group);
                         }else{
                            var logintype = Cookies.get("logintype");
                            if(logintype == "DEVICE"){
                                company.children.push(group);
                            }
                        }
                    });
                    if(company.children.length){
                        company.title = company.companyname + "(" + company.children.length + ")";
                        me.currentStateData.push(company);
                    }
                 });
            },
            getOfflineHideConpanyTreeData:function () {
                var me = this;

                    this.groups.forEach(function (group) {
                        var groupData =  {
                            title: group.groupname,
                            expand: false,
                            render:render,
                            children: [],
                            name:group.groupname,
                        };

                        group.devices.forEach(function (device,index) {
                            var isOnline = me.getIsOnline(device.deviceid);
                            var dev = {
                                    title:device.devicename,
                                    isSelected:false,
                                    isOnline:isOnline,
                                    deviceid:device.deviceid
                                };
                                if(device.deviceid == store.currentDeviceId){
                                    groupData.expand = true;
                                    dev.isSelected = true;
                                }
                                if(!isOnline){
                                    groupData.children.push(dev);
                                }
                        });

                        if(groupData.children.length){
                            if(groupData.title == "默认组"){
                                if(groupData.children.length){
                                    me.currentStateData.unshift(groupData);
                                };
                            }else{
                                if(groupData.children.length){
                                    me.currentStateData.push(groupData);
                                };
                            };
                            groupData.title += "("+groupData.children.length +")";
                        }
                    });
            },
            getIsOnline:function(deviceid){
                var me = this;
                var isOnline = false;
                me.records.forEach(function (record) {
                    if(record !== null){
                        if(deviceid == record.deviceid){
                            var arrivedtime = record.arrivedtime;
                            var currentTime = new Date().getTime();
                            if((currentTime - arrivedtime) < me.offlineTime){
                                isOnline = true;
                            }
                        }
                    }
                });
                return isOnline;
            },
            setIntervalReqRecords:function(){
                var me = this;
                this.intervalInstanse = setInterval(function () {
                    var devIdList = Object.keys(store.deviceNames);
                    me.getLastPosition(devIdList,function (resp) {
                        resp.records.forEach(function (record) {
                           if(record){
                               var isOnline = (Date.now() - record.arrivedtime) < me.offlineTime ? true : false ; 
                               var iconState = null;
                               var angle = directionList[parseInt(Math.random()*8)];
                                if(isOnline){
                                    iconState = new BMap.Icon("../images/carstate/green_"+angle+".png", new BMap.Size(16, 16), { imageOffset: new BMap.Size(0, 0)}); 
                                }else{
                                    iconState = new BMap.Icon("../images/carstate/gray_"+angle+".png", new BMap.Size(16, 16), { imageOffset: new BMap.Size(0, 0)}); 
                                };
                                record.icon = iconState;
                               var lng_lat = wgs84tobd09(record.callon,record.callat);
                               record.point = new BMap.Point(lng_lat[0],lng_lat[1]);
                           };
                        })
                        me.records = resp.records;
                        me.updateTreeOnlineState();
                        me.moveMarkers();
                    });
                }, this.intervalTime);
            },
            moveMarkers:function () {
                var me = this;
                var markers = this.map.getOverlays();
                markers.forEach(function (marker) {
                    var deviceid = marker.deviceid;
                    if(deviceid){
                        me.records.forEach(function (record) {
                            if(record){
                                if(deviceid === record.deviceid){
                                    marker.setPosition(record.point);
                                    if(deviceid == store.currentDeviceId){
                                        me.isMoveTriggerEvent = false;
                                        var infoWindow = me.getInfoWindow(record);
                                        marker.openInfoWindow(infoWindow,record.point);
                                    };
                                };
                            }
                        });
                    }
                })
            },
            setCarIconState:function () {
                var me = this;
                this.records.forEach(function (record) {
                    // 如果是null 返回;
                    if(record == null){ return };
                    var isOnline = (Date.now() - record.arrivedtime) < me.offlineTime ? true : false ; 
                    var iconState = null;
                    var angle = directionList[parseInt(Math.random()*8)];  
                    if(isOnline){
                        iconState = new BMap.Icon("../images/carstate/green_"+angle+".png", new BMap.Size(16, 16), { imageOffset: new BMap.Size(0, 0)}); 
                    }else{
                        iconState = new BMap.Icon("../images/carstate/gray_"+angle+".png", new BMap.Size(16, 16), { imageOffset: new BMap.Size(0, 0)}); 
                    };
                    record.icon = iconState;
                });
            }
        },
        computed:{
            username:function () {
                return Cookies.get("name");
            }
        },
        watch:{
            records:function () {
                var online  = 0;
                var offline = 0;
                var me = this;
                var deviceIds = Object.keys(store.deviceNames);

                if(this.records.length === deviceIds.length){

                    this.records.forEach(function (record) {
                        if(record!==null){
                            var arrivedtime = record.arrivedtime;
                            var currentTime = new Date().getTime();
                            if((currentTime - arrivedtime) < me.offlineTime){
                                online++;
                            }else{
                                offline++;
                            }
                        }else{
                            offline++;
                        }
                    });
                    this.offlineDevCount = offline;
                    this.onlineDevCount = online;
                }else if(this.records.length === 0){
                    this.offlineDevCount = deviceIds.length;
                    this.onlineDevCount = 0;
                }else{
                    offline += deviceIds.length - this.records.length;
                    this.records.forEach(function (record) {
                        if(record!==null){
                            var arrivedtime = record.arrivedtime;
                            var currentTime = new Date().getTime();
                            if((currentTime - arrivedtime) < me.offlineTime){
                                online++;
                            }else{
                                offline++;
                            }
                        }else{
                            offline++;
                        }
                    });
                    this.offlineDevCount = offline;
                    this.onlineDevCount = online;
                }

                this.allDevCount = deviceIds.length;
            } ,
            selectedState:function () {
                this.getCurrentStateTreeData(this.selectedState,this.isShowConpanyName);
            },
            isShowConpanyName:function () {
                var me = this;
                if(this.isShowConpanyName){
                    // if(me.groups[0] && me.groups[0].companyid ){
                    //     me.getCurrentStateTreeData(me.selectedState,me.isShowConpanyName);
                    // }else{
                        this.getMonitorListByUser(1,function (resp) {
                            me.groups = resp.groups;
                            me.queryCompanyTree(function (response) {
                                me.companys = response.companys;
                                me.getCurrentStateTreeData(me.selectedState,me.isShowConpanyName);
                            });
                        });
                    // }
                }else{
                    this.getCurrentStateTreeData(this.selectedState,this.isShowConpanyName)  ;
                }
            }
        },
        mounted:function () {
            var me = this;
            var isShowCompany = Cookies.get("isShowCompany");
            var havecompany =  isShowCompany ? 1 : 0;
            this.isShowConpanyName = store.navState;
            this.intervalTime      = store.intervalTime * 1000;
            this.initMap();
            this.getMonitorListByUser(havecompany,function (resp) {
                me.groups = resp.groups;
                me.setDeviceIdsList(resp.groups);
                var devIdList = Object.keys(store.deviceNames);
                me.getLastPosition(devIdList,function (resp) {
                    me.records = resp.records;
                    me.setCarIconState();
                    var range = utils.getDisplayRange(me.map.getZoom());
                    if(resp.records.length){
                        if(resp.records.length > 300){
                            var filterArr =  me.filterReocrds(range,resp.records);
                        }else{
                            me.addOverlayToMap(resp.records);
                        }  
                    };
                    if(isShowCompany == "true"){
                        isShowConpanyName = true;
                    }else if(isShowCompany == "false"){
                        isShowConpanyName = false;
                    } 
                    me.selectedState = "all";
                });
            });
            this.setIntervalReqRecords();
        },
        beforeDestroy:function () {
            store.currentDeviceId = null;
            store.currentDeviceRecord = {};
            store.deviceNames = {};
            clearInterval(this.intervalInstanse);
        }
    }

    // 统计报表
    var reportForm = {
        template:document.getElementById("report-template").innerHTML,
        data:function() {
            return {

            }
        },
        methods: {
           
        },
    }


    // 后台管理
    var bgManager = {
        template:document.getElementById("manager-template").innerHTML,
        data:function() {
            return {
                userType:null,
                theme:"light",
                navList:[
                    {
                        title:"客户管理",
                        name:"customerMar",
                        icon:"md-contact",
                        children:[
                            {title:"添加客户",name:"addCustomer",icon:"md-person-add"},
                            {title:"查询客户",name:"queryCustomer",icon:"md-search"}
                        ]
                    },
                    {
                        title:"分组管理",
                        name:"groupMar",
                        icon:"ios-albums",
                        children:[
                            {title:"添加分组",name:"addGroup",icon:"ios-photos-outline"},
                            {title:"查询分组",name:"queryGroup",icon:"md-search"}
                        ]
                    },
                    {
                        title:"用户管理",
                        name:"userMar",
                        icon:"md-person",
                        children:[
                            {title:"添加用户",name:"addUser",icon:"ios-person-add"},
                            {title:"查询用户",name:"queryUser",icon:"md-search"}
                        ]
                    },
                    {
                        title:"设备管理",
                        name:"deviceMar",
                        icon:"md-phone-portrait",
                        children:[
                            {title:"添加设备",name:"addDevice",icon:"md-add"},
                            {title:"查询设备",name:"queryDevice",icon:"md-search"}
                        ]
                    },
                ]
            }
        },
        methods: {
            selectditem:function(name) {
                if(this.currentPage == name){ return;}
                var page = null;
                switch(name){
                    case "addCustomer" :
                        page = "addcustomer.html";
                    break;
                    case "queryCustomer" :
                        page = "querycustomer.html";
                    break;
                    case "addGroup" :
                        page = "addgroup.html";
                    break;
                    case "queryGroup" :
                        page = "querygroup.html";
                    break;
                    case "addDevice" :
                        page = "adddevice.html";
                    break;
                    case "queryDevice" :
                        page = "querydevice.html";
                    break;
                    case "addUser" :
                        page = "adduser.html";
                    break;
                    case "queryUser" :
                        page = "queryuser.html";
                    break;
                }
                this.currentPage = name;
                this.loadPage(page);
            },
            loadPage:function(page){
                var me = this;
                this.$Loading.start();
                $("#mar-view").load("../view/manager/"+page,function(){
                    me.$Loading.finish();
                });
            }
        },
        mounted:function () {
            this.userType = Cookies.get("userType");
            if(this.userType == 0){
                this.$delete(this.navList,1);
                this.$delete(this.navList,2);
            }
        }
    };


    // 根组件
    new Vue({
        el:"#app",
        i18n:i18n,
        data:{
            componentId:"",
        },
        methods:{
            changeComponent:function(componentid){
                this.componentId = componentid;
            },
            changeNav:function (state) {
                if( this.$refs["my-component"].setNavState){
                    this.$refs["my-component"].setNavState(state);
                };
            },
            changeInterval:function (interval) {
                if(this.$refs["my-component"].setIntervalTime){
                    this.$refs["my-component"].setIntervalTime(interval);
                };
            }
        },
        components:{
            appHeader : appHeader,
            bgManager : bgManager,
            monitor   : monitor,
            reportForm : reportForm
        },
        mounted:function () {

        }
    })
})();





