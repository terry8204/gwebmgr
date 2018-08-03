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
    getBaiduAddressFromBaidu:function (offsetlon,offsetlat,callback){
		var point = new BMap.Point(offsetlon,offsetlat);
		var geoc = new BMap.Geocoder();
		geoc.getLocation(point, function(rs){
			if(rs)
			{
				var addComp = rs.addressComponents;
				address = addComp.province + addComp.city + addComp.district + addComp.street + addComp.streetNumber;
				if(callback)
				{
					callback(address);
				}
			}
		});				
    },
    getJiuHuAddressSyn : function (lat,lon,callback){
        $.ajax({
            type: "get",
            url: "http://www.jh.tt/w?lat=" + lat + "&lon=" + lon,
            success: function (data) {
                if(data && data.status==0)
                {
                    callback(data);               
                }
            }
        });
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

//  得到表格row组建
var expandRow = Vue.component('expand-row');

