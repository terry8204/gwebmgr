var vueInstanse  = null;   // 全局vue实例子
var editCustomer = null;   // 要编辑客户的对象
(function(){

    // 头部组建
    var appHeader = {
        template:document.getElementById("header-template").innerHTML,
        data:function(){
            return {
                dark:"dark"
            }
        },
        methods:{
            changeNav:function(index){
                this.$emit("change-nav",index)
            }
        }
    };

    // 定位监控
    var monitor = {
        template:document.getElementById("monitor-template").innerHTML, 
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
                            {title:"增加分组",name:"addGroup",icon:"android-person-add"},
                            {title:"查询分组",name:"queryGroup",icon:"android-search"}
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
                }
                this.currentPage = name;   
                this.loadPage(page)
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




