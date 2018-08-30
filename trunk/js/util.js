var utils = {    
    sendAjax:function(url,data,callback){
        var encode = JSON.stringify(data);
            $.ajax({
                url:url,
                type:"post",
                data:encode,
                timeout : 10000, 
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
    getAngle:function(course){
        var angle = null ;
        if(course == 0){
            angle = 0;
        }else if(course > 0 && course <= 45){
            angle = 45;
        }else if(course > 45 && course <= 90){
            angle = 90;
        }else if(course > 90 && course <= 135){
            angle = 135;
        }else if(course > 135 && course <= 180){
            angle = 180;
        }else if(course > 180 && course <= 225){
            angle = 225;
        }else if(course > 225 && course <= 270){
            angle = 270;
        }else if(course > 270 && course <= 315){
            angle = 315;
        }else if(course > 315 && course <= 360){
            angle = 0;
        }
        return angle;
    },
};


//  vue组件   配合查询分组表格使用
Vue.component('expand-row',{
    template:'<div>'+ 
                '<span v-for="(item , index) in devices" style="display:inline-block;margin:5px">'+
                    '<i-button icon="md-phone-portrait" @click="clickMe(item)"> {{item.deviceid}}</i-button>'+
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


//  vue组件 
Vue.component('expand-cmd-row',{
    template:'<div>'+ 
                '<span v-for="(item , index) in selectedCmdList" style="display:inline-block;margin:5px">'+
                    '<i-button icon="ios-female"> {{item.cmdname}}</i-button>'+
                '</span>'+   
            '</div>',
    props:{
        devices:Object
    },
    data:function(){
        return{
            selectedCmdList:[],
        }
    },
    methods: {
        querySelectedCmd:function () {
            var url = myUrls.queryDeviceTypeHadCmd();
            var data = {"devicetype": this.devices.devicetypeid};
            utils.sendAjax(url,data,this.doQuerySelectedCmdFn);
        },
        doQuerySelectedCmdFn:function (resp) { 
            if(resp.status == 0) {
                this.selectedCmdList = resp.records;
                this.devices.selectedCmdList = resp.records;
            }
        }
    },
    mounted:function(){
        if(this.devices.selectedCmdList == undefined){
            this.querySelectedCmd();
        }else{
            this.selectedCmdList = this.devices.selectedCmdList;
        };
    }
});

//  得到表格添加指令的 row组建
var expandCmdRow = Vue.component('expand-cmd-row');

// 轨迹回放
function playBack(deviceid) { 
    window.open("playback.html?deviceid=" + deviceid,'resizable=1, menuBar=0, toolBar=0, scrollbars=yes, Status=yes, resizable=1');
}

// 跟踪
function trackMap(deviceid) { 
    window.open("trackmap.html?deviceid=" + deviceid,'resizable=1, menuBar=0, toolBar=0, scrollbars=yes, Status=yes, resizable=1');
}


