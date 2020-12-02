
JSWebrtc.Player = (function () {
    "use strict";

    var Player = function (url, options) {
        this.options = options || {};

        if (!url.match(/^webrtc?:\/\//)) {
            throw ("JSWebrtc just work with webrtc");
        }

        if (!this.options.video) {
            throw ("VideoElement is null");
        }

        this.urlParams = JSWebrtc.ParseUrl(url);

        this.pc = null;
        this.autoplay = !!options.autoplay || false;
        this.paused = true;

        // set muted for autoplay
        if (this.autoplay)
            this.options.video.muted = true;

        this.startLoading();
    };

    Player.prototype.getStats = function(){
        var bits = 0;
        if(this.pc!=null){
            bits=  this.pc.getStats() ; 
        }
        return bits;
    }

    Player.prototype.startLoading = function () {
        var _self = this;
        if (_self.pc) {
            _self.pc.close();
        }
        if(adapter.browserDetails.browser == 'chrome'){
            _self.pc = new RTCPeerConnection(null);
        }else{
            _self.pc = new RTCPeerConnection({
                sdpSemantics: 'unified-plan'
              });

            //   _self.pc = new RTCPeerConnection({
            //     sdpSemantics: 'plan-b'
            //   }); 
        }   

        
   
        _self.pc.ontrack = function (event) {
            try{
                _self.options.video['srcObject'] = event.streams[0];
            }catch(e){

            }
        };
        _self.pc.addTransceiver("audio", { direction: "recvonly" });
        _self.pc.addTransceiver("video", { direction: "recvonly" });
        // _self.pc._createTransceiver("video", { direction: "recvonly" });

        _self.pc.createOffer().then(function (offer) {
            return _self.pc.setLocalDescription(offer).then(function () { return offer; });
        }).then(function (offer) {
            return new Promise(function (resolve, reject) {
                var port = 82;
                // var port = _self.urlParams.port || 1985;

                // @see https://github.com/rtcdn/rtcdn-draft
                var api = _self.urlParams.user_query.play || '/rtc/v1/play/';
                if (api.lastIndexOf('/') != api.length - 1) {
                    api += '/';
                }

                var url = 'https://' + _self.urlParams.server + ':' + port + api;
                for (var key in _self.urlParams.user_query) {
                    if (key != 'api' && key != 'play') {
                        url += '&' + key + '=' + _self.urlParams.user_query[key];
                    }
                }

                // @see https://github.com/rtcdn/rtcdn-draft
                var data = {
                    api: url, streamurl: _self.urlParams.url, clientip: null, sdp: offer.sdp
                };
                // console.log("offer: " + JSON.stringify(data));

                JSWebrtc.HttpPost(url, JSON.stringify(data)).then(function (res) {
                    // console.log("answer: " + JSON.stringify(res));
                    resolve(res.sdp);
                }, function (rej) {
                    reject(rej);
                })
            });
        }).then(function (answer) {
            return _self.pc.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp: answer }));
        }).catch(function (reason) {
            throw reason;
        });

        if (this.autoplay) {
            this.play();
        }
    };

    Player.prototype.play = function (ev) {
        if (this.animationId) {
            return;
        }

        this.animationId = requestAnimationFrame(this.update.bind(this));
        this.paused = false;
    };

    Player.prototype.pause = function (ev) {
        if (this.paused) {
            return;
        }

        cancelAnimationFrame(this.animationId);
        this.animationId = null;
        this.isPlaying = false;
        this.paused = true;

        this.options.video.pause();

        if (this.options.onPause) {
            this.options.onPause(this);
        }
    };

    Player.prototype.stop = function (ev) {
        this.pause();
    };

    Player.prototype.destroy = function () {
        this.pause();
        this.pc && this.pc.close() && this.pc.destroy();
        this.audioOut && this.audioOut.destroy();
        this.pc = null;
        this.audioOut = null;
    };

    Player.prototype.update = function () {
        this.animationId = requestAnimationFrame(this.update.bind(this));

        if (this.options.video.readyState < 4) {
            return;
        }

        if (!this.isPlaying) {
            this.isPlaying = true;

            this.options.video.play();
            if (this.options.onPlay) {
                this.options.onPlay(this);
            }
        }
    };


    return Player;

})();