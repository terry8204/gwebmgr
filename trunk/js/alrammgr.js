(function (win) {
    function AlarmMgr () {
        this.records = {};
    }

    AlarmMgr.prototype.addRecord = function (record) {
        var deviceId = record.deviceid;
        var state = record.state;
        var key = this.getKey(deviceId, state);
        this.records[key] = record;
    };


    AlarmMgr.prototype.getKey = function (deviceId, state) {
        return deviceId + "-" + state;
    };

    AlarmMgr.prototype.getAlarmList = function () {
        return Object.values(this.records);
    };

    AlarmMgr.prototype.updateDisposeStatus = function (deviceId, state) {
        if (state) {
            var key = this.getKey(deviceId, state);
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