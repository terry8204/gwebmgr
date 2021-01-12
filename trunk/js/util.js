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
    locale: localStorage.getItem("PATH_LANG") || 'zh',
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
            var lng_lat = gcj02tobd09(point[0], point[1]);
            return [lng_lat[0], lng_lat[1]];
        } else {
            return point;
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
                        if (vRoot.$t) {
                            vRoot.$Message.error(vRoot.$t("monitor.reLogin"));
                        } else {
                            vRoot.$Message.error('token失效请从新登陆');
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
                        device.devicename = devicename;
                        device.devicetitle = device.devicetitle.split("-")[0] + "-" + devicename;
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
    getPosiType: function(track) {

        var type = null;
        var gotsrc = track.gotsrc; //cell gps wifi
        switch (gotsrc) {
            case 'un':
                type = isZh ? "未知" : "Unknown";
                break;
            case 'cell':
                type = isZh ? "基站定位" : "Base station location";
                break;
            case 'gps':
                type = isZh ? "卫星定位" : "Satellite positioning";
                break;
            case 'wifi':
                type = isZh ? "WIFI定位" : "WIFI Location";
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

        if (tempStr != null) {
            tempStr = '<p>' + (isZh ? '温湿度: ' : 'Temperature: ') + tempStr + '</p>'
        }
        return tempStr;
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
        if (track.gotsrc === 'gps' && track.gpsvalidnum) {
            posiType += "(" + track.gpsvalidnum + ")";

        };

        var status = track.status; //status&0x04 代表定位有效
        if ((status & 0x04) != 0x04) {
            if (track.gotsrc === 'gps') {
                posiType += " <span style='color:#515A6E; display: inline-block;height:18px;padding:0 2px; background:#FFF9E6;border:1px solid #FFD77A;border-radius: 3px;'>无效定位<span>"
            }
        }

        if (isZh) {
            var isOnineStr = utils.getIsOnline(track) ? "在线" : "离线" + utils.timeStampNoSecond(Date.now() - track.updatetime);
        } else {
            var isOnineStr = utils.getIsOnline(track) ? "online" : "offline" + utils.timeStampNoSecond(Date.now() - track.updatetime);
        };
        var speed = track.speed <= 0 ? "0km/h" : (track.speed / 1000).toFixed(2) + "km/h";
        var rxlevel = track.rxlevel === 0 ? '' : ('(' + (isZh ? '信号' : 'Signal') + ':' + track.rxlevel + '%)');
        var deviceid = "'" + track.deviceid + "'";
        var extendsBtns = this.getIsAddExtendBtns(),
            extendsStr = '',
            videoState = isZh ? track.strvideoalarm : track.strvideoalarmen;
        this.videoState = videoState;
        var oil = '';
        var srcad0 = track.srcad0;
        var srcad1 = track.srcad1;
        if (track.totaloil > 0 && track.auxoil > 0) {
            if (isZh) {
                oil = '(油液:' + track.totaloil / 100 + 'L@' + srcad0 + '/' + track.auxoil / 100 + 'L@' + srcad1 + ')';
            } else {
                oil = '(oil:' + track.totaloil / 100 + 'L@' + srcad0 + '/' + track.auxoil / 100 + 'L@' + srcad1 + ')';
            }
        } else if (track.totaloil > 0) {
            if (isZh) {
                oil = '(油液:' + track.totaloil / 100 + 'L@' + srcad0 + ')';
            } else {
                oil = '(oil:' + track.totaloil / 100 + 'L@' + srcad0 + ')';
            }
        } else if (track.auxoil > 0) {
            if (isZh) {
                oil = '(油液:' + track.auxoil / 100 + 'L@' + srcad1 + ')';
            } else {
                oil = '(oil:' + track.auxoil / 100 + 'L@' + srcad1 + ')';
            }
        } else if (srcad0 > 0 || srcad1 > 0) {
            //没设置油杆的时候显示原始ad值
            oil = '(ad:' + srcad0 + '/' + srcad1 + ')';
        };

        var temp = this.getTemperature(isZh, track);
        var decice = findTheDevice(track.deviceid)
        var content =
            '<p>' + (isZh ? '设备名称' : 'Device Name') + ': ' + track.devicename + '<i onclick="copyToClipboardText()" class="ivu-icon ivu-icon-ios-copy-outline" style="font-size: 20px;cursor: pointer;margin-top:-2px"></i><i id="stared" onclick="onStarDevice(' + track.deviceid + ')" class="ivu-icon ivu-icon-md-heart" style="font-size: 16px;cursor: pointer;float:right;margin-right:22px;color:' + (decice.stared == 1 ? '#e4393c' : '#c1c1c1') + ';"></i></p>' +
            '<p>' + (isZh ? '设备序号' : 'Device Number') + ': ' + track.deviceid + '<i onclick="copyToClipboard()" class="ivu-icon ivu-icon-ios-copy-outline" style="font-size: 20px;cursor: pointer;margin-top:-2px;"></i></p>' +
            '<p> ' + (isZh ? '定位类型' : 'Position Type') + ': ' + posiType + '</p>' +
            '<p> ' + (isZh ? '经纬度' : 'Longitude and latitude') + ': ' + track.callon.toFixed(6) + ',' + track.callat.toFixed(6) + '</p>' +
            '<p> ' + (isZh ? '更新时间' : 'Update time') + ': ' + DateFormat.longToDateTimeStr(track.updatetime, timeDifference) + '(' + isOnineStr + ')</p>' +
            '<p> ' + (isZh ? '定位时间' : 'Posi time') + ': ' + DateFormat.longToDateTimeStr(track.validpoistiontime, timeDifference) + '</p>' +
            '<p> ' + (isZh ? '速度' : 'Speed') + ': ' + speed + rxlevel + '</p>' +
            '<p> ' + (isZh ? '总里程' : 'Mileage') + ': ' + this.getMileage(track.totaldistance) + oil + '</p>' +
            (temp ? temp : '') +
            '<p> ' + (isZh ? '停留时长' : 'Park Duration') + ': ' + this.timeStamp(track.parkduration, isZh) + '</p>' +
            '<p class="last-strstatus"> ' + (isZh ? '状态' : 'Status') + ': ' + strstatus + '</p>' +
            (extendsBtns.video ? ('<p> ' + (isZh ? '视频' : 'video') + ': ' + videoState + '</p>') : ("")) +
            '<p class="last-address"> ' + (isZh ? '地址' : 'Address') + ': ' + b_address + '</p>' +
            '<p class="operation">' +
            '<span class="ivu-btn ivu-btn-default ivu-btn-small" onclick="playBack(' +
            deviceid +
            ')">' + (isZh ? '轨迹' : 'Track') + '</span>' +
            '<span class="ivu-btn ivu-btn-default ivu-btn-small" onclick="trackMap(' +
            deviceid +
            ')">' + (isZh ? '跟踪' : 'Follow') + '</span><span class="ivu-btn ivu-btn-default ivu-btn-small" onclick="refreshPostion(' +
            deviceid +
            ')">' + (isZh ? '刷新位置' : 'RefreshPosi') + '</span><span class="ivu-btn ivu-btn-default ivu-btn-small" onclick="openSim(' +
            deviceid +
            ')">SIM</span><span class="ivu-btn ivu-btn-default ivu-btn-small" onclick="setFence(' +
            deviceid +
            ')">' + (isZh ? '设置围栏' : 'SetFence') + '</span></p>';

        // <span class="ivu-btn ivu-btn-default ivu-btn-small" onclick="setPanorama(' +deviceid + ')">' + (isZh ? '查看街景' : 'Panorama') + '</span>

        if (extendsBtns.video) {
            var devicename = "'" + track.devicename + "'";
            var activeSafety = extendsBtns.activesafety ? 1 : 0;
            // devicename = encodeURIComponent(devicename);
            extendsStr += '<span class="ivu-btn ivu-btn-default ivu-btn-small" onclick="openVdeio(' + deviceid + ',' + devicename + ',' + activeSafety + ')">' + vRoot.$t('monitor.video') + '</span>'
        };
        if (extendsBtns.camera) {

            var devicename = "'" + track.devicename + "'";
            // devicename = encodeURIComponent(devicename);
            extendsStr += '<span class="ivu-btn ivu-btn-default ivu-btn-small" onclick="openCamera(' + deviceid + ',' + devicename + ',' + activeSafety + ')">' + vRoot.$t('monitor.camera') + '</span>'
        };



        if (extendsBtns.activesafety) {
            var devicename = "'" + track.devicename + "'";
            devicename = encodeURIComponent(devicename);
            extendsStr += '<span class="ivu-btn ivu-btn-default ivu-btn-small" onclick="openActiveSafety(' + deviceid + ',' + devicename + ')">' + vRoot.$t('monitor.activeSafety') + '</span>'
        };

        if (extendsBtns.audio) {
            extendsStr += '<span class="ivu-btn ivu-btn-default ivu-btn-small" onclick="openAudio(' + deviceid + ')">' + vRoot.$t('monitor.media') + '</span>'
        };
        if (extendsBtns.bms) {
            extendsStr += '<span class="ivu-btn ivu-btn-default ivu-btn-small" onclick="openBms(' + deviceid + ')">BMS</span>'
        };
        if (extendsBtns.obd) {
            extendsStr += '<span class="ivu-btn ivu-btn-default ivu-btn-small" onclick="openObd(' + deviceid + ')">OBD</span>'
        };
        if (extendsBtns.weight) {
            extendsStr += '<span class="ivu-btn ivu-btn-default ivu-btn-small" onclick="openWeight(' + deviceid + ')">' + vRoot.$t('monitor.weigh') + '</span>'
        };
        if (extendsBtns.watermeter) {
            extendsStr += '<span class="ivu-btn ivu-btn-default ivu-btn-small" onclick="openWatermeter(' + deviceid + ')">' + vRoot.$t('monitor.watermeter') + '</span>'
        };
        if (extendsStr.length) {
            content += '<p class="operation" style="margin-top:3px;">' + extendsStr + '</p>';
        }
        return content;
    },
    getIsAddExtendBtns: function() {
        var deviceTypes = vRoot.$children[1].deviceTypes;
        var currentDeviceType = vRoot.$children[1].currentDeviceType;

        var result1 = false;
        var result2 = false;
        var result3 = false;
        var result4 = false;
        var result5 = false;
        var result6 = false;
        var result7 = false;
        var result8 = false;


        var functions = deviceTypes[currentDeviceType].functions;

        if (functions) {
            if (functions.indexOf("audio") != -1) {
                result1 = true;
            };
            if (functions.indexOf("bms") != -1) {
                result2 = true;
            };
            if (functions.indexOf("obd") != -1) {
                result3 = true;
            };
            if (functions.indexOf("weight") != -1) {
                result4 = true;
            };
            if (functions.indexOf("watermeter") != -1) {
                result5 = true;
            };
            if (functions.indexOf("video") != -1) {
                result6 = true;
            };
            if (functions.indexOf("activesafety") != -1) {
                result7 = true;
            };
            if (functions.indexOf("camera") != -1) {
                result8 = true;
            };
        };


        return {
            audio: result1,
            bms: result2,
            obd: result3,
            weight: result4,
            watermeter: result5,
            video: result6,
            activesafety: result7,
            camera: result8,
        }
    },
    getMileage: function(totaldistance) {
        if (totaldistance == 0) {
            return totaldistance + 'km';
        };
        return (totaldistance * 1.0 / 1000).toFixed(3) + 'km';
    },
    getI18n: function() {
        return new VueI18n({
            locale: localStorage.getItem("PATH_LANG") || 'zh',
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
        });

        var newMapType = this.getMapType();
        if (newMapType == 'bMap') {
            map.setSpatialReference({
                projection: 'baidu'
            });
            var layer = new maptalks.TileLayer('base', {
                'urlTemplate': 'https://maponline2.bdimg.com/tile/?qt=vtile&styles=pl&scaler=2&udt=20201217&from=jsapi2_0&x={x}&y={y}&z={z}',
                'subdomains': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
                'attribution': '&copy; <a target="_blank" href="http://map.baidu.com">Baidu</a>'
            })
            map.setBaseLayer(layer);

        } else if (newMapType == 'gMap') {

            var layer = new maptalks.TileLayer('base', {
                urlTemplate: "http://mt2.google.cn/vt?lyrs=m@180000000&hl=zh-CN&gl=cn&scale=2&src=app&x={x}&y={y}&z={z}&s=Gal",
            })
            map.setSpatialReference({})
            map.setBaseLayer(layer);

        } else if (newMapType == 'aMap') {
            var layer = new maptalks.TileLayer('base', {
                urlTemplate: 'http://webrd04.is.autonavi.com/appmaptile?lang=zh_cn&scale=2&style=8&x={x}&y={y}&z={z}',
            })
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
                    'markerRotation': -sTrack.course,
                    'markerDy': 0,
                    'markerDx': 0,
                },
            }
        );
        var eTrack = tracks[tracks.length - 1];
        var emarker = new maptalks.Marker(
            [eTrack.point.x, eTrack.point.y], {
                symbol: {
                    'markerFile': './images/icon_en.png',
                    'markerWidth': 30,
                    'markerHeight': 30,
                    'markerRotation': -eTrack.course,
                    'markerDy': 0,
                    'markerDx': 0,
                },
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
    getUserInfoList: function() {
        var url = myUrls.querySubUserNameList();
        utils.sendAjax(url, { username: userName }, function(resp) {
            if (resp.status == 0) {
                if (resp.usernames) {
                    resp.usernames.sort(function(a, b) {
                        return a.localeCompare(b);
                    });
                    userlists = resp.usernames;
                }
            }
            userlists.push(userName);
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
    getDeviceListGroups: function(groups, isNeedDevice, username) {
        var groupsList = [],
            me = this;
        if (groups != null) {
            for (var i = 0; i < groups.length; ++i) {
                var group = groups[i];
                var groupObj = {
                    title: (group.devices && group.devices.length != 0) ? group.groupname + '(' + group.devices.length + ')' : group.groupname + '(0)',
                    groupid: group.groupid,
                    username: username,
                    groupname: group.groupname,
                    totalCount: group.devices.length
                }
                if (isNeedDevice) {
                    groupObj.render = utils.renderGroup;
                } else {
                    groupObj.render = (function(group, username) {
                        return function(h, params) {
                            var data = params.data;
                            return h('span', {
                                on: {
                                    'click': function() {
                                        me.selectedUserName = username;
                                        me.selectedGroupId = group.groupid;
                                        me.selectedGroupName = group.groupname;
                                    }
                                },
                                style: {
                                    cursor: 'pointer',
                                    color: (me.selectedUserName == username && me.selectedGroupId == group.groupid) ? '#2D8CF0' : '#000'
                                }
                            }, [
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
                        }
                    })(group, username);
                }
                if (isNeedDevice && group.devices) {
                    groupObj.children = [];
                    group.devices.forEach(function(device) {

                        groupObj.children.push({
                            username: username,
                            deviceid: device.deviceid,
                            title: device.devicename,
                            render: utils.renderDev
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
                title: 'Default(0)',
                groupid: 0,
                username: username,
                totalCount: 0,
                render: function(h, params) {
                    var data = params.data;
                    return h('span', {
                        on: {
                            'click': function() {
                                me.selectedUserName = username;
                                me.selectedGroupId = 0;
                                me.selectedGroupName = 'Default';
                            }
                        },
                        style: {
                            cursor: 'pointer',
                            color: (me.selectedUserName == username && me.selectedGroupId == 0) ? '#2D8CF0' : '#000'
                        }
                    }, [
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
                }
            });
        }
        return groupsList;

    },
    doCastUsersTreeToDevicesTree: function(usersTrees, isNeedDevice) {

        var devicesTreeRecord = [];
        if (usersTrees != null && usersTrees.length > 0) {
            for (var i = 0; i < usersTrees.length; ++i) {
                var usersTree = usersTrees[i];
                var username = usersTree.username;
                var subusers = usersTree.subusers;
                var currentsubDevicesTreeRecord = {
                    username: username,
                    render: utils.renderPerson
                };
                var deviceListGroups = this.getDeviceListGroups(usersTree.groups, isNeedDevice, username);
                if (username != null && subusers != null && subusers.length > 0) {
                    var subDevicesTreeRecord = this.doCastUsersTreeToDevicesTree(subusers, isNeedDevice);
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
                currentsubDevicesTreeRecord.title = username + "(" + totalCount + ")";
                devicesTreeRecord.push(currentsubDevicesTreeRecord);
            }
        }
        return devicesTreeRecord;
    },
    castUsersTreeToDevicesTree: function(devicesTreeRecord, isNeedDevice) {
        var iViewTree = {
            render: utils.renderPerson,
            expand: true,
            deviceid: '',
        };
        if (devicesTreeRecord != null) {
            var username = devicesTreeRecord.username;
            var subusers = devicesTreeRecord.subusers;
            var deviceListGroups = this.getDeviceListGroups(devicesTreeRecord.groups, isNeedDevice, username);
            if (username != null && subusers != null && subusers.length > 0) {

                var subDevicesTreeRecord = this.doCastUsersTreeToDevicesTree(subusers, isNeedDevice);

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
            iViewTree.title = username + "(" + totalCount + ")";
        }
        return iViewTree;
    },
    queryDevicesTree: function(callback) {
        var url = myUrls.queryDevicesTree();
        var data = {
            username: userName
        };
        utils.sendAjax(url, data, function(respData) {
            callback && callback(respData.rootuser);
        });
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
    }
}

var timeDifference = DateFormat.getOffset();
try {
    //自定义 vue指令
    vClickOutside.install(Vue);
} catch (error) {

}

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
    var devicename = getDeviceNameByDeviceid(deviceid);
    window.open('playbackv2.html?deviceid=' + deviceid + '&icon=' + carIconTypes[deviceid] + '&devicename=' + devicename + '&token=' + token);
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
            $("p.last-address").html((isZh ? "地址: " : "Address: ") + j_address);
            LocalCacheMgr.setAddress(lon, lat, j_address);
        };
    });

    utils.sendAjax(url, { deviceid: deviceid }, function(resp) {});
}

// 设置围栏
function setFence(deviceid) {
    var url = myUrls.viewhosts + 'setfencemulti.html?deviceid=' + deviceid + '&token=' + token;
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
    console.log(deviceid, name);
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