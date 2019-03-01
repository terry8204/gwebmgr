(function (win) {

    function MsgMgr () {
        this.cache = {};
    }

    MsgMgr.prototype = {
        constructor: MsgMgr,
        addMsg: function (msgObj) {
            var key = this._getKey(msgObj);
            this.cache[key] = msgObj;
            console.log('tag', this.cache);
        },
        getMsgList: function () {
            return Object.values(this.cache);
        },
        _getKey (msgObj) {
            return msgObj.deviceid + "-" + msgObj.msgtype;
        },
    }

    win.MsgMgr = MsgMgr;
})(this);