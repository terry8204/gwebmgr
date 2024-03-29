const recordSoundMask = 0x0001; //0   录音
const snapShotMask = 0x0002; //1    拍照
const soundChatMask = 0x0004; //2. 发微聊
const bmsMask = 0x0008; //3. 电池管理
const obdMask = 0x0010; //4. OBD诊断
const weightMask = 0x0020; //5. 称重
const waterMeterMask = 0x0040; //6. 水表
const videoMask = 0x0080; //7. 视频
const activeSafetyMask = 0x0100; //8. 主动安全
const oilDectectorMask = 0x0200; //9. 油耗
const tempHumiMask = 0x0400; //10. 温湿度 
const accMask = 0x0800; //acc
const rotateMask = 0x1000; //正反转
var utils = {
    deviceInfos: {},
    allSubgroups: {},
    queryAllSubgroups: function() {
        var url = myUrls.queryAllSubgroups(),
            me = this;
        this.sendAjax(url, {}, function(resp) {
            if (resp.records && resp.records.length) {
                resp.records.forEach(function(item) {
                    me.allSubgroups[item.creater] = item.groups;
                });
            }
        })
    },
    renderPerson: function(h, params) {
        var data = params.data;
        return h('span', {}, [
            h('span', [
                h('Icon', {
                    props: {
                        type: 'md-person'
                    },
                    style: {
                        marginRight: '8px'
                    }
                }),
                h('span', data.title)
            ]),
        ])
    },
    renderGroup: function(h, params) {
        var data = params.data;
        return h('span', {}, [
            h('span', [
                h('Icon', {
                    props: {
                        type: 'ios-folder-open'
                    },
                    style: {
                        marginRight: '8px'
                    }
                }),
                h('span', data.title)
            ]),
        ])
    },
    renderDev: function(h, params) {
        var data = params.data;
        var deviceid = data.deviceid;
        var track = vRoot.$children[1].positionLastrecords[deviceid];
        var isOnline = false;
        if (track) {
            isOnline = utils.getIsOnline(track);
        };
        return h('span', {
            style: {
                color: isOnline ? '#33DAD0' : '#B1BBC2'
            }
        }, [
            h('span', [
                h('Icon', {
                    props: {
                        type: 'md-phone-portrait'
                    },
                    style: {
                        marginRight: '8px',
                    }
                }),
                h('span', data.title)
            ]),
        ])
    },
    Bytes2HexStr: function(arr) {
        var str = "";
        for (var i = 0; i < arr.length; i++) {
            var tmp = arr[i].toString(16);
            if (tmp.length == 1) {
                tmp = "0" + tmp;
            }

            str += tmp;
        }
        return str;
    },
    HexStr2Bytes: function(str) {

        var pos = 0;

        var len = str.length;

        if (len % 2 != 0) {

            return null;

        }

        len /= 2;

        var hexA = new Array();

        for (var i = 0; i < len; i++) {

            var s = str.substr(pos, 2);

            var v = parseInt(s, 16);

            hexA.push(v);

            pos += 2;

        }

        return hexA;

    },
    transformPoint: function(pointList, isTransformationToWgs84) {
        var points = [];
        var iteratior = function(item) {
            var pointStr = item.split(',')
            if (isTransformationToWgs84) {
                var pointArr = bd09towgs84(Number(pointStr[0].trim()), Number(pointStr[1].trim()));
            } else {
                var pointArr = [Number(pointStr[0].trim()), Number(pointStr[1].trim())];
            }
            points.push({
                lon: pointArr[0].toFixed(6),
                lat: pointArr[1].toFixed(6),
            })
        }
        pointList.forEach(iteratior);
        return points;
    },
    getWgs84Boundaries: function(boundaries, isTransformationToWgs84) {
        var pointList = [],
            me = this;
        boundaries.forEach(function(item) {
            var points = me.transformPoint(item.split(";"), isTransformationToWgs84);
            pointList = pointList.concat(points);
        })
        return pointList;
    },
    getAreaName: function(province, city, county) {
        var result = [];
        for (var index = 0; index < provinceList.length; index++) {
            var provinceInfo = provinceList[index];
            if (provinceInfo.value == province) {
                var cityList = provinceInfo.children;
                result.push(provinceInfo.label);
                cityList.forEach(function(cityInfo) {
                    if (cityInfo.value == city) {
                        result.push(cityInfo.label);
                        var countyList = cityInfo.children;
                        countyList.forEach(function(countyInfo) {
                            if (countyInfo.value == county) {
                                result.push(countyInfo.label);
                                return false;
                            }
                        })
                        return false;
                    }
                });
                break;
            }
        }
        return result;
    },
    changeSingleItemData: function(records, item, propertyType) {

        for (var i = 0; i < records.length; i++) {
            var record = records[i];
            if (record[propertyType] === item[propertyType]) {
                records[i] = item;
                break;
            }
        }
    },
    locale: (function() {
        var locale = localStorage.getItem("PATH_LANG");
        if (locale != null) {
            return locale;
        };
        try {
            locale = messages ? messages.defaultLang : false;
            if (locale != false) {
                localStorage.setItem("PATH_LANG", locale);
            } else {
                locale = 'zh';
            }
        } catch (e) {
            locale = 'zh';
        }
        return locale;
    })(),
    getMapType: function() {
        var mapType = localStorage.getItem('app-map-type');
        if (!mapType) {
            if (this.locale === 'zh') {
                mapType = "bMap";
            } else {
                mapType = "gMap";
            }
        };
        return mapType;
    },
    getCurrentMapCoordinate: function(isBMap, point) {
        if (isBMap) {
            var lng_lat = wgs84tobd09(point[0], point[1]);
            return [lng_lat[0], lng_lat[1]];
        } else {
            var lng_lat = wgs84togcj02(point[0], point[1]);
            return [lng_lat[0], lng_lat[1]];
        }
    },

    timeStamp: function(mss) {
        var strTime = '';
        var days = parseInt(mss / (1000 * 60 * 60 * 24));
        var hours = parseInt((mss % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = parseInt((mss % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = parseInt((mss % (1000 * 60)) / 1000);
        days ? (strTime += days + vRoot.$t("reportForm.d")) : '';
        hours ? (strTime += hours + vRoot.$t("reportForm.h")) : '';
        minutes ? (strTime += minutes + vRoot.$t("reportForm.m")) : '';
        seconds ? (strTime += seconds + vRoot.$t("reportForm.s")) : '';
        return strTime == '' ? '0' + vRoot.$t("reportForm.m") : strTime;
    },
    timeStampNoSecond: function(mss) {
        var days = parseInt(mss / (1000 * 60 * 60 * 24));
        var hours = parseInt((mss % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = parseInt((mss % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = (mss % (1000 * 60)) / 1000;
        if (days > 0) {
            if (days > 999) {
                return "999>=" + vRoot.$t("reportForm.d");
            } else {
                return days + vRoot.$t("reportForm.d");
            }
        } else {
            if (hours > 0) {
                return hours + vRoot.$t("reportForm.h");
            } else {
                if (minutes > 0) {
                    return minutes + vRoot.$t("reportForm.m");
                } else {
                    return "1" + vRoot.$t("reportForm.m");
                }

            }
        }
    },
    loginResult: function(me, resp, isService) {

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
                    localStorage.setItem("accountuser", me.username);
                    localStorage.setItem("accountpass", me.password);
                } else {
                    localStorage.setItem("deviceuser", me.username);
                    localStorage.setItem("devicepass", me.password);
                }
                localStorage.setItem("keepPass", true);
            } else {
                localStorage.setItem("accountuser", "");
                localStorage.setItem("accountpass", "");
                localStorage.setItem("keepPass", false);
            }
            localStorage.setItem("token", resp.token);
            localStorage.setItem("userType", resp.usertype);
            localStorage.setItem("name", resp.username);
            localStorage.setItem("forcealarm", resp.forcealarm);
            localStorage.setItem("alarmaction", resp.alarmaction);
            localStorage.setItem("intervaltime", resp.intervaltime);
            localStorage.setItem(resp.username + "-multilogin", resp.multilogin);
            // window.location.href = "main.html?token=" + resp.token + "&usertype=" + resp.usertype;
            if (isService) {
                window.location.href = "service.html?token=" + resp.token;
            } else {
                window.location.href = "mainv2.html";
            }

        } else if (resp.status == -1) {
            me.$Message.error(me.$t("login.error_3"));
        } else if (resp.status == 1) {
            me.$Message.error(me.$t("login.error_4"));
        } else if (resp.status == 2) {
            me.$Message.error(me.$t("login.error_5"));
        } else if (resp.status == 3) {
            me.$Message.error(me.$t("login.error_6"));
        } else if (resp.status == 4) {
            me.$Message.error(me.$t("login.error_7"));
        } else if (resp.status == 5) {
            me.$Message.error(me.$t("login.error_8"));
        }
    },
    sendAjax: function(url, data, callback, failCallback) {
        var encode = JSON.stringify(data);
        $.ajax({
            url: url,
            type: 'post',
            data: encode,
            timeout: 30000,
            //contentType: "application/json;charset=utf-8",
            dataType: 'json',
            success: function(resp) {
                if (resp) {
                    if (resp.status > 9000) {
                        try {
                            if (vRoot && vRoot.$t) {
                                vRoot.$Message.error(vRoot.$t("monitor.reLogin"));
                            } else {
                                Vue.prototype.$Message.error('token失效请从新登陆');
                            }
                        } catch (error) {
                            Vue.prototype.$Message.error('token失效请从新登陆');
                        }
                        localStorage.setItem('token', "")
                        setTimeout(function() {
                            window.location.href = 'index.html'
                        }, 2000);
                    } else {
                        callback(resp);
                    }
                } else {
                    console.log('sendAjax - resp - null', url);
                }
            },
            error: function(e) {
                try {
                    vRoot.loading = false;
                    isRequsetPlaying && (isRequsetPlaying = false);
                } catch (e) {

                }
                new Vue().$Loading.error();
                failCallback ? failCallback() : null;
            },
            complete: function() {}
        })
    },
    getIsOnline: function(track) {
        var result = false;
        var updatetime = track.updatetime;
        if ((Date.now() - updatetime) < 60 * 10 * 1000) {
            result = true;
        }
        return result;
    },
    getIsOnlineWithTime: function(track, currentTime) {
        var result = false;
        var updatetime = track.updatetime;
        if ((currentTime - updatetime) < 60 * 10 * 1000) {
            result = true;
        }
        return result;
    },
    getBaiduAddressFromBaidu: function(offsetlon, offsetlat, callback) {

        var point = new BMap.Point(offsetlon, offsetlat);
        var geoc = new BMap.Geocoder();
        geoc.getLocation(point, function(rs) {

            if (rs) {
                var addComp = rs.addressComponents;
                var surroundingPois = rs.surroundingPois;
                var finaladdress =
                    addComp.province +
                    addComp.city +
                    addComp.district +
                    addComp.street +
                    addComp.streetNumber;
                var buildingAddress = "";
                if (surroundingPois && surroundingPois.length > 0) {
                    //get max 3 size
                    var realSize = Math.min(3, surroundingPois.length);
                    for (var i = 0; i < realSize; ++i) {
                        var singleAddress = surroundingPois[i].title;
                        buildingAddress += singleAddress;
                        if (i < realSize - 1) {
                            buildingAddress += ",";
                        }
                    }
                };
                if (buildingAddress.length > 0) {
                    finaladdress += ";" + buildingAddress;
                }
                if (callback) {
                    callback(finaladdress);
                }
            }
        });
    },
    getJiuHuAddressSyn: function(lon, lat, callback) {
        $.ajax({
            type: 'get',
            //contentType: "application/json;charset=utf-8",
            url: 'https://www.gps51.com/webapi?action=w&lat=' + lat + '&lon=' + lon + '&token=' + token,
            success: function(data) {
                if (data) {
                    (data.address != "") && callback(data)
                }
            }
        })
    },
    longToBits: function(iLong, len) {
        var temp = iLong;
        var result = new Array(len);
        for (var i = 0; i < len; i++) {
            result[len - 1 - i] = (temp % 2 == 1);
            // result[i] = (temp % 2 == 1);
            //temp = temp >> 1;
            temp = parseInt(temp / 2);
        }
        return result;
    },
    bitsToULong: function(bits) {
        var result = 0;
        for (var i = 0; i < bits.length; i++) {
            if (bits[i]) {
                //result = result + pow2 ;//(int) java.lang.Math.pow(2, (bits.length - i - 1));
                result += Math.pow(2, (bits.length - i - 1));
            }
            //pow2 = pow2 * 2;
        }
        return result;
    },
    getAbroadAddressSyn: function(lon, lat, callback) {
        $.ajax({
            type: 'get',
            //contentType: "application/json;charset=utf-8",
            url: 'https://www.gps51.com/reverse?format=json&lat=' + lat + '&lon=' + lon + '&addressdetails=0',
            success: function(data) {
                callback && callback(data.display_name);
            }
        })
    },
    getGoogleAddressSyn: function(lat, lon, callback) {
        var request = {
            location: new google.maps.LatLng({ lat: lat, lng: lon })
        }
        var geocoder = new google.maps.Geocoder();
        geocoder.geocode(request, function(resp) {
            if (resp && resp.length) {
                var address = resp[0].formatted_address;
                callback(address);
            }
        })
    },
    getParameterByName: function(name) {
        var resulturl = null;
        var allurl = location.search;
        var theRequest = new Object();
        if (allurl.indexOf('?') != -1) {
            var str = allurl.substr(1)
            var strs = str.split('&')
            for (var i = 0; i < strs.length; i++) {
                var value = strs[i].split('=')[1];
                theRequest[strs[i].split('=')[0]] = value;
            }
        }
        resulturl = theRequest[name];
        resulturl = decodeURIComponent(resulturl);
        return resulturl;
    },
    getCarDirection: function(course) {
        var direction = null
        if ((course <= 22.5 && course >= 0) || (course >= 337.5)) {
            direction = isZh ? '正北' : 'Due north';
        } else if (course <= 112.5 && course >= 67.5) {
            direction = isZh ? '正东' : 'Due east';
        } else if (course <= 202.5 && course >= 157.5) {
            direction = isZh ? '正南' : 'Due south';
        } else if (course <= 292.5 && course >= 247.5) {
            direction = isZh ? '正西' : 'due west';
        } else if (course > 22.5 && course < 67.5) {
            direction = isZh ? '东北' : 'Northeast';
        } else if (course > 112.5 && course < 157.5) {
            direction = isZh ? '东南' : 'Southeast';
        } else if (course > 202.5 && course < 247.5) {
            direction = isZh ? '西南' : 'Southwest';
        } else if (course > 292.5 && course < 337.5) {
            direction = isZh ? '西北' : 'Northwest';
        }
        return direction + "(" + course + "°)";
    },
    getAngle: function(course) {
        var angle = null
        if (course == 0) {
            angle = 0
        } else if (course > 0 && course <= 45) {
            angle = 45
        } else if (course > 45 && course <= 90) {
            angle = 90
        } else if (course > 90 && course <= 135) {
            angle = 135
        } else if (course > 135 && course <= 180) {
            angle = 180
        } else if (course > 180 && course <= 225) {
            angle = 225
        } else if (course > 225 && course <= 270) {
            angle = 270
        } else if (course > 270 && course <= 315) {
            angle = 315
        } else if (course > 315 && course <= 360) {
            angle = 0
        }
        return angle
    },
    playTextVoice: function(text) {
        isPlayAlarmVoice = true;
        var zhText = text;
        zhText = encodeURI(zhText);

        var source = document.getElementById('source');
        var embed = document.getElementById('embed');
        source.setAttribute('src', "http://tts.baidu.com/text2audio?lan=zh&ie=UTF-8&spd=3&text=" + zhText);
        embed.setAttribute('src', "http://tts.baidu.com/text2audio?text=" + zhText);

        audio.load();
    },
    getDirectionImage: function(isOnline, angle) {
        var pathname = location.pathname
        var imgPath = ''
        if (utils.isLocalhost()) {
            imgPath = myUrls.viewhost + 'images/carstate'
        } else {
            imgPath = '../images/carstate'
        }
        if (isOnline) {
            imgPath += '/a_green_' + angle + '.png'
        } else {
            imgPath += '/a_gray_' + angle + '.png'
        }
        return imgPath
    },
    changeGroupsDevName: function(changeInfo, groups) {
        var deviceid = changeInfo.deviceid
        var devicename = changeInfo.devicename
        var simnum = changeInfo.simnum

        groups.forEach(function(group) {
            group.devices.forEach(function(device) {
                if (device.deviceid == deviceid) {
                    if (device.devicename != devicename) {
                        var nameArr = device.devicetitle.split(" ");
                        nameArr[0] = devicename;
                        device.devicename = devicename;
                        device.devicetitle = nameArr.join(" ");
                        device.allDeviceIdTitle = device.devicetitle + "-" + deviceid;
                        device.firstLetter = __pinyin.getFirstLetter(devicename)
                        device.pinyin = __pinyin.getPinyin(devicename)
                    }
                    if (simnum) {
                        device.simnum = simnum;
                    }
                }
            })
        })
    },
    parseXML: function(param) {
        var paramsListObj = [];
        var params = "<params>" + param + "</params>";
        var parser = new DOMParser();
        var xmlDoc = parser.parseFromString(params, "text/xml");
        var parent = xmlDoc.children[0];
        var children = parent.children;
        // var childrenControlType = children[0];
        // var controlType = childrenControlType.getAttribute("type");
        //only text list
        // if (children.length > 1) {
        for (var i = 0; i < children.length; i++) {
            var item = children[i];
            var desc = item.innerHTML;
            var type = item.getAttribute("type");
            var value = item.getAttribute("value");
            if (type && desc) {
                paramsListObj.push({ type: type, desc: desc, value: value });
            }
        }
        // }

        return {
            // type: controlType,
            paramsListObj: paramsListObj
        };
    },
    padPreZero: function(value, zeroCount) {
        var newValue = value;
        var oldCount = value.toString().length;
        if (oldCount < zeroCount) {
            var needPadCount = zeroCount - oldCount;
            for (var i = 0; i < needPadCount; i++) {
                newValue = "0" + newValue;
            }
        }
        return newValue;
    },
    getPosiType: function(track) {

        var type = null;
        var gotsrc = track.gotsrc; //cell gps wifi
        switch (gotsrc) {
            case 'un':
                type = isZh ? "未知" : "Unknown";
                break;
            case 'cell':
                type = isZh ? "基站定位" : "LBS";
                break;
            case 'gps':
                type = isZh ? "北斗卫星" : "GPS";
                break;
            case 'wifi':
                type = isZh ? "WiFi定位" : "WiFi";
                break;
            default:
                type = isZh ? "未知" : "Unknown";
        };
        return type;
    },
    videoState: null,
    getTemperature: function(isZh, track) {
        var tempStr = null;
        var temp = track.temp1;
        if (temp != undefined && temp != 0xffff) {
            tempStr = temp / 10 + '℃';
        }

        temp = track.temp2;
        if (temp != undefined && temp != 0xffff) {
            tempStr += "|"
            tempStr += temp / 10 + '℃';
        }

        temp = track.temp3;
        if (temp != undefined && temp != 0xffff) {
            tempStr += "|"
            tempStr += temp / 10 + '℃';
        }

        temp = track.temp4;
        if (temp != undefined && temp != 0xffff) {
            tempStr += "|"
            tempStr += temp / 10 + '℃';
        }

        var humi1 = track.humi1;
        if (humi1 != undefined && humi1 > 0) {
            if (tempStr != null) {
                tempStr += "|";
            }
            tempStr += humi1 / 10 + '%';
        }

        var humi2 = track.humi2;
        if (humi2 != undefined && humi2 > 0) {
            if (tempStr != null) {
                tempStr += "|";
            }
            tempStr += humi2 / 10 + '%';
        }


        if (tempStr != null) {
            tempStr = '<p><span class="window_title">' + (isZh ? '温度湿度</span>: ' : 'Temperature</span>: ') + tempStr + '</p>'
        }
        return tempStr;
    },
    getloadstatusStr: function(loadstatus) {
        var statusStr = '';
        switch (loadstatus) {
            case 0x00:
                statusStr = isZh ? '空车' : 'Empty';
                break;
            case 0x01:
                statusStr = isZh ? '半载' : 'Half';
                break;
            case 0x02:
                statusStr = isZh ? '超载' : 'Over';
                break;
            case 0x03:
                statusStr = isZh ? '满载' : 'Full';
                break;
            case 0x04:
                statusStr = isZh ? '装载' : 'Loadin';
                break;
            case 0x05:
                statusStr = isZh ? '卸载' : 'Unloading';
                break;
        }
        return statusStr;
    },
    getLoadStatus: function(track) {
        var loadstatus = track.loadstatus;
        var weight = track.weight;
        var srcWeightAd0 = track.srcweightad0;
        var statusStr = '';
        switch (loadstatus) {
            case 0x00:
                statusStr = isZh ? '空车' : 'Empty';
                break;
            case 0x01:
                statusStr = isZh ? '半载' : 'Half';
                break;
            case 0x02:
                statusStr = isZh ? '超载' : 'Over';
                break;
            case 0x03:
                statusStr = isZh ? '满载' : 'Full';
                break;
            case 0x04:
                statusStr = isZh ? '装载' : 'Loading';
                break;
            case 0x05:
                statusStr = isZh ? '卸载' : 'Unloading';
                break;
        }

        return statusStr + " " + (weight / 10) + 'Kg(' + srcWeightAd0 + ')';
    },
    getOilStr: function(track) {
        var oilStr = '';
        var srcad0 = track.srcad0;
        var srcad1 = track.srcad1;
        var srcad2 = track.srcad2;
        var srcad3 = track.srcad3;
        //0xffff == none oil
        var totalOil = track.totaloil / 100;
        var masteroil = track.masteroil / 100;
        var auxoil = track.auxoil / 100;
        var thirdoil = track.thirdoil / 100;
        var fourthoil = track.fourthoil / 100;


        if ((totalOil > 0) ||
            (masteroil > 0) ||
            (auxoil > 0) ||
            (thirdoil > 0) ||
            (fourthoil > 0)) {
            var isNotFirst = false;
            oilStr = '<span class="window_title">' + (isZh ? '油液数据' : 'Fuel') + '</span>: ';
            var srcAdStr = "";
            if (totalOil > 0) {
                oilStr += totalOil.toFixed(0) + "LT";
                isNotFirst = true;
            }
            if (masteroil > 0) {
                if (isNotFirst) {
                    isNotFirst = true;
                    oilStr += '/';
                }
                oilStr += masteroil.toFixed(0) + "L1";
            }

            if (auxoil > 0) {
                if (isNotFirst) {
                    isNotFirst = true;
                    oilStr += '/';
                }
                oilStr += auxoil.toFixed(0) + "L2";

            }
            if (thirdoil > 0) {
                if (isNotFirst) {
                    isNotFirst = true;
                    oilStr += '/';
                }
                oilStr += thirdoil.toFixed(0) + "L3";

            }

            if (fourthoil > 0) {
                if (isNotFirst) {
                    isNotFirst = true;
                    oilStr += '/';

                }
                oilStr += fourthoil.toFixed(0) + "L4";

            }
            srcAdStr = srcad0 + '/' + srcad1 + '/' + srcad2 + '/' + srcad3;
            oilStr += '(' + srcAdStr + ")";
        } else if (srcad0 > 0 || srcad1 > 0 || srcad2 > 0 || srcad3 > 0) {
            //没设置油杆的时候显示原始ad值
            oilStr = '<span class="window_title">' + (isZh ? '油液数据' : 'Fuel') + '</span>: ' + 'Ad:' + srcad0 + '/' + srcad1 + '/' + srcad2 + '/' + srcad3;
        };
        return oilStr;
    },
    getDirectiveList: function(type) {
        var allCmdList = vstore.state.allCmdList;
        var directiveList = [];
        allCmdList.forEach(function(cmd) {
            var copyCmd = cmd;
            if (!isZh) {
                copyCmd = deepClone(cmd)
                copyCmd.cmdname = cmd.cmdnameen;
            }
            if (copyCmd.devicetype == type) {
                directiveList.push(copyCmd);
            } else if (copyCmd.common == 1) {
                directiveList.push(copyCmd);
            };
        });

        directiveList.sort(function(a, b) {
            return a.cmdlevel - b.cmdlevel;
        });
        return directiveList;
    },
    parserToRemindJson: function(value) {
        var valueArr = value.split("-"),
            len = valueArr.length,
            remindJson = {};

        remindJson.time = valueArr[0];
        remindJson.switch = valueArr[1] == 1 ? true : false;
        remindJson.type = valueArr[2];
        remindJson.weekselected = [];
        if (len === 4) {
            var weekStr = valueArr[3];
            var week1 = weekStr.charAt(0) == 1 ? '一' : false;
            var week2 = weekStr.charAt(1) == 1 ? '二' : false;
            var week3 = weekStr.charAt(2) == 1 ? '三' : false;
            var week4 = weekStr.charAt(3) == 1 ? '四' : false;
            var week5 = weekStr.charAt(4) == 1 ? '五' : false;
            var week6 = weekStr.charAt(5) == 1 ? '六' : false;
            var week7 = weekStr.charAt(6) == 1 ? '日' : false;

            week1 && remindJson.weekselected.push(week1);
            week2 && remindJson.weekselected.push(week2);
            week3 && remindJson.weekselected.push(week3);
            week4 && remindJson.weekselected.push(week4);
            week5 && remindJson.weekselected.push(week5);
            week6 && remindJson.weekselected.push(week6);
            week7 && remindJson.weekselected.push(week7);
        }
        return remindJson;
    },
    parserToWeekTimeJson: function(value) {
        var valueArr = value.split("-"),
            remindJson = {
                time: valueArr[0],
                weekselected: []
            };
        var weekStr = valueArr[1];
        var week1 = weekStr.charAt(0) == 1 ? '一' : false;
        var week2 = weekStr.charAt(1) == 1 ? '二' : false;
        var week3 = weekStr.charAt(2) == 1 ? '三' : false;
        var week4 = weekStr.charAt(3) == 1 ? '四' : false;
        var week5 = weekStr.charAt(4) == 1 ? '五' : false;
        var week6 = weekStr.charAt(5) == 1 ? '六' : false;
        var week7 = weekStr.charAt(6) == 1 ? '日' : false;

        week1 && remindJson.weekselected.push(week1);
        week2 && remindJson.weekselected.push(week2);
        week3 && remindJson.weekselected.push(week3);
        week4 && remindJson.weekselected.push(week4);
        week5 && remindJson.weekselected.push(week5);
        week6 && remindJson.weekselected.push(week6);
        week7 && remindJson.weekselected.push(week7);

        return remindJson;
    },
    parserToWeekPeriodJson: function(param, value) {
        if (param.type == 'week') {
            var weekselected = [];
            if (value) {
                var weekStr = value;
            } else {
                var weekStr = param.value;
            }
            var week1 = weekStr.charAt(0) == 1 ? '一' : false;
            var week2 = weekStr.charAt(1) == 1 ? '二' : false;
            var week3 = weekStr.charAt(2) == 1 ? '三' : false;
            var week4 = weekStr.charAt(3) == 1 ? '四' : false;
            var week5 = weekStr.charAt(4) == 1 ? '五' : false;
            var week6 = weekStr.charAt(5) == 1 ? '六' : false;
            var week7 = weekStr.charAt(6) == 1 ? '日' : false;

            week1 && weekselected.push(week1);
            week2 && weekselected.push(week2);
            week3 && weekselected.push(week3);
            week4 && weekselected.push(week4);
            week5 && weekselected.push(week5);
            week6 && weekselected.push(week6);
            week7 && weekselected.push(week7);

            return weekselected;
        } else {
            return value ? value.split('-') : param.value.split("-");
        }

    },
    encodeWeekTimeParams: function(paramsObj) {

        var resultArr = [];
        for (var key in paramsObj) {
            var item = paramsObj[key];
            var weekStr = "",
                weekArr = item.weekselected;

            weekArr.indexOf("一") !== -1 ? weekStr += '1' : weekStr += '0';
            weekArr.indexOf("二") !== -1 ? weekStr += '1' : weekStr += '0';
            weekArr.indexOf("三") !== -1 ? weekStr += '1' : weekStr += '0';
            weekArr.indexOf("四") !== -1 ? weekStr += '1' : weekStr += '0';
            weekArr.indexOf("五") !== -1 ? weekStr += '1' : weekStr += '0';
            weekArr.indexOf("六") !== -1 ? weekStr += '1' : weekStr += '0';
            weekArr.indexOf("日") !== -1 ? weekStr += '1' : weekStr += '0';
            resultArr.push(item.time + "-" + weekStr);
        }
        return resultArr;
    },
    encodeWeekPeriodParams: function(paramsObj) {
        var copyParamsObj = deepClone(paramsObj);
        var resultArr = [];
        var weekStr = "",
            weekArr = copyParamsObj.week;

        weekArr.indexOf("一") !== -1 ? weekStr += '1' : weekStr += '0';
        weekArr.indexOf("二") !== -1 ? weekStr += '1' : weekStr += '0';
        weekArr.indexOf("三") !== -1 ? weekStr += '1' : weekStr += '0';
        weekArr.indexOf("四") !== -1 ? weekStr += '1' : weekStr += '0';
        weekArr.indexOf("五") !== -1 ? weekStr += '1' : weekStr += '0';
        weekArr.indexOf("六") !== -1 ? weekStr += '1' : weekStr += '0';
        weekArr.indexOf("日") !== -1 ? weekStr += '1' : weekStr += '0';
        resultArr.push(weekStr);
        delete copyParamsObj.week;

        for (var i = 1; i < 4; i++) {
            var key = 'period' + i;
            resultArr.push(copyParamsObj[key].join('-'));
        }

        return resultArr;
    },
    encodeRemindParams: function(paramsObj) {
        var resultArr = [];
        for (var key in paramsObj) {
            var item = paramsObj[key];
            if (item.type == '3') {
                var weekStr = "",
                    weekArr = item.weekselected;
                weekArr.indexOf("一") !== -1 ? weekStr += '1' : weekStr += '0';
                weekArr.indexOf("二") !== -1 ? weekStr += '1' : weekStr += '0';
                weekArr.indexOf("三") !== -1 ? weekStr += '1' : weekStr += '0';
                weekArr.indexOf("四") !== -1 ? weekStr += '1' : weekStr += '0';
                weekArr.indexOf("五") !== -1 ? weekStr += '1' : weekStr += '0';
                weekArr.indexOf("六") !== -1 ? weekStr += '1' : weekStr += '0';
                weekArr.indexOf("日") !== -1 ? weekStr += '1' : weekStr += '0';
                resultArr.push(item.time + "-" + (item.switch ? '1' : '0') + '-' + item.type + "-" + weekStr)
            } else {
                resultArr.push(item.time + "-" + (item.switch ? '1' : '0') + '-' + item.type);
            };
        }
        return resultArr;
    },
    getWindowContent: function(track, b_address) {
        var strstatus = '';
        var posiType = this.getPosiType(track);
        if (isZh) {
            var stralarm = track.stralarm;
            strstatus = track.strstatus ? track.strstatus : '';
            if (stralarm) {
                strstatus += '<span style="color:red;">' + stralarm + '</span>';
            }
        } else {
            var stralarmen = track.stralarmen;
            strstatus = track.strstatusen ? track.strstatusen : '';
            if (stralarm) {
                strstatus += '<span style="color:red;">' + stralarmen + '</span>';
            }
        }
        if (track.radius > 0) {
            var radiuDesc = null;
            if (isZh) {
                radiuDesc = ' (误差范围:' + track.radius + '米)';
            } else {
                radiuDesc = ' (Error range:' + track.radius + 'm)';
            }
            posiType += radiuDesc;
        };
        if (track.gotsrc === 'gps' && track.gpsvalidnum > 0) {
            posiType += "(" + track.gpsvalidnum + ")";

        };

        var status = track.status; //status&0x04 代表定位有效
        if ((status & 0x04) != 0x04) {
            if (track.gotsrc === 'gps') {
                posiType += " <span style='color:#515A6E; display: inline-block;height:18px;padding:0 2px; background:#FFF9E6;border:1px solid #FFD77A;border-radius: 3px;'>" + vRoot.$t('monitor.notRealtime') + "<span>"
            }
        }

        var oilStr = '';



        if (isZh) {
            var isOnineStr = utils.getIsOnline(track) ? "在线" : "离线" + utils.timeStampNoSecond(Date.now() - track.updatetime);
        } else {
            var isOnineStr = utils.getIsOnline(track) ? "Online" : "Offline" + utils.timeStampNoSecond(Date.now() - track.updatetime);
        };
        var speed = track.speed <= 0 ? "0km/h" : (track.speed / 1000).toFixed(2) + "km/h";
        var rxlevel = track.rxlevel === 0 ? '' : ('(' + (isZh ? '信号' : 'Signal') + ':' + track.rxlevel + '%)');
        var deviceid = "'" + track.deviceid + "'";
        var extendsBtns = this.getIsAddExtendBtns(),
            extendsStr = '',
            videoState = isZh ? track.strvideoalarm : track.strvideoalarmen;
        this.videoState = videoState;


        var loadstatusStr = null;
        if (track.loadstatus >= 0) {
            loadstatusStr = this.getLoadStatus(track);
        }

        if (extendsBtns.oil) {
            oilStr = this.getOilStr(track);
        }

        var temp = this.getTemperature(isZh, track);
        var device = findTheDevice(track.deviceid);
        var currentDayMileage = track.currentDayMileage ? track.currentDayMileage : '- ';
        var altitude = track.altitude !== null ? ('(H:' + track.altitude.toFixed(0) + ')') : '';
        var content =
            '<p><span class="window_title">' + (isZh ? '设备名称' : 'Device Name') + '</span>: ' + (track.devicename ? track.devicename : track.deviceid) + '<i onclick="copyToClipboardText()" class="ivu-icon ivu-icon-ios-copy-outline" style="font-size: 20px;cursor: pointer;margin-top:-2px"></i><i id="stared" onclick="onStarDevice(' + track.deviceid + ')" class="ivu-icon ivu-icon-md-heart" style="font-size: 16px;cursor: pointer;float:right;margin-right:22px;color:' + ((device && device.stared == 1) ? '#e4393c' : '#c1c1c1') + ';"></i></p>' +
            '<p><span class="window_title">' + (isZh ? '设备序号' : 'Device ID') + '</span>: ' + track.deviceid + '<i onclick="copyToClipboard()" class="ivu-icon ivu-icon-ios-copy-outline" style="font-size: 20px;cursor: pointer;margin-top:-2px;"></i></p>' +
            '<p><span class="window_title">' + (isZh ? '定位类型' : 'Position Type') + '</span>: ' + posiType + '</p>' +
            '<p><span class="window_title">' + (isZh ? '经度纬度' : 'Coordinate') + '</span>: ' + track.callon.toFixed(6) + ',' + track.callat.toFixed(6) + altitude + '</p>' +
            '<p><span class="window_title">' + (isZh ? '更新时间' : 'Update time') + '</span>: ' + DateFormat.longToDateTimeStr(track.updatetime, timeDifference) + '(' + isOnineStr + ')</p>' +
            '<p><span class="window_title">' + (isZh ? '定位时间' : 'Locate Time') + '</span>: ' + DateFormat.longToDateTimeStr(track.validpoistiontime, timeDifference) + '</p>' +
            '<p><span class="window_title">' + (isZh ? '实时速度' : 'Speed') + '</span>: ' + speed + rxlevel + '</p>' +
            '<p><span class="window_title">' + (isZh ? '当日里程' : 'Today Mileage') + '</span>: ' + currentDayMileage + (isZh ? ' 总里程数: ' : ' Total Mileage: ') + this.getMileage(track.totaldistance) + '</p>' +
            (temp && extendsBtns.humi ? temp : '') +
            '<p><span class="window_title">' + (isZh ? '停留时长' : 'Parking Period') + '</span>: ' + this.timeStamp(track.parkduration, isZh) + '</p>' +
            '<p><span class="window_title">' + (isZh ? '设备状态' : 'Device Status') + '</span>: ' + strstatus + '</p>' +
            (oilStr !== '' ? '<p>' + oilStr + '</p>' : '') +
            (loadstatusStr ? ('<p><span class="window_title">' + (isZh ? '载重数据' : 'Weight') + '</span>: ' + loadstatusStr + '</p>') : '') +
            (extendsBtns.video ? ('<p><span class="window_title">' + (isZh ? '视频状态' : 'Video') + '</span>: ' + videoState + '</p>') : ("")) +
            '<p class="last-address">' + b_address + '</p>' +
            '<p class="operation">' +
            '<span class="map-window-btn" onclick="playBack(' +
            deviceid +
            ')">' + (isZh ? '轨迹' : 'History') + '</span>' +
            '<span class="map-window-btn" onclick="trackMap(' +
            deviceid +
            ')">' + (isZh ? '跟踪' : 'Follow') + '</span><span class="map-window-btn" onclick="refreshPostion(' +
            deviceid +
            ')">' + (isZh ? '刷新位置' : 'Refresh Loc.') + '</span><span class="map-window-btn" onclick="openSim(' +
            deviceid +
            ')">SIM</span><span class="map-window-btn" onclick="setFence(' +
            deviceid +
            ')">' + (isZh ? '设置围栏' : 'Set Fence') + '</span>';

        // <span class="map-window-btn" onclick="setPanorama(' +deviceid + ')">' + (isZh ? '查看街景' : 'Panorama') + '</span>

        if (extendsBtns.video) {
            var devicename = "'" + track.devicename + "'";
            var activeSafety = extendsBtns.activesafety ? 1 : 0;
            // devicename = encodeURIComponent(devicename);
            extendsStr += '<span class="map-window-btn" onclick="openVdeio(' + deviceid + ',' + devicename + ',' + activeSafety + ')">' + vRoot.$t('monitor.video') + '</span>'
        };
        if (extendsBtns.camera) {
            var devicename = "'" + track.devicename + "'";
            extendsStr += '<span class="map-window-btn" onclick="openCamera(' + deviceid + ',' + devicename + ',' + activeSafety + ')">' + vRoot.$t('monitor.camera') + '</span>'
        };



        if (extendsBtns.activesafety) {
            var devicename = "'" + track.devicename + "'";
            devicename = encodeURIComponent(devicename);
            extendsStr += '<span class="map-window-btn" onclick="openActiveSafety(' + deviceid + ',' + devicename + ')">' + vRoot.$t('monitor.activeSafety') + '</span>'
        };

        if (extendsBtns.audio) {
            extendsStr += '<span class="map-window-btn" onclick="openAudio(' + deviceid + ')">' + vRoot.$t('monitor.media') + '</span>'
        };
        if (extendsBtns.bms) {
            extendsStr += '<span class="map-window-btn" onclick="openBms(' + deviceid + ')">BMS</span>'
        };
        if (extendsBtns.obd) {
            extendsStr += '<span class="map-window-btn" onclick="openObd(' + deviceid + ')">OBD</span>'
        };
        if (extendsBtns.weight) {
            extendsStr += '<span class="map-window-btn" onclick="openWeight(' + deviceid + ')">' + vRoot.$t('monitor.weigh') + '</span>'
        };
        if (extendsBtns.watermeter) {
            extendsStr += '<span class="map-window-btn" onclick="openWatermeter(' + deviceid + ')">' + vRoot.$t('monitor.watermeter') + '</span>'
        };
        if (extendsStr.length) {
            content += extendsStr + '</p>';
        }
        return content;
    },
    getAccSwitchStatusStr: function(track) {
        var result = false;
        if (track) {
            var statusLong = track['status'];
            //byte acc = 0;                   //0 0：未启用Acc 2:ACC 关；3： ACC 开
            var accByte = statusLong & 0x03;
            if (accByte == 0x03) {
                result = true;
            }
        }
        if (isZh) {
            return result ? "ACC 开" : "ACC关";
        } else {
            return result ? "ACC Open" : "ACC Close";
        }
    },
    getIsAddExtendBtns: function() {
        var deviceTypes = vRoot.$children[1].deviceTypes;
        var currentDeviceType = vRoot.$children[1].currentDeviceType;

        var isShowRecordBtn = false;
        var isShowBmsBtn = false;
        var isShowObdBtn = false;
        var isShowWatermeterBtn = false;
        var isShowVideoBtn = false;
        var isShowActiveSafetyBtn = false;
        var isShowCamera = false;
        var isShowHumi = false;
        var isShowoilDectector = false;

        var functionslong = deviceTypes[currentDeviceType].functionslong;
        if (utils.hasFunction(functionslong, recordSoundMask)) {
            isShowRecordBtn = true;
        };
        if (utils.hasFunction(functionslong, tempHumiMask)) {
            isShowHumi = true;
        };
        if (utils.hasFunction(functionslong, obdMask)) {
            isShowObdBtn = true;
        };
        if (utils.hasFunction(functionslong, oilDectectorMask)) {
            isShowoilDectector = true;
        };
        if (utils.hasFunction(functionslong, videoMask)) {
            isShowVideoBtn = true;
        };
        if (utils.hasFunction(functionslong, activeSafetyMask)) {
            isShowActiveSafetyBtn = true;
        };
        if (utils.hasFunction(functionslong, snapShotMask)) {
            isShowCamera = true;
        };



        return {
            audio: isShowRecordBtn,
            bms: isShowBmsBtn,
            obd: isShowObdBtn,
            watermeter: isShowWatermeterBtn,
            video: isShowVideoBtn,
            activesafety: isShowActiveSafetyBtn,
            camera: isShowCamera,
            humi: isShowHumi,
            oil: isShowoilDectector,
        }
    },
    getMileage: function(totaldistance) {
        if (totaldistance == 0) {
            return totaldistance + 'Km';
        };
        return Number((totaldistance * 1.0 / 1000).toFixed(2)) + 'Km';
    },
    getI18n: function() {
        return new VueI18n({
            locale: this.locale || messages.defaultLang,
            messages: messages
        });
    },
    queryAddress: function(info, callback) {

        utils.getJiuHuAddressSyn(info.callon, info.callat, function(resp) {
            var j_address = resp.address;
            j_address && callback(j_address);
        });

    },

    initWindowMap: function(elId) {

        var map = new maptalks.Map(elId, {
            center: [106, 36.11],
            zoom: 5,
            minZoom: 4,
            maxZoom: 19,
            scaleControl: true,
            dragRotate: false,
            dragPitch: false,
        });

        var newMapType = this.getMapType();
        if (newMapType == 'bMap') {
            map.setSpatialReference({
                projection: 'baidu'
            });
            var layer = new maptalks.TileLayer('base', baiduNormaBaseOption)
            map.setBaseLayer(layer);

        } else if (newMapType == 'gMap') {

            var layer = new maptalks.TileLayer('base', googleNormaBaseOption)
            map.setSpatialReference({})
            map.setBaseLayer(layer);

        } else if (newMapType == 'aMap') {
            var layer = new maptalks.TileLayer('base', aliNormaBaseOption)
            map.setSpatialReference({})
            map.setBaseLayer(layer);

        } else if (newMapType == 'gChinaMap') {
            var layer = new maptalks.TileLayer('base', googleChinaNormaBaseOption)
            map.setSpatialReference({})
            map.setBaseLayer(layer);
        }

        var customPosition = new maptalks.control.Zoom({
            'position': {
                'bottom': '20',
                'right': '20'
            },
            'slider': false,
            'zoomLevel': false
        });
        map.addControl(customPosition);


        return map;
    },
    showWindowMap: function(vueInstanse, params) {
        vueInstanse.mapModal = true;
        var row = params.row;
        var isBMap = utils.getMapType() == 'bMap';
        var pointArr = [];
        if (isBMap) {
            pointArr = wgs84tobd09(Number(row.callon), Number(row.callat));
        } else {
            pointArr = wgs84togcj02(Number(row.callon), Number(row.callat));
        }

        if (vueInstanse.markerLayer != null) {
            vueInstanse.mapInstance.removeLayer(vueInstanse.markerLayer);
        }

        var marker = new maptalks.Marker(
            pointArr, {
                symbol: {
                    'markerFile': './images/carstate/0_green_0.png',
                    'markerWidth': 30,
                    'markerHeight': 30,
                    'markerRotation': -row.course,
                    'markerDy': 15,
                    'markerDx': 0,
                },
            }
        );

        vueInstanse.markerLayer = new maptalks.VectorLayer('marker', [marker]);
        vueInstanse.markerLayer.addTo(vueInstanse.mapInstance);

        vueInstanse.mapInstance.setZoom(18)
        vueInstanse.mapInstance.setCenter({
            x: pointArr[0],
            y: pointArr[1],
        })
    },
    markersAndLineLayerToMap: function(vueInstanse, tracks) {
        if (vueInstanse.markerLayer != null) {
            vueInstanse.mapInstance.removeLayer(vueInstanse.markerLayer);
        }

        var isBMap = utils.getMapType();
        tracks.forEach(function(track) {
            if (isBMap) {
                var g_lon_lat = wgs84togcj02(track.callon, track.callat);
                track.point = {
                    y: g_lon_lat[1],
                    x: g_lon_lat[0]
                };
            } else {
                var lng_lat = wgs84tobd09(track.callon, track.callat);
                track.point = {
                    y: lng_lat[1],
                    x: lng_lat[0]
                };
            }
        })

        var sTrack = tracks[0];

        var smarker = new maptalks.Marker(
            [sTrack.point.x, sTrack.point.y], {
                symbol: {
                    'markerFile': './images/icon_st.png',
                    'markerWidth': 30,
                    'markerHeight': 30,
                    'markerRotation': 0,
                    'markerDy': 0,
                    'markerDx': 0,
                },
                zIndex: 999
            }
        );
        var eTrack = tracks[tracks.length - 1];
        var emarker = new maptalks.Marker(
            [eTrack.point.x, eTrack.point.y], {
                symbol: {
                    'markerFile': './images/icon_en.png',
                    'markerWidth': 30,
                    'markerHeight': 30,
                    'markerRotation': 0,
                    'markerDy': 0,
                    'markerDx': 0,
                },
                zIndex: 999
            }
        );

        var points = [];

        tracks.forEach(function(track) {
            points.push(track.point);
        })

        var lineString = new maptalks.LineString(
            points, {
                symbol: {
                    'lineColor': {
                        'type': 'linear',
                        'colorStops': [
                            [0.00, 'red'],
                            [1.00, 'red']
                        ]
                    },
                    'lineWidth': 4
                }
            })

        vueInstanse.markerLayer = new maptalks.VectorLayer('marker', [smarker, emarker, lineString]);
        vueInstanse.markerLayer.addTo(vueInstanse.mapInstance);

        vueInstanse.mapInstance.setCenter(sTrack.point);
        vueInstanse.mapInstance.setZoom(17);

    },

    getPinyin: function(groupslist) {
        var me = this;
        groupslist.forEach(function(group) {
            group.firstLetter = __pinyin.getFirstLetter(group.groupname);
            group.pinyin = __pinyin.getPinyin(group.groupname);
            group.devices.forEach(function(device) {
                var typeName = me.getDeviceTypeName(device.devicetype)
                device.firstLetter = __pinyin.getFirstLetter(device.devicename);
                device.pinyin = __pinyin.getPinyin(device.devicename);
                device.title = typeName + "-" + device.devicename + "-" + device.deviceid;
            })
        });
        return groupslist;
    },
    getDeviceTypeName: function(deviceTypeId) {
        var typeName = "";
        var deviceTypes = vstore.state.deviceTypes;
        var item = deviceTypes[deviceTypeId];
        typeName = item.typename;
        return typeName;
    },
    getUserInfoList: function(callback) {
        var url = myUrls.querySubUserNameList();
        utils.sendAjax(url, { username: userName }, function(resp) {
            if (resp.status == 0) {
                if (resp.usernames) {
                    resp.usernames.sort(function(a, b) {
                        return a.localeCompare(b);
                    });
                    globalUserList = resp.usernames;
                }
            }
            globalUserList.push(userName);
            callback && callback(globalUserList);
        });
    },
    debounce: function(func, wait, immediate) {
        var timeout, args, context, timestamp, result;
        var later = function() {
            var last = Date.now() - timestamp;
            if (last < wait && last >= 0) {
                timeout = setTimeout(later, wait - last);
            } else {
                timeout = null;

                if (!immediate) {
                    result = func.apply(context, args);
                    if (!timeout)
                        context = args = null;
                }
            }
        };
        return function() {
            context = this;
            args = arguments;
            timestamp = Date.now();
            var callNow = immediate && !timeout;

            if (!timeout)
                timeout = setTimeout(later, wait);

            if (callNow) {
                result = func.apply(context, args);
                context = args = null;
            }
            return result;
        };
    },
    isLocalhost: function() {
        return location.hostname.indexOf('localhost') != -1 || location.hostname.indexOf('127.0.0.1') != -1;
    },
    getGroupName: function(groupslist, deviceid) {
        var groupName = '';
        for (var i = 0; i < groupslist.length; i++) {
            var group = groupslist[i];
            for (var j = 0; j < group.devices.length; j++) {
                var device = group.devices[j];

                if (device.deviceid === deviceid) {
                    if (group.groupname.indexOf('-') == -1) {
                        groupName = group.groupname;
                    } else {
                        groupName = group.groupname.split('-')[1];
                    }
                    break;
                }
                if (groupName != '') { break };
            }
        }
        return groupName;
    },
    getIsVideoDevice: function(deviceType) {
        var isVedio = false;
        var functions = vstore.state.deviceTypes[deviceType].functions;
        if (functions && functions.indexOf('video') != -1) {
            isVedio = true;
        }
        return isVedio;
    },
    getzTreeDeviceIcon: function(device) {
        var url = myUrls.viewhost;
        var deviceLastPositions = vstore.state.deviceLastPositions;
        var track = deviceLastPositions[device.deviceid];
        var isOnline = false;
        if (track) {
            isOnline = this.getIsOnline(track)
        }
        var isVedio = this.getIsVideoDevice(device.devicetype);
        if (isVedio) {
            if (isOnline) {
                url += "zTreeStyle/img/diy/video.svg";
            } else {
                url += "zTreeStyle/img/diy/video_offline.svg";
            }
        } else {
            if (isOnline) {
                url += "zTreeStyle/img/diy/car.svg";
            } else {
                url += "zTreeStyle/img/diy/car_offline.svg";
            }
        }
        return url;
    },
    getDeviceListGroups: function(groups, username) {

        var groupsList = [],
            me = this;
        if (groups != null) {
            for (var i = 0; i < groups.length; ++i) {
                var group = groups[i];
                var groupObj = {
                    name: (group.devices && group.devices.length != 0) ? group.groupname + '(' + group.devices.length + ')' : group.groupname + '(0)',
                    groupid: group.groupid,
                    username: username,
                    groupname: group.groupname,
                    totalCount: group.devices.length,
                    icon: myUrls.viewhost + "zTreeStyle/img/diy/group.svg"
                }
                if (group.devices) {
                    groupObj.children = [];
                    group.devices.forEach(function(device) {
                        groupObj.children.push({
                            username: username,
                            deviceid: device.deviceid,
                            name: device.devicename,
                            icon: me.getzTreeDeviceIcon(device)
                        });
                        utils.deviceInfos[device.deviceid] = {
                            deviceid: device.deviceid,
                            devicename: device.devicename,
                            username: username,
                            groupid: group.groupid,
                            groupname: group.groupname,
                        }
                    });
                }
                groupsList.push(groupObj);
            }
        }

        if (groupsList.length == 0) {
            groupsList.push({
                name: 'Default(0)',
                groupid: 0,
                username: username,
                totalCount: 0,
                icon: myUrls.viewhost + "zTreeStyle/img/diy/group.svg"
            });
        }
        return groupsList;

    },
    doCastUsersTreeToDevicesTree: function(usersTrees) {

        var devicesTreeRecord = [];
        if (usersTrees != null && usersTrees.length > 0) {
            for (var i = 0; i < usersTrees.length; ++i) {
                var usersTree = usersTrees[i];
                var username = usersTree.username;
                var subusers = usersTree.subusers;
                var currentsubDevicesTreeRecord = {
                    username: username,
                    icon: myUrls.viewhost + "zTreeStyle/img/diy/account.svg"
                };
                var deviceListGroups = this.getDeviceListGroups(usersTree.groups, username);
                if (username != null && subusers != null && subusers.length > 0) {
                    var subDevicesTreeRecord = this.doCastUsersTreeToDevicesTree(subusers);
                    subDevicesTreeRecord = deviceListGroups.concat(subDevicesTreeRecord);
                    currentsubDevicesTreeRecord.children = subDevicesTreeRecord;
                } else {
                    currentsubDevicesTreeRecord.children = deviceListGroups;

                }
                var totalCount = 0;
                if (currentsubDevicesTreeRecord.children) {
                    for (var j = 0; j < currentsubDevicesTreeRecord.children.length; ++j) {
                        totalCount += currentsubDevicesTreeRecord.children[j].totalCount;
                    }
                }
                currentsubDevicesTreeRecord.totalCount = totalCount;
                currentsubDevicesTreeRecord.name = username + "(" + totalCount + ")";
                devicesTreeRecord.push(currentsubDevicesTreeRecord);
            }
        }
        return devicesTreeRecord;
    },
    castUsersTreeToDevicesTree: function(devicesTreeRecord) {
        var iViewTree = {
            open: true,
            deviceid: null,
            icon: myUrls.viewhost + "zTreeStyle/img/diy/1_close.png"
        };
        if (devicesTreeRecord != null) {
            var username = devicesTreeRecord.username;
            var subusers = devicesTreeRecord.subusers;
            var deviceListGroups = this.getDeviceListGroups(devicesTreeRecord.groups, username);
            if (username != null && subusers != null && subusers.length > 0) {

                var subDevicesTreeRecord = this.doCastUsersTreeToDevicesTree(subusers);

                iViewTree.children = deviceListGroups.concat(subDevicesTreeRecord);

            } else {
                iViewTree.children = deviceListGroups;
            }
            var totalCount = 0;
            if (iViewTree.children) {
                for (var i = 0; i < iViewTree.children.length; ++i) {
                    totalCount += iViewTree.children[i].totalCount;
                }
            }
            iViewTree.name = username + "(" + totalCount + ")";
        }
        return iViewTree;
    },
    queryDeviceex: function(deviceid, callback) {
        var url = myUrls.queryDeviceex();
        var data = {
            deviceid: deviceid
        };
        utils.sendAjax(url, data, function(respData) {
            callback && callback(respData.deviceex);
        });
    },
    editDeviceex: function(action, data, callback) {
        var url = myUrls.editDeviceex();
        data = deepClone(data);
        data.gender = Number(data.gender);
        utils.sendAjax(url, {
            action: action,
            deviceex: data
        }, function(respData) {
            callback && callback(respData);
        });
    },
    pointInPolygon: function(lat, lon, polylatList, polylonList) {
        var polySides = polylatList.length;
        var i, j = polySides - 1;
        var oddNodes = false;
        for (i = 0; i < polySides; i++) {
            if ((polylatList[i] < lat && polylatList[j] >= lat ||
                    polylatList[j] < lat && polylatList[i] >= lat) &&
                (polylonList[i] <= lon || polylonList[j] <= lon)) {
                if (polylonList[i] + (lat - polylatList[i]) / (polylatList[j] - polylatList[i]) * (polylonList[j] - polylonList[i]) < lon) {
                    oddNodes = !oddNodes;
                }
            }
            j = i;
        }
        return oddNodes;
    },
    setCurrentDeviceid: function(deviceid) {
        this.sendAjax(myUrls.setCurrentDeviceid(), { deviceid: deviceid }, function() {});
    },
    hasFunction: function(functionsLong, mask) {
        var result = false;
        result = (functionsLong & mask) == mask;
        return result;
    },
    calMarkPoint: function(tracks, oilDeviceRecords) {
        var markPoints = [];
        if (oilDeviceRecords && oilDeviceRecords.length > 0) {
            var oilRecords = oilDeviceRecords[0].addorleakrecords || oilDeviceRecords[0].records;

            if (oilRecords && oilRecords.length > 0) {
                for (var i = 0; i < oilRecords.length; ++i) {
                    var oilRecord = oilRecords[i];
                    var oilEndTime = oilRecord.endtime;
                    var nearestTrack = this.findNearestTracksByTime(tracks, oilEndTime);
                    if (nearestTrack) {
                        var oil = nearestTrack.totalad;
                        var difference = (oilRecord.eoil - oilRecord.soil);
                        var color = '';
                        if (difference > 0) {
                            color = 'green';
                        } else {
                            color = 'red';
                        }

                        var markPoint = {
                            coord: [nearestTrack.index, oil], // 其中 5 表示 xAxis.data[5]，即 '33' 这个元素。
                            value: Math.abs(difference).toFixed(0),
                            itemStyle: {
                                color: color
                            },
                            label: {
                                fontSize: 8,
                            }
                        };
                        markPoints.push(markPoint);
                    }
                }
            }
        }
        return markPoints;
    },
    findNearestTracksByTime(tracks, needFoundTime) {
        var nearestTrack = null;
        if (tracks) {
            var detalTime = 24 * 3600 * 1000;
            for (var i = 0; i < tracks.length; ++i) {
                var tempTrack = tracks[i];
                var trackUpdateTime = tempTrack.updatetime;
                var tempDetal = trackUpdateTime - needFoundTime;
                var absTempDetal = Math.abs(tempDetal);
                if (absTempDetal < detalTime) {
                    if (tempDetal < 0) {
                        detalTime = absTempDetal;
                        nearestTrack = tempTrack;
                        nearestTrack.index = i;
                    } else if (tempDetal == 0) {
                        nearestTrack = tempTrack;
                        nearestTrack.index = i;
                        break;
                    } else if (tempDetal > 0) {
                        nearestTrack = tempTrack;
                        nearestTrack.index = i;
                        break;
                    }
                }
            }
        }

        return nearestTrack;
    },
};

var timeDifference = DateFormat.getOffset();
try {
    //自定义 vue指令
    vClickOutside.install(Vue);
} catch (error) {}

function findTheDevice(deviceid) {
    var deviceObj = null;
    vRoot.$children[1].groups.forEach(function(group) {
        group.devices.forEach(function(device) {
            if (device.deviceid == deviceid) {
                deviceObj = device;
            }
        });
    });
    return deviceObj;
}


function onStarDevice(deviceid) {
    var deviceObj = findTheDevice(deviceid);
    if (deviceObj) {
        var url = myUrls.starDevice();
        var data = {
            deviceid: deviceid,
            stared: deviceObj.stared == 0 ? 1 : 0,
        }
        utils.sendAjax(url, data, function(resp) {
            if (resp.status == 0) {
                deviceObj.stared = data.stared;
                var staredDevCount = vRoot.$children[1].staredDevCount;
                if (data.stared == 0) {
                    $('#stared').css({ color: '#C1C1C1' });
                    vRoot.$children[1].staredDevCount = staredDevCount - 1;
                } else {
                    $('#stared').css({ color: '#e4393c' })
                    vRoot.$children[1].staredDevCount = staredDevCount + 1;
                }
            } else {
                vRoot.$t(isZh ? '关注失败' : 'Focus on failure');
            }
        })
    }
}


function copyToClipboardText() {
    var text = globalDeviceName;
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
}

function copyToClipboard() {
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
}

//  vue组件   配合查询分组表格使用
// Vue.component('expand-row', {
//   template:
//     '<div>' +
//     '<span v-for="(item , index) in devices" style="display:inline-block;margin:5px">' +
//     '<i-button icon="md-phone-portrait" @click="clickMe(item)"> {{item.deviceid}}</i-button>' +
//     '</span>' +
//     '</div>',
//   props: {
//     devices: Array
//   },
//   data: function () {
//     return {}
//   },
//   methods: {
//     clickMe: function (item) {

//     }
//   },
//   mounted: function () { }
// })

// 后台管理
var mixIn = {
    methods: {
        changePage: function(index) {
            var offset = index * 10;
            var start = (index - 1) * 10;
            var me = this;
            this.currentIndex = index;
            if (this.queryParameter != "" || this.isQuery) {
                this.tableData = this.queryTableData.slice(start, offset);
            } else {
                this.tableData = this.recordsList.slice(start, offset);
            }

        },
    },
    watch: {
        queryParameter: function() {
            if (!this.queryParameter) {
                if (this.isQuery !== undefined) {
                    this.isQuery = false;
                }
                this.tableData = this.recordsList.slice(0, 10);
                this.currentIndex = 1;
                this.total = this.recordsList.length;
            }
        }
    },
}



//  得到表格row组建
// var expandRow = Vue.component('expand-row')

// 轨迹回放
function playBack(deviceid) {
    var deviceTypes = vRoot.$children[1].deviceTypes;
    var currentDeviceType = vRoot.$children[1].currentDeviceType;
    var functionslong = deviceTypes[currentDeviceType].functionslong;

    var devicename = getDeviceNameByDeviceid(deviceid);
    window.open('playbackv2.html?deviceid=' + deviceid + '&icon=' + carIconTypes[deviceid] + '&devicename=' + devicename + '&functionslong=' + functionslong + '&token=' + token);
}

// 跟踪
function trackMap(deviceid) {
    var devicename = getDeviceNameByDeviceid(deviceid);
    window.open('trackmap.html?deviceid=' + deviceid + '&devicename=' + devicename + '&icon=' + carIconTypes[deviceid] + '&token=' + token);
}

function getDeviceNameByDeviceid(deviceid) {
    var devicename = '';
    var groups = vRoot.$children[1].groups;
    for (var i = 0; i < groups.length; i++) {
        var isFound = false;
        var devices = groups[i].devices;
        for (var j = 0; j < devices.length; j++) {
            var device = devices[j];
            if (deviceid === device.deviceid) {
                devicename = device.devicename;
                isFound = true;
                break;
            }

        }
        if (isFound) break;
    }
    return devicename;
}


//刷新位置信息
function refreshPostion(deviceid) {
    var url = myUrls.refreshPostion();
    var track = vstore.state.currentDeviceRecord;
    var lon = track.callon.toFixed(5);
    var lat = track.callat.toFixed(5);


    utils.getJiuHuAddressSyn(track.callon, track.callat, function(resp) {
        var j_address = resp.address;
        if (j_address) {
            $("p.last-address").html(j_address);
            LocalCacheMgr.setAddress(lon, lat, j_address);
        };
    });

    utils.sendAjax(url, { deviceid: deviceid }, function(resp) {});
}

// 设置围栏
function setFence(deviceid) {
    var track = vRoot.$children[1].positionLastrecords[deviceid];
    var callat = track.callat;
    var callon = track.callon;
    var course = track.course;
    var devicename = track.devicename;
    var iconType = carIconTypes[deviceid] !== undefined ? carIconTypes[deviceid] : 0;
    var url = myUrls.viewhosts + 'setfencemulti.html?deviceid=' + deviceid + '&token=' + token + '&lat=' + callat + '&lon=' + callon + '&icontype=' + iconType + '&course=' + course + '&devicename=' + devicename;
    window.open(url);
}

function openAudio(deviceid) {
    var url = myUrls.viewhosts + 'record.html?deviceid=' + deviceid + '&token=' + token;
    window.open(url);
}

function openVdeio(deviceid, name, activesafety) {
    vRoot.$children[1].playerVideos();
}

function openCamera() {
    vRoot.$children[1].cameraModal = true;
}




function openActiveSafety(deviceid, name) {

    var mapType = utils.getMapType();
    mapType = mapType ? mapType : 'bMap';
    var url = myUrls.viewhosts + 'activesafety.html?deviceid=' + deviceid + "&maptype=" + mapType + '&token=' + token + '&name=' + name;
    window.open(url);
}

function openObd(deviceid) {
    var url = myUrls.viewhosts + 'obd.html?deviceid=' + deviceid + '&token=' + token;
    window.open(url);
}

function openBms(deviceid) {
    var url = myUrls.viewhosts + 'bmssys.html?deviceid=' + deviceid + '&token=' + token;
    window.open(url);
}

function openWatermeter(deviceid) {
    // var url = 'bmssys.html?deviceid=' + deviceid + '&token=' + token;
    // window.open(url);
}

function openWeight(deviceid) {
    var url = myUrls.viewhosts + 'weighing.html?deviceid=' + deviceid + '&token=' + token;
    window.open(url);
}





// 全景
function setPanorama(deviceid) {
    var monitorIns = vRoot.$children[1];
    if (monitorIns.mapType === 'bMap') {
        var track = monitorIns.positionLastrecords[deviceid];
        var panoramaService = new BMap.PanoramaService();
        panoramaService.getPanoramaByLocation(new BMap.Point(track.b_lon, track.b_lat), function(data) {
            if (data == null) {
                vRoot.$Message.error("该位置暂时没有街景");
                return;
            }
            var myData = data;
            var panorama = monitorIns.$data.map.mapInstance.getPanorama(); //获取实例对象
            panorama.setId(myData.id); //全景ID
            panorama.show(); //显示全景
        });
    } else {
        alert("谷歌地图暂时没开发");
    }
}



// openSim
function openSim(deviceId) {
    var url = myUrls.queryDeviceBaseInfo();
    utils.sendAjax(url, { deviceid: deviceId }, function(resp) {
        var sim = null;
        var type = null;
        var simiccid = resp.simiccid;
        var simimsi = resp.simimsi;
        var simnum = resp.simnum;
        if (simiccid) {
            sim = simiccid;
            type = "simiccid";
        } else if (simimsi) {
            sim = simimsi;
            type = "simimsi";
        } else if (simnum) {
            sim = simnum;
            type = "simnum";
        };
        if (sim) {
            var url = 'sim.html?sim=' + sim + '&type=' + type + '&token=' + token;
            window.open(url);
        } else {
            vRoot.$Message.error(isZh ? "请设置设备手机号" : "Please set the mobile phone number of the device.");
        };
    })

}


(function(win) {
    'use strict';

    function getDataType(data) {
        return Object.prototype.toString.call(data).slice(8, -1);
    }

    function isCyclic(data) {
        var seenObjects = [];

        function detect(data) {
            if (data && getDataType(data) === "Object") {
                if (seenObjects.indexOf(data) !== -1) {
                    return true;
                }
                seenObjects.push(data);
                for (var key in data) {
                    if (data.hasOwnProperty(key) === true && detect(data[key])) {
                        return true;
                    }
                }
            }
            return false;
        }
        return detect(data);
    }

    var deepClone = function(data) {
        if (data === null || data === undefined) {
            return undefined;
        }
        const dataType = getDataType(data);
        if (dataType === "Date") {
            var clonedDate = new Date();
            clonedDate.setTime(data.getTime());

            return clonedDate;
        }
        if (dataType === "Object") {
            if (isCyclic(data) === true) {
                return data;
            }
            var copiedObject = {};
            for (var key in data) {
                copiedObject[key] = deepClone(data[key]);
            }
            return copiedObject;
        }
        if (dataType === "Array") {
            var copiedArray = [];
            for (var i = 0; i < data.length; i++) {
                copiedArray.push(deepClone(data[i]));
            }
            return copiedArray;
        } else {
            return data;
        }
    }
    win.deepClone = deepClone;
})(this);

// var bounds = this.map.getBounds();
//  bounds.containsPoint(point)


var getPath = function() {
    var jsPath = document.currentScript ? document.currentScript.src : function() {
        var js = document.scripts,
            last = js.length - 1,
            src;

        for (var i = last; i > 0; i--) {
            if (js[i].readyState === 'interactive') {
                src = js[i].src;
                break;
            }
        }
        return src || js[last].src;
    }();

    return jsPath.substring(0, jsPath.lastIndexOf('/') + 1);
}();

// 百度地图是否加载完成 改变全局变量
function loadBMapSucc() {
    isLoadBMap = true;
}

var asyncLoadJs = function(jsName, callback) {
    var node = document.createElement('script'),
        timeout = 1,
        head = document.getElementsByTagName('head')[0],
        urls = {
            baidu: 'https://api.map.baidu.com/api?v=3.0&ak=' + baiduMapKey + '&callback=loadBMapSucc',
            textIconoverlay: getPath + 'texticonoverlay_min.js',
            distancetool: getPath + 'distancetool_min.js',
            // bmarkerclusterer: getPath + "baidumarkercluternew.js",
            bmarkerclusterer: getPath + "markerclusterer.js",

            google: "https://maps.google.com/maps/api/js?v=3.1&sensor=false&language=" + (isZh ? 'cn' : 'en') + "&key=" + googleMapKey + "&cb=loadBMapSucc",
            gmarkerclusterer: getPath + "gmarkerclusterer.js",
            markerwithlabel: getPath + "markerwithlabel.js",
        };

    //加载完毕
    function onScriptLoad(e) {
        var readyRegExp = navigator.platform === 'PLaySTATION 3' ? /^complete$/ : /^(complete|loaded)$/
        if (e.type === 'load' || (readyRegExp.test((e.currentTarget || e.srcElement).readyState))) {

            head.removeChild(node);
            (function poll() {
                if (++timeout > timeout * 1000 / 4) {
                    return console.error(jsName + ' is not a valid module');
                };
                try {
                    callback();
                } catch (error) {
                    setTimeout(poll, 4);
                }

            }());
        }
    }

    node.async = true;
    node.charset = 'utf-8';
    node.src = urls[jsName];

    head.appendChild(node);

    if (node.attachEvent && !(node.attachEvent.toString && node.attachEvent.toString().indexOf('[native code') < 0) && !isOpera) {
        node.attachEvent('onreadystatechange', function(e) {
            onScriptLoad(e);
        });
    } else {
        node.addEventListener('load', function(e) {
            onScriptLoad(e);
        }, false);
    };

};

Array.prototype.delRepeat = function(property) {
    var newArray = new Array();
    var len = this.length;
    for (var i = 0; i < len; i++) {
        for (var j = i + 1; j < len; j++) {
            if (this[i][property] === this[j][property] && this[i].channelid === this[j].channelid) {
                j = ++i;
            }
        }
        newArray.push(this[i]);
    }
    return newArray;
}


function findObjectInOption(name) {
    return function(item) {
        return item.value === name;
    }
}


var editButton = function(vm, h, currentRow, index) {
    return h('Button', {
        props: {
            size: 'small',
            type: currentRow.editting ? 'success' : 'primary',
            // loading: currentRow.saving
        },
        style: {
            margin: '0 5px'
        },
        on: {
            click: function() {

                // 点击按钮时改变当前行的编辑状态,当数据被更新时,render函数会再次执行,详情参考https://cn.vuejs.org/v2/api/#render
                // handleBackdata是用来删除当前行的editting属性与saving属性
                var tempData = vm.handleBackdata(currentRow)

                if (!currentRow.editting) {
                    editObject = currentRow;
                    currentRow.editting = true;
                } else {
                    editObject = null;
                    // 这里也是简单的点击编辑后的数据与原始数据做对比,一致则不做操作,其实更好的应该遍历所有属性并判断
                    if (JSON.stringify(tempData) == JSON.stringify(vm.oilTable[index])) {
                        console.log('未更改');
                        var object = vm.handleBackdata(currentRow);
                        object.saving = false;
                        object.editting = false;
                        vm.$set(vm.oilTable, index, object);
                        return currentRow.editting = false;
                    } else {
                        currentRow.begintime = new Date(tempData.begintime).getTime();
                        currentRow.endtime = new Date(tempData.endtime).getTime();

                        vm.saveData(currentRow, index)
                        currentRow.saving = true;
                    }

                }
            }
        }
    }, currentRow.editting ? (isZh ? '保存' : 'Save') : (isZh ? '编辑' : 'Edit'));
};


//动态添加 删除 按钮
var deleteButton = function(vm, h, currentRow, index) {
    return h('Poptip', {
        props: {
            confirm: true,
            title: vRoot.$t("message.confirmDel")
        },
        style: {
            marginRight: '5px',
        },
        on: {
            'on-ok': function() {
                vm.handleDeleteOilRecord(currentRow, index);
            }
        }
    }, [
        h('Button', {
            props: {
                type: 'error',
                size: 'small'
            }
        }, vRoot.$t("bgMgr.delete"))
    ]);
};

var mapButton = function(vm, h, currentRow, index) {
    return h('Button', {
        props: {
            size: 'small',
            type: 'info',
        },
        style: {},
        on: {
            click: function() {
                vm.queryTracks(currentRow);
            }
        }
    }, isZh ? '轨迹' : 'Track');
};