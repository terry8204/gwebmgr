/*
 * 所有的urls
 */
var pathname = location.pathname;
var host = null;
var wsHost = null;
if (pathname.indexOf('gpsserver') != -1) {
  host = 'http://localhost:8080/gpsserver/';
  wsHost = "ws://localhost:90";
} else {
  host = 'http://112.74.186.169/';
  wsHost = "ws://112.74.186.169:90";
}

var myUrls = {
  host: host,
  login: function () {
    return this.host + 'webapi?action=login'
  },
  logout: function () {
    return this.host + 'webapi?action=logout&token=' + token
  },
  queryUserTypeDescr: function () {
    return this.host + 'webapi?action=queryusertypedescr&token=' + token;
  },
  queryCommonCmd: function () {
    return this.host + 'webapi?action=querycommoncmd&token=' + token;
  },
  queryUserTypeByUser: function () {
    return this.host + 'webapi?action=queryusertypebyuser&token=' + token
  },
  changeUserPass: function () {
    return this.host + 'webapi?action=changeuserpass&token=' + token
  },
  queryUserType: function () {
    return this.host + 'webapi?action=queryusertype&token=' + token
  },
  addCompany: function () {
    return this.host + 'webapi?action=addcompany&token=' + token
  },
  deleteCompany: function () {
    return this.host + 'webapi?action=deletecompany&token=' + token
  },
  editCompany: function () {
    return this.host + 'webapi?action=editcompany&token=' + token
  },
  queryCompanyByCreater: function () {
    return this.host + 'webapi?action=querycompanysbyuser&token=' + token
  },
  queryCompanyByIds: function () {
    return this.host + 'webapi?action=querycompanybyids&token=' + token
  },
  // queryCompanyById: function () {
  //   return this.host + 'webapi?action=querycompanybyid&token=' + token
  // },
  addGroup: function () {
    return this.host + 'webapi?action=addgroup&token=' + token
  },
  deleteGroup: function () {
    return this.host + 'webapi?action=deletegroup&token=' + token
  },
  editGroup: function () {
    return this.host + 'webapi?action=editgroup&token=' + token
  },
  editGroupMonitor: function () {
    return this.host + 'webapi?action=editgroupmonitor&token=' + token
  },
  queryGroupByUser: function () {
    return this.host + 'webapi?action=queryallgroups&token=' + token
  },
  addUser: function () {
    return this.host + 'webapi?action=adduser&token=' + token
  },
  queryCompanyGroup: function () {
    return this.host + 'webapi?action=querycompanygroup&token=' + token
  },
  queryUser: function () {
    return this.host + 'webapi?action=queryuserlist&token=' + token
  },
  resetUserLoginPwd: function () {
    return this.host + 'webapi?action=resetuserpwd&token=' + token
  },
  delUser: function () {
    return this.host + 'webapi?action=deleteuser&token=' + token
  },
  editUser: function () {
    return this.host + 'webapi?action=edituser&token=' + token
  },
  //编辑用户设备指令密码
  editUserDeviceCmdPwd: function () {
    return this.host + 'webapi?action=edituserdevicecmdpwd&token=' + token
  },
  addDevice: function () {
    return this.host + 'webapi?action=adddevice&token=' + token
  },
  queryDeviceInfo: function () {
    return this.host + 'webapi?action=deviceinfo&token=' + token
  },
  editDevice: function () {
    return this.host + 'webapi?action=editdevice&token=' + token
  },
  editDeviceSimple: function () {
    return this.host + 'webapi?action=editdevicesimple&token=' + token
  },
  deleteDevice: function () {
    return this.host + 'webapi?action=deletedevice&token=' + token
  },
  queryDeviceById: function () {
    return this.host + 'webapi?action=querydevicebyid&token=' + token
  },
  queryDeviceListWithGroupInfo: function () {
    return this.host + 'webapi?action=querydevicelistwithgroupinfo&token=' + token
  },
  resetDeviceLoginPwd: function () {
    return this.host + 'webapi?action=resetdeviceloginpwd&token=' + token
  },
  // 监控页面url
  monitorListByUser: function () {
    return this.host + 'webapi?action=querymonitorlist&token=' + token
  },
  queryCompanyTree: function () {
    return this.host + 'webapi?action=querycompanys&token=' + token
  },
  lastPosition: function () {
    return this.host + 'webapi?action=lastposition&token=' + token
  },
  // 查询轨迹
  queryTracks: function (token) {
    return this.host + 'webapi?action=querytracks&token=' + token
  },
  // 查询报警信息
  queryAlarm: function () {
    return this.host + 'webapi?action=queryalarm&token=' + token
  },
  queryMsg: function () {
    return this.host + 'webapi?action=querymsg&token=' + token
  },
  //处理报警
  disposeAlarm: function (param) {
    return this.host + 'webapi?action=disposealarm&token=' + token
  },
  // 下发命令
  sendCmd: function (param) {
    return this.host + 'webapi?action=sendcmd&token=' + token
  },
  queryAlarmDescr: function () {
    return this.host + 'webapi?action=queryalarmdescr&token=' + token
  },
  // 系统参数  车辆
  addVehicleType: function () {
    return this.host + 'webapi?action=addvehicletype&token=' + token
  },
  deleteVehicleType: function () {
    return this.host + 'webapi?action=deletevehicletype&token=' + token
  },
  pageQueryVehicleType: function () {
    return this.host + 'webapi?action=queryvehicletypes&token=' + token
  },
  editVehicleType: function () {
    return this.host + 'webapi?action=editvehicletype&token=' + token
  },
  // 设备指令
  queryCmd: function () {
    return this.host + 'webapi?action=queryallcmd&token=' + token
  },
  addCmd: function () {
    return this.host + 'webapi?action=addcmd&token=' + token
  },
  deleteCmd: function () {
    return this.host + 'webapi?action=deletecmd&token=' + token
  },
  editCmd: function () {
    return this.host + 'webapi?action=editcmd&token=' + token
  },
  // 设备类型
  pageQueryDeviceType: function () {
    return this.host + 'webapi?action=queryalldevicetypeinsystem&token=' + token
  },
  queryDeviceTypeByUser: function () {
    return this.host + 'webapi?action=querydevicetypeownerbyuser&token=' + token
  },
  addDeviceType: function () {
    return this.host + 'webapi?action=adddevicetype&token=' + token
  },
  deleteDeviceType: function () {
    return this.host + 'webapi?action=deletedevicetype&token=' + token
  },
  editDeviceTypeCmd: function () {
    return this.host + 'webapi?action=editdevicetypecmd&token=' + token
  },
  editDeviceType: function () {
    return this.host + 'webapi?action=editdevicetype&token=' + token
  },
  queryDeviceTypeHadCmd: function () {
    return this.host + 'webapi?action=querydevicetypewithcmd&token=' + token
  },
  editDeviceTypeCmd: function () {
    return this.host + 'webapi?action=editdevicetypecmd&token=' + token
  },
  updateDeviceTypeCmd: function () {
    return this.host + 'webapi?action=updatedevicetypecmd&token=' + token
  },
  //查询用户所有有的设备指令
  queryAllDeviceCmdByUser: function () {
    return this.host + 'webapi?action=queryalldevicecmdbyuser&token=' + token
  },
  //查询用户已拥有的设备指令
  queryHadDeviceCmdByUser: function () {
    return this.host + 'webapi?action=queryhaddevicecmdbyuser&token=' + token
  },
  //查询用户所有设备类型详细
  queryAllDeviceTypeByUser: function () {
    return this.host + 'webapi?action=queryalldevicetypeinsystem&token=' + token;
  },
  // 编辑用户设备指令
  editUserDeviceCmd: function () {
    return this.host + 'webapi?action=edituserdevicecmd&token=' + token;
  },
  // 查询指令列表
  listCmdAction: function () {
    return this.host + 'webapi?action=listcmdaction&token=' + token;
  },
  // 查询设备基本信息
  queryDeviceBaseInfo: function () {
    return this.host + 'webapi?action=querydeviceinfo&token=' + token;
  },
  //设置电子围栏
  setGeofence: function () {
    return this.host + 'webapi?action=setgeofence&token=' + token;
  },
  //取消电子围栏
  unSetGeofence: function () {
    return this.host + 'webapi?action=unsetgeofence&token=' + token;
  },
  // 查询设备类型code
  listDeviceTypeCode: function () {
    return this.host + 'webapi?action=listprotocoltypecode&token=' + token;
  },
  // 刷新设备位置最新信息
  refreshPostion: function () {
    return this.host + 'webapi?action=refreshpostion&token=' + token;
  },
  // 报表 ----------------------------------------------------------------------------------------------
  reportCmd: function () {
    return this.host + 'webapi?action=reportcmd&token=' + token;
  }
}

// global var
var vueInstanse = null // 全局vue实例子
var editObject = null // 要编辑客户的对象
var customersList = null // 缓存客户列表
var groupsList = null // 缓存分组列表
var vstore = null // store
var ws = null; // webSocket
/* 
 * 系统管理员 admin       123456
 * 一级管理员 yijimgr     123456
 * 二级管理员 erjimgr     123456
 * 普通监控员 xiaoxu      123456
 * 设备账号   13128804768 123456  
 */
