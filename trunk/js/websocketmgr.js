var lockReconnect = false;
var tempUserName = null;
var tempCallBack = null;
var tempHost = null;
var initWebSocket = function (host, userName, callback) {
    tempHost = host;
    tempUserName = userName;
    tempCallBack = callback;
    var initIsPass = false;
    if ('WebSocket' in window) {
        ws = new WebSocket(tempHost);
        initIsPass = true;
    } else if ('MozWebSocket' in window) {
        ws = new MozWebSocket(tempHost);
        initIsPass = true;
    }
    if (initIsPass == true) {
        ws.onclose = function () {
            console.log("llws连接关闭!" + new Date().toUTCString());
            reconnectWs();
        };
        ws.onerror = function () {
            console.log("llws连接错误!" + new Date().toUTCString());
            reconnectWs();
        };
        ws.onopen = function () {
            if (tempUserName) {
                var user = "online" + tempUserName + "-web";
                console.log('ws连接成功', user);
                ws.send(user);
            }
            else {
                console.log('ws连接成功 userName is null');
            }
        };
        ws.onmessage = function (event) {
            var resp = JSON.parse(event.data);
            tempCallBack(resp);
        };
    }
    return initIsPass;
};

var reconnectWs = function () {
    if (lockReconnect == false) {
        lockReconnect = true;
        setTimeout(function () {
            console.log("ws重连!" + new Date().toUTCString());
            initWebSocket(wsHost, tempUserName, tempCallBack);
            lockReconnect = false;
        }, 10000);
    }
}
