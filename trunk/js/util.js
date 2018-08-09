var utils = {
    sendAjax:function(url,data,callback){
        var encode = JSON.stringify(data);
            $.ajax({
                url:url,
                type:"post",
                data:encode,
                dataType:"json",
                success:function(resp){
                    if(resp.status == 3){
                        new Vue().$Message.error("token过期,2秒后跳回登录页面");
                        setTimeout(function () {
                            window.location.href = "index.html";
                        })
                    }else{
                        callback(resp)
                    }
                },
                error:function(e){
                    Cookies.remove("token");
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
    },
    getParameterByName:function (name){
		var url = location.search;
			url = decodeURIComponent(url);
		var theRequest = new Object();
			if (url.indexOf("?") != -1) {
				var str = url.substr(1);
				var strs = str.split("&");
				for(var i = 0; i < strs.length; i ++) {
					theRequest[strs[i].split("=")[0]]=unescape(strs[i].split("=")[1]);
				}
			}
		    return theRequest[name];
    },
    getDisplayRange:function(zoom){
        var range = null;
        if(zoom == 18){
            range = 25;
        }else if(zoom == 17){
            range = 50;
        }else if(zoom == 16){
            range = 100;
        }else if(zoom == 15){
            range = 250;
        }else if(zoom == 14){
            range = 500;
        }else if(zoom == 13){
            range = 1000;
        }else if(zoom == 12){
            range = 2500;
        }else if(zoom == 11){
            range = 5000;
        }else if(zoom == 10){
            range = 10000;
        }else if(zoom == 9){
            range = 12500;
        }else if(zoom == 8){
            range = 25000;
        }else if(zoom == 7){
            range = 50000;
        }else if(zoom == 6){
            range = 100000;
        }else if(zoom == 5){
            range = 250000;
        }else if(zoom == 4){
            range = 500000;
        }
        return range;						
    },
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


// playBack 轨迹回放
function playBack(deviceid) { 
    window.open("playback.html?deviceid="+deviceid);
}