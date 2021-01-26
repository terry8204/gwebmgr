var deviceLastPositionProto = {
    "options": {
        "java_package": "com.minigps.proto",
        "java_outer_classname": "PositionLastOut"
    },
    "nested": {
        "proto": {
            "nested": {
                "RespDeviceLastPositionProto": {
                    "fields": {
                        "status": {
                            "type": "int32",
                            "id": 1
                        },
                        "cause": {
                            "type": "string",
                            "id": 2
                        },
			            "lastquerypositiontime": {
			              "type": "sint64",
			              "id": 3
			            },
                        "records": {
                            "rule": "repeated",
                            "type": "PositionLastProto",
                            "id": 4
                        }
                    }
                },
                "PositionLastProto": {
                    "fields": {
                        "deviceid": {
                            "type": "string",
                            "id": 1
                        },
                        "updatetime": {
                            "type": "sint64",
                            "id": 2
                        },
                        "validpoistiontime": {
                            "type": "sint64",
                            "id": 3
                        },
                        "callat": {
                            "type": "double",
                            "id": 4
                        },
                        "callon": {
                            "type": "double",
                            "id": 5
                        },
                        "radius": {
                            "type": "double",
                            "id": 6
                        },
                        "speed": {
                            "type": "double",
                            "id": 7
                        },
                        "altitude": {
                            "type": "double",
                            "id": 8
                        },
                        "course": {
                            "type": "sint32",
                            "id": 9
                        },
                        "mileage": {
                            "type": "sint32",
                            "id": 10
                        },
                        "totaldistance": {
                            "type": "sint32",
                            "id": 11
                        },
                        "totaloil": {
                            "type": "sint32",
                            "id": 12
                        },
                        "auxoil": {
                            "type": "sint32",
                            "id": 13
                        },
                        "status": {
                            "type": "sint64",
                            "id": 14
                        },
                        "alarm": {
                            "type": "sint64",
                            "id": 15
                        },
                        "stralarm": {
                            "type": "string",
                            "id": 16
                        },
                        "stralarmen": {
                            "type": "string",
                            "id": 17
                        },
                        "strstatus": {
                            "type": "string",
                            "id": 18
                        },
                        "strstatusen": {
                            "type": "string",
                            "id": 19
                        },
                        "videoalarm": {
                            "type": "sint64",
                            "id": 20
                        },
                        "videosignalloststatus": {
                            "type": "sint64",
                            "id": 21
                        },
                        "videosignalcoverstatus": {
                            "type": "sint64",
                            "id": 22
                        },
                        "videostoragecellfaultstatus": {
                            "type": "sint64",
                            "id": 23
                        },
                        "videobehavior": {
                            "type": "sint64",
                            "id": 24
                        },
                        "videofatiguedegree": {
                            "type": "sint64",
                            "id": 25
                        },
                        "strvideoalarm": {
                            "type": "string",
                            "id": 26
                        },
                        "strvideoalarmen": {
                            "type": "string",
                            "id": 27
                        },
                        "gotsrc": {
                            "type": "string",
                            "id": 28
                        },
                        "rxlevel": {
                            "type": "sint32",
                            "id": 29
                        },
                        "gpstotalnum": {
                            "type": "sint32",
                            "id": 30
                        },
                        "gpsvalidnum": {
                            "type": "sint32",
                            "id": 31
                        },
                        "exvoltage": {
                            "type": "double",
                            "id": 32
                        },
                        "voltagev": {
                            "type": "double",
                            "id": 33
                        },
                        "voltagepercent": {
                            "type": "sint32",
                            "id": 34
                        },
                        "reportmode": {
                            "type": "sint32",
                            "id": 35
                        },
                        "moving": {
                            "type": "sint32",
                            "id": 36
                        },
                        "parklat": {
                            "type": "double",
                            "id": 37
                        },
                        "parklon": {
                            "type": "double",
                            "id": 38
                        },
                        "parktime": {
                            "type": "sint64",
                            "id": 39
                        },
                        "parkduration": {
                            "type": "sint64",
                            "id": 40
                        },
                        "temp1": {
                            "type": "sint32",
                            "id": 41
                        },
                        "temp2": {
                            "type": "sint32",
                            "id": 42
                        },
                        "temp3": {
                            "type": "sint32",
                            "id": 43
                        },
                        "temp4": {
                            "type": "sint32",
                            "id": 44
                        },
                        "humi1": {
                            "type": "sint32",
                            "id": 45
                        },
                        "iostatus": {
                            "type": "sint32",
                            "id": 46
                        },
                        "currentoverspeedstate": {
                            "type": "sint32",
                            "id": 47
                        },
                        "srcad0": {
                            "type": "sint32",
                            "id": 48
                        },
                        "srcad1": {
                            "type": "sint32",
                            "id": 49
                        },
                        "loadstatus": {
                            "type": "sint32",
                            "id": 50
                        },
                        "weight": {
                            "type": "sint64",
                            "id": 51
                        },
                        "srcweightad0": {
                            "type": "sint32",
                            "id": 52
                        },
                        "humi2": {
                            "type": "sint32",
                            "id": 53
                        },
                    }
                }
            }
        }
    }
};