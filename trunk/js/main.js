// 是否显示公司名字
var isShowCompany = Cookies.get('isShowCompany');
var communicate = new Vue({}); // 组件之间通信的vue实例
var userName = Cookies.get('name');
var mapType = Cookies.get('app-map-type');
var isLoadBMap = false;
var isZh = utils.locale === 'zh';
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

      google: "http://ditu.google.cn/maps/api/js?v=3.1&sensor=false&language=cn&key=AIzaSyAjWE3yINoltrJcma3fq73wCp04jjEo1zA",
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
        group.firstLetter = __pinyin.getFirstLetter(group.groupname);
        group.pinyin = __pinyin.getPinyin(group.groupname);
        group.devices.forEach(function (device, index) {
          var deviceid = device.deviceid;
          device.firstLetter = __pinyin.getFirstLetter(device.devicename);
          device.pinyin = __pinyin.getPinyin(device.devicename);
          state.deviceInfos[deviceid] = device;
        })
      })
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
    }
  }
})
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
      headMenuList: [
        { name: "monitor", icon: "md-contacts", title: me.$t("header.monitor"), isShow: true },
        { name: "reportForm", icon: "ios-paper-outline", title: me.$t("header.reportForm"), isShow: true },
        { name: "bgManager", icon: "md-settings", title: me.$t("header.bgManager"), isShow: true },
        { name: "systemParam", icon: "ios-options", title: me.$t("header.systemParam"), isShow: true }
      ],
      modalPass: false,
      oldPass: '',
      newPass: '',
      confirmPass: '',
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
        this.$emit('change-nav', 'monitor');
      } else if (userType == 0) {
        this.headMenuList[0].isShow = false;
        this.$emit('change-nav', 'reportForm')
      } else if (userType == 1 || userType == 2) {
        this.headMenuList[3].isShow = false;
        this.$emit('change-nav', 'monitor')
      } else {
        this.headMenuList[3].isShow = false;
        this.$emit('change-nav', 'monitor')
      }
    }
  },
  computed: {
    userTypeDescrList: function () {
      return this.$store.state.userTypeDescrList;
    },
    stateIntervalTime: function () {
      return this.$store.state.intervalTime;
    }
  },
  mounted: function () {
    var me = this
    this.$nextTick(function () {
      me.userType = Cookies.get('userType')
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
    }
  }
}

// 根据当前语言来设置 iview 使用使用设么语言
iview.lang(isZh ? 'zh-CN' : 'en-US');

// 根组件
var vRoot = new Vue({
  el: '#app',
  store: vstore,
  i18n: utils.getI18n(),
  data: {
    isShowAlarm: true
  },
  methods: {
    changeComponent: function (activeName) {
      window.onresize = null;
      this.$store.commit('setHeaderActiveName', activeName);
    },
    jumpReport: function (activeName) {
      this.$store.commit('setHeaderActiveName', activeName);
    },
    wsCallback: function (resp) {
      var action = resp.action;
      if (action === "remindmsg") {
        var data = resp.remindMsg;
        communicate.$emit("remindmsg", data);
      } else if (action === "positionlast") {
        var data = resp.positionLast;
        communicate.$emit("positionlast", data);
      };
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
    systemParam: systemParam
  },
  mounted: function () {
    this.isShowAlarm = this.userType == 0 ? false : true;
    //this.$store.dispatch('setUserTypeDescr');
    this.$store.dispatch('setAllCmdList');

    if (userName && this.isShowAlarm) {
      var initIsPass = initWebSocket(userName, this.wsCallback);   // 连接webSocket
      if (!initIsPass) {
        this.$Message.error("浏览器不支持webSocket");
      }
    }
    vueInstanse = this;     // 备份monitor实例
  }
});


