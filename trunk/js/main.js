// 是否显示公司名字
var isShowCompany = Cookies.get('isShowCompany');
var communicate = new Vue({}); // 组件之间通信的vue实例
var userName = Cookies.get('name');
var isZh = utils.locale === 'zh';
var mapType = utils.getMapType();
var isLoadBMap = false;
var globalDeviceId = "";
var userlists = [];
var isNeedRefresh = false;
var isToAlarmListRecords = false;
document.title = isZh ? "位置信息服务平台" : "Location information service platform";
var getPath = function () {
  var jsPath = document.currentScript ? document.currentScript.src : function () {
    var js = document.scripts
      , last = js.length - 1
      , src;

    for (var i = last; i > 0; i--) {
      if (js[i].readyState === 'interactive') {
        src = js[i].src;
        break;
      }
    }
    return src || js[last].src;
  }();

  return jsPath.substring(0, jsPath.lastIndexOf('/') + 1);
}();

// 百度地图是否加载完成 改变全局变量
function loadBMapSucc () {
  isLoadBMap = true;
}

var asyncLoadJs = function (jsName, callback) {
  var node = document.createElement('script'),
    timeout = 1,
    head = document.getElementsByTagName('head')[0],
    urls = {
      baidu: 'http://api.map.baidu.com/api?v=3.0&ak=e7SC5rvmn2FsRNE4R1ygg44n&callback=loadBMapSucc',
      textIconoverlay: 'http://api.map.baidu.com/library/TextIconOverlay/1.2/src/TextIconOverlay_min.js',
      distancetool: getPath + 'distancetool_min.js',
      bmarkerclusterer: getPath + "markerclusterer.js",

      google: "http://ditu.google.cn/maps/api/js?v=3.1&sensor=false&language=" + (isZh ? 'cn' : 'en') + "&key=AIzaSyAjWE3yINoltrJcma3fq73wCp04jjEo1zA&cb=loadBMapSucc",
      gmarkerclusterer: getPath + "gmarkerclusterer.js",
      markerwithlabel: getPath + "markerwithlabel.js",
    };

  //加载完毕
  function onScriptLoad (e) {
    var readyRegExp = navigator.platform === 'PLaySTATION 3' ? /^complete$/ : /^(complete|loaded)$/
    if (e.type === 'load' || (readyRegExp.test((e.currentTarget || e.srcElement).readyState))) {

      head.removeChild(node);
      (function poll () {
        if (++timeout > timeout * 1000 / 4) {
          return console.error(jsName + ' is not a valid module');
        };
        try {
          callback();
        } catch (error) {
          setTimeout(poll, 4);
        }

      }());
    }
  }

  node.async = true;
  node.charset = 'utf-8';
  node.src = urls[jsName];

  head.appendChild(node);

  if (node.attachEvent && !(node.attachEvent.toString && node.attachEvent.toString().indexOf('[native code') < 0) && !isOpera) {
    node.attachEvent('onreadystatechange', function (e) {
      onScriptLoad(e);
    });
  } else {
    node.addEventListener('load', function (e) {
      onScriptLoad(e);
    }, false);
  };

};

