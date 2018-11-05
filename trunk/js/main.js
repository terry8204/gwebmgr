
; (function () {
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
            Cookies.set('accountpass', me.newPass, { expires: 7 })
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
            Cookies.remove('token')
            window.location.href = 'index.html'
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

  // 定位监控
  var monitor = {
    template: document.getElementById('monitor-template').innerHTML,
    data: function () {
      return {
        map: null,
        isShowConpanyName: store.navState, // 0 不显示公司   1 显示公司名
        sosoValue: '', // 搜索框的值
        sosoData: [], // 搜索框里面的数据
        selectedState: '', // 选择nav的状态 all online offline;
        currentStateData: [], // 当前tree的数据
        records: [], // 全部设备最后一次位置记录
        companys: [], //公司名称id
        groups: [], // 原始列表数据
        intervalTime: null, // 多久刷新一次设备
        offlineTime: 5 * 60 * 1000, // 根据这个时间算出是否离线
        allDevCount: 0, // 全部设备的个数
        onlineDevCount: 0, // 在线设备个数
        offlineDevCount: 0, // 离线设备个数
        isMoveTriggerEvent: true, // 地图移动是否触发事件
        intervalInstanse: null, // 定时器实例
        selectedDevObj: {}, // 选中的设备信息
        myDis: null, // 测距实例
        filterData: [],
        timeoutIns: null,
        isShowMatchDev: false,
        editDevModal: false,          // 编辑设备模态
        dispatchDirectiveModal: false, // 下发指令模态
        electronicFenceModal: false,   //电子围栏
        deviceInfoModal: false,   // 设备基本信息模态
        fenceDistance: 1000,
        editDevData: {       //编辑的设备信息
          devicename: '',
          simnum: '',
          deviceid: '',
          remark: ''
        },
        currentDeviceType: null,  // 选中设备的类型
        currentDevDirectiveList: [],  // 选中设备的类型对应的设备指令
        selectedCmdInfo: {},  // 选中设备指令的信息
        cmdParams: {},
        deviceBaseInfo: {},
        infoWindowInstance: null,  //  信息窗口实例
      }
    },
    methods: {
      initMap: function () {
        var me = this
        this.map = new BMap.Map('map', { minZoom: 4, maxZoom: 18 })
        this.map.enableScrollWheelZoom()
        this.map.enableAutoResize()
        this.map.disableDoubleClickZoom()
        this.map.centerAndZoom(new BMap.Point(108.0017245, 35.926895), 5)
        // var top_left_control = new BMap.ScaleControl({anchor: BMAP_ANCHOR_BOTTOM_LEFT});
        var top_left_control = new BMap.ScaleControl({
          anchor: BMAP_ANCHOR_BOTTOM_LEFT
        }) // 左上角，添加比例尺
        var top_left_navigation = new BMap.NavigationControl() //左上角，添加默认缩放平移控件
        this.map.addControl(top_left_control)
        this.map.addControl(top_left_navigation)
        this.map.addControl(
          new BMap.MapTypeControl({
            mapTypes: [BMAP_NORMAL_MAP, BMAP_HYBRID_MAP]
          })
        )
        this.map.addEventListener('moveend', function (ev) {
          if (me.isMoveTriggerEvent) {
            me.clearMarkerOverlays()
            var pointArr = me.getThePointOfTheCurrentWindow()
            var range = utils.getDisplayRange(me.map.getZoom())
            if (pointArr.length) {
              if (pointArr.length > 300) {
                var filterArr = me.filterReocrds(range, pointArr)
                me.addOverlayToMap(filterArr)
              } else {
                me.addOverlayToMap(pointArr)
              }
              me.openDevInfoWindow()
            }
          } else {
            me.isMoveTriggerEvent = true
          }
        })

        this.map.addEventListener('zoomend', function (ev) {
          // me.map.clearOverlays();
          // me.clearMarkerOverlays();
          var pointArr = me.getThePointOfTheCurrentWindow()
          var range = utils.getDisplayRange(me.map.getZoom())
          if (pointArr.length) {
            if (pointArr.length > 300) {
              var filterArr = me.filterReocrds(range, pointArr)
              me.addOverlayToMap(filterArr)
            } else {
              me.addOverlayToMap(pointArr)
            }
            setTimeout(function () {
              me.openDevInfoWindow()
            }, 400);
          }
        });

        this.map.addEventListener('click', function (event) {
          var overlay = event.overlay;
          if (overlay == null || overlay.deviceid == undefined) {
            store.currentDeviceId = null;
            store.currentDeviceRecord = null;
          }
        })
      },
      handleWebSocket: function (data) {
        // console.log('data-收到的轨迹push', data);
        var me = this;
        if (store.componentName != "monitor") return;
        var deviceid = data.deviceid;
        console.log(' this.records', this.records);
        for (var i = 0; i < this.records.length; i++) {
          var record = me.records[i];
          if (record.deviceid === deviceid) {
            var isOnline = Date.now() - data.arrivedtime < me.offlineTime ? true : false;
            var iconState = null;
            var angle = utils.getAngle(data.course);

            iconState = new BMap.Icon(
              utils.getDirectionImage(isOnline, angle),
              new BMap.Size(17, 17),
              { imageOffset: new BMap.Size(0, 0) }
            );

            data.icon = iconState;
            var lng_lat = wgs84tobd09(data.callon, data.callat);
            data.point = new BMap.Point(lng_lat[0], lng_lat[1]);
            me.records.splice(i, 1, data);
          };
        };

      },
      clearMarkerOverlays: function () {
        var me = this
        var mks = me.map.getOverlays()
        mks.forEach(function (item) {
          if (item.deviceid != undefined) {
            me.map.removeOverlay(item)
          }
        })
      },
      openDistance: function () {
        if (this.myDis != null) {
          this.myDis.close();
        }
        this.myDis = new BMapLib.DistanceTool(this.map)
        this.myDis.open(); //开启鼠标测距
      },
      getThePointOfTheCurrentWindow: function () {
        var bounds = this.map.getBounds();
        var pointArr = [];
        this.records.forEach(function (item, index) {
          if (item) {
            var lng_lat = wgs84tobd09(item.callon, item.callat);
            var point = new BMap.Point(lng_lat[0], lng_lat[1]);
            if (bounds.containsPoint(point)) {
              pointArr.push(item);
            };
          };
        });
        return pointArr;
      },
      handleClickMore: function (name) {
        switch (name) {
          case 'name3':
            this.$emit("jump-report", "reportForm");
            break;
          case 'name4':
            this.queryDeviceBaseInfo();
            this.deviceInfoModal = true;
            break;
        }
      },
      queryDeviceBaseInfo: function () {
        this.deviceBaseInfo = {};
        var me = this;
        var deviceId = me.selectedDevObj.deviceid;
        var url = myUrls.queryDeviceBaseInfo();
        var data = {
          deviceid: deviceId
        };
        utils.sendAjax(url, data, function (resp) {
          resp.overdueDateStr = DateFormat.longToDateStr(resp.overduetime, 0);
          me.deviceBaseInfo = resp;
        })

      },
      handleClickDirective: function (cmdCode) {
        this.cmdParams = {};
        this.selectedCmdInfo = {};
        var cmdInfo = null;
        var me = this;
        this.currentDevDirectiveList.forEach(function (cmd) {
          if (cmd.cmdcode == cmdCode) {
            cmdInfo = cmd;
          }
        });
        this.selectedCmdInfo.cmdName = cmdInfo.cmdname;
        this.selectedCmdInfo.cmdcode = cmdInfo.cmdcode;
        this.selectedCmdInfo.cmddescr = cmdInfo.cmddescr;
        if (cmdInfo.params) {
          this.selectedCmdInfo.params = utils.parseXML(cmdInfo.params)
          this.selectedCmdInfo.params.forEach(function (param) {
            me.cmdParams[param.type] = param.value;
          });
        };

        this.dispatchDirectiveModal = true;
      },
      handleClickFence: function (name) {
        switch (name) {
          case 'shefang':
            // this.cancelFence();
            this.electronicFenceModal = true;
            break;
          case 'chexiao':
            this.cancelFence();
            break;
        }
      },
      setFence: function () {
        var me = this;
        var deviceid = this.selectedDevObj.deviceid;
        var track = this.getSingleDeviceInfo(deviceid);
        var distance = this.fenceDistance;

        if (!isNaN(distance)) {
          var url = myUrls.setGeofence();
          utils.sendAjax(url, { deviceid: deviceid, radius: this.fenceDistance, lat: track.callat, lon: track.callon }, function (resp) {
            if (resp.status == 0) {
              me.electronicFenceModal = false;
              utils.addMapFence(me, deviceid, me.fenceDistance);
            } else {
              me.$Message.error("设置失败");
            }
          })

        } else {
          this.$Message.error("范围必须是数字");
        }
      },
      cancelFence: function () {
        var me = this;
        var deviceid = this.selectedDevObj.deviceid;
        var mks = this.map.getOverlays();
        var url = myUrls.unSetGeofence();

        utils.sendAjax(url, { deviceid: deviceid }, function (resp) {
          if (resp.status == 0) {
            me.$Message.success("撤防成功");
            for (var i = 0; i < mks.length; i++) {
              var mk = mks[i];
              if (mk.circleid && mk.circleid == deviceid) {
                me.map.removeOverlay(mk);
              }
            }
          } else {
            me.$Message.error("设置失败");
          }
        })
      },
      disposeDirectiveFn: function () {
        var me = this;
        var url = myUrls.sendCmd();
        var data = { devicetype: this.currentDeviceType, cmdcode: this.selectedCmdInfo.cmdcode, deviceid: store.disposeAlarmDeviceid, params: Object.values(this.cmdParams), state: 0 };
        utils.sendAjax(url, data, function (resp) {
          if (resp.status === 0) {
            communicate.$emit("disposeAlarm", data.cmdcode);
            me.$Message.success("下发成功");
            me.dispatchDirectiveModal = false;
          } else if (resp.status === 1) {
            me.$Message.error("密码错误");
          } else if (resp.status === -1) {
            me.$Message.error("下发指令异常");
          } else if (resp.status === 2) {
            me.$Message.error("设备离线,指令没有缓存");
          } else if (resp.status === 3) {
            me.$Message.error("设备离线,指令已经缓存");
          } else if (resp.status === 4) {
            me.$Message.error("请修改密码后再发送指令");
          }
        });
      },
      focus: function () {
        var me = this
        if (this.sosoValue.trim()) {
          me.sosoValueChange()
        }
      },
      blur: function () {
        var me = this
        setTimeout(function () {
          me.isShowMatchDev = false;
        }, 300)
      },
      filterMethod: function (value) {
        this.filterData = []
        var firstLetter = __pinyin.getFirstLetter(value)
        var pinyin = __pinyin.getPinyin(value)
        for (var i = 0; i < this.groups.length; i++) {
          var group = this.groups[i]
          if (
            group.groupname.toUpperCase().indexOf(value.toUpperCase()) !== -1 ||
            group.firstLetter.indexOf(firstLetter) !== -1 ||
            group.pinyin.indexOf(pinyin) !== -1
          ) {
            this.filterData.push(group)
          } else {
            var devices = group.devices
            var obj = {
              groupname: group.groupname,
              devices: []
            }
            for (var j = 0; j < devices.length; j++) {
              var device = devices[j]
              var devicename = device.devicename
              if (
                devicename.toUpperCase().indexOf(value.toUpperCase()) !== -1 ||
                device.firstLetter.indexOf(firstLetter) !== -1 ||
                device.pinyin.indexOf(pinyin) !== -1
              ) {
                obj.devices.push(device)
              } else {
                if (device.remark) {
                  if (device.remark.indexOf(value) !== -1) {
                    obj.devices.push(device);
                  };
                };
              };
            }
            if (obj.devices.length) {
              this.filterData.push(obj);
            };
          };
        };
      },
      sosoSelect: function (value) {

        this.sosoValue = value.devicename;
        this.filterData = [];
        var me = this;

        if (this.isShowConpanyName) {
          this.currentStateData.forEach(function (company) {
            company.children.forEach(function (group) {
              group.children.forEach(function (dev) {
                if (dev.deviceid == value.deviceid) {
                  company.expand = true;
                  dev.isSelected = true;
                  group.expand = true;
                  me.handleClickDev(dev.deviceid);
                } else {
                  dev.isSelected = false;
                };
              });
            });
          });
        } else {
          this.currentStateData.forEach(function (group) {
            group.children.forEach(function (dev) {
              if (dev.deviceid == value.deviceid) {
                dev.isSelected = true;
                group.expand = true;
                me.handleClickDev(dev.deviceid);
              } else {
                dev.isSelected = false;
              };
            });
          });
        }
      },
      sosoValueChange: function () {
        var me = this;
        var value = this.sosoValue;

        if (this.timeoutIns != null) {
          clearTimeout(this.timeoutIns);
        }

        if (!value.trim()) {
          this.filterData = [];
          return;
        }

        this.timeoutIns = setTimeout(function () {
          me.filterMethod(value);
        }, 300);
      },

      selectedStateNav: function (state) {
        this.selectedState = state;
      },
      openCanpany: function (conpany) {
        conpany.expand = !conpany.expand;
      },
      openGroupItem: function (groupInfo) {
        groupInfo.expand = !groupInfo.expand;
      },
      selectedDev: function (deviceInfo) {
        var devicetype = deviceInfo.devicetype;
        if (devicetype != this.currentDeviceType) {
          this.currentDeviceType = devicetype;
        };
        this.cancelSelected();
        deviceInfo.isSelected = true;
        this.selectedDevObj = deviceInfo;
        this.handleClickDev(deviceInfo.deviceid);
      },
      handleClickDev: function (deviceid) {
        var me = this
        me.getLastPosition([deviceid], function (resp) {
          if (
            resp.records != null &&
            resp.records.length &&
            resp.records[0] !== null
          ) {
            var record = resp.records[0]
            var callon = record.callon
            var callat = record.callat
            var lng_lat = wgs84tobd09(callon, callat)
            var point = new BMap.Point(lng_lat[0], lng_lat[1])
            record.point = point
            var isOnline =
              Date.now() - record.arrivedtime < me.offlineTime ? true : false
            var iconState = null
            var angle = utils.getAngle(record.course)

            iconState = new BMap.Icon(
              utils.getDirectionImage(isOnline, angle),
              new BMap.Size(17, 17),
              { imageOffset: new BMap.Size(0, 0) }
            )

            record.icon = iconState;
            store.currentDeviceId = deviceid;
            store.currentDeviceRecord = record;
            store.disposeAlarmDeviceid = deviceid;
            me.updateRecords(record);
            me.isMoveTriggerEvent = false;
            me.map.centerAndZoom(point, 17)
            me.openDevInfoWindow()
          } else {
            store.currentDeviceRecord = null;
            me.$Message.error('该设备没有上报位置信息')
            store.disposeAlarmDeviceid = deviceid;
          }
        })
      },
      updateRecords: function (record) {
        var records = this.records
        for (var i = 0; i < records.length; i++) {
          if (records[i] != null) {
            var deviceid = records[i].deviceid
            if (record.deviceid == deviceid) {
              records.splice(i, 1, record)
            }
          }
        }
      },
      updateTreeOnlineState: function () {
        var me = this
        this.records.forEach(function (item) {
          if (item == null) {
            return;
          }
          var deviceid = item.deviceid;
          var isOnline = (function (record) {
            var isOnline = false;
            var arrivedtime = record.arrivedtime;
            var currentTime = new Date().getTime();
            if (currentTime - arrivedtime < me.offlineTime) {
              isOnline = true;
            }
            return isOnline;
          })(item);

          if (me.isShowConpanyName) {
            me.currentStateData.forEach(function (company) {
              company.children.forEach(function (group) {
                group.children.forEach(function (dev) {
                  if (dev.deviceid == deviceid) {
                    dev.isOnline = isOnline
                  };
                });
              });
            });

            me.currentStateData.forEach(function (company) {
              company.children.forEach(function (group) {
                var onlineCount = 0
                group.children.forEach(function (dev) {
                  if (dev.isOnline) {
                    onlineCount++
                  }
                })
                if (me.selectedState == 'all') {
                  group.title =
                    group.name +
                    '(' +
                    onlineCount +
                    '/' +
                    group.children.length +
                    ')'
                } else {
                  group.title = group.name + '(' + group.children.length + ')'
                };
              });
            });
          } else {
            me.currentStateData.forEach(function (group) {
              group.children.forEach(function (dev) {
                if (dev.deviceid == deviceid) {
                  dev.isOnline = isOnline
                };
              });
            });
            me.currentStateData.forEach(function (group) {
              var onlineCount = 0
              group.children.forEach(function (dev) {
                if (dev.isOnline) {
                  onlineCount++
                };
              });
              if (me.selectedState == 'all') {
                group.title =
                  group.name +
                  '(' +
                  onlineCount +
                  '/' +
                  group.children.length +
                  ')'
              } else {
                group.title = group.name + '(' + group.children.length + ')'
              };
            });
          };
        });
      },
      cancelSelected: function () {
        if (this.isShowConpanyName) {
          this.currentStateData.forEach(function (company) {
            company.children.forEach(function (group) {
              group.children.forEach(function (dev) {
                dev.isSelected = false
              })
            })
          })
        } else {
          this.currentStateData.forEach(function (group) {
            group.children.forEach(function (dev) {
              dev.isSelected = false
            })
          })
        }
      },
      getMonitorListByUser: function (havecompany, callback) {
        var me = this
        var url = myUrls.monitorListByUser()
        utils.sendAjax(url, { havecompany: havecompany }, function (resp) {
          if (resp.status == 0) {
            resp.groups.forEach(function (group) {
              group.firstLetter = __pinyin.getFirstLetter(group.groupname)
              group.pinyin = __pinyin.getPinyin(group.groupname)
              group.devices.forEach(function (device, index) {
                var deviceid = device.deviceid
                device.firstLetter = __pinyin.getFirstLetter(device.devicename)
                device.pinyin = __pinyin.getPinyin(device.devicename)
              })
            })
            callback(resp)
          } else if (resp.status == 3) {
            me.$Message.error('请重新登录,2秒后自动跳转登录页面')
            Cookies.remove('token')
            setTimeout(function () {
              window.location.href = 'index.html'
            }, 2000)
          } else {
            if (resp.cause) {
              me.$Message.error(resp.cause)
            }
          }
        })
      },
      setDeviceIdsList: function (groups) {
        this.$store.dispatch('setdeviceInfos', groups)
      },
      getLastPosition: function (deviceIds, callback) {
        var me = this
        var url = myUrls.lastPosition()
        var data = {
          username: this.username,
          deviceids: deviceIds
        }
        utils.sendAjax(url, data, function (resp) {
          if (resp.status == 0) {
            callback(resp)
          } else if (resp.status == 3) {
            me.$Message.error('请重新登录,2秒后自动跳转登录页面')
            Cookies.remove('token')
            setTimeout(function () {
              window.location.href = 'index.html'
            }, 2000)
          }
        })
      },
      filterReocrds: function (range, records) {
        var me = this
        var filterArr = []
        var firstRecord = records[0]
        if (firstRecord == null) {
          return []
        }
        var first_lng_lat = wgs84tobd09(firstRecord.callon, firstRecord.callat)
        firstRecord.point = new BMap.Point(first_lng_lat[0], first_lng_lat[1])
        filterArr.push(firstRecord)

        records.forEach(function (record) {
          var len = filterArr.length - 1
          var endPoint = null
          if (!record.point) {
            var end_lng_lat = wgs84tobd09(record.callon, record.callat)
            endPoint = new BMap.Point(end_lng_lat[0], end_lng_lat[1])
            record.point = endPoint
          } else {
            endPoint = record.point
          }
          var rice = me.map.getDistance(filterArr[len].point, endPoint)
          if (rice > range) {
            filterArr.push(record)
          }
        })

        if (filterArr.length > 300) {
          return filterReocrds(range + 100, filterArr)
        } else {
          return filterArr
        }
      },
      addOverlayToMap: function (records) {
        var me = this
        records.forEach(function (record) {
          if (record != null) {
            var deviceid = record.deviceid
            var point = null
            if (!record.point) {
              var lng_lat = wgs84tobd09(record.callon, record.callat)
              var point = new BMap.Point(lng_lat[0], lng_lat[1])
              record.point = point
            } else {
              point = record.point
            }
            // var isOnline = (Date.now() - record.arrivedtime) < me.offlineTime ? true : false ;

            var marker = new BMap.Marker(point)
            marker.setIcon(record.icon)
            var label = new BMap.Label(
              me.$store.state.deviceInfos[deviceid].devicename,
              { position: point, offset: new BMap.Size(20, -3) }
            )
            label.setStyle({
              color: '#000000',
              border: '1px solid #000000',
              background: '#F5FCB8',
              fontSize: '14px',
              fontFamily: '微软雅黑',
              padding: '0 2px'
            })
            marker.setLabel(label)
            marker.deviceid = deviceid
            me.markerAddEvent(marker, deviceid)
            me.map.addOverlay(marker)
          }
        })
      },

      markerAddEvent: function (marker, deviceid) {
        var me = this
        marker.addEventListener('click', function () {
          me.isMoveTriggerEvent = false
          var deviceid = this.deviceid
          var devLastInfo = me.getSingleDeviceInfo(deviceid)
          store.currentDeviceId = deviceid;
          store.currentDeviceRecord = devLastInfo;
          store.disposeAlarmDeviceid = deviceid;
          var infoWindow = me.getInfoWindow(devLastInfo)
          marker.openInfoWindow(infoWindow, marker.point)
          me.openTreeDeviceNav(deviceid)
        })
      },
      openTreeDeviceNav: function (deviceid) {
        var me = this
        if (me.isShowConpanyName) {
          me.currentStateData.forEach(function (company) {
            company.children.forEach(function (group) {
              group.children.forEach(function (dev) {
                if (dev.deviceid == deviceid) {
                  company.expand = true
                  dev.isSelected = true
                  group.expand = true
                } else {
                  dev.isSelected = false
                }
              })
            })
          })
        } else {
          me.currentStateData.forEach(function (group) {
            group.children.forEach(function (dev) {
              if (dev.deviceid == deviceid) {
                dev.isSelected = true
                group.expand = true
              } else {
                dev.isSelected = false
              }
            })
          })
        }
      },
      openDevInfoWindow: function () {
        var me = this
        var record = store.currentDeviceRecord
        if (!$.isEmptyObject(record)) {
          var markers = this.map.getOverlays()
          for (var i = 0; i < markers.length; i++) {
            var marker = markers[i]
            if (marker.deviceid == store.currentDeviceId) {
              var infoWindow = me.getInfoWindow(record)
              marker.openInfoWindow(infoWindow, record.point)
            }
          }
        }
      },
      getSingleDeviceInfo: function (deviceid) {
        var info = null
        for (var i = 0; i < this.records.length; i++) {
          if (this.records[i]) {
            var item = this.records[i]
            if (item.deviceid == deviceid) {
              info = item
            }
          }
        }
        return info;
      },
      getInfoWindow: function (info) {
        try {
          var sContent = this.getWindowContent(info);
          var infoWindowInstance = new BMap.InfoWindow(sContent, { width: 350 });
          this.infoWindowInstance = infoWindowInstance;
          return infoWindowInstance;
        } catch (error) {
          console.log('get不到info.deviceid --- ')
          this.infoWindowInstance = null;
        }
      },
      getWindowContent: function (info) {
        var devdata = this.$store.state.deviceInfos[info.deviceid];
        var address = this.getAddress(info);
        var posiType = (function () {
          var type = null;
          var gotsrc = info.gotsrc;  //cell gps wifi
          switch (gotsrc) {
            case 'un':
              type = "未知";
              break;
            case 'cell':
              type = "基站定位";
              break;
            case 'gps':
              type = "卫星定位";
              break;
            case 'wifi':
              type = "WIFI定位";
              break;
            default:
              type = "未知";
          };
          return type;
        })();
        if (info.radius > 0) {
          var radiuDesc = ' (误差范围:' + info.radius + '米)';
          posiType += radiuDesc;
        };

        var content =
          '<div><p style="margin:0;font-size:13px">' +
          '<p> 设备名称: ' +
          devdata.devicename +
          '</p>' +
          '<p> 设备序号: ' +
          info.deviceid +
          '</p>' +
          '<p> 定位类型: ' +
          posiType +
          '</p>' +
          '<p> 经纬度: ' +
          info.callon.toFixed(5) +
          ',' +
          info.callat.toFixed(5) +
          '</p>' +
          '<p> 最后时间: ' +
          DateFormat.longToDateTimeStr(info.arrivedtime, 0) +
          '</p>' +
          '<p> 到期时间: ' +
          DateFormat.longToDateTimeStr(devdata.overduetime, 0) +
          '</p>' +
          '<p class="last-address"> 详细地址: ' +
          address +
          '</p>' +
          '<p class="operation">' +
          '<span class="ivu-btn ivu-btn-default ivu-btn-small" onclick="playBack(' +
          info.deviceid +
          ')">轨迹</span>' +
          '<span class="ivu-btn ivu-btn-default ivu-btn-small" onclick="trackMap(' +
          info.deviceid +
          ')">跟踪</span><span class="ivu-btn ivu-btn-default ivu-btn-small" onclick="refreshPostion(' +
          info.deviceid +
          ')">刷新位置</span><span class="ivu-btn ivu-btn-default ivu-btn-small" onclick="setFence(' +
          info.deviceid +
          ')">设置围栏</span></p></div>';

        return content;
      },
      getAddress: function (info) {
        var callon = info.callon;
        var callat = info.callat;
        var bd09 = wgs84tobd09(callon, callat);
        var lng = bd09[0].toFixed(5);
        var lat = bd09[1].toFixed(5);
        var address = LocalCacheMgr.getAddress(lng, lat);
        if (address !== null) {
          return address;
        }
        utils.getBaiduAddressFromBaidu(lng, lat, function (resp) {
          if (resp.length) {
            address = resp;
            $('p.last-address').html(' 详细地址: ' + address);
            LocalCacheMgr.setAddress(lng, lat, address);
          } else {
            utils.getJiuHuAddressSyn(callon, callat, function (resp) {
              address = resp.address
              $('p.last-address').html(' 详细地址: ' + address);
              LocalCacheMgr.setAddress(lng, lat, address);
            })
          }
        })
        return '地址正在解析...'
      },
      setNavState: function (state) {
        this.isShowConpanyName = state
      },
      setIntervalTime: function (interval) {
        this.intervalTime = interval
        clearInterval(this.intervalInstanse)
        this.setIntervalReqRecords()
      },
      queryCompanyTree: function (callback) {
        var url = myUrls.queryCompanyTree()
        utils.sendAjax(url, {}, function (resp) {
          callback(resp)
        })
      },
      handleEditDevFn: function () {
        var me = this;
        var data = this.editDevData;
        var sendData = {
          deviceid: data.deviceid,
          devicename: data.devicename,
          remark: data.remark
        };
        var url = myUrls.editDeviceSimple();
        if (data.devicename.length == 0 || data.devicename == '') {
          me.$Message.error('设备名称是必填的')
          return
        }
        if (data.simnum) {
          sendData.simnum = data.simnum
        }

        utils.sendAjax(url, sendData, function (resp) {
          if (resp.status == 0) {
            store.treeDeviceInfo.title = sendData.devicename;
            store.treeDeviceInfo.simnum = sendData.simnum;
            utils.changeGroupsDevName(sendData, me.groups);
            me.editDevModal = false;
            me.$Message.success('修改成功');

            me.$store.state.deviceInfos[data.deviceid].remark = data.remark;
          } else if ((resp.status = -1)) {
            me.$Message.error('修改失败')
          }
        })
      },
      editDevice: function (device) {
        // console.log('editDevice', deviceid);
        store.treeDeviceInfo = device;
        var deviceid = device.deviceid
        var deviceInfo = this.$store.state.deviceInfos[deviceid];

        this.editDevData.devicename = deviceInfo.devicename;
        this.editDevData.simnum = deviceInfo.simnum;
        this.editDevData.deviceid = deviceid;
        this.editDevData.remark = deviceInfo.remark;
        this.editDevModal = true
      },
      playBack: function (deviceid) {
        playBack(deviceid)
      },
      trackMap: function (deviceid) {
        trackMap(deviceid)
      },
      more: function (e) {
        console.log(e)
      },
      getCurrentStateTreeData: function (state, isShowConpanyName) {
        var me = this
        this.currentStateData = []
        this.sosoData = []
        if (state === 'all') {
          if (isShowConpanyName) {
            this.getAllShowConpanyTreeData()
          } else {
            this.getAllHideConpanyTreeData()
          }
        } else if (state === 'online') {
          if (isShowConpanyName) {
            this.getOnlineShowConpanyTreeData()
          } else {
            this.getOnlineHideConpanyTreeData()
          }
        } else if (state === 'offline') {
          if (isShowConpanyName) {
            this.getOfflineShowConpanyTreeData()
          } else {
            this.getOfflineHideConpanyTreeData()
          }
        }

        if (isShowConpanyName) {
          this.currentStateData.forEach(function (company) {
            company.children.forEach(function (group) {
              group.children.forEach(function (dev) {
                me.sosoData.push(dev.title)
              })
            })
          })
        } else {
          this.currentStateData.forEach(function (item) {
            item.children.forEach(function (dev) {
              me.sosoData.push(dev.title)
            })
          })
        }
      },
      getNewCompanyArr: function () {
        var newArray = []
        this.companys.forEach(function (company) {
          var companyid = company.companyid
          var companyObj = {
            title: company.companyname,
            companyname: company.companyname,
            companyid: companyid,
            children: [],
            expand: false
          }
          newArray.push(companyObj)
        })
        var logintype = Cookies.get('logintype')
        if (logintype !== 'DEVICE' && this.isShowConpanyName) {
          newArray.unshift({
            title: '默认客户',
            companyname: '默认客户',
            companyid: 0,
            children: [],
            expand: false
          })
        }
        if (newArray.length === 0) {
          if (logintype == 'DEVICE') {
            newArray.push({
              title: '默认客户',
              children: [],
              companyname: '默认客户',
              expand: false,
              companyid: 0
            })
          }
        }
        return newArray
      },
      filterGroups: function (groups) {
        var newGroups = []
        var newObject = {}
        groups.forEach(function (item) {
          var groupid = item.groupid
          var devices = item.devices
          if (newObject[groupid] == undefined) {
            newObject[groupid] = {
              groupname: item.groupname,
              devices: [],
              groupid: item.groupid,
              remark: item.remark
            }
          };
          newObject[groupid].devices = newObject[groupid].devices.concat(
            devices
          );
        })

        for (var key in newObject) {
          if (newObject.hasOwnProperty(key)) {
            newGroups.push(newObject[key])
          }
        }

        return newGroups
      },
      getAllShowConpanyTreeData: function () {
        var me = this
        var newArray = me.getNewCompanyArr()
        var newGroups = []
        me.groups.forEach(function (group, index) {
          var companyid = group.companyid
          var onlineCount = 0
          var groupObj = {
            companyid: companyid,
            title: group.groupname,
            expand: false,
            name: group.groupname,
            children: []
          }
          group.devices.forEach(function (device, index) {
            var isOnline = me.getIsOnline(device.deviceid)
            var deviceObj = {
              title: device.devicename,
              deviceid: device.deviceid,
              isOnline: isOnline,
              isSelected: false,
              simnum: device.simnum,
              devicetype: device.devicetype
            }
            if (isOnline) {
              onlineCount++
            }
            if (device.deviceid == store.currentDeviceId) {
              groupObj.expand = true
              deviceObj.isSelected = true
            }
            groupObj.children.push(deviceObj)
          })
          groupObj.title +=
            '(' + onlineCount + '/' + groupObj.children.length + ')'

          newArray.forEach(function (company) {
            if (company.companyid == companyid) {
              if (groupObj.children.length) {
                company.children.push(groupObj)
              }
              company.title =
                company.companyname + '(' + company.children.length + ')'
            } else {
              var logintype = Cookies.get('logintype')
              if (logintype == 'DEVICE') {
                company.children.push(groupObj)
                company.title =
                  company.companyname + '(' + company.children.length + ')'
              }
            }
          })
        })
        var treeData = []
        for (var i = 0; i < newArray.length; i++) {
          var item = newArray[i]
          if (item.children.length !== 0) {
            treeData.push(item)
          }
        }
        me.currentStateData = treeData
      },
      getAllHideConpanyTreeData: function () {
        var me = this
        var groups = this.filterGroups(this.groups)
        groups.forEach(function (group) {
          var onlineCount = 0
          var groupData = {
            title: group.groupname,
            expand: false,
            children: [],
            name: group.groupname
          }

          group.devices.forEach(function (device, index) {
            var isOnline = me.getIsOnline(device.deviceid)
            var dev = {
              title: device.devicename,
              isSelected: false,
              isOnline: isOnline,
              deviceid: device.deviceid,
              simnum: device.simnum,
              devicetype: device.devicetype
            }
            if (device.deviceid == store.currentDeviceId) {
              groupData.expand = true
              dev.isSelected = true
            }
            if (isOnline) {
              onlineCount++
            }
            groupData.children.push(dev)
          })

          if (groupData.children.length) {
            groupData.title +=
              '(' + onlineCount + '/' + groupData.children.length + ')'
            if (groupData.title == '默认组') {
              me.currentStateData.unshift(groupData)
            } else {
              me.currentStateData.push(groupData)
            }
          }
        })
      },
      getOnlineShowConpanyTreeData: function () {
        var me = this
        var newArray = me.getNewCompanyArr()
        var groupsArray = []

        me.groups.forEach(function (group) {
          var companyid = group.companyid
          var onlineCount = 0
          var groupObj = {
            companyid: companyid,
            title: group.groupname,
            expand: false,
            children: [],
            name: group.groupname
          }

          group.devices.forEach(function (device) {
            var isOnline = me.getIsOnline(device.deviceid)
            var deviceObj = {
              title: device.devicename,
              deviceid: device.deviceid,
              isOnline: isOnline,
              isSelected: false,
              simnum: device.simnum,
              devicetype: device.devicetype
            }

            if (device.deviceid == store.currentDeviceId) {
              groupObj.expand = true
              deviceObj.isSelected = true
            }
            if (isOnline) {
              onlineCount++
              groupObj.children.push(deviceObj)
            }
          })
          if (groupObj.children.length) {
            groupObj.title += '(' + groupObj.children.length + ')'
            groupsArray.push(groupObj)
          }
        })

        newArray.forEach(function (company, index) {
          var companyid = company.companyid
          groupsArray.forEach(function (group) {
            if (companyid == group.companyid) {
              company.children.push(group)
            } else {
              var logintype = Cookies.get('logintype')
              if (logintype == 'DEVICE') {
                company.children.push(group)
              }
            }
          })
          if (company.children.length) {
            company.title =
              company.companyname + '(' + company.children.length + ')'
            me.currentStateData.push(company)
          }
        })
      },
      getOnlineHideConpanyTreeData: function () {
        var me = this
        var groups = this.filterGroups(this.groups)
        groups.forEach(function (group) {
          var groupData = {
            title: group.groupname,
            expand: false,
            children: [],
            name: group.groupname
          }

          group.devices.forEach(function (device, index) {
            var isOnline = me.getIsOnline(device.deviceid)
            var dev = {
              title: device.devicename,
              isSelected: false,
              isOnline: isOnline,
              deviceid: device.deviceid,
              simnum: device.simnum,
              devicetype: device.devicetype
            }
            if (device.deviceid == store.currentDeviceId) {
              groupData.expand = true
              dev.isSelected = true
            }
            if (isOnline) {
              groupData.children.push(dev)
            }
          })

          if (groupData.children.length) {
            if (groupData.title == '默认组') {
              if (groupData.children.length) {
                me.currentStateData.unshift(groupData)
              }
            } else {
              if (groupData.children.length) {
                me.currentStateData.push(groupData)
              }
            }
            groupData.title += '(' + groupData.children.length + ')'
          }
        })
      },
      getOfflineShowConpanyTreeData: function () {
        var me = this
        var newArray = me.getNewCompanyArr()
        var groupsArray = []

        me.groups.forEach(function (group) {
          var companyid = group.companyid

          var groupObj = {
            companyid: companyid,
            title: group.groupname,
            expand: false,
            children: [],
            name: group.groupname
          }

          group.devices.forEach(function (device) {
            var isOnline = me.getIsOnline(device.deviceid)
            var deviceObj = {
              title: device.devicename,
              deviceid: device.deviceid,
              isOnline: isOnline,
              isSelected: false,
              simnum: device.simnum,
              devicetype: device.devicetype
            }

            if (device.deviceid == store.currentDeviceId) {
              groupObj.expand = true
              deviceObj.isSelected = true
            }
            if (!isOnline) {
              groupObj.children.push(deviceObj)
            }
          })
          if (groupObj.children.length) {
            groupObj.title += '(' + groupObj.children.length + ')'
            groupsArray.push(groupObj)
          }
        })
        newArray.forEach(function (company, index) {
          var companyid = company.companyid
          groupsArray.forEach(function (group) {
            if (companyid == group.companyid) {
              company.children.push(group)
            } else {
              var logintype = Cookies.get('logintype')
              if (logintype == 'DEVICE') {
                company.children.push(group)
              }
            }
          })
          if (company.children.length) {
            company.title =
              company.companyname + '(' + company.children.length + ')'
            me.currentStateData.push(company)
          }
        })
      },
      getOfflineHideConpanyTreeData: function () {
        var me = this
        var groups = this.filterGroups(this.groups)
        groups.forEach(function (group) {
          var groupData = {
            title: group.groupname,
            expand: false,
            children: [],
            name: group.groupname
          }

          group.devices.forEach(function (device, index) {
            var isOnline = me.getIsOnline(device.deviceid)
            var dev = {
              title: device.devicename,
              isSelected: false,
              isOnline: isOnline,
              deviceid: device.deviceid,
              simnum: device.simnum,
              devicetype: device.devicetype
            }
            if (device.deviceid == store.currentDeviceId) {
              groupData.expand = true;
              dev.isSelected = true;
            }
            if (!isOnline) {
              groupData.children.push(dev);
            };
          })

          if (groupData.children.length) {
            if (groupData.title == '默认组') {
              if (groupData.children.length) {
                me.currentStateData.unshift(groupData);
              };
            } else {
              if (groupData.children.length) {
                me.currentStateData.push(groupData);
              };
            };
            groupData.title += '(' + groupData.children.length + ')'
          };
        });
      },
      getIsOnline: function (deviceid) {
        var me = this
        var isOnline = false
        me.records.forEach(function (record) {
          if (record !== null) {
            if (deviceid == record.deviceid) {
              var arrivedtime = record.arrivedtime;
              var currentTime = new Date().getTime();
              if (currentTime - arrivedtime < me.offlineTime) {
                isOnline = true;
              };
            };
          };
        });
        return isOnline;
      },
      setIntervalReqRecords: function () {
        var me = this
        this.intervalInstanse = setInterval(function () {
          me.intervalTime--
          if (me.intervalTime <= 0) {
            me.intervalTime = Number(store.intervalTime)
            var devIdList = Object.keys(me.$store.state.deviceInfos)
            me.getLastPosition(devIdList, function (resp) {
              if (resp.records) {
                var newRecord = [];
                resp.records.forEach(function (record) {
                  if (record) {
                    var isOnline = Date.now() - record.arrivedtime < me.offlineTime ? true : false;
                    var iconState = null;
                    var angle = utils.getAngle(record.course);

                    iconState = new BMap.Icon(
                      utils.getDirectionImage(isOnline, angle),
                      new BMap.Size(17, 17),
                      { imageOffset: new BMap.Size(0, 0) }
                    );

                    record.icon = iconState;
                    var lng_lat = wgs84tobd09(record.callon, record.callat);
                    record.point = new BMap.Point(lng_lat[0], lng_lat[1]);
                    newRecord.push(record);
                  }
                });
                me.records = newRecord;
                me.updateTreeOnlineState();
                me.moveMarkers();
              }
            })
          }
        }, 1000);
      },
      moveMarkers: function () {
        var me = this;
        var markers = this.map.getOverlays();
        markers.forEach(function (marker) {
          var deviceid = marker.deviceid;
          if (deviceid) {
            me.records.forEach(function (record) {
              if (record) {
                if (deviceid === record.deviceid) {
                  marker.setPosition(record.point);
                  marker.setIcon(record.icon);
                  if (deviceid == store.currentDeviceId) {
                    me.isMoveTriggerEvent = false;
                    // var infoWindow = me.getInfoWindow(record);
                    // marker.openInfoWindow(infoWindow, record.point);
                    if (me.infoWindowInstance) {
                      if (me.infoWindowInstance.isOpen()) {
                        var content = me.getWindowContent(record);
                        me.infoWindowInstance.setContent(content);
                        me.infoWindowInstance.redraw();  //重画
                      }
                    };
                  };
                };
              };
            });
          };
        });
      },
      setCarIconState: function () {
        var me = this
        this.records.forEach(function (record) {
          // 如果是null 返回;
          if (record == null) {
            return;
          }
          var isOnline =
            Date.now() - record.arrivedtime < me.offlineTime ? true : false
          var iconState = null;

          var angle = utils.getAngle(record.course);

          iconState = new BMap.Icon(
            utils.getDirectionImage(isOnline, angle),
            new BMap.Size(17, 17),
            { imageOffset: new BMap.Size(0, 0) }
          );

          record.icon = iconState;
        })
      }
    },
    computed: {
      username: function () {
        return Cookies.get('name')
      }
    },
    watch: {
      filterData: function () {
        if (this.filterData.length) {
          this.isShowMatchDev = true
        } else {
          this.isShowMatchDev = false
        }
      },
      currentDeviceType: function () {
        var allCmdList = this.$store.state.allCmdList
        var directiveList = []
        var type = this.currentDeviceType
        allCmdList.forEach(function (cmd) {
          if (cmd.devicetype == type) {
            directiveList.push(cmd);
          } else if (cmd.common == 1) {
            directiveList.push(cmd);
          }
        })

        directiveList.sort(function (a, b) {
          return a.cmdlevel > b.cmdlevel;
        });
        // console.log("currentDevDirectiveList-- ", directiveList);
        this.currentDevDirectiveList = directiveList;
      },
      records: function () {
        var online = 0;
        var offline = 0;
        var me = this;
        var deviceIds = Object.keys(me.$store.state.deviceInfos);

        if (this.records.length === deviceIds.length) {
          this.records.forEach(function (record) {
            if (record !== null) {
              var arrivedtime = record.arrivedtime;
              var currentTime = new Date().getTime();
              if (currentTime - arrivedtime < me.offlineTime) {
                online++;
              } else {
                offline++;
              };
            } else {
              offline++;
            };
          });
          this.offlineDevCount = offline;
          this.onlineDevCount = online;
        } else if (this.records.length === 0) {
          this.offlineDevCount = deviceIds.length;
          this.onlineDevCount = 0;
        } else {
          offline += deviceIds.length - this.records.length;
          this.records.forEach(function (record) {
            if (record !== null) {
              var arrivedtime = record.arrivedtime;
              var currentTime = new Date().getTime();
              if (currentTime - arrivedtime < me.offlineTime) {
                online++;
              } else {
                offline++;
              }
            } else {
              offline++;
            }
          })
          this.offlineDevCount = offline;
          this.onlineDevCount = online;
        }

        this.allDevCount = deviceIds.length
      },
      selectedState: function () {
        var me = this
        if (this.isShowConpanyName && this.companys.length == 0) {
          this.queryCompanyTree(function (response) {
            me.companys = response.companys
            me.getCurrentStateTreeData(me.selectedState, me.isShowConpanyName)
          })
        } else {
          this.getCurrentStateTreeData(
            this.selectedState,
            this.isShowConpanyName
          )
        }
      },
      isShowConpanyName: function () {
        var me = this
        if (this.isShowConpanyName) {
          // if(me.groups[0] && me.groups[0].companyid ){
          //     me.getCurrentStateTreeData(me.selectedState,me.isShowConpanyName);
          // }else{
          this.getMonitorListByUser(1, function (resp) {
            me.groups = resp.groups
            me.queryCompanyTree(function (response) {
              me.companys = response.companys
              me.getCurrentStateTreeData(me.selectedState, me.isShowConpanyName)
            })
          })
          // }
        } else {
          this.getCurrentStateTreeData(
            this.selectedState,
            this.isShowConpanyName
          )
        }
      }
    },
    mounted: function () {
      var me = this;
      var havecompany = this.isShowConpanyName == true ? 1 : 0;
      this.intervalTime = Number(store.intervalTime);
      this.initMap();
      // this.initWebSocket();
      this.getMonitorListByUser(havecompany, function (resp) {
        me.groups = resp.groups;
        me.setDeviceIdsList(resp.groups);
        var devIdList = Object.keys(me.$store.state.deviceInfos)
        me.getLastPosition(devIdList, function (resp) {
          if (resp.records) {
            var newRecords = [];
            resp.records.forEach((item) => {
              if (item) {
                newRecords.push(item);
              }
            })
            me.records = newRecords;
          } else {
            me.records = [];
          }
          me.setCarIconState();
          var range = utils.getDisplayRange(me.map.getZoom());
          if (resp.records) {
            if (resp.records.length > 300) {
              var filterArr = me.filterReocrds(range, resp.records);
              me.addOverlayToMap(filterArr);
            } else {
              me.addOverlayToMap(resp.records);
            };
          };
          me.selectedState = 'all';
        })
      });
      this.setIntervalReqRecords();
      communicate.$on("positionlast", this.handleWebSocket);
    },
    beforeDestroy: function () {
      store.currentDeviceId = null;
      store.currentDeviceRecord = {};
      clearInterval(this.intervalInstanse);
      communicate.$off('positionlast', this.handleWebSocket);
      if (this.myDis != null) {
        this.myDis.close();
      };
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
                        strstate: msgTiem.content,
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
                key: 'strstate',
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
      lockReconnect: false
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
      initWebSocket: function () {
        var me = this;
        if ('WebSocket' in window) {
          ws = new WebSocket(wsHost);
        } else if ('MozWebSocket' in window) {
          ws = new MozWebSocket(wsHost);
        } else {
          alert("您的浏览器不支持WebSocket!");
          return;
        };

        ws.onclose = function () { };
        ws.onerror = function () {
          console.log("llws连接错误!" + new Date().toUTCString());
          me.reconnectWs();
        };
        ws.onopen = function () {
          var user = "online" + Cookies.get('name');
          console.log('ws连接成功', user);
          ws.send(user);
        };
        ws.onmessage = function (event) {
          var resp = JSON.parse(event.data);
          var action = resp.action;
          if (action === "remindmsg") {
            var data = resp.remindMsg;
            communicate.$emit("remindmsg", data);
          } else if (action === "positionlast") {
            var data = resp.positionLast;
            communicate.$emit("positionlast", data);
          };
        };
      },
      reconnectWs: function (url) {
        var me = this;
        if (me.lockReconnect) return;
        me.lockReconnect = true;
        setTimeout(function () {
          console.log("ws重连!" + new Date().toUTCString());
          me.initWebSocket();
          me.lockReconnect = false;
        }, 2000);
      },
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
      this.initWebSocket();   // 连接webSocket
      vueInstanse = this;     // 备份monitor实例
    }
  });
})();
