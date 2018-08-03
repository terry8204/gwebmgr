(function(){
    var store = {
        navState : false,
        intervalTime:10,
        currentDeviceId:null,
        deviceNames:{}
    };
    // 头部组建
    var appHeader = {
        template:document.getElementById("header-template").innerHTML,
        data:function(){
            return {
                dark:"dark",
                name:"",
                isManager:true,
                modal:false,
                isShowCompany:false,
                intervalTime:10
            }
        },
        methods:{
            changeNav:function(index){
                this.$emit("change-nav",index);
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
            showSetup:function () { 
                this.modal = true;
            },
            changeShowCompany:function (state) { 
                this.$emit("change-tree",state);
                store.navState = state;
            }   
        },
        mounted:function (param) { 
            this.userType = Cookies.get("userType");
            var mgr = this.getManagerType(this.userType);
            this.name    = Cookies.get("name") + mgr;
        },
        watch: {
            intervalTime:function () { 
                this.$emit("change-intervaltime",this.intervalTime);
                store.intervalTime = this.intervalTime;
            }
        }
    };

    // 监控页面的 rander 函数  
    var render = function (h, { root, node, data }){
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
                isShowConpanyName:false,  // 0 不显示公司   1 显示公司名
                sosoValue: '',
                data3: ['Steve Jobs', 'Stephen Gary Wozniak', 'Jonathan Paul Ive'],
                selectedState:'',
                groupsData: [],
                companyData:[],
                currentStateData:[],
                records:[],
                companys:[],
                buttonProps: {
                    type: 'default',
                    size: 'small',
                },
                deviceIds:{},
                intervalTime:null,
                offlineTime:5*60*1000,
                allDevCount:0,
                onlineDevCount:0,
                offlineDevCount:0,
            }
        },
        methods: {
            initMap:function () {
                var me = this;
                this.map = new BMap.Map("map");
                this.map.enableScrollWheelZoom();
                this.map.centerAndZoom(new BMap.Point(108.0017245,35.926895),5); 

                this.map.addEventListener("moveend",function (ev) { 
                    me.map.clearOverlays();
                    var pointArr = me.getThePointOfTheCurrentWindow();
                    me.addOverlayToMap(pointArr);
                });

                this.map.addEventListener("zoomend",function (ev) {
                    me.map.clearOverlays(); 
                    console.log("zoom");
                })
            },     
            getThePointOfTheCurrentWindow:function () { 
                var bounds = this.map.getBounds();
				var pointArr = [];			
				this.records.forEach(function(item,index){
                    var lng_lat = wgs84tobd09(item.callon,item.callat);
					var point = new BMap.Point(lng_lat[0],lng_lat[1]);
					if(bounds.containsPoint(point)){
						pointArr.push(item);
					}																
                });	
                return pointArr;
            },    
            filterMethod (value, option) {
                return option.toUpperCase().indexOf(value.toUpperCase()) !== -1;
            },
            selectedStateNav:function (state) {
                this.selectedState = state;
            },
            renderContent:function (h, { root, node, data }) {
                var me = this;
                return h('span', {
                    style: {
                        display: 'inline-block',
                        cursor: 'pointer',
                        width: '100%',
                        background:data.isSelected ? "#FFF5C2":"",
                        color:node.node.isOnline ? "#2D8CF0" : "#C7CFD4"
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
                var url = myUrls.lastPosition();
                var data = {
                    username: this.username,
                    deviceids: [deviceid]
                };
                utils.sendAjax(url,data,function (resp) { 
                  
                    if(resp.records != null && resp.records.length){
                        var record = resp.records[0];
                        var callon = record.callon;
                        var callat = record.callat;
                        var lng_lat = wgs84tobd09(callon,callat);
                        me.map.centerAndZoom(new BMap.Point(lng_lat[0],lng_lat[1]),17);

                    }else{
                        me.$Message.error("没有位置信息");
                    }
                });
                store.currentDeviceId = deviceid;
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
            getMonitorListByUser:function () {
                var me = this;
                var url = myUrls.monitorListByUser();
                utils.sendAjax(url,{},function (resp) { 
         
                    if(resp.status == 0 && resp.companys!=null && resp.companys.length > 0){
                        me.companys = resp.companys;
                        me.setDeviceIdsList(resp.companys);
                        me.getAllLastPosition();
                    }else if(resp.status == 3){
                        me.$Message.error("请重新登录,2秒后自动跳转登录页面");
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
            setDeviceIdsList:function (companys) { 
                var me = this;
                companys.forEach(function(company,index){
                    company.groups.forEach(function (group) {                    
                        group.devices.forEach(function (device,index) {
                            var deviceid = device.deviceid;
                            me.deviceIds[deviceid] = "";
                            store.deviceNames[deviceid] = device.devicename;
                        });                  
                    });    
                });     
            },
            getAllLastPosition:function () { 
                var me = this;
                var url = myUrls.lastPosition();
                var data = {
                    username: this.username,
                    deviceids: Object.keys(this.deviceIds)
                };
                utils.sendAjax(url,data,function (resp) {                
                    me.records = resp.records;
                    me.selectedState = "all";
                    me.addOverlayToMap(me.records);
                });

            },
            addOverlayToMap:function (records) { 
                var me = this;
                records.forEach(function (record){ 
                    if(record != null){
                        var lng_lat = wgs84tobd09(record.callon,record.callat);
                        var point = new BMap.Point(lng_lat[0],lng_lat[1]);
                        var marker = new BMap.Marker(point);
                        me.markerAddEvent(marker,record.deviceid);
                        me.map.addOverlay(marker);
                    };
                })
            },
            markerAddEvent:function (marker,deviceid) {
                var me = this;
                var devLastInfo = (function () { 
                    for(var i = 0 ; i <  me.records.length ; i++){
                        var item = me.records[i];
                        if(item.deviceid == deviceid){
                            return item;
                        }
                    };
                 })(); 
                marker.addEventListener("click", function(){   
                    var infoWindow = me.getInfoWindow(devLastInfo);     
                    marker.openInfoWindow(infoWindow,marker.point); //开启信息窗口
                });
            },
            getInfoWindow:function (info) {
                console.log(info);
                var address = this.getAddress(info);

                var sContent = '<div><p style="margin:0;font-size:13px">' +
                '<p> 设备名称: ' +store.deviceNames[info.deviceid]+'</p>' +
                '<p> 设备ID: ' +info.deviceid+'</p>' + 
                '<p> 最后时间: ' +DateFormat.longToDateTimeStr(info.arrivedtime,0)+'</p>' +
                '<p class="last-address"> 详细地址: '+address+'</p>' +
                '<p class="operation"> <span onclick="alert(1)"><a>回放</a></span>｜<span onclick="alert(1)"><a>跟踪</a></span>  </div>';

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
                            console.log(resp.address);
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
            },
            getCurrentStateTreeData:function (state,isShowConpanyName) { 
                this.currentStateData = [];
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
            },
            getAllShowConpanyTreeData:function () { 
                var me = this;                       
                    this.companys.forEach(function (company) { 
                        var companyObj = {
                            title: company.companyname,
                            expand: false,
                            render:render,
                            children: []
                        }
                        company.groups.forEach(function (group) {                    
                            var groupObj =  {
                                title: group.groupname,
                                expand: false,
                                render:render,
                                children: []
                            };
                            group.devices.forEach(function (device,index){
                                var devObj = {
                                    title:device.devicename,
                                    isSelected:false,
                                    deviceid:device.deviceid
                                };
                                devObj.isOnline = me.getIsOnline(device.deviceid);
                                groupObj.children.push(devObj);
                            });    
                            if(groupObj.children.length){
                                companyObj.children.push(groupObj);
                            }              
                        }); 
                        if(companyObj.children.length){
                            me.currentStateData.push(companyObj);
                        } 
                    })             
            },
            getAllHideConpanyTreeData:function () { 
                var me = this;                       
                this.companys.forEach(function (company) {
                    company.groups.forEach(function (group) { 
                        var groupData =  {
                            title: group.groupname,
                            expand: false,
                            render:render,
                            children: []
                        };

                        group.devices.forEach(function (device,index) {
                            var isOnline = me.getIsOnline(device.deviceid);
                            var dev = {
                                    title:device.devicename,                                   
                                    isSelected:false,
                                    isOnline:isOnline,
                                    deviceid:device.deviceid
                                };
                                groupData.children.push(dev);
                        });

                        if(groupData.children.length){
                            if(groupData.title == "默认组"){
                                me.currentStateData.unshift(groupData);
                            }else{
                                me.currentStateData.push(groupData);
                            }
                        }   
                    })
                })
            },
            getOnlineShowConpanyTreeData:function () { 
                var me = this;                       
                this.companys.forEach(function (company) { 
                    var companyObj = {
                        title: company.companyname,
                        expand: false,
                        render:render,
                        children: []
                    }
                    company.groups.forEach(function (group) {                    
                        var groupObj =  {
                            title: group.groupname,
                            expand: false,
                            render:render,
                            children: []
                        };
                        group.devices.forEach(function (device,index){
                            var isOnline = me.getIsOnline(device.deviceid);
                            var devObj = {
                                title:device.devicename,
                                isSelected:false,
                                isOnline:isOnline,
                                deviceid:device.deviceid
                            };
                            if(isOnline){
                                groupObj.children.push(devObj);
                            }
                           
                        });   
                        if(groupObj.children.length){
                            companyObj.children.push(groupObj);
                        }
                        
                    }); 
                    if(companyObj.children.length){
                        me.currentStateData.push(companyObj);
                    }
                    
                })               
            },
            getOnlineHideConpanyTreeData:function () { 
                var me = this;                       
                this.companys.forEach(function (company) {
                    company.groups.forEach(function (group) { 
                        var groupData =  {
                            title: group.groupname,
                            expand: false,
                            render:render,
                            children: []
                        };

                        group.devices.forEach(function (device,index) {
                            var isOnline = me.getIsOnline(device.deviceid);
                            var dev = {
                                    title:device.devicename,                                   
                                    isSelected:false,
                                    isOnline:isOnline,
                                    deviceid:device.deviceid
                                };
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
                        }   
                    })
                })
            },
            getOfflineShowConpanyTreeData:function () { 
                var me = this;                       
                this.companys.forEach(function (company) { 
                    var companyObj = {
                        title: company.companyname,
                        expand: false,
                        render:render,
                        children: []
                    }
                    company.groups.forEach(function (group) {                    
                        var groupObj =  {
                            title: group.groupname,
                            expand: false,
                            render:render,
                            children: []
                        };
                        group.devices.forEach(function (device,index){
                            var isOnline = me.getIsOnline(device.deviceid);
                            var devObj = {
                                title:device.devicename,
                                isSelected:false,
                                isOnline:isOnline,
                                deviceid:device.deviceid
                            };
                            if(!isOnline){
                                groupObj.children.push(devObj);
                            }
                           
                        });   
                        if(groupObj.children.length){
                            companyObj.children.push(groupObj);
                        }
                        
                    }); 
                    if(companyObj.children.length){
                        me.currentStateData.push(companyObj);
                    }
                    
                }) 
            },
            getOfflineHideConpanyTreeData:function () { 
                var me = this;                       
                this.companys.forEach(function (company) {
                    company.groups.forEach(function (group) { 
                        var groupData =  {
                            title: group.groupname,
                            expand: false,
                            render:render,
                            children: []
                        };

                        group.devices.forEach(function (device,index) {
                            var isOnline = me.getIsOnline(device.deviceid);
                            var dev = {
                                    title:device.devicename,                                   
                                    isSelected:false,
                                    isOnline:isOnline,
                                    deviceid:device.deviceid
                                };
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
                        }   
                    })
                })
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
                this.allDevCount = this.records.length;
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
                this.getCurrentStateTreeData(this.selectedState,this.isShowConpanyName);
            } ,
            selectedState:function () { 
                this.getCurrentStateTreeData(this.selectedState,this.isShowConpanyName);
            },
            isShowConpanyName:function () { 
                this.getCurrentStateTreeData(this.selectedState,this.isShowConpanyName);
            }
        },
        mounted:function () {
            this.isShowConpanyName = store.navState;
            this.intervalTime      = store.intervalTime;
            this.initMap();
            this.getMonitorListByUser();

        },
        beforeDestroy:function () { 
         
        }
    }

    // 统计报表
    var reportForm = {
        template:document.getElementById("report-template").innerHTML, 
    } 


    // 后台管理
    var bgManager = {    
        template:document.getElementById("manager-template").innerHTML,
        data:function() {
            return {
                currentPage:"",
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
    };


    


    // 根组件
    new Vue({
        el:"#app",
        i18n:i18n,
        data:{
            componentId:"monitor",
        },
        methods:{
            changeComponent:function(index){
                if(index == 1){
                    this.componentId = "monitor";
                }else if(index == 2){
                    this.componentId = "reportForm"
                }else if(index == 3){
                    this.componentId = "bgManager";
                }
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
        }

    })
})();





