<template>
  <resize :width="sidebarWidth" @resize="sidebarResize" maxWidth="1000px" leavePlace="380px" minWidth="195px" normalWidth="240" :offset="sidebarOffset" class="sidebar-box" :class="{comments: this.globalData.value.comments}">
    <div class="sidebar">
        <div name="fade" id="sidebar-main-container">
          <template v-for="view in staticViews">
            <div :key="view.name" class="static-slot slot">
              <transition name="change-slot" appear>
                <div class="view-wrapper">
                  <div class="slot-header sidebar-padding">
                    <!-- <div :class="[view.name.toLowerCase() + '-icon icon']"></div> -->
                    {{view.name}}</div>
                  <component class="slot-body" :is="view.name" v-bind:datum="datum" :lastVisit="lastVisit(view.name)" :key="view.name"></component>
                </div>
              </transition>
            </div>
          </template>
          <div class="tab-views slot" :class="{'hidden-container': !tabViews.length}" key="tabs">
            <tabs v-bind:data="tabViews" v-bind:active-tab="getActiveTab()" v-on:tabChanged="activateTab" ref="tabs"></tabs>
            <div id="sidebar-views-container" ref="sidebarViews">
                <transition :name="tabData.type === 'click' ? (tabData.oldIndex > tabData.index ? 'slide-left' : 'slide-right') : 'change-slot'">
                  <component v-if="tabData.tab" :is="tabData.tab.name" v-bind:datum="datum" :lastVisit="lastVisit(tabData.tab.name)" class="sidebar-view"></component>
                </transition>
            </div>
          </div>
        </div>
        <div class="comments-wrapper">
          <transition name="fade-long">
            <vue-comments
              v-if="globalData.value.comments"
              v-bind:shortname="disqusName"
              v-bind:identifier="datum.id"
              v-bind:api-key="disqusApiKey"
              v-bind:view-type="viewType">
            </vue-comments>
          </transition>
        </div>
    </div>
  </resize>
</template>

<script>
import vueComments from './Comments.vue'
import tabs from './Tabs.vue'
import Issues from './Issues.vue'
import resize from './Resize.vue'
import moment from 'moment'
import Info from './Info.vue'
import Attachments from './Attachments.vue'
import GlobalSidebarEvents from './GlobalSidebarEvents.vue'
import GlobalData from './GlobalData.vue'
import Container from './Container.vue'

export default {
  name: 'sidebar',
  props: ['datum', 'people', 'neighbors', 'viewType', 'disqusName', 'disqusApiKey'],
  data () {
    return {
      views: [
        {name: 'Info'},
        {name: 'Issues'},
        {name: 'Attachments'}
      ],
      tabViews: [],
      staticViews: [],
      tabIndex: 0,
      selectedTab: null,
      tabChangeType: '',
      oldTabIndex: 0,
      showComments: false,
      tabData: {tab: {name: window.localStorage.sidebarTab}, index: 0, oldIndex: 0, type: ''},
      slots: 1,
      comments: '',
      sidebarWidth: Number(window.localStorage.sidebarWidth) || 240,
      boxTransition: false,
      boxIncrement: 0,
      globalData: GlobalData,
      sidebarOffset: 0
    }
  },
  watch: {
    datum: {
      handler (val) {
        this.$set(this.views[1], 'highlight', this.newIssues())
      }
    },
    sidebarWidth (n) {
      window.localStorage.sidebarWidth = n
      this.updateSlots()
    },
    slots () {
      this.updateTabViews()
    }
  },
  mounted () {
    this.updateSlots()
    this.updateTabViews()

    GlobalSidebarEvents.$on('info-comments-click', (enabled) => {
      this.comments = enabled ? 'Info' : ''
      this.boxIncrement = enabled ? 300 : 0
    })

    GlobalSidebarEvents.$on('edit-node', () => {
      this.$set(this.datum.data, 'draft', this.getDraft(this.datum.data))
    })

    this.selectedTab = this.views[this.tabIndex]
  },
  methods: {
    commentsEnter () {
      console.log('enter')
      this.boxTransition = true
    },
    getActiveTab () {
      return window.localStorage.sidebarTab || this.views[0].name
    },
    activateTab (event) {
      this.tabData = event
      if (event.type === 'click') {
        window.localStorage.sidebarTab = event.tab ? event.tab.name || '' : ''
      }
    },
    lastVisit (name) {
      return window.localStorage[name + 'LastVisit'] || {}
    },
    newIssues () {
      var lastVisit = moment(this.lastVisit('Issues'))
      if (this.datum.data.issues) {
        for (let i = 0; i < this.datum.data.issues.length; i++) {
          if (lastVisit.isBefore(moment(this.datum.data.issues[i].updated || this.datum.data.issues[i].created))) {
            return true
          }
        }
      }
      return false
    },
    isTabView (index) {
      return index >= (this.slots - 1) && this.slots !== this.views.length
    },
    getDraft (d) {
      var draft, key
      draft = {}

      for (key in d) {
        if (key !== 'draft') {
          draft[key] = cloneArray(d[key])
        }
      }
      return draft

      function cloneArray (value) {
        if (!Array.isArray(value)) {
          return value
        }

        var newArr = []
        for (var i = 0; i < value.length; i++) {
          newArr.push(value[i])
        }

        return newArr
      }
    },
    updateSlots () {
      this.slots = Math.floor(this.sidebarWidth / 250)
    },
    updateTabViews () {
      this.tabViews = this.views.filter((v, i) => { return this.isTabView(i) })
      this.staticViews = this.views.filter((v, i) => { return !this.isTabView(i) })
    },
    sidebarResize (e) {
      this.sidebarWidth = e.width
    }
  },
  components: {
    vueComments,
    tabs,
    Issues,
    resize,
    Info,
    Attachments,
    Container,
    GlobalData
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>


#comments-container {
  flex-grow: 1;
  flex-basis: 0;
}

.tabs {
  margin: 0 15px;
}

.hidden-container {
  display: none !important;
}

.sidebar {
  display: flex;
  flex-direction: column;
}

#sidebar-main-container {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  height: 100%;
  flex-grow: 2;
  flex-basis: 0;
}