// vuex store
vstore = new Vuex.Store({
  state: {
    isShowCompany: isShowCompany === 'true' ? true : false,
    userType: Cookies.get('userType'),
    deviceInfos: {},
    userTypeDescrList: [
      { "name": isZh ? "系统管理员" : 'Admin', "type": 0 },
      { "name": isZh ? "一级管理员" : 'Supervisor', "type": 1 },
      { "name": isZh ? "二级管理员" : 'Manager', "type": 2 },
      { "name": isZh ? "普通监控员" : 'Monitor', "type": 20 },
      { "name": isZh ? "设备" : 'Device', "type": 99 },
      { "name": isZh ? "体验帐号" : 'Demo', "type": 10 }],     // 用户类型描述
    allCmdList: [],              // 所有的指令
    deviceTypes: [],
    headerActiveName: 'monitor', // 选中的header 
    intervalTime: 10,     // 定位发送请求的timer
    editDeviceInfo: {},   // 备份监控页面要编辑的设备对象
    currentDeviceRecord: null, // 点击设备的记录
    currentDeviceId: null,    // 点击设备的id
    userName: userName
  },
  actions: {
    setdeviceInfos: function (context, groups) {
      context.commit('setdeviceInfos', groups);
    },
    setDeviceTypes: function (context) {
      var url = myUrls.queryDeviceTypeByUser();
      utils.sendAjax(url, {}, function (resp) {
        if (resp.status == 0) {
          context.commit('setDeviceTypes', resp.devicetypes);
        }
      });
    },
    setUserTypeDescr: function (context) {
      var url = myUrls.queryUserTypeDescr();
      $.ajax({
        url: url,
        method: 'post',
        data: {},
        async: false,
        success: function (resp) {
          if (resp.status == 0) {
            context.commit('setUserTypeDescr', resp.records);
          } else {
            Window.location.href = 'index.html';
          }
        },
        error: function () { }
      })
    },
    setAllCmdList: function (context) {
      var hadDeviceUrl = myUrls.queryHadDeviceCmdByUser();
      utils.sendAjax(
        hadDeviceUrl,
        { username: Cookies.get('name') },
        function (resp) {
          if (resp.status == 0) {
            var cmdList = resp.records;
            context.commit('setAllCmdList', cmdList);
          } else {
            Window.location.href = 'index.html';
          }
        }
      );
    }
  },
  mutations: {
    isShowCompany: function (state, isShowCompany) {
      state.isShowCompany = isShowCompany;
    },
    setdeviceInfos: function (state, groups) {
      groups.forEach(function (group) {
        // group.firstLetter = __pinyin.getFirstLetter(group.groupname);
        // group.pinyin = __pinyin.getPinyin(group.groupname);
        group.devices.forEach(function (device, index) {
          var deviceid = device.deviceid;
          // device.firstLetter = __pinyin.getFirstLetter(device.devicename);
          // device.pinyin = __pinyin.getPinyin(device.devicename);
          state.deviceInfos[deviceid] = device;
        })
      });
    },
    setUserTypeDescr: function (state, userTypeDescrList) {
      state.userTypeDescrList = userTypeDescrList;
    },
    setAllCmdList: function (state, cmdList) {
      cmdList.forEach(function (item) {
        state.allCmdList.push(item);
      })
    },
    setHeaderActiveName: function (state, activeName) {
      state.headerActiveName = activeName;
    },
    stateIntervalTime: function (state, intervalTime) {
      state.intervalTime = intervalTime;
    },
    editDeviceInfo: function (state, editDeviceInfo) {
      state.editDeviceInfo = editDeviceInfo;
    },
    currentDeviceRecord: function (state, record) {
      state.currentDeviceRecord = record;
      state.currentDeviceId = record.deviceid;
    },
    currentDeviceId: function (state, deviceid) {
      state.currentDeviceId = deviceid;
    },
    setDeviceTypes: function (state, devicetypes) {
      state.deviceTypes = devicetypes;
    }
  }
});

