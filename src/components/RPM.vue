<template>
  <div class="rpm-main">
    <header v-if="panels.header">
      <main-header
        v-bind:d="headerData"
        v-on:add-item="addNode"
        v-bind:view-type="viewType"
        v-on:search="search"
        v-bind:search-string="searchString">
      </main-header>
    </header>
    <section class="base">
      <rpm-diagram
        v-bind:nodes-data="globalData.value.nodes"
        v-on:select="applyDatum"
        v-bind:search="searchString"
        v-bind:show-proposed="showProposed"
        v-bind:show-completed="showCompleted"
        v-bind:view-type="viewType"
        ref="diagramComponent">
      </rpm-diagram>
      <div class="diagram-options" v-if="panels.options">
        <label class="proposed-switcher"><input type="checkbox" v-model="showProposed"> <span>Show Proposed</span>
        <span class="faded-text">({{parentalDatum.proposedChildren && parentalDatum.proposedChildren.length ? parentalDatum.proposedChildren.length : 'none'}})</span>
        </label><br>
        <label class="completed-switcher"><input type="checkbox" v-model="showCompleted"> <span>Show Completed</span>
        <span class="faded-text">({{parentalDatum.completedChildren && parentalDatum.completedChildren.length ? parentalDatum.completedChildren.length : 'none'}})</span>
        </label>
      </div>
      <transition name="fade">
        <sidebar
          v-if="!searchString && panels.sidebar"
          v-bind:datum="datum"
          v-bind:view-type="viewType"
          v-bind:disqus-name="disqusName"
          v-bind:disqus-api-key="disqusApiKey"
          ref="sidebar"
        ></sidebar>
      </transition>
      <div class="view-type" v-if="panels.viewType">
        <h3>Select User Role (For Demo)</h3>
        <label><input type="radio" name="view-type" value="owner" v-model="viewType"> Project Owner</label><br>
        <label><input type="radio" name="view-type" value="voter" v-model="viewType"> Voter</label>
      </div>
    </section>
  </div>
</template>

<script>
import mainHeader from './Header.vue'
import rpmDiagram from './Diagram.vue'
import axios from 'axios'
import resize from './Resize.vue'
import sidebar from './Sidebar.vue'
import GlobalSidebarEvents from './GlobalSidebarEvents.vue'
import GlobalData from './GlobalData.vue'

