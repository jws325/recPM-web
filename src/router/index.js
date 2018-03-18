import Vue from 'vue'
import Router from 'vue-router'
// import Hello from '@/components/Hello'
import RPM from '@/components/RPM'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/:username/:project_name',
      name: 'RPM',
      component: RPM
    },
    {
      path: '/',
      name: 'RPM',
      component: RPM
    }
  ]
})
