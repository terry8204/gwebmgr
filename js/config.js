
var myUrls = {
    host:"http://192.168.0.108:8090/",
    login:function(){
        return this.host+"webapi?action=login";
    },
    loginOut:function(){
        return this.host+"webapi?action=loginout&token="+token;
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
        return this.host+"webapi?action=querycompanybycreater&token="+token; 
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
    queryGroupByUser:function () { 
        return this.host + "webapi?action=querygroupbyuser&token="+token;
    },
    addUser:function () { 
        return this.host + "webapi?action=adduser&token="+token;
    },
    queryCompanyGroup:function () { 
        return this.host + "webapi?action=querycompanygroup&token="+token;
    },
    queryUser:function () { 
        return this.host + "webapi?action=queryuserlist&token="+token;
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
        return this.host + "webapi?action=querydevicetype&token="+token; 
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
    }
}