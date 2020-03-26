var utils = {
  Bytes2HexStr: function (arr) {
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
  HexStr2Bytes: function (str) {

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
  changeSingleItemData: function (records, item, propertyType) {

    for (var i = 0; i < records.length; i++) {
      var record = records[i];
      if (record[propertyType] === item[propertyType]) {
        records[i] = item;
        break;
      }
    }
  },
  locale: Cookies.get("PATH_LANG") || 'zh',
  getMapType: function () {
    var mapType = Cookies.get('app-map-type');
    if (!mapType) {
      if (this.locale === 'zh') {
        mapType = "bMap";
      } else {
        mapType = "gMap";
      }
    };
    return mapType;
  },
  timeStamp: function (mss, isZh) {
    var days = parseInt(mss / (1000 * 60 * 60 * 24));
    var hours = parseInt((mss % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = parseInt((mss % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = (mss % (1000 * 60)) / 1000;
    if (days > 0) {
      if (days > 999) {
        return isZh ? "999天" : "999day";
      } else {
        return isZh ? `${days}天` : `${days}day`;
      }
    } else {
      if (hours > 0) {
        return isZh ? `${hours}小时` : `${hours}hours`;
      } else {
        if (minutes > 0) {
          return isZh ? `${minutes}分钟` : `${minutes}minutes`;
        } else {
          return isZh ? `1分钟` : `1minutes`;
        }

      }

    }
  },
  sendAjax: function (url, data, callback) {
    var encode = JSON.stringify(data);
    $.ajax({
      url: url,
      type: 'post',
      data: encode,
      timeout: 30000,
      dataType: 'json',
      success: function (resp) {
        if (resp) {
          if (resp.status > 9000) {
            if (vRoot.$t) {
              vRoot.$Message.error(vRoot.$t("monitor.reLogin"));
            } else {
              vRoot.$Message.error('token失效请从新登陆');
            }
            Cookies.remove('token')
            setTimeout(function () {
              window.location.href = 'index.html'
            }, 2000);
          } else {
            callback(resp);
          }
        } else {
          console.log('sendAjax - resp - null', url);
        }
      },
      error: function (e) {
        // Cookies.remove('token');
        try {
          vRoot.loading = false;
          isRequsetPlaying && (isRequsetPlaying = false);
        } catch (e) {

        }
        new Vue().$Loading.error();
      },
      complete: function () { }
    })
  },
  getIsOnline: function (track) {
    var result = false;
    var updatetime = track.updatetime;
    if ((Date.now() - updatetime) < 60 * 10 * 1000) {
      result = true;
    }
    return result;
  },
  getBaiduAddressFromBaidu: function (offsetlon, offsetlat, callback) {
    var point = new BMap.Point(offsetlon, offsetlat);
    var geoc = new BMap.Geocoder();
    geoc.getLocation(point, function (rs) {

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
  getJiuHuAddressSyn: function (lon, lat, callback) {
    $.ajax({
      type: 'get',
      url: 'https://www.jh.tt/w?lat=' + lat + '&lon=' + lon,
      success: function (data) {
        if (data && data.status == 0) {
          callback(data)
        }
      }
    })
  },
  getGoogleAddressSyn: function (lat, lon, callback) {
    var request = {
      location: new google.maps.LatLng({ lat: lat, lng: lon })
    }
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode(request, function (resp) {
      if (resp && resp.length) {
        var address = resp[0].formatted_address;
        callback(address);
      }
    })
  },
  getParameterByName: function (name) {
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
  getCarDirection: function (course) {
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
  getAngle: function (course) {
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
  getDirectionImage: function (isOnline, angle) {
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
  changeGroupsDevName: function (changeInfo, groups) {
    var deviceid = changeInfo.deviceid
    var devicename = changeInfo.devicename
    var simnum = changeInfo.simnum

    groups.forEach(function (group) {
      group.devices.forEach(function (device) {
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
  parseXML: function (param) {
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
  getPosiType: function (track) {

    var type = null;
    var gotsrc = track.gotsrc;  //cell gps wifi
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
  getWindowContent: function (track, b_address) {
    var strstatus = '';
    var posiType = this.getPosiType(track);
    if (isZh) {
      strstatus = track.strstatus ? track.strstatus : '';
    } else {
      strstatus = track.strstatusen ? track.strstatusen : '';
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
    if (isZh) {
      var isOnineStr = utils.getIsOnline(track) ? "在线" : "离线" + utils.timeStamp(Date.now() - track.updatetime, isZh);
    } else {
      var isOnineStr = utils.getIsOnline(track) ? "online" : "offline" + utils.timeStamp(Date.now() - track.updatetime, isZh);
    };
    var speed = track.speed == 0 ? "0km/h" : (track.speed / 1000).toFixed(2) + "km/h";
    var rxlevel = track.rxlevel === 0 ? '' : ('(' + (isZh ? '信号' : 'Signal') + ':' + track.rxlevel + '%)');
    var deviceid = "'" + track.deviceid + "'";
    var content =
      '<p> ' + (isZh ? '设备名称' : 'Device Name') + ': ' + track.devicename + '</p>' +
      '<p> ' + (isZh ? '设备序号' : 'Device Number') + ': ' + track.deviceid + '</p>' +
      '<p> ' + (isZh ? '定位类型' : 'Position Type') + ': ' + posiType + '</p>' +
      '<p> ' + (isZh ? '经纬度' : 'Longitude and latitude') + ': ' + track.callon.toFixed(6) + ',' + track.callat.toFixed(6) + '</p>' +
      '<p> ' + (isZh ? '更新时间' : 'Update time') + ': ' + DateFormat.longToDateTimeStr(track.updatetime, 0) + '(' + isOnineStr + ')</p>' +
      '<p> ' + (isZh ? '定位时间' : 'Posi time') + ': ' + DateFormat.longToDateTimeStr(track.validpoistiontime, 0) + '</p>' +
      '<p> ' + (isZh ? '速度' : 'Speed') + ': ' + speed + rxlevel + '</p>' +
      '<p> ' + (isZh ? '总里程' : 'Mileage') + ': ' + this.getMileage(track.totaldistance) + '</p>' +
      '<p> ' + (isZh ? '状态' : 'Status') + ': ' + strstatus + '</p>' +
      '<p class="last-address"> ' + (isZh ? '详细地址' : 'Address') + ': ' + b_address + '</p>' +
      '<p class="operation">' +
      '<span class="ivu-btn ivu-btn-default ivu-btn-small" onclick="playBack(' +
      deviceid +
      ')">' + (isZh ? '轨迹' : 'Track') + '</span>' +
      '<span class="ivu-btn ivu-btn-default ivu-btn-small" onclick="trackMap(' +
      deviceid +
      ')">' + (isZh ? '跟踪' : 'Stalker') + '</span><span class="ivu-btn ivu-btn-default ivu-btn-small" onclick="refreshPostion(' +
      deviceid +
      ')">' + (isZh ? '刷新位置' : 'RefreshPosi') + '</span><span class="ivu-btn ivu-btn-default ivu-btn-small" onclick="openSim(' +
      deviceid +
      ')">SIM</span><span class="ivu-btn ivu-btn-default ivu-btn-small" onclick="setFence(' +
      deviceid +
      ')">' + (isZh ? '设置围栏' : 'SetFence') + '</span><span class="ivu-btn ivu-btn-default ivu-btn-small" onclick="setPanorama(' +
      deviceid +
      ')">' + (isZh ? '查看街景' : 'Panorama') + '</span></p>';
    var extendsBtns = this.getIsAddExtendBtns(), extendsStr = '';
    if (extendsBtns.video) {
      var devicename = "'" + track.devicename + "'";
      var activeSafety = extendsBtns.activesafety ? 1 : 0;
      devicename = encodeURIComponent(devicename);
      extendsStr += '<span class="ivu-btn ivu-btn-default ivu-btn-small" onclick="openVdeio(' + deviceid + ',' + devicename + ',' + activeSafety + ')">视频</span>'
    };

    if (extendsBtns.activesafety) {
      var devicename = "'" + track.devicename + "'";
      devicename = encodeURIComponent(devicename);
      extendsStr += '<span class="ivu-btn ivu-btn-default ivu-btn-small" onclick="openActiveSafety(' + deviceid + ',' + devicename + ')">主动安全</span>'
    };

    if (extendsBtns.audio) {
      extendsStr += '<span class="ivu-btn ivu-btn-default ivu-btn-small" onclick="openAudio(' + deviceid + ')">录音</span>'
    };
    if (extendsBtns.bms) {
      extendsStr += '<span class="ivu-btn ivu-btn-default ivu-btn-small" onclick="openBms(' + deviceid + ')">BMS</span>'
    };
    if (extendsBtns.obd) {
      extendsStr += '<span class="ivu-btn ivu-btn-default ivu-btn-small" onclick="openObd(' + deviceid + ')">OBD</span>'
    };
    if (extendsBtns.weight) {
      extendsStr += '<span class="ivu-btn ivu-btn-default ivu-btn-small" onclick="openWeight(' + deviceid + ')">称重</span>'
    };
    if (extendsBtns.watermeter) {
      extendsStr += '<span class="ivu-btn ivu-btn-default ivu-btn-small" onclick="openWatermeter(' + deviceid + ')">水表</span>'
    };
    if (extendsStr.length) {
      content += '<p class="operation" style="margin-top:3px;">' + extendsStr + '</p>';
    }
    return content;
  },
  getIsAddExtendBtns: function () {
    var deviceTypes = vRoot.$children[1].deviceTypes;
    var currentDeviceType = vRoot.$children[1].currentDeviceType;
    var result1 = false;
    var result2 = false;
    var result3 = false;
    var result4 = false;
    var result5 = false;
    var result6 = false;
    var result7 = false;
    for (var i = 0; i < deviceTypes.length; i++) {
      if (currentDeviceType == deviceTypes[i].devicetypeid) {
        var functions = deviceTypes[i].functions;
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
        };
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
    }
  },
  getMileage: function (totaldistance) {
    if (totaldistance == 0) {
      return totaldistance + 'km';
    };
    return (totaldistance * 1.0 / 1000).toFixed(3) + 'km';
  },
  getI18n: function () {
    return new VueI18n({
      locale: Cookies.get("PATH_LANG") || 'zh',
      messages: messages
    });
  },
  queryAddress: function (info, callback) {
    if (this.getMapType() == 'bMap') {
      var b_lon_lat = wgs84tobd09(Number(info.callon), Number(info.callat));
      utils.getBaiduAddressFromBaidu(b_lon_lat[0], b_lon_lat[1], function (b_address) {
        if (b_address.length) {
          callback(b_address);
        } else {
          utils.getJiuHuAddressSyn(info.callon, info.callat, function (resp) {
            var j_address = resp.address;
            callback(j_address);
          })
        }
      });
    } else {
      var g_lon_lat = wgs84togcj02(Number(info.callon), Number(info.callat));
      utils.getGoogleAddressSyn(g_lon_lat[1], g_lon_lat[0], function (b_address) {
        if (b_address.length) {
          callback(b_address);
        } else {
          utils.getJiuHuAddressSyn(callon, callat, function (resp) {
            var j_address = resp.address
            callback(j_address);
          });
        }
      });
    }
  },
  showWindowMap: function (vueInstanse, params) {
    vueInstanse.mapModal = true;
    var row = params.row;
    if (vueInstanse.mapType == 'bMap') {
      var b_lon_lat = wgs84tobd09(Number(row.callon), Number(row.callat));
      var point = new BMap.Point(b_lon_lat[0], b_lon_lat[1]);
      var marker = new BMap.Marker(point);
      setTimeout(function () {
        vueInstanse.mapInstance.clearOverlays();
        vueInstanse.mapInstance.addOverlay(marker);
        vueInstanse.mapInstance.panTo(point);
      }, 100);
    } else {
      if (vueInstanse.markerIns) {
        vueInstanse.markerIns.setMap(null);
      }
      var g_lon_lat = wgs84togcj02(Number(row.callon), Number(row.callat));
      var latLng = new google.maps.LatLng(g_lon_lat[1], g_lon_lat[0]);
      vueInstanse.markerIns = new MarkerWithLabel({
        position: latLng,
        map: vueInstanse.mapInstance,
      });
      vueInstanse.mapInstance.setZoom(18);
      setTimeout(function () {
        vueInstanse.mapInstance.panTo(latLng);
      }, 100);
    }
  },
  getPinyin: function (groupslist) {
    var me = this;
    groupslist.forEach(function (group) {
      group.firstLetter = __pinyin.getFirstLetter(group.groupname);
      group.pinyin = __pinyin.getPinyin(group.groupname);
      group.devices.forEach(function (device) {
        var typeName = me.getDeviceTypeName(device.devicetype)
        device.firstLetter = __pinyin.getFirstLetter(device.devicename);
        device.pinyin = __pinyin.getPinyin(device.devicename);
        device.title = typeName + "-" + device.devicename + "-" + device.deviceid;
      })
    });
    return groupslist;
  },
  getDeviceTypeName: function (deviceTypeId) {
    var typeName = "", deviceTypes = vstore.state.deviceTypes;
    for (var index = 0; index < deviceTypes.length; index++) {
      var element = deviceTypes[index];
      if (element.devicetypeid === deviceTypeId) {
        typeName = element.typename;
        break
      }
    }
    return typeName;
  },
  getUserInfoList: function () {
    var url = myUrls.queryUser();
    utils.sendAjax(url, { username: userName }, function (resp) {
      if (resp.status == 0) {
        if (resp.userlists) {
          resp.userlists.forEach(function (user) {
            // userlists.push({ label: user.username, value: user.username });
            userlists.push(user.username);
          })
        }
      }
    });
  },
  debounce: function (func, wait, immediate) {
    var timeout, args, context, timestamp, result;
    var later = function () {
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
    return function () {
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
  isLocalhost: function () {
    return location.hostname.indexOf('localhost') != -1 || location.hostname.indexOf('127.0.0.1') != -1;
  }
}

try {
  //自定义 vue指令
  vClickOutside.install(Vue);
} catch (error) {

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
    changePage: function (index) {
      var offset = index * 10;
      var start = (index - 1) * 10;
      var me = this;
      this.currentIndex = index;
      if (this.queryParameter != "") {
        this.tableData = this.queryTableData.slice(start, offset);
      } else {
        this.tableData = this.recordsList.slice(start, offset);
      }

    },
  },
  watch: {
    queryParameter: function () {
      if (!this.queryParameter) {
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
function playBack (deviceid) {
  window.open('playback.html?deviceid=' + deviceid + '&token=' + token);
}

// 跟踪
function trackMap (deviceid) {
  window.open('trackmap.html?deviceid=' + deviceid + '&token=' + token);
}

//刷新位置信息
function refreshPostion (deviceid) {
  var url = myUrls.refreshPostion();
  var track = vstore.state.currentDeviceRecord;
  var lon = track.callon.toFixed(5);
  var lat = track.callat.toFixed(5);

  try {
    var b_lon_lat = wgs84tobd09(track.callon, track.callat);
    utils.getBaiduAddressFromBaidu(b_lon_lat[0], b_lon_lat[1], function (b_address) {
      if (b_address) {

        $("p.last-address").html((isZh ? "详细地址: " : "Address: ") + b_address);
        LocalCacheMgr.setAddress(lon, lat, b_address);
      };
    })
  } catch (error) {
    var g_lon_lat = wgs84togcj02(track.callon, track.callat);
    utils.getGoogleAddressSyn(g_lon_lat[1], g_lon_lat[0], function (g_address) {
      if (g_address) {

        $("p.last-address").html((isZh ? "详细地址: " : "Address: ") + g_address);
        LocalCacheMgr.setAddress(lon, lat, g_address);
      }
    });
  }
  utils.sendAjax(url, { deviceid: deviceid }, function (resp) { });
}

// 设置围栏
function setFence (deviceid) {
  var url = myUrls.viewhosts + 'setfencemulti.html?deviceid=' + deviceid + '&token=' + token;
  window.open(url);
}

function openAudio (deviceid) {
  var url = myUrls.viewhosts + 'record.html?deviceid=' + deviceid + '&token=' + token;
  window.open(url);
}

function openVdeio (deviceid, name, activesafety) {
  var mapType = utils.getMapType();
  mapType = mapType ? mapType : 'bMap';
  var url = myUrls.viewhosts + 'video.html?deviceid=' + deviceid + "&maptype=" + mapType + '&token=' + token + '&name=' + name + "&activesafety=" + activesafety;
  window.open(url);
}

function openActiveSafety (deviceid, name) {
  var mapType = utils.getMapType();
  mapType = mapType ? mapType : 'bMap';
  var url = myUrls.viewhosts + 'activesafety.html?deviceid=' + deviceid + "&maptype=" + mapType + '&token=' + token + '&name=' + name;
  window.open(url);
}

function openObd (deviceid) {
  var url = myUrls.viewhosts + 'obd.html?deviceid=' + deviceid + '&token=' + token;
  window.open(url);
}

function openBms (deviceid) {
  var url = myUrls.viewhosts + 'bmssys.html?deviceid=' + deviceid + '&token=' + token;
  window.open(url);
}

function openWatermeter (deviceid) {
  // var url = 'bmssys.html?deviceid=' + deviceid + '&token=' + token;
  // window.open(url);
}

function openWeight (deviceid) {
  var url = myUrls.viewhosts + 'weighing.html?deviceid=' + deviceid + '&token=' + token;
  window.open(url);
}





// 全景
function setPanorama (deviceid) {
  var monitorIns = vRoot.$children[1];
  if (monitorIns.mapType === 'bMap') {
    var track = monitorIns.positionLastrecords[deviceid];
    var panoramaService = new BMap.PanoramaService();
    panoramaService.getPanoramaByLocation(new BMap.Point(track.b_lon, track.b_lat), function (data) {
      if (data == null) {
        vRoot.$Message.error("该位置暂时没有街景");
        return;
      }
      var myData = data;
      var panorama = monitorIns.$data.map.mapInstance.getPanorama();//获取实例对象
      panorama.setId(myData.id);  //全景ID
      panorama.show(); //显示全景
    });
  } else {
    alert("谷歌地图暂时没开发");
  }
}



// openSim
function openSim (deviceId) {
  var url = myUrls.queryDeviceBaseInfo();
  utils.sendAjax(url, { deviceid: deviceId }, function (resp) {
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
      var url = 'sim.html?sim=' + sim + '&type=' + type;
      window.open(url);
    } else {
      vRoot.$Message.error(isZh ? "请设置设备手机号" : "Please set the mobile phone number of the device.");
    };
  })

}


(function (win) {
  'use strict';
  function getDataType (data) {
    return Object.prototype.toString.call(data).slice(8, -1);
  }

  function isCyclic (data) {
    var seenObjects = [];
    function detect (data) {
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

  var deepClone = function (data) {
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
    }
    else {
      return data;
    }
  }
  win.deepClone = deepClone;
})(this);

// var bounds = this.map.getBounds();
//  bounds.containsPoint(point)


var getPath = function () {
  var jsPath = document.currentScript ? document.currentScript.src : function () {
    var js = document.scripts
      , last = js.length - 1
      , src;

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
function loadBMapSucc () {
  isLoadBMap = true;
}

var asyncLoadJs = function (jsName, callback) {
  var node = document.createElement('script'),
    timeout = 1,
    head = document.getElementsByTagName('head')[0],
    urls = {
      baidu: 'https://api.map.baidu.com/api?v=3.0&ak=' + baiduMapKey + '&callback=loadBMapSucc',
      textIconoverlay: getPath + 'texticonoverlay_min.js',
      distancetool: getPath + 'distancetool_min.js',
      bmarkerclusterer: getPath + "markerclusterer.js",

      google: "https://maps.google.com/maps/api/js?v=3.1&sensor=false&language=" + (isZh ? 'cn' : 'en') + "&key=" + googleMapKey + "&cb=loadBMapSucc",
      gmarkerclusterer: getPath + "gmarkerclusterer.js",
      markerwithlabel: getPath + "markerwithlabel.js",
    };

  //加载完毕
  function onScriptLoad (e) {
    var readyRegExp = navigator.platform === 'PLaySTATION 3' ? /^complete$/ : /^(complete|loaded)$/
    if (e.type === 'load' || (readyRegExp.test((e.currentTarget || e.srcElement).readyState))) {

      head.removeChild(node);
      (function poll () {
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
    node.attachEvent('onreadystatechange', function (e) {
      onScriptLoad(e);
    });
  } else {
    node.addEventListener('load', function (e) {
      onScriptLoad(e);
    }, false);
  };

};