// 头部组建
var appHeader = {
  template: document.getElementById('header-template').innerHTML,
  props: ['componentid'],
  data: function () {
    var me = this;
    return {
      dark: 'dark',
      name: '',
      isManager: true,
      modal: false,
      intervalTime: null,
      isShowCompany: false,
      serviceModal: false,
      headMenuList: [
        { name: "monitor", icon: "md-contacts", title: me.$t("header.monitor"), isShow: true },
        { name: "reportForm", icon: "ios-paper-outline", title: me.$t("header.reportForm"), isShow: true },
        { name: "bgManager", icon: "md-settings", title: me.$t("header.bgManager"), isShow: true },
        { name: "systemParam", icon: "ios-options", title: me.$t("header.systemParam"), isShow: true },
        { name: "trackDebug", icon: "ios-bug", title: "轨迹调试", isShow: true }
      ],
      modalPass: false,
      oldPass: '',
      newPass: '',
      confirmPass: '',
      creatername: sessionStorage.getItem("creatername"),
      createrqq: sessionStorage.getItem("createrqq"),
      createrphone: sessionStorage.getItem("createrphone"),
      createrwechat: sessionStorage.getItem("createrwechat"),
      createremail: sessionStorage.getItem("createremail"),
      email: sessionStorage.getItem("email"),
      nickname: sessionStorage.getItem("nickname"),
      phone: sessionStorage.getItem("phone"),
      qq: sessionStorage.getItem("qq"),
      wechat: sessionStorage.getItem("wechat"),
      selfConcatInfo: {
        email: sessionStorage.getItem("email"),
        nickname: sessionStorage.getItem("nickname"),
        phone: sessionStorage.getItem("phone"),
        qq: sessionStorage.getItem("qq"),
        wechat: sessionStorage.getItem("wechat"),
      },
    }
  },
  methods: {
    changeNav: function (navName) {
      this.$emit('change-nav', navName);
    },
    getManagerType: function (type) {
      var name = ''
      for (var i = 0; i < this.userTypeDescrList.length; i++) {
        var item = this.userTypeDescrList[i]
        if (item.type == type) {
          name = item.name
          break;
        }
      }
      return '[' + name + ']'
    },
    changeUserPass: function () {
      var me = this
      var url = myUrls.changeUserPass()
      var data = {
        username: Cookies.get('name'),
        newpass: $.md5(this.newPass),
        oldpass: $.md5(this.oldPass)
      }
      if (this.newPass.length < 4) {
        this.$Message.error(this.$t("header.error_1"));
        return
      }
      if (
        this.oldPass == '' ||
        this.newPass == '' ||
        this.confirmPass == ''
      ) {
        this.$Message.error(me.$t("header.error_2"));
        return
      }
      if (this.confirmPass !== this.newPass) {
        this.$Message.error(me.$t("header.error_3"));
        return
      }

      utils.sendAjax(url, data, function (resp) {
        if (resp.status == 0) {
          me.$Message.success(me.$t("header.changePwdSucc"))
          if (me.userType != 99) {
            Cookies.set('accountpass', me.newPass, { expires: 7 })
          } else {
            Cookies.set('devicepass', me.newPass, { expires: 7 })
          }

          me.modalPass = false
        } else {
          me.$Message.error(me.$t("header.error_4"))
        }
      })
    },
    logout: function () {
      var me = this
      var url = myUrls.logout()
      utils.sendAjax(url, {}, function (resp) {
        if (resp.status == 0) {
          Cookies.remove('token');
          window.location.href = 'index.html';
        } else {
          me.$Message.error(resp.cause)
        }
      })
    },
    changePassword: function () {
      this.modalPass = true;
      this.oldPass = '';
      this.newPass = '';
      this.confirmPass = '';
    },
    showSetup: function () {
      this.modal = true;
    },
    changeShowCompany: function (state) {
      this.$store.commit('isShowCompany', state);
      Cookies.set('isShowCompany', state, { expires: 7 });
    },
    reqUserType: function () {
      var url = myUrls.queryUserType()
      utils.sendAjax(url, {}, function (resp) {
        console.log(resp)
      })
    },
    navJurisdiction: function (userType) {
      if (userType == -1 || userType == 99 || userType == 20 || userType == 11) {
        this.headMenuList[2].isShow = false;
        this.headMenuList[3].isShow = false;
        this.headMenuList[4].isShow = false;
        // this.$emit('change-nav', 'monitor');
      } else if (userType == 0) {
        // this.headMenuList[0].isShow = false;
        // this.$emit('change-nav', 'reportForm')
      } else if (userType == 1 || userType == 2) {
        this.headMenuList[3].isShow = false;
        this.headMenuList[4].isShow = false;
        // this.$emit('change-nav', 'monitor')
      } else {
        this.headMenuList[3].isShow = false;
        this.headMenuList[4].isShow = false;

      }
      // console.log(this.headMenuList);
      this.$emit('change-nav', 'monitor')
    },
    handleEditMyInfo: function () {
      var me = this;
      var url = myUrls.editMyInfo();
      var data = {
        email: this.email,
        nickname: this.nickname,
        phone: this.phone,
        qq: this.qq,
        wechat: this.wechat,
        username: userName
      };
      utils.sendAjax(url, data, function (resp) {
        if (resp.status === 0) {
          delete data.username;
          me.selfConcatInfo = data;
          me.$Message.success(me.$t("message.changeSucc"));
        } else {
          me.$Message.error(me.$t("message.changeFail"));
        }
      });
    }
  },
  computed: {
    userTypeDescrList: function () {
      return this.$store.state.userTypeDescrList;
    },
    stateIntervalTime: function () {
      return this.$store.state.intervalTime;
    },
    userType: function () {
      return this.$store.state.userType;
    }
  },
  mounted: function () {
    var me = this;
    this.$nextTick(function () {
      var mgrType = me.getManagerType(me.userType)
      me.name = Cookies.get('name') + mgrType;
      me.intervalTime = me.stateIntervalTime;
      me.navJurisdiction(me.userType)
      var isShowCompany = Cookies.get('isShowCompany')
      if (isShowCompany == 'true') {
        me.isShowCompany = true;
      } else if (isShowCompany == 'false') {
        me.isShowCompany = false;
      }
    })
  },
  watch: {
    intervalTime: function () {
      var intervalTime = Number(this.intervalTime)
      this.$store.commit('stateIntervalTime', intervalTime);
    },
    modal: function () {
      if (!this.modal) {
        this.email = this.selfConcatInfo.email;
        this.nickname = this.selfConcatInfo.nickname;
        this.phone = this.selfConcatInfo.phone;
        this.qq = this.selfConcatInfo.qq;
        this.wechat = this.selfConcatInfo.wechat;
      }
    }
  }
}

