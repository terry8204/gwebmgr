var markerHashMap = null;
function OpenStreeMapCls () {
    this.mapInstance = null;
    this.markerClusterer = null;
    this.lastTracks = null;
    this.layerVector = null; //地图窗口 
    this.circleList = [];
    this.markerHashMap = {};
    this.popup = null;
    this.initMap();
    this.initWindow();
}

OpenStreeMapCls.pt = OpenStreeMapCls.prototype;


OpenStreeMapCls.pt.getIcon = function (track) {

    var isOnline = utils.getIsOnline(track);

    // var img = isOnline ? '../gpsserver/images/carstate/a_green_0.png' : '../gpsserver/images/carstate/';
    var pathname = location.pathname
    var imgPath = '';
    if (pathname.indexOf('gpsserver') != -1) {
        if (track.moving == 0) {
            imgPath = myUrls.host + 'images/carstate/' + (isOnline ? 'a_red' : 'a_gray') + '_0.png';
        } else {
            imgPath = myUrls.host + 'images/carstate/' + (isOnline ? 'a_green' : 'a_gray') + '_0.png';
        }
    } else {
        if (track.moving == 0) {
            imgPath = '../images/carstate/' + (isOnline ? 'a_red' : 'a_gray') + '_0.png';
        } else {
            imgPath = '../images/carstate/' + (isOnline ? 'a_green' : 'a_gray') + '_0.png';
        }
    };
    return new ol.style.Style({
        image: new ol.style.Icon(/** @type {module:ol/style/Icon~Options} */({
            // anchor: [05, 0.5],
            crossOrigin: 'anonymous',
            src: imgPath,
            rotation: track.course * Math.PI / 180,//角度转化为弧度
            imgSize: [32, 32]
        })),
        text: new ol.style.Text({
            text: track.devicename,
            fill: new ol.style.Fill({
                color: '#ffffff'
            }),
            backgroundFill: new ol.style.Fill({
                color: '#0083A5'
            }),
            padding: [5, 5, 5, 5],
            offsetX: 5,
            offsetY: 35
        })
    });
};


OpenStreeMapCls.pt.setMarkerClusterer = function (lastTracks) {

    this.lastTracks = lastTracks;
    if (this.markerClusterer == null) {
        var features = [], iconFeature;

        for (var key in lastTracks) {
            var track = lastTracks[key];
            iconFeature = this.createMarkr(track);
            iconFeature.deviceid = key;
            this.markerHashMap[key] = iconFeature;
            features.push(iconFeature);
        }

        // var e = 4500000;
        // for (var i = 0; i < 100; ++i) {
        //     var coordinates = [2 * e * Math.random() - e, 2 * e * Math.random() - e];
        //     iconFeature = this.createMarkr({
        //         callon: coordinates[0],
        //         callat: coordinates[1],
        //         updatetime: Date.now(),
        //         course: i
        //     })
        //     features.push(iconFeature);
        // }

        this.layerVector = new ol.layer.Vector({
            source: new ol.source.Vector({
                features: features
            }),
            style: function (feature) {
                return feature.get('style');
            },
            updateWhileInteracting: true
        });
        this.mapInstance.addLayer(this.layerVector);
        this.addMarkerClickEvent();
    }
};

OpenStreeMapCls.pt.addMarkerClickEvent = function () {
    var map = this.mapInstance, me = this;
    this.mapInstance.on('click', function (evt) {
        var feature = map.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
            return feature;
        });

        if (feature && feature.deviceid) {
            document.getElementById('popup').style.display = 'block';
            var deviceid = feature.deviceid, track = me.lastTracks[deviceid];
            var wContainer = document.getElementById('popup-content'), posi = me.fromLonLat(track.callon, track.callat);
            wContainer.innerHTML = me.getInfoWindowContent(track);
            me.popup.setPosition(posi);
            me.mapInstance.getView().setCenter(posi);
            me.mapInstance.getView().setZoom(20);
            communicate.$emit("on-click-marker", deviceid);
        }
    })
}

OpenStreeMapCls.pt.createMarkr = function (track) {
    var tempPoint = ol.proj.fromLonLat([track.callon, track.callat]), iconFeature;
    iconFeature = new ol.Feature({
        geometry: new ol.geom.Point(tempPoint),
    });
    iconFeature.setStyle(this.getIcon(track));
    return iconFeature;
}

