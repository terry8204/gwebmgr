(function (win) {

    function MsgMgr () {
        this.cache = {};
    }

    MsgMgr.prototype = {
        constructor: MsgMgr,
        addMsg: function (msgObj) {
            var key = this._getKey(msgObj);
            this.cache[key] = msgObj;
        },
        getMsgList: function () {
            var list = Object.values(this.cache);
            list.sort(function (a, b) {
                return a.createtime - b.createtime;
            });
            return list;
        },
        _getKey: function (msgObj) {
            return msgObj.deviceid + "-" + msgObj.msgtype;
        },
        deleteMsg: function (msgObj) {
            var key = this._getKey(msgObj);
            delete this.cache[key];
        }
    }

    win.MsgMgr = MsgMgr;
})(this);