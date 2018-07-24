// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
import i18n from '@/locale'
import Cookie from 'js-cookie'

import 'iview/dist/styles/iview.css'
import { Button, Table , Card , Row , Col , Affix , Icon , Message , Menu , Submenu , MenuItem , MenuGroup , Layout ,
  Sider , Header , Content 
} from 'iview'

Vue.component('Button', Button)
Vue.component('Table', Table)
Vue.component('Card', Card)
Vue.component('Row', Row)
Vue.component('Col', Col)
Vue.component('Affix', Affix)
Vue.component('Icon', Icon)
Vue.component('Menu', Menu)
Vue.component('Submenu', Submenu)
Vue.component('MenuItem', MenuItem)
Vue.component('MenuGroup', MenuGroup)
Vue.component('Layout', Layout)
Vue.component('Sider', Sider)
Vue.component('Header', Header)
Vue.component('Content', Content)

Vue.prototype.$Message = Message;


Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  i18n,
  router,
  components: { App },
  template: '<App/>'
})
