/*
 * 所有的urls
 */
var pathname = location.pathname;
var host = null;
var wsHost = null;
if (pathname.indexOf('gpsserver') != -1) {
  host = 'http://localhost:8080/gpsserver/';
  hosts = 'http://localhost:8080/gpsserver/';
  wsHost = "ws://localhost:90";
} else {
  // host = 'https://112.74.186.169/';
  host = 'https://www.gps51.com/';
  hosts = 'https://www.gps51.com/';
  wsHost = "wss://www.gps51.com/wss";
}


var myUrls = {
  host: host,
  hosts: hosts,
  login: function () {
    return this.host + 'webapi?action=login'
  },
  logout: function () {
    return this.host + 'webapi?action=logout&token=' + token
  },
  editMyInfo: function () {
    return this.host + 'webapi?action=editmyinfo&token=' + token
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
  addDevices: function () {
    return this.host + 'webapi?action=adddevices&token=' + token
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
    return this.hosts + 'webapi?action=querydevicebyid&token=' + token
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
  shareTrackLastPosition: function () {
    return this.host + 'webapi?action=sharetracklastposition'
  },
  // 查询轨迹
  queryTracks: function () {
    return this.host + 'webapi?action=querytracks&token=' + token
  },
  // 查询报警信息
  queryAlarm: function () {
    return this.host + 'webapi?action=queryalarm&token=' + token
  },
  queryMsg: function () {
    return this.host + 'webapi?action=querymsg&token=' + token
  },
  deleteMsg: function () {
    return this.host + 'webapi?action=deletemsg&token=' + token
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
  // 查询已经发送的指令
  queryAllCmdRecords: function () {
    return this.host + 'webapi?action=queryallcmdrecords&token=' + token;
  },
  // 取消缓存发送的设备指令
  deleteCacheCmd: function () {
    return this.host + 'webapi?action=deletecachecmd&token=' + token;
  },
  // 报表 ----------------------------------------------------------------------------------------------
  reportCmd: function () {
    return this.host + 'webapi?action=reportcmd&token=' + token;
  },
  queryTrackDetail: function () {
    return this.host + 'webapi?action=querytrackdetail&token=' + token;
  },
  refreshTrackPosition: function () {
    return this.host + 'webapi?action=refreshtrackposition&token=' + token;
  },
  //查询所有的报警信息
  reportAlarm: function () {
    return this.host + 'webapi?action=reportalarm&token=' + token;
  },
  // 查询里程报表
  reportMileageSummary: function () {
    return this.host + 'webapi?action=reportmileagesummary&token=' + token;
  },
  // 里程细节
  reportMileageDetail: function () {
    return this.host + 'webapi?action=reportmileagedetail&token=' + token;
  },
  // 查询微信报警记录
  queryWechatAlarm: function () {
    return this.host + 'webapi?action=querywechatalarm&token=' + token;
  },
  // 停留报表
  reportParkDetail: function () {
    return this.host + 'webapi?action=reportparkdetail&token=' + token;
  },
  // acc报表
  reportAcc: function () {
    return this.host + 'webapi?action=reportacc&token=' + token;
  },
  queryMedia: function () {
    return this.host + 'webapi?action=querymedia&token=' + token;
  },
  readMedia: function () {
    return this.host + 'webapi?action=readmedia&token=' + token;
  },
  recordAudio: function () {
    return this.host + 'webapi?action=recordaudio&token=' + token;
  },
  reportAudio: function () {
    return this.host + 'webapi?action=reportaudio&token=' + token;
  },
  cleanHistoryData: function () {
    return this.host + 'webapi?action=cleanhistorydata&token=' + token;
  },
  queryDeviceSettings: function () {
    return this.host + 'webapi?action=querydevicesettings&token=' + token;
  },
  deleteAudio: function () {
    return this.host + 'webapi?action=deleteaudio&token=' + token;
  },
  fixTotalDistance: function () {
    return this.host + 'webapi?action=fixtotaldistance&token=' + token;
  },
  reportLoginLog: function () {
    return this.host + 'webapi?action=reportloginlog&token=' + token;
  },
  // 查询服务器配置
  queryServerConfig: function () {
    return this.host + 'webapi?action=queryserverconfig&token=' + token;
  },
  addServerConfig: function () {
    return this.host + 'webapi?action=addserverconfig&token=' + token;
  },
  deleteServerConfig: function () {
    return this.host + 'webapi?action=deleteserverconfig&token=' + token;
  },
  editServerConfig: function () {
    return this.host + 'webapi?action=editserverconfig&token=' + token;
  },
  queryCallAlarm: function () {
    return this.host + 'webapi?action=querycallalarm&token=' + token;
  },
  reportChargeCall: function () {
    return this.host + 'webapi?action=reportchargecall&token=' + token;
  },
  editDevicesForwardUrl: function () {
    return this.host + 'webapi?action=editdevicesforwardurl&token=' + token;
  },
  queryInsures: function () {
    return this.host + 'webapi?action=queryinsures&token=' + token;
  },
  queryBmsInfo: function () {
    return this.host + 'webapi?action=querybmsinfo&token=' + token;
  },
  queryObdInfo: function () {
    return this.host + 'webapi?action=queryobdinfo&token=' + token;
  },
  //复杂围栏
  addGeoRecord: function () {
    return this.host + 'webapi?action=addgeorecord&token=' + token;
  },
  queryGeoRecords: function () {
    return this.host + 'webapi?action=querygeorecords&token=' + token;
  },
  delGeoRecord: function () {
    return this.host + 'webapi?action=delgeorecord&token=' + token;
  },
  editGeoRecord: function () {
    return this.host + 'webapi?action=editgeorecord&token=' + token;
  },
  addGeoSystemCategory: function () {
    return this.host + 'webapi?action=addgeosystemcategory&token=' + token;
  },
  addGeoSystemRecord: function () {
    return this.host + 'webapi?action=addgeosystemrecord&token=' + token;
  },
  delGeoSystemCategory: function () {
    return this.host + 'webapi?action=delgeosystemcategory&token=' + token;
  },
  delGeoSystemRecord: function () {
    return this.host + 'webapi?action=delgeosystemrecord&token=' + token;
  },
  editGeoSystemCategory: function () {
    return this.host + 'webapi?action=editgeosystemcategory&token=' + token;
  },
  editGeoSystemRecord: function () {
    return this.host + 'webapi?action=editgeosystemrecord&token=' + token;
  },
  queryGeoSystemRecords: function () {
    return this.host + 'webapi?action=querygeosystemrecords&token=' + token;
  },
  queryWeightDynamic: function () {
    return this.host + 'webapi?action=queryweightdynamic&token=' + token;
  },
  querySystemMsg: function () {
    return this.host + 'webapi?action=querysystemmsg&token=' + token;
  },
  deleteSystemMsg: function () {
    return this.host + 'webapi?action=deletesystemmsg&token=' + token;
  },
  recallSystemMsg: function () {
    return this.host + 'webapi?action=recallsystemmsg&token=' + token;
  },
  sendSystemMsg: function () {
    return this.host + 'webapi?action=sendsystemmsg&token=' + token;
  },
  startVideos: function () {
    return this.hosts + 'webapi?action=startvideos_sync&token=' + token;
  },
  startAudio: function () {
    return this.hosts + 'webapi?action=startaudio_sync&token=' + token;
  },
  stopAudio: function () {
    return this.hosts + 'webapi?action=stopaudio&token=' + token;
  },
  stopVideos: function () {
    return this.hosts + 'webapi?action=stopvideos&token=' + token;
  },
  queryVideoProperty: function () {
    return this.hosts + 'webapi?action=queryvideoproperty_sync&token=' + token;
  },
  queryVideosPlayUrl: function () {
    return this.hosts + 'webapi?action=queryvideosplayurl&token=' + token;
  },
  queryClientParameters: function () {
    return this.hosts + 'webapi?action=queryaudiovideoparameters_sync&token=' + token;
  },
  setAudioVideoParameters_Sync: function () {
    return this.hosts + 'webapi?action=setaudiovideoparameters_sync&token=' + token;
  },
  setVideoPlayParameters: function () {
    return this.hosts + 'webapi?action=setvideoplayparameters&token=' + token;
  },
  querySingleAudioVideoParameters: function () {
    return this.hosts + 'webapi?action=querysingleaudiovideoparameters_sync&token=' + token;
  },
  setSingleAudioVideoParameters: function () {
    return this.hosts + 'webapi?action=setsingleaudiovideoparameters_sync&token=' + token;
  },
  queryMediaList: function () {
    return this.hosts + 'webapi?action=querymedialist_sync&token=' + token;
  },
  //视频回放
  playRecord: function () {
    return this.host + 'webapi?action=playrecord_sync&token=' + token;
  },
  playRecordControl: function () {
    return this.host + 'webapi?action=playrecordcontrol_sync&token=' + token;
  },
  queryAudioVideoChannels: function () {
    return this.hosts + 'webapi?action=queryaudiovideochannels_sync&token=' + token;
  },
  uploadAudio: function () {
    return this.hosts + 'webapi?action=uploadaudio&token=' + token;
  },
  reqUploadFile: function () {
    return this.hosts + 'webapi?action=requploadfile&token=' + token;
  },
  queryDownloadTasks: function () {
    return this.hosts + 'webapi?action=querydownloadtasks&token=' + token;
  },
  controlUploadFile: function () {
    return this.hosts + 'webapi?action=controluploadfile_sync&token=' + token;
  },
  setImageQuality: function () {
    return this.hosts + 'webapi?action=setimagequality&token=' + token;
  },
  queryActiveSafetyDeviceInfo: function () {
    return this.hosts + 'webapi?action=queryactivesafetydeviceinfo_sync&token=' + token;
  },
  queryActiveSafetyTrack: function () {
    return this.hosts + 'webapi?action=queryactivesafetytrack&token=' + token;
  },
  queryChargeDeviceList: function () {
    return this.hosts + 'webapi?action=querychargedevicelist&token=' + token;
  },
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


var CMD_SEND_RESULT_UNKONWN = -1;                  //未知错误
var CMD_SEND_RESULT_UNCONFIRM = 0;                //发送成功，未收到确认
var CMD_SEND_RESULT_PASSWORD_ERROR = 1;           //密码错误
var CMD_SEND_RESULT_OFFLINE_NOT_CACHE = 2;        //设备离线，未缓存
var CMD_SEND_RESULT_OFFLINE_CACHED = 3;           //设备离线，已缓存
var CMD_SEND_RESULT_MODIFY_DEFAULT_PASSWORD = 4;  //需要修改默认密码
var CMD_SEND_RESULT_DETAIL_ERROR = 5;             //发送错误，需要显示具体cause内容
var CMD_SEND_CONFIRMED = 6;                       //发送成功,并确认收到
var CMD_SEND_OVER_RETRY_TIMES = 7;                //尝试发送3次失败
var CMD_SEND_SYNC_TIMEOUT = 8;                    //同步消息发送后超过6秒没收到回应