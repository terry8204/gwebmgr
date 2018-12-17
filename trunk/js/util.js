var utils = {
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
  sendAjax: function (url, data, callback) {
    var encode = JSON.stringify(data)
    $.ajax({
      url: url,
      type: 'post',
      data: encode,
      timeout: 10000,
      dataType: 'json',
      success: function (resp) {
        callback(resp);
      },
      error: function (e) {
        Cookies.remove('token')
        new Vue().$Loading.error()
      },
      complete: function () { }
    })
  },
  getIsOnline: function (track) {
    var result = false;
    var arrivedtime = track.arrivedtime;
    if ((Date.now() - arrivedtime) < 60 * 5 * 1000) {
      result = true;
    }
    return result;
  },
  getBaiduAddressFromBaidu: function (offsetlon, offsetlat, callback) {
    var point = new BMap.Point(offsetlon, offsetlat)
    var geoc = new BMap.Geocoder()
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
  getJiuHuAddressSyn: function (lat, lon, callback) {
    $.ajax({
      type: 'get',
      url: 'http://www.jh.tt/w?lat=' + lat + '&lon=' + lon,
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
      console.log(resp)
      if (resp && resp.length) {
        var address = resp[0].formatted_address;

        callback(address);
      }
    })
  },
  getParameterByName: function (name) {
    var url = location.search
    url = decodeURIComponent(url)
    var theRequest = new Object()
    if (url.indexOf('?') != -1) {
      var str = url.substr(1)
      var strs = str.split('&')
      for (var i = 0; i < strs.length; i++) {
        theRequest[strs[i].split('=')[0]] = unescape(strs[i].split('=')[1])
      }
    }
    return theRequest[name]
  },
  getCarDirection: function (course) {
    var direction = null
    if (course == 0) {
      direction = isZh ? '正北' : 'Due north';
    } else if (course == 90) {
      direction = isZh ? '正东' : 'Due east';
    } else if (course == 180) {
      direction = isZh ? '正南' : 'Due south';
    } else if (course == 270) {
      direction = isZh ? '正西' : 'due west';
    } else if (course > 0 && course < 90) {
      direction = isZh ? '东北' : 'Northeast';
    } else if (course > 90 && course < 180) {
      direction = isZh ? '东南' : 'Southeast';
    } else if (course > 180 && course < 270) {
      direction = isZh ? '西南' : 'Southwest';
    } else if (course > 270 && course <= 360) {
      direction = isZh ? '西北' : 'Northwest';
    }
    return direction
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
    if (pathname.indexOf('gpsserver') != -1) {
      imgPath = myUrls.host + 'images/carstate'
    } else {
      imgPath = '../images/carstate'
    }
    if (isOnline) {
      imgPath += '/green_' + angle + '.png'
    } else {
      imgPath += '/gray_' + angle + '.png'
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
            device.devicename = devicename
            device.firstLetter = __pinyin.getFirstLetter(devicename)
            device.pinyin = __pinyin.getPinyin(devicename)
          }
          if (simnum) {
            device.simnum = simnum
          }
        }
      })
    })
  },
  parseXML: function (param) {
    var paramsListObj = []
    var params = "<params>" + param + "</params>";
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(params, "text/xml");
    var parent = xmlDoc.children[0];
    var children = parent.children;
    for (var i = 0; i < children.length; i++) {
      var item = children[i]
      var desc = item.innerHTML;
      var type = item.getAttribute("type");
      var value = item.getAttribute("value");
      if (type && desc) {
        paramsListObj.push({ type: type, desc: desc, value: value });
      }
    }
    return paramsListObj;
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

    var content =
      '<p> ' + (isZh ? '设备名称' : 'Device Name') + ': ' + track.devicename + '</p>' +
      '<p> ' + (isZh ? '设备序号' : 'Device Number') + ': ' + track.deviceid + '</p>' +
      '<p> ' + (isZh ? '定位类型' : 'Position Type') + ': ' + posiType + '</p>' +
      '<p> ' + (isZh ? '经纬度' : 'Longitude and latitude') + ': ' + track.callon.toFixed(5) + ',' + track.callat.toFixed(5) + '</p>' +
      '<p> ' + (isZh ? '最后时间' : 'Last time') + ': ' + DateFormat.longToDateTimeStr(track.arrivedtime, 0) + '</p>' +
      '<p> ' + (isZh ? '状态' : 'Status') + ': ' + strstatus + '</p>' +
      '<p class="last-address"> ' + (isZh ? '详细地址' : 'Address') + ': ' + b_address + '</p>' +
      '<p class="operation">' +
      '<span class="ivu-btn ivu-btn-default ivu-btn-small" onclick="playBack(' +
      track.deviceid +
      ')">' + (isZh ? '轨迹' : 'Track') + '</span>' +
      '<span class="ivu-btn ivu-btn-default ivu-btn-small" onclick="trackMap(' +
      track.deviceid +
      ')">' + (isZh ? '跟踪' : 'Stalker') + '</span><span class="ivu-btn ivu-btn-default ivu-btn-small" onclick="refreshPostion(' +
      track.deviceid +
      ')">' + (isZh ? '刷新位置' : 'RefreshPosi') + '</span><span class="ivu-btn ivu-btn-default ivu-btn-small" onclick="openSim(' +
      track.deviceid +
      ')">SIM</span><span class="ivu-btn ivu-btn-default ivu-btn-small" onclick="setFence(' +
      track.deviceid +
      ')">' + (isZh ? '设置围栏' : 'SetFence') + '</span></p>';
    return content;
  },
  getI18n: function () {
    return new VueI18n({
      locale: Cookies.get("PATH_LANG") || 'zh',
      messages: messages
    });
  }
}

