var utils = {
    sendAjax:function(url,data,callback){
        var encode = JSON.stringify(data);
            $.ajax({
                url:url,
                type:"post",
                data:encode,
                dataType:"json",
                success:function(resp){
                    callback(resp)
                },
                error:function(e){
                    console.log("服务器错误");
                },
                complete:function(){
                   
                }
            })
    }
};