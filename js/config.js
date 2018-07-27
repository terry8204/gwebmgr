
var myUrls = {
    host:"http://112.74.186.169/webapi?action=",
    login:function(){
        return this.host+"login";
    },
    loginOut:function(){
        return this.host+"loginout&token="+token;
    },
    addCompany:function(){
        return this.host+"addcompany&token="+token;
    },
    deleteCompany:function(){
        return this.host+"deletecompany&token="+token;
    },
    editCompany:function(){
        return this.host+"editcompany&token="+token;
    },
    queryCompanyByCreater:function(){
        return this.host+"querycompanybycreater&token="+token; 
    },
    queryCompanyByIds:function(){
        return this.host+"querycompanybyids&token="+token;
    },
    queryCompanyById:function () { 
        return this.host + "querycompanybyid&token="+token;
    },
    addGroup:function () { 
        return this.host + "addgroup&token="+token;
    },
    deleteGroup:function () { 
        return this.host + "deletegroup&token="+token;
    },
    editGroup:function () { 
        return this.host + "editgroup&token="+token;
    },
    queryGroupByUser:function () { 
        return this.host + "querygroupbyuser&token="+token;
    }
}