#sidebar-main-container > .slot {
  flex-grow: 1;
  flex-basis: 0;
  position: relative;
  /* transition: all 2s; */
}

#sidebar-main-container > *:not(:first-child) {
  border-left: 1px solid rgba(0, 0, 0, 0.04);
}

.static-slot {
  display: flex;
  flex-direction: column;
}

.static-slot .view-wrapper {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.static-slot .slot-header {
  flex-basis: 60px;
  box-sizing: border-box;
  display: flex;
  /* justify-content: center; */
  align-items: center;
}

.static-slot .slot-body {
  position: relative;
  flex-grow: 1;
}

#sidebar-main-container .tab-views {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  height: 100%;
}

#sidebar-main-container > div {

}

#sidebar-views-container {
  position: relative;
  overflow: hidden;
  flex-grow: 1;
}

.sidebar-view > div {
  /* position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0; */
}

#sidebar-views-container .sidebar-view {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
}

.sidebar {
  background: #fff;
  height: 100%;
}

.comments-wrapper {
  left: 100%;
  position: absolute;
  top: 0;
  bottom: 0;
  width: 320px;
  box-sizing: border-box;
  padding: 0;
}

#disqus_thread {
  height: 100%;
}

.slide-right-enter-active, .slide-right-leave-active {
  transition: opacity .2s ease, transform .2s ease;
}

.slide-right-enter {
  opacity: 0;
  -webkit-transform: translate(20px, 0px);
  transform: translate(20px, 0px);
}

.slide-right-leave-to {
  opacity: 0;
  -webkit-transform: translate(-20px, 0px);
  transform: translate(-20px, 0px);
}

.slide-left-enter-active, .slide-left-leave-active {
  transition: opacity .2s ease, transform .2s ease;
}

.slide-left-enter {
  opacity: 0;
  -webkit-transform: translate(-20px, 0px);
  transform: translate(-20px, 0px);
}

.slide-left-leave-to {
  opacity: 0;
  -webkit-transform: translate(20px, 0px);
  transform: translate(20px, 0px);
}

.change-slot-enter-active, .change-slot-leave-active {
  transition: opacity .2s ease, transform .2s ease;
}

.change-slot-enter, .change-slot-leave-to {
  opacity: 0;
  -webkit-transform: translate(0, 5px);
  transform: translate(0, 5px);
  /* transform: scale(0.98) */
}

.comments-enter-active, .comments-leave-active {
  transition: all .3s ease;
}

.comments-enter, .comments-leave-to {
  flex-basis: 0px;
  /* transform: scale(0.98) */
}

.info-icon.icon {
  display: inline-block;
  background: url('../assets/icons-assets/info-icon.svg') no-repeat center center;
  width: 12px;
  height: 17px;
}

.issues-icon.icon {
  display: inline-block;
  background: url('../assets/icons-assets/issue-icon.svg') no-repeat center center;
  width: 15px;
  height: 18px;
}

.attachments-icon.icon {
  display: inline-block;
  background: url('../assets/icons-assets/attachment-icon.svg') no-repeat center center;
  width: 19px;
  height: 19px;
}

.slot-header .icon {
  margin-right: 10px;
  opacity: 0.6;
  background-size: contain;
  /* transform: scale(0.95); */
}
</style>

<style>
.sidebar-box.comments {
  margin-left: 320px;
}


.sidebar-box.comments > .resize-slot {
  transform: translate(-320px, 0);
}

.sidebar-box > .resize-slot {
  transition-property: transform;
  transition-duration: 500ms;
  transition-timing-function: cubic-bezier(0.815, 0.145, 0.310, 0.915);
}
</style>
