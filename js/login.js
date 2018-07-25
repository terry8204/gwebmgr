"use strict";

new Vue({
    el:"#login-wraper",
    data:{
        formInline: {
            user: '',
            password: ''
        }
    },
    methods: {
        handleSubmit(name) {          
            this.$Message.success('Success!');
        }
    },
    mounted:function () {
        console.log("准备完成")
    }
})

