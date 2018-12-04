var lockReconnect = false;
var initWebSocket = function (username, callback) {
    var initIsPass = false;
    if ('WebSocket' in window) {
        ws = new WebSocket(wsHost);
        initIsPass = true;
    } else if ('MozWebSocket' in window) {
        ws = new MozWebSocket(wsHost);
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
            if (!username) return;
            var user = "online" + username + "-web";
            console.log('ws连接成功', user);
            ws.send(user);
        };
        ws.onmessage = function (event) {
            var resp = JSON.parse(event.data);
            callback(resp);
        };
    }
    return initIsPass;
};

var reconnectWs = function (url) {
    if (lockReconnect == false) {
        lockReconnect = true;
        setTimeout(function () {
            console.log("ws重连!" + new Date().toUTCString());
            initWebSocket();
            lockReconnect = false;
        }, 2000);
    }
}