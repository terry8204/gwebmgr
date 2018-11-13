// 统计报表
var reportForm = {
    template: document.getElementById('report-template').innerHTML,
    data: function () {
        return {
            theme: "light",
            reportNavList: [
                {
                    title: '行驶报表',
                    name: 'reportMar',
                    icon: 'ios-photos',
                    children: [
                        { title: '超速表报', name: 'chaosuReport', icon: 'ios-subway' },
                        { title: '位置报表', name: 'weizhiReport', icon: 'md-pin' }
                    ]
                },
                {
                    title: '报警报表',
                    name: 'warningMar',
                    icon: 'logo-wordpress',
                    children: [
                        { title: '全部报警', name: 'allWarning', icon: 'md-warning' },
                    ]
                },
            ]
        }
    },
    methods: {
        selectditem: function (name) {
            console.log(name);
        }
    }
}