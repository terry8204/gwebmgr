var vueInstanse  = null;   // 全局vue实例子
var editCustomer = null;   // 要编辑客户的对象
var editGroup    = null;   // 要编辑的组对象
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
                        mgr = "[一级监控员]";
                    }else if(userType == 2){
                        mgr = "[二级监控员]";
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

    // 定位监控
    var monitor = {
        template:document.getElementById("monitor-template").innerHTML,
        data:function () { 
            return {
                map:null
            }
        },
        methods: {
            initMap:function () {
                this.map = new BMap.Map("map");
                this.map.enableScrollWheelZoom();
                this.map.centerAndZoom(new BMap.Point(113.27074,23.15004),12); 
                var myCity = new BMap.LocalCity();
                myCity.get(this.setMapCenter);          
            },
            setMapCenter:function(result){
                var cityName = result.name;
                this.map.setCenter(cityName);
            },
        },
        mounted:function () {
            this.initMap();
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
                        icon:"android-contact",
                        children:[
                            {title:"增加客户",name:"addCustomer",icon:"android-person-add"},
                            {title:"查询客户",name:"queryCustomer",icon:"android-search"}
                        ]
                    },
                    {
                        title:"分组管理",
                        name:"groupMar",
                        icon:"ios-albums",  
                        children:[
                            {title:"增加分组",name:"addGroup",icon:"ios-photos-outline"},
                            {title:"查询分组",name:"queryGroup",icon:"android-search"}
                        ]
                    },
                    {
                        title:"用户管理", 
                        name:"userMar",
                        icon:"person-stalker", 
                        children:[
                            {title:"增加用户",name:"addUser",icon:"person-add"},
                            {title:"查询用户",name:"queryUser",icon:"android-search"}
                        ]
                    },
                    {
                        title:"设备管理",
                        name:"deviceMar",
                        icon:"ipod",   
                        children:[
                            {title:"增加设备",name:"addDevice",icon:"ios-plus-outline"},
                            {title:"查询设备",name:"queryDevice",icon:"android-search"}
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
        data:{
            componentId:"bgManager"
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





