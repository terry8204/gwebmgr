

// timeout定时器
var timeout = null;
// 保存所有的报警消息记录;
var alarmMgr = new AlarmMgr();
// 最后一次查询报警时间
var lastQueryAllAlarmTime = 0;
// 是否显示公司名字
var isShowCompany = Cookies.get('isShowCompany');
// 组件之间通信的vue实例
var communicate = new Vue({});
// webSocket
var ws = null;

//全局变量
store = {
  navState: isShowCompany === 'true' ? true : false,
  intervalTime: 10,
  disposeAlarmDeviceid: null,
  currentDeviceId: null,
  currentDeviceRecord: {},
  treeDeviceInfo: null,
  paramsCmdCodeArr: [], // 接触报警信息的传参顺序
  componentName: null,
}
// vuex store
vstore = new Vuex.Store({
  state: {
    userType: Cookies.get('userType'),
    deviceInfos: {},
    userTypeDescrList: null,
    allCmdList: []
  },
  actions: {
    setdeviceInfos: function (context, groups) {
      context.commit('setdeviceInfos', groups);
    },
    setUserTypeDescr: function (context) {
      var url = myUrls.queryUserTypeDescr()
      $.ajax({
        url: url,
        method: 'post',
        data: {},
        async: false,
        success: function (resp) {
          context.commit('setUserTypeDescr', resp.records);
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
          var cmdList = resp.records;
          context.commit('setAllCmdList', cmdList);
        }
      )

    }
  },
  mutations: {
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
      isShowCompany: false,
      intervalTime: 10,
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
      activeName: 'monitor',
    }
  },
  methods: {
    changeNav: function (navName) {
      this.$emit('change-nav', navName)
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
      this.modalPass = true
      this.oldPass = ''
      this.newPass = ''
      this.confirmPass = ''
    },
    showSetup: function () {
      this.modal = true
    },
    changeShowCompany: function (state) {
      this.$emit('change-tree', state)
      store.navState = state
      Cookies.set('isShowCompany', state, { expires: 7 })
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
      return this.$store.state.userTypeDescrList
    }
  },
  mounted: function () {
    var me = this
    this.$nextTick(function () {
      me.userType = Cookies.get('userType')
      var mgr = me.getManagerType(me.userType)
      me.name = Cookies.get('name') + mgr
      me.navJurisdiction(me.userType)

      var isShowCompany = Cookies.get('isShowCompany')
      if (isShowCompany == 'true') {
        me.isShowCompany = true
        store.navState = true
      } else if (isShowCompany == 'false') {
        me.isShowCompany = false
        store.navState = false
      }
    })
  },
  watch: {
    intervalTime: function () {
      var intervalTime = Number(this.intervalTime)
      this.$emit('change-intervaltime', intervalTime)
      store.intervalTime = intervalTime
    }
  }
}


// 统计报表
var reportForm = {
  template: document.getElementById('report-template').innerHTML,
  data: function () {
    return {
      theme: "light",
      reportNavList: [
        {
          title: '行驶报表',
          name: 'reportMar',
          icon: 'ios-photos',
          children: [
            { title: '超速表报', name: 'chaosuReport', icon: 'ios-subway' },
            { title: '位置报表', name: 'weizhiReport', icon: 'md-pin' }
          ]
        },
        {
          title: '报警报表',
          name: 'warningMar',
          icon: 'logo-wordpress',
          children: [
            { title: '全部报警', name: 'allWarning', icon: 'md-warning' },
          ]
        },
      ]
    }
  },
  methods: {
    selectditem: function (name) {
      console.log(name);
    }
  }
}

// 后台管理
var bgManager = {
  template: document.getElementById('manager-template').innerHTML,
  data: function () {
    return {
      userType: null,
      theme: 'light',
      navList: [
        {
          title: '客户管理',
          name: 'customerMar',
          icon: 'md-contact',
          children: [
            { title: '添加客户', name: 'addCustomer', icon: 'md-person-add' },
            { title: '查询客户', name: 'queryCustomer', icon: 'md-search' }
          ]
        },
        {
          title: '分组管理',
          name: 'groupMar',
          icon: 'ios-albums',
          children: [
            { title: '添加分组', name: 'addGroup', icon: 'ios-photos-outline' },
            { title: '查询分组', name: 'queryGroup', icon: 'md-search' }
          ]
        },
        {
          title: '用户管理',
          name: 'userMar',
          icon: 'md-person',
          children: [
            { title: '添加用户', name: 'addUser', icon: 'ios-person-add' },
            { title: '查询用户', name: 'queryUser', icon: 'md-search' }
          ]
        },
        {
          title: '设备管理',
          name: 'deviceMar',
          icon: 'md-phone-portrait',
          children: [
            { title: '添加设备', name: 'addDevice', icon: 'md-add' },
            { title: '查询设备', name: 'queryDevice', icon: 'md-search' }
          ]
        }
      ]
    }
  },
  methods: {
    selectditem: function (name) {
      if (this.currentPage == name) {
        return
      }
      var page = null
      switch (name) {
        case 'addCustomer':
          page = 'addcustomer.html'
          break
        case 'queryCustomer':
          page = 'querycustomer.html'
          break
        case 'addGroup':
          page = 'addgroup.html'
          break
        case 'queryGroup':
          page = 'querygroup.html'
          break
        case 'addDevice':
          page = 'adddevice.html'
          break
        case 'queryDevice':
          page = 'querydevice.html'
          break
        case 'addUser':
          page = 'adduser.html'
          break
        case 'queryUser':
          page = 'queryuser.html'
          break
      }
      this.currentPage = name
      this.loadPage(page)
    },
    loadPage: function (page) {
      var me = this
      var pagePath = null
      if (myUrls.host.indexOf('gpsserver') != -1) {
        pagePath = myUrls.host + 'view/manager/' + page
      } else {
        pagePath = '../view/manager/' + page
      }
      this.$Loading.start()
      $('#mar-view').load(pagePath, function () {
        me.$Loading.finish()
      })
    }
  },
  mounted: function () {
    this.userType = Cookies.get('userType')
    if (this.userType == 0) {
      this.$delete(this.navList, 1)
      this.$delete(this.navList, 2)
    }
  }
}

// 系统参数
var systemParam = {
  template: document.getElementById('systemparam-template'),
  data: function () {
    return {
      selectdItemName: null,
      theme: 'light',
      navList: [
        {
          title: '设备指令',
          name: 'deviceDirective',
          icon: 'ios-pricetag-outline',
          children: [
            { title: '新增指令', name: 'addDirective', icon: 'md-add' },
            { title: '查询指令', name: 'queryDirective', icon: 'md-search' }
          ]
        },
        {
          title: '设备类型',
          name: 'deviceType',
          icon: 'ios-albums'
          // children:[
          //     {title:"新增设备类型",name:"addDeviceType",icon:"md-add"},
          //     {title:"查询设备类型",name:"queryDeviceType",icon:"md-search"}
          // ]
        },
        {
          title: '车辆类型',
          name: 'carType',
          icon: 'ios-car'
          // children:[
          //     {title:"新增车辆类型",name:"addCarType",icon:"md-add"},
          //     {title:"查询车辆类型",name:"queryCarType",icon:"md-search"}
          // ]
        }
      ]
    }
  },
  methods: {
    selectditem: function (name) {
      if (this.selectdItemName != name) {
        this.selectdItemName = name
        this.changeItem()
      }
    },
    changeItem: function () {
      var page = null

      switch (this.selectdItemName) {
        case 'queryDirective':
          page = 'devicedirective.html'
          break
        case 'addDirective':
          page = 'adddirective.html'
          break
        case 'deviceType':
          page = 'devicetype.html'
          break
        case 'carType':
          page = 'cartype.html'
          break
      }

      this.loadPage(page)
    },
    loadPage: function (page) {
      var me = this
      var pagePath = null
      if (myUrls.host.indexOf('gpsserver') != -1) {
        pagePath = myUrls.host + 'view/systemparam/' + page
      } else {
        pagePath = '../view/systemparam/' + page
      }
      this.$Loading.start()
      $('#system-view').load(pagePath, function () {
        me.$Loading.finish();
      });
    }
  }
}

// 报警组件
var waringComponent = {
  template: document.getElementById('waring-template'),
  data: function () {
    return {
      isLargen: 0,
      index: 1,
      waringRowIndex: null,
      componentName: 'waringMsg',
      waringModal: false,
      disposeModal: false,
      checkboxObj: {},
      waringRecords: [],
      overdueDevice: [],
      alarmTypeList: [],
      alarmCmdList: [[]],
      isWaring: false,
      interval: 10000,
      cmdRowWaringObj: {},
      currentDevTypeCmdList: [],
      disposeAlarm: '',
      params: '', //参数,
      paramsInputList: [],
      paramsInputObj: {},
      wrapperWidth: null,
      wrapperHeight: null,
      waringWraperStyle: { width: '130px', height: '22px' },
    }
  },
  computed: {
    deviceInfos: function () {
      return this.$store.state.deviceInfos;
    }
  },
  watch: {
    isLargen: function () {
      this.changeWrapperCls();
    },
    waringRecords: function () {
      if (this.waringRecords.length) {
        this.isWaring = true;
      } else {
        this.isWaring = false;
      }
    },
    disposeModal: function () {
      var me = this
      if (this.disposeModal) {
        var devicetype = this.cmdRowWaringObj.devicetype
        var cmdList = this.$store.state.allCmdList
        var beforeCmdList = []
        cmdList.forEach(function (item) {
          if (!item.devicetype) {
            beforeCmdList.push(item)
          } else {
            if (item.devicetype == devicetype) {
              beforeCmdList.push(item)
            }
          }
        })
        me.currentDevTypeCmdList = beforeCmdList
        var twoArr = [];
        beforeCmdList.forEach(function (item, index) {
          if (index % 4 == 0) {
            twoArr.push([])
          }
          twoArr[twoArr.length - 1].push(item);

        })
        this.alarmCmdList = twoArr;

        me.disposeAlarm = beforeCmdList[0].cmdcode;
        me.params = beforeCmdList[0].params;
      }
    },
    disposeAlarm: function () {
      var me = this
      this.currentDevTypeCmdList.forEach(function (item) {
        if (me.disposeAlarm == item.cmdcode) {
          me.params = item.params;
        }
      })
    },
    params: function () {
      this.paramsInputList = [];
      this.paramsInputObj = {};
      if (this.params) {
        var params = '<params>' + this.params + '</params>';
        var parser = new DOMParser();
        var xmlDoc = parser.parseFromString(params, 'text/xml');
        this.parseXML(xmlDoc);
      };
    }
  },
  methods: {
    changeWrapperCls: function () {
      var type = this.isLargen;
      if (type === 0) {
        this.wrapperWidth = 130;
        this.wrapperHeight = 22;
      } else if (type === 1) {
        this.wrapperWidth = 900;
        this.wrapperHeight = 400;

      } else if (type === 2) {
        var clientWidth = document.documentElement.clientWidth || document.body.clientWidth;
        var clientHeight = document.documentElement.clientHeight || document.body.clientHeight;
        if (clientWidth < 1300) {
          clientWidth = 1300;
        }
        if (clientHeight < 580) {
          clientHeight = 580;
        }
        this.wrapperWidth = clientWidth - 295;
        this.wrapperHeight = clientHeight - 65;
      }
      this.setWaringWraperStyle();
    },
    setWaringWraperStyle: function () {
      this.waringWraperStyle = { width: this.wrapperWidth + 'px', height: this.wrapperHeight + 'px' };
    },
    parseXML: function (xmlDoc) {
      store.paramsCmdCodeArr = []
      var parent = xmlDoc.children[0]
      var children = parent.children
      for (var i = 0; i < children.length; i++) {
        var item = children[i]
        var text = item.innerHTML
        var type = item.getAttribute('type');
        if (type && text) {
          store.paramsCmdCodeArr.push(type)
          // this.paramsInputObj[type] = '';
          this.$set(this.paramsInputObj, type, "");
          this.paramsInputList.push({ type: type, text: text });
        }
      }
    },
    changeLargen: function (type) {
      this.isLargen = type;
      this.isWaring = false;
    },
    changeLargen2: function () {
      if (this.isLargen == 1) {
        this.isLargen = 2;
      } else if (this.isLargen == 2) {
        this.isLargen = 1;
      }
    },
    changeComponent: function (index) {
      this.index = index
      switch (index) {
        case 1:
          this.componentName = 'waringMsg'
          break
        case 2:
          this.componentName = 'deviceMsg'
          break
      }
    },
    queryWaringMsg: function () {
      var me = this
      var url = myUrls.queryAlarm();
      this.checkboxObj.lastqueryallalarmtime = lastQueryAllAlarmTime;
      utils.sendAjax(url, this.checkboxObj, function (resp) {
        if (resp.status == 0) {
          lastQueryAllAlarmTime = DateFormat.getCurrentUTC();
          if (resp.records) {
            resp.records.forEach(function (item) {
              alarmMgr.addRecord(item);
            });
            me.refreshAlarmToUi();
          }
        }
      })
    },
    refreshAlarmToUi: function () {
      var me = this;
      var alarmList = alarmMgr.getAlarmList();
      alarmList.forEach(function (item) {
        var deviceid = item.deviceid;
        var deviceInfo = me.$store.state.deviceInfos[deviceid];
        if (deviceInfo) {
          var deviceName = deviceInfo.devicename;
          item.devicename = deviceName;
          item.lastalarmtimeStr = DateFormat.longToDateTimeStr(item.lastalarmtime, 0);
          item.isdispose = item.disposestatus === 0 ? "未处理" : "已处理";
        };
      });
      me.waringRecords = alarmList;
    },
    filterWaringType: function () {
      this.settingCheckboxObj()
      this.waringModal = true
    },
    settingCheckboxObj: function () {
      var checkboxObjJson = Cookies.get('checkboxObj')
      if (checkboxObjJson) {
        var checkboxObj = JSON.parse(checkboxObjJson)
        for (var key in this.checkboxObj) {
          if (this.checkboxObj.hasOwnProperty(key)) {
            this.checkboxObj[key] = checkboxObj[key]
          }
        }
      }
    },
    pushOverdueDeviceInfo: function () {
      var interval = null
      var me = this
      interval = setInterval(function () {
        if (!$.isEmptyObject(me.deviceInfos)) {
          for (var key in me.deviceInfos) {
            var item = me.deviceInfos[key]
            var currentTime = Date.now()
            var overduetime = item.overduetime
            var isOverdue = overduetime > currentTime ? false : true
            if (isOverdue) {
              me.overdueDevice.push({
                devicename: item.devicename,
                deviceid: item.deviceid,
                overduetime: DateFormat.longToDateTimeStr(overduetime, 0),
                isoverdue: '已过期'
              })
            }
          }
          clearInterval(interval)
        }
      }, 1000)
    },
    timingRequestMsg: function () {
      var me = this

      setInterval(function () {
        me.queryWaringMsg();
      }, this.interval)
    },
    disposeMsg: function (data) {
      if (data && data.length) {
        var newArr = []
        for (var i = 0; i < data.length; i++) {
          var msgTiem = data[i]
          for (var j = 0; j < this.waringRecords.length; j++) {
            var waringItem = this.waringRecords[j]
            if (
              msgTiem.deviceid == waringItem.deviceid &&
              msgTiem.arrivedtime !== waringItem.arrivedtime
            ) {
              if (newArr.indexOf(msgTiem) == -1) {
                newArr.push(msgTiem)
                if (msgTiem.type == 1) {
                  var deviceid = msgTiem.deviceid;
                  var lock = true;
                  for (var i = 0; i < this.waringRecords.length; i++) {
                    var item = this.waringRecords[i];
                    if (item.gpstime == msgTiem.createtime) {
                      lock = false;
                      break;
                    };
                  }
                  // 判断是否重复消息
                  if (lock) {
                    this.waringRecords.unshift({
                      devicename: this.$store.state.deviceInfos[deviceid].devicename,
                      deviceid: deviceid,
                      gpstime: msgTiem.createtime,
                      stralarm: msgTiem.content,
                      isdispose: '未处理',
                      messageSerialNo: msgTiem.messageSerialNo,
                      messageId: msgTiem.messageId
                    });
                  }
                } else if (msgTiem.type == 2) {
                } else if (msgTiem.type == 3) {
                } else if (msgTiem.type == 4) {
                }
              }
            }
          }
        }
        // this.waringRecords = newArr.concat(this.waringRecords);
      }
    },
    saveReqMsgParameter: function () {
      Cookies.set('checkboxObj', this.checkboxObj)
      this.waringModal = false
    },
    showDisposeModalFrame: function (param) {
      this.waringRowIndex = param.index
      var deviceInfos = this.$store.state.deviceInfos;

      var row = param.row;
      var deviceid = row.deviceid;
      var devicetype = deviceInfos[deviceid].devicetype

      this.cmdRowWaringObj = {
        deviceid: deviceid,
        devicetype: devicetype,
        params: null,
        state: row.state
      }

      this.disposeModal = true;

      console.log('alarmCmdList', this.alarmCmdList);
    },
    sendDisposeWaring: function () {
      var me = this;
      var sendCmdUrl = myUrls.sendCmd();
      // var disposeAlarmUrl = myUrls.disposeAlarm();
      var isHasParams = true;
      var paramsArr = [];
      me.cmdRowWaringObj.cmdcode = this.disposeAlarm;

      store.paramsCmdCodeArr.forEach(function (cmdCode) {
        var val = me.paramsInputObj[cmdCode]
        paramsArr.push(val);
        if (val == '') {
          isHasParams = false;
        };
      });

      if (!isHasParams) {
        this.$Message.error('所有参数都是必填的');
        return;
      };

      if (this.params && paramsArr.length) {
        this.cmdRowWaringObj.params = paramsArr;
      };

      utils.sendAjax(sendCmdUrl, this.cmdRowWaringObj, function (resp) {
        if (resp.status == 0) {
          me.disposeModal = false;
          me.$Message.success("解除成功!");
          alarmMgr.updateDisposeStatus(me.cmdRowWaringObj.deviceid, me.cmdRowWaringObj.state);
          me.refreshAlarmToUi();
        } else {
          me.$Message.error(resp.cause);
        }
      })
    },
    queryAlarmDescr: function () {
      var me = this
      var url = myUrls.queryAlarmDescr()
      utils.sendAjax(url, {}, function (resp) {
        if (resp.status == 0) {
          var records = resp.records
          records.forEach(function (item, index) {
            if (index % 3 == 0) {
              var newArr = []
              newArr.push(item)
              me.alarmTypeList.push(newArr)
            } else {
              me.alarmTypeList[me.alarmTypeList.length - 1].push(item)
            }
            me.checkboxObj[item.alarmcode] = true
          })
          me.queryWaringMsg()
        }
      })
    }
  },
  components: {
    waringMsg: {
      template:
        '<Table :height="tabheight" border :columns="columns" :data="waringrecords"></Table>',
      props: ['waringrecords', 'tabletype', 'wrapperheight'],
      data: function () {
        var me = this;
        return {
          columns: [
            {
              title: '设备名称',
              key: 'devicename',
              width: 120,
            },
            {
              title: '设备序号',
              key: 'deviceid',
              width: 120,
            },
            {
              title: '报警时间',
              key: 'lastalarmtimeStr',
              width: 160
            },
            {
              title: '报警信息',
              key: 'stralarm',
            },
            {
              title: '报警次数',
              key: 'alarmcount',
              width: 100
            },
            {
              title: '是否处理',
              key: 'isdispose',
              width: 100
            },
            {
              title: '操作',
              key: 'action',
              width: 120,
              render: function (h, params, a) {
                return h('div', [
                  h(
                    'Button',
                    {
                      props: {
                        type: 'primary',
                        size: 'small'
                      },
                      on: {
                        click: function () {
                          // me.removeWaring(index);
                          me.$emit('showdisposemodal', params)
                        }
                      }
                    },
                    '报警处理'
                  )
                ])
              }
            }
          ],
        }
      },
      methods: {
        removeWaring: function (index) {
          console.log(index)
        },
      },
      watch: {
        tabletype: function () {

        }
      },
      computed: {
        tabheight: function () {
          return this.wrapperheight - 24;
        }
      },
      mounted: function () {

      }
    },
    deviceMsg: {
      template:
        '<Table :height="tabheight" :columns="columns" :data="deviceinfolist"></Table>',
      props: ['deviceinfolist', 'tabletype', 'wrapperheight'],
      data: function () {
        return {
          columns: [
            {
              title: '设备名称',
              key: 'devicename'
            },
            {
              title: '设备序号',
              key: 'deviceid'
            },
            {
              title: '过期时间',
              key: 'overduetime'
            },
            {
              title: '是否过期',
              key: 'isoverdue'
            }
          ]
        }
      },
      computed: {
        tabheight: function () {
          return this.wrapperheight - 24;
        }
      },
      methods: {

      },
      mounted: function () {

      }
    }
  },
  mounted: function () {
    var me = this;
    this.settingCheckboxObj();
    this.pushOverdueDeviceInfo();
    this.timingRequestMsg();
    this.queryAlarmDescr();
    this.changeWrapperCls();
    communicate.$on("remindmsg", function (data) {
      alarmMgr.addRecord(data);
      me.refreshAlarmToUi();
    });
    communicate.$on("disposeAlarm", function (cmdCode) {
      alarmMgr.updateDisposeStatus(store.currentDeviceId, 0);
      me.refreshAlarmToUi();
    });
    window.onresize = function () {
      if (timeout != null) {
        clearTimeout(timeout);
      };
      timeout = setTimeout(function () {
        me.changeWrapperCls();
      }, 300);
    }
  }
}


// 根组件
var vRoot = new Vue({
  el: '#app',
  store: vstore,
  i18n: i18n,
  data: {
    componentId: '',
  },
  methods: {
    changeComponent: function (componentid) {
      console.log('componentid', componentid);
      store.componentName = componentid;
      this.componentId = componentid
    },
    changeNav: function (state) {
      if (this.$refs['my-component'].setNavState) {
        this.$refs['my-component'].setNavState(state)
      }
    },
    changeInterval: function (interval) {
      if (this.$refs['my-component'].setIntervalTime) {
        this.$refs['my-component'].setIntervalTime(interval)
      }
    },
    jumpReport: function (companyName) {
      this.componentId = companyName;
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
  components: {
    appHeader: appHeader,
    bgManager: bgManager,
    monitor: monitor,
    reportForm: reportForm,
    waringComponent: waringComponent,
    systemParam: systemParam
  },
  mounted: function () {
    var username = Cookies.get('name');
    this.$store.dispatch('setUserTypeDescr');
    this.$store.dispatch('setAllCmdList');
    var initIsPass = initWebSocket(username, this.wsCallback);   // 连接webSocket
    if (!initIsPass) {
      this.$Message.error("浏览器不支持webSocket");
    }
    vueInstanse = this;     // 备份monitor实例
  }
});

