var monitorListProtoJson = {
    "options": {
        "java_package": "com.minigps.proto",
        "java_outer_classname": "RespMonitorRecordOut"
    },
    "nested": {
        "proto": {
            "nested": {
                "RespMonitorDeviceListProto": {
                    "fields": {
                        "status": {
                            "type": "int32",
                            "id": 1
                        },
                        "cause": {
                            "type": "string",
                            "id": 2
                        },
                        "groups": {
                            "rule": "repeated",
                            "type": "RespMonitorDeviceListGroupProto",
                            "id": 3
                        }
                    }
                },
                "RespMonitorDeviceListGroupProto": {
                    "fields": {
                        "groupid": {
                            "type": "int32",
                            "id": 1
                        },
                        "groupname": {
                            "type": "string",
                            "id": 2
                        },
                        "remark": {
                            "type": "string",
                            "id": 3
                        },
                        "devices": {
                            "rule": "repeated",
                            "type": "RespMonitorRecordProto",
                            "id": 4
                        }
                    }
                },
                "RespMonitorRecordProto": {
                    "fields": {
                        "deviceid": {
                            "type": "string",
                            "id": 1
                        },
                        "devicename": {
                            "type": "string",
                            "id": 2
                        },
                        "devicetype": {
                            "type": "sint32",
                            "id": 3
                        },
                        "simnum": {
                            "type": "string",
                            "id": 4
                        },
                        "expirenotifytime": {
                            "type": "sint64",
                            "id": 5
                        },
                        "remark": {
                            "type": "string",
                            "id": 6
                        },
                        "creater": {
                            "type": "string",
                            "id": 7
                        },
                        "videochannelcount": {
                            "type": "sint32",
                            "id": 8
                        },
                        "lastactivetime": {
                            "type": "sint64",
                            "id": 9
                        },
                        "isfree": {
                            "type": "sint32",
                            "id": 10
                        },
                        "allowedit": {
                            "type": "sint32",
                            "id": 11
                        },
                        "stared": {
                            "type": "sint32",
                            "id": 12
                        }
                    }
                }
            }
        }
    }
}