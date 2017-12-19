import Vue from 'vue'
import Router from 'vue-router'
// import Hello from '@/components/Hello'
import RPM from '@/components/RPM'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'RPM',
      component: RPM
    }
  ]
})
