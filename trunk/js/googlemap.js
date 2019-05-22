function GoogleMap () {
    this.mapInstance = null;
    this.markerClusterer = null;
    this.lastTracks = null;
    this.mapInfoWindow = null; //地图窗口 
    this.circleList = [];
    this.markerHashMap = {};
    this.initMap();
}

GoogleMap.pt = GoogleMap.prototype;

GoogleMap.pt.initMap = function () {
    var center = new google.maps.LatLng(35.129163, 102.264435);
    this.mapInstance = new google.maps.Map(document.getElementById('my-map'), {
        zoom: 4,
        center: center,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    });
}

GoogleMap.pt.setMarkerClusterer = function (lastTracks) {
    this.lastTracks = lastTracks;
    if (this.markerClusterer == null) {
        var markers = this.getMarkers(lastTracks);
        var pathname = location.pathname;
        var imgPath = '';
        if (pathname.indexOf('gpsserver') != -1) {
            imgPath = myUrls.host + '/images/m';
        } else {
            imgPath = '/images/m';
        }

        this.markerClusterer = new GMarkerClusterer(this.mapInstance, markers, { imagePath: imgPath });
        this.markerClusterer.setMaxZoom(20);
    }
}

GoogleMap.pt.updateMarkerLabel = function (deviceid) {
    var marker = AMARKER = this.markerHashMap[deviceid];
    if (marker) {
        var track = this.lastTracks[deviceid];
        if (track) {
            marker.setOptions({ labelContent: track.devicename });
        }
    }
}


GoogleMap.pt.getMarkers = function (lastTracks) {
    var markers = [];
    for (var deviceid in lastTracks) {
        if (lastTracks.hasOwnProperty(deviceid)) {
            var track = lastTracks[deviceid];
            var myIcon = this.getIcon(track);
            var latLng = new google.maps.LatLng(track.g_lat, track.g_lon);
            var marker = new MarkerWithLabel({
                position: latLng,
                icon: myIcon,
                raiseOnDrag: true,
                map: this.mapInstance,
                labelContent: track.devicename,
                labelAnchor: new google.maps.Point(-10, 17),
                labelStyle: {
                    border: 0,
                    padding: "2px",
                    background: "#00A8D4",
                    color: "#fff"
                }
            });
            marker.deviceid = track.deviceid;
            markers.push(marker);
            this.markerHashMap[track.deviceid] = marker;
            this.addMarkerEvent(marker);
        }
    }
    return markers;
}


GoogleMap.pt.addMarkerEvent = function (marker) {
    var self = this;
    google.maps.event.addListener(marker, "click", function (e) {
        var deviceid = marker.deviceid;
        self.mapInstance.panTo(marker.position);
        self.openInfoWindow(marker, deviceid);
        communicate.$emit("on-click-marker", deviceid);
    });
}

GoogleMap.pt.openInfoWindow = function (marker, deviceid) {
    var track = this.lastTracks[deviceid];
    var address = this.getDevAddress(track);
    this.mapInfoWindow ? this.mapInfoWindow.close() : '';
    this.mapInfoWindow = this.getInfoWindow(track, address);
    this.mapInfoWindow.open(this.mapInstance, marker);
}


GoogleMap.pt.getIcon = function (track) {
    var pathname = location.pathname
    var imgPath = ''
    if (pathname.indexOf('gpsserver') != -1) {
        imgPath = myUrls.host + 'images/carstate';
    } else {
        imgPath = '../images/carstate';
    }
    if (track.online) {
        imgPath += '/green_' + utils.getAngle(track.course) + '.png';
    } else {
        imgPath += '/gray_' + utils.getAngle(track.course) + '.png';
    }
    return imgPath;
}


GoogleMap.pt.getDevAddress = function (track) {
    var self = this;
    var callon = track.callon.toFixed(5);
    var callat = track.callat.toFixed(5);
    var b_lon = track.b_lon;
    var b_lat = track.b_lat;
    var address = LocalCacheMgr.getAddress(callon, callat);
    if (address != null) {
        return address;
    };
    utils.getGoogleAddressSyn(track.g_lat, track.g_lon, function (b_address) {
        if (b_address.length) {
            var content = utils.getWindowContent(track, b_address);
            self.mapInfoWindow.setContent(content);
            LocalCacheMgr.setAddress(callon, callat, b_address);
        } else {
            utils.getJiuHuAddressSyn(callon, callat, function (resp) {
                var j_address = resp.address
                var content = utils.getWindowContent(track, j_address);
                self.mapInfoWindow.setContent(content);
                LocalCacheMgr.setAddress(callon, callat, j_address);
            });
        }
    });
    return '正在解析地址...';
}

