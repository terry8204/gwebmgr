(function(win) {
    "use strict";

    //定义一些常量
    var x_PI = 3.14159265358979324 * 3000.0 / 180.0;
    var PI = 3.1415926535897932384626;
    var a = 6378245.0;
    var ee = 0.00669342162296594323;
    //https://github.com/zcsoft/ZCChinaLocation
    var regionRectangle = [
        { la1: 49.220400, lo1: 79.446200, la2: 42.889900, lo2: 96.330000 },
        { la1: 54.141500, lo1: 109.687200, la2: 39.374200, lo2: 135.000200 },
        { la1: 42.889900, lo1: 73.124600, la2: 29.529700, lo2: 124.143255 },
        { la1: 29.529700, lo1: 82.968400, la2: 26.718600, lo2: 97.035200 },
        { la1: 29.529700, lo1: 97.025300, la2: 20.414096, lo2: 124.367395 },
        { la1: 20.414096, lo1: 107.975793, la2: 17.871542, lo2: 111.744104 },
    ]; //范围矩形列表
    var excludeRectangle = [
        { la1: 22.284000, lo1: 101.865200, la2: 20.098800, lo2: 106.665000 },
        { la1: 21.542200, lo1: 106.452500, la2: 20.487800, lo2: 108.051000 },
        { la1: 55.817500, lo1: 109.032300, la2: 50.325700, lo2: 119.127000 },
        { la1: 55.817500, lo1: 127.456800, la2: 49.557400, lo2: 137.022700 },
        { la1: 44.892200, lo1: 131.266200, la2: 42.569200, lo2: 137.022700 },
    ]; //范围内排除的矩形列表
    //百度地图计算台湾不需要纠偏 Google 和 高德计算台湾需要纠偏
    var TaiWanRect = { la1: 25.398623, lo1: 119.921265, la2: 21.785006, lo2: 122.497559 };
    var excludeRectangleInCludeTaiWan = [
        TaiWanRect,
        { la1: 22.284000, lo1: 101.865200, la2: 20.098800, lo2: 106.665000 },
        { la1: 21.542200, lo1: 106.452500, la2: 20.487800, lo2: 108.051000 },
        { la1: 55.817500, lo1: 109.032300, la2: 50.325700, lo2: 119.127000 },
        { la1: 55.817500, lo1: 127.456800, la2: 49.557400, lo2: 137.022700 },
        { la1: 44.892200, lo1: 131.266200, la2: 42.569200, lo2: 137.022700 },
    ]; //范围内排除的矩形列表
    function InRectangle(rect, stdlat, stdlon) {
        var result = false;
        if (stdlat > rect.la2 && stdlat < rect.la1) {
            if (stdlon > rect.lo1 && stdlon < rect.lo2) {
                result = true;
            }
        }
        return result;
    }
    /**
     * 百度坐标系 (BD-09) 与 火星坐标系 (GCJ-02)的转换
     * 即 百度 转 谷歌、高德
     * @param bd_lon
     * @param bd_lat
     * @returns {*[]}
     */
    function bd09togcj02(bd_lon, bd_lat) {
        var x_pi = 3.14159265358979324 * 3000.0 / 180.0;
        var x = bd_lon - 0.0065;
        var y = bd_lat - 0.006;
        var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * x_pi);
        var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * x_pi);
        var gg_lng = z * Math.cos(theta);
        var gg_lat = z * Math.sin(theta);
        return [gg_lng, gg_lat]
    }
    /**
     * 火星坐标系 (GCJ-02) 与百度坐标系 (BD-09) 的转换
     * 即谷歌、高德 转 百度
     * @param lng
     * @param lat
     * @returns {*[]}
     */
    function gcj02tobd09(lng, lat) {
        if (out_of_china(lng, lat, true)) {
            return [lng, lat]
        } else {
            var z = Math.sqrt(lng * lng + lat * lat) + 0.00002 * Math.sin(lat * x_PI);
            var theta = Math.atan2(lat, lng) + 0.000003 * Math.cos(lng * x_PI);
            var bd_lng = z * Math.cos(theta) + 0.0065;
            var bd_lat = z * Math.sin(theta) + 0.006;
            return [bd_lng, bd_lat]
        }
    }
    /**
     * WGS84转GCj02
     * @param lng
     * @param lat
     * @returns {*[]}
     */
    function wgs84togcj02(lng, lat) {
        if (out_of_china(lng, lat, false)) {
            return [lng, lat]
        } else {
            var dlat = transformlat(lng - 105.0, lat - 35.0);
            var dlng = transformlng(lng - 105.0, lat - 35.0);
            var radlat = lat / 180.0 * PI;
            var magic = Math.sin(radlat);
            magic = 1 - ee * magic * magic;
            var sqrtmagic = Math.sqrt(magic);
            dlat = (dlat * 180.0) / ((a * (1 - ee)) / (magic * sqrtmagic) * PI);
            dlng = (dlng * 180.0) / (a / sqrtmagic * Math.cos(radlat) * PI);
            var mglat = lat + dlat;
            var mglng = lng + dlng;
            return [mglng, mglat]
        }
    }

    /**
     * GCJ02 转换为 WGS84
     * @param lng
     * @param lat
     * @returns {*[]}
     */
    function gcj02towgs84(lng, lat) {
        if (out_of_china(lng, lat, false)) {
            return [lng, lat]
        } else {
            var dlat = transformlat(lng - 105.0, lat - 35.0);
            var dlng = transformlng(lng - 105.0, lat - 35.0);
            var radlat = lat / 180.0 * PI;
            var magic = Math.sin(radlat);
            magic = 1 - ee * magic * magic;
            var sqrtmagic = Math.sqrt(magic);
            dlat = (dlat * 180.0) / ((a * (1 - ee)) / (magic * sqrtmagic) * PI);
            dlng = (dlng * 180.0) / (a / sqrtmagic * Math.cos(radlat) * PI);
            var mglat = lat + dlat;
            var mglng = lng + dlng;
            return [lng * 2 - mglng, lat * 2 - mglat]
        }
    }

    function transformlat(lng, lat) {
        var ret = -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat + 0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng));
        ret += (20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0 / 3.0;
        ret += (20.0 * Math.sin(lat * PI) + 40.0 * Math.sin(lat / 3.0 * PI)) * 2.0 / 3.0;
        ret += (160.0 * Math.sin(lat / 12.0 * PI) + 320 * Math.sin(lat * PI / 30.0)) * 2.0 / 3.0;
        return ret
    }

    function transformlng(lng, lat) {
        var ret = 300.0 + lng + 2.0 * lat + 0.1 * lng * lng + 0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng));
        ret += (20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0 / 3.0;
        ret += (20.0 * Math.sin(lng * PI) + 40.0 * Math.sin(lng / 3.0 * PI)) * 2.0 / 3.0;
        ret += (150.0 * Math.sin(lng / 12.0 * PI) + 300.0 * Math.sin(lng / 30.0 * PI)) * 2.0 / 3.0;
        return ret
    }
    /**
     * 判断是否在国内，不在国内则不做偏移
     * @param lng
     * @param lat
     * @returns {boolean}
     */
    function out_of_china(lng, lat, isBaiDuMap) {
        //return (lng < 72.004 || lng > 137.8347) || ((lat < 0.8293 || lat > 55.8271) || false);
        // return false;
        // debugger;
        // var result = false;
        // if (lng < 72.004 || lng > 137.8347) {
        //     result = true;
        // }
        // if (lat < 0.8293 || lat > 55.8271) {
        //     result = true;
        // }
        // return result;

        var realExcludeRectangle = excludeRectangle;
//        if (isBaiDuMap) {
//            realExcludeRectangle = excludeRectangleInCludeTaiWan;
//        }
        for (var i = 0; i < regionRectangle.length; i++) {
            if (InRectangle(regionRectangle[i], lat, lng)) {
                for (var j = 0; j < realExcludeRectangle.length; j++) {
                    if (InRectangle(realExcludeRectangle[j], lat, lng)) {
                        return true;
                    }
                }
                return false;
            }
        }
        return true;
    }


    /**
     * WGS84转GCj02
     * @param lng
     * @param lat
     * @returns {*[]}
     */
    function wgs84togcj02ForBaidu(lng, lat) {
        if (out_of_china(lng, lat, true)) {
            return [lng, lat]
        } else {
            var dlat = transformlat(lng - 105.0, lat - 35.0);
            var dlng = transformlng(lng - 105.0, lat - 35.0);
            var radlat = lat / 180.0 * PI;
            var magic = Math.sin(radlat);
            magic = 1 - ee * magic * magic;
            var sqrtmagic = Math.sqrt(magic);
            dlat = (dlat * 180.0) / ((a * (1 - ee)) / (magic * sqrtmagic) * PI);
            dlng = (dlng * 180.0) / (a / sqrtmagic * Math.cos(radlat) * PI);
            var mglat = lat + dlat;
            var mglng = lng + dlng;
            return [mglng, mglat]
        }
    }

    function wgs84tobd09(lng, lat) {
        var lng_lat_1 = wgs84togcj02ForBaidu(lng, lat);
        var lng_lat_2 = gcj02tobd09(lng_lat_1[0], lng_lat_1[1]);
        return lng_lat_2;
    }

    function bd09towgs84(lng, lat) {
        var lng_lat_1 = bd09togcj02(lng, lat);
        var lng_lat_2 = gcj02towgs84(lng_lat_1[0], lng_lat_1[1]);
        return lng_lat_2;
    }

    win.gcj02tobd09 = gcj02tobd09;
    win.bd09togcj02 = bd09togcj02;
    win.wgs84tobd09 = wgs84tobd09;
    win.bd09towgs84 = bd09towgs84;
    win.wgs84togcj02 = wgs84togcj02;
    win.gcj02towgs84 = gcj02towgs84;

    win.bdPointsToWgs84s = function(points) {
        var results = [];
        points.forEach(function(item) {
            var lon_lat = bd09towgs84(item.x, item.y);
            results.push({
                x: lon_lat[0],
                y: lon_lat[1],
            })
        });
        return results;
    };

    win.googlePointsToWgs84s = function(points) {
        var results = [];
        points.forEach(function(item) {
            var lon_lat = gcj02towgs84(item.x, item.y);
            results.push({
                x: lon_lat[0],
                y: lon_lat[1],
            })
        });
        return results;
    };

    win.wgs84sToBdPoints = function(points) {
        var results = [];
        points.forEach(function(item) {
            var lon_lat = wgs84tobd09(item.x, item.y);
            results.push({
                x: lon_lat[0],
                y: lon_lat[1],
            })
        });
        return results;
    };



    win.wgs84sToGooglePoints = function(points) {
        var results = [];
        points.forEach(function(item) {
            var lon_lat = wgs84togcj02(item.x, item.y);
            results.push({
                x: lon_lat[0],
                y: lon_lat[1],
            })
        });
        return results;
    };

})(this);