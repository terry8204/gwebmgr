var utils = {
  sendAjax: function (url, data, callback) {
    var encode = JSON.stringify(data)
    $.ajax({
      url: url,
      type: 'post',
      data: encode,
      timeout: 10000,
      dataType: 'json',
      success: function (resp) {
        // if (resp.status == 3) {
        //   new Vue().$Message.error('token过期,2秒后跳回登录页面')
        //   setTimeout(function () {
        //     window.location.href = 'index.html'
        //   })
        // } else {
        callback(resp);
        // }
      },
      error: function (e) {
        Cookies.remove('token')
        new Vue().$Loading.error()
      },
      complete: function () {
        //  console.log('完成', '')
      }
    })
  },
  getParameterByName: function (name) {
    var url = location.search;
    url = decodeURIComponent(url);
    var theRequest = new Object();
    if (url.indexOf("?") != -1) {
      var str = url.substr(1);
      var strs = str.split("&");
      for (var i = 0; i < strs.length; i++) {
        theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
      }
    }
    return theRequest[name];
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
          callback(finaladdress)
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
  getDisplayRange: function (zoom) {
    var range = null
    if (zoom == 18) {
      range = 25
    } else if (zoom == 17) {
      range = 50
    } else if (zoom == 16) {
      range = 100
    } else if (zoom == 15) {
      range = 250
    } else if (zoom == 14) {
      range = 500
    } else if (zoom == 13) {
      range = 1000
    } else if (zoom == 12) {
      range = 2500
    } else if (zoom == 11) {
      range = 5000
    } else if (zoom == 10) {
      range = 10000
    } else if (zoom == 9) {
      range = 12500
    } else if (zoom == 8) {
      range = 25000
    } else if (zoom == 7) {
      range = 50000
    } else if (zoom == 6) {
      range = 100000
    } else if (zoom == 5) {
      range = 250000
    } else if (zoom == 4) {
      range = 500000
    }
    return range
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
  addMapFence: function (vm, deviceid, distance) {
    var map = vm.map;
    var mks = map.getOverlays();
    var point = null;
    for (var i = 0; i < mks.length; i++) {
      var mk = mks[i];
      if (deviceid == mk.deviceid) {
        point = mk.point;
        break;
      }
    }

    if (point) {
      var circle = new BMap.Circle(point, distance, { strokeColor: "red", fillColor: "#eee", strokeWeight: 0.8, fillOpacity: 0.5 });
      circle.circleid = deviceid;   // 给围栏做标记
      map.addOverlay(circle);
    }
  }
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
  utils.sendAjax(url, { deviceid: deviceid }, function (resp) {
    console.log('resp', resp)
  });
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
    };
  })

}