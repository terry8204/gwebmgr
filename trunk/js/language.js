/**
 *  use  
 *  {{ $t("message.hello") }}
 *  computed:{
 *   welcomeMessage(){
 *      return this.username + ', '+ this.$t("message.welcome");
 *    } 
 *    },
 * 
 *   this.$i18n.locale='zhCHS'
 */
(function (win) {
    Vue.use(VueI18n)
    var messages = {
        en: {
            login: {
                title: "Location Information Service Platform",
                chinese: "Chinese",
                english: "英文",
                companyLogin: "Company login",
                deviceLogin: "Device login",
                pememberPwd: "Remember password",
                logining: "Login",
                inputUsername: "Please enter your account number.",
                inputDeviceNumber: "Please enter the device number.",
                inputPassword: "Please input a password",
                wechatApplet: "Wechat applet",
                step1: "1.Search for gps51 widgets in micro-letters",
                step2: "2.Or scan two-dimensional codes directly",
                step3: "3.For_iPhone/Android",
                error_1: "Incorrect account format",
                error_2: "Incorrect password format",
                error_3: "Login failed",
                error_4: "Error in account or password",
                error_5: "No landing",
                error_6: "Account expired",
            },
            message: {
                hello: 'hello',
                about: 'about',
                welcome: "Welcome"
            }
        },
        //简体中文
        zh: {
            login: {
                title: "位置信息服务平台",
                chinese: "中文",
                english: "English",
                companyLogin: "企业登录",
                deviceLogin: "设备登录",
                pememberPwd: "记住密码",
                logining: "登录",
                inputUsername: "请输入账号",
                inputDeviceNumber: "请输入设备号",
                inputPassword: "请输入密码",
                wechatApplet: "微信小程序",
                step1: "1.在微信中搜索gps51小程序",
                step2: "2.或者直接扫描二维码",
                step3: "3.适用于iPhone/Android",
                error_1: "账号格式不对",
                error_2: "密码格式不对",
                error_3: "登录失败",
                error_4: "账号或密码错误",
                error_5: "禁止登陆",
                error_6: "账号过期",
            },
            message: {
                hello: '你好',
                about: '关于',
                welcome: "欢迎"
            }
        }
    }


    var i18n = new VueI18n({
        locale: Cookies.get("PATH_LANG") || 'zh',
        messages: messages
    });

    win.i18n = i18n;

})(this)