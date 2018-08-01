var utils = {
    sendAjax:function(url,data,callback){
        var encode = JSON.stringify(data);
            $.ajax({
                url:url,
                type:"post",
                data:encode,
                dataType:"json",
                success:function(resp){
                    callback(resp)
                },
                error:function(e){
                    console.log("服务器错误");
                    new Vue().$Loading.error();
                },
                complete:function(){
                   
                }
            })
    },
    getCustomerList:function () { 

    }
};


//  vue组件   配合查询分组表格使用
Vue.component('expand-row',{
    template:'<div>'+ 
                '<span v-for="(item , index) in devices" style="display:inline-block;margin:5px">'+
                    '<i-button icon="ipad" @click="clickMe(item)"> {{item.deviceid}}</i-button>'+
                '</span>'+ 
            '</div>',
    props:{
        devices:Array
    },
    data:function(){
        return{

        }
    },
    methods: {
        clickMe:function(item){
            console.log(item);
        }
    },
    mounted:function(){
        console.log(this.devices);
    }
});

var expandRow = Vue.component('expand-row');


$("#mar-view").ajaxError(function(event,request, settings){
    $(this).append("<li>出错页面:" + settings.url + "</li>");
});