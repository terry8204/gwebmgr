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

            },
            message: {
                hello: 'hello',
                about: 'about',
                welcome: "Welcome"
            }
        },
        //简体中文
        zhCHS: {
            login: {

            },
            message: {
                hello: '你好',
                about: '关于',
                welcome: "欢迎"
            }
        },
        //繁体中文
        zhCHT: {
            login: {

            },
            message: {
                hello: '妳好',
                about: '關於',
                welcome: "歡迎"
            }
        }
    }


    var i18n = new VueI18n({
        locale: 'zhCHT',
        messages: messages
    });

    win.i18n = i18n;

})(this)