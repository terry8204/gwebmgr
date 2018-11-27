// 是否显示公司名字
var isShowCompany = Cookies.get('isShowCompany');
var communicate = new Vue({}); // 组件之间通信的vue实例
var userName = Cookies.get('name');
// vuex store
vstore = new Vuex.Store({
  state: {
    isShowCompany: isShowCompany === 'true' ? true : false,
    userType: Cookies.get('userType'),
    deviceInfos: {},
    userTypeDescrList: null,     // 用户类型描述
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
    return {
      dark: 'dark',
      name: '',
      isManager: true,
      modal: false,
      intervalTime: null,
      isShowCompany: false,
      headMenuList: [
        { name: "monitor", icon: "md-contacts", title: "定位监控", isShow: true },
        { name: "reportForm", icon: "ios-paper-outline", title: "统计报表", isShow: true },
        { name: "bgManager", icon: "md-settings", title: "后台管理", isShow: true },
        { name: "systemParam", icon: "ios-options", title: "系统参数", isShow: true }
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
        this.$Message.error('密码不能小于四位')
        return
      }
      if (
        this.oldPass == '' ||
        this.newPass == '' ||
        this.confirmPass == ''
      ) {
        this.$Message.error('密码不能为空!')
        return
      }
      if (this.confirmPass !== this.newPass) {
        this.$Message.error('2次密码不一致!')
        return
      }

      utils.sendAjax(url, data, function (resp) {
        if (resp.status == 0) {
          me.$Message.success('密码修改成功!')
          if (me.userType != 99) {
            Cookies.set('accountpass', me.newPass, { expires: 7 })
          } else {
            Cookies.set('devicepass', me.newPass, { expires: 7 })
          }

          me.modalPass = false
        } else {
          me.$Message.error('旧密码错误!')
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



// 根组件
var vRoot = new Vue({
  el: '#app',
  store: vstore,
  i18n: i18n,
  data: {},
  methods: {
    changeComponent: function (activeName) {
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
    this.$store.dispatch('setUserTypeDescr');
    this.$store.dispatch('setAllCmdList');
    if (userName) {
      var initIsPass = initWebSocket(userName, this.wsCallback);   // 连接webSocket
      if (!initIsPass) {
        this.$Message.error("浏览器不支持webSocket");
      }
    }
    vueInstanse = this;     // 备份monitor实例
  }
});

