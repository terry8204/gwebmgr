/*
 * 所有的urls
 */
var myUrls = {
    host:"http://192.168.0.112:8090/",
    // host:"http://112.74.186.169/",
    login:function(){
        return this.host+"webapi?action=login";
    },
    loginOut:function(){
        return this.host+"webapi?action=loginout&token="+token;
    },
    changeUserPass:function () { 
        return this.host+"webapi?action=changeuserpass&token="+token;
    },
    queryUserType:function () { 
        return this.host+"webapi?action=queryusertype&token="+token;
    },
    addCompany:function(){
        return this.host+"webapi?action=addcompany&token="+token;
    },
    deleteCompany:function(){
        return this.host+"webapi?action=deletecompany&token="+token;
    },
    editCompany:function(){
        return this.host+"webapi?action=editcompany&token="+token;
    },
    queryCompanyByCreater:function(){
        return this.host+"webapi?action=pagequerycompany&token="+token; 
    },
    queryCompanyByIds:function(){
        return this.host+"webapi?action=querycompanybyids&token="+token;
    },
    queryCompanyById:function () { 
        return this.host + "webapi?action=querycompanybyid&token="+token;
    },
    addGroup:function () { 
        return this.host + "webapi?action=addgroup&token="+token;
    },
    deleteGroup:function () { 
        return this.host + "webapi?action=deletegroup&token="+token;
    },
    editGroup:function () { 
        return this.host + "webapi?action=editgroup&token="+token;
    },
    editGroupMonitor:function () { 
        return this.host + "webapi?action=editgroupmonitor&token="+token;
    },
    queryGroupByUser:function () { 
        return this.host + "webapi?action=pagequerygroup&token="+token;
    },
    addUser:function () { 
        return this.host + "webapi?action=adduser&token="+token;
    },
    queryCompanyGroup:function () { 
        return this.host + "webapi?action=querycompanygroup&token="+token;
    },
    queryUser:function () { 
        return this.host + "webapi?action=pagequeryuser&token="+token;
    },
    resetUserLoginPwd:function () { 
        return this.host + "webapi?action=resetuserpwd&token="+token;
    },
    delUser:function () { 
        return this.host + "webapi?action=deleteuser&token="+token;
    },
    editUser:function () { 
        return this.host + "webapi?action=edituser&token="+token;
    },
    addDevice:function () { 
        return this.host + "webapi?action=adddevice&token="+token;
    },
    queryDeviceType:function (param) { 
        return this.host + "webapi?action=pagequerydevicetype&token="+token;
    },
    queryDeviceInfo:function () { 
        return this.host + "webapi?action=deviceinfo&token="+token;
    },
    editDevice:function(){
        return this.host + "webapi?action=editdevice&token="+token;
    },
    deleteDevice:function () {
        return this.host + "webapi?action=deletedevice&token="+token;
    },
    queryDeviceById:function () { 
        return this.host + "webapi?action=querydevicebyid&token="+token;
    },
    queryDeviceList:function () { 
        return this.host + "webapi?action=pagequerydevice&token="+token;
    },
    resetDeviceLoginPwd:function () { 
        return this.host + "webapi?action=resetdeviceloginpwd&token="+token;
    },
    // 监控页面url
    monitorListByUser:function () { 
        return this.host + "webapi?action=querymonitorlist&token="+token;
    },
    queryCompanyTree:function () { 
        return this.host + "webapi?action=querycompanytree&token="+token;
    },
    lastPosition:function () { 
        return this.host + "webapi?action=lastposition&token="+token;
    },
    // 查询轨迹
    queryTracks:function (token) { 
        return this.host + "webapi?action=querytracks&token="+token;
    },
    // 查询报警信息
    queryAlarm:function () {
        return this.host + "webapi?action=queryalarm&token="+token;
    },
    queryMsg:function () { 
        return this.host + "webapi?action=querymsg&token="+token;
    },
    //处理报警
    disposeAlarm:function (param) { 
        return this.host + "webapi?action=disposealarm&token="+token;
    },
    // 下发命令
    sendCmd:function (param) { 
        return this.host + "webapi?action=sendcmd&token="+token;
    },
    queryAlarmDescr:function () { 
        return this.host + "webapi?action=queryalarmdescr&token="+token;
    },
    // 系统参数  车辆
    addVehicleType:function () { 
        return this.host + "webapi?action=addvehicletype&token="+token;
    },
    deleteVehicleType:function () { 
        return this.host + "webapi?action=deletevehicletype&token="+token;
    },
    queryVehicleType:function () { 
        return this.host + "webapi?action=pagequeryvehicletype&token="+token;
    },
    editVehicleType:function () {
        return this.host + "webapi?action=editvehicletype&token="+token;
    },
    // 设备指令
    queryCmd:function () { 
        return this.host + "webapi?action=pagequerycmd&token="+token;
    },
    addCmd:function () { 
        return this.host + "webapi?action=addcmd&token="+token;
    },
    deleteCmd:function () { 
        return this.host + "webapi?action=deletecmd&token="+token;
    },
    editCmd:function () { 
        return this.host + "webapi?action=editcmd&token="+token;
    },
    // 设备类型
    queryDeviceYype:function () { 
        return this.host + "webapi?action=querydevicetype&token="+token;
    },
    queryDeviceTypeByUser:function () {
        return this.host + "webapi?action=querydevicetypebyuser&token="+token;
    },
    addDeviceType:function () { 
        return this.host + "webapi?action=adddevicetype&token="+token;
    },
    deleteDeviceType:function () { 
        return this.host + "webapi?action=deletedevicetype&token="+token;
    },
    editDeviceTypeCmd:function () { 
        return this.host + "webapi?action=editdevicetypecmd&token="+token;
    }
};


var vueInstanse   = null;   // 全局vue实例子
var editObject    = null;   // 要编辑客户的对象
var customersList = null;   // 缓存客户列表
var groupsList    = null;   // 缓存分组列表


/* 
 * 系统管理员 admin       123456
 * 一级管理员 yijimgr     123456
 * 二级管理员 erjimgr     123456
 * 普通监控员 xiaoxu      123456
 * 设备账号   13128804768 123456  
 */ 