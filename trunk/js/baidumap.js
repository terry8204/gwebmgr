function BMapClass() {
    this.mapInstance = null;
    this.markerClusterer = null;
    this.lastTracks = null;
    this.mapInfoWindow = null; //地图窗口 
    this.circleList = [];
    this.markerHashMap = {};
    this.polygon = null; // 区域
    this.initMap();
}

BMapClass.pt = BMapClass.prototype;

BMapClass.pt.initMap = function() {
    this.mapInstance = new BMap.Map('my-map', { minZoom: 4, maxZoom: 20, enableMapClick: false })
    this.mapInstance.enableScrollWheelZoom()
    this.mapInstance.enableAutoResize()
    this.mapInstance.disableDoubleClickZoom()
    this.mapInstance.centerAndZoom(new BMap.Point(108.0017245, 35.926895), 5)

    // var top_left_control = new BMap.ScaleControl({anchor: BMAP_ANCHOR_BOTTOM_LEFT});
    var top_left_control = new BMap.ScaleControl({
            anchor: BMAP_ANCHOR_BOTTOM_LEFT
        }) // 左上角，添加比例尺
    var top_left_navigation = new BMap.NavigationControl() //左上角，添加默认缩放平移控件
    this.mapInstance.addControl(top_left_control)
    this.mapInstance.addControl(top_left_navigation)
    this.mapInstance.addControl(
        new BMap.MapTypeControl({
            mapTypes: [BMAP_NORMAL_MAP, BMAP_HYBRID_MAP]
        })
    );
}


BMapClass.pt.setMarkerClusterer = function(lastTracks) {
    // this.lastTracks = deepClone(lastTracks);
    this.lastTracks = lastTracks;
    if (this.markerClusterer == null) {
        var markers = this.getMarkers();
        // this.markerClusterer = new MarkerClusterer(this.mapInstance, { markers: markers });
        this.markerClusterer = new BMapLib.MarkerClusterer(this.mapInstance, { markers: markers, minClusterSize: 2 });
        this.markerClusterer.setMaxZoom(18);

    }
};



BMapClass.pt.getMarkers = function() {
    var markers = [];
    for (var key in this.lastTracks) {
        var track = this.lastTracks[key];
        var myIcon = this.getIcon(track);
        var point = new BMap.Point(track.b_lon, track.b_lat);
        var marker = new BMap.Marker(point, { icon: myIcon, rotation: track.course });
        this.addMarkerEvent(marker);
        var label = this.getCarLabel(track);
        marker.deviceid = track.deviceid;
        marker.setLabel(label);
        markers.push(marker);
        this.markerHashMap[track.deviceid] = marker;
    }
    return markers;
}

BMapClass.pt.updateMarkerLabel = function(deviceid) {
    var marker = this.markerHashMap[deviceid];
    if (marker) {
        var track = this.lastTracks[deviceid];
        if (track) {
            var label = this.getCarLabel(track);
            marker.setLabel(label);
        }
    }
}


BMapClass.pt.addMarkerEvent = function(marker) {
    var self = this;
    marker.addEventListener("click", function() {
        var deviceid = marker.deviceid;
        communicate.$emit("on-click-marker", deviceid);
        self.openInfoWindow(marker, deviceid);
    });
}



BMapClass.pt.openInfoWindow = function(marker, deviceid, zoom) {
    var track = this.lastTracks[deviceid];
    var address = this.getDevAddress(track);
    var mapInfoWindow = this.getInfoWindow(track, address);
    if (zoom) {
        if (zoom == 19) {
            this.mapInstance.panTo(marker.point);
        } else {
            this.mapInstance.centerAndZoom(marker.point, 19);
        };
    } else {
        this.mapInstance.panTo(marker.point);
    };
    this.mapInstance.openInfoWindow(mapInfoWindow, marker.point);
    this.mapInfoWindow = mapInfoWindow;
}


BMapClass.pt.getCarLabel = function(track) {
    var label = new BMap.Label(track.devicename, {
        offset: new BMap.Size(35, 0)
    });
    label.setStyle({
        border: 0,
        padding: "2px",
        background: "#00A8D4",
        color: "#fff"
    })
    return label;
}

BMapClass.pt.getIcon = function(track) {
    var imgPath = ''
    if (utils.isLocalhost()) {
        imgPath = myUrls.viewhost + 'images/carstate'
    } else {
        imgPath = '../images/carstate'
    }
    if (track.online) {
        if (track.moving == 0) {
            imgPath += '/a_red_0.png'
        } else {
            imgPath += '/a_green_0.png'
        }

    } else {
        imgPath += '/a_gray_0.png'
    }
    return new BMap.Icon(imgPath, new BMap.Size(32, 32));
}


