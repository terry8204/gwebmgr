/*
 * 所有的urls
 */
var isNeedTalk = true;
var wsHost = null;
var viewhost = null;
var viewhosts = null;
var apihost = null;
var apihosts = null;

var ishttps = 'https:' == document.location.protocol ? true : false;
var lastIndex = location.pathname.lastIndexOf("/");
var path = location.pathname.substr(0, lastIndex);

viewhost = location.protocol + "//" + location.host + path + "/";

if (location.hostname.indexOf('localhost') != -1 || location.hostname.indexOf('127.0.0.1') != -1) {
    viewhosts = viewhost;
    if (location.pathname.indexOf("gpsserver") != -1) {
        apihost = viewhost;
        apihosts = viewhosts;
    } else {
        apihost = 'https://www.gps51.com/';
        apihosts = 'https://www.gps51.com/';
    }
    wsHost = "ws://localhost:90";
} else {
    if (isNeedTalk == true) {
        viewhosts = "https://" + location.host + path + "/";
    } else {
        viewhosts = "http://" + location.host + path + "/";
    }
    apihost = 'https://www.gps51.com/';
    apihosts = 'https://www.gps51.com/';
    wsHost = "wss://www.gps51.com/wss";
}

// 百度和谷歌地图的key;
var baiduMapKey = "e7SC5rvmn2FsRNE4R1ygg44n";
var googleMapKey = "AIzaSyDXQKVS1Tdp3VlrzBsZbBlLj_uYHVDHe6M";