// 根据当前语言来设置 iview 使用使用设么语言
iview.lang(isZh ? 'zh-CN' : 'en-US');


//0x00 定时上报
//0x01 定距上报
//0x02 拐点上传
//0x03 ACC 状态改变上传
//0x04 从运动变为静止状态后，补传最后一个定位点
//0x05 网络断开重连后，上报之前最后一个有效上传点
//0X06 星历更新强制上传 GPS 点
//0X07 按键上传定位点
//0X08 开机上报位置信息
//0X09 未使用
//0X0A 设备静止后上报最后的经纬度，但时间更新
//0X0B WiFi解析经纬度上传包
//0X0C 立即定位指令上报
//0X0D 设备静止后上报最后的经纬度
//0X0E 下静止状态定时上传

function getReportModeStr (reportmode) {
  var reportModeStr = "0x" + reportmode.toString(16);
  switch (reportmode) {
    case 0x00:
      reportModeStr += "定时上报";
      break;
    case 0x01: reportModeStr += "定距上报";
      break;
    case 0x02: reportModeStr += "拐点上传";
      break;
    case 0x03: reportModeStr += "ACC状态改变上传";
      break;
    case 0x04: reportModeStr += "运动变静止最后一个点";
      break;
    case 0x05: reportModeStr += "网络重连最后一个有效点";
      break;
    case 0X06: reportModeStr += "星历更新强制上传 GPS点";
      break;
    case 0X07: reportModeStr += "按键上传定位点";
      break;
    case 0X08: reportModeStr += "开机上报位置信息";
      break;
    case 0X09: reportModeStr += "未使用";
      break;
    case 0X0A: reportModeStr += "静止后上报最后的经纬度且时间更新";
      break;
    case 0X0B: reportModeStr += "WiFi解析经纬度上传包";
      break;
    case 0X0C: reportModeStr += "立即定位指令上报";
      break;
    case 0X0D: reportModeStr += "设备静止后上报最后的经纬度";
      break;
    case 0X0E: reportModeStr += "静止状态定时上传";
      break;
    case -1: reportModeStr += "-1";
      break;
  }

  return reportModeStr;
}

