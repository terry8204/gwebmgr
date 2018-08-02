(function(){
    // 头部组建
    var appHeader = {
        template:document.getElementById("header-template").innerHTML,
        data:function(){
            return {
                dark:"dark",
                name:"",
                isManager:true,
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
                        mgr = "[系统监控员]";
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
                    console.log(resp);
                    if(resp.status == 0){
                        Cookies.remove("token");
                        window.location.href = "index.html";
                    }else{
                        me.$Message.error(resp.cause);
                    }
                })   
            }
        },
        mounted:function (param) { 
             this.userType = Cookies.get("userType");
            var mgr = this.getManagerType(this.userType);
            this.name    = Cookies.get("name") + mgr;
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
                sosoValue: '',
                data3: ['Steve Jobs', 'Stephen Gary Wozniak', 'Jonathan Paul Ive'],
                selectedState:'all',
                data5: [
                    // {
                    //     title: 'parent 1',
                    //     expand: false,
                    //     render:render,
                    //     children: [
                    //         {
                    //             title: 'child 1-1',
                    //         },
                    //         {
                    //             title: 'child 1-2',
                    //         }
                    //     ]
                    // },
                    
                ],
                buttonProps: {
                    type: 'default',
                    size: 'small',
                },
                deviceIds:{}
            }
        },
        methods: {
            initMap:function () {
                this.map = new BMap.Map("map");
                this.map.enableScrollWheelZoom();
                this.map.centerAndZoom(new BMap.Point(108.0017245,35.926895),5); 
            },         
            filterMethod (value, option) {
                return option.toUpperCase().indexOf(value.toUpperCase()) !== -1;
            },
            selectedStateNav:function (state) {
                this.selectedState = state;
            },
            renderContent:function (h, { root, node, data }) {
                console.log(node);
                return h('span', {
                    style: {
                        display: 'inline-block',
                        cursor: 'pointer',
                        width: '100%',
                        color:node.node.isOnline ? "#2D8CF0" : "#C7CFD4"

                    },
                    on:{
                        click: function(){ 
                            console.log(data);
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
            selectedChilren:function (param) { 
                console.log(param)
            },
            getMonitorListByUser:function () {
                var me = this;
                var url = myUrls.monitorListByUser();
                utils.sendAjax(url,{},function (resp) { 
                    console.log(resp);
                    if(resp.status == 0 && resp.companys!=null && resp.companys.length > 0){
                        me.getNavDataList(resp.companys);
                    }else{

                    }
                });
            },
            getNavDataList:function (companys) { 
                var me = this;
                companys.forEach(function(company){
                    company.groups.forEach(function (group) {
                        var data =  {
                            title: group.groupname,
                            expand: false,
                            render:render,
                            children: []
                        };
                        group.devices.forEach(function (device,index) {
                            var dev = {
                                title:device.deviceid,
                                isOnline:false,
                                isSelected:false
                            };
                            data.children.push(dev);
                            me.deviceIds[device.deviceid] = "";
                        });
                        if(data.children.length){
                            if(data.title == "默认组"){
                                me.data5.unshift(data);
                            }else{
                                me.data5.push(data);
                            }
                        }                
                    });    
                })
                me.getAllLastPosition();
            },
            getAllLastPosition:function () { 
                var me = this;
                var url = myUrls.lastPosition();
                var data = {
                    username: "admin",
                    deviceids: Object.keys(this.deviceIds)
                }
                utils.sendAjax(url,data,function (resp) {
                    console.log(resp);
                    var records = resp.records;
                    records.forEach(function (record) { 
                        var marker = new BMap.Marker(record.gpslon,record.gpslat);
                        me.map.addOverlay(marker)
                    })
                });

                setTimeout(function () { 
                    me.data5.forEach(function (group) { 
                        group.children.forEach(function (dev) {
                            dev.isOnline = true;
                        })
                    });
                },5000);
            }
        },
        mounted:function () {
            this.initMap();
            this.getMonitorListByUser();
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
            componentId:"monitor"
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
            }
        },
        components:{
            appHeader:appHeader,
            bgManager:bgManager,
            monitor  :monitor,
            reportForm:reportForm
        }

    })
})();





