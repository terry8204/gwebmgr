(function(window) {
    //兼容
    window.URL = window.URL || window.webkitURL;
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

    var HZRecorder = function(stream, config) {
        config = config || {};
        config.sampleBits = config.sampleBits || 8; //采样数位 8, 16
        config.sampleRate = config.sampleRate || (44100 / 6); //采样率(1/6 44100)

        var context = new(window.webkitAudioContext || window.AudioContext)();
        var audioInput = context.createMediaStreamSource(stream);
        var createScript = context.createScriptProcessor || context.createJavaScriptNode;
        var recorder = createScript.apply(context, [16384, 1, 1]);
        lame = new lamejs();
        mp3Encoder = new lame.Mp3Encoder(1, config.sampleRate || 44100, config.sampleBits || 128);


        var floatTo16BitPCM = function(input, output) {
            for (var i = 0; i < input.length; i++) {
                var s = Math.max(-1, Math.min(1, input[i]));
                output[i] = (s < 0 ? s * 0x8000 : s * 0x7FFF);
            }
        };

        var convertBuffer = function(arrayBuffer) {
            var data = new Float32Array(arrayBuffer);
            var out = new Int16Array(arrayBuffer.length);
            floatTo16BitPCM(data, out);
            return out;
        };

        var encode = function(arrayBuffer) {
            var transformData = [];
            var maxSamples = 1152;
            var samplesMono = convertBuffer(arrayBuffer);
            var remaining = samplesMono.length;
            for (var i = 0; remaining >= 0; i += maxSamples) {
                var left = samplesMono.subarray(i, i + maxSamples);
                var mp3buf = mp3Encoder.encodeBuffer(left);
                transformData.push(mp3buf);
                remaining -= maxSamples;
            }
            // transformData.push(mp3Encoder.flush());
            return transformData;
        };
        var audioData = {
            size: 0 //录音文件长度
                ,
            buffer: [] //录音缓存
                ,
            callback: config.callback,
            inputSampleRate: context.sampleRate //输入采样率
                ,
            inputSampleBits: 16 //输入采样数位 8, 16
                ,
            outputSampleRate: config.sampleRate //输出采样率
                ,
            oututSampleBits: config.sampleBits //输出采样数位 8, 16
                ,
            input: function(data) {
                //this.buffer = [];
                // this.buffer.push(new Float32Array(data));
                this.buffer = data;
                //this.buffer = new Float32Array(data);
                this.size += data.length;
                this.encodeMP3();

            },
            encodeMP3: function() {
                var that = this;
                var mp3Buffer = encode(this.buffer);
                var blob = new Blob(mp3Buffer, {
                    type: 'audio/mp3'
                });
                var reader = new FileReader();
                reader.readAsArrayBuffer(blob);
                reader.onload = function(e) {
                    var buf = new Uint8Array(reader.result);
                    var dataLength = buf.length;
                    that.callback && that.callback(config.sampleRate, config.sampleBits, dataLength, buf);
                }
            }

        };

        //开始录音
        this.start = function() {
            audioInput.connect(recorder);
            recorder.connect(context.destination);
        }

        //停止
        this.stop = function() {

            recorder.disconnect();
        }

        //音频采集
        recorder.onaudioprocess = function(e) {
            audioData.input(e.inputBuffer.getChannelData(0));
            //record(e.inputBuffer.getChannelData(0));
        }

    };
    //抛出异常
    HZRecorder.throwError = function(message) {
            isRecordingRights = false;
            // new Vue().$Message.error(message);
            // throw new function () { this.toString = function () { return message; } }
        }
        //是否支持录音
    HZRecorder.canRecording = (navigator.getUserMedia != null);
    //获取录音机
    HZRecorder.get = function(callback, config) {
        if (callback) {
            if (navigator.getUserMedia) {
                navigator.getUserMedia({
                        audio: true,
                        audio: true
                    } //只启用音频
                    ,
                    function(stream) {
                        var rec = new HZRecorder(stream, config);
                        callback(rec);
                    },
                    function(error) {

                        switch (error.code || error.name) {
                            case 'PERMISSION_DENIED':
                            case 'PermissionDeniedError':
                                HZRecorder.throwError('用户拒绝提供信息。');
                                break;
                            case 'NOT_SUPPORTED_ERROR':
                            case 'NotSupportedError':
                                HZRecorder.throwError('浏览器不支持硬件设备。');
                                break;
                            case 'MANDATORY_UNSATISFIED_ERROR':
                            case 'MandatoryUnsatisfiedError':
                                HZRecorder.throwError('无法发现指定的硬件设备。');
                                break;
                            case 8:
                                HZRecorder.throwError('没有检测到录音设备,无法录音。');
                                break;
                            default:
                                HZRecorder.throwError('无法打开麦克风。异常信息:' + (error.code || error.name));
                                break;
                        }
                    });
            } else {
                isRecordingRights = false
                    // HZRecorder.throwError('当前浏览器不支持录音功能。');
                return;
            }
        }
    }

    // 判断端字节序
    HZRecorder.littleEdian = (function() {
        var buffer = new ArrayBuffer(2);
        new DataView(buffer).setInt16(0, 256, true);
        return new Int16Array(buffer)[0] === 256 ? 1 : 0;
    })();

    window.HZRecorder = HZRecorder;

})(window);

var lame = null;
var myRecorder = null;
var audioPlayer = null;
var isRecordingRights = true;
var isLoadLastPositon = false;
var sn = 0;
var gMapIconList = {};
HZRecorder.get(
    function(rec) {
        myRecorder = rec;
    }, {
        sampleRate: 44100,
        sampleBits: 128,
        callback: function(sampleRate, sampleBits, dataLength, bytes) {
            sn++;
            var url = myUrls.uploadAudio();
            var data = {
                deviceid: vRoot.$children[1].currentVideoDeviceInfo.deviceId,
                codec: 'mp3',
                datasize: dataLength,
                samplebits: 32,
                littleedian: HZRecorder.littleEdian,
                channel: vRoot.$children[1].audiochannel,
                sn: sn,
                // data:arrayBufferToBase64(buf),
                hexdata: utils.Bytes2HexStr(bytes),
                numberofchannels: 1,
                samplerate: sampleRate,
            };
            sn++;
            utils.sendAjax(url, data, function(resp) {
                console.log('发送成功', resp);
            })
        }
    });

