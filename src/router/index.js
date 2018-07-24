import Vue from 'vue'
import Router from 'vue-router'
import { routes } from './routes.js'

Vue.use(Router)

const router = new Router({
  routes
})

router.beforeEach((to,from,next)=>{
  console.log(to.name,from.name)
  next();
})

export default router;