var trackDebug = {
  template: document.getElementById('trackdebug-template').innerHTML,
  data: function () {
    return {
      loading: false,
      isShowCard: false,
      meter: 0,
      lichengModal: false,
      clearTracks: false,
      deleteRecordsModal: false,
      deviceId: globalDeviceId,
      dayTime: 60 * 60 * 24 * 1000,
      filterStr: "",
      total: 0,
      tableHeight: 400,
      startDate: null,
      startTimeStr: null,
      endTimeStr: null,
      contentString: "",
      currentIndex: 1,
      columns: [
        { title: 'trackid', key: 'trackid', fixed: 'left', width: 80 },
        { title: 'sn', key: 'sn', width: 80, "sortable": true },
        { title: 'messagetype', key: 'messagetype', width: 80 },
        { title: 'typedescr', key: 'typedescr', width: 120 },
        { title: 'status', key: 'status', width: 80 },
        { title: 'strstatus', key: 'strstatus', width: 220 },
        { title: 'updatetime', key: 'updatetimeStr', width: 160 },
        { title: 'reportmode', key: 'reportmodeStr', width: 120 },
        { title: 're', key: 'reissue', width: 80 },
        { title: 'callat', key: 'callat', width: 120 },
        { title: 'callon', key: 'callon', width: 120 },
        { title: 'radius', key: 'radius', width: 80 },
        { title: 'speed', key: 'speed', width: 80 },
        { title: 'totaldistance', key: 'totaldistance', width: 120 },
        { title: 'altitude', key: 'altitude', width: 80 },
        { title: 'course', key: 'course', width: 80 },
        { title: 'gotsrc', key: 'gotsrc', width: 80 },
        { title: 'rxlevel', key: 'rxlevel', width: 80 },
        { title: 'servicealive', key: 'servicealive', width: 80 },
        { title: 'connectalive', key: 'connectalive', width: 80 },
      ],
      data: [],
      tableData: [],
      deleteRecordsObject: {}
    }
  },
  methods: {
    loginRecords: function () {
      window.open("loginrecords.html");
    },
    onSettingLicheng: function () {
      if (!this.deviceId && typeof this.meter !== "number") { return; };
      var me = this, url = myUrls.fixTotalDistance();
      utils.sendAjax(url, { deviceid: this.deviceId, totaldistance: this.meter }, function (resp) {
        if (resp.status === 0) {
          me.lichengModal = false;
          me.$Message.success("设置成功");
        } else {
          me.$Message.error("设置失败");
        }
      });
    },
    openClearTracksModal: function () {
      if (this.deviceId) { this.clearTracks = true; };
    },
    onHandleDeleteOK: function () {
      var url = myUrls.cleanHistoryData(), me = this;
      utils.sendAjax(url, { deviceid: this.deviceId }, function (resp) {
        console.log('resp', resp);
        if (resp.status === 0) {
          me.deleteRecordsModal = true;
          me.deleteRecordsObject = resp;
        } else {
          me.$Message.error(resp.cause);
        }
      });

    },
    onChange: function (index) {
      this.isShowCard = false;
      this.currentIndex = index;
      this.tableData = this.data.slice((index - 1) * 30, (index - 1) * 30 + 30);
    },
    onBlur: function () {
      this.requestTracks(this.doRequestTracks);
    },
    closeCard: function () {
      this.isShowCard = false;
    },
    nextDay: function () {
      this.isShowCard = false;
      this.startDate = new Date(this.startDate.getTime() + this.dayTime);
      this.getTimeParams();
      this.requestTracks(this.doRequestTracks);
    },
    prevDay: function () {
      this.isShowCard = false;
      this.startDate = new Date(this.startDate.getTime() - this.dayTime);
      this.getTimeParams();
      this.requestTracks(this.doRequestTracks);
    },
    requestTracks: function (callback) {
      if (!this.deviceId) { return; };
      this.loading = true;
      var url = myUrls.queryTracks();
      var data = {
        deviceid: this.deviceId,
        lbs: 1,
        timeorder: 0,
        interval: -1,
        begintime: this.startTimeStr,
        endtime: this.endTimeStr
      };
      utils.sendAjax(url, data, function (resp) {
        callback(resp)
      });
    },
    doRequestTracks: function (resp) {
      this.loading = false;
      if (resp.status == 0 && resp.records) {
        resp.records.forEach(function (record) {
          var type = "0x" + parseInt(record.messagetype, 10).toString(16) + '(' + record.messagetype + ')';
          record.messagetype = type;
          record.reportmodeStr = getReportModeStr(record.reportmode);
          record.updatetimeStr = DateFormat.longToDateTimeStr(record.updatetime, 0);
        });
        resp.records.sort(function (a, b) {
          return b.updatetime - a.updatetime;
        });
        this.data = Object.freeze(resp.records);
        this.total = this.data.length;
        this.tableData = this.data.slice(0, 30);
        this.currentIndex = 1;
      } else if (resp.status == 3) {
        this.$Message.error(this.$t("monitor.reLogin"));
        Cookies.remove('token');
        setTimeout(function () {
          window.location.href = 'index.html'
        }, 2000);
      } else {
        this.total = 0;
        this.data = [];
        this.tableData = [];
      }
    },
    refresh: function () {
      this.getTimeParams();
      this.requestTracks(this.doRequestTracks);
    },
    onRowClick: function (row, i) {
      var me = this;
      this.isShowCard = true;
      this.queryTrackDetail(row, function (resp) {
        if (resp.track) {
          me.contentString = JSON.stringify(resp.track);
        } else {
          vm.$Message.error("没有查询到数据");
        }
      });
    },
    caclTableheight: function () {
      var tHeight = parseInt(getComputedStyle(this.$refs.tableWrappr).height);
      this.tableHeight = tHeight;
    },
    getTimeParams: function () {
      var date = this.startDate;
      var year = date.getFullYear();
      var month = date.getMonth() + 1;
      var day = date.getDate();
      var dateStr = year + "-" + (month < 10 ? '0' + month : month) + "-" + (day < 10 ? '0' + day : day);
      this.startTimeStr = dateStr + " 00:00:00";
      this.endTimeStr = dateStr + " 23:59:00";
    },
    queryTrackDetail: function (row, callback) {
      var data = {
        deviceid: this.deviceId,
        updatetime: row.updatetime,
        trackid: row.trackid
      }
      var url = myUrls.queryTrackDetail();
      utils.sendAjax(url, data, function (resp) {
        if (resp.status == 0) {
          callback(resp);
        }
      })
    },
    filterTypeDesc: function () {
      if (this.filterStr) {
        var that = this;
        var filterArr = [];
        this.data.forEach(function (item) {
          if (item.typedescr.indexOf(that.filterStr) != -1) {
            filterArr.push(item);
          }
        });
        this.tableData = filterArr;
      };
    }
  },
  watch: {
    filterStr: function () {
      if (this.filterStr === "") {
        this.total = this.data.length;
        this.tableData = this.data.slice(0, 30);
        this.currentIndex = 1;
      };
    }
  },
  mounted: function () {
    this.deviceId = globalDeviceId;
    this.caclTableheight();
    this.startDate = new Date();
    this.getTimeParams();
    this.requestTracks(this.doRequestTracks);
  }
}

