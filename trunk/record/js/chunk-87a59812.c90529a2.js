(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-87a59812"],{"066c":function(t,e,i){"use strict";i("63c6")},1148:function(t,e,i){"use strict";var r=i("a691"),a=i("1d80");t.exports="".repeat||function(t){var e=String(a(this)),i="",c=r(t);if(c<0||c==1/0)throw RangeError("Wrong number of repetitions");for(;c>0;(c>>>=1)&&(e+=e))1&c&&(i+=e);return i}},"216c":function(t,e,i){"use strict";var r=function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",{staticClass:"record-title"},[i("div",[i("div",{staticClass:"title"},[t._v(t._s(t.title))]),i("div",{staticClass:"length"},[t._v(t._s(t.dataLength+" "+t.$t("record.length")))])])])},a=[],c=(i("a9e3"),{name:"RecordTitle",props:{queryTime:{type:Number||String,default:""},dataLength:{type:Number,default:0}},computed:{title:function(){var t="";switch(this.queryTime){case 0:t=this.$t("record.toDay");break;case 1:t=this.$t("record.yesterDay");break;case 3:t=this.$t("record.threeDays");break;case 7:t=this.$t("record.sevenDays");break;case 30:t=this.$t("record.thirtyDays");break}return t}}}),n=c,s=(i("96b7"),i("2877")),o=Object(s["a"])(n,r,a,!1,null,null,null),l=o.exports;e["a"]=l},"23ce":function(t,e,i){"use strict";var r=function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",{staticClass:"header"},[i("div",{staticClass:"left-icon",on:{click:function(e){t.show=!0}}},[i("van-icon",{attrs:{name:"arrow-left",size:"24",color:"#ffffff"},on:{click:t.back}})],1),i("div",{staticClass:"search-wrap"},[i("van-search",{attrs:{shape:"round",background:"#4fc08d",disabled:"",placeholder:t.$t("record.enterInputTip")},nativeOn:{click:function(e){return t.toSearch(e)}}})],1),t.showRight?i("div",{staticClass:"rigth-icon",on:{click:function(e){t.show=!0}}},[i("Icon",{attrs:{"icon-name":"iconshijian","font-color":"#ffffff"}})],1):i("div",{staticClass:"rigth"}),i("van-action-sheet",{attrs:{actions:t.actions,"close-on-click-action":""},on:{select:t.onSelectTime},model:{value:t.show,callback:function(e){t.show=e},expression:"show"}})],1)},a=[],c=i("ae60"),n={name:"SearchHeader",components:{Icon:c["a"]},props:{showRight:{type:Boolean,default:!0}},data:function(){return{show:!1,actions:[{name:this.$t("record.toDay"),time:0},{name:this.$t("record.yesterDay"),time:1},{name:this.$t("record.threeDays"),time:3},{name:this.$t("record.sevenDays"),time:7},{name:this.$t("record.thirtyDays"),time:30}]}},methods:{back:function(t){t.preventDefault(),this.$router.push("/home")},toSearch:function(){this.$router.push("".concat(this.$route.path,"/search"))},onSelectTime:function(t,e){this.$emit("select-time",t)}}},s=n,o=(i("066c"),i("2877")),l=Object(o["a"])(s,r,a,!1,null,null,null),d=l.exports;e["a"]=d},"408a":function(t,e,i){var r=i("c6b6");t.exports=function(t){if("number"!=typeof t&&"Number"!=r(t))throw TypeError("Incorrect invocation");return+t}},"58c3":function(t,e,i){},"5a34":function(t,e,i){var r=i("44e7");t.exports=function(t){if(r(t))throw TypeError("The method doesn't accept regular expressions");return t}},"63c6":function(t,e,i){},6436:function(t,e,i){"use strict";i("a5e2")},"8a79":function(t,e,i){"use strict";var r=i("23e7"),a=i("06cf").f,c=i("50c4"),n=i("5a34"),s=i("1d80"),o=i("ab13"),l=i("c430"),d="".endsWith,u=Math.min,h=o("endsWith"),f=!l&&!h&&!!function(){var t=a(String.prototype,"endsWith");return t&&!t.writable}();r({target:"String",proto:!0,forced:!f&&!h},{endsWith:function(t){var e=String(s(this));n(t);var i=arguments.length>1?arguments[1]:void 0,r=c(e.length),a=void 0===i?r:u(c(i),r),o=String(t);return d?d.call(e,o,a):e.slice(a-o.length,a)===o}})},"96b7":function(t,e,i){"use strict";i("e2a9")},a5e2:function(t,e,i){},ab13:function(t,e,i){var r=i("b622"),a=r("match");t.exports=function(t){var e=/./;try{"/./"[t](e)}catch(i){try{return e[a]=!1,"/./"[t](e)}catch(r){}}return!1}},b680:function(t,e,i){"use strict";var r=i("23e7"),a=i("a691"),c=i("408a"),n=i("1148"),s=i("d039"),o=1..toFixed,l=Math.floor,d=function(t,e,i){return 0===e?i:e%2===1?d(t,e-1,i*t):d(t*t,e/2,i)},u=function(t){var e=0,i=t;while(i>=4096)e+=12,i/=4096;while(i>=2)e+=1,i/=2;return e},h=function(t,e,i){var r=-1,a=i;while(++r<6)a+=e*t[r],t[r]=a%1e7,a=l(a/1e7)},f=function(t,e){var i=6,r=0;while(--i>=0)r+=t[i],t[i]=l(r/e),r=r%e*1e7},v=function(t){var e=6,i="";while(--e>=0)if(""!==i||0===e||0!==t[e]){var r=String(t[e]);i=""===i?r:i+n.call("0",7-r.length)+r}return i},m=o&&("0.000"!==8e-5.toFixed(3)||"1"!==.9.toFixed(0)||"1.25"!==1.255.toFixed(2)||"1000000000000000128"!==(0xde0b6b3a7640080).toFixed(0))||!s((function(){o.call({})}));r({target:"Number",proto:!0,forced:m},{toFixed:function(t){var e,i,r,s,o=c(this),l=a(t),m=[0,0,0,0,0,0],p="",y="0";if(l<0||l>20)throw RangeError("Incorrect fraction digits");if(o!=o)return"NaN";if(o<=-1e21||o>=1e21)return String(o);if(o<0&&(p="-",o=-o),o>1e-21)if(e=u(o*d(2,69,1))-69,i=e<0?o*d(2,-e,1):o/d(2,e,1),i*=4503599627370496,e=52-e,e>0){h(m,0,i),r=l;while(r>=7)h(m,1e7,0),r-=7;h(m,d(10,r,1),0),r=e-1;while(r>=23)f(m,1<<23),r-=23;f(m,1<<r),h(m,1,1),f(m,2),y=v(m)}else h(m,0,i),h(m,1<<-e,0),y=v(m)+n.call("0",l);return l>0?(s=y.length,y=p+(s<=l?"0."+n.call("0",l-s)+y:y.slice(0,s-l)+"."+y.slice(s-l))):y=p+y,y}})},ceba:function(t,e,i){"use strict";i.r(e);var r=function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",{staticClass:"oildaily full"},[i("div",{staticClass:"oildaily-wrap full"},[i("search-header",{on:{"select-time":t.onSelectTime}}),i("record-title",{attrs:{"query-time":t.queryTime,"data-length":t.dataList.length}}),i("div",{staticClass:"data-list"},[0==t.dataList.length?i("div",{staticClass:"full",staticStyle:{"background-color":"#fff"}},[i("van-empty",{attrs:{description:t.$t("tips.noData")}})],1):t._e(),t._l(t.dataList,(function(e,r){return[i("oildaily-item",{attrs:{data:e},nativeOn:{click:function(i){return t.handleClick(e.deviceid)}}})]}))],2)],1),i("router-view")],1)},a=[],c=i("5530"),n=(i("8a79"),i("159b"),i("b680"),i("2f62")),s=i("b562"),o=i("c276"),l=i("23ce"),d=i("216c"),u=function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",{staticClass:"record-item"},[i("div",{staticClass:"record-item-title"},[i("div",{staticClass:"item-icon"},[i("Icon",{attrs:{"icon-name":"iconcar","font-size":18,"font-color":"#23B96A"}})],1),i("div",{staticClass:"item-title"},[i("div",{staticClass:"item-device-name"},[i("b",[t._v(t._s(t.data.devicename))])]),i("div",{staticClass:"item-device-id",style:t.textSty},[t._v(t._s(t.$t("record.deviceId"))+" : "+t._s(t.data.deviceid))])])]),i("div",{staticClass:"record-item-content"},[i("div",[i("div",{style:t.textSty},[t._v(t._s(t.$t("record.creater"))+" : "+t._s(t.data.creater))]),i("div",{style:t.textSty},[t._v(t._s(t.$t("record.travelMileage"))+" : "+t._s(t.data.totaldis)+"km")])]),i("div",[i("div",{style:t.textSty},[t._v(t._s(t.$t("record.travelOil"))+" : "+t._s(t.data.totaloil)+"L")]),i("div",{style:t.textSty},[t._v(t._s(t.$t("record.km100Oil"))+" : "+t._s(t.data.km100Oil)+"L")])])])])},h=[],f=i("ae60"),v={name:"OildailyItem",components:{Icon:f["a"]},props:{data:{type:Object,default:function(){return{}}},textColor:{type:String,default:"#989898"}},computed:{textSty:function(){return{color:this.textColor}}}},m=v,p=(i("dcc7"),i("2877")),y=Object(p["a"])(m,u,h,!1,null,null,null),b=y.exports,g=b,$={name:"oildaily",components:{SearchHeader:l["a"],RecordTitle:d["a"],OildailyItem:g},beforeRouteUpdate:function(t,e,i){if(i(),e.path.endsWith("/search")){var r=this.$route.query.updated;1==r&&this.queryOildailyRecord()}},data:function(){return{queryTime:0,dataList:[]}},methods:Object(c["a"])({back:function(){this.$router.push("/home")},selectTime:function(t){this.queryTime=t.time},onSelectTime:function(t){this.queryTime=t.time,this.queryOildailyRecord()},clearData:function(){this.dataList=[]},queryOildailyRecord:function(){var t=this,e=0==this.selectedList.length?Object(o["a"])(this.groups):this.selectedList,i=Object(o["c"])(this.queryTime);i.devices=e,Object(s["f"])(i).then((function(e){var i=e.status,r=e.records;0===i?t.dataList=t.getDataList(r):t.clearData()})).catch((function(e){t.clearData(),t.$toast(t.$t("tips.networkError"))}))},getDataList:function(t){var e=this,i=[],r={};return t.forEach((function(t){var a=t.deviceid,c=0,n=0,s=0,o=e.deviceNames[a],l=o.devicename,d=o.creater;t.records.forEach((function(t){c+=t.totaloil,n+=t.totaldistance,s+=t.oilper100km})),i.push({devicename:l,deviceid:a,creater:d,totaloil:c/100,totaldis:(n/1e3).toFixed(2),km100Oil:s}),r[a]=t.records})),this.globalRecords=r,i},getAddress:function(t){var e=[];return t.forEach((function(t){e.push({lon:t.slon,lat:t.slat})})),qeuryAddres(e)},handleClick:function(t){var e=this.deviceNames[t].devicename,i=this.globalRecords[t];if(0==i.length)this.$toast(this.$t("tips.noDataToast"));else{var r=[];i.forEach((function(t){var e=(t.totaldistance/1e3).toFixed(2),i=t.totaloil/100,a=t.oilper100km;r.push({createtime:t.createtime,mileage:e,oil:i,oil_100km:a})})),this.setSelectedRecords({devicename:e,deviceid:t,records:r}),this.$router.push("/oildaily/oildailydetail?queryTime=".concat(this.queryTime))}}},Object(n["c"])(["setSelectedRecords"])),computed:Object(c["a"])({},Object(n["d"])(["groups","selectedList","deviceNames"])),mounted:function(){this.queryOildailyRecord()}},w=$,_=(i("6436"),Object(p["a"])(w,r,a,!1,null,null,null));e["default"]=_.exports},dcc7:function(t,e,i){"use strict";i("58c3")},e2a9:function(t,e,i){}}]);