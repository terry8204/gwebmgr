var ruleTypes = {
    chaosu: "overspeed",
    liandong: "linkalarm",
}



var ruleMixIn = {
    data: {
        taleHeight: 100,
    },
    methods: {
        calcTableHeight: function() {
            var wHeight = window.innerHeight;
            return wHeight - 110;
        },
    },
    mounted: function() {
        var me = this;
        me.taleHeight = me.calcTableHeight();
        window.onresize = function() {
            me.taleHeight = me.calcTableHeight();
        }
    },
}

var ruleManager = {
    template: document.getElementById('rule-template').innerHTML,
    data: function() {
        var me = this;
        return {
            theme: 'light',
            activeName: 'chaosuRule',
            navList: [{
                title: me.$t('rule.overSpeed'),
                name: 'chaosuRule',
                icon: 'ios-speedometer',
            }, {
                title: me.$t('rule.linkAlarm'),
                name: 'linkageAlarm',
                icon: 'ios-analytics',
            }]
        };
    },
    methods: {
        selectditem: function(name) {
            window.onresize = null;
            var page = null;
            switch (name) {
                case 'chaosuRule':
                    page = 'exceedspeed.html'
                    break
                case 'linkageAlarm':
                    page = 'linkagealarm.html'
                    break
            };
            this.currentPage = name;
            this.loadPage(page)
        },
        loadPage: function(page) {
            vueInstanse && vueInstanse.$destroy && vueInstanse.$destroy();
            var me = this
            var pagePath = null
            if (utils.isLocalhost()) {
                pagePath = myUrls.viewhost + 'view/rule/' + page
            } else {
                pagePath = '../view/rule/' + page
            }
            this.$Loading.start()
            $('#rule-view').load(pagePath, function() {
                me.$Loading.finish()
            })
        }
    },
    mounted: function() {
        this.selectditem('chaosuRule');
    },
}



var a = {

    "deviceid": "64861157145",
    "oildetectors": [{
            "appearance": 1,
            "maxAdValue": 1000,
            "length": 100,
            "width": 100,
            "height": 100,
            "diameter": 0,
            "markers": [],
            "threshold": 10
        },
        {
            "appearance": 4,
            "maxAdValue": 65535,
            "length": 0,
            "width": 0,
            "height": 0,
            "diameter": 0,
            "markers": [
                { "height": 10, "volume": 11 }
            ],
            "threshold": 10
        },
        { "appearance": 0, "maxAdValue": 65535, "length": 0, "width": 0, "height": 0, "diameter": 0, "markers": [], "threshold": 10 }, { "appearance": 0, "maxAdValue": 65535, "length": 0, "width": 0, "height": 0, "diameter": 0, "markers": [], "threshold": 10 }
    ],
    "independent": 0
}