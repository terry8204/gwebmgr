(function(e){function t(t){for(var o,r,s=t[0],l=t[1],c=t[2],d=0,p=[];d<s.length;d++)r=s[d],Object.prototype.hasOwnProperty.call(i,r)&&i[r]&&p.push(i[r][0]),i[r]=0;for(o in l)Object.prototype.hasOwnProperty.call(l,o)&&(e[o]=l[o]);u&&u(t);while(p.length)p.shift()();return a.push.apply(a,c||[]),n()}function n(){for(var e,t=0;t<a.length;t++){for(var n=a[t],o=!0,r=1;r<n.length;r++){var l=n[r];0!==i[l]&&(o=!1)}o&&(a.splice(t--,1),e=s(s.s=n[0]))}return e}var o={},i={app:0},a=[];function r(e){return s.p+"js/"+({about:"about"}[e]||e)+"."+{about:"a02b6ec6"}[e]+".js"}function s(t){if(o[t])return o[t].exports;var n=o[t]={i:t,l:!1,exports:{}};return e[t].call(n.exports,n,n.exports,s),n.l=!0,n.exports}s.e=function(e){var t=[],n=i[e];if(0!==n)if(n)t.push(n[2]);else{var o=new Promise(function(t,o){n=i[e]=[t,o]});t.push(n[2]=o);var a,l=document.createElement("script");l.charset="utf-8",l.timeout=120,s.nc&&l.setAttribute("nonce",s.nc),l.src=r(e);var c=new Error;a=function(t){l.onerror=l.onload=null,clearTimeout(d);var n=i[e];if(0!==n){if(n){var o=t&&("load"===t.type?"missing":t.type),a=t&&t.target&&t.target.src;c.message="Loading chunk "+e+" failed.\n("+o+": "+a+")",c.name="ChunkLoadError",c.type=o,c.request=a,n[1](c)}i[e]=void 0}};var d=setTimeout(function(){a({type:"timeout",target:l})},12e4);l.onerror=l.onload=a,document.head.appendChild(l)}return Promise.all(t)},s.m=e,s.c=o,s.d=function(e,t,n){s.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},s.r=function(e){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},s.t=function(e,t){if(1&t&&(e=s(e)),8&t)return e;if(4&t&&"object"===typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(s.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)s.d(n,o,function(t){return e[t]}.bind(null,o));return n},s.n=function(e){var t=e&&e.__esModule?function(){return e["default"]}:function(){return e};return s.d(t,"a",t),t},s.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},s.p="/",s.oe=function(e){throw console.error(e),e};var l=window["webpackJsonp"]=window["webpackJsonp"]||[],c=l.push.bind(l);l.push=t,l=l.slice();for(var d=0;d<l.length;d++)t(l[d]);var u=c;a.push([0,"chunk-vendors"]),n()})({0:function(e,t,n){e.exports=n("56d7")},"034f":function(e,t,n){"use strict";var o=n("64a9"),i=n.n(o);i.a},1:function(e,t){},1488:function(e,t,n){},3099:function(e,t,n){"use strict";var o=n("1488"),i=n.n(o);i.a},"56d7":function(e,t,n){"use strict";n.r(t);var o=n("117e"),i=n("ff8e"),a=n("6be2"),r=n("2ca9"),s=n("ea31"),l=n("d3b2"),c=n("bf7a"),d=n("9e6d"),u=n("19ae"),p=n("093f"),h=n("311a"),v=n("6ead"),f=n("bbbe"),y=n("d914"),g=n("70ae"),m=n("ac2e"),b=n("1960"),S=n("cf8e"),w=n("01f8"),x=(n("cadf"),n("551c"),n("f751"),n("097d"),n("2b0e")),_=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",{attrs:{id:"app"}},[n("Layout",{staticClass:"full"},[n("Header",[n("Row",[n("Col",{attrs:{span:"4"}},[n("h1",{staticStyle:{color:"#ffffff"}},[e._v("汽车视频平台")])]),n("Col",{attrs:{span:"12"}},[n("Menu",{attrs:{mode:"horizontal",theme:e.theme,"active-name":"1"},on:{"on-select":e.handleSelect}},[n("MenuItem",{attrs:{name:"1"}},[n("Icon",{attrs:{type:"ios-paper"}}),e._v("\n                    视频监控\n                ")],1),n("MenuItem",{attrs:{name:"2"}},[n("Icon",{attrs:{type:"ios-people"}}),e._v("\n                    历史回放\n                ")],1)],1)],1)],1)],1),n("router-view")],1)],1)},C=[],P=(n("7f7f"),n("28a5"),{name:"App",data:function(){return{theme:"dark"}},methods:{getParameterByName:function(e){var t=location.href;t=decodeURIComponent(t);var n=new Object;if(-1!=t.indexOf("?"))for(var o=t.substr(t.indexOf("?")+1),i=o.split("&"),a=0;a<i.length;a++)n[i[a].split("=")[0]]=unescape(i[a].split("=")[1]);return n[e]},handleSelect:function(e){1==e?this.$router.push({path:"/videomonitor"}):2==e&&this.$router.push({path:"/playback"})}},mounted:function(){}}),k=P,M=(n("034f"),n("2877")),$=Object(M["a"])(k,_,C,!1,null,null,null),F=$.exports,R=n("8c4f"),I=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("Layout",[n("Sider",{staticStyle:{"background-color":"#fff",padding:"10px"},attrs:{width:"325"}},[n("Tabs",{attrs:{animated:!1}},[n("TabPane",{attrs:{label:"状态"}},[e._v("标签一的内容")]),n("TabPane",{attrs:{label:"云台"}},[e._v("标签二的内容")]),n("TabPane",{attrs:{label:"色彩"}},[e._v("标签三的内容")]),n("TabPane",{attrs:{label:"语言"}},[e._v("标签三的内容")])],1)],1),n("Content",{staticStyle:{padding:"10px"}},[n("Layout",{staticClass:"full"},[n("Header",{staticStyle:{"background-color":"#eee",height:"45px","line-height":"45px",padding:"0 10px"}},[n("Row",{staticStyle:{height:"100%",color:"#ffffff"}},[n("Col",{attrs:{span:"6"}},[n("Button",{attrs:{color:"primary",size:"small"},on:{click:e.handleStart}},[e._v("开始")]),n("Button",{attrs:{color:"success",size:"small"},on:{click:e.handleStop}},[e._v("结束")]),n("Button",{attrs:{color:"magenta",size:"small"},on:{click:e.handleFullScreen}},[e._v("全屏")]),n("Button",{attrs:{color:"magenta",size:"small"},on:{click:e.queryVideoProperty}},[e._v("参数查询")]),n("Button",{attrs:{color:"magenta",size:"small"},on:{click:e.stopPlay}},[e._v("停止播放")]),n("Modal",{attrs:{width:"500"},model:{value:e.videoPropertyModal,callback:function(t){e.videoPropertyModal=t},expression:"videoPropertyModal"}},[n("p",{staticStyle:{color:"#f60","text-align":"center"},attrs:{slot:"header"},slot:"header"},[n("Icon",{attrs:{type:"ios-create-outline"}}),n("span",[e._v("视频参数")])],1),n("div",{staticStyle:{"text-align":"center"}},[n("Row",{staticStyle:{height:"32px"}},[n("Col",{staticStyle:{height:"100%","text-align":"right","line-height":"32px"},attrs:{span:"8"}},[e._v("音频编码方式 :  ")]),n("Col",{staticStyle:{height:"100%","line-height":"32px"},attrs:{span:"16"}},[e._v("\n                                        "+e._s(e.videoProperty.audiocodec)+"\n                                    ")])],1),n("Row",{staticStyle:{height:"32px"}},[n("Col",{staticStyle:{height:"100%","text-align":"right","line-height":"32px"},attrs:{span:"8"}},[e._v("音频编码方式字符 :  ")]),n("Col",{staticStyle:{height:"100%","line-height":"32px"},attrs:{span:"16"}},[e._v("\n                                        "+e._s(e.videoProperty.audiocodecstr)+"\n                                    ")])],1),n("Row",{staticStyle:{height:"32px"}},[n("Col",{staticStyle:{height:"100%","text-align":"right","line-height":"32px"},attrs:{span:"8"}},[e._v("音频声道数 :  ")]),n("Col",{staticStyle:{height:"100%","line-height":"32px"},attrs:{span:"16"}},[e._v("\n                                        "+e._s(e.videoProperty.audiosamplerate)+"\n                                    ")])],1),n("Row",{staticStyle:{height:"32px"}},[n("Col",{staticStyle:{height:"100%","text-align":"right","line-height":"32px"},attrs:{span:"8"}},[e._v("音频采样位数 :  ")]),n("Col",{staticStyle:{height:"100%","line-height":"32px"},attrs:{span:"16"}},[e._v("\n                                        "+e._s(e.videoProperty.audiosamplebits)+"\n                                    ")])],1),n("Row",{staticStyle:{height:"32px"}},[n("Col",{staticStyle:{height:"100%","text-align":"right","line-height":"32px"},attrs:{span:"8"}},[e._v("音频帧长度 :  ")]),n("Col",{staticStyle:{height:"100%","line-height":"32px"},attrs:{span:"16"}},[e._v("\n                                        "+e._s(e.videoProperty.audioframelength)+"\n                                    ")])],1),n("Row",{staticStyle:{height:"32px"}},[n("Col",{staticStyle:{height:"100%","text-align":"right","line-height":"32px"},attrs:{span:"8"}},[e._v("是否支持音频输出 :  ")]),n("Col",{staticStyle:{height:"100%","line-height":"32px"},attrs:{span:"16"}},[e._v("\n                                        "+e._s(e.videoProperty.audiooutputsupport)+"\n                                    ")])],1),n("Row",{staticStyle:{height:"32px"}},[n("Col",{staticStyle:{height:"100%","text-align":"right","line-height":"32px"},attrs:{span:"8"}},[e._v("视频编码方式 :  ")]),n("Col",{staticStyle:{height:"100%","line-height":"32px"},attrs:{span:"16"}},[e._v("\n                                        "+e._s(e.videoProperty.videocodec)+"\n                                    ")])],1),n("Row",{staticStyle:{height:"32px"}},[n("Col",{staticStyle:{height:"100%","text-align":"right","line-height":"32px"},attrs:{span:"8"}},[e._v("视频编码方式字符 :  ")]),n("Col",{staticStyle:{height:"100%","line-height":"32px"},attrs:{span:"16"}},[e._v("\n                                        "+e._s(e.videoProperty.videocodecstr)+"\n                                    ")])],1),n("Row",{staticStyle:{height:"32px"}},[n("Col",{staticStyle:{height:"100%","text-align":"right","line-height":"32px"},attrs:{span:"8"}},[e._v("终端支持最大音频物理通道数 :  ")]),n("Col",{staticStyle:{height:"100%","line-height":"32px"},attrs:{span:"16"}},[e._v("\n                                        "+e._s(e.videoProperty.audiomaxsupport)+"\n                                    ")])],1),n("Row",{staticStyle:{height:"32px"}},[n("Col",{staticStyle:{height:"100%","text-align":"right","line-height":"32px"},attrs:{span:"8"}},[e._v("终端支持最大视频物理通道数 :  ")]),n("Col",{staticStyle:{height:"100%","line-height":"32px"},attrs:{span:"16"}},[e._v("\n                                        "+e._s(e.videoProperty.videomaxsupport)+"\n                                    ")])],1)],1),n("div",{attrs:{slot:"footer"},slot:"footer"},[n("Button",{staticStyle:{width:"100%"},attrs:{type:"primary"},on:{click:function(t){e.videoPropertyModal=!1}}},[e._v("确定")])],1)])],1),n("Col",{staticClass:"tv_box",staticStyle:{height:"100%","text-align":"right"},attrs:{span:"18"}},[n("span",[n("i",{staticClass:"icon icon_num1",on:{click:function(t){return e.openAndCloseVideoWindows(1)}}})]),n("span",[n("i",{staticClass:"icon icon_num2",on:{click:function(t){return e.openAndCloseVideoWindows(4)}}})]),n("span",[n("i",{staticClass:"icon icon_num3",on:{click:function(t){return e.openAndCloseVideoWindows(6)}}})]),n("span",[n("i",{staticClass:"icon icon_num4",on:{click:function(t){return e.openAndCloseVideoWindows(8)}}})]),n("span",[n("i",{staticClass:"icon icon_num5",on:{click:function(t){return e.openAndCloseVideoWindows(9)}}})]),n("span",[n("i",{staticClass:"icon icon_num6",on:{click:function(t){return e.openAndCloseVideoWindows(16)}}})]),n("span",{attrs:{id:"box_stop"}},[n("i",{staticClass:"icon icon_close_show"}),n("i",{staticClass:"icon icon_xl"}),n("ul",{staticClass:"tc_box",staticStyle:{display:"none"}},[n("li",[n("a",{attrs:{id:"stopAll",href:"#"}},[n("i",{staticClass:"icon icon_gou"}),e._v("停止所有视频")])]),n("li",[n("a",{attrs:{id:"clearAll",href:"#"}},[n("i",{staticClass:"icon icon_gou"}),e._v("清除所有视频")])])])]),n("span",[n("i",{staticClass:"icon icon_num9"})])])],1)],1),n("Content",{staticStyle:{height:"100%",position:"relative",overflow:"hidden"}},[n("div",{ref:"videoContent",attrs:{id:"videoContent"}},e._l(e.videoPlayerOptions,function(t,o){return n("div",{key:o,attrs:{id:"video-wrapper"+o}},[n("video-player",{ref:"videoPlayer"+o,refInFor:!0,staticClass:"video-player-box",attrs:{options:t},on:{play:function(t){return e.onPlayerPlay(t,o)},pause:function(t){return e.onPlayerPause(t,o)},ended:function(t){return e.onPlayerEnded(t,o)}}})],1)}),0),n("Spin",{directives:[{name:"show",rawName:"v-show",value:e.Spin,expression:"Spin"}],staticStyle:{"z-index":"9999"},attrs:{fix:""}},[e._v("查询中,请稍后...")])],1)],1)],1)],1)},O=[],T=(n("6c7b"),n("bc3a")),V=n.n(T),z=n("a78e"),W=n.n(z),j=location.pathname,q=null;q=-1!=j.indexOf("gpsserver")?"http://localhost:8080/gpsserver/":"http://112.74.186.169/";var A={name:"VideoMonitor",data:function(){return{Spin:!1,videoPropertyModal:!1,isFullScreen:!1,videoNumber:16,videoIns:[],videoContentWH:null,videoPlayerOptions:new Array(16).fill({width:300,techOrder:["flash"],controls:!0,inactivityTimeout:6e4,sources:[{type:"rtmp/flv",src:"rtmp://58.200.131.2:1935/livetv/hunantv"}]}),videoProperty:{},videoTimes:{},myInterval:null}},methods:{stopPlay:function(){for(var e=0;e<16;e++){var t=this.videoIns[e];t.pause()}},queryVideoProperty:function(){var e=this,t=W.a.get("token"),n=W.a.get("video-deviceid");V.a.post(q+"webapi?action=queryvideoproperty_sync&token="+t,{deviceid:n}).then(function(t){var n=t.data,o=n.status;0===o?(e.$Message.success("查询成功"),e.videoProperty=n,e.videoPropertyModal=!0):1===o?e.$Message.error():2===o?e.$Message.error("设备不在线"):3===o||4===o||5===o&&e.$Message.error("错误:"+n.cause)}).catch(function(){e.Spin=!1})},handleFullScreen:function(){var e=this.$refs.videoContent;this.isFullScreen?document.exitFullscreen?document.exitFullscreen():document.mozCancelFullScreen?document.mozCancelFullScreen():document.webkitCancelFullScreen?document.webkitCancelFullScreen():document.msExitFullscreen&&document.msExitFullscreen():e.requestFullscreen?e.requestFullscreen():e.mozRequestFullScreen?e.mozRequestFullScreen():e.webkitRequestFullScreen?e.webkitRequestFullScreen():e.msRequestFullscreen&&e.msRequestFullscreen(),this.isFullScreen=!1},handleStart:function(){var e=this,t=W.a.get("token"),n=W.a.get("video-deviceid");V.a.post(q+"/webapi?action=startvideos&token="+t,{deviceid:n,channels:[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]}).then(function(t){var n=t.data,o=n.records,i=n.status;if(0===i&&o.length){e.$Message.success("请求成功");for(var a=0;a<o.length;a++){var r=o[a],s=e.$refs["videoPlayer"+a][0].player;s.src(r.playurl),s.play()}}else 1===i?e.$Message.error():2===i?e.$Message.error("设备不在线"):3===i||4===i||5===i&&e.$Message.error("错误:"+n.cause)})},handleStop:function(){var e=this,t=W.a.get("token"),n=W.a.get("video-deviceid");V.a.post(q+"/webapi?action=stopvideos&token="+t,{deviceid:n,channels:[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]}).then(function(t){var n=t.data;varstatus=n.status,0===status&&records.length?e.$Message.success("停止成功"):1===status||(2===status?e.$Message.error("设备不在线"):3===status||4===status||5===status&&e.$Message.error("错误:"+n.cause))})},onPlayerPlay:function(e,t){this.videoTimes["videoPlayer"+t]=Date.now()},onPlayerPause:function(e,t){delete this.videoTimes["videoPlayer"+t]},displayAndHideVideos:function(e){for(var t=0;t<16;t++){var n=this.videoIns[t];t<e||n.pause()}},openAndCloseVideoWindows:function(e){this.videoNumber=e,this.resizeVideoWindows(e)},resizeVideoWindows:function(e){var t=this.videoContentWH.width,n=this.videoContentWH.height;switch(this.displayAndHideVideos(e),e){case 1:var o=this.$refs["videoPlayer0"][0].player;o.width(t),o.height(n);break;case 4:for(var i=0;i<4;i++){o=this.$refs["videoPlayer"+i][0].player;o.width(t/2),o.height(n/2)}break;case 6:var a=t/3,r=n/3;for(i=0;i<6;i++){o=this.$refs["videoPlayer"+i][0].player;0===i?(o.width(2*a),o.height(2*r)):(o.width(a),o.height(r))}break;case 8:for(a=t/4,r=n/4,i=0;i<8;i++){o=this.$refs["videoPlayer"+i][0].player;0===i?(o.width(3*a),o.height(3*r)):(o.width(a),o.height(r))}break;case 9:for(i=0;i<9;i++){o=this.$refs["videoPlayer"+i][0].player;o.width(t/3),o.height(n/3)}break;case 16:for(i=0;i<16;i++){o=this.$refs["videoPlayer"+i][0].player;o.width(t/4),o.height(n/4)}break}},stopVideoPlayer:function(){for(var e=this.videoIns,t=0;t<e.length;t++){var n="videoPlayer"+t,o=Date.now(),i=this.videoTimes[n];if(i&&o-i>6e4){var a=e[t];a.pause(),delete this.videoTimes[n]}}},checkVideoPlayerTime:function(){var e=this;this.myInterval=setInterval(function(){e.stopVideoPlayer()},5e3)},queryVideosPlayUrl:function(){var e=W.a.get("video-deviceid"),t=W.a.get("token");V.a.post(q+"/webapi?action=queryvideosplayurl&token="+t,{deviceid:e}).then(function(e){console.log("data",e)}).catch(function(){})}},destroyed:function(){clearInterval(this.myInterval);for(var e=0;e<16;e++)this.videoIns[e].dispose();window.onresize=null},mounted:function(){var e=this,t=this;this.$nextTick(function(){e.videoContentWH=e.$refs.videoContent.getBoundingClientRect();for(var n=0;n<16;n++)e.videoIns.push(e.$refs["videoPlayer"+n][0].player);e.resizeVideoWindows(t.videoNumber)});var n=document.fullscreenElement||document.mozFullScreenElement||document.webkitFullscreenElement||document.fullScreen||document.mozFullScreen||document.webkitIsFullScreen;n=!!n,window.onresize=function(){t.videoContentWH=t.$refs.videoContent.getBoundingClientRect(),t.resizeVideoWindows(t.videoNumber)}}},E=A,B=(n("3099"),Object(M["a"])(E,I,O,!1,null,"7e753eb2",null)),H=B.exports;x["a"].use(R["a"]);var L=new R["a"]({history:!0,routes:[{path:"/videomonitor",name:"videomonitor",component:H},{path:"/playback",name:"playback",component:function(){return n.e("about").then(n.bind(null,"ae92"))}},{path:"*",redirect:"/videomonitor"}]}),N=n("2f62");x["a"].use(N["a"]);var D=new N["a"].Store({state:{},mutations:{},actions:{}}),J=(n("dcad"),n("d6d3")),U=n.n(J);n("fda2"),n("b5c1");x["a"].use(U.a),x["a"].component("Button",w["a"]),x["a"].component("Table",S["a"]),x["a"].component("Layout",b["a"]),x["a"].component("Header",m["a"]),x["a"].component("Sider",g["a"]),x["a"].component("Content",y["a"]),x["a"].component("Row",f["a"]),x["a"].component("Col",v["a"]),x["a"].component("Select",h["a"]),x["a"].component("Option",p["a"]),x["a"].component("DatePicker",u["a"]),x["a"].component("Menu",d["a"]),x["a"].component("MenuItem",c["a"]),x["a"].component("Icon",l["a"]),x["a"].component("Tabs",s["a"]),x["a"].component("TabPane",r["a"]),x["a"].component("Modal",a["a"]),x["a"].component("Spin",i["a"]),x["a"].prototype.$Message=o["a"],x["a"].config.productionTip=!1,new x["a"]({router:L,store:D,render:function(e){return e(F)}}).$mount("#app")},"64a9":function(e,t,n){}});