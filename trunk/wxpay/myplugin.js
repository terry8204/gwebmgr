/*
* @Author: Marte
* @Date:   2018-01-16 16:41:58
* @Last Modified by:   Marte
* @Last Modified time: 2018-01-16 17:47:43
*/

'use strict';
(function(){

    var defaultOptions = {
        defaultColor : {
            fontColor:"#72BE9C",
            bgColor:"#fff"
        },
        activeColor: {
            bgColor:"#72BE9C",
            fontColor:"#fff"
        },
        isPreventDefault:true,
        isLongClick : false,
        longTime:1000,
        touchstartCall:function(){},
        touchmoveCall:function(){},
        touchendCall:function(){}
    }

   function MyPlugin(self,option){

        this.$dom = $(self);
        this.options = $.extend({}, defaultOptions,option);

        this.maxX = null;
        this.minX = null;
        this.maxY = null;
        this.minY = null;
        this.isPreventDefault = this.options.isPreventDefault;

        this.init();
   };

   MyPlugin.prototype = {
        constructor : MyPlugin,
        init:function(){
            this.touchstartFn();
            this.touchmoveFn();
            this.touchendFn();
        },
        touchstartFn:function(){
            var self = this;
            this.$dom[0].addEventListener("touchstart",function(event){
            	if(self.isPreventDefault){
            		event.preventDefault();
            	}
                
                var elWidth = $(this).width()+10;
                var elHeight = $(this).height()+10;

                self.minX = $(this).offset().left;
                self.minY  = $(this).offset().top;

                self.maxX = self.minX  + elWidth;
                self.maxY = self.minY + elHeight;

                this.style.background = self.options.activeColor.bgColor;
                this.style.color = self.options.activeColor.fontColor;
            },false);
        },
        touchmoveFn:function(){
            var self = this;
            this.$dom[0].addEventListener("touchmove",function(event){
              //  event.preventDefault();
                var touch = event.targetTouches[0];

                var x = touch.pageX;
                var y = touch.pageY;
                
                if(!(x>self.minX && y>self.minY &&  x < self.maxX && y<self.maxY)){
                     this.style.background = self.options.defaultColor.bgColor;
                     this.style.color = self.options.defaultColor.fontColor;
                  //   console.log("过界了 ",self.maxY,self.minY);
                }else{
                    this.style.background = self.options.activeColor.bgColor;
                    this.style.color = self.options.activeColor.fontColor;
                }


            },false);

        },
        touchendFn:function(){
            var self = this;
            this.$dom[0].addEventListener("touchend",function(event){
            //    event.preventDefault();
                var touch = event.changedTouches[0];

                var x = touch.pageX;
                var y = touch.pageY;

                if (x > self.minX && y > self.minY && x < self.maxX && y < self.maxY) {

                     this.style.background = self.options.defaultColor.bgColor;
                     this.style.color = self.options.defaultColor.fontColor;

                    if(self.options.touchendCall){
                        self.options.touchendCall(self.$dom);
                    }else{

                    }

                }
            },false);
        }
   }


   $.fn.MyPlugin = function(options){

        $(this).each(function(){
            new MyPlugin(this,options);
        });

   };

})();



