(function(){
    // 是否显示公司名字
    var isShowCompany     = Cookies.get("isShowCompany"); 
    //全局变量
    var store = {
        navState : isShowCompany === 'true' ? true : false ,
        intervalTime:10,
        currentDeviceId:null,
        currentDeviceRecord:{},
    };
    // vuex store
    var vstore = new Vuex.Store({
        state:{
            userType:Cookies.get("userType"),
            deviceNames:{}
        },
        actions: {
            setDeviceNames:function (context,groups) {
                context.commit('setDeviceNames',groups);
            }
        },
        mutations: {
            setDeviceNames:function (state,groups) {
              groups.forEach(function (group) {
                    group.devices.forEach(function (device,index) {
                        var deviceid = device.deviceid;
                        state.deviceNames[deviceid] = device;
                    });
                });
            }
        },
    });
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
                isShowSystemParam:true,
                modalPass:false,
                oldPass:"",
                newPass:"",
                confirmPass:""
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
                        this.isShowSystemParam = false;
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
            changeUserPass:function () { 
                var me = this;
                var url = myUrls.changeUserPass();
                var data = {
                    "username":Cookies.get("name"),
                    "newpass": $.md5(this.newPass),
                    "oldpass": $.md5(this.oldPass)
                }
                if(this.newPass.length < 4 ){
                    this.$Message.error("密码不能小于四位");
                    return;  
                }
                if(this.oldPass == "" || this.newPass == "" || this.confirmPass == ""){
                    this.$Message.error("密码不能为空!");
                    return; 
                }
                if( this.confirmPass !== this.newPass){
                    this.$Message.error("2次密码不一致!");
                    return;
                }
                
                utils.sendAjax(url,data,function (resp) { 
                    if(resp.status == 0){
                        me.$Message.success("密码修改成功!");
                        Cookies.set("accountpass",me.newPass,{ expires: 7 });              
                        me.modalPass = false;
                    }else{
                        me.$Message.error("旧密码错误!");
                    };
                });

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
                this.oldPass = "";
                this.newPass = "";
                this.confirmPass = "";
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
                var intervalTime = Number(this.intervalTime)
                this.$emit("change-intervaltime",intervalTime);
                store.intervalTime = intervalTime;
            }
        }
    };

    // 监控页面的 客户公司rander 函数
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
                        type: 'md-keypad',
                    },
                    style: {
                        marginRight: '8px'
                    }
                }),
                h('span', data.title)
            ])
        ]);
    };

    // 监控页面的 分组rander 函数
    var groupRender = function (h, info){
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
                        type: 'ios-people',
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
                isShowConpanyName:store.navState, // 0 不显示公司   1 显示公司名
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
                intervalInstanse:null,    // 定时器实例
                selectedDevObj:{},
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
            openCanpany:function (conpany) { 
                conpany.expand = !conpany.expand;
            },
            openGroupItem:function (groupInfo) { 
                groupInfo.expand = !groupInfo.expand;
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
            selectedDev:function (deviceInfo) { 
                this.cancelSelected();
                     deviceInfo.isSelected = true;
                this.selectedDevObj = deviceInfo;
                this.handleClickDev(deviceInfo.deviceid);
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
                        var angle = utils.getAngle(record.course);
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
                        });
                    });
                }else{
                    this.currentStateData.forEach(function (group) {
                        group.children.forEach(function (dev) {
                            dev.isSelected = false;
                        });
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
                // groups.forEach(function (group) {
                //     group.devices.forEach(function (device,index) {
                //         var deviceid = device.deviceid;
                //         store.deviceNames[deviceid] = device;
                //     });
                // });
                this.$store.dispatch("setDeviceNames",groups);
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
                        var label =  new BMap.Label(me.$store.state.deviceNames[deviceid].devicename,{ position : point, offset   : new BMap.Size(20, -3) });
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
                if(!$.isEmptyObject(record)){
                    var markers = this.map.getOverlays();
                    for(var i = 0 ; i < markers.length ; i++){
                        var marker = markers[i];
                        if(marker.deviceid == store.currentDeviceId){           
                            var infoWindow = me.getInfoWindow(record);
                            marker.openInfoWindow(infoWindow,record.point)
                        };
                    };
                }
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
                try {
                    var devdata = this.$store.state.deviceNames[info.deviceid];
                    var address = this.getAddress(info);
                    var sContent = '<div><p style="margin:0;font-size:13px">' +
                    '<p> 设备名称: ' +devdata.devicename+'</p>' +
                    '<p> 设备ID: ' +info.deviceid+'</p>' +
                    '<p> 经纬度: ' +info.callon+","+ info.callat +'</p>' +
                    '<p> 最后时间: ' +DateFormat.longToDateTimeStr(info.arrivedtime,0)+'</p>' +
                    '<p> 到期时间: ' +DateFormat.longToDateTimeStr(devdata.overduetime,0)+'</p>' +
                    '<p class="last-address"> 详细地址: '+address+'</p>' +
                    '<p class="operation">'+
                        '<span class="ivu-btn ivu-btn-default ivu-btn-small" onclick="playBack('+info.deviceid+')">轨迹</span>'+
                        '<span class="ivu-btn ivu-btn-default ivu-btn-small" onclick="trackMap('+info.deviceid+')">跟踪</span> </p></div>';
                    var opts = {
                        width:300,
                    };
                    return new BMap.InfoWindow(sContent,opts);
                } catch (error) {
                    console.log("get不到info.deviceid --- ") 
                    console.log(info) 
                    console.log(devdata)
                }
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
                this.intervalTime = interval;
                clearInterval(this.intervalInstanse);
                this.setIntervalReqRecords();
            },
            queryCompanyTree:function (callback) {
                var url = myUrls.queryCompanyTree();
                utils.sendAjax(url,{},function (resp) {
                    callback(resp)
                })
            },
            playBack:function (deviceid) { 
                playBack(deviceid);
            },
            trackMap:function (deviceid) { 
                trackMap(deviceid);
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
                var logintype = Cookies.get("logintype");
                if(logintype !== "DEVICE" && this.isShowConpanyName){
                    newArray.unshift({
                        title:"默认客户",
                        companyname:"默认客户",
                        companyid:0,
                        children:[],
                        expand: false,
                        render:render
                    });
                };
                if(newArray.length === 0 ){
                    if(logintype == "DEVICE"){
                        newArray.push({
                            title:"默认客户",
                            children:[],
                            companyname:"默认客户",
                            expand: false,
                            companyid:0,
                            render:render
                        })
                    }
                };
                return newArray;
            },
            filterGroups:function (groups) { 

                var newGroups = [];
                var newObject = {};
                groups.forEach(function (item) { 
                    var groupid = item.groupid;
                    var devices = item.devices;
                    if(newObject[groupid] == undefined){
                        newObject[groupid] = {
                            groupname:item.groupname,
                            devices:[],
                            groupid:item.groupid,
                            remark:item.remark
                        };
                    }
                    newObject[groupid].devices = newObject[groupid].devices.concat(devices);
                });
                
                for(var key in newObject){
                    if(newObject.hasOwnProperty(key)){
                        newGroups.push(newObject[key]);
                    }
                }

                return newGroups;
            },
            getAllShowConpanyTreeData:function () {
                var me = this;
                var newArray = me.getNewCompanyArr();
                var newGroups = [];                 
                me.groups.forEach(function (group,index) {
                    
                    var companyid = group.companyid;
                    var onlineCount = 0;
                    var groupObj = {
                        companyid:companyid,
                        title    :group.groupname,
                        expand: false,
                        render:groupRender,
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
                            if(groupObj.children.length){
                                company.children.push(groupObj);
                            }
                            company.title = company.companyname + "("+ company.children.length + ")";
                        }else{
                            var logintype = Cookies.get("logintype");
                            if(logintype == "DEVICE"){
                                company.children.push(groupObj);
                                company.title = company.companyname + "("+ company.children.length + ")";
                            }
                        }
                    });

                });
                var treeData = [];
                for(var i = 0 ; i < newArray.length ; i++){
                    var item = newArray[i];
                    if(item.children.length !== 0){
                        treeData.push(item);
                    }
                }
                me.currentStateData = treeData;
            },
            getAllHideConpanyTreeData:function () {
                var me = this;
                var groups = this.filterGroups(this.groups);
                    groups.forEach(function (group) {

                        var onlineCount = 0;
                        var groupData =  {
                            title: group.groupname,
                            expand: false,
                            render:groupRender,
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
                        render:groupRender,
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
                var groups = this.filterGroups(this.groups);
                    groups.forEach(function (group) {
                        var groupData =  {
                            title: group.groupname,
                            expand: false,
                            render:groupRender,
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
                        render:groupRender,
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
                var groups = this.filterGroups(this.groups);
                    groups.forEach(function (group) {
                        var groupData =  {
                            title: group.groupname,
                            expand: false,
                            render:groupRender,
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
                    me.intervalTime--;
                    if(me.intervalTime <= 0 ){
                        var devIdList = Object.keys(me.$store.state.deviceNames);
                        me.getLastPosition(devIdList,function (resp) {
                            if(resp.records){
                                resp.records.forEach(function (record) {
                                    if(record){
                                        var isOnline = (Date.now() - record.arrivedtime) < me.offlineTime ? true : false ; 
                                        var iconState = null;
                                        var angle = utils.getAngle(record.course);
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
                                me.intervalTime = Number(store.intervalTime);
                            }
                        });
                    }
                }, 1000);
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
                    // var angle = directionList[parseInt(Math.random()*8)];  
                    var angle = utils.getAngle(record.course);
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
            },
        },
        watch:{
            records:function () {
                var online  = 0;
                var offline = 0;
                var me = this;
                var deviceIds = Object.keys(me.$store.state.deviceNames);

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
                var me = this;
                if(this.isShowConpanyName && this.companys.length == 0){
                    this.queryCompanyTree(function (response) {
                        me.companys = response.companys;
                        me.getCurrentStateTreeData(me.selectedState,me.isShowConpanyName);
                    });
                }else{
                    this.getCurrentStateTreeData(this.selectedState,this.isShowConpanyName);
                }              
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
            // var isShowCompany = Cookies.get("isShowCompany");
            var havecompany = this.isShowConpanyName == true ? 1 : 0;
            // this.isShowConpanyName = store.navState;
            this.intervalTime      = Number(store.intervalTime);
            this.initMap();
            this.getMonitorListByUser(havecompany,function (resp) {
                me.groups = resp.groups;
                me.setDeviceIdsList(resp.groups);
                var devIdList = Object.keys(me.$store.state.deviceNames);
                me.getLastPosition(devIdList,function (resp) {
                    if(resp.records){
                        me.records = resp.records;
                    }else{
                        me.records = [];
                    };
                    me.setCarIconState();
                    var range = utils.getDisplayRange(me.map.getZoom());
                    if(resp.records){
                        if(resp.records.length > 300){
                            var filterArr =  me.filterReocrds(range,resp.records);
                        }else{
                            me.addOverlayToMap(resp.records);
                        }  
                    };
                    me.selectedState = "all";
                });
            });
            this.setIntervalReqRecords();
        },
        beforeDestroy:function () {
            store.currentDeviceId = null;
            store.currentDeviceRecord = {};
            this.$store.state.deviceNames = {};
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

    // 系统参数
    var systemParam = {
        template:document.getElementById("systemparam-template"),
        data:function () { 
            return {
                selectdItemName:null,
                theme:"light",
                navList:[
                    {
                        title:"设备指令",
                        name:"deviceDirective", 
                        icon:"ios-pricetag-outline",
                        // children:[
                        //     {title:"新增指令",name:"addDirective",icon:"md-add"},
                        //     {title:"查询指令",name:"queryDirective",icon:"md-search"},
                        // ]
                    },
                    {
                        title:"设备类型",
                        name:"deviceType",
                        icon:"ios-albums",
                        // children:[
                        //     {title:"新增设备类型",name:"addDeviceType",icon:"md-add"},
                        //     {title:"查询设备类型",name:"queryDeviceType",icon:"md-search"}
                        // ]
                    },
                    {
                        title:"车辆类型",
                        name:"carType",
                        icon:"ios-car",
                        // children:[
                        //     {title:"新增车辆类型",name:"addCarType",icon:"md-add"},
                        //     {title:"查询车辆类型",name:"queryCarType",icon:"md-search"} 
                        // ]
                    },
                ]
            }
        },
        methods:{ 
            selectditem:function (name) { 
                if(this.selectdItemName != name){
                    this.selectdItemName = name;
                    this.changeItem();
                }
            },
            changeItem:function () { 
                var page = null;

                switch(this.selectdItemName){
                    case "deviceDirective" :
                        page = "devicedirective.html";
                        break;
                    case "deviceType" :
                        page = "devicetype.html";
                        break;   
                    case "carType" :
                        page = "cartype.html";
                        break;          
                };
                
                this.loadPage(page);
            },
            loadPage:function(page){
                var me = this;
                this.$Loading.start();
                $("#system-view").load("../view/systemparam/"+page,function(){
                    me.$Loading.finish();
                });
            }
        }
    };


    // 报警组建
    var waringComponent = {
            template:document.getElementById("waring-template"),
            data:function(){
                return{
                    isLargen:false,
                    index:1,
                    componentName:"waringMsg",
                    waringModal:false,
                    disposeModal:false,
                    checkboxObj:{},
                    waringRecords:[],
                    overdueDevice:[],
                    alarmTypeList:[],
                    isWaring:false,
                    interval:5000,
                    disposeRowWaringObj:{},
                    cmdRowWaringObj:{},
                    disposeAlarm:"解除报警"
                }
            },
            computed:{
                waringWraperStyle:function () { 
                    return {
                        width:this.isLargen  ? "900px" : "100px",
                        height:this.isLargen ? "500px" : "22px"
                    }
                },
                deviceNames:function () { 
                    return this.$store.state.deviceNames;
                } 
            },
            watch:{
                waringRecords:function () { 
                    if(this.waringRecords.length ){
                        this.isWaring = true;
                    }else{
                        this.isWaring = false;
                    }
                },
            },    
            methods: {
                changeLargen:function () { 
                    this.isLargen = !this.isLargen;
                    this.isWaring = false;
                },
                changeComponent:function (index) { 
                    this.index = index;
                    switch(index){
                        case 1 :
                          this.componentName = "waringMsg" ;
                          break;
                        case 2 :
                          this.componentName = "deviceMsg" ;
                          break;
                    };
                },
                queryWaringMsg:function () {
                    var me = this;
                    var url = myUrls.queryAlarm();
                    utils.sendAjax(url,this.checkboxObj,function (resp) { 
                        if(resp.status == 0){
                            me.waringRecords = resp.records;
                            me.waringRecords.forEach(function (item) { 
                                item.isdispose = "未处理";
                            })
                        }
                    });
                },
                filterWaringType:function () { 
                    this.settingCheckboxObj();
                    this.waringModal = true;
                },
                settingCheckboxObj:function(){
                    var checkboxObjJson = Cookies.get("checkboxObj");
                    if(checkboxObjJson){
                        var checkboxObj = JSON.parse(checkboxObjJson);
                        for(var key in this.checkboxObj){
                            if(this.checkboxObj.hasOwnProperty(key)){
                                this.checkboxObj[key] = checkboxObj[key];
                            }
                        };
                    }
                },
                pushOverdueDeviceInfo:function () { 
                    var interval = null;
                    var me = this;
                    interval = setInterval(function () { 
                        if(!$.isEmptyObject(me.deviceNames)){
                            for(var key in me.deviceNames){
                                var item = me.deviceNames[key];
                                var currentTime = Date.now();
                                var overduetime =  item.overduetime; 
                                var isOverdue = overduetime > currentTime ? false : true;
                                if(isOverdue){
                                    me.overdueDevice.push({
                                        devicename:item.devicename,
                                        deviceid:item.deviceid,
                                        overduetime:DateFormat.longToDateTimeStr(overduetime,0),
                                        isoverdue: "已过期"
                                    });
                                }
                            };
                            clearInterval(interval);
                        }
                    },1000);
                },
                timingRequestMsg:function () { 
                    var me = this;
                    var url = myUrls.queryMsg();
                    setInterval(function () { 
                        utils.sendAjax(url,me.checkboxObj,function (resp) {  
                            if(resp.status == 0){
                                me.disposeMsg(resp.data);
                            }
                        })
                    },this.interval);
                },
                disposeMsg:function (data) { 
                    if( data && data.length){
                        var newArr = [];
                        for(var i = 0 ; i < data.length ; i++){ 
                            var msgTiem = data[i];                       
                            for(var j = 0 ; j < this.waringRecords.length ; j++){
                                var waringItem = this.waringRecords[j];
                                if(msgTiem.deviceid == waringItem.deviceid && msgTiem.arrivedtime !== waringItem.arrivedtime ){
                                    if(newArr.indexOf(msgTiem) == -1){
                                        newArr.push(msgTiem);
                                        if(msgTiem.type == 1){
                                            this.waringRecords.unshift({
                                                deviceid:msgTiem.deviceid,
                                                gpstime:msgTiem.createtime,
                                                strstate:msgTiem.content,
                                                isdispose:"未处理"       
                                            })
                                        }else if(msgTiem.type == 2){

                                        }else if(msgTiem.type == 3){
                                            
                                        } else if(msgTiem.type == 4){
                                            
                                        }                                      
                                    };                                   
                                };   
                            };
                        };
                        // this.waringRecords = newArr.concat(this.waringRecords);
                    };
                },
                saveReqMsgParameter:function () { 
                    Cookies.set("checkboxObj",this.checkboxObj);
                    this.waringModal = false;
                },
                showDisposeModalFrame:function (param) {
                    this.disposeModal = true;
                    var row = param.row;
                    var devicetype = this.$store.state.deviceNames[row.deviceid].devicetype;
                    
                    this.cmdRowWaringObj = {
                        "arrivedtime": row.arrivedtime,
                        "devicetype":devicetype,
                        "cmdcode": 1,
                        "cmdpwd": null
                    }; 

                    this.disposeRowWaringObj = {
                        "disposecontent": "解除报警",
                        "arrivedtime": row.arrivedtime,
                        "disposeway": "解除报警",
                        "deviceid": row.deviceid,
                        "cmdcode": 0,
                        "createtime": null
                    };

                },
                sendDisposeWaring:function () { 
                    var me = this;
                    var sendCmdUrl = myUrls.sendCmd();
                    var disposeAlarmUrl = myUrls.disposeAlarm()
                    utils.sendAjax(sendCmdUrl,this.cmdRowWaringObj,function (resp) { 
                        if(resp.status == 0){
                            utils.sendAjax(disposeAlarmUrl,me.disposeRowWaringObj,function (resp) {
                                if(resp.status === 0){
                                    me.$Message.success("解除成功");
                                    me.disposeModal = false;
                                }else{
                                    me.$Message.error("解除失败");
                                }
                            })
                        }else{
                            me.$Message.error(resp.cause);
                        }
                    });
                },
                queryAlarmDescr:function () { 
                    var me = this;
                    var url = myUrls.queryAlarmDescr();
                    utils.sendAjax(url,{},function (resp) { 
                        if(resp.status == 0){
                            var records = resp.records;
                            records.forEach(function (item,index){ 
                                var idx = parseFloat(index/3) 
                                if(index%3 == 0){
                                    var newArr = [];
                                    newArr.push(item)
                                    me.alarmTypeList.push(newArr);
                                }else{
                                    me.alarmTypeList[me.alarmTypeList.length - 1].push(item);
                                }
                                me.checkboxObj[item.alarmcode] = true;
                            });
                            me.queryWaringMsg();
                        }
                    });
                }
            },
            components:{
                waringMsg:{
                    template:'<Table width="898" height="475" border :columns="columns" :data="waringrecords"></Table>',
                    props:['waringrecords'],
                    data:function () { 
                        return {
                            columns:[
                                {
                                    title: '设备ID',
                                    key: 'deviceid',
                                    width: 120,
                                    fixed: 'left',
                                },
                                {
                                    title: '报警时间',
                                    key: 'gpstime',
                                    width: 200
                                },
                                {
                                    title: '报警信息',
                                    key: 'strstate',
                                    width: 360
                                },
                                {
                                    title: '是否处理',
                                    key: 'isdispose',
                                    width: 100
                                },
                                {
                                    title: '操作',
                                    key: 'action',
                                    fixed: 'right',
                                    width: 120,
                                    render: (h, params) => {
                                        var index = params;
                                        var me = this;
                                        return h('div', [
                                            h('Button', {
                                                props: {
                                                    type: 'primary',
                                                    size: 'small'
                                                },
                                                on: {
                                                    click: function () {
                                                        // me.removeWaring(index);
                                                        me.$emit("showdisposemodal",params);
                                                    }
                                                }
                                            }, '解除报警'),
                                        ]);
                                    }
                                }
                            ]
                        }
                    },
                    methods:{
                        removeWaring:function (index) {
                            console.log(index);
                        }
                    },
                    computed:{},
                    mounted:function () {}
                },
                deviceMsg:{
                    template:'<Table height="475" :columns="columns" :data="deviceinfolist"></Table>',
                    props:['deviceinfolist'],
                    data:function () { 
                        return {
                            columns:[
                                {
                                    title: '设备名称',
                                    key: 'devicename',
                                },
                                {
                                    title: '设备ID',
                                    key: 'deviceid',
                                },
                                {
                                    title: '过期时间',
                                    key: 'overduetime',
                                },
                                {
                                    title: '是否过期',
                                    key: 'isoverdue',
                                },
                            ],
                        }
                    }
                },
            },
            mounted:function(){
                this.settingCheckboxObj();
                this.pushOverdueDeviceInfo();
                this.timingRequestMsg();
                this.queryAlarmDescr()
            }
        };

    // 根组件
var vRoot = new Vue({
        el:"#app",
        store:vstore,
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
            reportForm : reportForm,
            waringComponent : waringComponent ,
            systemParam : systemParam
        },
        mounted:function () {

        }
    })
})();





