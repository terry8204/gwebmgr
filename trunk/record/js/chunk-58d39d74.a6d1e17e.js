(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-58d39d74"],{"0199":function(t,e,i){},"066c":function(t,e,i){"use strict";i("63c6")},"0af8":function(t,e,i){},1148:function(t,e,i){"use strict";var r=i("a691"),a=i("1d80");t.exports="".repeat||function(t){var e=String(a(this)),i="",n=r(t);if(n<0||n==1/0)throw RangeError("Wrong number of repetitions");for(;n>0;(n>>>=1)&&(e+=e))1&n&&(i+=e);return i}},"13fe":function(t,e,i){"use strict";i.r(e);var r=function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",{staticClass:"workinghours full"},[i("div",{staticClass:"workinghours-wrap full"},[i("search-header",{on:{"select-time":t.onSelectTime}}),i("record-title",{attrs:{"query-time":t.queryTime,"data-length":t.dataList.length}}),i("div",{staticClass:"data-list"},[0==t.dataList.length?i("div",{staticClass:"full",staticStyle:{"background-color":"#fff"}},[i("van-empty",{attrs:{description:t.$t("tips.noData")}})],1):t._e(),t._l(t.dataList,(function(t,e){return[i("workinghours-item",{attrs:{data:t}})]}))],2)],1),i("router-view")],1)},a=[],n=i("5530"),o=(i("8a79"),i("159b"),i("b680"),i("2f62")),c=i("b562"),s=i("c276"),l=i("5101"),u=i("23ce"),d=i("216c"),h=function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",{staticClass:"record-item"},[i("div",{staticClass:"record-item-title"},[i("div",{staticClass:"item-icon"},[i("Icon",{attrs:{"icon-name":"iconcar","font-size":18,"font-color":"#23B96A"}})],1),i("div",{staticClass:"item-title"},[i("div",{staticClass:"item-device-name"},[i("b",[t._v(t._s(t.data.devicename))])]),i("div",{staticClass:"item-device-id",style:t.textSty},[t._v(t._s(t.$t("record.deviceId"))+" : "+t._s(t.data.deviceid))])])]),i("div",{staticClass:"record-item-content"},[i("div",[i("div",{style:t.textSty},[t._v(t._s(t.$t("record.creater"))+" : "+t._s(t.data.creater))]),i("div",{style:t.textSty},[t._v(t._s(t.$t("record.workingDuration"))+" : "+t._s(t.data.totalacc))])]),i("div",[i("div",{style:t.textSty},[t._v(t._s(t.$t("record.travelMileage"))+" : "+t._s(t.data.totaldistance)+"km")]),i("div",{style:t.textSty},[t._v(t._s(t.$t("record.travelOil"))+" : "+t._s(t.data.totaloil)+"L")])]),i("div",[i("div",{style:t.textSty},[t._v(t._s(t.$t("record.km100Oil"))+" : "+t._s(t.data.km100Oil)+"L")]),i("div",{style:t.textSty},[t._v(t._s(t.$t("record.hoursOil"))+" : "+t._s(t.data.hoursOil)+"L")])])])])},f=[],v=i("ae60"),m={name:"OildailyItem",components:{Icon:v["a"]},props:{data:{type:Object,default:function(){return{}}},textColor:{type:String,default:"#989898"}},computed:{textSty:function(){return{color:this.textColor}}}},p=m,g=(i("eead"),i("2877")),y=Object(g["a"])(p,h,f,!1,null,null,null),b=y.exports,w=b,_={name:"workinghours",components:{SearchHeader:u["a"],RecordTitle:d["a"],WorkinghoursItem:w},beforeRouteUpdate:function(t,e,i){if(i(),e.path.endsWith("/search")){var r=this.$route.query.updated;1==r&&this.queryOilWorkingHoursRecord()}},data:function(){return{queryTime:0,dataList:[]}},methods:Object(n["a"])({back:function(){this.$router.push("/home")},selectTime:function(t){this.queryTime=t.time},onSelectTime:function(t){this.queryTime=t.time,this.queryOilWorkingHoursRecord()},clearData:function(){this.dataList=[]},getStartAndEndDate:function(t){var e=864e5,i=l["a"].getOffset(),r=null;if(1==t){var a=l["a"].longToDateStr(Date.now()-e,i);r={begintime:a+" 00:00:00",endtime:a+" 23:59:59"}}else{0!=t&&(t-=1);var n=l["a"].longToDateStr(Date.now(),i);r={begintime:l["a"].longToDateStr(Date.now()-e*t,i)+" 00:00:00",endtime:n+" 23:59:59"}}return r.offset=i,r},queryOilWorkingHoursRecord:function(){var t=this,e=0==this.selectedList.length?Object(s["a"])(this.groups):this.selectedList,i=this.getStartAndEndDate(this.queryTime);i.devices=e,Object(c["g"])(i).then((function(e){var i=e.status,r=e.records;0===i?t.dataList=t.getDataList(r):t.clearData()})).catch((function(e){console.log(e),t.clearData(),t.$toast(t.$t("tips.networkError"))}))},getDataList:function(t){var e=this,i=[];return t.forEach((function(t){var r=t.deviceid,a=t.totalacc,n=t.totaldistance,o=t.totaloil,c=e.deviceNames[r],l=c.devicename,u=c.creater,d=t.oilper100km,h=t.oilperhour;n=(n/1e3).toFixed(2),i.push({creater:u,devicename:l,deviceid:r,totalacc:Object(s["e"])(a,e),totaldistance:n,totaloil:o/100,km100Oil:d,hoursOil:h})})),i},getAddress:function(t){var e=[];return t.forEach((function(t){e.push({lon:t.slon,lat:t.slat})})),qeuryAddres(e)}},Object(o["c"])(["setSelectedRecords"])),computed:Object(n["a"])({},Object(o["d"])(["groups","selectedList","deviceNames"])),mounted:function(){this.queryOilWorkingHoursRecord()}},k=_,S=(i("9f50"),Object(g["a"])(k,r,a,!1,null,null,null));e["default"]=S.exports},"216c":function(t,e,i){"use strict";var r=function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",{staticClass:"record-title"},[i("div",[i("div",{staticClass:"title"},[t._v(t._s(t.title))]),i("div",{staticClass:"length"},[t._v(t._s(t.dataLength+" "+t.$t("record.length")))])])])},a=[],n=(i("a9e3"),{name:"RecordTitle",props:{queryTime:{type:Number||String,default:""},dataLength:{type:Number,default:0}},computed:{title:function(){var t="";switch(this.queryTime){case 0:t=this.$t("record.toDay");break;case 1:t=this.$t("record.yesterDay");break;case 3:t=this.$t("record.threeDays");break;case 7:t=this.$t("record.sevenDays");break;case 30:t=this.$t("record.thirtyDays");break}return t}}}),o=n,c=(i("96b7"),i("2877")),s=Object(c["a"])(o,r,a,!1,null,null,null),l=s.exports;e["a"]=l},"23ce":function(t,e,i){"use strict";var r=function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",{staticClass:"header"},[i("div",{staticClass:"left-icon",on:{click:function(e){t.show=!0}}},[i("van-icon",{attrs:{name:"arrow-left",size:"24",color:"#ffffff"},on:{click:t.back}})],1),i("div",{staticClass:"search-wrap"},[i("van-search",{attrs:{shape:"round",background:"#4fc08d",disabled:"",placeholder:t.$t("record.enterInputTip")},nativeOn:{click:function(e){return t.toSearch(e)}}})],1),t.showRight?i("div",{staticClass:"rigth-icon",on:{click:function(e){t.show=!0}}},[i("Icon",{attrs:{"icon-name":"iconshijian","font-color":"#ffffff"}})],1):i("div",{staticClass:"rigth"}),i("van-action-sheet",{attrs:{actions:t.actions,"close-on-click-action":""},on:{select:t.onSelectTime},model:{value:t.show,callback:function(e){t.show=e},expression:"show"}})],1)},a=[],n=i("ae60"),o={name:"SearchHeader",components:{Icon:n["a"]},props:{showRight:{type:Boolean,default:!0}},data:function(){return{show:!1,actions:[{name:this.$t("record.toDay"),time:0},{name:this.$t("record.yesterDay"),time:1},{name:this.$t("record.threeDays"),time:3},{name:this.$t("record.sevenDays"),time:7},{name:this.$t("record.thirtyDays"),time:30}]}},methods:{back:function(t){t.preventDefault(),this.$router.push("/home")},toSearch:function(){this.$router.push("".concat(this.$route.path,"/search"))},onSelectTime:function(t,e){this.$emit("select-time",t)}}},c=o,s=(i("066c"),i("2877")),l=Object(s["a"])(c,r,a,!1,null,null,null),u=l.exports;e["a"]=u},"408a":function(t,e,i){var r=i("c6b6");t.exports=function(t){if("number"!=typeof t&&"Number"!=r(t))throw TypeError("Incorrect invocation");return+t}},"5a34":function(t,e,i){var r=i("44e7");t.exports=function(t){if(r(t))throw TypeError("The method doesn't accept regular expressions");return t}},"63c6":function(t,e,i){},"8a79":function(t,e,i){"use strict";var r=i("23e7"),a=i("06cf").f,n=i("50c4"),o=i("5a34"),c=i("1d80"),s=i("ab13"),l=i("c430"),u="".endsWith,d=Math.min,h=s("endsWith"),f=!l&&!h&&!!function(){var t=a(String.prototype,"endsWith");return t&&!t.writable}();r({target:"String",proto:!0,forced:!f&&!h},{endsWith:function(t){var e=String(c(this));o(t);var i=arguments.length>1?arguments[1]:void 0,r=n(e.length),a=void 0===i?r:d(n(i),r),s=String(t);return u?u.call(e,s,a):e.slice(a-s.length,a)===s}})},"96b7":function(t,e,i){"use strict";i("e2a9")},"9f50":function(t,e,i){"use strict";i("0af8")},ab13:function(t,e,i){var r=i("b622"),a=r("match");t.exports=function(t){var e=/./;try{"/./"[t](e)}catch(i){try{return e[a]=!1,"/./"[t](e)}catch(r){}}return!1}},b680:function(t,e,i){"use strict";var r=i("23e7"),a=i("a691"),n=i("408a"),o=i("1148"),c=i("d039"),s=1..toFixed,l=Math.floor,u=function(t,e,i){return 0===e?i:e%2===1?u(t,e-1,i*t):u(t*t,e/2,i)},d=function(t){var e=0,i=t;while(i>=4096)e+=12,i/=4096;while(i>=2)e+=1,i/=2;return e},h=function(t,e,i){var r=-1,a=i;while(++r<6)a+=e*t[r],t[r]=a%1e7,a=l(a/1e7)},f=function(t,e){var i=6,r=0;while(--i>=0)r+=t[i],t[i]=l(r/e),r=r%e*1e7},v=function(t){var e=6,i="";while(--e>=0)if(""!==i||0===e||0!==t[e]){var r=String(t[e]);i=""===i?r:i+o.call("0",7-r.length)+r}return i},m=s&&("0.000"!==8e-5.toFixed(3)||"1"!==.9.toFixed(0)||"1.25"!==1.255.toFixed(2)||"1000000000000000128"!==(0xde0b6b3a7640080).toFixed(0))||!c((function(){s.call({})}));r({target:"Number",proto:!0,forced:m},{toFixed:function(t){var e,i,r,c,s=n(this),l=a(t),m=[0,0,0,0,0,0],p="",g="0";if(l<0||l>20)throw RangeError("Incorrect fraction digits");if(s!=s)return"NaN";if(s<=-1e21||s>=1e21)return String(s);if(s<0&&(p="-",s=-s),s>1e-21)if(e=d(s*u(2,69,1))-69,i=e<0?s*u(2,-e,1):s/u(2,e,1),i*=4503599627370496,e=52-e,e>0){h(m,0,i),r=l;while(r>=7)h(m,1e7,0),r-=7;h(m,u(10,r,1),0),r=e-1;while(r>=23)f(m,1<<23),r-=23;f(m,1<<r),h(m,1,1),f(m,2),g=v(m)}else h(m,0,i),h(m,1<<-e,0),g=v(m)+o.call("0",l);return l>0?(c=g.length,g=p+(c<=l?"0."+o.call("0",l-c)+g:g.slice(0,c-l)+"."+g.slice(c-l))):g=p+g,g}})},e2a9:function(t,e,i){},eead:function(t,e,i){"use strict";i("0199")}}]);