// 定位监控
var monitor = {
    template: document.getElementById('monitor-template').innerHTML,
    data: function() {
        var vm = this;
        return {
            resolution: "8",
            cameraChannel: 1,
            isDestory: true,
            isMouseoverTop35: false,
            isLuyin: false,
            isShowYunTai: false,
            isOpenJianting: false,
            listingChoice: 'duijiang',
            brightness: 128, //1     亮度
            constract: 0, // 2      对比度
            hue: 0, //         色度                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      
            saturate: 128, // 4       饱和度                                                                                  
            exposure: 128, // 5 
            audioPlayerTip: '',
            speechTimer: null,
            imgSrc: './images/luyin/ic_record_ripple@2x-9.png',
            isMute: false,
            setupVideoModal: false,
            videoProperty: {},
            safetyDeviceAdas: {},
            safetyDeviceDsm: {},
            safetyDeviceTpms: {},
            safetyDeviceBsd: {},
            channelsData: [],
            currentVideoDeviceInfo: {
                deviceId: null,
                deviceName: '',
                videochannelcount: 4,
            },
            physicalchannel1: '2',
            physicalchannel2: '2',
            physicalchannel3: '2',
            physicalchannel4: '2',
            physicalchannel5: '2',
            physicalchannel6: '2',
            physicalchannel7: '2',
            physicalchannel8: '2',
            // 音视频参数设置
            realtimebitratemode: '',
            storebitratemode: '',
            realtimeresolution: '',
            storeresolution: '',
            realtimekeyframeinterval: '',
            storekeyframeinterval: '',
            realtimeframerate: '',
            storeframerate: '',
            realtimeframebitrate: '',
            storeframebitrate: '',
            videoCheckboxGroup: [],
            usingaudio: '',

            // 视频播放参数
            videotranstype: '',
            videostreamtype: '',
            audiochannel: '',
            historyaudiocodec: '0',
            realtimeaudiocodec: '0',
            manualvideocodec: '0',
            needuploadfilename: false,
            videotimestamptype: '0',
            videochannelcount: 4,

            isMapMode: true, //是否地图模式
            videoNumber: 4,
            arealoading: false,
            isFullMap: false,
            isShowAreaCount: false,
            areaName: [],
            areaAddress: [],
            areaMovingCount: 0,
            areaOfflineCount: 0,
            areaStaticCount: 0,
            provinceList: provinceList,
            readonly: true,
            cmdSettings: {},
            placeholder: "",
            isLoadGroup: true,
            isSpin: true,
            isShowRecordBtn: false,
            isShowBmsBtn: false,
            isShowObdBtn: false,
            isShowWatermeterBtn: false,
            isShowVideoBtn: false,
            isShowActiveSafetyBtn: false,
            map: null,
            isOpenDistance: false,
            placement: "right-start",
            mapType: utils.getMapType(),
            isShowLabel: false,
            sosoValue: '', // 搜索框的值
            sosoData: [], // 搜索框里面的数据
            openGroupIds: {},
            selectedState: 'all', // 选择nav的状态 all online offline;
            companys: [], //公司名称id
            groups: [], // 原始列表数据
            videoGroups: [], //视频数据
            intervalTime: null, // 多久刷新一次设备
            offlineTime: 10 * 60 * 1000, // 根据这个时间算出是否离线
            allDevCount: 0, // 全部设备的个数
            onlineDevCount: 0, // 在线设备个数
            offlineDevCount: 0, // 离线设备个数
            staredDevCount: 0, //库存
            isMoveTriggerEvent: true, // 地图移动是否触发事件
            intervalInstanse: null, // 定时器实例
            selectedDevObj: {
                videochannelcount: 4,
            }, // 选中的设备信息
            myDis: null, // 测距实例
            filterData: [],
            timeoutIns: null,
            isShowMatchDev: false,
            editDevModal: false, // 编辑设备模态
            dispatchDirectiveModal: false, // 下发指令模态
            deviceInfoModal: false, // 设备基本信息模态
            directiveReportModal: false, //指令记录
            currentDeviceName: "",
            editDevData: { //编辑的设备信息
                devicename: '',
                simnum: '',
                deviceid: '',
                remark: '',
                loginname: '',
            },
            ownerInfoModal: false,
            cameraModal: false,
            cameraImgUrl: '',
            // cameraImgUrl:'http://localhost:8080/gpsserver/mediapath/audiorecord/13555000004/f6878cb_1600653383172.JPEG',
            cameraImgModal: false,
            ownerInfoData: { //编辑的设备信息
                deviceid: '',
                ownername: '',
                phonenum1: '',
                phonenum2: '',
                idnum: '',
                gender: '',
                ownerremark: '',
                address: ''
            },
            expirenotifytime: DateFormat.longToDateTimeStr(Date.now(), 0),
            currentDeviceType: null, // 选中设备的类型
            currentDevDirectiveList: [], // 选中设备的类型对应的设备指令
            currentDevCreateUserGroupList: [], // 选中设备的类型对应的设备指令
            selectedCmdInfo: {}, // 选中设备指令的信息
            cmdParams: {},
            deviceBaseInfo: {},
            loading: false,
            selectedTypeVal: null,
            cacheColumns: [
                { title: isZh ? '编号' : 'index', key: "index", width: 80, align: 'center', sortable: true },
                { title: isZh ? '设备序号' : 'Device ID', key: 'deviceid', width: 153.5 },
                { title: isZh ? '指令名称' : 'Cmd name', key: 'cmdname', sortable: true, width: 153.5 },
                { title: isZh ? '发送时间' : 'Send date', key: 'sendtimeStr', width: 170, sortable: true },
                { title: isZh ? '发送参数' : 'Send parmas', key: 'cmdparams', sortable: true, width: 153.5 },
                {
                    title: isZh ? '操作' : "Action",
                    key: 'action',
                    width: 100,
                    // align: 'center',
                    render: function(h, params) {
                        return h('div', [
                            h('Poptip', {
                                props: {
                                    confirm: true,
                                    title: isZh ? '确定取消吗?' : "cancelled ?"
                                },
                                on: {
                                    'on-ok': function() {
                                        var url = myUrls.deleteCacheCmd();
                                        utils.sendAjax(url, { cachecmdid: params.row.cachecmdid }, function(resp) {
                                            if (resp.status == 0) {
                                                vm.$Message.success(isZh ? "取消成功" : "Cancel successfully");
                                                vm.cacheTableData.splice(params.index, 1);
                                                vm.cacheTableData.forEach(function(item, index) {
                                                    item.index = ++index;
                                                });
                                            } else if (resp.status == 1) {
                                                vm.$Message.error(isZh ? "取消失败" : "Cancel fail");
                                            }
                                        })
                                    }
                                }
                            }, [
                                h('Button', {
                                    props: {
                                        type: 'primary',
                                        size: 'small'
                                    }
                                }, isZh ? "取消" : "Cancel")
                            ])
                        ]);
                    },
                }
            ],
            sendColumns: [
                { title: isZh ? '编号' : 'index', key: "index", width: 80, align: 'center', sortable: true },
                { title: isZh ? '设备序号' : '', key: 'deviceid', width: 139.5 },
                { title: isZh ? '指令名称' : 'Cmd name', key: 'cmdname', sortable: true, width: 139.5 },
                { title: isZh ? '发送时间' : 'Send date', key: 'sendtimeStr', width: 170, sortable: true },
                { title: isZh ? '发送参数' : 'Send Params ', key: 'cmdparams', sortable: true, width: 139.5 },
                { title: isZh ? '结果' : 'Result', key: 'result', sortable: true, width: 139.5 },
            ],
            cacheTableData: [],
            sendTableData: [],
            cmdPwd: null, //指令密码
            lastquerypositiontime: 0,
            videoChannelsColumns: [{
                key: 'physicalchannel',
                title: vm.$t('videoSettings.physicalChannel'),
            }, {
                key: 'logicalchannel',
                title: vm.$t('videoSettings.logicalChannel'),
            }, {
                key: 'channeltype',
                title: vm.$t('videoSettings.channelType'),
                render: function(h, params) {
                    var channeltype = params.row.channeltype,
                        type;
                    if (channeltype === 0) {
                        type = vm.$t('videoSettings.audioAndVideo');
                    } else if (channeltype === 1) {
                        type = vm.$t('videoSettings.audio');
                    } else if (channeltype === 2) {
                        type = vm.$t('videoSettings.video');
                    }
                    return h('span', {}, type);
                }
            }, {
                key: 'connectptz',
                title: vm.$t('videoSettings.connectPTZ'),
                render: function(h, params) {
                    var connectptz = params.row.connectptz;
                    return h('span', {}, connectptz === 0 ? vm.$t('videoSettings.notConnected') : vm.$t('videoSettings.connected'));
                }
            }, ],
            videoChannelsTableData: [],
            playerItems: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
            option: {
                sort: false,
            }
        }
    },
    methods: {
        onSelectMap: function(item) {
            this.mapType = item.mapType;
            this.setMapType(item);
        },
        onSwitchTraffic: function(traffic) {
            var isBMap = this.mapType == 'bMap';
            if (traffic) {
                if (isBMap) {
                    this.baiduTrafficLayer.show();
                } else {
                    this.googleTrafficLayer.show();
                }
            } else {
                if (isBMap) {
                    this.baiduTrafficLayer.hide();
                } else {
                    this.googleTrafficLayer.hide();
                }
            }
        },
        addTrafficLayer: function(traffic) {

            if (this.baiduTrafficLayer == null) {
                this.baiduTrafficLayer = new maptalks.TileLayer("baidutraffic", {

                    urlTemplate: function(x, y, z) {
                        var domain = '';
                        if (this.options && this.options['subdomains']) {
                            var subdomains = this.options['subdomains'];
                            if (isArrayHasData(subdomains)) {
                                var length = subdomains.length;
                                var s = (x + y) % length;
                                if (s < 0) {
                                    s = 0;
                                }
                                domain = subdomains[s];
                            }
                        }
                        var data = {
                            'x': x,
                            'y': y,
                            'z': z,
                            'domain': domain,
                            'time': Date.now()
                        };
                        var URL_PATTERN = /\{ *([\w_]+) *\}/g;
                        return baiduTrafficUrlTemplate.replace(URL_PATTERN, function(str, key) {
                            var value = data[key];

                            if (value === undefined) {
                                throw new Error('No value provided for variable ' + str);

                            } else if (typeof value === 'function') {
                                value = value(data);
                            }
                            return value;
                        });
                    }
                });
                this.map.addLayer(this.baiduTrafficLayer);
                this.baiduTrafficLayer.hide();
            }

            if (this.googleTrafficLayer == null) {
                this.googleTrafficLayer = new maptalks.TileLayer("googletraffic", {
                    urlTemplate: function(x, y, z) {

                        y = Math.pow(2, z) - 1 - y;
                        var domain = '';
                        if (this.options && this.options['subdomains']) {
                            var subdomains = this.options['subdomains'];
                            if (isArrayHasData(subdomains)) {
                                var length = subdomains.length;
                                var s = (x + y) % length;
                                if (s < 0) {
                                    s = 0;
                                }
                                domain = subdomains[s];
                            }
                        }
                        var data = {
                            'x': x,
                            'y': y,
                            'z': z,
                            'domain': domain,
                            'time': Date.now()
                        };
                        var URL_PATTERN = /\{ *([\w_]+) *\}/g;
                        return googleTrafficUrlTemplate.replace(URL_PATTERN, function(str, key) {
                            var value = data[key];

                            if (value === undefined) {
                                throw new Error('No value provided for variable ' + str);

                            } else if (typeof value === 'function') {
                                value = value(data);
                            }
                            return value;
                        });
                    }
                });
                this.map.addLayer(this.googleTrafficLayer);
                this.googleTrafficLayer.hide();
            }

            this.onSwitchTraffic(traffic);

        },
        handleClickTools: function(name) {
            var me = this;
            var newMapType = me.mapType;
            var cssFilter = "sepia(100%) invert(90%)";
            switch (name) {
                case 'openDistance':
                    this.openDistance();
                    break;
                case 'normal':
                    if (newMapType == 'bMap') {
                        var layer = new maptalks.TileLayer('base', {
                            'urlTemplate': 'https://maponline2.bdimg.com/tile/?qt=vtile&styles=pl&scaler=2&udt=20201217&from=jsapi2_0&x={x}&y={y}&z={z}',
                            'subdomains': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
                            'attribution': '&copy; <a target="_blank" href="http://map.baidu.com">Baidu</a>',
                        })
                        me.map.setBaseLayer(layer);
                    } else if (newMapType == 'gMap') {
                        var layer = new maptalks.TileLayer('base', {
                            urlTemplate: "http://mt2.google.cn/vt?lyrs=m@180000000&hl=zh-CN&gl=cn&scale=2&src=app&x={x}&y={y}&z={z}&s=Gal",
                        })
                        me.map.setBaseLayer(layer);
                    } else if (newMapType == 'aMap') {
                        var layer = new maptalks.TileLayer('base', {
                            urlTemplate: 'http://webrd04.is.autonavi.com/appmaptile?lang=zh_cn&scale=2&style=8&x={x}&y={y}&z={z}',
                        })
                        me.map.setBaseLayer(layer);
                    }
                    break;
                case 'midnight':
                    if (newMapType == 'bMap') {
                        var layer = new maptalks.TileLayer('base', {
                            urlTemplate: 'https://maponline2.bdimg.com/tile/?qt=vtile&styles=pl&scaler=2&udt=20201217&from=jsapi2_0&x={x}&y={y}&z={z}',
                            subdomains: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
                            attribution: '&copy; <a target="_blank" href="http://map.baidu.com">Baidu</a>',
                            cssFilter: cssFilter
                        })
                        me.map.setBaseLayer(layer);
                    } else if (newMapType == 'gMap') {
                        var layer = new maptalks.TileLayer('base', {
                            urlTemplate: "http://mt2.google.cn/vt?lyrs=m@180000000&hl=zh-CN&gl=cn&scale=2&src=app&x={x}&y={y}&z={z}&s=Gal",
                            cssFilter: cssFilter,
                        })
                        me.map.setBaseLayer(layer);
                    } else if (newMapType == 'aMap') {
                        var layer = new maptalks.TileLayer('base', {
                            urlTemplate: 'http://webrd04.is.autonavi.com/appmaptile?lang=zh_cn&scale=2&style=8&x={x}&y={y}&z={z}',
                            cssFilter: cssFilter
                        })
                        me.map.setBaseLayer(layer);
                    }
                    break;
                case 'carName':
                    me.isShowLabel = !me.isShowLabel;
                    break;
            }
        },
        insertNodeAt: function(fatherNode, node, position) {
            var refNode = position === 0 ? fatherNode.children[0] : fatherNode.children[position - 1].nextSibling;
            fatherNode.insertBefore(node, refNode);
        },
        computeVmIndex: function(vnodes, element) {
            var liList = Array.prototype.slice.call(vnodes)
            return liList.map(function(elt) {
                return elt;
            }).indexOf(element);
        },
        onDragstart: function(event) {
            // event.target 都返回源元素
            this.startExchangeIndex = event.target.getAttribute('data-id')
            var parentElement = this.$refs.videoContent;
            var startElement = document.getElementsByClassName('vpw' + this.startExchangeIndex)[0];
            this.kaishiIndex = this.computeVmIndex(parentElement.children, startElement)

        },
        onDragend: function(event) {
            // event.target 都返回源元素
            var startElement = document.getElementsByClassName('vpw' + this.startExchangeIndex)[0];
            var endElement = document.getElementsByClassName('vpw' + this.endExchangeIndex)[0];
            var parentElement = this.$refs.videoContent;
            if (this.kaishiIndex > this.jieshuIndex) {
                this.insertNodeAt(parentElement, startElement, this.jieshuIndex);
                this.insertNodeAt(parentElement, endElement, this.kaishiIndex + 1);
            } else {
                this.insertNodeAt(parentElement, startElement, this.jieshuIndex);
                this.insertNodeAt(parentElement, endElement, this.kaishiIndex);
            }
        },
        onDrop: function(event) {
            // event.target 都返回目标元素
            this.endExchangeIndex = event.target.parentElement.parentElement.parentElement.getAttribute('data-id')
            var parentElement = this.$refs.videoContent;
            var endElement = document.getElementsByClassName('vpw' + this.endExchangeIndex)[0];
            this.jieshuIndex = this.computeVmIndex(parentElement.children, endElement)
        },
        onDragover: function(event) {
            // 阻止元素的默认行为，不然ondrop不管用
            event.preventDefault();
        },
        initAudioPlayer: function(url) {
            if (audioPlayer != null) {
                audioPlayer.pause();
                audioPlayer.unload();
                audioPlayer.detachMediaElement();
                audioPlayer.destroy();
                audioPlayer = null;
            };
            // audioPlayer = flvjs.createPlayer({
            //     type: 'flv',
            //     url: url,
            //     isLive: true,
            //     hasAudio: true,
            //     hasVideo: false,
            //     withCredentials: false,
            // }, {
            //     enableWorker: false,
            //     enableStashBuffer: false,
            //     isLive: true,
            //     lazyLoad: false
            // });
            audioPlayer = mpegts.createPlayer({
                type: 'flv',
                url: url
            }, {
                enableWorker: true,
                lazyLoadMaxDuration: 3 * 60,
                seekType: 'range',
                liveBufferLatencyChasing: true,
            });
            var player = document.getElementById('audio-player');
            audioPlayer.attachMediaElement(player);
            audioPlayer.load(); //加载
            audioPlayer.play();
        },
        onMousedown: function() {
            var that = this;
            if (!that.isOpenJianting) {
                that.$Message.error(this.$t('monitor.openJianTingTip'));
                return;
            };
            try {
                that.isLuyin = true;
                that.setSpeechTimer();
                myRecorder.start();
                document.onmouseup = function() {
                    that.isLuyin = false;
                    myRecorder.stop();
                    document.onmousemove = null;
                    document.onmouseup = null;
                    clearTimeout(that.speechTimer);
                    setTimeout(function() {
                        sn = 1;
                    }, 1000);
                };
            } catch (error) {
                vRoot.$Message.error(this.$t('monitor.browserDoesNotSupportRecording'));
            }
            return false;
        },
        setSpeechTimer: function() {
            var index = [9, 8, 7, 6, 5, 4, 3, 2, 1, 2, 3, 4, 5, 6, 7, 8, 9];
            var num = index.length,
                that = this;
            this.speechTimer = setInterval(function() {
                setTimeout(function() {
                    num++;
                    that.imgSrc = "./images/luyin/ic_record_ripple@2x-" + index[num] + ".png";
                }, 70);
                if (num >= index.length - 1) {
                    num = 0;
                }
            }, 70);
        },
        defaultQualityParams: function() {
            var me = this;
            me.brightness = 128;
            me.constract = 0;
            me.hue = 0;
            me.saturate = 128;
            me.exposure = 128;
        },
        openDuijiang: function() {
            if (this.currentVideoDeviceInfo.deviceId == null) {
                return;
            }
            if (isRecordingRights == false) {
                this.$Message.error(this.$t('monitor.browserDoesNotSupportRecording'));
                return;
            };
            var me = this;
            if (this.isOpenJianting) {
                this.isOpenJianting = false;
                audioPlayer.pause();
                audioPlayerTime = 0;
                me.$Message.success(me.$t('monitor.closeSucc'));
                me.audioPlayerTip = me.$t('monitor.jiantingYiclose');
                var url = myUrls.stopAudio();
                utils.sendAjax(url, {
                    deviceid: this.currentVideoDeviceInfo.deviceId,
                    channel: Number(this.audiochannel),
                }, function() {});
            } else {
                this.loading = true;
                var datatype = 3;
                if (this.listingChoice == "duijiang") {
                    datatype = 2;
                }

                var url = myUrls.startAudio();
                var data = {
                    deviceid: this.currentVideoDeviceInfo.deviceId,
                    channel: Number(this.audiochannel),
                    datatype: datatype,
                    playtype: ishttps ? 'flvs' : 'flv',
                }
                utils.sendAjax(url, data, function(resp) {
                    me.loading = false;
                    if (resp.status === 6) {
                        me.isOpenJianting = true;
                        me.$Message.success(me.$t('monitor.openSucc'));
                        audioPlayerTime = Date.now();
                        me.initAudioPlayer(resp.record.playurl);
                        me.audioPlayerTip = me.$t('monitor.openJianTingTip1');
                    } else {
                        me.$Message.error(me.$t('monitor.openFail'));
                    }
                });
            }

        },
        handleSetPlayParamter: function() {

            if (this.currentVideoDeviceInfo.deviceId == null) {
                this.$Message.error(this.$t('monitor.selectVideoDevice'));
                return;
            }

            var url = myUrls.setVideoPlayParameters(),
                that = this;
            if (!(typeof Number(this.audiochannel) === 'number' && !isNaN(this.audiochannel))) {
                that.$Message.error(that.$t('monitor.channelIsNumber'));
                return;
            }

            var data = {
                deviceid: this.currentVideoDeviceInfo.deviceId,
                audiochannel: Number(this.audiochannel),
                videotranstype: Number(this.videotranstype),
                videostreamtype: Number(this.videostreamtype),
                historyaudiocodec: Number(this.historyaudiocodec),
                realtimeaudiocodec: Number(this.realtimeaudiocodec),
                manualvideocodec: Number(this.manualvideocodec),
                needuploadfilename: this.needuploadfilename ? 1 : 0,
                videotimestamptype: Number(this.videotimestamptype),
                videochannelcount: this.videochannelcount,
                channelinfos: []
            }

            for (var i = 1; i <= this.videochannelcount; i++) {
                data.channelinfos.push({
                    physicalchannel: i,
                    channeltype: Number(this['physicalchannel' + i])
                });
            }

            this.loading = true;
            utils.sendAjax(url, data, function(resp) {
                if (resp.status === 0) {
                    that.$Message.success(that.$t('monitor.setupSucc'));
                    that.deviceInfos[that.currentDeviceId].videochannelcount = data.videochannelcount;
                } else {
                    that.$Message.error(that.$t('monitor.setupFail'));
                }
                that.loading = false;
            }, function() {
                that.loading = false;
            })
        },
        queryVideoPlayParameters: function() {
            if (this.currentVideoDeviceInfo.deviceId == null) {
                this.$Message.error(this.$t('monitor.selectVideoDevice'));
                return;
            }
            var url = myUrls.queryVideoPlayParameters(),
                me = this;
            me.loading = true;
            utils.sendAjax(url, {
                deviceid: this.currentVideoDeviceInfo.deviceId
            }, function(respData) {
                if (respData.status == 0) {
                    me.historyaudiocodec = String(respData.historyaudiocodec);
                    me.realtimeaudiocodec = String(respData.realtimeaudiocodec);
                    me.manualvideocodec = String(respData.manualvideocodec);
                    me.needuploadfilename = respData.needuploadfilename == 1 ? true : false;
                    me.videotimestamptype = String(respData.videotimestamptype);
                    me.videochannelcount = Number(respData.videochannelcount);
                    var channelinfos = respData.channelinfos;
                    channelinfos.forEach(function(item) {
                        if (item.physicalchannel == 1) {
                            me.physicalchannel1 = String(item.channeltype);
                        } else if (item.physicalchannel == 2) {
                            me.physicalchannel2 = String(item.channeltype);
                        } else if (item.physicalchannel == 3) {
                            me.physicalchannel3 = String(item.channeltype);
                        } else if (item.physicalchannel == 4) {
                            me.physicalchannel4 = String(item.channeltype);
                        } else if (item.physicalchannel == 5) {
                            me.physicalchannel5 = String(item.channeltype);
                        } else if (item.physicalchannel == 6) {
                            me.physicalchannel6 = String(item.channeltype);
                        } else if (item.physicalchannel == 7) {
                            me.physicalchannel7 = String(item.channeltype);
                        } else if (item.physicalchannel == 8) {
                            me.physicalchannel8 = String(item.channeltype);
                        }
                    });
                    me.$Message.success(me.$t('monitor.querySucc'));
                } else {
                    me.$Message.error(me.$t('monitor.queryFail'));
                }
                me.loading = false;
            }, function() {
                me.loading = false;
            });
        },
        queryDeviceById: function() {
            var url = myUrls.queryDeviceById(),
                that = this;
            utils.sendAjax(url, {
                deviceid: this.currentVideoDeviceInfo.deviceId
            }, function(data) {
                if (data.status == 0) {

                    that.videotranstype = data.device.videotranstype + '';
                    that.videostreamtype = data.device.videostreamtype + '';
                    that.audiochannel = data.device.audiochannel;
                } else {}
            })
        },
        setSingleAudioVideoParameters: function(index) {
            if (this.currentVideoDeviceInfo.deviceId == null) {
                this.$Message.error(this.$t('monitor.selectVideoDevice'));
                return;
            }
            var originalData = this.channelsData[index];
            var parameters = {};
            if (
                originalData.realtimebitratemode &&
                originalData.storebitratemode &&
                originalData.realtimeresolution &&
                originalData.storeresolution &&
                originalData.realtimekeyframeinterval &&
                originalData.storekeyframeinterval &&
                originalData.realtimeframerate &&
                originalData.realtimeframebitrate &&
                originalData.storeframebitrate
            ) {
                parameters.realtimebitratemode = Number(originalData.realtimebitratemode);
                parameters.storebitratemode = Number(originalData.storebitratemode);
                parameters.realtimeresolution = Number(originalData.realtimeresolution);
                parameters.storeresolution = Number(originalData.storeresolution);
                parameters.realtimekeyframeinterval = originalData.realtimekeyframeinterval;
                parameters.storekeyframeinterval = originalData.storekeyframeinterval;
                parameters.realtimeframerate = originalData.realtimeframerate;
                parameters.realtimeframebitrate = originalData.realtimeframebitrate;
                parameters.storeframebitrate = originalData.storeframebitrate;


                var options = ['dateandtime', 'carnum', 'channel', 'latlon', 'recorderspeed', 'gpsspeed', 'drivingtime'];
                var videoCheckboxGroup = originalData.videoCheckboxGroup;
                var url = myUrls.setSingleAudioVideoParameters(),
                    me = this;
                options.forEach(function(item) {
                        if (videoCheckboxGroup.indexOf(item) != -1) {
                            parameters[item] = true;
                        } else {
                            parameters[item] = false;
                        }
                    })
                    // parameters.deviceid = deviceid;
                parameters.channelnum = ++index;

                utils.sendAjax(url, {
                    deviceid: this.currentVideoDeviceInfo.deviceId, //globalDeviceId
                    parameters: [parameters]
                }, function(data) {
                    var status = data.status;
                    if (status == CMD_SEND_RESULT_UNCONFIRM) {
                        me.$Message.error(me.$t('monitor.CMD_SEND_RESULT_UNCONFIRM'));
                    } else if (status === CMD_SEND_RESULT_PASSWORD_ERROR) {
                        me.$Message.error(me.$t('monitor.CMD_SEND_RESULT_PASSWORD_ERROR'));
                    } else if (status === CMD_SEND_RESULT_OFFLINE_NOT_CACHE) {
                        me.$Message.error(me.$t('monitor.CMD_SEND_RESULT_OFFLINE_NOT_CACHE'));
                    } else if (status === CMD_SEND_RESULT_OFFLINE_CACHED) {
                        me.$Message.error(me.$t('monitor.CMD_SEND_RESULT_OFFLINE_CACHED'));
                    } else if (status === CMD_SEND_RESULT_MODIFY_DEFAULT_PASSWORD) {
                        me.$Message.error(me.$t('monitor.CMD_SEND_RESULT_MODIFY_DEFAULT_PASSWORD'));
                    } else if (status === CMD_SEND_RESULT_DETAIL_ERROR) {
                        me.$Message.error(me.$t('monitor.CMD_SEND_RESULT_DETAIL_ERROR') + resp.cause);
                    } else if (status === CMD_SEND_CONFIRMED) {
                        me.$Message.success(me.$t('monitor.CMD_SEND_CONFIRMED'));
                    } else if (status === CMD_SEND_OVER_RETRY_TIMES) {
                        me.$Message.error(me.$t('monitor.CMD_SEND_OVER_RETRY_TIMES'));
                    } else if (status === CMD_SEND_SYNC_TIMEOUT) {
                        me.$Message.error(me.$t('monitor.CMD_SEND_SYNC_TIMEOUT'));
                    }
                })
            }
        },
        queryVideoProperty: function() {
            if (this.currentVideoDeviceInfo.deviceId == null) {
                this.$Message.error(this.$t('monitor.selectVideoDevice'));
                return;
            }
            this.loading = true;
            var url = myUrls.queryVideoProperty(),
                that = this;
            utils.sendAjax(url, {
                deviceid: this.currentVideoDeviceInfo.deviceId, //globalDeviceId
            }, function(data) {
                var status = data.status;
                if (status == CMD_SEND_RESULT_UNCONFIRM) {
                    that.$Message.error(that.$t('monitor.CMD_SEND_RESULT_UNCONFIRM'));
                } else if (status === CMD_SEND_RESULT_PASSWORD_ERROR) {
                    that.$Message.error(that.$t('monitor.CMD_SEND_RESULT_PASSWORD_ERROR'));
                } else if (status === CMD_SEND_RESULT_OFFLINE_NOT_CACHE) {
                    that.$Message.error(that.$t('monitor.CMD_SEND_RESULT_OFFLINE_NOT_CACHE'));
                } else if (status === CMD_SEND_RESULT_OFFLINE_CACHED) {
                    that.$Message.error(that.$t('monitor.CMD_SEND_RESULT_OFFLINE_CACHED'));
                } else if (status === CMD_SEND_RESULT_MODIFY_DEFAULT_PASSWORD) {
                    that.$Message.error(that.$t('monitor.CMD_SEND_RESULT_MODIFY_DEFAULT_PASSWORD'));
                } else if (status === CMD_SEND_RESULT_DETAIL_ERROR) {
                    that.$Message.error(that.$t('monitor.CMD_SEND_RESULT_DETAIL_ERROR') + resp.cause);
                } else if (status === CMD_SEND_CONFIRMED) {
                    that.$Message.success(that.$t('monitor.CMD_SEND_CONFIRMED'));
                    var audiosamplerate = data.audiosamplerate;
                    switch (audiosamplerate) {
                        case 0:
                            data.audiosamplerate = '8 kHz';
                            break;
                        case 1:
                            data.audiosamplerate = '22.05 kHz';
                            break;
                        case 2:
                            data.audiosamplerate = '44.1 kHz';
                            break;
                        case 3:
                            data.audiosamplerate = '48 kHz';
                            break;
                    }
                    var audiosamplebits = data.audiosamplebits;
                    switch (audiosamplebits) {
                        case 0:
                            data.audiosamplebits = '8bits';
                            break;
                        case 1:
                            data.audiosamplebits = '16bits';
                            break;
                        case 2:
                            data.audiosamplebits = '32bits';
                            break;
                    }
                    that.videoProperty = data;
                    that.videoPropertyModal = true;
                } else if (status === CMD_SEND_OVER_RETRY_TIMES) {
                    that.$Message.error(that.$t('monitor.CMD_SEND_OVER_RETRY_TIMES'));
                } else if (status === CMD_SEND_SYNC_TIMEOUT) {
                    that.$Message.error(that.$t('monitor.CMD_SEND_SYNC_TIMEOUT'));
                }
                that.loading = false;
            }, function() {
                that.loading = false;
            });
        },
        videoBack: function() {
            var device = this.deviceInfos[globalDeviceId];
            window.open('videoback.html?deviceid=' + globalDeviceId + '&token=' + token + '&devicename=' + device.devicename);
        },
        openActiveSafety: function() {
            var device = this.deviceInfos[globalDeviceId];
            openActiveSafety(globalDeviceId, device.devicename);
        },
        queryVideoChannels: function() {
            if (this.currentVideoDeviceInfo.deviceId == null) {
                this.$Message.error(this.$t('monitor.selectVideoDevice'));
                return;
            }
            var url = myUrls.queryAudioVideoChannels(),
                me = this;
            me.loading = true;
            utils.sendAjax(url, {
                deviceid: this.currentVideoDeviceInfo.deviceId
            }, function(resp) {
                me.loading = false;
                var status = resp.status;
                if (status == CMD_SEND_RESULT_UNCONFIRM) {
                    me.$Message.error(me.$t('monitor.CMD_SEND_RESULT_UNCONFIRM'));
                } else if (status === CMD_SEND_RESULT_PASSWORD_ERROR) {
                    me.$Message.error(me.$t('monitor.CMD_SEND_RESULT_PASSWORD_ERROR'));
                } else if (status === CMD_SEND_RESULT_OFFLINE_NOT_CACHE) {
                    me.$Message.error(me.$t('monitor.CMD_SEND_RESULT_OFFLINE_NOT_CACHE'));
                } else if (status === CMD_SEND_RESULT_OFFLINE_CACHED) {
                    me.$Message.error(me.$t('monitor.CMD_SEND_RESULT_OFFLINE_CACHED'));
                } else if (status === CMD_SEND_RESULT_MODIFY_DEFAULT_PASSWORD) {
                    me.$Message.error(me.$t('monitor.CMD_SEND_RESULT_MODIFY_DEFAULT_PASSWORD'));
                } else if (status === CMD_SEND_RESULT_DETAIL_ERROR) {
                    me.$Message.error(me.$t('monitor.CMD_SEND_RESULT_DETAIL_ERROR') + resp.cause);
                } else if (status === CMD_SEND_CONFIRMED) {
                    me.videoChannelsTableData = resp.uniaudiovideochannels.channels;
                } else if (status === CMD_SEND_OVER_RETRY_TIMES) {
                    me.$Message.error(me.$t('monitor.CMD_SEND_OVER_RETRY_TIMES'));
                } else if (status === CMD_SEND_SYNC_TIMEOUT) {
                    me.$Message.error(me.$t('monitor.CMD_SEND_SYNC_TIMEOUT'));
                }
            }, function() {
                me.loading = false;
                me.$Message.error(me.$t('monitor.queryFail'));
            });
        },
        queryActiveSafetyDeviceInfo: function(exdevicename) {
            if (this.currentVideoDeviceInfo.deviceId == null) {
                this.$Message.error(me.$t('monitor.selectVideoDevice'));
                return;
            }
            var url = myUrls.queryActiveSafetyDeviceInfo(),
                me = this;
            var data = {
                deviceid: this.currentVideoDeviceInfo.deviceId,
                exdevicename: exdevicename,
                action: 'info'
            };
            me.loading = true;
            utils.sendAjax(url, data, function(resp) {
                me.loading = false;
                var status = resp.status;
                if (status == CMD_SEND_RESULT_UNCONFIRM) {
                    me.$Message.error(me.$t('monitor.CMD_SEND_RESULT_UNCONFIRM'));
                } else if (status === CMD_SEND_RESULT_PASSWORD_ERROR) {
                    me.$Message.error(me.$t('monitor.CMD_SEND_RESULT_PASSWORD_ERROR'));
                } else if (status === CMD_SEND_RESULT_OFFLINE_NOT_CACHE) {
                    me.$Message.error(me.$t('monitor.CMD_SEND_RESULT_OFFLINE_NOT_CACHE'));
                } else if (status === CMD_SEND_RESULT_OFFLINE_CACHED) {
                    me.$Message.error(me.$t('monitor.CMD_SEND_RESULT_OFFLINE_CACHED'));
                } else if (status === CMD_SEND_RESULT_MODIFY_DEFAULT_PASSWORD) {
                    me.$Message.error(me.$t('monitor.CMD_SEND_RESULT_MODIFY_DEFAULT_PASSWORD'));
                } else if (status === CMD_SEND_RESULT_DETAIL_ERROR) {
                    me.$Message.error(me.$t('monitor.CMD_SEND_RESULT_DETAIL_ERROR') + resp.cause);
                } else if (status === CMD_SEND_CONFIRMED) {
                    switch (exdevicename) {
                        case 'adas':
                            me.safetyDeviceAdas = resp;
                            break;
                        case 'dsm':
                            me.safetyDeviceDsm = resp;
                            break;
                        case 'tpms':
                            me.safetyDeviceTpms = resp;
                            break;
                        case 'bsd':
                            me.safetyDeviceBsd = resp;
                            break;
                        default:

                    }
                } else if (status === CMD_SEND_OVER_RETRY_TIMES) {
                    me.$Message.error(me.$t('monitor.CMD_SEND_OVER_RETRY_TIMES'));
                } else if (status === CMD_SEND_SYNC_TIMEOUT) {
                    me.$Message.error(me.$t('monitor.CMD_SEND_SYNC_TIMEOUT'));
                }
            }, function() {
                me.loading = false;
                me.$Message.error(me.$t('monitor.queryFail'));
            })
        },
        defaultClientParameters: function() {
            var audiovideoparameters = {
                carnum: true,
                channel: true,
                dateandtime: true,
                drivingtime: false,
                gpsspeed: false,
                latlon: true,
                osdsetting: 31,
                realtimebitratemode: 0,
                realtimeframebitrate: 2000,
                realtimeframerate: 12,
                realtimekeyframeinterval: 25,
                realtimeresolution: 3,
                recorderspeed: false,
                storebitratemode: 0,
                storeframebitrate: 2000,
                storeframerate: 12,
                storekeyframeinterval: 25,
                storeresolution: 3,
                usingaudio: 1,
            };
            var videoCheckboxGroup = [],
                me = this;
            me.realtimebitratemode = audiovideoparameters.realtimebitratemode + '';
            me.storebitratemode = audiovideoparameters.storebitratemode + '';
            me.realtimeresolution = audiovideoparameters.realtimeresolution + '';
            me.storeresolution = audiovideoparameters.storeresolution + '';
            me.realtimekeyframeinterval = audiovideoparameters.realtimekeyframeinterval;
            me.storekeyframeinterval = audiovideoparameters.storekeyframeinterval;
            me.realtimeframerate = audiovideoparameters.realtimeframerate;
            me.storeframerate = audiovideoparameters.storeframerate;
            me.realtimeframebitrate = audiovideoparameters.realtimeframebitrate;
            me.storeframebitrate = audiovideoparameters.storeframebitrate;
            me.usingaudio = audiovideoparameters.usingaudio + '';
            audiovideoparameters.carnum ? videoCheckboxGroup.push('carnum') : null;
            audiovideoparameters.channel ? videoCheckboxGroup.push('channel') : null;
            audiovideoparameters.dateandtime ? videoCheckboxGroup.push('dateandtime') : null;
            audiovideoparameters.drivingtime ? videoCheckboxGroup.push('drivingtime') : null;
            audiovideoparameters.gpsspeed ? videoCheckboxGroup.push('gpsspeed') : null;
            audiovideoparameters.latlon ? videoCheckboxGroup.push('latlon') : null;
            audiovideoparameters.recorderspeed ? videoCheckboxGroup.push('recorderspeed') : null;
            me.videoCheckboxGroup = videoCheckboxGroup;
        },
        queryClientParameters: function() {

            this.loading = true;
            var url = myUrls.queryClientParameters(),
                me = this;
            utils.sendAjax(url, {
                deviceid: this.currentVideoDeviceInfo.deviceId
            }, function(data) {
                me.loading = false;
                var status = data.status;
                var audiovideoparameters = data.audiovideoparameters;
                if (audiovideoparameters != null) {
                    if (status == CMD_SEND_RESULT_UNCONFIRM) {
                        me.$Message.error(me.$t('monitor.CMD_SEND_RESULT_UNCONFIRM'));
                    } else if (status === CMD_SEND_RESULT_PASSWORD_ERROR) {
                        me.$Message.error(me.$t('monitor.CMD_SEND_RESULT_PASSWORD_ERROR'));
                    } else if (status === CMD_SEND_RESULT_OFFLINE_NOT_CACHE) {
                        me.$Message.error(me.$t('monitor.CMD_SEND_RESULT_OFFLINE_NOT_CACHE'));
                    } else if (status === CMD_SEND_RESULT_OFFLINE_CACHED) {
                        me.$Message.error(me.$t('monitor.CMD_SEND_RESULT_OFFLINE_CACHED'));
                    } else if (status === CMD_SEND_RESULT_MODIFY_DEFAULT_PASSWORD) {
                        me.$Message.error(me.$t('monitor.CMD_SEND_RESULT_MODIFY_DEFAULT_PASSWORD'));
                    } else if (status === CMD_SEND_RESULT_DETAIL_ERROR) {
                        me.$Message.error(me.$t('monitor.CMD_SEND_RESULT_DETAIL_ERROR') + resp.cause);
                    } else if (status === CMD_SEND_CONFIRMED) {
                        me.$Message.success(me.$t('monitor.CMD_SEND_CONFIRMED'));
                        var videoCheckboxGroup = [];
                        me.realtimebitratemode = audiovideoparameters.realtimebitratemode + '';
                        me.storebitratemode = audiovideoparameters.storebitratemode + '';
                        me.realtimeresolution = audiovideoparameters.realtimeresolution + '';
                        me.storeresolution = audiovideoparameters.storeresolution + '';
                        me.realtimekeyframeinterval = audiovideoparameters.realtimekeyframeinterval;
                        me.storekeyframeinterval = audiovideoparameters.storekeyframeinterval;
                        me.realtimeframerate = audiovideoparameters.realtimeframerate;
                        me.storeframerate = audiovideoparameters.storeframerate;
                        me.realtimeframebitrate = audiovideoparameters.realtimeframebitrate;
                        me.storeframebitrate = audiovideoparameters.storeframebitrate;
                        me.usingaudio = audiovideoparameters.usingaudio + '';
                        audiovideoparameters.carnum ? videoCheckboxGroup.push('carnum') : null;
                        audiovideoparameters.channel ? videoCheckboxGroup.push('channel') : null;
                        audiovideoparameters.dateandtime ? videoCheckboxGroup.push('dateandtime') : null;
                        audiovideoparameters.drivingtime ? videoCheckboxGroup.push('drivingtime') : null;
                        audiovideoparameters.gpsspeed ? videoCheckboxGroup.push('gpsspeed') : null;
                        audiovideoparameters.latlon ? videoCheckboxGroup.push('latlon') : null;
                        audiovideoparameters.recorderspeed ? videoCheckboxGroup.push('recorderspeed') : null;
                        me.videoCheckboxGroup = videoCheckboxGroup;

                    } else if (status === CMD_SEND_OVER_RETRY_TIMES) {
                        me.$Message.error(me.$t('monitor.CMD_SEND_OVER_RETRY_TIMES'));
                    } else if (status === CMD_SEND_SYNC_TIMEOUT) {
                        me.$Message.error(me.$t('monitor.CMD_SEND_SYNC_TIMEOUT'));
                    }
                } else {
                    me.$Message.error(me.$t('monitor.theDeviceDidNotReturnData'));
                }

            }, function() {
                me.loading = false;
            });
        },
        setClientParameters: function() {
            var parameters = {};
            if (
                this.realtimebitratemode &&
                this.storebitratemode &&
                this.realtimeresolution &&
                this.storeresolution &&
                this.realtimekeyframeinterval &&
                this.storekeyframeinterval &&
                this.realtimeframerate &&
                this.realtimeframebitrate &&
                this.storeframebitrate &&
                this.usingaudio !== ''
            ) {

                parameters.realtimebitratemode = Number(this.realtimebitratemode);
                parameters.storebitratemode = Number(this.storebitratemode);
                parameters.realtimeresolution = Number(this.realtimeresolution);
                parameters.storeresolution = Number(this.storeresolution);
                parameters.realtimekeyframeinterval = this.realtimekeyframeinterval;
                parameters.storekeyframeinterval = this.storekeyframeinterval;
                parameters.realtimeframerate = this.realtimeframerate;
                parameters.realtimeframebitrate = this.realtimeframebitrate;
                parameters.storeframerate = this.storeframerate;
                parameters.storeframebitrate = this.storeframebitrate;
                parameters.usingaudio = Number(this.usingaudio);

                var options = ['dateandtime', 'carnum', 'channel', 'latlon', 'recorderspeed', 'gpsspeed', 'drivingtime'];
                var videoCheckboxGroup = this.videoCheckboxGroup;
                var url = myUrls.setAudioVideoParameters_Sync(),
                    me = this;
                options.forEach(function(item) {
                    if (videoCheckboxGroup.indexOf(item) != -1) {
                        parameters[item] = true;
                    } else {
                        parameters[item] = false;
                    }
                })
                parameters.deviceid = this.currentVideoDeviceInfo.deviceId;
                me.Spin = true;
                utils.sendAjax(url, parameters, function(resp) {
                    var status = resp.status;
                    me.Spin = false;
                    if (status == CMD_SEND_RESULT_UNCONFIRM) {
                        me.$Message.error(me.$t('monitor.CMD_SEND_RESULT_UNCONFIRM'));
                    } else if (status === CMD_SEND_RESULT_PASSWORD_ERROR) {
                        me.$Message.error(me.$t('monitor.CMD_SEND_RESULT_PASSWORD_ERROR'));
                    } else if (status === CMD_SEND_RESULT_OFFLINE_NOT_CACHE) {
                        me.$Message.error(me.$t('monitor.CMD_SEND_RESULT_OFFLINE_NOT_CACHE'));
                    } else if (status === CMD_SEND_RESULT_OFFLINE_CACHED) {
                        me.$Message.error(me.$t('monitor.CMD_SEND_RESULT_OFFLINE_CACHED'));
                    } else if (status === CMD_SEND_RESULT_MODIFY_DEFAULT_PASSWORD) {
                        me.$Message.error(me.$t('monitor.CMD_SEND_RESULT_MODIFY_DEFAULT_PASSWORD'));
                    } else if (status === CMD_SEND_RESULT_DETAIL_ERROR) {
                        me.$Message.error(me.$t('monitor.CMD_SEND_RESULT_DETAIL_ERROR') + resp.cause);
                    } else if (status === CMD_SEND_CONFIRMED) {
                        me.$Message.success(me.$t('monitor.CMD_SEND_CONFIRMED'));
                    } else if (status === CMD_SEND_OVER_RETRY_TIMES) {
                        me.$Message.error(me.$t('monitor.CMD_SEND_OVER_RETRY_TIMES'));
                    } else if (status === CMD_SEND_SYNC_TIMEOUT) {
                        me.$Message.error(me.$t('monitor.CMD_SEND_SYNC_TIMEOUT'));
                    }
                })
            } else {
                this.$Message.error(me.$t('monitor.fillParameters'))
            }

        },
        querySingleAudioVideoParameters: function() {
            if (this.currentVideoDeviceInfo.deviceId == null) {
                this.$Message.error(this.$t('monitor.selectVideoDevice'));
                return;
            }
            this.loading = true;
            var url = myUrls.querySingleAudioVideoParameters(),
                me = this;
            utils.sendAjax(url, {
                deviceid: this.currentVideoDeviceInfo.deviceId
            }, function(data) {
                me.loading = false;
                if (data.status === 6) {

                    var audiovideoparameters = data.audiovideoparameters;
                    if (audiovideoparameters != null) {
                        var channelsData = [];
                        audiovideoparameters.forEach(function(item, index) {
                            var dataInfo = {
                                channelnum: me.$t('monitor.channel') + (++index),
                            };
                            var videoCheckboxGroup = [];
                            dataInfo.realtimebitratemode = item.realtimebitratemode + '';
                            dataInfo.storebitratemode = item.storebitratemode + '';
                            dataInfo.realtimeresolution = item.realtimeresolution + '';
                            dataInfo.storeresolution = item.storeresolution + '';
                            dataInfo.realtimekeyframeinterval = item.realtimekeyframeinterval;
                            dataInfo.storekeyframeinterval = item.storekeyframeinterval;
                            dataInfo.realtimeframerate = item.realtimeframerate;
                            dataInfo.storeframerate = item.storeframerate;
                            dataInfo.realtimeframebitrate = item.realtimeframebitrate;
                            dataInfo.storeframebitrate = item.storeframebitrate;

                            item.carnum ? videoCheckboxGroup.push('carnum') : null;
                            item.channel ? videoCheckboxGroup.push('channel') : null;
                            item.dateandtime ? videoCheckboxGroup.push('dateandtime') : null;
                            item.drivingtime ? videoCheckboxGroup.push('drivingtime') : null;
                            item.gpsspeed ? videoCheckboxGroup.push('gpsspeed') : null;
                            item.latlon ? videoCheckboxGroup.push('latlon') : null;
                            item.recorderspeed ? videoCheckboxGroup.push('recorderspeed') : null;
                            dataInfo.videoCheckboxGroup = videoCheckboxGroup;
                            channelsData.push(dataInfo);
                        });
                        me.channelsData = channelsData;
                    }
                } else {
                    me.$Message.error(me.$t('monitor.queryFail'));
                }
            }, function() {
                me.loading = false;
                me.$Message.error(me.$t('monitor.queryFail'));
            });
        },
        handlePlayerMute: function() {
            this.isMute = !this.isMute;
            var playerIns = this.$refs;
            for (var i = 1; i <= 16; i++) {
                var player = playerIns['player' + i][0];
                player.changePlayerMute(this.isMute);
            }
        },
        initMap: function() {

            this.googleTrafficLayer = null;
            this.baiduTrafficLayer = null;

            this.map = new maptalks.Map('my-map', {
                center: [106, 36.11],
                zoom: 5,
                minZoom: 4,
                maxZoom: 19,
                scaleControl: true,
                dragRotate: false,
                dragPitch: false,
                zoomAnimation: false,
                panAnimation: false,
            });

            this.setMapType({
                mapType: this.mapType,
                traffic: false,
                xiansu: false,
                satelliteMap: false
            });

            var customPosition = new maptalks.control.Zoom({
                'position': {
                    'bottom': '20',
                    'right': '10'
                },
                'slider': false,
                'zoomLevel': false
            });
            this.map.addControl(customPosition);
            this.addDistanceTool();


            if (!this.globalInfoWindow) {
                var options = {
                    'content': "<div></div>",
                    'width': 360,
                    'autoOpenOn': null,
                    'autoCloseOn': false,
                    'animation': false,
                    'autoPan': false,
                    'animationDuration': 0,
                    // 'dx': this.isShowLabel ? -5 : 0,
                    "dy": -15,
                };
                this.globalInfoWindow = new maptalks.ui.InfoWindow(options);
                this.globalInfoWindow.addTo(this.map);
            }

        },
        addDistanceTool: function() {
            this.distanceTool = new maptalks.DistanceTool({
                'symbol': {
                    'lineColor': '#34495e',
                    'lineWidth': 2
                },
                'vertexSymbol': {
                    'markerType': 'ellipse',
                    'markerFill': '#1bbc9b',
                    'markerLineColor': '#000',
                    'markerLineWidth': 3,
                    'markerWidth': 10,
                    'markerHeight': 10
                },

                'labelOptions': {
                    'textSymbol': {
                        'textFaceName': 'monospace',
                        'textFill': '#fff',
                        'textLineSpacing': 1,
                        'textHorizontalAlignment': 'right',
                        'textDx': 15,
                        'markerLineColor': '#b4b3b3',
                        'markerFill': '#000'
                    },
                    'boxStyle': {
                        'padding': [6, 2],
                        'symbol': {
                            'markerType': 'square',
                            'markerFill': '#000',
                            'markerFillOpacity': 0.9,
                            'markerLineColor': '#b4b3b3'
                        }
                    }
                },
                'clearButtonSymbol': [{
                    'markerType': 'square',
                    'markerFill': '#000',
                    'markerLineColor': '#b4b3b3',
                    'markerLineWidth': 2,
                    'markerWidth': 15,
                    'markerHeight': 15,
                    'markerDx': 20
                }, {
                    'markerType': 'x',
                    'markerWidth': 10,
                    'markerHeight': 10,
                    'markerLineColor': '#fff',
                    'markerDx': 20
                }],
                'language': isZh ? 'zh-CN' : 'en-US'
            });
            this.distanceTool.addTo(this.map);
            this.distanceTool.disable();
        },
        coordinateTransformation: function(newMapType) {
            for (var key in this.mapAllMarkers) {
                var marker = this.mapAllMarkers[key];
                if (marker) {
                    marker.closeInfoWindow();
                }
            };
            this.map.removeLayer(this.clusterLayer);
            this.clusterLayer = null;
            this.addClusterLayer();
        },
        setMapType: function(mapInfo) {
            this.map.removeLayer('baiduText');
            this.map.removeLayer('aliText');
            var me = this;
            var newMapType = mapInfo.mapType;
            var satelliteMap = mapInfo.satelliteMap;
            var traffic = mapInfo.traffic;
            if (newMapType == 'bMap') {
                me.map.setSpatialReference({
                    projection: 'baidu'
                });
                var layer = new maptalks.TileLayer('base', satelliteMap ? baiduSatelliteBaseOption : baiduNormaBaseOption)
                me.map.setBaseLayer(layer);
                if (satelliteMap) {
                    var textlayer = new maptalks.TileLayer('baiduText', baiduTextBaseOption)
                    me.map.addLayer(textlayer);
                }

            } else if (newMapType == 'gMap') {
                var layer = new maptalks.TileLayer('base', satelliteMap ? googleSatelliteBaseOption : googleNormaBaseOption)
                me.map.setSpatialReference({})
                me.map.setBaseLayer(layer);

            } else if (newMapType == 'aMap') {
                var layer = new maptalks.TileLayer('base', satelliteMap ? aliSatelliteBaseOption : aliNormaBaseOption)
                me.map.setSpatialReference({})
                me.map.setBaseLayer(layer);
                if (satelliteMap) {
                    var textlayer = new maptalks.TileLayer('aliText', aliTextBaseOption)
                    me.map.addLayer(textlayer);
                }
            } else if (newMapType == 'gChinaMap') {
                var layer = new maptalks.TileLayer('base', satelliteMap ? googleChinaSatelliteBaseOption : googleChinaNormaBaseOption)
                me.map.setSpatialReference({})
                me.map.setBaseLayer(layer);
            }

            me.addTrafficLayer(traffic);

            me.lastMapType = newMapType;

        },
        getAllCoordinates: function(json) {
            var outCoordinates = [];
            var me = this;
            var isBMap = me.mapType == 'bMap';
            json.features.forEach(function(item) {
                var geometry = item.geometry;
                var coordinates = geometry.coordinates;
                if (geometry.type == "Polygon") {
                    coordinates.forEach(function(coordinate) {
                        var points = [];
                        coordinate.forEach(function(point) {
                            points.push(utils.getCurrentMapCoordinate(isBMap, point));
                            // points.push(point);
                        })
                        outCoordinates.push(points);
                    })
                } else if (geometry.type == "MultiPolygon") {
                    coordinates.forEach(function(coordinate) {
                        var points = [];
                        coordinate.forEach(function(pointArr) {
                            pointArr.forEach(function(point) {
                                points.push(utils.getCurrentMapCoordinate(isBMap, point));
                                // points.push(point);
                            })

                        })
                        outCoordinates.push(points);
                    })
                }
            })
            return outCoordinates;
        },
        handleQueryArea: function() {
            var me = this;
            var adcode = '';
            if (this.areaAddress.length == 1) {
                adcode = this.areaAddress[0];
            } else if (this.areaAddress.length == 2) {
                adcode = this.areaAddress[1];
            } else if (this.areaAddress.length == 3) {
                adcode = this.areaAddress[2];
            }
            var isincludesub = 0;
            me.arealoading = true;
            $.ajax({
                url: myUrls.queryGeoJson(adcode, isincludesub),
                async: true,
                success: function(json) {
                    me.arealoading = false;
                    var coordinates = me.getAllCoordinates(json);

                    if (me.polygonLayer) {
                        me.map.removeLayer(me.polygonLayer);
                    }
                    var polygons = [];
                    var pointList = [];
                    var totalPoints = [];
                    coordinates.forEach(function(item) {
                        polygons.push(me.getPolygon([item]));
                        var points = [];
                        item.forEach(function(point) {
                            var point = {
                                x: point[0],
                                y: point[1]
                            }
                            pointList.push(point)
                            points.push(point)
                        });
                        totalPoints.push(points);
                    })
                    me.polygonLayer = new maptalks.VectorLayer('polygon', polygons);
                    me.polygonLayer.addTo(me.map);
                    me.fitExtent(pointList);
                    me.calcAreaBaiduMarkerStatus(totalPoints);
                },
                error: function() {
                    me.arealoading = false;
                }
            });
        },
        fitExtent: function(pointList) {
            var polygon = new maptalks.Polygon(pointList);
            this.map.fitExtent(polygon.getExtent(), 0);
            polygon = null;
        },
        getPolygon: function(arr) {
            return new maptalks.Polygon(arr, {
                visible: true,
                editable: true,
                cursor: 'pointer',
                shadowBlur: 0,
                shadowColor: 'black',
                draggable: false,
                dragShadow: false, // display a shadow during dragging
                drawOnAxis: null, // force dragging stick on a axis, can be: x, y
                symbol: {
                    'lineColor': '#e4393c',
                    'lineWidth': 2,
                    'polygonFill': 'rgb(135,196,240)',
                    'polygonOpacity': 0
                }
            });
        },
        handleRemoveAreaOverlay: function() {
            this.isShowAreaCount = false;
            if (this.polygonLayer) {
                this.map.removeLayer(this.polygonLayer);
            }
        },
        calcAreaBaiduMarkerStatus: function(totalpoints) {
            var me = this;
            var isBMap = this.mapType == 'bMap';
            var currentUTC = DateFormat.getCurrentUTC();
            var areaMovingCount = 0,
                areaOfflineCount = 0,
                areaStaticCount = 0;
            totalpoints.forEach(function(points) {
                var polylatList = [],
                    polylonList = [];
                points.forEach(function(item) {
                    polylatList.push(item.y);
                    polylonList.push(item.x);
                });
                for (var key in me.positionLastrecords) {
                    var track = me.positionLastrecords[key];
                    var lat = isBMap ? track.b_lat : track.g_lat;
                    var lon = isBMap ? track.b_lon : track.g_lon;

                    if (utils.pointInPolygon(lat, lon, polylatList, polylonList)) {
                        if (me.getIsOnline(track.deviceid, currentUTC)) {
                            if (track.moving == 0) {
                                areaStaticCount++;
                            } else {
                                areaMovingCount++;
                            }
                        } else {
                            areaOfflineCount++;
                        }
                    }
                }
            })

            this.areaMovingCount = areaMovingCount;
            this.areaOfflineCount = areaOfflineCount;
            this.areaStaticCount = areaStaticCount;
            this.isShowAreaCount = true;
            this.arealoading = false;
        },
        handleWebSocket: function(data) {
            var me = this;
            var deviceid = data.deviceid;
            data.devicename = this.deviceInfos[deviceid] ? this.deviceInfos[deviceid].devicename : "";
            me.updateDevLastPosition(data);
            isNeedRefreshMapUI = true;
        },
        openDistance: function() {
            this.isOpenDistance = !this.isOpenDistance;
        },
        switchMapMode: function(type) {
            var that = this;
            if (this.isMapMode && type === 1) {
                return;
            }
            if (this.isMapMode == false && type === 2) {
                return;
            }
            switch (type) {
                case 1:
                    this.isMapMode = true;
                    if (this.isShowYunTai) {
                        this.isShowYunTai = false;
                    };
                    break;
                case 2:
                    this.isMapMode = false;
                    break;
            }
            setTimeout(function() {
                var record = that.getSingleDeviceInfo(that.currentDeviceId);
                var marker = that.mapAllMarkers[that.currentDeviceId];
                if (record && marker) {
                    that.onClickMarker({
                        target: marker
                    })
                }
            }, 300);
        },
        openAndCloseVideoWindows: function(toOpensIndex) {
            this.videoNumber = toOpensIndex;
        },
        handlePlayAllVideos: function() {
            var playerIns = this.$refs;
            var isTips = true;
            for (var i = 1; i <= this.videoNumber; i++) {
                var player = playerIns['player' + i][0];
                if (player.deviceId != '') {
                    isTips = false;
                    player.handleStartVideos();

                }
            }
            if (isTips) {
                this.$Message.error(this.$t('monitor.selectVideoDevice'));
            }
        },
        handleStopAllVideos: function() {
            var playerIns = this.$refs;
            for (var i = 1; i <= this.videoNumber; i++) {
                var player = playerIns['player' + i][0];
                if (player.deviceId) {
                    player.handleStopVideos();
                }
            }
        },
        handleCleanAllVideos: function() {
            var me = this;
            var playerIns = this.$refs;
            for (var i = 1; i <= this.videoNumber; i++) {
                var player = playerIns['player' + i][0];
                if (player.deviceId) {
                    player.handleStopVideos();
                    player.cleanDevicedInfo();
                }
            }

            this.isDestory = false;
            setTimeout(function() {
                me.isDestory = true;
            }, 30)

            this.currentPlayingIndex = 0;
        },
        stopVideoPlayer: function() {
            var videoIns = this.$refs;
            for (var i = 1; i <= 16; i++) {
                var player = videoIns['player' + i][0];
                if (player) {
                    player.timeout();
                }
            }
        },
        handleClickMore: function(name) {
            var me = this;
            switch (name) {
                case 'cmdrecord':
                    this.cacheTableData = [];
                    this.sendTableData = [];
                    this.directiveReportModal = true;
                    this.queryAllCmdRecords();
                    break;
                case 'recordform':
                    this.$emit("jump-report", "reportForm");
                    break;
                case 'devbaseinfo':
                    this.queryDeviceBaseInfo(0);
                    this.deviceInfoModal = true;
                    break;
                case 'luyin':
                    window.open("record.html?deviceid=" + globalDeviceId + "&token=" + token);
                    break;
                case 'alarmList':
                    isToAlarmListRecords = true;
                    this.$emit("jump-report", "reportForm");
                    break;
                case 'phoneAlarm':
                    isToPhoneAlarmRecords = true;
                    this.$emit("jump-report", "reportForm");
                    break;
                case 'bms':
                    open('bmssys.html?deviceid=' + globalDeviceId + "&token=" + token);
                    break;
                case 'obd':
                    window.open("obd.html?deviceid=" + globalDeviceId + "&token=" + token);
                    break;
                case 'weight':
                    window.open("weighing.html?deviceid=" + globalDeviceId + "&token=" + token);
                    break;
                case 'watermeter':
                    alert('watermeter');
                    break;
                case 'camera':

                    break;
                case 'ownerInfo':
                    utils.queryDeviceex(globalDeviceId, function(resp) {
                        me.ownerInfoData.deviceid = me.currentDeviceId;
                        if (resp) {
                            me.ownerInfoData.ownername = resp.ownername;
                            me.ownerInfoData.phonenum1 = resp.phonenum1;
                            me.ownerInfoData.phonenum2 = resp.phonenum2;
                            me.ownerInfoData.idnum = resp.idnum;
                            me.ownerInfoData.gender = String(resp.gender);
                            me.ownerInfoData.ownerremark = resp.remark;
                            me.ownerInfoData.address = resp.address;
                        } else {
                            me.ownerInfoData.ownername = '';
                            me.ownerInfoData.phonenum1 = '';
                            me.ownerInfoData.phonenum2 = '';
                            me.ownerInfoData.idnum = '';
                            me.ownerInfoData.gender = '';
                            me.ownerInfoData.ownerremark = '';
                            me.ownerInfoData.address = '';
                        }
                        me.ownerInfoModal = true;
                    });
                    break;
                case 'video':
                    var state = this.positionLastrecords[globalDeviceId] ? this.positionLastrecords[globalDeviceId].strvideoalarm : null;
                    window.open(
                        myUrls.viewhosts + "video.html?deviceid=" +
                        globalDeviceId + "&maptype=" +
                        this.mapType + "&token=" +
                        token + '&name=' + encodeURIComponent(this.deviceInfos[globalDeviceId].devicename) +
                        '&activesafety=' + (this.isShowActiveSafetyBtn ? 1 : 0) +
                        '&state=' + encodeURIComponent(state)
                    );
                    break;
                case 'talk':
                    //currentVideoDeviceInfo

                    var deviceInfo = this.deviceInfos[globalDeviceId];
                    this.currentVideoDeviceInfo.deviceId = globalDeviceId;
                    this.currentVideoDeviceInfo.deviceName = deviceInfo.devicename;
                    this.isShowYunTai = true;
                    break;
                case 'videoback':
                    this.videoBack();
                    break;
                case 'videosetting':
                    var deviceInfo = this.deviceInfos[globalDeviceId];
                    this.currentVideoDeviceInfo.deviceId = globalDeviceId;
                    this.currentVideoDeviceInfo.deviceName = deviceInfo.devicename;
                    this.setupVideoModal = true;
                    this.queryVideoPlayParameters();
                    this.queryDeviceById();
                    break;
                case 'activesafety':
                    //currentVideoDeviceInfo
                    this.openActiveSafety();
                    break;
            }
        },
        handleEditDeviceex: function() {
            var me = this;
            utils.editDeviceex('owner', me.ownerInfoData, function(resp) {
                if (resp.status === 0) {
                    me.$Message.success(me.$t('message.changeSucc'));
                    me.ownerInfoModal = false;
                } else {
                    me.$Message.error(me.$t('message.changeFail'));
                }
            });
        },
        queryDeviceBaseInfo: function(forceupdate) {
            var that = this;
            var url = myUrls.queryDeviceBaseInfo();
            var data = {
                deviceid: globalDeviceId,
                forceupdate: forceupdate
            };
            if (forceupdate == 1) {
                that.loading = true;
            } else {
                this.deviceBaseInfo = {};
            }
            utils.sendAjax(url, data, function(resp) {
                var status = resp.status;
                if (status == CMD_SEND_RESULT_UNCONFIRM) {
                    that.$Message.error(that.$t('monitor.CMD_SEND_RESULT_UNCONFIRM'));
                } else if (status === CMD_SEND_RESULT_PASSWORD_ERROR) {
                    that.$Message.error(that.$t('monitor.CMD_SEND_RESULT_PASSWORD_ERROR'));
                } else if (status === CMD_SEND_RESULT_OFFLINE_NOT_CACHE) {
                    that.$Message.error(that.$t('monitor.CMD_SEND_RESULT_OFFLINE_NOT_CACHE'));
                } else if (status === CMD_SEND_RESULT_OFFLINE_CACHED) {
                    that.$Message.error(that.$t('monitor.CMD_SEND_RESULT_OFFLINE_CACHED'));
                } else if (status === CMD_SEND_RESULT_MODIFY_DEFAULT_PASSWORD) {
                    that.$Message.error(that.$t('monitor.CMD_SEND_RESULT_MODIFY_DEFAULT_PASSWORD'));
                } else if (status === CMD_SEND_RESULT_DETAIL_ERROR) {
                    that.$Message.error(that.$t('monitor.CMD_SEND_RESULT_DETAIL_ERROR') + resp.cause);
                } else if (status === CMD_SEND_CONFIRMED) {
                    var device = vstore.state.deviceInfos[globalDeviceId];
                    resp.overdueDateStr = DateFormat.longToDateStr(resp.expirenotifytime, timeDifference);
                    resp.deviceTypeStr = that.getDeviceTypeStr(device.devicetype);
                    resp.creater = device.creater;
                    resp.groupname = utils.getGroupName(that.groups, globalDeviceId);
                    that.deviceBaseInfo = resp;
                } else if (status === CMD_SEND_OVER_RETRY_TIMES) {
                    that.$Message.error(that.$t('monitor.CMD_SEND_OVER_RETRY_TIMES'));
                } else if (status === CMD_SEND_SYNC_TIMEOUT) {
                    that.$Message.error(that.$t('monitor.CMD_SEND_SYNC_TIMEOUT'));
                }
                that.loading = false;
            }, function() {
                that.loading = false;
                that.$Message.error(that.$t('monitor.queryFail'));
            })
        },
        getDeviceTypeStr: function(devicetype) {
            var devType = "";
            var item = vstore.state.deviceTypes[devicetype];
            var label = item.typename;
            if (isZh) {
                if (item.remark) {
                    label += "(" + item.remark + ")";
                }
                devType = label;
            } else {
                if (item.remarken) {
                    label += "(" + item.remarken + ")";
                }
                devType = label;
            }
            return devType;
        },
        handleClickTransferDeviceGroup: function(groupid) {
            var url = myUrls.batchOperate(),
                me = this;
            var data = {
                "action": "move",
                "deviceids": [globalDeviceId],
                "targetgroupid": groupid,
                "targetusername": userName
            }
            utils.sendAjax(url, data, function(resp) {
                if (resp.status == 0 && resp.total == resp.success) {
                    var deviceSpliceList = null;
                    for (var i = 0; i < me.groups.length; i++) {
                        var group = me.groups[i];
                        for (var j = 0; j < group.devices.length; j++) {
                            var device = group.devices[j];
                            if (device.deviceid == me.currentDeviceId) {
                                deviceSpliceList = group.devices.splice(j, 1);
                                me.transferAfterChangeGroupTitle(group);
                                break;
                            }
                        }
                    };
                    for (var k = 0; k < me.groups.length; k++) {
                        var group = me.groups[k];
                        if (group.groupid == groupid) {
                            if (deviceSpliceList && deviceSpliceList.length) {

                                group.devices.push(deviceSpliceList[0]);
                                me.transferAfterChangeGroupTitle(group);
                            }
                            break;
                        }
                    };
                    me.$Message.success(me.$t('monitor.transferSucc'));
                } else {
                    me.$Message.error(me.$t('monitor.transferFail'));
                }
            });
        },
        transferAfterChangeGroupTitle: function(group) {
            var devCount = 0,
                me = this;
            group.devCount = devCount;
            var onlineCount = 0;
            var offlineCount = 0;
            var storeCount = 0;
            group.devices.forEach(function(item) {
                devCount++;
                if (item.isOnline) {
                    onlineCount++;
                } else {
                    var track = me.positionLastrecords[item.deviceid];
                    if (item.lastactivetime <= 0 && track == undefined) {
                        storeCount++;
                    } else {
                        offlineCount++;
                    }
                }
            });
            if (me.selectedState == 'all' || me.selectedState == 'online') {
                group.title = group.title.replace(/\((.+?)\)/g, '(' + onlineCount + '/' + devCount + ')');
            } else if (me.selectedState == 'offline') {
                group.title = group.title.replace(/\((.+?)\)/g, '(' + offlineCount + '/' + devCount + ')');
            } else if (me.selectedState == 'stock') {
                group.title = group.title.replace(/\((.+?)\)/g, '(' + storeCount + '/' + devCount + ')');
            }
        },
        handleClickDirective: function(cmdCode) {
            this.cmdParams = {};
            this.selectedCmdInfo = {};
            this.cmdPwd = null;
            var cmdInfo = null;
            var me = this;
            var cmdVal = this.cmdSettings[cmdCode];
            this.currentDevDirectiveList.forEach(function(cmd) {
                if (cmd.cmdcode == cmdCode) {
                    cmdInfo = cmd;
                }
            });

            if (isZh) {
                this.selectedCmdInfo.cmdName = cmdInfo.cmdname;
                this.selectedCmdInfo.cmddescr = cmdInfo.cmddescr;
            } else {
                this.selectedCmdInfo.cmdName = cmdInfo.cmdnameen;
                this.selectedCmdInfo.cmddescr = cmdInfo.cmddescren;
            }
            this.selectedCmdInfo.cmdcode = cmdInfo.cmdcode;
            this.selectedCmdInfo.cmdpwd = cmdInfo.cmdpwd;
            this.selectedCmdInfo.type = cmdInfo.cmdtype;

            if (cmdInfo.params) {

                var paramsXMLObj = utils.parseXML(isZh ? cmdInfo.params : cmdInfo.paramsen);
                // this.selectedCmdInfo.type = paramsXMLObj.type;
                this.selectedCmdInfo.params = paramsXMLObj.paramsListObj;

                this.selectedCmdInfo.params.forEach(function(param, index) {
                    if (cmdVal && cmdVal.length && cmdVal[0]) {
                        if (cmdInfo.cmdtype === 'timeperiod') {
                            me.cmdParams[param.type] = cmdVal[index].split("-");
                        } else if (cmdInfo.cmdtype === 'remind') {
                            me.cmdParams[param.type] = utils.parserToRemindJson(cmdVal[index]);
                        } else if (cmdInfo.cmdtype === 'weektime') {
                            me.cmdParams[param.type] = utils.parserToWeekTimeJson(cmdVal[index]);
                        } else if (cmdInfo.cmdtype === 'weekperiod') {
                            me.cmdParams[param.type] = utils.parserToWeekPeriodJson(param, cmdVal[index]);
                        } else {
                            me.cmdParams[param.type] = cmdVal[index];
                        }
                    } else {
                        if (cmdInfo.cmdtype === 'timeperiod') {
                            var timerArr = param.value ? param.value.split("-") : ["00:00", "00:00"];
                            me.cmdParams[param.type] = timerArr;
                        } else if (cmdInfo.cmdtype === 'remind') {
                            var remindJson = utils.parserToRemindJson(param.value);
                            me.cmdParams[param.type] = remindJson;
                        } else if (cmdInfo.cmdtype === 'weektime') {
                            me.cmdParams[param.type] = utils.parserToWeekTimeJson(param.value);
                        } else if (cmdInfo.cmdtype === 'weekperiod') {
                            me.cmdParams[param.type] = utils.parserToWeekPeriodJson(param);
                        } else {
                            me.cmdParams[param.type] = param.value;
                        }

                    }
                });


                (cmdInfo.cmdtype !== 'text' || cmdInfo.cmdtype === 'timeperiod') ? this.selectedTypeVal = (cmdVal ? cmdVal[0] : ""): '';
            };
            // console.log('cmdParams', me.cmdParams);
            this.dispatchDirectiveModal = true;
        },


        queryAllCmdRecords: function() {
            this.loading = true;
            var me = this;
            var url = myUrls.queryAllCmdRecords();
            utils.sendAjax(url, { deviceid: globalDeviceId }, function(resp) {

                if (resp.status === 0) {
                    resp.cacherecords.forEach(function(record, index) {
                        record.index = ++index;
                        record.sendtimeStr = DateFormat.longToDateTimeStr(record.cmdtime, 0);
                    });
                    resp.sendrecords.forEach(function(record, index) {
                        record.index = ++index;
                        record.sendtimeStr = DateFormat.longToDateTimeStr(record.cmdtime, 0);
                    });
                    me.cacheTableData = resp.cacherecords;
                    me.sendTableData = resp.sendrecords;
                } else {
                    me.$Message.error(me.$t("queryCmdRecordErr"));
                }
                me.loading = false;
            });
        },
        getCmdParamsVlaue: function() {
            var params = [];

            switch (this.selectedCmdInfo.type) {
                case 'text':
                    params = Object.values(this.cmdParams);
                    break;
                case 'time':
                    params = Object.values(this.cmdParams);
                    break;
                case 'timeperiod':
                    for (var key in this.cmdParams) {
                        params.push(this.cmdParams[key].join("-"))
                    };
                    break;
                case 'remind':
                    params = utils.encodeRemindParams(this.cmdParams);
                    break;
                case 'weektime':
                    params = utils.encodeWeekTimeParams(this.cmdParams);
                    break;
                case 'weekperiod':
                    params = utils.encodeWeekPeriodParams(this.cmdParams);
                    break;
                default:
                    params = [this.selectedTypeVal]
            };
            return params;
        },
        disposeDirectiveFn: function() {
            var me = this;
            var url = myUrls.sendCmd();
            var params = this.getCmdParamsVlaue();
            var data = {
                devicetype: this.currentDeviceType,
                cmdcode: this.selectedCmdInfo.cmdcode,
                deviceid: me.currentDeviceId,
                params: params,
                state: -1
            };
            if (this.selectedCmdInfo.cmdpwd && this.selectedCmdInfo.cmdpwd != "") {
                if (this.cmdPwd) {
                    data.cmdpwd = this.cmdPwd;
                } else {
                    me.$Message.error(me.$t("monitor.pwdErr"));
                    return;
                }
            };
            utils.sendAjax(url, data, function(resp) {
                me.cmdSettings[data.cmdcode] = params;
                if (resp.status === 0) {
                    communicate.$emit("disposeAlarm", data.cmdcode);
                    me.$Message.success(me.$t("monitor.sendSucc"));
                    me.dispatchDirectiveModal = false;
                } else if (resp.status === 1) {
                    me.$Message.error(me.$t("monitor.pwdErr"));
                } else if (resp.status === -1) {
                    me.$Message.error(me.$t("monitor.sendCmdAbnormal"));
                } else if (resp.status === 2) {
                    me.$Message.error(me.$t("monitor.sendCmdNoCache"));
                } else if (resp.status === 3) {
                    me.$Message.error(me.$t("monitor.sendCmdAlreadyCache"));
                } else if (resp.status === 4) {
                    me.$Message.error(me.$t("monitor.changePwdSendCmd"));
                }
            });
        },
        focus: function() {
            this.readonly = false;
            var me = this;
            if (this.sosoValue.trim()) {
                me.sosoValueChange();
            }
        },
        blur: function() {
            this.readonly = true;
            var me = this
            setTimeout(function() {
                me.isShowMatchDev = false;
            }, 300)
        },
        filterMethod: function(value) {
            var filterData = []
            var me = this;
            value = value.toLowerCase();
            var currentTime = DateFormat.getCurrentUTC();
            for (var i = 0; i < this.groups.length; i++) {
                var group = this.groups[i]
                if (
                    group.groupname.toLowerCase().indexOf(value) !== -1 ||
                    group.firstLetter.indexOf(value) !== -1 ||
                    group.pinyin.indexOf(value) !== -1
                ) {
                    var cloneGroup = deepClone(group);
                    if (me.selectedState == "all") {
                        group.devices.forEach(function(device) {
                            var isOnline = me.getIsOnline(device.deviceid, currentTime);
                            device.isOnline = isOnline;
                        })
                        if (cloneGroup.devices.length > 10) {
                            cloneGroup.devices = cloneGroup.devices.slice(0, 10);
                        }

                        filterData.push(cloneGroup);
                    } else if (me.selectedState == "online") {

                        cloneGroup.devices = [];
                        group.devices.forEach(function(device, index) {
                            var isOnline = me.getIsOnline(device.deviceid, currentTime);
                            device.isOnline = isOnline;
                            if (isOnline && cloneGroup.devices.length < 10) {
                                cloneGroup.devices.push(device);
                            }
                        })
                        if (cloneGroup.devices.length > 0) {
                            filterData.push(cloneGroup);
                        }
                    } else if (me.selectedState == "offline") {

                        cloneGroup.devices = [];
                        group.devices.forEach(function(device, index) {
                            var isOnline = me.getIsOnline(device.deviceid, currentTime);
                            device.isOnline = isOnline;
                            if (!isOnline && cloneGroup.devices.length < 10) {
                                cloneGroup.devices.push(device);
                            }
                        })
                        if (cloneGroup.devices.length > 0) {
                            filterData.push(cloneGroup);
                        }
                    };
                } else {
                    var devices = group.devices
                    var obj = {
                        groupname: group.groupname,
                        devices: []
                    }

                    for (var j = 0; j < devices.length; j++) {
                        var device = devices[j]
                        var deviceid = device.deviceid.toLowerCase();
                        var devicename = device.devicename;
                        var isOnline = this.getIsOnline(device.deviceid, currentTime);
                        device.isOnline = isOnline;
                        if (
                            device.devicetitle.toLowerCase().indexOf(value) !== -1 ||
                            devicename.toLowerCase().indexOf(value) !== -1 ||
                            device.firstLetter.indexOf(value) !== -1 ||
                            device.pinyin.indexOf(value) !== -1 ||
                            deviceid.indexOf(value) !== -1
                        ) {
                            if (me.selectedState == "all") {
                                obj.devices.push(device)
                            } else if (me.selectedState == "online") {
                                if (isOnline) {
                                    obj.devices.push(device)
                                }
                            } else if (me.selectedState == "offline") {
                                if (!isOnline) {
                                    obj.devices.push(device)
                                }
                            }
                        } else {
                            if (device.remark) {
                                if (device.remark.indexOf(value) !== -1) {
                                    if (me.selectedState == "all") {
                                        obj.devices.push(device)
                                    } else if (me.selectedState == "online") {
                                        if (isOnline) {
                                            obj.devices.push(device)
                                        }
                                    } else if (me.selectedState == "offline") {
                                        if (!isOnline) {
                                            obj.devices.push(device)
                                        }
                                    }
                                };
                            };
                        };

                        if (obj.devices.length >= 10) {
                            break;
                        }
                    }
                    if (obj.devices.length) {
                        filterData.push(obj);
                        if (filterData.length >= 10) {
                            break;
                        }
                    };
                };

            };
            this.filterData = filterData;
        },
        handleMapSizeChange: function() {
            var mapWraper = this.$refs.mapWraper;
            if (this.isFullMap) {
                this.exitFullscreen();
                this.isFullMap = false;
            } else {
                this.requestFullscreen(mapWraper);
                this.isFullMap = true;
            }
        },
        exitFullscreen: function() {
            if (document.exitFullscreen) {
                document.exitFullscreen()
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen()
            } else if (document.webkitCancelFullScreen) {
                document.webkitCancelFullScreen()
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen()
            }
        },
        requestFullscreen: function(mapWraper) {
            if (mapWraper.requestFullscreen) {
                mapWraper.requestFullscreen()
            } else if (mapWraper.mozRequestFullScreen) {
                mapWraper.mozRequestFullScreen()
            } else if (mapWraper.webkitRequestFullScreen) {
                mapWraper.webkitRequestFullScreen()
            } else if (mapWraper.msRequestFullscreen) {
                mapWraper.msRequestFullscreen()
            }
        },
        sosoSelect: function(value) {
            this.sosoValue = value.devicename;
            this.filterData = [];
            var me = this;
            var deviceid = null

            this.groups.forEach(function(group) {
                group.devices.forEach(function(dev) {
                    if (dev.deviceid == value.deviceid) {
                        dev.isSelected = true;
                        group.expand = true;
                        deviceid = dev.deviceid;
                        me.currentDeviceType = dev.devicetype;
                        me.handleClickDev(dev.deviceid);
                    } else {
                        dev.isSelected = false;
                    };
                });
            });

            this.scrollToCurruntDevice(deviceid);
        },
        scrollToCurruntDevice: function(deviceid) {
            var me = this;
            setTimeout(function() {
                var a = document.createElement('a');
                a.href = '#' + deviceid;
                a.click();
            }, 500);
        },
        sosoValueChange: function() {
            var me = this;
            var value = this.sosoValue;

            if (this.timeoutIns != null) {
                clearTimeout(this.timeoutIns);
            }

            if (!value.trim()) {
                this.filterData = [];
                return;
            }

            this.timeoutIns = setTimeout(function() {
                me.filterMethod(value);
            }, 300);
        },
        selectedStateNav: function(state) {
            this.selectedState = state;
            this.openGroupIds = {};
        },
        openGroupItem: function(groupInfo) {
            groupInfo.expand = !groupInfo.expand;
            if (groupInfo.expand) {
                this.openGroupIds[groupInfo.groupid] = "";
            } else {
                delete this.openGroupIds[groupInfo.groupid];
            }
        },
        playerVideos: function() {
            var me = this;
            var activesafety = this.isShowActiveSafetyBtn ? 1 : 0;
            var deviceInfo = this.deviceInfos[globalDeviceId];
            deviceInfo.activesafety = activesafety;
            deviceInfo.state = this.positionLastrecords[globalDeviceId] ? this.positionLastrecords[globalDeviceId].strvideoalarm : null;
            // communicate.$emit("playerVideos", deviceInfo);
            this.startPlayer(deviceInfo);
        },
        startPlayer: function(deviceInfo) {
            var that = this;
            if (this.isMapMode) {
                this.isMapMode = false;
            };
            this.dblClickDeviceVideo(deviceInfo);
            setTimeout(function() {
                var record = that.getSingleDeviceInfo(that.currentDeviceId);
                var marker = that.mapAllMarkers[that.currentDeviceId];
                if (record && marker) {
                    that.onClickMarker({
                        target: marker
                    })
                }
            }, 300);
        },
        selectedDev: function(deviceInfo) {
            var device = this.deviceInfos[deviceInfo.deviceid];
            var devicetype = device.devicetype;
            if (devicetype != this.currentDeviceType) {
                this.currentDeviceType = devicetype;
            };
            this.cancelSelected();
            deviceInfo.isSelected = true;
            this.selectedDevObj = deviceInfo;
            this.handleClickDev(deviceInfo.deviceid);
        },
        queryCurrentDevReportMileageDetail: function(deviceid, callback) {
            var track = this.positionLastrecords[deviceid];
            var url = myUrls.reportMileageDetail();
            var currentDay = DateFormat.format(new Date(track.updatetime), "yyyy-MM-dd");
            var data = {
                startday: currentDay,
                endday: currentDay,
                offset: timeDifference,
                deviceid: deviceid
            }
            utils.sendAjax(url, data, function name(resp) {
                if (resp.status == 0) {
                    var record = resp.records[0];
                    var mileage = ((record.maxtotaldistance - record.mintotaldistance) / 1000) + 'Km';
                    callback(mileage, track);
                } else {
                    callback('-', track);
                }
            });
        },
        handleClickDev: function(deviceid) {
            var me = this;
            this.querySingleAllCmdDefaultValue(deviceid);
            utils.setCurrentDeviceid(deviceid);
            var device = this.deviceInfos[deviceid];
            var track = this.getSingleDeviceInfo(deviceid);
            var marker = this.mapAllMarkers[deviceid];
            this.currentDeviceName = device.devicename;
            this.currentDeviceType = device.devicetype;
            globalDeviceName = this.currentDeviceName;
            if (track && marker) {
                me.$store.commit('currentDeviceRecord', track);
                me.map.setCenter(marker.getCoordinates());
                me.map.setZoom(18);
                var address = me.getAddress(track, marker);
                var sContent = me.getInfoWindowContent(track, address);

                me.showMapInfoWindow(sContent, marker.getCoordinates());
                if (globalDeviceId) {
                    var oldMarker = me.mapAllMarkers[globalDeviceId];
                    oldMarker && oldMarker.setZIndex(111);
                }
                marker.setZIndex(999);

                this.queryCurrentDevReportMileageDetail(deviceid, function(currentDayMileage, track) {
                    if (track.deviceid == globalDeviceId) {
                        track.currentDayMileage = currentDayMileage;
                        var address = me.getAddress(track, marker);
                        var sContent = me.getInfoWindowContent(track, address);
                        me.showMapInfoWindow(sContent, marker.getCoordinates());
                    }
                });
            } else {
                this.$Message.error(this.$t("monitor.noRecordTrack"))
                this.$store.commit('currentDeviceId', deviceid);
            }


            globalDeviceId = deviceid;
            reportDeviceId = deviceid;
            var groups = utils.allSubgroups[device.creater];
            if (groups) {
                this.currentDevCreateUserGroupList = groups;
            }
        },
        querySingleAllCmdDefaultValue: function(deviceid) {
            var url = myUrls.queryDeviceSettings(),
                me = this;
            utils.sendAjax(url, { deviceid: deviceid }, function(resp) {
                if (resp.status === 0) {
                    me.cmdSettings = resp.settings;
                }
            })
        },
        updateTreeOnlineState: function() {
            this.getCurrentStateTreeData(this.selectedState);
        },
        cancelSelected: function() {
            this.groups.forEach(function(group) {
                group.devices.forEach(function(dev) {
                    dev.isSelected = false
                })
            })
        },
        getMonitorListByUser: function(data, callback, errorCall) {
            var me = this
            var url = myUrls.monitorListByUserProto();

            var xhr = null;
            try {
                xhr = new XMLHttpRequest();
            } catch (e) {
                xhr = new ActiveXObject("Microsoft.XMLHTTP");
            }
            //2.调用open方法（true----异步）
            xhr.open("post", url, true);
            xhr.responseType = "arraybuffer";
            //3.发送数据
            //xhr.setRequestHeader('content-type', 'application/x-www-form-urlencoded');
            xhr.send(JSON.stringify(data));

            //4.请求状态改变事件
            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4) {
                    if (xhr.status == 200) {
                        var responseArray = new Uint8Array(this.response)
                        var protobufRoot = protobuf.Root.fromJSON(monitorListProtoJson);
                        var respDeviceLastPositionProto = protobufRoot.lookupType("proto.RespMonitorDeviceListProto");
                        var resp = respDeviceLastPositionProto.decode(responseArray);
                        if (resp.status == 0) {
                            callback ? callback(resp) : '';
                        } else if (resp.status > 9000) {
                            me.$Message.error(me.$t("monitor.reLogin"))
                            localStorage.setItem('token', "")
                            setTimeout(function() {
                                window.location.href = 'index.html'
                            }, 2000)
                        }
                    } else {
                        errorCall && errorCall();
                    }
                }
            }
        },
        getLastPosition: function(deviceIds, callback, errorCall) {
            var me = this;
            var url = myUrls.lastPositionProto();
            var data = {
                username: this.username,
                deviceids: deviceIds,
                lastquerypositiontime: me.lastquerypositiontime
            };


            var xhr = null;
            try {
                xhr = new XMLHttpRequest();
            } catch (e) {
                xhr = new ActiveXObject("Microsoft.XMLHTTP");
            }
            //2.调用open方法（true----异步）
            xhr.open("post", url, true);
            xhr.responseType = "arraybuffer";
            //3.发送数据
            //xhr.setRequestHeader('content-type', 'application/x-www-form-urlencoded');
            xhr.send(JSON.stringify(data));

            //4.请求状态改变事件
            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4) {
                    if (xhr.status == 200) {
                        var responseArray = new Uint8Array(this.response)
                        var protobufRoot = protobuf.Root.fromJSON(deviceLastPositionProto);
                        var respDeviceLastPositionProto = protobufRoot.lookupType("proto.RespDeviceLastPositionProto");
                        var resp = respDeviceLastPositionProto.decode(responseArray);
                        if (resp.status == 0) {
                            me.lastquerypositiontime = resp.lastquerypositiontime;
                            var currentTime = DateFormat.getCurrentUTC();
                            if (resp.records && resp.records.length > 0) {
                                resp.records.forEach(function(item) {
                                    if (item) {

                                        var deviceid = item.deviceid;
                                        var b_lon_and_b_lat = wgs84tobd09(item.callon, item.callat)
                                        var g_lon_and_g_lat = wgs84togcj02(item.callon, item.callat);
                                        var online = me.getIsOnline(item, currentTime);
                                        item.b_lon = b_lon_and_b_lat[0];
                                        item.b_lat = b_lon_and_b_lat[1];
                                        item.g_lon = g_lon_and_g_lat[0];
                                        item.g_lat = g_lon_and_g_lat[1];
                                        item.online = online;
                                        item.devicename = me.deviceInfos[deviceid] ? me.deviceInfos[deviceid].devicename : "";
                                        me.updateNewPositionLastValue(deviceid, item);

                                    }
                                })

                            }
                            isNeedRefreshMapUI = true;
                            callback ? callback() : '';
                        } else if (resp.status > 9000) {
                            me.$Message.error(me.$t("monitor.reLogin"))
                            localStorage.setItem('token', "");
                            setTimeout(function() {
                                window.location.href = 'index.html'
                            }, 2000)
                        }

                        isLoadLastPositon = true;
                    } else {
                        errorCall();
                        isLoadLastPositon = true;
                    }
                }
            }
        },
        onClickCamera: function() {
            this.loading = true;
            var me = this;
            var url = myUrls.capturephoToSync();
            var data = {
                deviceid: globalDeviceId,
                channelid: this.cameraChannel,
                resolution: Number(this.resolution),
            };
            utils.sendAjax(url, data, function(resp) {
                me.loading = false;
                var devicemedia = resp.devicemedia;
                var status = resp.status;
                if (status == CMD_SEND_RESULT_UNCONFIRM) {
                    me.$Message.error(me.$t('monitor.CMD_SEND_RESULT_UNCONFIRM'));
                } else if (status === CMD_SEND_RESULT_PASSWORD_ERROR) {
                    me.$Message.error(me.$t('monitor.CMD_SEND_RESULT_PASSWORD_ERROR'));
                } else if (status === CMD_SEND_RESULT_OFFLINE_NOT_CACHE) {
                    me.$Message.error(me.$t('monitor.CMD_SEND_RESULT_OFFLINE_NOT_CACHE'));
                } else if (status === CMD_SEND_RESULT_OFFLINE_CACHED) {
                    me.$Message.error(me.$t('monitor.CMD_SEND_RESULT_OFFLINE_CACHED'));
                } else if (status === CMD_SEND_RESULT_MODIFY_DEFAULT_PASSWORD) {
                    me.$Message.error(me.$t('monitor.CMD_SEND_RESULT_MODIFY_DEFAULT_PASSWORD'));
                } else if (status === CMD_SEND_RESULT_DETAIL_ERROR) {
                    me.$Message.error(me.$t('monitor.CMD_SEND_RESULT_DETAIL_ERROR') + resp.cause);
                } else if (status === CMD_SEND_CONFIRMED) {
                    if (resp.devicemedia != null) {
                        me.cameraImgUrl = devicemedia.url
                        me.cameraImgModal = true;
                        me.cameraImgDeviceTime = devicemedia.devicetime;
                    } else {
                        me.$Message.error('devicemedia is null');
                    }
                } else if (status === CMD_SEND_OVER_RETRY_TIMES) {
                    me.$Message.error(me.$t('monitor.CMD_SEND_OVER_RETRY_TIMES'));
                } else if (status === CMD_SEND_SYNC_TIMEOUT) {
                    me.$Message.error(me.$t('message.captureFail'));
                }

            }, function() {
                me.loading = false;
                me.$Message.error(me.$t('message.networkError'));
            });
        },
        onClickCameraDownload: function() {
            if (this.cameraImgUrl && this.cameraImgDeviceTime) {
                window.open(this.cameraImgUrl);
            }
        },
        openTreeDeviceNav: function(deviceid) {
            var me = this;
            utils.setCurrentDeviceid(deviceid);
            var devLastInfo = me.getSingleDeviceInfo(deviceid);
            var device = this.deviceInfos[deviceid];
            var devicetype = device ? device.devicetype : 1;
            this.currentDeviceType = devicetype;

            me.$store.commit('currentDeviceId', deviceid);
            if (devLastInfo) {
                me.$store.commit('currentDeviceRecord', devLastInfo);
            }
            globalDeviceId = deviceid;
            globalDeviceName = device ? device.devicename : deviceid;
            me.groups.forEach(function(group) {
                group.devices.forEach(function(device) {
                    if (device.deviceid == deviceid) {
                        device.isSelected = true;
                        group.expand = true;
                        me.selectedDevObj = device;
                    } else {
                        device.isSelected = false;
                    };
                });
            });

            this.scrollToCurruntDevice(deviceid);
        },
        getSingleDeviceInfo: function(deviceid) {
            return this.positionLastrecords[deviceid];
        },
        queryCompanyTree: function(callback) {
            var url = myUrls.queryCompanyTree();
            utils.sendAjax(url, {}, function(resp) {
                callback(resp);
            });
        },
        handleEditDevFn: function() {
            var me = this;
            var data = this.editDevData;
            var sendData = {
                deviceid: data.deviceid,
                devicename: data.devicename,
                remark: data.remark,
                loginname: data.loginname,
                expirenotifytime: new Date(this.expirenotifytime).getTime()
            };
            var url = myUrls.editDeviceSimple();
            if (data.devicename.length == 0 || data.devicename == '') {
                me.$Message.error(me.$t("monitor.devNameMust"))
                return;
            }
            if (data.simnum) {
                sendData.simnum = data.simnum;
            }

            utils.sendAjax(url, sendData, function(resp) {
                if (resp.status == 0) {
                    me.editDeviceInfo.title = sendData.devicename;
                    me.editDeviceInfo.simnum = sendData.simnum;
                    me.editDevData.expirenotifytime = sendData.expirenotifytime;
                    me.expirenotifytime = new Date(sendData.expirenotifytime);
                    utils.changeGroupsDevName(sendData, me.groups);
                    me.editDevModal = false;
                    me.$Message.success(me.$t("message.changeSucc"));
                    me.deviceInfos[data.deviceid].simnum = sendData.simnum;
                    me.deviceInfos[data.deviceid].remark = sendData.remark;
                    me.deviceInfos[data.deviceid].expirenotifytime = data.expirenotifytime;
                    me.deviceInfos[data.deviceid].loginname = sendData.loginname;

                    var record = me.getSingleDeviceInfo(data.deviceid);
                    if (record) {
                        me.positionLastrecords[data.deviceid].devicename = sendData.devicename;

                        me.updateMarkerLabel(record, sendData);
                    };
                } else if ((resp.status == 1)) {
                    me.$Message.error(me.$t("message.loginNameOccupied"))
                } else if ((resp.status == -1)) {
                    me.$Message.error(me.$t("message.changeFail"))
                }
            })
        },
        updateMarkerLabel: function(track, deviceInfo) {
            var deviceid = deviceInfo.deviceid;
            var devicename = deviceInfo.devicename;
            if (this.isShowLabel) {
                var marker = this.mapAllMarkers[deviceid];
                marker.setProperties({
                    'name': devicename
                });
            }
        },
        editDevice: function(deviceid) {
            var deviceInfo = this.deviceInfos[deviceid];
            this.$store.commit('editDeviceInfo', deviceInfo);
            var disabled = true;
            if (Number(this.userType) <= 1) {
                disabled = false;
            } else {
                disabled = deviceInfo.allowedit == 0;
            }

            this.editDevData.devicename = deviceInfo.devicename;
            this.editDevData.simnum = deviceInfo.simnum;
            this.editDevData.loginname = deviceInfo.loginname;
            this.editDevData.deviceid = deviceid;
            this.editDevData.remark = deviceInfo.remark;
            this.editDevData.disabled = disabled;
            this.editDevData.expirenotifytime = deviceInfo.expirenotifytime;
            this.expirenotifytime = DateFormat.longToDateTimeStr(deviceInfo.expirenotifytime, 0);
            this.editDevModal = true;
        },
        playBack: function(deviceid) {
            playBack(deviceid)
        },
        trackMap: function(deviceid) {
            trackMap(deviceid)
        },
        getCurrentStateTreeData: function(state) {
            var me = this;
            this.sosoData = [];
            if (state === 'all') {

                this.getAllHideCompanyTreeData();

            } else if (state === 'online') {

                this.getOnlineHideCompanyTreeData();

            } else if (state === 'offline') {

                this.getOfflineHideCompanyTreeData();

            } else if (state === 'stared') {
                this.getStockHideCompanyTreeData();
            };
        },
        filterGroups: function(groups) {
            var me = this,
                all = 0;
            groups.forEach(function(group) {
                var devCount = 0;
                if (group.groupname == 'Default') {
                    isZh ? group.groupname = me.$t("monitor.defaultGroup") : '';
                } else if (group.groupname == 'Device') {
                    isZh ? group.groupname = me.$t("monitor.devGroup") : '';
                };
                var firstLetter = __pinyin.getFirstLetter(group.groupname);
                var pinyin = __pinyin.getPinyin(group.groupname);

                group.firstLetter = firstLetter
                group.pinyin = pinyin;
                group.expand = false;

                group.children = group.devices;
                group.devices.forEach(function(device) {
                    all++;
                    devCount++;
                    var devicename = device.devicename;
                    var devicetype = device.devicetype;
                    var deviceid = device.deviceid;
                    carIconTypes[deviceid] = device.icon;
                    device.isSelected = false;
                    device.firstLetter = __pinyin.getFirstLetter(devicename);
                    device.pinyin = __pinyin.getPinyin(devicename);

                    device.devicetitle = devicename;
                    device.allDeviceIdTitle = device.devicetitle + "-" + deviceid;
                    var functionslong = me.deviceTypes[devicetype].functionslong;

                    device.videoChannels = [];
                    if (utils.hasFunction(functionslong, videoMask)) {
                        for (var index = 1; index <= device.videochannelcount; index++) {
                            device.videoChannels.push({
                                channel: index,
                                name: 'CH' + index
                            })
                        }
                        device.isVedio = true;
                    } else {
                        device.isVedio = false;
                    }

                });

                group.devCount = devCount;
                group.devices.sort(function(a, b) {
                    return a.devicetitle.localeCompare(b.devicetitle);
                });
                group.title = group.groupname + "(0/" + devCount + ")";
            });
            this.allDevCount = all;
            this.onlineCount = 0;
            this.offlineDevCount = all;
            return groups.filter(function(group) { return group.devices.length });
        },
        dblClickDeviceVideo: function(device) {
            this.selectedDevObj = device;
            if (!this.isShowVideoBtn) {
                this.$Message.error(this.$t('monitor.deviceNotVideo'));
                return
            }
            if (device.isOffline) {
                this.$Message.error(this.$t('monitor.deviceOffline'));
                return
            }
            var videochannelcount = device.videochannelcount;
            var playerIns = this.$refs;
            var deviceInfo = {
                deviceid: device.deviceid,
                devicename: device.devicename,
                channel: null,
            }


            for (var i = 1; i <= videochannelcount; i++) {
                var playedIndex = this.getPlayerIndexInPlayerList(device.deviceid, i);

                if (playedIndex <= 0) {
                    var playingIndex = this.getPlayingIndex();
                    var playerIn = playerIns['player' + playingIndex][0];
                    deviceInfo.channel = i;
                    playerIn.setDevicedInfoAndPlay(deviceInfo);

                } else {
                    var playerIn = playerIns['player' + playedIndex][0];
                    deviceInfo.channel = i;
                    playerIn.setDevicedInfoAndPlay(deviceInfo);
                }
            }

        },
        handlePlayDeviceToChannel: function(device, channel) {
            if (device.isOffline) {
                this.$Message.error(this.$t('monitor.deviceOffline'));
                return;
            }
            var devInfo = {
                deviceid: device.deviceid,
                devicename: device.devicename,
                channel: channel + 1
            }
            var playerIns = this.$refs;
            var playedIndex = this.getPlayerIndexInPlayerList(device.deviceid, devInfo.channel);

            if (playedIndex <= 0) {
                var playingIndex = this.getPlayingIndex();
                var playerIn = playerIns['player' + playingIndex][0];
                playerIn.setDevicedInfoAndPlay(devInfo);
            } else {
                var playerIn = playerIns['player' + playedIndex][0];
                playerIn.setDevicedInfoAndPlay(devInfo);
            }
        },
        getPlayingIndex: function() {
            var playingIndex = 1;
            var totalVideoNumer = this.videoNumber + 1;
            var playingIndex = this.currentPlayingIndex + 1;
            if (playingIndex >= totalVideoNumer) {
                playingIndex = 1;
            }
            this.currentPlayingIndex = playingIndex;
            return playingIndex;
        },
        getPlayerIndexInPlayerList: function(deviceid, channel) {
            var resultIndex = 0;
            var playerIns = this.$refs;
            for (var i = 1; i <= this.videoNumber; i++) {
                var player = playerIns['player' + i][0];
                if (player.deviceId == deviceid && player.channel == channel) {
                    resultIndex = i;
                    break;
                }
            }
            return resultIndex;
        },
        echartsMapPage: function() {
            window.open('datav.html?token=' + token);
        },
        smartKanbanPage: function() {
            window.open('smartkanban.html?token=' + token + '&username=' + userName);
        },
        addDeviceExpirationReminder: function(device) {
            if (device.isfree == 3) {
                device.devicetitle = device.devicename + this.$t("monitor.deviceDisabled");
            } else if (device.isfree == 4) {
                device.devicetitle = device.devicename + this.$t("monitor.deviceExpiration");
            } else if (device.isfree == 5) {
                device.devicetitle = device.devicename + this.$t("monitor.deviceExpired");
            }
        },
        getAllHideCompanyTreeData: function() {
            var me = this;
            var currentUTC = DateFormat.getCurrentUTC();
            this.groups.forEach(function(group) {
                var count = 0;
                var online = 0;
                group.devices.forEach(function(device, index) {
                    count++;
                    var isOnline = me.getIsOnline(device.deviceid, currentUTC);
                    device.isOnline = isOnline;
                    if (isOnline) {
                        online++;
                        if (group.expand) {
                            device.isMoving = me.positionLastrecords[device.deviceid].moving != 0;
                            if (device.isfree < 3) {
                                device.devicetitle = device.devicename;
                            } else {
                                me.addDeviceExpirationReminder(device);
                            }
                        }
                    } else {
                        if (group.expand) {
                            me.updateDeviceLastActiveTime(device);
                            var track = me.positionLastrecords[device.deviceid];
                            device.isMoving = null;

                            if (device.isfree < 3) {
                                if (track == undefined && device.lastactivetime <= 0) {
                                    device.devicetitle = device.devicename + me.$t("monitor.notEnabled");
                                } else {
                                    var offlineTime = currentUTC - device.lastactivetime;
                                    device.devicetitle = device.devicename + " [" + me.$t("monitor.offline") + utils.timeStampNoSecond(offlineTime) + "] ";
                                }
                            } else {
                                me.addDeviceExpirationReminder(device);
                            }
                        }
                    };


                });
                if (group.expand) {
                    group.devices.sort(function(a, b) {
                        return a.devicetitle.localeCompare(b.devicetitle);
                    });
                }
                group.isShow = true;
                group.title = group.groupname + "(" + online + "/" + count + ")";
            });
        },
        getOnlineHideCompanyTreeData: function() {
            var me = this;
            var currentUTC = DateFormat.getCurrentUTC();
            this.groups.forEach(function(group) {
                var online = 0;
                var count = 0;
                group.devices.forEach(function(device, index) {
                    count++;
                    var isOnline = me.getIsOnline(device.deviceid, currentUTC);
                    device.isOnline = isOnline;
                    if (isOnline) {
                        device.isMoving = me.positionLastrecords[device.deviceid].moving != 0;
                        online++;
                        if (device.isfree < 3) {
                            device.devicetitle = device.devicename;
                        } else {
                            me.addDeviceExpirationReminder(device);
                        }
                    };
                });
                if (online != 0) {
                    group.isShow = true;
                } else {
                    group.isShow = false;
                }
                group.title = group.groupname + "(" + online + "/" + count + ")";
                group.devices.sort(function(a, b) {
                    return a.devicetitle.localeCompare(b.devicetitle);
                });
            });
        },
        updateDeviceLastActiveTime: function(device) {
            var track = this.positionLastrecords[device.deviceid];
            var finallyLastActiveTime = device.lastactivetime;
            if (track) {
                finallyLastActiveTime = track.updatetime;
            }
            device.lastactivetime = finallyLastActiveTime;
        },
        getOfflineHideCompanyTreeData: function() {
            var me = this;
            var currentUTC = DateFormat.getCurrentUTC();
            this.groups.forEach(function(group) {
                var offline = 0;
                var count = 0;
                group.devices.forEach(function(device, index) {
                    count++;
                    me.updateDeviceLastActiveTime(device);
                    var isOnline = me.getIsOnline(device.deviceid, currentUTC);
                    var isStock = device.lastactivetime <= 0;
                    device.isOffline = !isOnline && !isStock;

                    if (device.isOffline) {
                        offline++;
                        if (group.expand) {
                            if (device.isfree < 3) {
                                var track = me.positionLastrecords[device.deviceid];
                                if (track == undefined && device.lastactivetime <= 0) {
                                    device.devicetitle = device.devicename + me.$t("monitor.notEnabled");
                                } else {
                                    var offlineTime = currentUTC - device.lastactivetime;
                                    device.devicetitle = device.devicename + " [" + me.$t("monitor.offline") + utils.timeStampNoSecond(offlineTime) + "] ";
                                }
                            } else {
                                me.addDeviceExpirationReminder(device);
                            }
                        }
                    };
                });
                if (group.expand) {
                    group.devices.sort(function(a, b) { return b.lastactivetime - a.lastactivetime });
                }
                if (offline != 0) {
                    group.isShow = true;
                } else {
                    group.isShow = false;
                }
                group.title = group.groupname + "(" + offline + "/" + count + ")";
            });
        },
        getStockHideCompanyTreeData: function() {
            var me = this;
            var currentUTC = DateFormat.getCurrentUTC();
            this.groups.forEach(function(group) {
                var stared = 0;
                var count = 0;
                group.devices.forEach(function(device, index) {
                    count++;
                    if (device.stared == 1) {
                        stared++;
                        device.isStared = true;
                        var isOnline = me.getIsOnline(device.deviceid, currentUTC);
                        device.isOnline = isOnline;
                        if (isOnline) {

                            device.isMoving = me.positionLastrecords[device.deviceid].moving != 0;
                            if (device.isfree < 3) {
                                device.devicetitle = device.devicename;
                            } else {
                                me.addDeviceExpirationReminder(device);
                            }

                        } else {

                            me.updateDeviceLastActiveTime(device);
                            var track = me.positionLastrecords[device.deviceid];
                            device.isMoving = null;

                            if (device.isfree < 3) {
                                if (track == undefined && device.lastactivetime <= 0) {
                                    device.devicetitle = device.devicename + me.$t("monitor.notEnabled");
                                } else {
                                    var offlineTime = currentUTC - device.lastactivetime;
                                    device.devicetitle = device.devicename + " [" + me.$t("monitor.offline") + utils.timeStampNoSecond(offlineTime) + "] ";
                                }
                            } else {
                                me.addDeviceExpirationReminder(device);
                            }

                        };
                    } else {
                        device.isStared = false;
                    }




                });
                if (stared != 0) {
                    group.isShow = true;
                } else {
                    group.isShow = false;
                }
                group.title = group.groupname + "(" + stared + "/" + count + ")";
            });
        },
        getIsOnline: function(deviceid, currentTime) {
            var isOnline = false;
            var record = this.positionLastrecords[deviceid];
            if (record) {
                var updatetime = record.updatetime;
                if ((currentTime - updatetime) < this.offlineTime) {
                    isOnline = true;
                };
            }
            return isOnline;
        },
        updateDevLastPosition: function(item) {
            var deviceid = item.deviceid;
            var currentTime = DateFormat.getCurrentUTC();
            if (this.deviceInfos && this.deviceInfos[deviceid]) {
                var b_lon_and_b_lat = wgs84tobd09(item.callon, item.callat)
                var g_lon_and_g_lat = wgs84togcj02(item.callon, item.callat);
                var online = this.getIsOnline(item, currentTime);
                item.b_lon = b_lon_and_b_lat[0];
                item.b_lat = b_lon_and_b_lat[1];
                item.g_lon = g_lon_and_g_lat[0];
                item.g_lat = g_lon_and_g_lat[1];
                item.online = online;
                item.devicename = vstore.state.deviceInfos[deviceid].devicename;

                this.updateNewPositionLastValue(deviceid, item);
            }
        },

        updateNewPositionLastValue: function(deviceid, newPositionLast) {
            var oldPositionLast = this.positionLastrecords[deviceid];
            var oldCurrentMileage = "";
            if (oldPositionLast) {
                oldCurrentMileage = oldPositionLast.currentDayMileage;
                if (oldCurrentMileage == undefined) {
                    oldCurrentMileage = "-";
                }
            }
            newPositionLast.currentDayMileage = oldCurrentMileage;
            this.positionLastrecords[deviceid] = newPositionLast;
        },

        dorefreshMapUI: function() {
            // console.log("dorefreshMapUI enter isNeedRefreshMapUI=",isNeedRefreshMapUI);
            if (vstore.state.headerActiveName == 'monitor') {
                if (isNeedRefreshMapUI == true) {
                    isNeedRefreshMapUI = false;
                    this.updateLastTracks(globalDeviceId);
                    this.updateTreeOnlineState();
                    this.caclOnlineCount();
                }
            }
        },
        isNeedUpdateMarker: function(track, marker) {
            var result = false;
            var point = marker.getCoordinates();
            var lon = point.x;
            var lat = point.y;
            var mSymbol = marker.getSymbol()[0];
            if (this.mapType == 'bMap') {
                if (lon !== track.b_lon && lat !== track.b_lat) {
                    result = true;
                }
            } else {
                if (lon !== track.g_lon && lat !== track.g_lat) {
                    result = true;
                }
            }

            if (result == false) {
                if (track.online !== mSymbol.online || track.moving !== mSymbol.moving || track.course !== Math.abs(mSymbol.markerRotation)) {
                    result = true;
                }
            }
            return result;
        },
        updateLastTracks: function(deviceid) {
            var me = this;
            var currentTime = DateFormat.getCurrentUTC();
            var isBMap = this.mapType == 'bMap';
            for (var key in this.positionLastrecords) {
                var track = this.positionLastrecords[key];
                if (track) {
                    track.online = utils.getIsOnlineWithTime(track, currentTime);
                    var marker = this.mapAllMarkers[key];
                    if (marker) {

                        if (this.isNeedUpdateMarker(track, marker)) {
                            var point = {
                                x: isBMap ? track.b_lon : track.g_lon,
                                y: isBMap ? track.b_lat : track.g_lat,
                            }
                            marker.setSymbol(this.getMarkerSymbol(track, this.isShowLabel));
                            marker.setCoordinates(point)
                        }

                    } else {
                        marker = this.createMarker(track).on('mousedown', this.onClickMarker);
                        marker.deviceid = key;
                        this.mapAllMarkers[key] = marker;
                        this.clusterLayer.addMarker(marker);
                    }
                    if (deviceid === key) {
                        var copyMarker = marker;
                        var infoWindow = this.globalInfoWindow;
                        if (infoWindow && infoWindow.isVisible && infoWindow.isVisible()) {

                            var address = me.getAddress(track, marker)
                            var sContent = me.getInfoWindowContent(track, address);
                            // marker.setInfoWindow(sContent);
                            marker.setZIndex(999);
                            // marker.openInfoWindow();
                            me.showMapInfoWindow(sContent, copyMarker.getCoordinates());

                            this.queryCurrentDevReportMileageDetail(deviceid, function(currentDayMileage, track) {
                                if (track.deviceid == globalDeviceId) {
                                    track.currentDayMileage = currentDayMileage;
                                    var address = me.getAddress(track, copyMarker);
                                    var sContent = me.getInfoWindowContent(track, address);
                                    me.showMapInfoWindow(sContent, copyMarker.getCoordinates());
                                }
                            })
                        }
                        if (!this.isMapMode) {
                            this.map.setCenter(copyMarker.getCoordinates());
                        }
                    }

                }
            }

        },
        timeoutRefreshMapUI: function() {
            var me = this;
            clearTimeout(this.timerTimeout);
            this.timerTimeout = setTimeout(function() {
                me.intervalTime % 2 == 0 && me.dorefreshMapUI();
                if (me.intervalTime == me.stateIntervalTime) {
                    me.getLastPosition([], function() {
                        me.dorefreshMapUI();
                    }, function(error) {});
                }
                me.intervalTime % 5 == 0 && me.stopVideoPlayer();
            }, 10);
        },
        setIntervalReqRecords: function() {
            var me = this
            this.intervalInstanse = setInterval(function() {
                //dorefreshUI
                me.intervalTime--;
                if (me.intervalTime <= 0) {
                    me.intervalTime = me.stateIntervalTime;
                }
                me.intervalTime % 2 == 0 && me.dorefreshMapUI();
                if (me.intervalTime == me.stateIntervalTime) {
                    me.getLastPosition([], function() {
                        me.dorefreshMapUI();
                    }, function(error) {});
                }
                me.intervalTime % 5 == 0 && me.stopVideoPlayer();

            }, 1000);
        },
        onMousemoveMap: function(e) {
            if (!this.isFullMap) return;
            this.isMouseoverTop35 = false;
            var clientY = e.clientY;
            if (clientY >= 140) {
                if (this.isMouseoverTop35 == false) {
                    this.isMouseoverTop35 = true;
                }
            } else {
                if (this.isMouseoverTop35 == true) {
                    this.isMouseoverTop35 = false;
                }
            }
        },
        onMouseenter: function() {
            if (!this.isFullMap) return;
            this.isMouseoverTop35 = true;
        },
        handleMousemove: function(e) {
            var pageY = event.pageY;
            var height = 8 * 38;
            var isOverflow = pageY + height < window.innerHeight
            this.placement = isOverflow ? 'right-start' : 'right-end';
        },
        caclOnlineCount: function() {
            var me = this;
            var online = 0;
            var staredDevCount = 0;
            var offlineDevCount = 0;
            var deviceIds = Object.keys(me.deviceInfos);
            var currentTime = DateFormat.getCurrentUTC();
            this.groups.forEach(function(group) {
                group.devices.forEach(function(device) {
                    if (me.getIsOnline(device.deviceid, currentTime)) {
                        online++;
                    } else {
                        if (device.lastactivetime <= 0) {} else {
                            offlineDevCount++;
                        }
                    }
                    if (device.stared == 1) {
                        staredDevCount++;
                    }
                });
            })

            this.allDevCount = deviceIds.length;
            this.onlineDevCount = online;
            this.offlineDevCount = offlineDevCount;
            this.staredDevCount = staredDevCount;
        },
        onSelectState: function() {

            this.getCurrentStateTreeData(
                this.selectedState
            )

        },
        isShowRecordBtnByDeviceType: function() {
            var deviceTypes = this.deviceTypes;
            var isShowRecordBtn = false;
            var isShowBmsBtn = false;
            var isShowObdBtn = false;
            var isShowWatermeterBtn = false;
            var isShowVideoBtn = false;
            var isShowActiveSafetyBtn = false;

            var functionslong = deviceTypes[this.currentDeviceType].functionslong;
            if (utils.hasFunction(functionslong, recordSoundMask)) {
                isShowRecordBtn = true;
            };
            if (utils.hasFunction(functionslong, bmsMask)) {
                isShowBmsBtn = true;
            };
            if (utils.hasFunction(functionslong, obdMask)) {
                isShowObdBtn = true;
            };

            if (utils.hasFunction(functionslong, waterMeterMask)) {
                isShowWatermeterBtn = true;
            };
            if (utils.hasFunction(functionslong, videoMask)) {
                isShowVideoBtn = true;
            };
            if (utils.hasFunction(functionslong, activeSafetyMask)) {
                isShowActiveSafetyBtn = true;
            };
            this.isShowRecordBtn = isShowRecordBtn;
            this.isShowBmsBtn = isShowBmsBtn;
            this.isShowObdBtn = isShowObdBtn;
            this.isShowWatermeterBtn = isShowWatermeterBtn;
            this.isShowVideoBtn = isShowVideoBtn;
            this.isShowActiveSafetyBtn = isShowActiveSafetyBtn;
        },
        getDeviceTypeName: function(deviceTypeId) {
            var typeName = "",
                deviceTypes = this.deviceTypes;
            var element = deviceTypes[deviceTypeId];
            typeName = element.typename;
            return typeName;
        },
        getMonitorList: function() {
            var me = this;
            this.getMonitorListByUser({ username: userName, }, function(resp) {
                var groups = resp.groups;
                communicate.$emit("monitorlist", groups);
                me.groups = me.filterGroups(groups);
                // me.videoGroup = me.getVideoGroup(groups);
                me.groups.sort(function(a, b) {
                    return a.groupname.localeCompare(b.groupname);
                });
                me.$store.dispatch('setdeviceInfos', me.groups);
                me.getLastPosition([], function() {
                    me.addClusterLayer();
                    communicate.$on("positionlast", me.handleWebSocket);
                    communicate.$on("on-click-expiration", function(deviceid) {
                        me.editDevice(deviceid);
                        me.openTreeDeviceNav(deviceid);
                    });
                    // GlobalOrgan.getInstance().getGlobalOrganData();
                }, function(error) {});
                me.isLoadGroup = false;
                me.setIntervalReqRecords();
                if (userName) {
                    var initIsPass = initWebSocket(wsHost, userName, me.wsCallback); // 连接webSocket
                    if (!initIsPass) {
                        this.$Message.error("浏览器不支持webSocket");
                    }
                }
            });
        },
        createMarker: function(track) {
            var isBMap = this.mapType == 'bMap';
            var pointArr = isBMap ? [track.b_lon, track.b_lat] : [track.g_lon, track.g_lat];
            var deviceInfo = this.deviceInfos[track.deviceid];
            var deviceName = deviceInfo ? deviceInfo.devicename : track.deviceid;
            return new maptalks.Marker(
                pointArr, {
                    'properties': {
                        'name': deviceName
                    },
                    'symbol': this.getMarkerSymbol(track, this.isShowLabel),
                }
            );
        },
        getMarkerSymbol: function(track, isShowLabel) {

            if (isShowLabel) {
                return [{
                    'markerFile': this.getCarMarkerImgSrc(track),
                    'markerWidth': 30,
                    'markerHeight': 30,
                    'markerDy': 15,
                    'markerRotation': 360 - (track.course || 0),
                    'online': track.online,
                    'moving': track.moving,
                }, {
                    'textFaceName': 'sans-serif',
                    'textName': '{name}',
                    'textSize': 14,
                    'textDy': 30,
                    'textFill': '#ffffff',
                    'textOpacity': 1,
                    'textHaloFill': '#00A8D4',
                    'textHaloRadius': 5,
                    'textWrapWidth': null,
                    'textWrapCharacter': '\n',
                    'textLineSpacing': 0,
                }];
            } else {
                return [{
                    'markerFile': this.getCarMarkerImgSrc(track),
                    'markerWidth': 30,
                    'markerHeight': 30,
                    // 'markerDy': 15,
                    // 'markerDx': 15,
                    'markerRotation': 360 - (track.course || 0),
                    'online': track.online,
                    'moving': track.moving,
                    "markerHorizontalAlignment": "middle",
                    "markerVerticalAlignment": "middle",
                }];
            }
        },
        getCarMarkerImgSrc: function(track) {
            var deviceid = track.deviceid;
            var iconType = carIconTypes[deviceid] !== undefined ? carIconTypes[deviceid] : 0;
            var imagekey = "";
            imagekey = track.online + "-" + track.moving + "-" + iconType;
            var cacheIcon = gMapIconList[imagekey];
            if (!cacheIcon) {
                var imgPath = '';
                if (utils.isLocalhost()) {
                    imgPath = myUrls.viewhost + 'images/carstate'
                } else {
                    imgPath = '../images/carstate'
                }
                if (track.online) {
                    if (track.moving == 0) {
                        imgPath += '/' + iconType + '_red_0.png'
                    } else {
                        imgPath += '/' + iconType + '_green_0.png'
                    }

                } else {
                    imgPath += '/' + iconType + '_gray_0.png'
                }

                cacheIcon = imgPath;
                gMapIconList[imagekey] = cacheIcon;

            }


            return cacheIcon;
        },
        addClusterLayer: function() {
            var markers = [];
            for (var key in this.positionLastrecords) {
                var track = this.positionLastrecords[key];
                var marker = this.createMarker(track).on('mousedown', this.onClickMarker);

                marker.deviceid = key;
                this.mapAllMarkers[key] = marker;
                markers.push(marker);
            }

            this.clusterLayer = new maptalks.ClusterLayer('cluster', markers, {
                'animation': false,
                'noClusterWithOneMarker': true,
                'maxClusterZoom': 16,
                'symbol': {
                    'markerType': 'ellipse',
                    'markerFill': {
                        property: 'count',
                        type: 'interval',
                        stops: [
                            [0, 'rgb(135, 196, 240)'],
                            [9, '#1bbc9b'],
                            [99, 'rgb(216, 115, 149)']
                        ]
                    },
                    'markerFillOpacity': 0.7,
                    'markerLineOpacity': 1,
                    'markerLineWidth': 3,
                    'markerLineColor': '#fff',
                    'markerWidth': {
                        property: 'count',
                        type: 'interval',
                        stops: [
                            [0, 40],
                            [9, 60],
                            [99, 80]
                        ]
                    },
                    'markerHeight': {
                        property: 'count',
                        type: 'interval',
                        stops: [
                            [0, 40],
                            [9, 60],
                            [99, 80]
                        ]
                    }
                },
                'drawClusterText': true,
                'geometryEvents': true,
                'single': true
            });
            this.clusterLayer.setZIndex(999);
            this.map.addLayer(this.clusterLayer);
        },
        onClickMarker: function(e) {

            var me = this;
            var marker = e.target;
            var deviceid = marker.deviceid;
            var point = marker.getCoordinates();

            var track = this.getSingleDeviceInfo(deviceid);
            me.currentDeviceType = vstore.state.deviceInfos[deviceid] ? vstore.state.deviceInfos[deviceid].devicetype : 1;
            me.map.setCenter(point);
            var address = me.getAddress(track, marker);
            var sContent = me.getInfoWindowContent(track, address);

            me.showMapInfoWindow(sContent, point);

            if (globalDeviceId) {
                var oldMarker = me.mapAllMarkers[globalDeviceId];
                oldMarker && oldMarker.setZIndex(111);
            }
            marker.setZIndex(999);
            globalDeviceId = deviceid;
            me.openTreeDeviceNav(deviceid);

            this.queryCurrentDevReportMileageDetail(deviceid, function(currentDayMileage, track) {
                if (track.deviceid == globalDeviceId) {
                    track.currentDayMileage = currentDayMileage;
                    var address = me.getAddress(track, marker);
                    var sContent = me.getInfoWindowContent(track, address);
                    me.showMapInfoWindow(sContent, marker.getCoordinates());
                }
            });
        },
        getInfoWindowContent: function(track, address) {
            var sContent = utils.getWindowContent(track, address);
            return sContent;
        },
        getAddress: function(track, marker) {
            var me = this;
            var callon = track.callon;
            var callat = track.callat;
            var address = LocalCacheMgr.getAddress(callon, callat);
            if (address !== null) {
                return address;
            }


            utils.getJiuHuAddressSyn(callon, callat, function(resp) {
                address = resp.address;
                if (resp.status > 9900) {
                    console.log('getJiuHuAddressSyn token失效,请重新登录')
                } else if (resp.status == 0 && address) {

                    LocalCacheMgr.setAddress(callon, callat, address);
                    var sContent = me.getInfoWindowContent(track, address);
                    me.showMapInfoWindow(sContent, marker.getCoordinates());
                } else {
                    console.log('getJiuHuAddressSyn 查询地址失败')
                }
            });

            return "地址正在解析...";
        },
        showMapInfoWindow: function(sContent, coordinate) {
            this.globalInfoWindow.setContent(sContent);
            this.globalInfoWindow.show(coordinate);
        },
        wsCallback: function(resp) {
            var action = resp.action;
            if (action === "remindmsg") {
                var data = resp.remindMsg;
                communicate.$emit("remindmsg", data);
            } else if (action === "positionlast") {
                var data = resp.positionLast;
                communicate.$emit("positionlast", data);
            } else if (action === "reminddevicemsg") {
                var data = resp.devicemsg;
                communicate.$emit("reminddevicemsg", data);
            } else if (action == "reminddevicemedia") {
                var devicemediatemp = resp.devicemedia;
                this.addPushMediaToLocalStore(devicemediatemp);
            };
        },
        addPushMediaToLocalStore: function(devicemedia) {
            var deviceid = devicemedia.deviceid;
            localStorage.setItem("devicemedia-" + deviceid, JSON.stringify(devicemedia));
        },
        refreshMonitorRestartOpen: function() {
            var me = this;
            if (globalDeviceId) {

                for (var i = 0; i < me.groups.length; i++) {
                    var group = me.groups[i];
                    for (var j = 0; j < group.devices.length; j++) {
                        var device = group.devices[j];
                        if (device.deviceid === globalDeviceId) {
                            device.isSelected = true;
                            group.expand = true;
                            me.selectedDevObj = device;
                            setTimeout(function() { me.handleClickDev(device.deviceid); }, 300);
                            return;
                        }
                    }
                }

            }
        },
        changeIsFullMapIcon: function() {
            var isFullscreen = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen
            isFullscreen = !!isFullscreen;
            !isFullscreen && (this.isMouseoverTop35 = false);
            return isFullscreen;
        },
        copyToClipboard: function() {
            var text = globalDeviceId;
            if (text.indexOf('-') !== -1) {
                let arr = text.split('-');
                text = arr[0] + arr[1];
            }
            var textArea = document.createElement("textarea");
            textArea.style.position = 'fixed';
            textArea.style.top = '0';
            textArea.style.left = '0';
            textArea.style.width = '2em';
            textArea.style.height = '2em';
            textArea.style.padding = '0';
            textArea.style.border = 'none';
            textArea.style.outline = 'none';
            textArea.style.boxShadow = 'none';
            textArea.style.zIndex = -99;
            textArea.style.background = 'transparent';

            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();

            try {
                var successful = document.execCommand('copy');
                if (isZh) {
                    var msg = successful ? '成功复制到剪贴板' : '该浏览器不支持点击复制到剪贴板';
                } else {
                    var msg = successful ? 'Successfully copied to the clipboard' : 'This browser does not support Click to copy to the clipboard';
                }
                new Vue().$Message.success(msg);
            } catch (err) {
                new Vue().$Message.error(isZh ? '该浏览器不支持点击复制到剪贴板' : 'This browser does not support Click to copy to the clipboard');
            }
            setTimeout(function() {
                document.body.removeChild(textArea);
            }, 2000)
        },

    },
    computed: {
        username: function() {
            return localStorage.getItem('name');
        },
        isShowCompanyName: function() {
            return this.$store.state.isShowCompany;
        },
        stateIntervalTime: function() {
            return this.$store.state.intervalTime;
        },
        editDeviceInfo: function() {
            return this.$store.state.editDeviceInfo;
        },
        currentDeviceRecord: function() {
            return this.$store.state.currentDeviceRecord;
        },
        currentDeviceId: function() {
            return this.$store.state.currentDeviceId;
        },
        deviceInfos: function() {
            return this.$store.state.deviceInfos;
        },
        deviceTypes: function() {
            return this.$store.state.deviceTypes;
        },
        userType: function() {
            return this.$store.state.userType;
        },
        videoContentCls: function() {
            return {
                'videoContent-1': this.videoNumber === 1,
                'videoContent-2': this.videoNumber === 2,
                'videoContent-4': this.videoNumber === 4,
                'videoContent-6': this.videoNumber === 6,
                'videoContent-8': this.videoNumber === 8,
                'videoContent-9': this.videoNumber === 9,
                'videoContent-16': this.videoNumber === 16,
            }
        },
    },
    watch: {
        isOpenDistance: function(newVal) {
            if (newVal) {
                this.distanceTool.enable();
                this.$Message.success(isZh ? '开启成功' : 'Open success');
            } else {
                this.distanceTool.disable();
                this.$Message.success(isZh ? '关闭成功' : 'Close success');
            }
        },
        mapType: function(newType) {
            this.coordinateTransformation(newType);
            if (globalDeviceId) {
                var track = this.positionLastrecords[globalDeviceId]
                if (track) {
                    if (newType == 'bMap') {
                        this.map.setCenter({
                            y: track.b_lat,
                            x: track.b_lon,
                        })
                    } else {
                        this.map.setCenter({
                            y: track.g_lat,
                            x: track.g_lon,
                        })
                    }
                }
            }

            localStorage.setItem('app-map-type', newType)
        },
        filterData: function() {
            if (this.filterData.length) {
                this.isShowMatchDev = true;
            } else {
                this.isShowMatchDev = false;
            }
        },
        currentDeviceType: function() {
            this.currentDevDirectiveList = utils.getDirectiveList(this.currentDeviceType);
            this.isShowRecordBtnByDeviceType();
        },
        selectedState: function() {
            this.onSelectState();
        },
        deviceTypes: function() {
            this.getMonitorList();
        },
        isShowLabel: function(newVal) {
            for (var key in this.mapAllMarkers) {
                var marker = this.mapAllMarkers[key];
                var track = this.positionLastrecords[key];
                marker.setSymbol(this.getMarkerSymbol(track, newVal));
                if (newVal) {
                    marker.setProperties({
                        name: track.devicename
                    })
                }
            }
        }
    },
    mounted: function() {
        var me = this;
        this.intervalTime = Number(this.stateIntervalTime);
        this.placeholder = this.$t("monitor.placeholder");
        this.audioPlayerTip = this.$t("monitor.audioPlayerTip");
        this.lastMapType = this.mapType;
        this.initMap();

        // if (!$.isEmptyObject(this.deviceTypes)) {
        //     this.getMonitorList();
        // }
        document.addEventListener('fullscreenchange', function() {
            me.isFullMap = me.changeIsFullMapIcon();
        })
        document.addEventListener('mozfullscreenchange', function() {
            me.isFullMap = me.changeIsFullMapIcon();
        })
        document.addEventListener('webkitfullscreenchange', function() {
            me.isFullMap = me.changeIsFullMapIcon();
        })
        document.addEventListener('msfullscreenchange', function() {
            me.isFullMap = me.changeIsFullMapIcon();
        })
    },
    created: function() {
        this.currentPlayingIndex = 0;
        this.positionLastrecords = {}; // 全部设备最后一次位置记录
        vstore.state.deviceLastPositions = this.positionLastrecords;
        this.mapAllMarkers = {}; // 全部设备的Marker集合
    },
    activated: function() {
        this.lastquerypositiontime = 0;
        if (isNeedRefresh) {
            var me = this;
            this.getMonitorListByUser({ username: userName }, function(resp) {
                me.groups = me.filterGroups(resp.groups);
                me.groups.sort(function(a, b) {
                    return a.groupname.localeCompare(b.groupname);
                });
                me.$store.dispatch('setdeviceInfos', me.groups);
                me.refreshMonitorRestartOpen();
                me.updateTreeOnlineState();
                isNeedRefresh = false;
            });
        };
    },
    beforeDestroy: function() {
        this.$store.commit('currentDeviceRecord', {});
        clearInterval(this.intervalInstanse);
        communicate.$off('positionlast', this.handleWebSocket);
        this.myDis && this.myDis.close();
        isLoadLastPositon = false;
    }
}