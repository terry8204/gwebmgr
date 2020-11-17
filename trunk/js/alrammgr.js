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
        var records = Object.values(this.records);
        return records.sort(function (a, b) { return b.lastalarmtime - a.lastalarmtime; });
    };

    AlarmMgr.prototype.updateDisposeStatus = function (deviceId, alarm) {
        if (alarm !== null ) {
            var key = this.getKey(deviceId, alarm);
            if(this.records[key]){
                this.records[key].disposestatus = 1;
            }
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