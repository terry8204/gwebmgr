(function (win) {
    function AlarmMgr () {
        this.records = {};
    }

    AlarmMgr.prototype.addRecord = function (record) {
        var deviceId = record.deviceid;
        var arrivedtime = record.arrivedtime;
        var key = this.getKey(deviceId, arrivedtime);

        this.addDevObj(deviceId);
        this.records[deviceId][key] = {
            arrivedtime: arrivedtime,
            record: record
        };
    };

    AlarmMgr.prototype.addDevObj = function (deviceId) {
        if (!this.records[deviceId]) {
            this.records[deviceId] = {};
        }
    };

    AlarmMgr.prototype.getKey = function (deviceId, arrivedtime) {
        return deviceId + "-" + arrivedtime;
    };

    AlarmMgr.prototype.getAlarmList = function () {
        var deviceIds = Object.keys(this.records);
        var alarmList = [];
        for (var i = 0; i < deviceIds.length; i++) {
            var deviceId = deviceIds[i];
            var devLastAlarm = this.getDevLastAlarm(this.records[deviceId]);
            alarmList.push(devLastAlarm);
        }
        return alarmList;
    };

    AlarmMgr.prototype.getDevLastAlarm = function (record) {
        var index = 0;
        var currentTime = 0;
        var currentRecord = null;
        for (key in record) {
            if (record.hasOwnProperty(key)) {
                index++;
                var tiem = record[key];
                var arrivedtime = tiem.arrivedtime;
                if (arrivedtime > currentTime) {
                    currentRecord = tiem.record;
                    currentTime = arrivedtime;
                }
            }
        };
        console.log('currentRecord', currentRecord);
        currentRecord.count = index;
        return currentRecord;
    };

    win.AlarmMgr = AlarmMgr;
})(window);