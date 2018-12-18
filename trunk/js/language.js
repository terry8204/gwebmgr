/**
 *  use  
 *  {{ $t("message.hello") }}
 *   this.$i18n.locale='zh'
 */
(function (win) {
    Vue.use(VueI18n);
    var messages = {
        en: {
            message: {
                changeSucc: "Modified success",
                changeFail: "Modification failed",
                deleteSucc: "Deleted success",
                deleteFail: "Deleted fail",
                addSucc: "Add success",
                addFail: "Add fail",
                confirmDel: "Are you sure you want to delete it?",
                selectCustomersTip: "Please select your customers",
                fillGroupNameTip: "Fill in the group name",
                pwdRule: "Password less than 6 bits",
                usernameRule: "User names are composed of 4 to 32 digits of numbers and letters.",
                fullComplete: "Please complete the form.",
                fullDevName: "Please fill in the name of the equipment.",
                userExists: "The user already exists",
                resetPwdTips: "Password reset to:123456",
                plSelectTime: "Please choose the time",
            },
            login: {
                title: "Location information service platform",
                chinese: "Chinese",
                english: "英文",
                companyLogin: "Enterprice",
                deviceLogin: "Device",
                pememberPwd: "Remember password",
                logining: "Login",
                inputUsername: "Please enter your account number.",
                inputDeviceNumber: "Please enter the device number.",
                inputPassword: "Please input a password",
                wechatApplet: "Wechat applet",
                step1: "1.Search for gps51 applet",
                step2: "2.Or scan QR Code",
                step3: "3.For iPhone/Android",
                error_1: "Incorrect account format",
                error_2: "Incorrect password format",
                error_3: "Login failed",
                error_4: "Error in account or password",
                error_5: "No landing",
                error_6: "Account expired",
            },
            header: {
                monitor: "Monitor",
                reportForm: "Report",
                bgManager: "Management",
                systemParam: "System Params",
                hello: "Hello",
                changePwd: "Change Password",
                setting: "Setup",
                logout: "Logout",
                showCustomer: "Show customer name",
                setIntaival: "Refresh interval (min 5s)",
                oldPwd: "Old password",
                newPwd: "New password",
                confirmPwd: "Check password",
                submit: "Submit",
                changePwdSucc: "Successful password modification",
                error_1: "Password must not be less than four digits",
                error_2: "Password cannot be empty",
                error_3: "Two password inconsistencies",
                error_4: "Old password error",
            },
            alarm: {
                message: "Message",
                alarmMsg: "Alarm message",
                devMsg: "Device message",
                filterAlarmType: "Type of filter alarm",
                open: "open",
                max: "Maximization",
                min: "minimize",
                changeWin: "switch windows",
                filterAlarmTitle: "Filter alarm",
                releaseAlarmTitle: "Release alarm",
                errorNeedParams: "All parameters are mandatory",
                successfulRelease: "Successful release",
                devName: "Device Name",
                devNum: "Device Number",
                alarmTime: "Alarm Date",
                alarmCount: "Alarm Count",
                isDispose: "Dispose",
                action: "Action",
                alarmDispose: "Alarm Dispose",
                overdueTime: "Overdue Date",
                isOverdue: "Overdue"
            },
            monitor: {
                devGroup: "Devices",
                defaultGroup: "Default group",
                defaultCustomer: "Default customer",
                all: "All",
                online: "Online",
                offline: "Offline",
                placeholder: "Enter device name",
                edit: "Edit",
                track: "Track",
                following: "Stalker",
                more: "More",
                deviceCmd: "device cmd",
                siteProtection: "Site protection",
                fortify: "Fortify",
                cancel: "Cancel",
                cmdRecord: "Cmd record",
                recordForm: "Record form",
                devBaseInfo: "Basic Information",
                refreshAfter: "s after refresh",
                ranging: "Ranging",
                tools: "Tools",
                editDev: "Edit Device",
                phoneNumber: "Phone Number",
                remarks: "Remarks",
                confirm: "Confirm",
                customer: "Customer",
                groupName: "Group Name",
                devNumber: "Device Number",
                devName: "Device Name",
                factoryNum: "Factory Number",
                clientType: "Client Type",
                expireTime: "Expire Date",
                close: "Close",
                settingFence: "Setting up electronic fence",
                range: "range(m)",
                toSendCmd: "To send instructions",
                directivesSent: "Directives sent",
                settingFail: "Setup failed",
                noTrackError: "No track, no defence",
                rangeNumErr: "Range must be a number",
                queryCmdRecordErr: "Query instruction record failed",
                cancelFenceSucc: "Successful withdrawal",
                sendSucc: "Successful development",
                pwdErr: "Password error",
                sendCmdAbnormal: "Exceptions to issuing instructions",
                sendCmdNoCache: "The device is offline and instructions are not cached",
                sendCmdAlreadyCache: "The device is offline and the instructions are cached",
                changePwdSendCmd: "Send instructions after modifying the default password",
                noRecordTrack: 'The device did not report location information',
                reLogin: "Please re-login and automatically jump to the login page in 2 seconds",
                devNameMust: "Device name is mandatory",
            },
            reportForm: {
                index: "index",
                drivingReport: "Driving Report",
                cmdReport: "Directive Report",
                posiReport: "Position Report",
                mileageReport: "Mileage Report",
                mileage: "Mileage",
                reportmileagesummary: "Mileage Summary",
                reportmileagedetail: "Mileage Detail",
                warningReport: "Alarm Report",
                allAlarm: "All Alarm",
                selectTime: "Selection time",
                selectDev: "Selection Car ",
                toDay: "Today",
                yesterDay: "Yester day",
                threeDays: "Nearly three days",
                sevenDays: "Last seven days",
                query: "Query",
                intervalTime: "Interval time (minutes)",
                selectDevTip: "Please select equipment",
                noRecord: "No record",
                sendDate: "Send date",
                content: "Content",
                sendResult: "Result",
                lon: "Lon",
                lat: "Lat",
                direction: "Direction",
                speed: "Speed",
                date: "Date",
                status: "Status",
                posiType: "Positon Type",
                address: "Address",
                AddressDetails: "Details",
                getAddress: "Get Address",
                seePosi: "See position",
                startAlarmDate: "Start date",
                lastAlarmDate: "Last date",
                alarmInfo: "Alarm info",
                alarmCount: "Alarm count",
                isDispose: "Dispose",
                disposePerson: "Person",
                untreated: "Untreated",
                handled: "Handled",
            },
            bgMgr: {
                customerMgr: "Customer Manager",
                addCustomer: "Add Customer",
                queryCustomer: "Query Customer",
                groupMgr: "Group Manager",
                addGroup: "Add Group",
                queryGroup: "Query Group",
                userMgr: "User Manager",
                addUser: "Add User",
                queryUser: "Query User",
                devMgr: "Device Manager",
                addDev: "Add Device",
                queryDev: "Query Device",
                submit: "Submit",
                reset: "Reset",
                back: "Back",
                delete: "Delete",
                edit: "Edit",
                action: "Action"
            },
            customer: {
                kehuName: "Customer name",
                editCustomer: "Edit Customer",
                customerName: "Customer Name",
                organization: "Organization",
                registerDate: "Register Date",
                legalPerson: "Legal Person",
                contacts: "Contacts",
                contactNumber: "Contact Number",
                phoneNumber: "Phone Number",
                aptitude: "Aptitude",
                personNumber: "Person Number",
                officeAddress: "Office Address",
                registerAddress: "Register Address",
                remark: "Remark",
            },
            group: {
                editGroup: "Edit Group",
                groupName: "Group Name",
                groupNameTip: "Not more than 50 words",
                mintime: "Min reporting time",
                maxtime: "Max reporting time",
                mintimeTip: "Shortest interval",
                maxtimeTip: "Longest interval",
                userCount: "User count",
                userCountTip: "Quantity to be included",
                devCount: "Device count",
                devCountTip: "Number of equipment included",
                addMonitors: "Adding monitors",
                noMonitors: "There is no monitor user yet. Please add it first.",
                monitors: "Monitors"
            },
            user: {
                allDev: "All Device",
                editUser: "Edit User",
                userInfo: "User Information",
                userAuthority: "User Authority",
                username: "Username",
                password: "Password",
                checkPwd: "Password Check",
                deadline: "Deadline",
                userType: "User Type",
                client: "Client",
                grouping: "Grouping",
                simultaneousLogin: "Simultaneous login",
                phoneLogin: "Phone login",
                wxLogin: "WeChat login",
                groupCount: "Group number",
                add: "Add",
                devType: "Device type",
                cmdName: "Cmd name",
                cmdPwd: "Cmd password",
                save: "Save",
                allow: "Allow",
                ban: "Ban",
                createTime: "Create date",
                resetPwd: "Reset Pwd"
            },
            device: {
                editDev: "Edit Device",
                loginPwd: "Login Pwd",
                pwdTips: "Default device number after four digits",
                reportCount: "Report count",
                allReportCount: "all report count",
                allowLogin: "Allow login",
                isUse: "Is use",
                devIdTips: "The serial number of the device must be between 11 and 15 bits."
            }
        },
        //简体中文
        zh: {
            message: {
                changeSucc: "修改成功",
                changeFail: "修改失败",
                addSucc: "添加成功",
                addFail: "添加失败",
                deleteSucc: "删除成功",
                deleteFail: "删除失败",
                confirmDel: "确定要删除吗?",
                selectCustomersTip: "请选择所属客户",
                fillGroupNameTip: "填写分组名称",
                pwdRule: "密码小于6位",
                usernameRule: "用户名是4到32位的数字和字母组成的",
                fullComplete: "请填写完整",
                fullDevName: "请填写设备名称",
                userExists: "该用户已存在",
                resetPwdTips: "密码重置为:123456",
                plSelectTime: "请选择时间",
            },
            login: {
                title: "位置信息服务平台",
                chinese: "中文",
                english: "English",
                companyLogin: "企业登录",
                deviceLogin: "设备登录",
                pememberPwd: "记住密码",
                logining: "登录",
                inputUsername: "请输入账号",
                inputDeviceNumber: "请输入设备号",
                inputPassword: "请输入密码",
                wechatApplet: "微信小程序",
                step1: "1.在微信中搜索gps51小程序",
                step2: "2.或者直接扫描二维码",
                step3: "3.适用于iPhone/Android",
                error_1: "账号格式不对",
                error_2: "密码格式不对",
                error_3: "登录失败",
                error_4: "账号或密码错误",
                error_5: "禁止登陆",
                error_6: "账号过期",
            },
            header: {
                monitor: "定位监控",
                reportForm: "统计报表",
                bgManager: "后台管理",
                systemParam: "系统参数",
                hello: "您好",
                changePwd: "修改密码",
                setting: "设置",
                logout: "退出",
                showCustomer: "显示分组所属客户",
                setIntaival: "刷新间隔(最小5秒)",
                oldPwd: "旧密码",
                newPwd: "新密码",
                confirmPwd: "确认密码",
                submit: "提交",
                changePwdSucc: "密码修改成功",
                error_1: "密码不能小于四位",
                error_2: "密码不能为空",
                error_3: "2次密码不一致",
                error_4: "旧密码错误",
            },
            alarm: {
                message: "消息",
                alarmMsg: "报警消息",
                devMsg: "设备信息",
                filterAlarmType: "过滤报警类型",
                open: "展开",
                min: "最小化",
                max: "最大化",
                changeWin: "切换窗口",
                filterAlarmTitle: "过滤器报警",
                releaseAlarmTitle: "解除报警",
                errorNeedParams: "所有参数都是必填的",
                successfulRelease: "解除成功",
                devName: "设备名称",
                devNum: "设备序号",
                alarmTime: "报警时间",
                alarmCount: "报警次数",
                isDispose: "是否处理",
                action: "操作",
                alarmDispose: "报警处理",
                overdueTime: "过期时间",
                isOverdue: "是否过期"
            },
            monitor: {
                devGroup: "设备组",
                defaultGroup: "默认组",
                defaultCustomer: "默认客户",
                all: "全部",
                online: "在线",
                offline: "离线",
                placeholder: "输入设备名称",
                edit: "编辑",
                track: "轨迹",
                following: "跟踪",
                more: "更多",
                deviceCmd: "设备指令",
                siteProtection: "原地设防",
                fortify: "设防",
                cancel: "撤防",
                cmdRecord: "指令记录",
                recordForm: "统计报表",
                devBaseInfo: "设备基本信息",
                refreshAfter: "秒后刷新",
                ranging: "测距",
                tools: "工具",
                editDev: "编辑设备",
                phoneNumber: "手机号码",
                remarks: "备注",
                confirm: "确定",
                customer: "所属客户",
                groupName: "分组名称",
                devNumber: "设备序号",
                devName: "设备名称",
                factoryNum: "厂商编号",
                clientType: "终端型号",
                expireTime: "到期时间",
                close: "关闭",
                settingFence: "设置电子围栏",
                range: "范围(米)",
                toSendCmd: "待发送指令",
                directivesSent: "已发送指令",
                settingFail: "设置失败",
                noTrackError: "该设备没有轨迹,无法设防",
                rangeNumErr: "范围必须是数字",
                queryCmdRecordErr: "查询指令记录失败",
                cancelFenceSucc: "撤防成功",
                sendSucc: "下发成功",
                pwdErr: "密码错误",
                sendCmdAbnormal: "下发指令异常",
                sendCmdNoCache: "设备离线,指令没有缓存",
                sendCmdAlreadyCache: "设备离线,指令已经缓存",
                changePwdSendCmd: "请修改默认密码后再发送指令",
                noRecordTrack: '该设备没有上报位置信息',
                reLogin: "请重新登录,2秒后自动跳转登录页面",
                devNameMust: "设备名称是必填的",
            },
            reportForm: {
                index: "编号",
                drivingReport: "行驶报表",
                cmdReport: "命令报表",
                posiReport: "位置报表",
                mileageReport: "里程报表",
                mileage: "里程",
                reportmileagesummary: "里程总览",
                reportmileagedetail: "里程细节",
                warningReport: "报警报表",
                allAlarm: "全部报警",
                selectTime: "选择时间",
                selectDev: "选择车俩",
                toDay: "今天",
                yesterDay: "昨天",
                threeDays: "最近三天",
                sevenDays: "最近七天",
                query: "查询",
                intervalTime: "间隔时间(分)",
                selectDevTip: "请选择设备",
                noRecord: "没有记录",
                sendDate: "发送时间",
                content: "发送内容",
                sendResult: "发送结果",
                lon: "经度",
                lat: "纬度",
                direction: "方向",
                speed: "速度",
                date: "时间",
                status: "状态",
                posiType: "定位类型",
                address: "地址",
                AddressDetails: "位置明细",
                getAddress: "获取地址",
                seePosi: "查看位置",
                startAlarmDate: "开始报警时间",
                lastAlarmDate: "最后报警时间",
                alarmInfo: "报警信息",
                alarmCount: "报警次数",
                isDispose: "是否处理",
                disposePerson: "处理人",
                untreated: "未处理",
                handled: "已处理",
            },
            bgMgr: {
                customerMgr: "客户管理",
                addCustomer: "添加客户",
                queryCustomer: "查询客户",
                groupMgr: "分组管理",
                addGroup: "添加分组",
                queryGroup: "查询分组",
                userMgr: "用户管理",
                addUser: "添加用户",
                queryUser: "查询用户",
                devMgr: "设备管理",
                addDev: "添加设备",
                queryDev: "查询设备",
                submit: "提交",
                reset: "重置",
                back: "返回",
                delete: "删除",
                edit: "编辑",
                action: "操作"
            },
            customer: {
                kehuName: "客户名称",
                editCustomer: "编辑客户",
                customerName: "企业名称",
                organization: "组织机构编号",
                registerDate: "注册时间",
                legalPerson: "法人代表",
                contacts: "企业联系人",
                contactNumber: "联系电话",
                phoneNumber: "24小时联系电话",
                aptitude: "运营资质类别",
                personNumber: "企业员工人数",
                officeAddress: "办公地址",
                registerAddress: "注册地址",
                remark: "备注",

            },
            group: {
                editGroup: "编辑分组",
                groupName: "分组名称",
                groupNameTip: " 分组名称(最大不能超过50个字符!)",
                mintime: "最短定位时间",
                maxtime: "最长定位时间",
                mintimeTip: "车辆可设置定位间隔的下限(最短间隔)",
                maxtimeTip: "车辆可设置定位间隔的上限(最长间隔)",
                userCount: "用户数量",
                userCountTip: "可包含的监控员数量",
                devCount: "设备数量",
                devCountTip: "可包含的车辆数量",
                addMonitors: "添加监控员",
                noMonitors: " 暂无监控员用户,请先添加",
                monitors: "选择监控员"
            },
            user: {
                allDev: "所有设备",
                editUser: "编辑用户",
                userInfo: "用户信息",
                userAuthority: "用户权限",
                username: "用户名",
                password: "密码",
                checkPwd: "确认密码",
                deadline: "过期时间",
                userType: "用户类型",
                client: "所属客户",
                grouping: "所属分组",
                simultaneousLogin: "同时登录",
                phoneLogin: "手机登录",
                wxLogin: "微信登录",
                groupCount: "分组数量",
                add: "添加",
                devType: "设备类型",
                cmdName: "命令名称",
                cmdPwd: "命令密码",
                save: "保存",
                allow: "允许",
                ban: "禁止",
                createTime: "创建时间",
                resetPwd: "重置密码"
            },
            device: {
                editDev: "编辑设备",
                loginPwd: "登录密码",
                pwdTips: "默认设备序号后四位",
                reportCount: "上报次数",
                allReportCount: "总上报次数",
                allowLogin: "允许登录",
                isUse: "是否使用",
                devIdTips: "设备序号必须是11-15位之间的"
            }
        }
    }

    win.messages = messages;
})(this)