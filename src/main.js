// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import VueTextareaAutosize from 'vue-textarea-autosize'

Vue.use(VueTextareaAutosize)

Vue.config.productionTip = false

/* eslint-disable no-new */
Vue.filter('capitalize', function (value) {
  if (!value) return ''
  value = value.toString()
  return value.charAt(0).toUpperCase() + value.slice(1)
})

Vue.filter('round', function (value) {
  return Math.round(parseFloat(value))
})

Vue.filter('shorten', function (value, start, end) {
  if (value.length > (start + end) + 3) {
    let replaceRegExp = new RegExp('(.{' + start + '}).*(.{' + end + '})')
    return value.replace(replaceRegExp, '$1...$2')
  }
  return value
})

new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App }
})
