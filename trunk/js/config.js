/*
 * 所有的urls
 */
var isNeedTalk = document.location.protocol == "https:";
var wsHost = null;
var viewhost = null;
var viewhosts = null;
var apihost = null;
var apihosts = null;
var isWebrtcPlay = false;

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
    queryGroupByUser: function() {
        return this.apihost + 'webapi?action=queryallgroups&token=' + token
    },
    queryGroupInfos: function() {
        return this.apihost + 'webapi?action=querygroupinfos&token=' + token
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
    queryDevices: function() {
        return this.apihost + 'webapi?action=querydevices&token=' + token
    },
    resetDeviceLoginPwd: function() {
        return this.apihost + 'webapi?action=resetdeviceloginpwd&token=' + token
    },

    // 监控页面url
    monitorListByUser: function() {
        return this.apihost + 'webapi?action=querymonitorlist&token=' + token
    },
    monitorListByUserProto: function() {
        return this.apihost + 'webapi?action=querymonitorlist&streamtype=proto&token=' + token
    },
    queryCompanyTree: function() {
        return this.apihost + 'webapi?action=querycompanys&token=' + token
    },
    lastPosition: function() {
        return this.apihost + 'webapi?action=lastposition&token=' + token
    },
    lastPositionProto: function() {
        return this.apihost + 'webapi?action=lastposition&streamtype=proto&token=' + token
    },
    shareTrackLastPosition: function() {
        return this.apihost + 'webapi?action=sharetracklastposition'
    },
    // 查询轨迹
    queryTracks: function() {
        return this.apihost + 'webapi?action=querytracks&token=' + token
    },
    queryTracksDetail: function() {
        return this.apihost + 'webapi?action=querytracksdetail&token=' + token
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
    //查询用户信息
    queryUserDetail: function() {
        return this.apihost + 'webapi?action=queryuserdetail&token=' + token
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
    // 查询设备基本参数
    queryClientParametersSync: function() {
        return this.apihost + 'webapi?action=queryclientparameters_sync&token=' + token;
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
    queryObdFaultCodes: function() {
        return this.apihost + 'webapi?action=queryobdfaultcodes&token=' + token;
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
    setCurrentDeviceid: function() {
        return this.apihosts + 'webapi?action=setcurrentdeviceid&token=' + token;
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
    importVinnos: function() {
        return this.apihosts + 'webapi?action=importvinnos&token=' + token;
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
    saveOilDetectorTemplate: function() {
        return this.apihosts + 'webapi?action=saveoildetectortemplate&token=' + token;
    },
    queryOilDetectorTemplate: function() {
        return this.apihosts + 'webapi?action=queryoildetectortemplate&token=' + token;
    },
    deleteOilDetectorTemplate: function() {
        return this.apihosts + 'webapi?action=deleteoildetectortemplate&token=' + token;
    },
    reportTempTime: function() {
        return this.apihosts + 'webapi?action=reporttemptime&token=' + token;
    },
    reportDriverRecords: function() {
        return this.apihosts + 'webapi?action=reportdriverrecords&token=' + token;
    },
    addRepairRecord: function() {
        return this.apihosts + 'webapi?action=addrepairrecord&token=' + token;
    },
    queryRepairRecords: function() {
        return this.apihosts + 'webapi?action=queryrepairrecords&token=' + token;
    },
    deleteRepairRecord: function() {
        return this.apihosts + 'webapi?action=deleterepairrecord&token=' + token;
    },
    repairRecordid: function() {
        return this.apihosts + 'webapi?action=repairrecordid&token=' + token;
    },
    editRepaiRecord: function() {
        return this.apihosts + 'webapi?action=editrepairrecord&token=' + token;
    },
    setForceAlarm: function() {
        return this.apihosts + 'webapi?action=setforcealarm&token=' + token;
    },
    rotateReports: function() {
        return this.apihosts + 'webapi?action=reportrotates&token=' + token;
    },
    setIoConfig: function() {
        return this.apihosts + 'webapi?action=setioconfig&token=' + token;
    },
    queryIoConfig: function() {
        return this.apihosts + 'webapi?action=queryioconfig&token=' + token;
    },
    reportOverSpeeds: function() {
        return this.apihosts + 'webapi?action=reportoverspeeds&token=' + token;
    },
    queryInsureByKeyWord: function() {
        return this.apihosts + 'webapi?action=queryinsurebykeyword&token=' + token;
    },
    datavOnlineSummary: function() {
        return this.apihosts + 'webapi?action=datavonlinesummary&token=' + token;
    },
    queryGeoJson: function(adcode, isincludesub) {
        return this.apihosts + 'webapi?action=querygeojson&adcode=' + adcode + '&isincludesub=' + isincludesub;
    },
    getCardInfo: function(action) {
        return this.apihosts + 'webapi?action=' + action + '&token=' + token;
    },

    // 规则
    addRuleDefine: function() {
        // String ruletype;//规则分类' ,
        // String rulename;//规则名字' ,
        // String ruleparamjson;//规则设置参数' json对象的字符串
        return this.apihosts + 'webapi?action=addruledefine&token=' + token;
    },
    queryRuleDefines: function() {
        return this.apihosts + 'webapi?action=queryruledefines&token=' + token;
    },
    deleteRuleDefine: function() {
        return this.apihosts + 'webapi?action=deleteruledefine&token=' + token;
    },
    editRuleDefine: function() {
        return this.apihosts + 'webapi?action=editruledefine&token=' + token;
    },
    saveDeviceRulesByRuleid: function() {
        return this.apihosts + 'webapi?action=savedevicerulesbyruleid&token=' + token;
    },
    saveDeviceRulesByDeviceid: function() {
        return this.apihosts + 'webapi?action=savedevicerulesbydeviceid&token=' + token;
    },
    queryDeviceRulesByDeviceId: function() {
        return this.apihosts + 'webapi?action=querydevicerulesbydeviceid&token=' + token;
    },
    queryDeviceRulesByRuleid: function() {
        return this.apihosts + 'webapi?action=querydevicerulesbyruleid&token=' + token;
    },
    reportIoStates: function() {
        return this.apihosts + 'webapi?action=reportiostates&token=' + token;
    },
    capturephoToSync: function() {
        return this.apihosts + 'webapi?action=capturephoto_sync&token=' + token;
    },
    queryLastDeviceMedias: function() {
        return this.apihosts + 'webapi?action=querylastdevicemedias&token=' + token;
    },
    reportMultiMedias: function() {
        return this.apihosts + 'webapi?action=reportmultimedias&token=' + token;
    },
    starDevice: function() {
        return this.apihosts + 'webapi?action=stardevice&token=' + token;
    },
    queryStoreDevices: function() {
        return this.apihosts + 'webapi?action=querystoredevices&token=' + token;
    },
    listNoFoundDeviceids: function() {
        return this.apihosts + 'webapi?action=listnofounddeviceids&token=' + token;
    },
    clearNoFoundDeviceids: function() {
        return this.apihosts + 'webapi?action=clearnofounddeviceids&token=' + token;
    },
    onlineUsers: function() {
        return this.apihosts + 'webapi?action=onlineusers&token=' + token;
    },
    setDeviceIcon: function() {
        return this.apihosts + 'webapi?action=setdeviceicon&token=' + token;
    },
    queryQuotation: function() {
        return this.apihosts + 'webapi?action=queryquotation&token=' + token;
    },
    setQuotation: function() {
        return this.apihosts + 'webapi?action=setquotation&token=' + token;
    },
    queryBonusByUsername: function() {
        return this.apihosts + 'webapi?action=querybonusbyusername&token=' + token;
    },
    queryBonusList: function() {
        return this.apihosts + 'webapi?action=querybonuslist&token=' + token;
    },
    setBonusLevel: function() {
        return this.apihosts + 'webapi?action=setbonuslevel&token=' + token;
    },
    assignPoints: function() {
        return this.apihosts + 'webapi?action=assignpoints&token=' + token;
    },
    queryPointsRecord: function() {
        return this.apihosts + 'webapi?action=querypointsrecord&token=' + token;
    },
    createEmployee: function() {
        return this.apihosts + 'webapi?action=createemployee&token=' + token;
    },
    queryEmployees: function() {
        return this.apihosts + 'webapi?action=queryemployees&token=' + token;
    },
    deleteEmployees: function() {
        return this.apihosts + 'webapi?action=deleteemployees&token=' + token;
    },
    editEmployee: function() {
        return this.apihosts + 'webapi?action=editemployee&token=' + token;
    },
    createForwardParam: function() {
        return this.apihosts + 'webapi?action=createforwardparam&token=' + token;
    },
    queryForwardParams: function() {
        return this.apihosts + 'webapi?action=queryforwardparams&token=' + token;
    },
    editForwardParam: function() {
        return this.apihosts + 'webapi?action=editforwardparam&token=' + token;
    },
    queryForwardProtocols: function() {
        return this.apihosts + 'webapi?action=queryforwardprotocols&token=' + token;
    },
    deleteForwardParams: function() {
        return this.apihosts + 'webapi?action=deleteforwardparams&token=' + token;
    },
    setForwardParamsStatus: function() {
        return this.apihosts + 'webapi?action=setforwardparamsstatus&token=' + token;
    },
    queryRecorderData: function() {
        return this.apihosts + 'webapi?action=queryrecorderdata&token=' + token;
    },
    createYongZhouEnter: function() {
        return this.apihosts + 'webapi?action=createyongzhouenter&token=' + token;
    },
    queryYongZhouEnters: function() {
        return this.apihosts + 'webapi?action=queryyongzhouenters&token=' + token;
    },
    editYongZhouEnter: function() {
        return this.apihosts + 'webapi?action=edityongzhouenter&token=' + token;
    },
    deleteYongZhouEnters: function() {
        return this.apihosts + 'webapi?action=deleteyongzhouenters&token=' + token;
    },
    createYongZhouVehicle: function() {
        return this.apihosts + 'webapi?action=createyongzhouvehicle&token=' + token;
    },
    queryYongZhouVehicles: function() {
        return this.apihosts + 'webapi?action=queryyongzhouvehicles&token=' + token;
    },
    editYongZhouVehicle: function() {
        return this.apihosts + 'webapi?action=edityongzhouvehicle&token=' + token;
    },
    deleteYongZhouVehicles: function() {
        return this.apihosts + 'webapi?action=deleteyongzhouvehicles&token=' + token;
    },
    createYongZhouDriver: function() {
        return this.apihosts + 'webapi?action=createyongzhoudriver&token=' + token;
    },
    queryYongZhouDriver: function() {
        return this.apihosts + 'webapi?action=queryyongzhoudrivers&token=' + token;
    },
    editYongZhouDriver: function() {
        return this.apihosts + 'webapi?action=edityongzhoudriver&token=' + token;
    },
    deleteYongZhouDriver: function() {
        return this.apihosts + 'webapi?action=deleteyongzhoudrivers&token=' + token;
    },
    queryDevicesByIds: function() {
        return this.apihosts + 'webapi?action=querydevicesbyids&token=' + token;
    },
    queryChargeDevices: function() {
        return this.apihosts + 'webapi?action=querychargedevices&token=' + token;
    },
    queryChargeDeviceRecords: function() {
        return this.apihosts + 'webapi?action=querychargedevicerecords&token=' + token;
    },
    queryDirectDevicesForDatav: function() {
        return this.apihosts + 'webapi?action=querydirectdevicesfordatav&token=' + token;
    },
    queryWeightMarkers: function() {
        return this.apihosts + 'webapi?action=queryweightmarkers_sync&token=' + token;
    },
    saveWeightMarkers: function() {
        return this.apihosts + 'webapi?action=saveweightmarkers_sync&token=' + token;
    },
    reportWeightTime: function() {
        return this.apihosts + 'webapi?action=reportweighttime&token=' + token;
    },
    reportWeightSummary: function() {
        return this.apihosts + 'webapi?action=reportweightsummary&token=' + token;
    },
    queryFunctionsDesc: function() {
        return this.apihosts + 'webapi?action=queryfunctionsdesc&token=' + token;
    },
    poiBatch: function() {
        return 'https://www.gps51.com/webapi?action=poibatch&token=' + token;
    },
    queryAddDevices: function() {
        return this.apihosts + 'webapi?action=queryadddevices&token=' + token;
    },
    queryOnlineStatisticsDay: function() {
        return this.apihosts + 'webapi?action=queryonlinestatisticsday&token=' + token;
    },
    editDeviceAllInfo: function() {
        return this.apihosts + 'webapi?action=editdeviceallinfo&token=' + token;
    },
    reportMileageMonth: function() {
        return this.apihosts + 'webapi?action=reportmileagemonth&token=' + token;
    },
    reportOilManHour: function() {
        return this.apihosts + 'webapi?action=reportoilmanhour&token=' + token;
    },
    querySpeedLimitColors: function() {
        return this.apihosts + 'webapi?action=queryspeedlimitcolors&token=' + token;
    },
    setSpeedLimitColors: function() {
        return this.apihosts + 'webapi?action=setspeedlimitcolors&token=' + token;
    },
    importDeviceInfos: function() {
        return this.apihosts + 'webapi?action=importdeviceinfos&token=' + token;
    },
    editOilRecord: function() {
        return this.apihosts + 'webapi?action=editoilrecord&token=' + token;
    },
    reportOilIdle: function() {
        return this.apihosts + 'webapi?action=reportoilidle&token=' + token;
    },
    reportOilConsumptionRate: function() {
        return this.apihosts + 'webapi?action=reportoilconsumptionrate&token=' + token;
    },
    addOilRecord: function() {
        return this.apihosts + 'webapi?action=addoilrecord&token=' + token;
    },
    delOilRecord: function() {
        return this.apihosts + 'webapi?action=deloilrecord&token=' + token;
    },
    editOilRecordAll: function() {
        return this.apihosts + 'webapi?action=editoilrecordall&token=' + token;
    },
    preViewOilDetectors: function() {
        return this.apihosts + 'webapi?action=previewoildetectors&token=' + token;
    },
    reportOilMileage: function() {
        return this.apihosts + 'webapi?action=reportoilmileage&token=' + token;
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
 * 三级管理员 minigps13   123456
 * 四级管理员 minigps14   123456
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


// 各类型地图地址  'cssFilter': 'sepia(100%) invert(90%)'

var baiduNormalUrlTemplate = 'https://maponline{s}.bdimg.com/tile/?qt=vtile&styles=pl&scaler=2&udt=20201217&from=jsapi2_0&x={x}&y={y}&z={z}';
var baiduSatelliteUrlTemplate = 'https://maponline{s}.bdimg.com/starpic/?qt=satepc&u=x={x};y={y};z={z};v=009;type=sate&fm=46&app=webearth2&v=009&udt=20201223';
var baiduTrafficUrlTemplate = 'http://its.map.baidu.com:8002/traffic/TrafficTileService?x={x}&y={y}&level={z}&time={time}&label=web2D&v=017';

//var baiduTextUrlTemplate = 'http://online{s}.map.bdimg.com/tile/?qt=tile&x={x}&y={y}&z={z}&styles=sl&v=020';
var baiduTextUrlTemplate = 'https://gps51.com/fbaidumap/tile/?qt=tile&x={x}&y={y}&z={z}&styles=sl&v=020';

// var googleNormalUrlTemplate = 'http://mt{s}.google.cn/vt?lyrs=m@180000000&hl=zh-CN&gl=cn&scale=2&src=app&x={x}&y={y}&z={z}&s=Gal';
// var googleSatelliteUrlTemplate = 'http://mt{s}.google.cn/vt?lyrs=y@186&hl=zh_CN&scale=2&gl=cn&x={x}&y={y}&z={z}';
// var googleTrafficUrlTemplate = 'https://rtt2c.map.qq.com/rtt/?z={z}&x={x}&y={y}&times=1&time={time}';
//hl=zh-CN&gl=cn
//hl=en-US&gl=US

var googleNormalUrlTemplate = 'http://mt{s}.google.cn/vt?lyrs=m@189&scale=2&gl=cn&x={x}&y={y}&z={z}';
var googleSatelliteUrlTemplate = 'http://mt{s}.google.cn/vt?lyrs=y@189&scale=2&gl=cn&x={x}&y={y}&z={z}';
var googleTrafficUrlTemplate = 'https://rtt2c.map.qq.com/rtt/?z={z}&x={x}&y={y}&times=1&time={time}';

var googleChinaNormalUrlTemplate = 'http://minigps.net/vt?lyrs=m@189&scale=2&gl=cn&x={x}&y={y}&z={z}';
var googleChinaSatelliteUrlTemplate = 'http://minigps.net/vt?lyrs=y@189&scale=2&gl=cn&x={x}&y={y}&z={z}';
var googleChinaTrafficUrlTemplate = 'https://rtt2c.map.qq.com/rtt/?z={z}&x={x}&y={y}&times=1&time={time}';

var aliNormalUrlTemplate = 'http://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&scale=2&style=8&x={x}&y={y}&z={z}';
var aliSatelliteUrlTemplate = 'http://webst0{s}.is.autonavi.com/appmaptile?style=6&scale=2&x={x}&y={y}&z={z}';
var aliTextUrlTemplate = 'http://wprd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scl=1&style=8&ltype=6&x={x}&y={y}&z={z}';
// 新版
// http://wprd0{1-4}.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=1&style=7和
// 前者是高德的新版地址，后者是老版地址。

// lang可以通过zh_cn设置中文，en设置英文
// size基本无作用
// scl设置标注还是底图，scl=1代表注记
// scl=2代表底图（矢量或者影像）
// style设置影像和路网，6为影像图，7为矢量路网，8为影像路网
// 组合列表

// http://wprd0{1-4}.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=1&style=7 为矢量图（含路网、含注记）
// http://wprd0{1-4}.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=2&style=7 为矢量图（含路网，不含注记）
// http://wprd0{1-4}.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=1&style=6 为影像底图（不含路网，不含注记）
// http://wprd0{1-4}.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=2&style=6 为影像底图（不含路网、不含注记）
// http://wprd0{1-4}.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=1&style=8 为影像路图（含路网，含注记）
// http://wprd0{1-4}.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=2&style=8 为影像路网（含路网，不含注记）

var baiduNormaBaseOption = {
    'urlTemplate': baiduNormalUrlTemplate,
    'subdomains': [0, 1, 2, 3],
}

var baiduSatelliteBaseOption = {
    'urlTemplate': baiduSatelliteUrlTemplate,
    'subdomains': [0, 1, 2],
}

var baiduTextBaseOption = {
    'urlTemplate': baiduTextUrlTemplate,
    'subdomains': [0, 1, 2],
}



var googleNormaBaseOption = {
    'urlTemplate': googleNormalUrlTemplate,
    'subdomains': [0, 1, 2, 3],
}

var googleSatelliteBaseOption = {
    'urlTemplate': googleSatelliteUrlTemplate,
    'subdomains': [0, 1, 2, 3],
}

var googleChinaNormaBaseOption = {
    'urlTemplate': googleChinaNormalUrlTemplate,
    'subdomains': [0, 1, 2, 3],
}

var googleChinaSatelliteBaseOption = {
    'urlTemplate': googleChinaSatelliteUrlTemplate,
    'subdomains': [0, 1, 2, 3],
}



var aliNormaBaseOption = {
    'urlTemplate': aliNormalUrlTemplate,
    'subdomains': [1, 2, 3, 4],
}

var aliSatelliteBaseOption = {
    'urlTemplate': aliSatelliteUrlTemplate,
    'subdomains': [1, 2, 3, 4],
}
var aliTextBaseOption = {
    'urlTemplate': aliTextUrlTemplate,

    'subdomains': [1, 2, 3, 4],
}