OpenStreeMapCls.pt.getInfoWindowContent = function (track) {
    var address = this.getDevAddress(track);
    return utils.getWindowContent(track, address);
}

OpenStreeMapCls.pt.getDevAddress = function (track) {
    var callon = track.callon.toFixed(5), callat = track.callat.toFixed(5), me = this;
    var address = LocalCacheMgr.getAddress(callon, callat);
    if (address) {
        return address;
    } else {
        utils.getJiuHuAddressSyn(callon, callat, function (respAddress) {
            if (respAddress.address) {
                var wContent = utils.getWindowContent(track, respAddress.address);
                document.getElementById('popup-content').innerHTML = wContent;
                LocalCacheMgr.setAddress(callon, callat, respAddress.address);
            }
        })
        return '正在解析地址...';
    }
}


OpenStreeMapCls.pt.onClickDevice = function (deviceid) {
    document.getElementById('popup').style.display = 'block';
    var track = this.lastTracks[deviceid], posi = this.fromLonLat(track.callon, track.callat);
    var wContainer = document.getElementById('popup-content');
    wContainer.innerHTML = this.getInfoWindowContent(track);
    this.popup.setPosition(posi);
    this.mapInstance.getView().setCenter(posi);
    this.mapInstance.getView().setZoom(20);
}



OpenStreeMapCls.pt.initWindow = function () {
    var me = this;
    var wContainer = document.getElementById('popup');
    var closeBtn = document.getElementById('popup-close');
    this.popup = new ol.Overlay({
        element: wContainer,
        autoPan: true,
        positioning: 'bottom-center',
        stopEvent: false,
        autoPanAnimation: {
            //动画持续时间
            duration: 250
        }
    });
    //将覆盖层添加到map中
    this.mapInstance.addOverlay(this.popup);

    closeBtn.onclick = function (e) {
        document.getElementById('popup').style.display = 'none';
    }
}





OpenStreeMapCls.pt.initMap = function () {
    document.getElementById('my-map').innerHTML = "<div id='popup' class='ol-popup'><div id='popup-close'>X</div><div id='popup-content'></div></div>";
    var projection = ol.proj.get('EPSG:4326');
    this.mapInstance = new ol.Map({
        target: 'my-map',
        projection: projection,
        layers: [new ol.layer.Tile({
            source: new ol.source.OSM()
        })],
        view: new ol.View({
            center: ol.proj.fromLonLat([108.0017245, 35.926895]),
            zoom: 4,
            minZoom: 3,
            maxZoom: 20
        }),
    });
}

OpenStreeMapCls.pt.fromLonLat = function (lon, lat) {
    return ol.proj.fromLonLat([lon, lat]);
}

OpenStreeMapCls.pt.updateLastTracks = function (lastTracks) {
    this.lastTracks = lastTracks;
    var newMarkers = [];
    for (var key in this.lastTracks) {
        if (this.lastTracks.hasOwnProperty(key)) {
            var isHas = false;
            var track = this.lastTracks[key];
            track.online = utils.getIsOnline(track);
            if (this.markerHashMap[key]) {
                isHas = true;
            }
            if (!isHas) {
                var marker = this.createMarkr(track);
                this.markerHashMap[track.deviceid] = marker;
                newMarkers.push(marker);
            }
        }
    }
    if (newMarkers.length) {
        var layerVectorSource = Object.values(this.markerHashMap);
        this.layerVector.setSource(layerVectorSource);
    }
}

OpenStreeMapCls.pt.updateMarkersState = function (currentDeviceId) {
    for (var key in this.markerHashMap) {
        var track = this.lastTracks[key];
        var marker = this.markerHashMap[key];
        marker.setStyle(this.getIcon(track));
        marker.setGeometry(new ol.geom.Point(this.fromLonLat(track.callon, track.callat)));
        if (currentDeviceId && key === currentDeviceId && document.getElementById('popup').style.display === 'block') {
            var track = this.lastTracks[currentDeviceId];
            if (track) {
                var wContainer = document.getElementById('popup-content'), posi = this.fromLonLat(track.callon, track.callat);
                wContainer.innerHTML = this.getInfoWindowContent(track);
                this.popup.setPosition(posi);
                // this.mapInstance.getView().setCenter(posi);
            }
        }
    }
}