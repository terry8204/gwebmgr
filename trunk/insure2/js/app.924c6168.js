(function(t){function e(e){for(var a,c,o=e[0],l=e[1],r=e[2],u=0,h=[];u<o.length;u++)c=o[u],s[c]&&h.push(s[c][0]),s[c]=0;for(a in l)Object.prototype.hasOwnProperty.call(l,a)&&(t[a]=l[a]);d&&d(e);while(h.length)h.shift()();return n.push.apply(n,r||[]),i()}function i(){for(var t,e=0;e<n.length;e++){for(var i=n[e],a=!0,o=1;o<i.length;o++){var l=i[o];0!==s[l]&&(a=!1)}a&&(n.splice(e--,1),t=c(c.s=i[0]))}return t}var a={},s={app:0},n=[];function c(e){if(a[e])return a[e].exports;var i=a[e]={i:e,l:!1,exports:{}};return t[e].call(i.exports,i,i.exports,c),i.l=!0,i.exports}c.m=t,c.c=a,c.d=function(t,e,i){c.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:i})},c.r=function(t){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},c.t=function(t,e){if(1&e&&(t=c(t)),8&e)return t;if(4&e&&"object"===typeof t&&t&&t.__esModule)return t;var i=Object.create(null);if(c.r(i),Object.defineProperty(i,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var a in t)c.d(i,a,function(e){return t[e]}.bind(null,a));return i},c.n=function(t){var e=t&&t.__esModule?function(){return t["default"]}:function(){return t};return c.d(e,"a",e),e},c.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},c.p="/";var o=window["webpackJsonp"]=window["webpackJsonp"]||[],l=o.push.bind(o);o.push=e,o=o.slice();for(var r=0;r<o.length;r++)e(o[r]);var d=l;n.push([0,"chunk-vendors"]),i()})({0:function(t,e,i){t.exports=i("56d7")},"0046":function(t,e,i){},"344f":function(t,e,i){"use strict";var a=i("0046"),s=i.n(a);s.a},"3bee":function(t,e,i){"use strict";var a=i("d0f3"),s=i.n(a);s.a},"3fff":function(t,e,i){},"479a":function(t,e,i){},4847:function(t,e,i){},"56d7":function(t,e,i){"use strict";i.r(e);i("cadf"),i("551c"),i("f751"),i("097d");var a=i("2b0e"),s=(i("3b2b"),i("a481"),i("df49"),i("e7bd")),n=i("0c29"),c=i("cd5d"),o=i("ae0c"),l=i("4403"),r=i("84d6"),d=i("291f"),u=i("6fe1"),h=i("031d"),p=i("63b4"),v=i("9173"),m=i("8344"),f=i("664d"),b=i("0124"),x=i("9736"),y=i("1cc1"),_=i("e231"),w=i("aea1");a["a"].use(s["a"]),a["a"].use(n["a"]),a["a"].use(c["a"]),a["a"].use(o["a"]),a["a"].use(l["a"]),a["a"].use(r["a"]),a["a"].use(d["a"]),a["a"].use(u["a"]),a["a"].use(h["a"]),a["a"].use(p["a"]),a["a"].use(v["a"]),a["a"].use(m["a"]),a["a"].use(f["a"]),a["a"].use(b["a"]),a["a"].use(x["a"]),a["a"].use(y["a"]),a["a"].use(_["a"]),a["a"].use(w["a"]),Date.prototype.format=function(t){var e={"M+":this.getMonth()+1,"d+":this.getDate(),"h+":this.getHours(),"m+":this.getMinutes(),"s+":this.getSeconds(),"q+":Math.floor((this.getMonth()+3)/3),S:this.getMilliseconds()};for(var i in/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(this.getFullYear()+"").substr(4-RegExp.$1.length))),e)new RegExp("("+i+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?e[i]:("00"+e[i]).substr((""+e[i]).length)));return t};i("3fff");var g=function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",{attrs:{id:"app"}},[i("router-view")],1)},C=[],N=(i("7c55"),i("2877")),k={},$=Object(N["a"])(k,g,C,!1,null,null,null),P=$.exports,S=i("8c4f"),T=function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",{staticClass:"home"},[i("div",{staticClass:"center"},[i("div",{staticClass:"title"},[t._v("电动车增值服务")]),i("div",{staticClass:"btns"},[i("div",{staticStyle:{padding:"15px 7.5px 15px 15px"}},[i("div",{on:{click:t.infoEntry}},[t._v("信息录入")])]),i("div",{staticStyle:{padding:"15px 15px 15px 7.5px"}},[i("div",{on:{click:t.infoQuery}},[t._v("信息查询")])])])]),i("div",{staticClass:"service"},[i("div",{on:{click:t.cellPhone}},[i("MyIcon",{attrs:{"icon-cls":"icon-phone",size:"60px"}})],1)])])},M=[],D=function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("span",{staticClass:"iconfont",class:t.iClas,style:t.iStyle})},I=[],V=(i("c5f6"),{name:"Icon",props:{iconCls:{type:String,default:""},size:{type:String||Number,default:"24px"}},computed:{iClas:function(){return[this.iconCls]},iStyle:function(){return{fontSize:this.size}}}}),E=V,H=Object(N["a"])(E,D,I,!1,null,"de0c08b0",null),j=H.exports,A={name:"Home",components:{MyIcon:j},data:function(){return{}},methods:{infoEntry:function(){this.$router.push("/infoentry")},infoQuery:function(){this.$router.push("/infoquery")},cellPhone:function(){this.$createDialog({type:"confirm",title:"联系在线客服",content:"186-8145-0428",confirmBtn:{text:"拨打",active:!0,disabled:!1,href:"javascript:;"},cancelBtn:{text:"取消",active:!1,disabled:!1,href:"javascript:;"},onConfirm:function(){var t=document.createElement("a");t.href="tel:186-8145-0428",t.click()},onCancel:function(){}}).show()}}},O=A,q=(i("d683"),Object(N["a"])(O,T,M,!1,null,"861fd59e",null)),z=q.exports,B=z,R=function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",{staticClass:"info-entry"},[i("div",{staticClass:"vehicle-info"},[i("div",{staticClass:"title"},[t._v("车辆信息")]),i("div",{staticClass:"row"},[i("div",{staticClass:"col label"},[t._v("经销门店")]),i("div",{staticClass:"col value"},[i("cube-input",{staticStyle:{height:"43px",width:"100%"},attrs:{type:"type",placeholder:t.dealerPlaceholder},model:{value:t.dealer,callback:function(e){t.dealer="string"===typeof e?e.trim():e},expression:"dealer"}},[i("div",{attrs:{slot:"append"},slot:"append"},[i("div",{staticStyle:{height:"45px",width:"122px","line-height":"45px"}},[i("div",{staticStyle:{height:"45px",width:"45px","text-align":"center","line-height":"45px",float:"left"}},[t.isMatchDealer?i("MyIcon",{staticStyle:{color:"#40E476"},attrs:{"icon-cls":"icon-duihaocheckmark17",size:"19px"}}):i("MyIcon",{staticStyle:{color:"red"},attrs:{"icon-cls":"icon-cuo",size:"20px"}})],1),i("div",{staticStyle:{float:"left",width:"75px"},style:{color:0==t.residualPolicy?"red":"#46E6AB"}},[t._v("\n                                剩余:"+t._s(t.residualPolicy)+"份\n                            ")])])])])],1)]),i("div",{staticClass:"row"},[i("div",{staticClass:"col label"},[t._v("车架号")]),i("div",{staticClass:"col value"},[i("cube-input",{staticStyle:{height:"43px",width:"100%"},attrs:{placeholder:t.vinNumberPlaceholder},on:{focus:function(e){t.isShowMatchVinNumber=!0},blur:t.onVinInputBlur},model:{value:t.vinNumber,callback:function(e){t.vinNumber=e},expression:"vinNumber"}},[i("div",{attrs:{slot:"append"},slot:"append"},[i("div",{staticStyle:{height:"45px",width:"122px","line-height":"45px"}},[i("div",{staticStyle:{height:"45px",width:"45px","text-align":"center","line-height":"45px",float:"left"}},[t.isMatchVinNumber?i("MyIcon",{staticStyle:{color:"#40E476"},attrs:{"icon-cls":"icon-duihaocheckmark17",size:"19px"}}):i("MyIcon",{staticStyle:{color:"red"},attrs:{"icon-cls":"icon-cuo",size:"20px"}})],1),i("div",{staticStyle:{float:"left",width:"75px"},style:{color:t.isPay?"#46E6AB":"red"}},[t._v("\n                                "+t._s(t.isPay?"出厂已购":"自行购买")+"\n                            ")]),i("cube-tip",{ref:"tip",staticStyle:{left:"123px",top:"-50px"},attrs:{direction:"bottom"},on:{click:t.onCloseTip}},[t._v("剩余份数不足,立即购买")])],1)])]),i("div",{directives:[{name:"show",rawName:"v-show",value:t.isShowMatchVinNumber,expression:"isShowMatchVinNumber"}],staticClass:"match-list-wrap"},t._l(t.matchVinNumberList,function(e,a){return i("div",{key:a,staticClass:"match-item"},[i("p",{on:{click:function(i){return t.onSelectedMatchVin(e)}}},[t._v(t._s(e))])])}),0)],1)]),i("div",{staticClass:"row"},[i("div",{staticClass:"col label"},[t._v("车辆型号")]),i("div",{staticClass:"col value"},[i("cube-input",{staticStyle:{height:"43px",width:"100%"},attrs:{placeholder:t.vehicleTypePlaceholder},model:{value:t.vehicleType,callback:function(e){t.vehicleType=e},expression:"vehicleType"}})],1)]),i("div",[i("div",{staticClass:"upload-imgs"},[i("div",{staticClass:"files"},[i("div",[i("div",{staticClass:"cube-upload-wrap"},[i("cube-upload",{ref:"upload",attrs:{max:1,auto:!1,"simultaneous-uploads":1},on:{"files-added":t.addedHandler1,"file-removed":t.onfileRemoved1},model:{value:t.files1,callback:function(e){t.files1=e},expression:"files1"}})],1),i("div",{staticClass:"upload-title"},[t._v("车辆合格证")])]),i("div",[i("div",{staticClass:"cube-upload-wrap"},[i("cube-upload",{ref:"upload",attrs:{auto:!1,max:1,"simultaneous-uploads":1},on:{"file-removed":t.onfileRemoved2,"files-added":t.addedHandler2},model:{value:t.files2,callback:function(e){t.files2=e},expression:"files2"}})],1),i("div",{staticClass:"upload-title"},[t._v("收据/发票+钥匙/遥控器")])])])])])]),i("div",{staticClass:"master-info"},[t._m(0),i("div",{staticStyle:{"border-bottom":"1px solid #F2F2F2"}},[i("div",{staticClass:"upload-imgs"},[i("div",{staticClass:"files"},[i("div",[i("div",{staticClass:"cube-upload-wrap"},[i("cube-upload",{ref:"upload",attrs:{max:1,auto:!1,"simultaneous-uploads":1},on:{"files-added":t.addedHandler3,"file-removed":t.onfileRemoved3},model:{value:t.files3,callback:function(e){t.files3=e},expression:"files3"}})],1),i("div",{staticClass:"upload-title"},[t._v("身份证正面")])]),i("div",[i("div",{staticClass:"cube-upload-wrap"},[i("cube-upload",{ref:"upload",attrs:{auto:!1,max:1,"simultaneous-uploads":1},on:{"file-removed":t.onfileRemoved4,"files-added":t.addedHandler4},model:{value:t.files4,callback:function(e){t.files4=e},expression:"files4"}})],1),i("div",{staticClass:"upload-title"},[t._v("人车合影")])])])])]),i("div",{staticClass:"row"},[i("div",{staticClass:"col label"},[t._v("车主姓名")]),i("div",{staticClass:"col value"},[i("cube-input",{staticStyle:{height:"43px",width:"100%"},attrs:{type:"type",placeholder:t.masterNamePlaceholder},model:{value:t.masterName,callback:function(e){t.masterName=e},expression:"masterName"}})],1)]),i("div",{staticClass:"row"},[i("div",{staticClass:"col label"},[t._v("身份证号")]),i("div",{staticClass:"col value"},[i("cube-input",{staticStyle:{height:"43px",width:"100%"},attrs:{type:"type",placeholder:t.idNumberPlaceholder},model:{value:t.idNumber,callback:function(e){t.idNumber=e},expression:"idNumber"}})],1)]),i("div",{staticClass:"row"},[i("div",{staticClass:"col label"},[t._v("手机号码")]),i("div",{staticClass:"col value"},[i("cube-input",{staticStyle:{height:"43px",width:"100%"},attrs:{placeholder:t.phoneNumberPlaceholder},model:{value:t.phoneNumber,callback:function(e){t.phoneNumber=t._n(e)},expression:"phoneNumber"}})],1)]),i("div",{staticClass:"row"},[i("div",{staticClass:"col label"},[t._v("购车价格")]),i("div",{staticClass:"col value"},[i("cube-input",{staticStyle:{height:"43px",width:"100%"},attrs:{placeholder:t.vehiclePricePlaceholder},model:{value:t.vehiclePrice,callback:function(e){t.vehiclePrice=t._n(e)},expression:"vehiclePrice"}})],1)]),i("div",{staticClass:"row"},[i("div",{staticClass:"col label"},[t._v("购车时间")]),i("div",{staticClass:"col value"},[i("p",{on:{click:t.showDatePicker}},[t._v(t._s(t.selectedDate)),i("MyIcon",{attrs:{"icon-cls":"icon-jiantouxia",size:"15px"}})],1)])])]),i("div",{staticClass:"insure-info"},[t._m(1),i("p",{staticClass:"insure-desc"},[t._v("请务必确保申请材料真实有效，点击阅读"),i("span",{staticStyle:{color:"#1E88DA"},on:{click:t.insureNotice}},[t._v("《投单须知》")])]),i("div",{staticStyle:{"font-size":"12px"}},[i("cube-checkbox",{model:{value:t.checked,callback:function(e){t.checked=e},expression:"checked"}},[t._v("车主已阅读并同意上述条款，同时签订纸质告知书存放门店。")])],1)]),i("div",{staticClass:"submit-btn-wrap"},[i("div",{staticClass:"submit-btn"},[i("div",{on:{click:t.onSubmit}},[t._v("\n                提交\n            ")]),i("div",{staticStyle:{background:"#1AAD19"},on:{click:t.onClickCleanData}},[t._v("\n                清空\n            ")])])]),i("transition",{attrs:{name:"slide"}},[i("router-view")],1)],1)},L=[function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",{staticClass:"insure-title"},[i("h3",[t._v("车主信息")])])},function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",{staticClass:"insure-title"},[i("h3",[t._v("免责条款")])])}],U=(i("28a5"),i("bc3a")),W=i.n(U),F={name:"InfoEntry",components:{MyIcon:j},data:function(){return{checked:!1,dealer:"",isMatchDealer:!1,dealerPlaceholder:"请输入投保门店编码",dealerPhone:"",dealerPhonePlaceholder:"请输入门店手机号",residualPolicy:0,detailAddress:"",isMatchVinNumber:!1,isShowMatchVinNumber:!1,vinNumber:"",isPay:!1,matchVinNumberList:[],vinNumberPlaceholder:"请输入车架号",vehicleType:"",vehicleTypePlaceholder:"请输入型号(合格证上名称)",batteryType:"",batteryTypeOptions:["铅酸-36V10AH","铅酸-36V12AH","铅酸-36V14AH","铅酸-36V20AH","铅酸-72V20AH","铅酸-48V10AH","铅酸-48V12AH","铅酸-48V20AH","铅酸-60V20AH","铅酸-72V30AH","锂电-48V20AH","锂电-48V12AH","锂电-48V15AH","锂电-60V20AH","锂电-60V30AH","锂电-72V30AH","锂电-72V20AH","其他选项"],masterName:"",masterNamePlaceholder:"请输入车主姓名",idNumber:"",idNumberPlaceholder:"请输入身份证号",phoneNumber:"",phoneNumberPlaceholder:"请输入手机号",vehiclePrice:"",vehiclePricePlaceholder:"请输入购车价格(只输入金额)",selectedDate:(new Date).format("yyyy-MM-dd"),files1:[],files2:[],files3:[],files4:[],files5:[],files6:[]}},methods:{onCloseTip:function(){window.location.href="https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx371b508ec2e3db53&redirect_uri=https://www.gps51.com/wxpay/payaction&response_type=code&scope=snsapi_base&state=wx371b508ec2e3db53_insureagent_insureagent20_init#wechat_redirect"},onClickCleanData:function(){var t=this;this.$createDialog({type:"confirm",icon:"cubeic-alert",title:"提示",content:"确定清空已填信息吗?",confirmBtn:{text:"确定",active:!0,disabled:!1,href:"javascript:;"},cancelBtn:{text:"取消",active:!1,disabled:!1,href:"javascript:;"},onConfirm:function(){t.cleanData()},onCancel:function(){}}).show()},cleanData:function(){this.dealer="",this.dealerPhone="",this.dealerPhone="",this.detailAddress="",this.vinNumber="",this.matchVinNumberList=[],this.vehicleType="",this.batteryType="",this.masterName="",this.idNumber="",this.phoneNumber="",this.vehiclePrice="",this.files1=[],this.files2=[],this.files3=[],this.files4=[],this.files5=[],this.files6=[],this.image1=!1,this.image2=!1,this.image3=!1,this.image4=!1,this.image5=!1,this.image6=!1,this.isMatchDealer=!1,this.isMatchVinNumber=!1,this.isShowMatchVinNumber=!1,this.checked=!1},onSelectedMatchVin:function(t){this.vinNumber=t,this.matchVinNumberList=[]},onVinInputBlur:function(){var t=this;setTimeout(function(){t.isShowMatchVinNumber=!1,t.matchstrlist=[]},300)},debounce:function(t,e,i){var a,s,n,c,o,l=function l(){var r=Date.now()-c;r<e&&r>=0?a=setTimeout(l,e-r):(a=null,i||(o=t.apply(n,s),a||(n=s=null)))};return function(){n=this,s=arguments,c=Date.now();var r=i&&!a;return a||(a=setTimeout(l,e)),r&&(o=t.apply(n,s),n=s=null),o}},getLocation:function(){if(navigator.geolocation)this.toast=this.$createToast({txt:"正在定位",mask:!0}),this.toast.show(),navigator.geolocation.getCurrentPosition(this.showPosition);else{var t=this.$createToast({txt:"不支持定位",type:"txt",time:2e3});t.show()}},getJHAddress:function(t,e){return W.a.get("https://www.jh.tt/w?lat="+t+"&lon="+e)},showPosition:function(t){var e=this,i=t.coords.latitude,a=t.coords.longitude;this.toast.hide(),this.getJHAddress(i,a).then(function(t){var i=t.data;if(e.toast.hide(),i&&0==i.status){if(i.address.length>=9){var a=i.address;e.detailAddress=a}}else{var s=e.$createToast({txt:"定位失败",type:"txt",time:2e3});s.show()}},function(t){e.toast.hide();var i=e.$createToast({txt:"定位失败",type:"txt",time:2e3});i.show()})},insureNotice:function(){this.$router.push({name:"insurenotice"})},isCardNo:function(t){var e=/(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;return!1!==e.test(t)||(this.$createToast({txt:"身份证号不合法",type:"txt",time:2e3}).show(),!1)},checkedName:function(t){var e=/^[\u4e00-\u9fa5]{2,4}$/;return!!e.test(t)||(this.$createToast({txt:"姓名只能是2到4位的中文",type:"txt",time:2e3}).show(),!1)},checkedPhoneNumber:function(t){return""!=t&&!isNaN(t)},getInsureData:function(){var t={lock:!0,data:{}};return 0==this.isMatchDealer?(t.lock=!1,this.$createToast({txt:"没有匹配到该门店",type:"txt",time:2e3}).show(),t):0==this.isCardNo(this.idNumber)?(t.lock=!1,t):0==this.checkedName(this.masterName)?(t.lock=!1,t):0==this.checkedPhoneNumber(this.phoneNumber)?(t.lock=!1,this.$createToast({txt:"车主手机号格式不正确",type:"txt",time:2e3}).show(),t):""==this.vehiclePrice||this.vehiclePrice<=0?(t.lock=!1,this.$createToast({txt:"请选择填写价格",type:"txt",time:2e3}).show(),t):0==this.image1?(this.$createToast({txt:"请添加车辆合格证的图片",type:"txt",time:2e3}).show(),t.lock=!1,t):0==this.image2?(this.$createToast({txt:"请添加销售收据的图片",type:"txt",time:2e3}).show(),t.lock=!1,t):0==this.image3?(this.$createToast({txt:"请添加身份证正面的图片",type:"txt",time:2e3}).show(),t.lock=!1,t):0==this.image4?(this.$createToast({txt:"请添加人车合影的图片",type:"txt",time:2e3}).show(),t.lock=!1,t):0==this.checked?(this.$createToast({txt:"请阅读并同意投保须知",type:"txt",time:2e3}).show(),t.lock=!1,t):(t.data.username=this.dealer,t.data.cartype=this.vehicleType,t.data.name=this.masterName,t.data.cardid=this.idNumber,t.data.phonenum=this.phoneNumber,t.data.carvalue=this.vehiclePrice,t.data.buycarday=this.selectedDate,t.data.qualitycertmd5=this.image1.md5,t.data.qualitycertext=this.image1.fileext,t.data.invoicemd5=this.image2.md5,t.data.invoiceext=this.image2.fileext,t.data.positivecardidmd5=this.image3.md5,t.data.positivecardidext=this.image3.fileext,t.data.groupphotomd5=this.image4.md5,t.data.groupphotoext=this.image4.fileext,0!=this.vinNumber.length&&(t.data.vinno=this.vinNumber),t)},onSubmit:function(){var t=this,e=this.getInsureData();e.lock&&this.$createDialog({type:"confirm",icon:"cubeic-alert",title:"提示",content:"信息提交后不可更改,请检查仔细",confirmBtn:{text:"确定提交",active:!0,disabled:!1,href:"javascript:;"},cancelBtn:{text:"取消提交",active:!1,disabled:!1,href:"javascript:;"},onConfirm:function(){t.toast=t.$createToast({time:0,txt:"信息提交中",mask:!0}),t.toast.show(),W.a.post("/webapi?action=addinsure2",e.data).then(function(e){var i=e.data;t.toast.hide(),0===i.status?t.onSubmitSuccess():1===i.status?t.$createDialog({type:"confirm",title:"联系在线客服",content:"门店编号未备案,请联系客服 18681450428备案",confirmBtn:{text:"拨打",active:!0,disabled:!1,href:"javascript:;"},cancelBtn:{text:"取消",active:!1,disabled:!1,href:"javascript:;"},onConfirm:function(){var t=document.createElement("a");t.href="tel:186-8145-0428",t.click()},onCancel:function(){}}).show():2===i.status?t.$createToast({txt:"车架号没找到",type:"txt",time:2e3}).show():3===i.status?t.onSubmitSuccess():4===i.status?t.onSubmitSuccess():5===i.status&&t.$createDialog({type:"confirm",title:"温馨提示",content:"剩余份数不足,请提前购买",confirmBtn:{text:"立即购买",active:!0,disabled:!1,href:"javascript:;"},cancelBtn:{text:"取消",active:!1,disabled:!1,href:"javascript:;"},onConfirm:function(){window.location.href="https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx371b508ec2e3db53&redirect_uri=https://www.gps51.com/wxpay/payaction&response_type=code&scope=snsapi_base&state=wx371b508ec2e3db53_insureagent_insureagent20_init#wechat_redirect"},onCancel:function(){}}).show()}).catch(function(e){t.$createToast({txt:"提交失败",type:"txt",time:2e3}).show()})},onCancel:function(){}}).show()},onSubmitSuccess:function(){var t=this;this.$createToast({txt:"提交成功,将自动返回首页",type:"txt",time:2e3}).show(),setTimeout(function(){t.$router.push({name:"home"})},2e3)},showAddressPicker:function(){this.addressPicker.show()},showDatePicker:function(){this.datePicker.show()},selectDateHandle:function(t){this.selectedDate=new Date(t).format("yyyy-MM-dd")},onfileRemoved1:function(t){this.image1=!1},onfileRemoved2:function(t){this.image2=!1},onfileRemoved3:function(t){this.image3=!1},onfileRemoved4:function(t){this.image4=!1},onfileRemoved5:function(t){this.image5=!1},onfileRemoved6:function(t){this.image6=!1},addedHandler1:function(t){var e=t[0];this.postUploadImg(e,"image1")},addedHandler2:function(t){var e=t[0];this.postUploadImg(e,"image2")},addedHandler3:function(t){var e=t[0];this.postUploadImg(e,"image3")},addedHandler4:function(t){var e=t[0];this.postUploadImg(e,"image4")},addedHandler5:function(t){var e=t[0];this.postUploadImg(e,"image5")},addedHandler6:function(t){var e=t[0];this.postUploadImg(e,"image6")},postUploadImg:function(t,e){var i=this,a=new FormData,s=t.type.split("/")[1];a.append("imagefile",t),a.append("fileext ",s),a.append("deviceid","_temp"),this.toast=this.$createToast({time:0,txt:"图片上传中",mask:!0}),this.toast.show(),W.a.post(this.action,a).then(function(t){var a=t.data;i.toast.hide(),0===a.status?(i.$createToast({txt:"图片上传成功",type:"txt"}).show(),i[e]={md5:a.cause,fileext:s}):(i.$createToast({txt:"图片上传失败",type:"txt"}).show(),i[e]=!1)}).catch(function(t){i.toast.hide(),i.$createToast({txt:"图片上传失败",type:"txt"}).show(),i[e]=!1})}},mounted:function(){var t=this;this.image1=!1,this.image2=!1,this.image3=!1,this.image4=!1,this.image5=!1,this.image6=!1,this.action="/webapi/upload",this.datePicker=this.$createDatePicker({title:"选择时间",min:new Date(Date.now()-31536e7),max:new Date,value:new Date(this.selectedDate),onSelect:this.selectDateHandle,format:{year:"YY年",month:"MM月",date:"D 日"}}),this.toast=null,this.matchKeyWord=this.debounce(function(e,i){W.a.post("/webapi?action=matchkeyword",{type:e,needmatchkey:i}).then(function(a){var s=a.data;switch(e){case"username":var n=""!==i&&null!=s.matchstrlist&&s.matchstrlist.length>0;if(t.isMatchDealer=n,n){for(var c=!1,o=0;o<s.matchstrlist.length;o++){var l=s.matchstrlist[o];l.username==i&&(c=!0,t.residualPolicy=l.insurecount)}0==c&&(t.residualPolicy=0)}else t.residualPolicy=0;break;case"vinno":c=!1;if(t.isMatchVinNumber=""!==i&&null!=s.matchstrlist&&s.matchstrlist.length>0,t.isMatchVinNumber){var r=s.matchstrlist;for(o=0;o<r.length;o++){l=s.matchstrlist[o];l===i&&(c=!0)}t.isPay=c}else t.matchVinNumberList=[];0==t.residualPolicy&&0==c?t.$refs.tip.show():t.$refs.tip.hide();break}})},500)},watch:{dealer:function(t){this.matchKeyWord("username",t)},vinNumber:function(t){this.matchKeyWord("vinno",t)}}},J=F,K=(i("8f54"),Object(N["a"])(J,R,L,!1,null,"9b9a2404",null)),Q=K.exports,Y=Q,X=function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",{staticClass:"insure-notice"},[i("div",{staticClass:"close",on:{click:t.back}},[i("MyIcon",{attrs:{"icon-cls":"icon-close",size:"25px"}})],1),i("h3",[t._v("“锐新保”服务告知书")]),i("h5",[t._v("尊敬的车主：")]),i("p",[t._v("感谢您选择新购车辆并购买“锐新保”，为了能够更好的为您的骑行服务，请阅读以下服务说明，并签字确认： ")]),i("h5",[t._v("1.投保“锐新保”：")]),t._m(0),i("h5",[t._v("2.出险处理流程：")]),t._m(1),i("h5",[t._v("3、“锐新保”对象：")]),i("p",[t._v("两轮新车，期限一年，投保2日内生效（节假日顺延）。")]),i("h5",[t._v("4、保障范围：")]),i("p",[t._v("全车盗抢保障市场销售指导价 ，用户补足约定的运输安装费后提同款新车（有缺失项的补足缺失项免赔额）。")]),i("h5",[t._v("5、投保注意事项：")]),i("p",[t._v(" 1）被保障人年龄为 16-65 周岁大陆公民； 2）确保所拍照的资料真实，准确；")]),i("h5",[t._v("6、理赔材料：")]),i("p",[t._v("1，出险地公安机关出具的报案证明和报案15天后的案件未侦破或侦破中证明/说明；2.电动车购置发票（或销售凭证）和合格证；（销售凭证盖门店公章，无盖章视为无效）；3.全套原车钥匙（两把物理钥匙+两把遥控器）以投保时厂家配置为准；4.车主人身份证复印件；5.事故地点照片2张；6.投保告知书用户签字版本；7.平安公司要求的必要的资料。")]),i("h5",[t._v("7、责任免除：")]),t._m(2),i("h5",[t._v("8、温馨提示：根据中华人民共和国《刑法》第一百九十八条：")]),i("p",[t._v("1保险诈骗活动，数额2000以内，处五年以下有期徒刑或拘役，并处一万元以上十万元以下罚金；2.数额5000以内或者其他严重情节的，处五年以上十年以下有期徒刑，并处二万元以上二十万元以下罚金；3数额5000以上的或者其他特别严重情节的，处十年以上有期徒刑，并处二万元以上二十万元以下罚金或者没收财产.")]),i("h5",{staticStyle:{padding:"5pxpx 0 5px 0"}},[t._v("9、车主声明")]),i("h5",{staticStyle:{"font-size":"14px",padding:"0px 0 10px 0"}},[t._v("本人已详细阅读以上内容，保险人已明确说明免除保险人责任的内容及法律后果，本人已 充分理解责任免除内容及相关注意事项，同意遵守相关要求。")]),t._m(3)])},G=[function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("p",[t._v("消费者购车时需由店员协助通过“"),i("span",{staticClass:"underline"},[t._v("电动车锐新保投单系统")]),t._v("”录入个人投保信息，确保被保障人姓名、身份证号码、手机号码、地址信息及所购车辆信息（发票或销售凭证、厂牌型号和车架号等）准确无误，否则将无法投保。")])},function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("p",[t._v("1) 被发生责任事故后，应当保护好现场，车主本人拨打点当地 110 报警 （限时2小时内）；2) 24小时内拨本项目专员电话 "),i("b",[t._v("18475488228协助")]),t._v("报案（非案发24小时备案的，保险公司不予理赔）； 3) 平安公司查勘后，15 个工作日车主到当地派出所开具侦破中证明 ； 4) 按赔偿要求收集材料提交至购买车辆门店补足差价后提取同款同价新车。 ")])},function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("p",[t._v("1.无法提供公安机关出具的报案证明或有效法律声明书的，保险公司不予赔付；2.消费者拒签或者未签投保告知书的，保险公司不予赔付；3.理赔时提供理赔材料必须为原件，无原件按缺失材料处理；4.无法提供全套原车钥匙和遥控器（一把钥匙），缺失材料免赔率为20%；一把原装钥匙也没有的免赔50%；5.无法提供发票（或收据）或合格证（行驶证）其中一项的，缺失材料免赔率为10%；6.无法提供15天后案件正在侦破中证明/说明的，缺失材料免赔率为20%；7.保单生效后等待期为10个自然日，等待期内丢失的最高赔付880元，差额部分消费者承担；8.运营车辆（外卖、快递等）在民用基础上绝对免赔增加8%；9.如对案件真实性有争议的，保险公司有权索要监控视频。"),i("b",[t._v("以下情况，保险公司无赔偿责任，请详细阅读：")]),t._v("第一条下列原因造成的损失、费用，保险人不负责赔偿:（一）利用保险标的从事违法活动（二）投保人、被保险人的故意或重大过失行为（三）被保险人或其家庭、吸食或注射毒品、被药物麻醉后使用保险标的（四）保险标的在竞赛或在营业性维修场所修理期间（五）非被保险人允许的驾驶人使用保险标的（六）保险标的停放时未上锁；当公机关出具的盗或报案证明（七）被保险人索赔时，未能提供出险当地公安机关出具的盗抢或保安证明第二条下列损失费用，保险人也不负责赔偿:（一）保险标的因私自改装、加装致使整车性能不符合国家规定的标准；（二）保险标的非全车抢，仅车上零部件或附属设备被盗或坏（三）被保险人因民事经济纠纷而导致保险标的被抢劫抢夺（四）被保险人及其家庭成员、被保险人允许的驾驶人的故意行为或违法行为造成的损失（五）被保险人知道保险标的被盗后二十四小时内未报案，或自事故发生之日起十日内未发现失窃；（六）被保险人的间接损失（七）本保险单中载明的免赔额")])},function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",[i("div",{staticStyle:{padding:"20px 0"}},[i("h5",{staticStyle:{"font-size":"14px"}},[t._v("电动车销售门店盖章")])]),i("div",[i("div",[i("div",[t._v(" 声明人：")]),i("div",{staticStyle:{flex:"1","text-align":"right","border-bottom":"1px solid #000000"}},[t._v(" （盖手印）")])]),i("div",{staticStyle:{"font-size":"14px","padding-top":"10px"}},[t._v("         年   月   日")])])])}],Z={components:{MyIcon:j},methods:{back:function(){this.$router.back()}}},tt=Z,et=(i("344f"),Object(N["a"])(tt,X,G,!1,null,"46cadf32",null)),it=et.exports,at=it,st=function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",{staticClass:"info-query"},[i("div",{staticClass:"title"},[t._v("保单查询")]),i("div",{staticClass:"row"},[i("div",{staticClass:"col label"},[t._v("车主姓名")]),i("div",{staticClass:"col value"},[i("cube-input",{staticStyle:{height:"100%",width:"100%"},attrs:{placeholder:t.masterNamePlaceholder},model:{value:t.masterName,callback:function(e){t.masterName=e},expression:"masterName"}})],1)]),i("div",{staticClass:"row"},[i("div",{staticClass:"col label"},[t._v("身份证号")]),i("div",{staticClass:"col value"},[i("cube-input",{staticStyle:{height:"100%",width:"100%"},attrs:{placeholder:t.idNumberPlaceholder},model:{value:t.idNumber,callback:function(e){t.idNumber=e},expression:"idNumber"}})],1)]),i("div",{staticStyle:{padding:"5px 15px"}},[i("div",{staticClass:"submit-btn",on:{click:t.queryInfo}},[t._v("查询")])])])},nt=[],ct=(i("ac6a"),{name:"InfoQuery",data:function(){return{masterName:"",masterNamePlaceholder:"请输入车主姓名",idNumber:"",idNumberPlaceholder:"请输入身份证号"}},methods:{isCardNo:function(t){var e=/(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;return!1!==e.test(t)||(this.$createToast({txt:"身份证号不合法",type:"txt",time:2e3}).show(),!1)},checkedName:function(t){var e=/^[\u4e00-\u9fa5]{2,4}$/;return!!e.test(t)||(this.$createToast({txt:"姓名只能是2到4位的中文",type:"txt",time:2e3}).show(),!1)},queryInfo:function(){var t=this;if(0!=this.checkedName(this.masterName)){var e=this.idNumber.trim();!1!==this.isCardNo(e)&&(this.toast=this.$createToast({time:0,txt:"信息查询中",mask:!0}),this.toast.show(),W.a.post("/webapi?action=queryinsure2",{name:this.masterName,cardid:e}).then(function(e){var i=e.data;if(t.toast.hide(),0===i.status)if(i.insures&&0!=i.insures.length){var a=i.insures;a.forEach(function(t){null!=t.policyno&&0!=t.policyno.length||(t.policyno="保单审核中")}),t.$store.commit("setInsureInfoList",i.insures),t.$router.push({name:"insureinfo"})}else t.$createToast({txt:"没有查询到相关信息",type:"txt"}).show();else t.$createToast({txt:"查询失败",type:"txt"}).show()}).catch(function(e){t.toast.hide(),t.$createToast({txt:"查询失败",type:"txt"}).show()}))}}}}),ot=ct,lt=(i("c5d9"),Object(N["a"])(ot,st,nt,!1,null,"c62a9cc2",null)),rt=lt.exports,dt=rt,ut=function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",{staticClass:"insure-info"},[i("div",{staticClass:"insure-header"},[i("NavBar")],1),i("div",{staticClass:"content"},t._l(t.insureInfoList,function(e,a){return i("div",{key:a,staticClass:"insure-item"},[t._m(0,!0),i("div",{staticClass:"item-content"},[i("div",{staticClass:"label"},[t._v("保单号")]),i("div",{staticClass:"value",domProps:{textContent:t._s(e.policyno)}})]),i("div",{staticClass:"item-content"},[i("div",{staticClass:"label"},[t._v("车架号")]),i("div",{staticClass:"value",domProps:{textContent:t._s(e.vinno)}})]),i("div",{staticClass:"item-content"},[i("div",{staticClass:"label"},[t._v("被保人")]),i("div",{staticClass:"value",domProps:{textContent:t._s(e.name)}})]),i("div",{staticClass:"item-content"},[i("div",{staticClass:"label"},[t._v("身份证")]),i("div",{staticClass:"value",domProps:{textContent:t._s(e.cardid)}})]),t._m(1,!0),t._m(2,!0),i("div",{staticClass:"item-content"},[i("div",{staticClass:"label"},[t._v("保险起期")]),i("div",{staticClass:"value",domProps:{textContent:t._s(e.buycarday)}})])])}),0)])},ht=[function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",{staticClass:"title-wrap"},[i("h3",[t._v("保单信息")])])},function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",{staticClass:"item-content"},[i("div",{staticClass:"label"},[t._v("产品名")]),i("div",{staticClass:"value"},[t._v("锐新保")])])},function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",{staticClass:"item-content"},[i("div",{staticClass:"label"},[t._v("保障期限")]),i("div",{staticClass:"value"},[t._v("1年")])])}],pt=function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",{staticClass:"nav"},[i("div",{staticClass:"left",on:{click:t.back}},[i("MyIcon",{attrs:{"icon-cls":"icon-left",size:"14px"}}),t._v("返回\n    ")],1),i("div",{staticClass:"center"},[t._v(t._s(t.title))]),i("div",{staticClass:"right"})])},vt=[],mt={name:"NavBar",components:{MyIcon:j},props:{title:{type:String,default:"详情"}},computed:{},methods:{back:function(){this.$router.back()}}},ft=mt,bt=(i("c3c9"),Object(N["a"])(ft,pt,vt,!1,null,"3acdddff",null)),xt=bt.exports,yt={name:"InsureInfo",components:{NavBar:xt},computed:{insureInfoList:function(){return this.$store.state.insureInfoList}},methods:{}},_t=yt,wt=(i("3bee"),Object(N["a"])(_t,ut,ht,!1,null,"71147d05",null)),gt=wt.exports,Ct=gt,Nt=function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",[i("p",[i("cube-button",{on:{click:t.onWxPay}},[t._v("支付")])],1)])},kt=[],$t={name:"WxPlay",props:["openid","name"],data:function(){return{}},methods:{onWxPay:function(){window.location="https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxe44094ffe9730359&redirect_uri=https://www.gps51.com/wxpay/payaction&response_type=code&scope=snsapi_base&state=wxe44094ffe9730359_insureagent_insureagent20_init#wechat_redirect"}},mounted:function(){console.log(this.openid)}},Pt=$t,St=(i("f1e4"),Object(N["a"])(Pt,Nt,kt,!1,null,"1a899207",null)),Tt=St.exports,Mt=Tt;a["a"].use(S["a"]);var Dt=new S["a"]({routes:[{meta:{title:"电动车增值服务"},path:"/home",name:"home",component:B},{meta:{title:"信息录入"},path:"/infoentry",name:"infoentry",component:Y,children:[{meta:{title:"投保须知"},path:"insurenotice",name:"insurenotice",component:at}]},{meta:{title:"保单查询"},path:"/infoquery",name:"infoquery",component:dt},{meta:{title:"保险信息"},path:"/insureinfo",name:"insureinfo",component:Ct},{meta:{title:"微信支付"},path:"/wxplay",name:"wxplay",component:Mt,props:function(t){return{openid:t.query.openid,name:t.query.name}}},{path:"*",redirect:"/home"}]});Dt.beforeEach(function(t,e,i){document.title=t.meta.title,i()});var It=Dt,Vt=i("2f62");a["a"].use(Vt["a"]);var Et=new Vt["a"].Store({state:{insureInfoList:[]},mutations:{setInsureInfoList:function(t,e){console.log("insureInfoList",e),t.insureInfoList=e}},actions:{}});i("5cfb");a["a"].config.productionTip=!1,new a["a"]({router:It,store:Et,render:function(t){return t(P)}}).$mount("#app")},"5c48":function(t,e,i){},"7a30":function(t,e,i){},"7c55":function(t,e,i){"use strict";var a=i("5c48"),s=i.n(a);s.a},"8f54":function(t,e,i){"use strict";var a=i("eab4"),s=i.n(a);s.a},c3c9:function(t,e,i){"use strict";var a=i("7a30"),s=i.n(a);s.a},c5d9:function(t,e,i){"use strict";var a=i("479a"),s=i.n(a);s.a},d0f3:function(t,e,i){},d4a3:function(t,e,i){},d683:function(t,e,i){"use strict";var a=i("4847"),s=i.n(a);s.a},eab4:function(t,e,i){},f1e4:function(t,e,i){"use strict";var a=i("d4a3"),s=i.n(a);s.a}});