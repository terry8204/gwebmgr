(function(e){function t(t){for(var i,n,c=t[0],o=t[1],r=t[2],u=0,v=[];u<c.length;u++)n=c[u],s[n]&&v.push(s[n][0]),s[n]=0;for(i in o)Object.prototype.hasOwnProperty.call(o,i)&&(e[i]=o[i]);d&&d(t);while(v.length)v.shift()();return l.push.apply(l,r||[]),a()}function a(){for(var e,t=0;t<l.length;t++){for(var a=l[t],i=!0,c=1;c<a.length;c++){var o=a[c];0!==s[o]&&(i=!1)}i&&(l.splice(t--,1),e=n(n.s=a[0]))}return e}var i={},s={app:0},l=[];function n(t){if(i[t])return i[t].exports;var a=i[t]={i:t,l:!1,exports:{}};return e[t].call(a.exports,a,a.exports,n),a.l=!0,a.exports}n.m=e,n.c=i,n.d=function(e,t,a){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:a})},n.r=function(e){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"===typeof e&&e&&e.__esModule)return e;var a=Object.create(null);if(n.r(a),Object.defineProperty(a,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var i in e)n.d(a,i,function(t){return e[t]}.bind(null,i));return a},n.n=function(e){var t=e&&e.__esModule?function(){return e["default"]}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="/insure2/";var c=window["webpackJsonp"]=window["webpackJsonp"]||[],o=c.push.bind(c);c.push=t,c=c.slice();for(var r=0;r<c.length;r++)t(c[r]);var d=o;l.push([0,"chunk-vendors"]),a()})({0:function(e,t,a){e.exports=a("56d7")},"3f83":function(e,t,a){"use strict";var i=a("43cf"),s=a.n(i);s.a},"3fff":function(e,t,a){},"43cf":function(e,t,a){},"4add":function(e,t,a){"use strict";var i=a("95bf"),s=a.n(i);s.a},"56d7":function(e,t,a){"use strict";a.r(t);a("cadf"),a("551c"),a("f751"),a("097d");var i=a("2b0e"),s=(a("3b2b"),a("a481"),a("df49"),a("e7bd")),l=a("0c29"),n=a("cd5d"),c=a("ae0c"),o=a("4403"),r=a("84d6"),d=a("291f"),u=a("6fe1"),v=a("031d"),f=a("63b4"),p=a("9173"),m=a("8344"),h=a("664d"),b=a("0124"),C=a("9736"),y=a("1cc1"),_=a("e231"),g=a("aea1");i["a"].use(s["a"]),i["a"].use(l["a"]),i["a"].use(n["a"]),i["a"].use(c["a"]),i["a"].use(o["a"]),i["a"].use(r["a"]),i["a"].use(d["a"]),i["a"].use(u["a"]),i["a"].use(v["a"]),i["a"].use(f["a"]),i["a"].use(p["a"]),i["a"].use(m["a"]),i["a"].use(h["a"]),i["a"].use(b["a"]),i["a"].use(C["a"]),i["a"].use(y["a"]),i["a"].use(_["a"]),i["a"].use(g["a"]),Date.prototype.format=function(e){var t={"M+":this.getMonth()+1,"d+":this.getDate(),"h+":this.getHours(),"m+":this.getMinutes(),"s+":this.getSeconds(),"q+":Math.floor((this.getMonth()+3)/3),S:this.getMilliseconds()};for(var a in/(y+)/.test(e)&&(e=e.replace(RegExp.$1,(this.getFullYear()+"").substr(4-RegExp.$1.length))),t)new RegExp("("+a+")").test(e)&&(e=e.replace(RegExp.$1,1==RegExp.$1.length?t[a]:("00"+t[a]).substr((""+t[a]).length)));return e};a("3fff");var x=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",{attrs:{id:"app"}},[a("transition",{attrs:{name:"fade",mode:"out-in"}},[a("router-view")],1)],1)},w=[],k=(a("7c55"),a("2877")),S={},N=Object(k["a"])(S,x,w,!1,null,null,null),P=N.exports,I=a("8c4f"),$=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",{staticClass:"home"},[a("div",{staticClass:"center"},[a("div",{staticClass:"title"},[e._v("电动车增值服务")]),a("div",{staticClass:"btns"},[a("div",{staticStyle:{padding:"15px 7.5px 15px 15px"}},[a("div",{on:{click:e.infoEntry}},[e._v("信息录入")])]),a("div",{staticStyle:{padding:"15px 15px 15px 7.5px"}},[a("div",{on:{click:e.infoQuery}},[e._v("信息查询")])])])])])},E=[],M={name:"Home",data:function(){return{}},methods:{infoEntry:function(){this.$router.push("/infoentry")},infoQuery:function(){this.$router.push("/infoquery")}}},D=M,R=(a("dbac"),Object(k["a"])(D,$,E,!1,null,"15899514",null)),T=R.exports,O=T,j=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",{staticClass:"info-entry"},[a("div",{staticClass:"vehicle-info"},[a("div",{staticClass:"title"},[e._v("车辆信息")]),a("div",{staticClass:"row"},[a("div",{staticClass:"col label"},[e._v("经销商")]),a("div",{staticClass:"col value"},[a("cube-input",{staticStyle:{height:"100%",width:"100%"},attrs:{placeholder:e.dealerPlaceholder},model:{value:e.dealer,callback:function(t){e.dealer=t},expression:"dealer"}},[a("div",{attrs:{slot:"append"},slot:"append"},[a("div",{staticStyle:{width:"45px",height:"45px","text-align":"center","line-height":"45px"},on:{click:e.onclick}},[a("MyIcon",{attrs:{"icon-cls":"icon-scan",size:"24px"}})],1)])])],1)]),a("div",{staticClass:"row"},[a("div",{staticClass:"col label"},[e._v("车架号")]),a("div",{staticClass:"col value"},[a("cube-input",{staticStyle:{height:"100%",width:"100%"},attrs:{placeholder:e.vinNumberPlaceholder},model:{value:e.vinNumber,callback:function(t){e.vinNumber=t},expression:"vinNumber"}},[a("div",{attrs:{slot:"append"},slot:"append"},[a("div",{staticStyle:{width:"45px",height:"45px","text-align":"center","line-height":"45px"},on:{click:e.onclick}},[a("MyIcon",{attrs:{"icon-cls":"icon-scan",size:"24px"}})],1)])])],1)]),a("div",{staticClass:"row"},[a("div",{staticClass:"col label"},[e._v("型号")]),a("div",{staticClass:"col value"},[a("cube-input",{staticStyle:{height:"100%",width:"100%"},attrs:{placeholder:e.vehicleTypePlaceholder},model:{value:e.vehicleType,callback:function(t){e.vehicleType=t},expression:"vehicleType"}})],1)]),a("div",{staticClass:"row"},[a("div",{staticClass:"col label"},[e._v("电池型号")]),a("div",{staticClass:"col value"},[a("cube-input",{staticStyle:{height:"100%",width:"100%"},attrs:{placeholder:e.batteryTypePlaceholder},model:{value:e.batteryType,callback:function(t){e.batteryType=t},expression:"batteryType"}})],1)]),a("div",{staticClass:"row"},[a("div",{staticClass:"col label"},[e._v("车辆用途")]),a("div",{staticClass:"col value"},[a("div",{staticStyle:{"padding-top":"2.5px"}},[a("cube-select",{staticStyle:{width:"200px"},attrs:{options:e.vehicleUseOptions},model:{value:e.vehicleUse,callback:function(t){e.vehicleUse=t},expression:"vehicleUse"}})],1)])]),a("div",[a("div",{staticClass:"upload-imgs"},[a("div",{staticClass:"files"},[a("div",[a("div",{staticClass:"cube-upload-wrap"},[a("cube-upload",{ref:"upload",attrs:{max:1,auto:!1,"simultaneous-uploads":1},on:{"files-added":e.addedHandler1,"file-removed":e.onfileRemoved1},model:{value:e.files1,callback:function(t){e.files1=t},expression:"files1"}})],1),a("div",{staticClass:"upload-title"},[e._v("车辆合格证")])]),a("div",[a("div",{staticClass:"cube-upload-wrap"},[a("cube-upload",{ref:"upload",attrs:{auto:!1,max:1,"simultaneous-uploads":1},on:{"file-removed":e.onfileRemoved2,"files-added":e.addedHandler2},model:{value:e.files2,callback:function(t){e.files2=t},expression:"files2"}})],1),a("div",{staticClass:"upload-title"},[e._v("销售收据")])])])])])]),a("div",{staticClass:"master-info"},[a("div",{staticClass:"title"},[e._v("车主信息")]),a("div",{staticStyle:{"border-bottom":"1px solid #F2F2F2"}},[a("div",{staticClass:"upload-imgs"},[a("div",{staticClass:"files"},[a("div",[a("div",{staticClass:"cube-upload-wrap"},[a("cube-upload",{ref:"upload",attrs:{max:1,auto:!1,"simultaneous-uploads":1},on:{"files-added":e.addedHandler3,"file-removed":e.onfileRemoved3},model:{value:e.files3,callback:function(t){e.files3=t},expression:"files3"}})],1),a("div",{staticClass:"upload-title"},[e._v("身份证正面")])]),a("div",[a("div",{staticClass:"cube-upload-wrap"},[a("cube-upload",{ref:"upload",attrs:{auto:!1,max:1,"simultaneous-uploads":1},on:{"file-removed":e.onfileRemoved4,"files-added":e.addedHandler4},model:{value:e.files4,callback:function(t){e.files4=t},expression:"files4"}})],1),a("div",{staticClass:"upload-title"},[e._v("身份证反面")])])])])]),a("div",{staticClass:"row"},[a("div",{staticClass:"col label"},[e._v("车主姓名")]),a("div",{staticClass:"col value"},[a("cube-input",{staticStyle:{height:"100%",width:"100%"},attrs:{placeholder:e.masterNamePlaceholder},model:{value:e.masterName,callback:function(t){e.masterName=t},expression:"masterName"}})],1)]),a("div",{staticClass:"row"},[a("div",{staticClass:"col label"},[e._v("身份证号")]),a("div",{staticClass:"col value"},[a("cube-input",{staticStyle:{height:"100%",width:"100%"},attrs:{placeholder:e.idNumberPlaceholder},model:{value:e.idNumber,callback:function(t){e.idNumber=t},expression:"idNumber"}})],1)]),a("div",{staticClass:"row"},[a("div",{staticClass:"col label"},[e._v("手机号码")]),a("div",{staticClass:"col value"},[a("cube-input",{staticStyle:{height:"100%",width:"100%"},attrs:{placeholder:e.phoneNumberPlaceholder},model:{value:e.phoneNumber,callback:function(t){e.phoneNumber=t},expression:"phoneNumber"}})],1)]),a("div",{staticClass:"row"},[a("div",{staticClass:"col label"},[e._v("购车价格")]),a("div",{staticClass:"col value"},[a("cube-input",{staticStyle:{height:"100%",width:"100%"},attrs:{placeholder:e.vehiclePricePlaceholder},model:{value:e.vehiclePrice,callback:function(t){e.vehiclePrice=t},expression:"vehiclePrice"}})],1)]),a("div",{staticClass:"row"},[a("div",{staticClass:"col label"},[e._v("购车时间")]),a("div",{staticClass:"col value"},[a("p",{on:{click:e.showDatePicker}},[e._v(e._s(e.selectedDate)),a("MyIcon",{attrs:{"icon-cls":"icon-jiantouxia",size:"15px"}})],1)])])]),a("div",{staticClass:"insure-info"},[e._m(0),a("div",[a("div",{staticClass:"upload-imgs"},[a("div",{staticClass:"file"},[a("div",[a("div",{staticClass:"cube-upload-wrap"},[a("cube-upload",{ref:"upload",attrs:{max:1,auto:!1,"simultaneous-uploads":1},on:{"files-added":e.addedHandler5,"file-removed":e.onfileRemoved5},model:{value:e.files5,callback:function(t){e.files5=t},expression:"files5"}})],1),a("div",{staticClass:"upload-title"},[e._v("保险告知书")])])])])]),e._m(1),a("div",{staticStyle:{"font-size":"12px"}},[a("cube-checkbox",{model:{value:e.checked,callback:function(t){e.checked=t},expression:"checked"}},[e._v("我已阅读并同意上述条款")])],1)]),a("div",{staticClass:"submit-btn-wrap"},[a("div",{staticClass:"submit-btn",on:{click:e.onSubmit}},[e._v("提交")])])])},H=[function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",{staticClass:"insure-title"},[a("h3",[e._v("免责条款")])])},function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("p",{staticClass:"insure-desc"},[e._v("请务必确保申请材料真实有效，点击阅读"),a("span",{staticStyle:{color:"#1E88DA"}},[e._v("《投保须知》")])])}],U=(a("4917"),a("28a5"),a("bc3a")),q=a.n(U),z=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("span",{staticClass:"iconfont",class:e.iClas,style:e.iStyle})},L=[],Q=(a("c5f6"),{name:"Icon",props:{iconCls:{type:String,default:""},size:{type:String||Number,default:"24px"}},computed:{iClas:function(){return[this.iconCls]},iStyle:function(){return{fontSize:this.size}}}}),F=Q,B=Object(k["a"])(F,z,L,!1,null,"de0c08b0",null),Y=B.exports,A=a("9a3e"),J={name:"InfoEntry",components:{MyIcon:Y,QrcodeStream:A["QrcodeStream"]},data:function(){return{checked:!1,dealer:"",dealerPlaceholder:"请扫描经销商二维码",vinNumber:"",vinNumberPlaceholder:"请输入车架号",vehicleType:"",vehicleTypePlaceholder:"请输入型号(合格证上名称)",batteryType:"",batteryTypePlaceholder:"输入电池型号,例如72V 20A",vehicleUse:"请选择",vehicleUseOptions:["请选择","民用车","运营车(外卖、物流等)"],uploadFiles:[],masterName:"",masterNamePlaceholder:"请输入车主姓名",idNumber:"",idNumberPlaceholder:"请输入身份证号",phoneNumber:"",phoneNumberPlaceholder:"请输入手机号",vehiclePrice:"",vehiclePricePlaceholder:"请输入购车价格(只输入金额)",selectedDate:(new Date).format("yyyy-MM-dd"),files1:[],files2:[],files3:[],files4:[],files5:[]}},methods:{onclick:function(e){alert(1),wx.scanQRCode({needResult:1,scanType:["qrCode"],success:function(e){var t=e.resultStr;alert(t)},fila:function(e){alert(e)}})},onSubmit:function(){console.log(this.image1),console.log(this.image2),console.log(this.image3),console.log(this.image4),console.log(this.image5)},showDatePicker:function(){this.datePicker.show()},selectDateHandle:function(e){this.selectedDate=new Date(e).format("yyyy-MM-dd")},onfileRemoved1:function(e){this.image1=!1},onfileRemoved2:function(e){this.image2=!1},onfileRemoved3:function(e){this.image3=!1},onfileRemoved4:function(e){this.image4=!1},onfileRemoved5:function(e){this.image5=!1},addedHandler1:function(e){var t=e[0];this.postUploadImg(t,"image1")},addedHandler2:function(e){var t=e[0];this.postUploadImg(t,"image2")},addedHandler3:function(e){var t=e[0];this.postUploadImg(t,"image3")},addedHandler4:function(e){var t=e[0];this.postUploadImg(t,"image4")},addedHandler5:function(e){var t=e[0];this.postUploadImg(t,"image5")},postUploadImg:function(e,t){var a=this,i=new FormData,s=e.type.split("/")[1];i.append("imagefile",e),i.append("fileext ",s),i.append("deviceid",this.deviceId),q.a.post(this.action,i).then(function(e){var i=e.data;0===i.status?(a.$createToast({txt:"图片上传成功",type:"txt"}).show(),a[t]={md5:i.cause,fileext:s}):(a.$createToast({txt:"图片上传失败",type:"txt"}).show(),a[t]=!1)}).catch(function(e){a.$createToast({txt:"图片上传失败",type:"txt"}).show(),a[t]=!1})},getQueryString:function(e){var t=new RegExp("\\b"+e+"=([^&]*)"),a=location.href.match(t);if(null!=a)return decodeURIComponent(a[1])}},mounted:function(){this.image1=!1,this.image2=!1,this.image3=!1,this.image4=!1,this.image5=!1,this.action="/webapi/upload",this.datePicker=this.$createDatePicker({title:"选择时间",min:new Date(Date.now()-31536e7),max:new Date,value:new Date(this.selectedDate),onSelect:this.selectDateHandle,format:{year:"YY年",month:"MM月",date:"D 日"}})},created:function(){var e=this.getQueryString("qrresult");e&&alert(e)}},V=J,G=(a("4add"),Object(k["a"])(V,j,H,!1,null,"4f3aee88",null)),K=G.exports,W=K,X=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",{staticClass:"info-query"},[a("div",{staticClass:"title"},[e._v("保单查询")]),a("div",{staticClass:"row"},[a("div",{staticClass:"col label"},[e._v("车主姓名")]),a("div",{staticClass:"col value"},[a("cube-input",{staticStyle:{height:"100%",width:"100%"},attrs:{placeholder:e.masterNamePlaceholder},model:{value:e.masterName,callback:function(t){e.masterName=t},expression:"masterName"}})],1)]),a("div",{staticClass:"row"},[a("div",{staticClass:"col label"},[e._v("身份证号")]),a("div",{staticClass:"col value"},[a("cube-input",{staticStyle:{height:"100%",width:"100%"},attrs:{placeholder:e.idNumberPlaceholder},model:{value:e.idNumber,callback:function(t){e.idNumber=t},expression:"idNumber"}})],1)]),a("div",{staticStyle:{padding:"5px 15px"}},[a("div",{staticClass:"submit-btn",on:{click:e.queryInfo}},[e._v("查询")])]),a("transition",{attrs:{name:"slide"}},[a("router-view")],1)],1)},Z=[],ee={name:"InfoQuery",data:function(){return{masterName:"",masterNamePlaceholder:"请输入车主姓名",idNumber:"",idNumberPlaceholder:"请输入身份证号",phoneNumber:""}},methods:{queryInfo:function(){this.$router.push({name:"insureinfo"})}}},te=ee,ae=(a("955b"),Object(k["a"])(te,X,Z,!1,null,"310572c9",null)),ie=ae.exports,se=ie,le=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",{staticClass:"insure-info"},[a("div",{staticClass:"insure-header"},[a("NavBar")],1),a("div",{staticClass:"content"},e._l(e.insureInfoList,function(t,i){return a("div",{key:i,staticClass:"insure-item"},[e._m(0,!0),e._m(1,!0),e._m(2,!0),e._m(3,!0),e._m(4,!0),e._m(5,!0),e._m(6,!0)])}),0)])},ne=[function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",{staticClass:"title-wrap"},[a("h3",[e._v("保单信息")])])},function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",{staticClass:"item-content"},[a("div",{staticClass:"label"},[e._v("保单号")]),a("div",{staticClass:"value"},[e._v("330000")])])},function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",{staticClass:"item-content"},[a("div",{staticClass:"label"},[e._v("投保单号")]),a("div",{staticClass:"value"},[e._v("310212121213")])])},function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",{staticClass:"item-content"},[a("div",{staticClass:"label"},[e._v("投保人")]),a("div",{staticClass:"value"},[e._v("小王")])])},function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",{staticClass:"item-content"},[a("div",{staticClass:"label"},[e._v("产品名称")]),a("div",{staticClass:"value"},[e._v("安新保")])])},function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",{staticClass:"item-content"},[a("div",{staticClass:"label"},[e._v("保障期限")]),a("div",{staticClass:"value"},[e._v("1年")])])},function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",{staticClass:"item-content"},[a("div",{staticClass:"label"},[e._v("保险起期")]),a("div",{staticClass:"value"},[e._v("2020年2月12号")])])}],ce=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",{staticClass:"nav"},[a("div",{staticClass:"left",on:{click:e.back}},[a("MyIcon",{attrs:{"icon-cls":"icon-left",size:"14px"}}),e._v("返回\n    ")],1),a("div",{staticClass:"center"},[e._v(e._s(e.title))]),a("div",{staticClass:"right"})])},oe=[],re={name:"NavBar",components:{MyIcon:Y},props:{title:{type:String,default:"详情"}},computed:{},methods:{back:function(){this.$router.back()}}},de=re,ue=(a("c3c9"),Object(k["a"])(de,ce,oe,!1,null,"3acdddff",null)),ve=ue.exports,fe={name:"InsureInfo",components:{NavBar:ve},computed:{insureInfoList:function(){return this.$store.state.insureInfoList}},methods:{onDecode:function(e){console.log(e)}},mounted:function(){this.$store.commit("setInsureInfoList",[{id:"你好安逸啊"},{id:"你好安逸啊"},{id:"你好安逸啊"}])}},pe=fe,me=(a("3f83"),Object(k["a"])(pe,le,ne,!1,null,"dee82180",null)),he=me.exports,be=he;i["a"].use(I["a"]);var Ce=new I["a"]({routes:[{meta:{title:"首页"},path:"/home",name:"home",component:O},{meta:{title:"填写保单"},path:"/infoentry",name:"infoentry",component:W},{meta:{title:"保单查询"},path:"/infoquery",name:"infoquery",component:se,children:[{meta:{title:"保险信息"},path:"insureinfo",name:"insureinfo",component:be}]},{path:"*",redirect:"/home"}]});Ce.beforeEach(function(e,t,a){document.title=e.meta.title,a()});var ye=Ce,_e=a("2f62");i["a"].use(_e["a"]);var ge=new _e["a"].Store({state:{insureInfoList:[]},mutations:{setInsureInfoList:function(e,t){console.log("insureInfoList",t),e.insureInfoList=t}},actions:{}});a("5cfb");i["a"].config.productionTip=!1,new i["a"]({router:ye,store:ge,render:function(e){return e(P)}}).$mount("#app")},"5c48":function(e,t,a){},"7a30":function(e,t,a){},"7c55":function(e,t,a){"use strict";var i=a("5c48"),s=a.n(i);s.a},"955b":function(e,t,a){"use strict";var i=a("a20b"),s=a.n(i);s.a},"95bf":function(e,t,a){},a20b:function(e,t,a){},c3c9:function(e,t,a){"use strict";var i=a("7a30"),s=a.n(i);s.a},d86e:function(e,t,a){},dbac:function(e,t,a){"use strict";var i=a("d86e"),s=a.n(i);s.a}});