BMapClass.pt.getDevAddress = function(track) {
    var self = this;
    var callon = track.callon.toFixed(5);
    var callat = track.callat.toFixed(5);
    //var b_lon = track.b_lon;
    //var b_lat = track.b_lat;
    var address = LocalCacheMgr.getAddress(callon, callat);
    if (address != null) {
        return address;
    }
//    utils.getBaiduAddressFromBaidu(b_lon, b_lat, function(b_address) {
//        if (b_address != undefined && b_address.length) {
//            if (self.mapInfoWindow.isOpen()) {
//                var content = utils.getWindowContent(track, b_address);
//                self.mapInfoWindow.setContent(content);
//            };
//            LocalCacheMgr.setAddress(callon, callat, b_address);
//        } else {
            utils.getJiuHuAddressSyn(callon, callat, function(resp) {
                var j_address = resp.address;
                if (j_address && j_address != undefined) {
                    if (self.mapInfoWindow.isOpen()) {
                        var content = utils.getWindowContent(track, j_address);
                        self.mapInfoWindow.setContent(content);
                    };
                    LocalCacheMgr.setAddress(callon, callat, j_address);
                }
            })
//        }
//    }
//    );
    return '正在解析地址...';
}


BMapClass.pt.getInfoWindow = function(track, address) {
    var option = {
        width: 350,
    };
    var content = utils.getWindowContent(track, address);
    var infoWindow = new BMap.InfoWindow('<div id="windowInfo">' + content + '</div>', option);
    infoWindow.disableCloseOnClick();
    infoWindow.disableAutoPan();
    return infoWindow;
}

BMapClass.pt.onClickDevice = function(deviceid) {
    var marker = this.markerHashMap[deviceid];
    for (var key in this.markerHashMap) {
        var itemMarker = this.markerHashMap[key];
        if (key != deviceid) {
            itemMarker.setZIndex(99);
        } else {
            marker.setZIndex(999);
        }
    }
    if (marker) {
        var that = this;
        this.openInfoWindow(marker, deviceid, that.mapInstance.getZoom());
    }
}

BMapClass.pt.addMapFence = function(deviceid, distance) {
    var mks = this.markerClusterer.getMarkers();
    var point = null;
    for (var i = 0; i < mks.length; i++) {
        var mk = mks[i];
        if (deviceid == mk.deviceid) {
            point = mk.point;
            break;
        }
    };
    if (point) {
        var circle = new BMap.Circle(point, distance, { strokeColor: "red", fillColor: "#eee", strokeWeight: 0.8, fillOpacity: 0.5 });
        circle.circleid = deviceid; // 给围栏做标记
        this.circleList.push(circle);
        this.mapInstance.addOverlay(circle);
    }
}

BMapClass.pt.cancelFence = function(deviceid) {
    var mks = this.mapInstance.getOverlays();
    for (var i = 0; i < mks.length; i++) {
        var mk = mks[i];
        if (mk && mk.circleid == deviceid) {
            this.mapInstance.removeOverlay(mk);
            this.circleList.splice(i, 1, null);
        }
    }
}


BMapClass.pt.updateLastTracks = function(deviceid) {
    // console.log('updateLastTracks', deviceid)
    // this.lastTracks = lastTracks;
    for (var key in this.lastTracks) {
        if (this.lastTracks.hasOwnProperty(key)) {
            var track = this.lastTracks[key];
            track.online = utils.getIsOnline(track);
            if (this.markerHashMap[key]) {
                var marker = this.markerHashMap[key];
                var newPoint = new BMap.Point(track.b_lon, track.b_lat);
                var isEq = newPoint.equals(marker.point);
                var myIcon = this.getIcon(track);
                marker.setIcon(myIcon);
                marker.setRotation(track.course);

                if (!isEq) {
                    marker.setPosition(newPoint);
                    if (this.mapInfoWindow && marker.deviceid == deviceid && this.mapInfoWindow.isOpen()) {
                        // console.log('shuju --change1')
                        this.openInfoWindow(marker, deviceid);
                    } else {
                        // if (marker.deviceid == deviceid) {
                        //     if (this.mapInfoWindow) {
                        //         console.log("this.mapInfoWindow.isOpen():1", this.mapInfoWindow.isOpen());
                        //     } else {
                        //         console.log("this.mapInfoWindow:1", this.mapInfoWindow);
                        //     }
                        //     console.log("marker.deviceid == deviceid:1", deviceid);
                        // }
                    }
                } else {
                    if (this.mapInfoWindow && marker.deviceid == deviceid && this.mapInfoWindow.isOpen()) {
                        // console.log('shuju --change2')
                        var windowInfo = document.getElementById('windowInfo');
                        if (windowInfo != null) {
                            var address = this.getDevAddress(track);
                            var content = utils.getWindowContent(track, address);
                            windowInfo.innerHTML = content;
                        } else {
                            this.openInfoWindow(marker, deviceid);
                        }
                    } else {
                        // if (marker.deviceid == deviceid) {
                        //     if (this.mapInfoWindow) {
                        //         console.log("this.mapInfoWindow.isOpen()2:", this.mapInfoWindow.isOpen());
                        //     } else {
                        //         console.log("this.mapInfoWindow:2", this.mapInfoWindow);
                        //     }
                        //     console.log("marker.deviceid == deviceid:2", deviceid);
                        // }
                    }
                };

            } else {
                var myIcon = this.getIcon(track);
                var point = new BMap.Point(track.b_lon, track.b_lat);
                var marker = new BMap.Marker(point, { icon: myIcon, rotation: track.course });
                this.addMarkerEvent(marker);
                var label = this.getCarLabel(track);
                marker.deviceid = track.deviceid;
                marker.setLabel(label);
                this.markerClusterer.addMarker(marker);
                this.markerHashMap[key] = marker;
            }


        }
    }
}