GoogleMap.pt.getInfoWindow = function (track, address) {
    var content = utils.getWindowContent(track, address);
    var infoWindow = new google.maps.InfoWindow({ content: '<div id="windowInfo" style="width:360px;">' + content + '</div>' });
    return infoWindow;
}

GoogleMap.pt.onClickDevice = function (deviceid) {
    // var markers = this.markerClusterer.getMarkers();
    // for (var i = 0; i < markers.length; i++) {
    //     var marker = markers[i];
    //     if (marker.deviceid == deviceid) {
    //         this.mapInstance.getZoom() != 22 ? this.mapInstance.setZoom(22) : '';
    //         this.mapInstance.panTo(marker.position);
    //         this.openInfoWindow(marker, deviceid);
    //         break;
    //     }
    // }
    var marker = this.markerHashMap[deviceid];
    if (marker) {
        this.mapInstance.getZoom() != 22 ? this.mapInstance.setZoom(22) : '';
        this.mapInstance.panTo(marker.position);
        this.openInfoWindow(marker, deviceid);
    }
}

GoogleMap.pt.addMapFence = function (deviceid, distance) {
    var mks = this.markerClusterer.getMarkers();
    var point = null;
    for (var i = 0; i < mks.length; i++) {
        var mk = mks[i];
        if (deviceid == mk.deviceid) {
            point = mk.internalPosition;
            break;
        }
    };
    if (point) {
        var circle = new google.maps.Circle({
            map: this.mapInstance,
            radius: Number(distance),
            fillColor: '#AA0000',
            center: point
        });
        circle.deviceid = deviceid;
        this.circleList.push(circle);
    }
}

GoogleMap.pt.cancelFence = function (deviceid) {
    for (var i = 0; i < this.circleList.length; i++) {
        var mk = this.circleList[i];
        if (mk && mk.deviceid === deviceid) {
            mk.setMap(null);
            this.circleList.splice(i, 1, null);
        }
    }
}



GoogleMap.pt.updateLastTracks = function (lastTracks) {
    this.lastTracks = lastTracks;
    var markers = this.markerClusterer.getMarkers();
    for (var key in this.lastTracks) {
        var isHas = false;
        var track = this.lastTracks[key];
        track.online = utils.getIsOnline(track);

        if (this.markerHashMap[track.deviceid]) {
            isHas = true
        };
        if (!isHas) {
            var myIcon = this.getIcon(track);
            var latLng = new google.maps.LatLng(track.g_lat, track.g_lon);
            var marker = new MarkerWithLabel({
                position: latLng,
                icon: myIcon,
                raiseOnDrag: true,
                map: this.mapInstance,
                labelContent: track.devicename,
                labelAnchor: new google.maps.Point(-10, 17),
                labelStyle: {
                    border: 0,
                    padding: "2px",
                    background: "#00A8D4",
                    color: "#fff"
                }
            });
            marker.deviceid = track.deviceid;
            this.markerHashMap[track.deviceid] = marker;
            this.addMarkerEvent(marker);
            this.markerClusterer.addMarker(marker);
        }

    }
}

GoogleMap.pt.updateMarkersState = function (deviceid) {
    console.log('gl updateMarkersState');
    var markers = this.markerClusterer.getMarkers();
    for (var i = 0; i < markers.length; i++) {
        var marker = markers[i];
        var track = this.lastTracks[marker.deviceid];
        var latLng = new google.maps.LatLng(track.g_lat, track.g_lon);
        // var mPoint = marker.internalPosition;
        var myIcon = this.getIcon(track);
        marker.setPosition(latLng);
        marker.setIcon(myIcon);
        if (marker.deviceid == deviceid) {
            var address = this.getDevAddress(track);
            var content = utils.getWindowContent(track, address);
            $("#windowInfo").html(content);
        };
    }
}

GoogleMap.pt.updateSingleMarkerState = function (deviceid) {
    var markers = this.markerClusterer.getMarkers();
    for (var i = 0; i < markers.length; i++) {
        var marker = markers[i];
        if (marker.deviceid == deviceid) {
            var track = this.lastTracks[marker.deviceid];
            var latLng = new google.maps.LatLng(track.g_lat, track.g_lon);
            var myIcon = this.getIcon(track);
            marker.setPosition(latLng);
            marker.setIcon(myIcon);
            var address = this.getDevAddress(track);
            var content = utils.getWindowContent(track, address);
            $("#windowInfo").html(content);
            break;
        }
    }
}