var myUrls = {
    apihost: apihost,
    apihosts: apihosts,
    viewhost: viewhost,
    viewhosts: viewhosts,
    login: function() {
        return this.apihost + 'webapi?action=login'
    },
    logout: function() {
        return this.apihost + 'webapi?action=logout&token=' + token
    },
    editMyInfo: function() {
        return this.apihost + 'webapi?action=editmyinfo&token=' + token
    },
    queryUserTypeDescr: function() {
        return this.apihost + 'webapi?action=queryusertypedescr&token=' + token;
    },
    queryCommonCmd: function() {
        return this.apihost + 'webapi?action=querycommoncmd&token=' + token;
    },
    queryUserTypeByUser: function() {
        return this.apihost + 'webapi?action=queryusertypebyuser&token=' + token
    },
    changeUserPass: function() {
        return this.apihost + 'webapi?action=changeuserpass&token=' + token
    },
    queryUserType: function() {
        return this.apihost + 'webapi?action=queryusertype&token=' + token
    },
    addCompany: function() {
        return this.apihost + 'webapi?action=addcompany&token=' + token
    },
    deleteCompany: function() {
        return this.apihost + 'webapi?action=deletecompany&token=' + token
    },
    editCompany: function() {
        return this.apihost + 'webapi?action=editcompany&token=' + token
    },
    queryCompanyByCreater: function() {
        return this.apihost + 'webapi?action=querycompanysbyuser&token=' + token
    },
    queryCompanyByIds: function() {
        return this.apihost + 'webapi?action=querycompanybyids&token=' + token
    },
    // queryCompanyById: function () {
    //   return this.apihost + 'webapi?action=querycompanybyid&token=' + token
    // },
    addGroup: function() {
        return this.apihost + 'webapi?action=addgroup&token=' + token
    },
    deleteGroup: function() {
        return this.apihost + 'webapi?action=deletegroup&token=' + token
    },
    editGroup: function() {
        return this.apihost + 'webapi?action=editgroup&token=' + token
    },
    editGroupMonitor: function() {
        return this.apihost + 'webapi?action=editgroupmonitor&token=' + token
    },
    queryGroupByUser: function() {
        return this.apihost + 'webapi?action=queryallgroups&token=' + token
    },
    addUser: function() {
        return this.apihost + 'webapi?action=adduser&token=' + token
    },
    queryCompanyGroup: function() {
        return this.apihost + 'webapi?action=querycompanygroup&token=' + token
    },
    queryUser: function() {
        return this.apihost + 'webapi?action=queryuserlist&token=' + token
    },
    querySubUserNameList: function() {
        return this.apihost + 'webapi?action=querysubusernamelist&token=' + token
    },
    resetUserLoginPwd: function() {
        return this.apihost + 'webapi?action=resetuserpwd&token=' + token
    },
    delUser: function() {
        return this.apihost + 'webapi?action=deleteuser&token=' + token
    },
    editUser: function() {
        return this.apihost + 'webapi?action=edituser&token=' + token
    },
    //编辑用户设备指令密码
    editUserDeviceCmdPwd: function() {
        return this.apihost + 'webapi?action=edituserdevicecmdpwd&token=' + token
    },
    addDevice: function() {
        return this.apihost + 'webapi?action=adddevice&token=' + token
    },
    addDevices: function() {
        return this.apihost + 'webapi?action=adddevices&token=' + token
    },
    queryDeviceInfo: function() {
        return this.apihost + 'webapi?action=deviceinfo&token=' + token
    },
    editDevice: function() {
        return this.apihost + 'webapi?action=editdevice&token=' + token
    },
    editDeviceSimple: function() {
        return this.apihost + 'webapi?action=editdevicesimple&token=' + token
    },
    deleteDevice: function() {
        return this.apihost + 'webapi?action=deletedevice&token=' + token
    },
    queryDeviceById: function() {
        return this.apihosts + 'webapi?action=querydevicebyid&token=' + token
    },
    queryDeviceListWithGroupInfo: function() {
        return this.apihost + 'webapi?action=querydevicelistwithgroupinfo&token=' + token
    },
    resetDeviceLoginPwd: function() {
        return this.apihost + 'webapi?action=resetdeviceloginpwd&token=' + token
    },

    // 监控页面url
    monitorListByUser: function() {
        return this.apihost + 'webapi?action=querymonitorlist&token=' + token
    },
    queryCompanyTree: function() {
        return this.apihost + 'webapi?action=querycompanys&token=' + token
    },
    lastPosition: function() {
        return this.apihost + 'webapi?action=lastposition&token=' + token
    },
    shareTrackLastPosition: function() {
        return this.apihost + 'webapi?action=sharetracklastposition'
    },
    // 查询轨迹
    queryTracks: function() {
        return this.apihost + 'webapi?action=querytracks&token=' + token
    },
    // 查询报警信息
    queryAlarm: function() {
        return this.apihost + 'webapi?action=queryalarm&token=' + token
    },
    queryMsg: function() {
        return this.apihost + 'webapi?action=querymsg&token=' + token
    },
    deleteMsg: function() {
        return this.apihost + 'webapi?action=deletemsg&token=' + token
    },
    //处理报警
    disposeAlarm: function(param) {
        return this.apihost + 'webapi?action=disposealarm&token=' + token
    },
    // 下发命令
    sendCmd: function(param) {
        return this.apihost + 'webapi?action=sendcmd&token=' + token
    },
    queryAlarmDescr: function() {
        return this.apihost + 'webapi?action=queryalarmdescr&token=' + token
    },
    // 系统参数  车辆
    addVehicleType: function() {
        return this.apihost + 'webapi?action=addvehicletype&token=' + token
    },
    deleteVehicleType: function() {
        return this.apihost + 'webapi?action=deletevehicletype&token=' + token
    },
    pageQueryVehicleType: function() {
        return this.apihost + 'webapi?action=queryvehicletypes&token=' + token
    },
    editVehicleType: function() {
        return this.apihost + 'webapi?action=editvehicletype&token=' + token
    },
    // 设备指令
    queryCmd: function() {
        return this.apihost + 'webapi?action=queryallcmd&token=' + token
    },
    addCmd: function() {
        return this.apihost + 'webapi?action=addcmd&token=' + token
    },
    deleteCmd: function() {
        return this.apihost + 'webapi?action=deletecmd&token=' + token
    },
    editCmd: function() {
        return this.apihost + 'webapi?action=editcmd&token=' + token
    },
    // 设备类型
    queryDeviceTypeByUser: function() {
        return this.apihost + 'webapi?action=querydevicetypeownerbyuser&token=' + token
    },
    addDeviceType: function() {
        return this.apihost + 'webapi?action=adddevicetype&token=' + token
    },
    deleteDeviceType: function() {
        return this.apihost + 'webapi?action=deletedevicetype&token=' + token
    },
    editDeviceTypeCmd: function() {
        return this.apihost + 'webapi?action=editdevicetypecmd&token=' + token
    },
    editDeviceType: function() {
        return this.apihost + 'webapi?action=editdevicetype&token=' + token
    },
    queryDeviceTypeHadCmd: function() {
        return this.apihost + 'webapi?action=querydevicetypewithcmd&token=' + token
    },
    editDeviceTypeCmd: function() {
        return this.apihost + 'webapi?action=editdevicetypecmd&token=' + token
    },
    updateDeviceTypeCmd: function() {
        return this.apihost + 'webapi?action=updatedevicetypecmd&token=' + token
    },
    //查询用户所有有的设备指令
    queryAllDeviceCmdByUser: function() {
        return this.apihost + 'webapi?action=queryalldevicecmdbyuser&token=' + token
    },
    //查询用户已拥有的设备指令
    queryHadDeviceCmdByUser: function() {
        return this.apihost + 'webapi?action=queryhaddevicecmdbyuser&token=' + token
    },
    //查询用户所有设备类型详细
    queryAllDeviceTypeByUser: function() {
        return this.apihost + 'webapi?action=queryalldevicetypeinsystem&token=' + token;
    },
    // 编辑用户设备指令
    editUserDeviceCmd: function() {
        return this.apihost + 'webapi?action=edituserdevicecmd&token=' + token;
    },
    // 查询指令列表
    listCmdAction: function() {
        return this.apihost + 'webapi?action=listcmdaction&token=' + token;
    },
    // 查询设备基本信息
    queryDeviceBaseInfo: function() {
        return this.apihost + 'webapi?action=querydeviceinfo&token=' + token;
    },
    //设置电子围栏
    setGeofence: function() {
        return this.apihost + 'webapi?action=setgeofence&token=' + token;
    },
    //取消电子围栏
    unSetGeofence: function() {
        return this.apihost + 'webapi?action=unsetgeofence&token=' + token;
    },
    // 查询设备类型code
    listDeviceTypeCode: function() {
        return this.apihost + 'webapi?action=listprotocoltypecode&token=' + token;
    },
    // 刷新设备位置最新信息
    refreshPostion: function() {
        return this.apihost + 'webapi?action=refreshpostion&token=' + token;
    },
    // 查询已经发送的指令
    queryAllCmdRecords: function() {
        return this.apihost + 'webapi?action=queryallcmdrecords&token=' + token;
    },
    // 取消缓存发送的设备指令
    deleteCacheCmd: function() {
        return this.apihost + 'webapi?action=deletecachecmd&token=' + token;
    },
    // 报表 ----------------------------------------------------------------------------------------------
    reportCmd: function() {
        return this.apihost + 'webapi?action=reportcmd&token=' + token;
    },
    queryTrackDetail: function() {
        return this.apihost + 'webapi?action=querytrackdetail&token=' + token;
    },
    refreshTrackPosition: function() {
        return this.apihost + 'webapi?action=refreshtrackposition&token=' + token;
    },
    //查询所有的报警信息
    reportAlarm: function() {
        return this.apihost + 'webapi?action=reportalarm&token=' + token;
    },
    // 查询里程报表
    reportMileageSummary: function() {
        return this.apihost + 'webapi?action=reportmileagesummary&token=' + token;
    },
    // 里程细节
    reportMileageDetail: function() {
        return this.apihost + 'webapi?action=reportmileagedetail&token=' + token;
    },
    // 查询微信报警记录
    queryWechatAlarm: function() {
        return this.apihost + 'webapi?action=querywechatalarm&token=' + token;
    },
    // 停留报表
    reportParkDetail: function() {
        return this.apihost + 'webapi?action=reportparkdetail&token=' + token;
    },
    // acc报表
    reportAcc: function() {
        return this.apihost + 'webapi?action=reportacc&token=' + token;
    },
    // acc报表
    reportAccs: function() {
        return this.apihost + 'webapi?action=reportaccs&token=' + token;
    },
    queryMedia: function() {
        return this.apihost + 'webapi?action=querymedia&token=' + token;
    },
    readMedia: function() {
        return this.apihost + 'webapi?action=readmedia&token=' + token;
    },
    recordAudio: function() {
        return this.apihost + 'webapi?action=recordaudio&token=' + token;
    },
    reportAudio: function() {
        return this.apihost + 'webapi?action=reportaudio&token=' + token;
    },
    cleanHistoryData: function() {
        return this.apihost + 'webapi?action=cleanhistorydata&token=' + token;
    },
    queryDeviceSettings: function() {
        return this.apihost + 'webapi?action=querydevicesettings&token=' + token;
    },
    deleteAudio: function() {
        return this.apihost + 'webapi?action=deleteaudio&token=' + token;
    },
    fixTotalDistance: function() {
        return this.apihost + 'webapi?action=fixtotaldistance&token=' + token;
    },
    reportLoginLog: function() {
        return this.apihost + 'webapi?action=reportloginlog&token=' + token;
    },
    // 查询服务器配置
    queryServerConfig: function() {
        return this.apihost + 'webapi?action=queryserverconfig&token=' + token;
    },
    addServerConfig: function() {
        return this.apihost + 'webapi?action=addserverconfig&token=' + token;
    },
    deleteServerConfig: function() {
        return this.apihost + 'webapi?action=deleteserverconfig&token=' + token;
    },
    editServerConfig: function() {
        return this.apihost + 'webapi?action=editserverconfig&token=' + token;
    },
    queryCallAlarm: function() {
        return this.apihost + 'webapi?action=querycallalarm&token=' + token;
    },
    reportChargeCall: function() {
        return this.apihost + 'webapi?action=reportchargecall&token=' + token;
    },
    editDevicesForwardUrl: function() {
        return this.apihost + 'webapi?action=editdevicesforwardurl&token=' + token;
    },
    queryInsures: function() {
        return this.apihost + 'webapi?action=queryinsures&token=' + token;
    },
    queryBmsInfo: function() {
        return this.apihost + 'webapi?action=querybmsinfo&token=' + token;
    },
    queryObdInfo: function() {
        return this.apihost + 'webapi?action=queryobdinfo&token=' + token;
    },
    //复杂围栏
    addGeoRecord: function() {
        return this.apihost + 'webapi?action=addgeorecord&token=' + token;
    },
    queryGeoRecords: function() {
        return this.apihost + 'webapi?action=querygeorecords&token=' + token;
    },
    delGeoRecord: function() {
        return this.apihost + 'webapi?action=delgeorecord&token=' + token;
    },
    editGeoRecord: function() {
        return this.apihost + 'webapi?action=editgeorecord&token=' + token;
    },
    addGeoSystemCategory: function() {
        return this.apihost + 'webapi?action=addgeosystemcategory&token=' + token;
    },
    addGeoSystemRecord: function() {
        return this.apihost + 'webapi?action=addgeosystemrecord&token=' + token;
    },
    delGeoSystemCategory: function() {
        return this.apihost + 'webapi?action=delgeosystemcategory&token=' + token;
    },
    delGeoSystemRecord: function() {
        return this.apihost + 'webapi?action=delgeosystemrecord&token=' + token;
    },
    editGeoSystemCategory: function() {
        return this.apihost + 'webapi?action=editgeosystemcategory&token=' + token;
    },
    editGeoSystemRecord: function() {
        return this.apihost + 'webapi?action=editgeosystemrecord&token=' + token;
    },
    queryGeoSystemRecords: function() {
        return this.apihost + 'webapi?action=querygeosystemrecords&token=' + token;
    },
    queryWeightDynamic: function() {
        return this.apihost + 'webapi?action=queryweightdynamic&token=' + token;
    },
    querySystemMsg: function() {
        return this.apihost + 'webapi?action=querysystemmsg&token=' + token;
    },
    deleteSystemMsg: function() {
        return this.apihost + 'webapi?action=deletesystemmsg&token=' + token;
    },
    recallSystemMsg: function() {
        return this.apihost + 'webapi?action=recallsystemmsg&token=' + token;
    },
    sendSystemMsg: function() {
        return this.apihost + 'webapi?action=sendsystemmsg&token=' + token;
    },
    startVideos: function() {
        return this.apihosts + 'webapi?action=startvideos_sync&token=' + token;
    },
    startAudio: function() {
        return this.apihosts + 'webapi?action=startaudio_sync&token=' + token;
    },
    stopAudio: function() {
        return this.apihosts + 'webapi?action=stopaudio&token=' + token;
    },
    stopVideos: function() {
        return this.apihosts + 'webapi?action=stopvideos&token=' + token;
    },
    queryVideoProperty: function() {
        return this.apihosts + 'webapi?action=queryvideoproperty_sync&token=' + token;
    },
    queryVideosPlayUrl: function() {
        return this.apihosts + 'webapi?action=queryvideosplayurl&token=' + token;
    },
    queryClientParameters: function() {
        return this.apihosts + 'webapi?action=queryaudiovideoparameters_sync&token=' + token;
    },
    setAudioVideoParameters_Sync: function() {
        return this.apihosts + 'webapi?action=setaudiovideoparameters_sync&token=' + token;
    },
    setVideoPlayParameters: function() {
        return this.apihosts + 'webapi?action=setvideoplayparameters&token=' + token;
    },
    querySingleAudioVideoParameters: function() {
        return this.apihosts + 'webapi?action=querysingleaudiovideoparameters_sync&token=' + token;
    },
    setSingleAudioVideoParameters: function() {
        return this.apihosts + 'webapi?action=setsingleaudiovideoparameters_sync&token=' + token;
    },
    queryMediaList: function() {
        return this.apihosts + 'webapi?action=querymedialist_sync&token=' + token;
    },
    //视频回放
    playRecord: function() {
        return this.apihost + 'webapi?action=playrecord_sync&token=' + token;
    },
    playRecordControl: function() {
        return this.apihost + 'webapi?action=playrecordcontrol_sync&token=' + token;
    },
    queryAudioVideoChannels: function() {
        return this.apihosts + 'webapi?action=queryaudiovideochannels_sync&token=' + token;
    },
    uploadAudio: function() {
        return this.apihosts + 'webapi?action=uploadaudio&token=' + token;
    },
    reqUploadFile: function() {
        return this.apihosts + 'webapi?action=requploadfile&token=' + token;
    },
    queryDownloadTasks: function() {
        return this.apihosts + 'webapi?action=querydownloadtasks&token=' + token;
    },
    controlUploadFile: function() {
        return this.apihosts + 'webapi?action=controluploadfile_sync&token=' + token;
    },
    setImageQuality: function() {
        return this.apihosts + 'webapi?action=setimagequality&token=' + token;
    },
    queryActiveSafetyDeviceInfo: function() {
        return this.apihosts + 'webapi?action=queryactivesafetydeviceinfo_sync&token=' + token;
    },
    queryActiveSafetyTrack: function() {
        return this.apihosts + 'webapi?action=queryactivesafetytrack&token=' + token;
    },
    // 查询设备是否充值
    queryChargeDeviceList: function() {
        return this.apihosts + 'webapi?action=querychargedevicelist&token=' + token;
    },
    // 设备充值
    chargeDevices: function() {
        return this.apihosts + 'webapi?action=chargedevices&token=' + token;
    },
    // cc查询分组
    queryGroupsByUserName: function() {
        return this.apihosts + 'webapi?action=querygroupsbyusername&token=' + token;
    },
    // cc查询分组
    deleteDevices: function() {
        return this.apihosts + 'webapi?action=deletedevices&token=' + token;
    },
    // 查询 转移设备的 tree数据
    queryDevicesTree: function() {
        return this.apihosts + 'webapi?action=querydevicestree&token=' + token;
    },
    // 批量转移
    batchOperate: function() {
        return this.apihosts + 'webapi?action=batchoperate&token=' + token;
    },
    // 上线综合统计  
    reportOnlineSummary: function() {
        return this.apihosts + 'webapi?action=reportonlinesummary&token=' + token;
    },
    // 掉线报表  
    reportOffline: function() {
        return this.apihosts + 'webapi?action=reportoffline&token=' + token;
    },
    // 查询 queryuserstree
    queryUsersTree: function() {
        return this.apihosts + 'webapi?action=queryuserstree&token=' + token;
    },
    // 查询 日在线率
    reportDeviceOnlineDaily: function() {
        return this.apihosts + 'webapi?action=reportdeviceonlinedaily&token=' + token;
    },
    // 查询 日在线率
    reportGroupOnlineDaily: function() {
        return this.apihosts + 'webapi?action=reportgrouponlinedaily&token=' + token;
    },
    // 查询 日在线率
    reportDeviceOnlineMonth: function() {
        return this.apihosts + 'webapi?action=reportdeviceonlinemonth&token=' + token;
    },
    // 导入车主信息
    importOwnerInfo: function() {
        return this.apihosts + 'webapi?action=importownerinfo&token=' + token;
    },
    // 查询车主信息
    queryDeviceex: function() {
        return this.apihosts + 'webapi?action=querydeviceex&token=' + token;
    },
    // 编辑车主信息
    editDeviceex: function() {
        return this.apihosts + 'webapi?action=editdeviceex&token=' + token;
    },
    // 导入保险信息
    importInsureInfo: function() {
        return this.apihosts + 'webapi?action=importinsureinfo&token=' + token;
    },
    // 导入保单信息
    importPolicynos: function() {
        return this.apihosts + 'webapi?action=importpolicynos&token=' + token;
    },
    // 导入SIM卡信息
    importSimInfo: function() {
        return this.apihosts + 'webapi?action=importsiminfo&token=' + token;
    },
    // 导入设备名称
    importRename: function() {
        return this.apihosts + 'webapi?action=importrename&token=' + token;
    },
    queryVideoPlayParameters: function() {
        return this.apihosts + 'webapi?action=queryvideoplayparameters&token=' + token;
    },
    // deleteinsure
    deleteInsure: function() {
        return this.apihosts + 'webapi?action=deleteinsure&token=' + token;
    },
    editInsure: function() {
        return this.apihosts + 'webapi?action=editinsure&token=' + token;
    },
    queryAllSubgroups: function() {
        return this.apihosts + 'webapi?action=queryallsubgroups&token=' + token;
    },
    importOfflineInsureInfo: function() {
        return this.apihosts + 'webapi?action=importofflineinsureinfo&token=' + token;
    },
    reportInsure: function() {
        return this.apihosts + 'webapi?action=reportinsure&token=' + token;
    },
    reportOilTime: function() {
        return this.apihosts + 'webapi?action=reportoiltime&token=' + token;
    },
    queryOilDetectors: function() {
        return this.apihosts + 'webapi?action=queryoildetectors&token=' + token;
    },
    saveOilDetectors: function() {
        return this.apihosts + 'webapi?action=saveoildetectors&token=' + token;
    },
    reportOilDaily: function() {
        return this.apihosts + 'webapi?action=reportoildaily&token=' + token;
    },
    reportOilRecord: function() {
        return this.apihosts + 'webapi?action=reportoilrecord&token=' + token;
    },
    getCardInfo: function(action) {
        return this.apihosts + 'webapi?action=' + action + '&token=' + token;
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


var CMD_SEND_RESULT_UNKONWN = -1; //未知错误
var CMD_SEND_RESULT_UNCONFIRM = 0; //发送成功，未收到确认
var CMD_SEND_RESULT_PASSWORD_ERROR = 1; //密码错误
var CMD_SEND_RESULT_OFFLINE_NOT_CACHE = 2; //设备离线，未缓存
var CMD_SEND_RESULT_OFFLINE_CACHED = 3; //设备离线，已缓存
var CMD_SEND_RESULT_MODIFY_DEFAULT_PASSWORD = 4; //需要修改默认密码
var CMD_SEND_RESULT_DETAIL_ERROR = 5; //发送错误，需要显示具体cause内容
var CMD_SEND_CONFIRMED = 6; //发送成功,并确认收到
var CMD_SEND_OVER_RETRY_TIMES = 7; //尝试发送3次失败
var CMD_SEND_SYNC_TIMEOUT = 8; //同步消息发送后超过6秒没收到回应