export default {
  name: 'hello',
  data () {
    return {
      datum: {
        data: {
          draft: null
        },
        parent: {
          data: {}
        }
      },
      parentalDatum: {
        proposedChildren: [],
        data: {
          draft: null
        },
        parent: {
          data: {}
        }
      },
      headerData: {
        companyName: 'RecPM.io',
        projectAddress: '0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe',
        voterAddress: '0x281055afc982d96fab65b3a49cac8b878184cb16',
        projectUpvotes: 42,
        votesRemaining: 5
      },
      nodesData: {},
      searchString: '',
      viewType: 'owner',
      disqusName: 'rpm-3',
      showProposed: true,
      showCompleted: false,
      disqusApiKey: 'T7XbPlHEDeyXie9yImwHqxqLgUS0JZiWqFC0NHp2KMZHPcBvRj6rVdjmjnQRfBel',
      hidePanels: false,
      panels: {
        sidebar: true,
        header: true,
        options: true,
        viewType: true
      },
      diagram: null,
      globalData: GlobalData
    }
  },
  methods: {
    addNode (e) {
      if (this.viewType === 'voter') {
        this.showProposed = true
      }
      setTimeout(() => {
        this.diagram.addNode({type: e.type, proposed: this.viewType === 'voter', new: true})
      })
    },
    applyDatum (e) {
      this.datum = e.data
      this.searchString = ''
      this.updatePath()
    },
    applyParentalDatum (e) {
      this.parentalDatum = e.data
    },
    search (e) {
      this.searchString = e
    },
    loadData: function () {
      axios.get('/static/nodes.json').then((d) => {
        GlobalData.set('nodes', d.data)
        return axios.get('/static/people.json')
      }).then((d) => {
        GlobalData.set('people', d.data)
      })
    },
    updatePath () {
    }
  },
  watch: {
    datum: {
      handler: function (val, oldVal) {
        if (val === oldVal) {
          this.diagram.refreshView()
        }
      },
      deep: true
    },
    $route (to, from) {
    }
  },
  components: {
    mainHeader,
    rpmDiagram,
    resize,
    sidebar
  },
  mounted: function () {
    this.loadData()
    this.diagram = this.$refs.diagramComponent.diagram
    if (this.$route.query.panels === 'false') {
      for (let key in this.panels) {
        this.panels[key] = false
      }
    }

    GlobalSidebarEvents.$on('remove-node', () => {
      this.diagram.removeNode(this.datum.id)
    })

    GlobalSidebarEvents.$on('cancel-edit', () => {
      if (this.datum.data.new) {
        this.diagram.focusId = this.diagram.activeId
        this.diagram.update(this.diagram.activeId)
      } else {
        this.$set(this.datum.data, 'draft', null)
      }
    })

    GlobalSidebarEvents.$on('edit-node', () => {
      this.diagram.addDraft(this.diagram.getFocusedDatum().data)
      this.diagram.refreshView()
    })

    GlobalSidebarEvents.$on('save-node', () => {
      for (var key in this.datum.data.draft) {
        this.datum.data[key] = this.datum.data.draft[key]
      }
      this.datum.data.new = false
      this.datum.data.draft = null
      if (this.datum.data.progress === 1) {
        this.diagram.completeItem(this.datum.id)
      }
    })

    GlobalSidebarEvents.$on('complete-changed', () => {
      this.$emit('complete-changed')
    })
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>


@import url('https://fonts.googleapis.com/css?family=Open+Sans:300,400,600');
.info-tabs {
  position: relative;
}

.info-tabs:before {
  content: "";
  position: absolute;
  display: block;
  left: 0;
  right: 0;
  bottom: 0;
  height: 1px;
  background: #f5f5f5;
}

.info-tabs:after {
  display: block;
  content: "";
  position: absolute;
  height: 2px;
  width: 42px;
  background: #ababab;
  transition: left 0.3s ease, margin 0.3s ease, width 0.3s ease;
  bottom: 0;
}

.rpm-main {
  /* display: table; */
  width: 100%;
  height: 100%;
  position: relative;
  font-family: 'Open Sans', sans-serif;
  font-size: 14px;
  line-height: 1.22em;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  /* flex: 1 1 auto; */
  align-items: stretch;
  justify-content: stretch;
  flex-wrap: wrap;
}

.rpm-main header {
  /* height: 90px; */
}

.rpm-main .base {
  flex-grow: 1;
  position: relative;
  display: flex;
  justify-content: stretch;
}

.rpm-diagram {
  flex-grow: 1;
}

.header-cell {
  height: 1px;
}

.body {
  position: relative;
  padding: 0 30px;
}

.draft {
  position: absolute;
  width: 76px;
  line-height: 30px;
  left: 50%;
  margin-left: -38px;
  top: 44px;
  text-align: center;
  background: #ababab;
  border-radius: 15px;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
}

.view-type {
  position: absolute;
  left: 30px;
  bottom: 20px;
  font: inherit;
}

.proposed-switcher span {
  display: inline-block;
}
</style>

<style>
  input[type="text"], textarea {
    font: inherit !important;
    color: inherit !important;
  }


  .full-width {
    margin-left: -15px;
    margin-right: -15px;
  }

  .link:hover {
    text-decoration: underline;
  }

  .active-text {
     color: #7aa5e0;
     cursor: pointer;
  }

  .active-text:active {
    color: #3487c2;
  }

  .faded-text {
    color: #a6a4a4;
  }

  .highlighted-text {
    color: #fe7862;
  }

  .rpm-button {
    border-radius: 100px;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    display: inline-block;
    width: 100%;
    border: 1px solid #e3e3e3;
    padding: 8px;
    position: relative;
    cursor: default;
    overflow: hidden;
  }

  .diagram-options {
    position: absolute;
    top: 30px;
    left: 30px;
    line-height: 22px;
  }

  @keyframes spinner {
    0% {transform: rotate(0);}
    100% {transform: rotate(90deg);}
  }

  @keyframes spinner-color {
    0% {transform: rotate(0); border-color: #3de192; }
    25% {transform: rotate(90deg); border-color: #71c9f7;}
    50% {transform: rotate(180deg); border-color: #fbd04f;}
    75% {transform: rotate(270deg); border-color: #f8865e;}
    100% {transform: rotate(360deg); border-color: #3de192;}
  }

  .spinner {
    position: absolute;
    left: 50%;
    top: 50%;
  }

  .spinner:before {
    content: '';
    position: absolute;
    display: block;
    width: 18px;
    height: 18px;
    left: -9px;
    top: -9px;
    border-radius: 3px;
    animation: spinner-color 2.5s ease infinite;
    border: 3px solid #e5e5e5 !important;
    padding: 0 !important;
    margin: 0 !important;
    opacity: 0.5;
  }

  .info {
    background: rgb(253,244,233);
    background: linear-gradient(135deg, rgba(253,244,233,1) 0%,rgba(255,242,225,1) 100%);
    padding: 13px 14px;
    border-radius: 6px;
  }

  .no-transition-enter-active, .no-transition-leave-active {
  }

  .no-transition-enter, .no-transition-leave-to /* .fade-leave-active below version 2.1.8 */ {
    display: none;
  }

  .fade-enter-active, .fade-leave-active {
    transition: opacity .3s, transform 0.3s;
  }

  .fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
    opacity: 0;
  }

  .fade-long-enter-active, .fade-long-leave-active {
    transition: opacity .5s, transform 0.3s;
  }

  .fade-long-enter, .fade-long-leave-to /* .fade-long-leave-active below version 2.1.8 */ {
    opacity: 0;
  }

  .slide-h-enter-active, .slide-h-leave-active {
    transition: opacity .3s ease, transform .3s ease;
  }

  .slide-h-enter, .slide-h-leave-to /* .fade-leave-active below version 2.1.8 */ {
    opacity: 0;
    -webkit-transform: translate(30px, 0px);
    transform: translate(30px, 0px);
  }

  .slide-v-enter-active, .slide-v-leave-active {
    transition: opacity .6s ease, transform .6s ease;
  }

  .slide-v-enter, .slide-v-leave-to /* .fade-leave-active below version 2.1.8 */ {
    opacity: 0;
    -webkit-transform: translate(0px, 60px);
    transform: translate(0px, 60px);
  }

  .sidebar .full-width {
    margin: 0 -15px;
  }

  .info-buttons-wrapper {
    text-align: left;
    color: #c2c2c2;
    display: table;
    table-layout: fixed;
    width: 100%;
    border: 0;
  }

  .info-buttons-wrapper > * {
    cursor: pointer;
    display: table-cell;
    vertical-align: middle;
    text-align: center;
    padding: 8px 0;
    border-top: 1px solid;
    border-bottom: 1px solid;
    border-color: #f5f5f5;
    transition: background-color 0.2s, color 0.3s, border 0.2s;
  }

  .info-buttons-wrapper > *:hover {
    background-color: #f5f5f5;
  }

  .info-buttons-wrapper > *:active {
    background-color: #ebebeb;
    border-color: #ebebeb;
  }

  .info-buttons-wrapper * {
    vertical-align: middle;
  }

  .info-buttons-wrapper .icon {
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 100%;
    position: relative;
    margin-right: 6px;
    background: #fff;
    display: none;
  }

  .info-buttons-wrapper .icon:before {
    content: "";
    display: block;
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    border-radius: 100%;
    transform: scale(0.9);
    opacity: 0.7;
  }

  .buttons-zone:hover .info-button .icon:before {
    transform: scale(1);
    opacity: 1;
  }

  .info-buttons-wrapper .edit-icon:before {
    background: #58aff3;
  }

  .info-buttons-wrapper .cancel-icon:before {
    background: #58aff3;
  }

  .info-buttons-wrapper .remove-icon:before {
    background: #fc746e;
  }

  .info-buttons-wrapper .icon .bar {
    display: block;
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    right: 0;
  }

  .info-buttons-wrapper .icon,
  .info-buttons-wrapper .icon:before,
  .info-buttons-wrapper .icon .bar:before,
  .info-buttons-wrapper .icon .bar:after {
    transition: transform 0.2s, background-color 0.2s, border 0.2s, opacity 0.2s;
  }

  .info-buttons-wrapper .icon .bar:before, .info-buttons-wrapper .icon .bar:after {
    opacity: 0;
  }

  .info-button:hover .bar:before, .info-button:hover .bar:after {
    opacity: 1;
  }

  .info-buttons-wrapper .edit-icon .bar {
    transform: rotate(40deg);
  }

  .info-buttons-wrapper .cancel-icon .bar {
    transform: rotate(45deg);
  }

  .info-buttons-wrapper .cancel-icon .bar:before {
    left: 2px;
    right: 2px;
    height: 3px;
    top: 50%;
    margin-top: -1.5px;
    transform: translate(-100%, 0);
  }

  .info-buttons-wrapper .cancel-icon .bar:after {
    top: 2px;
    bottom: 2px;
    width: 3px;
    left: 50%;
    margin-left: -1.5px;
    transform: translate(0, 100%);
  }

  .cancel-button:hover .cancel-icon .bar:before {
    transform: translate(0, 0);
  }

  .cancel-button:hover .cancel-icon .bar:after {
    transform: translate(0, 0);
  }

  .edit-button:hover .edit-icon .bar:before {
    transform: translate(0, 50%);
  }

  .remove-button:hover .remove-icon .bar:before {
    transform: translate(3px, 0);
  }

  .info-buttons-wrapper .edit-button {
    border-bottom: 2px solid #abd8ff;
    color: #3897da;
  }

  .info-buttons-wrapper .remove-button {
    border-bottom: 2px solid #ffa8a3;
    color: #e15e5e;
  }

  .info-buttons-wrapper .cancel-button {
    border-bottom: 2px solid #abd8ff;
    color: #3897da;
  }

  .buttons-zone .remove-button.disabled {
    text-decoration: line-through;
  }

  .sidebar textarea {
    border: 0;
    outline: 0;
    width: 100%;
    box-sizing: border-box;
    background: #f2f2f2;
    transition: background-color 0.25s ease, box-shadow 0.4s ease;
    padding: 8px;
  }

  .sidebar textarea:focus {
      background: #fff;
      box-shadow: 0 0 8px rgba(0, 0, 0, 0.2);
  }

  .sidebar-padding {
    padding: 15px;
  }
</style>