try {
  //自定义 vue指令
  vClickOutside.install(Vue);
} catch (error) {

}



//  vue组件   配合查询分组表格使用
Vue.component('expand-row', {
  template:
    '<div>' +
    '<span v-for="(item , index) in devices" style="display:inline-block;margin:5px">' +
    '<i-button icon="md-phone-portrait" @click="clickMe(item)"> {{item.deviceid}}</i-button>' +
    '</span>' +
    '</div>',
  props: {
    devices: Array
  },
  data: function () {
    return {}
  },
  methods: {
    clickMe: function (item) {
      console.log(item)
    }
  },
  mounted: function () {
    console.log(this.devices)
  }
})

var mixIn = {
  methods: {
    handlerClickQuery () {
      var self = this;
      var queryTableData = [];
      if (!self.queryParameter) return;
      this.recordsList.forEach(function (record) {
        var value = record[self.queryType];
        if (value && value.indexOf(self.queryParameter) != -1) {
          queryTableData.push(record);
        }
      })
      this.tableData = queryTableData;
    },
    changePage: function (index) {
      var offset = index * 5;
      var start = (index - 1) * 5;
      this.currentIndex = index;
      this.tableData = this.recordsList.slice(start, offset);
    },
  },
  watch: {
    queryParameter: function () {
      if (!this.queryParameter) {
        this.tableData = this.recordsList.slice(0, 5);
        this.currentIndex = 1;
      }
    }
  },
}


//  得到表格row组建
var expandRow = Vue.component('expand-row')

// 轨迹回放
function playBack (deviceid) {
  window.open('playback.html?deviceid=' + deviceid)
}

// 跟踪
function trackMap (deviceid) {
  window.open('trackmap.html?deviceid=' + deviceid)
}

//刷新位置信息
function refreshPostion (deviceid) {
  var url = myUrls.refreshPostion();
  var track = vstore.state.currentDeviceRecord;
  var lon = track.callon.toFixed(5);
  var lat = track.callat.toFixed(5);
  console.log(lon, lat);
  try {
    var b_lon_lat = wgs84tobd09(track.callon, track.callat);
    utils.getBaiduAddressFromBaidu(b_lon_lat[0], b_lon_lat[1], function (b_address) {
      if (b_address) {
        console.log('b_address', b_address);
        $("p.last-address").html((isZh ? "详细地址: " : "Address: ") + b_address);
        LocalCacheMgr.setAddress(lon, lat, b_address);
      };
    })
  } catch (error) {
    var g_lon_lat = wgs84togcj02(track.callon, track.callat);
    utils.getGoogleAddressSyn(g_lon_lat[1], g_lon_lat[0], function (g_address) {
      if (g_address) {
        console.log('g_address', g_address);
        $("p.last-address").html((isZh ? "详细地址: " : "Address: ") + g_address);
        LocalCacheMgr.setAddress(lon, lat, g_address);
      }
    });
  }
  utils.sendAjax(url, { deviceid: deviceid }, function (resp) { });
}

// 设置围栏
function setFence (deviceid) {
  var url = 'setfence.html?deviceid=' + deviceid + '&token=' + token;
  window.open(url);
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

  const deepClone = function (data) {
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
