var ruleTypes = {
    chaosu: "overspeed",
}
var ruleTypeNames = {
    overspeed: "超速规则",
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
    mounted() {
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
        return {
            theme: 'light',
            activeName: 'chaosuRule',
            navList: [{
                title: '超速规则',
                name: 'chaosuRule',
                icon: 'ios-speedometer',
            }]
        };
    },
    methods: {
        selectditem: function(name) {
            window.onresize = null;
            var page = null
            switch (name) {
                case 'chaosuRule':
                    page = 'exceedspeed.html'
                    break
            };
            this.currentPage = name;
            this.loadPage(page)
        },
        loadPage: function(page) {
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