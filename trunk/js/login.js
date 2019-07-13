"use strict";
new Vue({
    el: "#login-wraper",
    i18n: utils.getI18n(),
    data: {
        username: '',
        password: '',
        keepPass: false,
        account: 0,
        userTip: false,
        passTip: false,
        loading: false,
        placeholder: "",
        pwdPlaceholder: "",
        language: Cookies.get("PATH_LANG") || 'zh',
    },
    methods: {
        getBrowserInfo: function () {
            var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串
            var isOpera = userAgent.indexOf("Opera") > -1; //判断是否Opera浏览器
            var isIE = userAgent.indexOf("compatible") > -1
                && userAgent.indexOf("MSIE") > -1 && !isOpera; //判断是否IE浏览器
            var isEdge = userAgent.indexOf("Edge") > -1; //判断是否IE的Edge浏览器
            var isFF = userAgent.indexOf("Firefox") > -1; //判断是否Firefox浏览器
            var isSafari = userAgent.indexOf("Safari") > -1
                && userAgent.indexOf("Chrome") == -1; //判断是否Safari浏览器
            var isChrome = userAgent.indexOf("Chrome") > -1
                && userAgent.indexOf("Safari") > -1; //判断Chrome浏览器

            if (isIE) {
                var reIE = new RegExp("MSIE (\\d+\\.\\d+);");
                reIE.test(userAgent);
                var fIEVersion = parseFloat(RegExp["$1"]);
                if (fIEVersion == 7) {
                    return "IE7";
                } else if (fIEVersion == 8) {
                    return "IE8";
                } else if (fIEVersion == 9) {
                    return "IE9";
                } else if (fIEVersion == 10) {
                    return "IE10";
                } else if (fIEVersion == 11) {
                    return "IE11";
                } else {
                    return "0";
                }//IE版本过低
                return "IE";
            }

            function getVersion (browserName) {
                var idx = userAgent.indexOf(browserName);
                var versionArr = userAgent.slice(idx).split(" ");
                for (var i = 0; i < versionArr.length; i++) {
                    var item = versionArr[i];
                    if (item.indexOf(browserName) !== -1) {
                        return item;
                    };
                }
                return "";
            }

            if (isOpera) {
                return getVersion("Opera");
            }
            if (isEdge) {
                return getVersion("Edge");
            }
            if (isFF) {
                return getVersion("Firefox");
            }
            if (isSafari) {
                return getVersion("Safari");
            }
            if (isChrome) {
                return getVersion("Chrome");
            }
        },
        handleSubmit: function () {
            var me = this;
            var user = this.username;
            var pass = this.password;

            if (user.length < 2) {
                this.$Message.error(this.$t("login.error_1"));
                return;
            };

            if (pass.length < 4) {
                this.$Message.error(this.$t("login.error_2"));
                return;
            };

            this.sendAjax(function (resp) {
                if (resp.status == 0) {
                    // console.log('resp', resp, resp.nickname);
                    // return;
                    sessionStorage.setItem("creatername", resp.creatername ? resp.creatername : "");
                    sessionStorage.setItem("createremail", resp.createremail ? resp.createremail : "");
                    sessionStorage.setItem("createrphone", resp.createrphone ? resp.createrphone : "");
                    sessionStorage.setItem("createrqq", resp.createrqq ? resp.createrqq : "");
                    sessionStorage.setItem("createrwechat", resp.createrwechat ? resp.createrwechat : "");

                    sessionStorage.setItem("email", resp.email ? resp.email : "");
                    sessionStorage.setItem("nickname", resp.nickname ? resp.nickname : "");
                    sessionStorage.setItem("phone", resp.phone ? resp.phone : "");
                    sessionStorage.setItem("qq", resp.qq ? resp.qq : "");
                    sessionStorage.setItem("wechat", resp.wechat ? resp.wechat : "");
                    if (me.keepPass) {
                        if (me.account == 0) {
                            Cookies.set("accountuser", me.username, { expires: 7 });
                            Cookies.set("accountpass", me.password, { expires: 7 });
                        } else {
                            Cookies.set("deviceuser", me.username, { expires: 7 });
                            Cookies.set("devicepass", me.password, { expires: 7 });
                        }
                        Cookies.set("keepPass", true, { expires: 7 });
                    } else {
                        Cookies.remove("accountuser");
                        Cookies.remove("accountpass");
                        Cookies.set("keepPass", false, { expires: 7 });
                    }
                    Cookies.set("token", resp.token);
                    Cookies.set("userType", resp.usertype);
                    Cookies.set("name", me.username);
                    Cookies.set(me.username + "-multilogin", resp.multilogin);
                    // window.location.href = "main.html?token=" + resp.token + "&usertype=" + resp.usertype;
                    window.location.href = "main.html";
                } else if (resp.status == -1) {
                    // me.$Message.error(me.$t("login.error_3"));
                    me.$Message.error(me.$t("login.error_4"));
                } else if (resp.status == 1) {
                    me.$Message.error(me.$t("login.error_4"));
                } else if (resp.status == 2) {
                    me.$Message.error(me.$t("login.error_5"));
                } else if (resp.status == 3) {
                    me.$Message.error(me.$t("login.error_6"));
                }
            });
        },
        sendAjax: function (callback) {
            var me = this;
            var url = myUrls.login();
            var type = this.account == 0 ? "USER" : "DEVICE";
            var data = { type: type, from: "web", username: this.username, password: $.md5(this.password), browser: me.getBrowserInfo() };
            var encode = JSON.stringify(data);
            me.loading = true;
            $.ajax({
                url: url,
                type: "post",
                data: encode,
                dataType: "json",
                timeout: 30000,
                success: function (resp) {
                    callback(resp)
                },
                error: function (e) {
                    me.$Message.error('login error:' + JSON.stringify(e));
                },
                complete: function () {
                    me.loading = false;
                }
            })
        },
        selectdAccount: function (account) {
            this.account = account;
            var type = this.account == 0 ? "USER" : "DEVICE";
            Cookies.set("logintype", type, { expires: 7 });

        },
        changeLang: function (lang) {
            this.language = lang;
            this.$i18n.locale = lang;
            Cookies.set("PATH_LANG", lang, { expires: 31 });
            this.pwdPlaceholder = this.$t("login.inputPassword");
            var type = Cookies.get("logintype");
            if (type == "USER") {
                this.placeholder = this.$t("login.inputUsername");
            } else if (type == "DEVICE") {
                this.placeholder = this.$t("login.inputDeviceNumber");
            }
            document.title = this.$t("login.title");
        }
    },
    mounted: function () {
        var me = this;
        this.$nextTick(function () {
            var keepPass = Cookies.get("keepPass");
            var type = Cookies.get("logintype");
            if (type) {
                if (type == "USER") {
                    me.account = 0;
                    me.placeholder = this.$t("login.inputUsername");
                    var user = Cookies.get("accountuser");
                    var pass = Cookies.get("accountpass");
                } else if (type == "DEVICE") {
                    me.placeholder = this.$t("login.inputDeviceNumber");
                    me.account = 1;
                    var user = Cookies.get("deviceuser");
                    var pass = Cookies.get("devicepass");
                }
            } else {
                var type = this.account == 0 ? "USER" : "DEVICE";
                Cookies.set("logintype", type, { expires: 7 });
            };

            if (keepPass == 'true' && user != undefined && pass != undefined) {
                if (user && pass) {
                    me.username = user;
                    me.password = pass;
                    me.keepPass = true;
                } else {
                    me.username = "";
                    me.password = "";
                    me.keepPass = false;
                }
            };
            me.pwdPlaceholder = this.$t("login.inputPassword");
            document.title = this.$t("login.title");
        });
        document.onkeyup = function (e) {
            var keyCode = e.keyCode;
            if (keyCode == 13) {
                me.handleSubmit();
            }
        }
    },
    watch: {
        account: function () {
            if (this.account == 0) {
                this.placeholder = this.$t("login.inputUsername");
                var user = Cookies.get("accountuser");
                var pass = Cookies.get("accountpass");
            } else {
                this.placeholder = this.$t("login.inputDeviceNumber");
                var user = Cookies.get("deviceuser");
                var pass = Cookies.get("devicepass");
            }
            if (this.keepPass) {
                if (user && pass) {
                    this.username = user;
                    this.password = pass;
                } else {
                    this.username = "";
                    this.password = "";
                };
            } else {
                this.username = "";
                this.password = "";
            };
        }
    }
});

