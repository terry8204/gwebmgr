(function (win) {
    function AlarmMgr () {
        this.records = {};
    }

    AlarmMgr.prototype.addRecord = function (record) {
        var deviceId = record.deviceid;
        var alarm = record.alarm;
        var key = this.getKey(deviceId, alarm);
        this.records[key] = record;
    };


    AlarmMgr.prototype.getKey = function (deviceId, alarm) {
        return deviceId + "-" + alarm;
    };

    AlarmMgr.prototype.getAlarmList = function () {
        console.log(this.records);
        return Object.values(this.records);
    };

    AlarmMgr.prototype.updateDisposeStatus = function (deviceId, alarm) {
        if (alarm) {
            var key = this.getKey(deviceId, alarm);
            this.records[key].disposestatus = 1;
        } else {
            for (var key in this.records) {
                if (key.indexOf(deviceId) != -1) {
                    this.records[key].disposestatus = 1;
                }
            }
        }
    }



    win.AlarmMgr = AlarmMgr;
})(window);