//整体分2级存储
//第一级是大的分类 固定字母开头ur-代表user report,ar-代表account report,ui-代表userinfo ut is user track
//ba 代表baidu address
//第二级是详细列表
//内容用文本格式

(function() {

    var myLocalStorage = null;
    var isHashMap = false;

    function getLocateStorage() {
        if (myLocalStorage == null) {
            if (window.localStorage) {
                console.log("using the localStorage");
                myLocalStorage = window.localStorage;
                isHashMap = false;
            } else if (window.sessionStorage) {
                console.log("using the sessionStorage");
                myLocalStorage = window.sessionStorage;
                isHashMap = false;
            } else {
                myLocalStorage = new HashMap();
                isHashMap = true;
            }
        }

        //maybe need to check the storage is full?
        if (myLocalStorage != null) {
            if (myLocalStorage.length > 10000) {
                //console.log("myLocalStorage length:" + window.localStorage.length);
                myLocalStorage.clear();
            }
        }
        return myLocalStorage;
    };



    function saveData(key, dataObject) {
        getLocateStorage();
        if (dataObject != null) {
            var currentDate = new Date().getTime();
            dataObject._localupdatetime = currentDate;
        }
        var jsonStr = JSON.stringify(dataObject);
        if (isHashMap == true) {
            getLocateStorage().put(key, jsonStr);
        } else {
            getLocateStorage().setItem(key, jsonStr);
        }
    }

    function delUserData(key) {
        getLocateStorage();
        if (isHashMap == true) {

        } else {
            window.localStorage.removeItem(key);
            window.sessionStorage.removeItem(key);
        }
    }

    function readData(key) {
        getLocateStorage();
        var dataObject = null;
        var jsonStr = null;
        if (isHashMap == true) {
            jsonStr = getLocateStorage().get(key);
        } else {
            jsonStr = getLocateStorage().getItem(key);
        }
        if (jsonStr != null) {
            dataObject = JSON.parse(jsonStr);
        }
        return dataObject;
    }

    function formatUserReportKey(userid, day) {
        var key = "ur-" + userid + "-" + day;
        return key;
    }


    function formatAccountReportKey(accountid, day) {
        var key = "ar-" + accountid + "-" + day;
        return key;
    }

    function formatUserInfoKey(userid) {
        var key = "ui-" + userid;
        return key;
    }

    function formatUserTrackKey(userid, daystr) {
        "use strict";
        var key = "ut-" + userid + "-" + daystr;
        return key;
    }

    function formatBaiduAddressKey(stdlat, stdlon) {
        "use strict";
        var stdlatfixed5 = Number(stdlat).toFixed(5);
        var stdlonfixed5 = Number(stdlon).toFixed(5);
        var key = "ba-" + stdlatfixed5 + "@" + stdlonfixed5;
        return key;
    }

    //定义一些api
    var _LocalCacheMgr = {
            setUserReport: function(userid, day, report) {
                var key = formatUserReportKey(userid, day);
                saveData(key, report);
            },

            getUserReport: function(userid, day) {
                var result = null;
                var key = formatUserReportKey(userid, day);
                result = readData(key);
                return result;
            },


            setAccountReport: function(accountid, day, report) {
                var key = formatAccountReportKey(accountid, day);
                saveData(key, report);
            },

            getAccountReport: function(accountid, day) {
                var result = null;
                var key = formatAccountReportKey(accountid, day);
                result = readData(key);
                return result;
            },

            getAccountId: function() {
                return readData("a-accounid");
            },

            setAccountId: function(accountid) {
                saveData("a-accounid", accountid);
            },

            setUserInfo: function(userid, userinfo) {
                var key = formatUserInfoKey(userid);
                saveData(key, userinfo);
            },

            delUserInfo: function(userid) {
                var key = formatUserInfoKey(userid);
                delUserData(key);
            },

            getUserInfo: function(userid) {
                var key = formatUserInfoKey(userid);
                return readData(key);
            },
            //to store the track cache
            //"ut-userid-day" key to store
            getUserTrackByDay: function(userid, daystr) {
                "use strict";
                var key = formatUserTrackKey(userid, daystr);
                return readData(key);
            },
            setUserTrackByDay: function(userid, daystr, tracksOneDay) {
                "use strict";
                var key = formatUserTrackKey(userid, daystr);
                saveData(key, tracksOneDay);
            },
            getAddress: function(stdlat, stdlon) {
                "use strict";
                var key = formatBaiduAddressKey(stdlat, stdlon);
                return readData(key);
            },
            setAddress: function(stdlat, stdlon, address) {
                "use strict";
                var key = formatBaiduAddressKey(stdlat, stdlon);
                saveData(key, address);
            },
            getItem: function(key) {
                "use strict";
                return readData(key);
            },
            setItem: function(key, value) {
                "use strict";
                saveData(key, value);
            }
        }
        //这里确定了插件的名称
    this.LocalCacheMgr = _LocalCacheMgr;
})();
