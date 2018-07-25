"use strict";

new Vue({
    el:"#login-wraper",
    data:{
        formInline: {
            user: '',
            password: ''
        },
        single:false,
        account:0
    },
    methods: {
        handleSubmit(name) {          
            this.$Message.success('Success!');
        },
        selectdAccount(account){
            alert(account)
            this.account = account;
        }
    },
    mounted:function () {
        console.log("准备完成")
    }
})

