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
                    // window.location.href = "main.html?token=" + resp.token + "&usertype=" + resp.usertype;
                    window.location.href = "main.html";
                } else if (resp.status == -1) {
                    me.$Message.error(me.$t("login.error_3"));
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
            var data = { type: type, from: "web", username: this.username, password: $.md5(this.password) };
            var encode = JSON.stringify(data);
            me.loading = true;
            $.ajax({
                url: url,
                type: "post",
                data: encode,
                dataType: "json",
                success: function (resp) {
                    callback(resp)
                },
                error: function (e) {
                    console.log(e);
                    me.$Message.error('服务器错误!');
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

