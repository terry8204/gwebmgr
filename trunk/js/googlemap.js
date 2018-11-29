function GoogleMap () {
    this.mapInstance = null;
    this.markerClusterer = null;
    this.lastTracks = null;
    this.mapInfoWindow = null; //地图窗口 
    this.initMap();
}

GoogleMap.pt = GoogleMap.prototype;

GoogleMap.pt.initMap = function () {
    var center = new google.maps.LatLng(24.129163, 113.264435);

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
        var pathname = location.pathname
        var imgPath = ''
        if (pathname.indexOf('gpsserver') != -1) {
            imgPath = myUrls.host + '/images/m';
        } else {
            imgPath = '/images/m';
        }
        console.log('imgPath', imgPath);
        this.markerClusterer = new GMarkerClusterer(this.mapInstance, markers, { imagePath: imgPath });
    }
}

GoogleMap.pt.getMarkers = function (lastTracks) {
    var markers = [];
    for (var deviceid in lastTracks) {
        if (lastTracks.hasOwnProperty(deviceid)) {
            var track = lastTracks[deviceid];
            var myIcon = this.getIcon(track);
            var latLng = new google.maps.LatLng(track.g_lat, track.g_lon);
            // var marker = new google.maps.Marker({
            //     position: latLng,
            //     icon: myIcon,
            // });

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
            // marker.setLabel(label);
            markers.push(marker);
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
        imgPath = myUrls.host + 'images/carstate'
    } else {
        imgPath = '../images/carstate'
    }
    if (track.online) {
        imgPath += '/green_0.png'
    } else {
        imgPath += '/gray_0.png'
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
    utils.getBaiduAddressFromBaidu(b_lon, b_lat, function (b_address) {
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
    var infoWindow = new google.maps.InfoWindow({ content: '<div id="windowInfo" style="width:320px;">' + content + '</div>' });
    return infoWindow;
}

GoogleMap.pt.onClickDevice = function (deviceid) {
    var markers = this.markerClusterer.getMarkers();
    for (var i = 0; i < markers.length; i++) {
        var marker = markers[i];
        if (marker.deviceid == deviceid) {
            this.mapInstance.getZoom() != 22 ? this.mapInstance.setZoom(22) : '';
            this.mapInstance.panTo(marker.position);
            this.openInfoWindow(marker, deviceid);
            break;
        }
    }
}

GoogleMap.pt.updateLastTracks = function (lastTracks) {
    this.lastTracks = lastTracks;
}

GoogleMap.pt.updateMarkersState = function (deviceid) {
    var markers = this.markerClusterer.getMarkers();
    for (var i = 0; i < markers.length; i++) {
        var marker = markers[i];
        var track = this.lastTracks[marker.deviceid];
        var latLng = new google.maps.LatLng(track.g_lat, track.g_lon);
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