(function(){
    // 后台管理
    var bgManager = {    
        template:document.getElementById("manager-template").innerHTML,
        data() {
            return {
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
                    }
                ]
            }
        },
        methods: {
            selectditem:function(name) {
                var page = null;
                switch(name){
                    case "addCustomer" :
                        page = "addcustomer.html";
                    break;
                    case "queryCustomer" :
                        page = "querycustomer.html";
                    break;    
                }

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


    // 根组件
    new Vue({
        el:"#app",
        data:{
            componentId:"bgManager"
        },
        methods:{
            changeComponent:function(index){
                
            }
        },
        components:{
            appHeader:appHeader,
            bgManager:bgManager
        }

    })


})();