BMapClass.pt.updateMarkersState = function(deviceid) {
    var markers = this.markerClusterer.getMarkers();
    for (var i = 0; i < markers.length; i++) {
        var marker = markers[i];
        var track = this.lastTracks[marker.deviceid];
        if (track) {
            var newPoint = new BMap.Point(track.b_lon, track.b_lat);
            var isEq = marker.point.equals(newPoint);
            var myIcon = this.getIcon(track);
            marker.setIcon(myIcon);
            marker.setRotation(track.course);
            if (!isEq) {
                marker.setPosition(newPoint);
                if (this.mapInfoWindow && marker.deviceid == deviceid && this.mapInfoWindow.isOpen()) {
                    this.openInfoWindow(marker, deviceid);
                };
            } else {
                if (this.mapInfoWindow && marker.deviceid == deviceid && this.mapInfoWindow.isOpen()) {
                    var address = this.getDevAddress(track);
                    var content = utils.getWindowContent(track, address);
                    $("#windowInfo").html(content);
                };
            };
        }
    }
}

BMapClass.pt.updateSingleMarkerState = function(deviceid) {
    var markers = this.markerClusterer.getMarkers();
    for (var i = 0; i < markers.length; i++) {
        var marker = markers[i];
        if (marker.deviceid == deviceid) {
            var track = this.lastTracks[marker.deviceid];
            var newPoint = new BMap.Point(track.b_lon, track.b_lat);
            var isEq = marker.point.equals(newPoint);
            var myIcon = this.getIcon(track);
            marker.setIcon(myIcon);
            marker.setRotation(track.course);
            if (isEq) {
                if (this.mapInfoWindow && this.mapInfoWindow.isOpen()) {
                    var address = this.getDevAddress(track);
                    var content = utils.getWindowContent(track, address);
                    $("#windowInfo").html(content);
                };
            } else {
                marker.setPosition(newPoint);
                if (this.mapInfoWindow && this.mapInfoWindow.isOpen()) {
                    this.openInfoWindow(marker, deviceid);
                };
            }
            break;
        }
    }
}

BMapClass.pt.qeuryBMapAreaPoint = function(areaName, callback) {
    var myBoundary = new BMap.Boundary(),
        me = this;
    myBoundary.get(areaName.join(','), function(resp) {
        var points = utils.getWgs84Boundaries(resp.boundaries, false);
        var bdpoints = [];
        points.forEach(function(item) {
            bdpoints.push(new BMap.Point(Number(item.lon), Number(item.lat)));
        });

        me.redrawAreaAndViewPortCenter(bdpoints);

        callback && callback(bdpoints);
    });
};



BMapClass.pt.redrawAreaAndViewPortCenter = function(bdpoints) {
    this.removePolygonOverlay();
    var styleOptions = {
        strokeColor: "red", //边线颜色。  
        fillColor: "", //填充颜色。当参数为空时，圆形将没有填充效果。  
        strokeWeight: 3, //边线的宽度，以像素为单位。  
        strokeOpacity: 0.8, //边线透明度，取值范围0 - 1。  
        // fillOpacity: 0, //填充的透明度，取值范围0 - 1。  
        strokeStyle: 'solid' //边线的样式，solid或dashed。  
    }
    this.polygon = new BMap.Polygon(bdpoints, styleOptions);
    this.mapInstance.addOverlay(this.polygon);
    this.setViewPortCenter(bdpoints);

}
BMapClass.pt.removePolygonOverlay = function() {
    if (this.polygon != null) {
        this.mapInstance.removeOverlay(this.polygon);
    };

}

BMapClass.pt.setViewPortCenter = function(lines) {
    var view = this.mapInstance.getViewport(eval(lines));
    var mapZoom = view.zoom;
    var centerPoint = view.center;
    this.mapInstance.centerAndZoom(centerPoint, mapZoom);
};