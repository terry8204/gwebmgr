var lockReconnect = false;
var initWebSocket = function (userName, callback) {
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
            if (userName) {
                var user = "online" + userName + "-web";
                console.log('ws连接成功', user);
                ws.send(user);
            }
            else {
                console.log('ws连接成功 userName is null');
            }
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
            initWebSocket(userName, vRoot.wsCallback);
            lockReconnect = false;
        }, 2000);
    }
}