Vue.devtools = false;
// 根组件
var vRoot = new Vue({
  el: '#app',
  store: vstore,
  i18n: utils.getI18n(),
  data: {
    // isShowAlarm: true
  },
  methods: {
    changeComponent: function (activeName) {
      window.onresize = null;
      isToAlarmListRecords = false;
      this.$store.commit('setHeaderActiveName', activeName);
    },
    jumpReport: function (activeName) {
      this.$store.commit('setHeaderActiveName', activeName);
    },
    addPushMediaToLocalStore: function (devicemedia) {
      localStorage.setItem("devicemedia", JSON.stringify(devicemedia));
    },
    wsCallback: function (resp) {
      var action = resp.action;
      if (action === "remindmsg") {
        var data = resp.remindMsg;
        communicate.$emit("remindmsg", data);
      } else if (action === "positionlast") {
        var data = resp.positionLast;
        communicate.$emit("positionlast", data);
      } else if (action === "reminddevicemsg") {
        var data = resp.devicemsg;
        communicate.$emit("reminddevicemsg", data);
      } else if (action == "reminddevicemedia") {
        let devicemedia = resp.devicemedia;
        this.addPushMediaToLocalStore(devicemedia);
      };;
    }
  },
  computed: {
    activeName: function () {
      return this.$store.state.headerActiveName;
    },
    userType: function () {
      return this.$store.state.userType;
    }
  },
  components: {
    appHeader: appHeader,
    bgManager: bgManager,
    monitor: monitor,
    reportForm: reportForm,
    waringComponent: waringComponent,
    systemParam: systemParam,
    trackDebug: trackDebug
  },
  mounted: function () {
    // this.isShowAlarm = this.userType == 0 ? false : true;
    // this.$store.dispatch('setUserTypeDescr');
    this.$store.dispatch('setAllCmdList');
    this.$store.dispatch('setDeviceTypes');

    if (userName) {
      var initIsPass = initWebSocket(wsHost, userName, this.wsCallback);   // 连接webSocket
      if (!initIsPass) {
        this.$Message.error("浏览器不支持webSocket");
      }
    }
    vueInstanse = this;     // 备份monitor实例
    utils.getUserInfoList();
  }
});


