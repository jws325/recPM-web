<template>
  <div class="rpm-main">
    <div class="row header-row" v-if="panels.header">
      <header class="cell header-cell">
        <main-header
          v-bind:d="headerData"
          v-on:add-item="addItem"
          v-bind:view-type="viewType"
          v-on:search="search"
          v-bind:search-string="searchString">
        </main-header>
      </header>
    </div>
    <div class="row">
      <div class="body cell" v-bind:class="{comments: showComments}">
        <rpm-diagram
          v-bind:nodes-data="rpmData.nodes"
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
          <div class="sidebar" v-if="!searchString && panels.sidebar">
            <transition name="slide-h">
              <node-info
                v-if="!datum.empty && (!datum.data.draft && datum.data.name)"
                v-bind:datum="datum"
                v-bind:people="rpmData.people"
                v-bind:neighbors="datum.parent ? datum.parent.data.children : []"
                v-bind:show-comments="showComments"
                v-bind:view-type="viewType"
                v-bind:disqusname="disqusName"
                v-on:comments-click="commentsHandler"
                v-on:edit-click="editNode"
                v-on:remove-click="removeNode"
                v-bind:disqus-api-key="disqusApiKey">
              </node-info>
              <new-item
                v-if="datum.data.draft"
                v-on:save="save"
                v-on:remove="removeNode"
                v-on:cancel="cancelEdit"
                v-on:completeChanged="completeChanged"
                v-bind:datum="datum.data.draft"
                v-bind:people="rpmData.people"
                v-bind:neighbors="datum.parent ? datum.parent.data.children : []">
              </new-item>
            </transition>
            <div class="comments-wrapper">
              <transition name="fade-long">
                <vue-comments
                  v-if="showComments"
                  v-bind:shortname="disqusName"
                  v-bind:identifier="datum.id"
                  v-bind:api-key="disqusApiKey"
                  v-bind:view-type="viewType">
                </vue-comments>
              </transition>
            </div>
          </div>
        </transition>
        <div class="view-type" v-if="panels.viewType">
          <h3>Select User Role (For Demo)</h3>
          <label><input type="radio" name="view-type" value="owner" v-model="viewType"> Project Owner</label><br>
          <label><input type="radio" name="view-type" value="voter" v-model="viewType"> Voter</label>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import newItem from './NodeForm.vue'
import mainHeader from './Header.vue'
import rpmDiagram from './Diagram.vue'
import nodeInfo from './NodeInfo.vue'
import axios from 'axios'
import vueComments from './Comments.vue'

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
      rpmData: {},
      searchString: '',
      viewType: 'owner',
      disqusName: 'rpm-3',
      showComments: false,
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
      diagram: null
    }
  },
  methods: {
    addItem (e) {
      if (this.viewType === 'voter') {
        this.showProposed = true
      }

      setTimeout(() => {
        this.$emit('addItem', {type: e.type, proposed: this.viewType === 'voter', new: true})
      })
    },
    applyDatum (e) {
      console.log(e)
      this.datum = e.data
      this.searchString = ''
      this.updatePath()
      // this.$emit('changedDatum', this.datum)
    },
    applyParentalDatum (e) {
      this.parentalDatum = e.data
    },
    search (e) {
      this.searchString = e
    },
    loadData: function (dataUrl) {
      if (dataUrl) {
        axios.get(dataUrl).then((d) => {
          this.rpmData = d.data
        })
      }
    },
    save () {
      for (var key in this.datum.data.draft) {
        this.datum.data[key] = this.datum.data.draft[key]
      }
      this.datum.data.new = false
      this.datum.data.draft = null
      this.$emit('saveItem', this.datum)
    },
    commentsHandler (e) {
      this.showComments = !this.showComments
    },
    editNode () {
      this.$set(this.datum.data, 'draft', this.getDraft(this.datum.data))
    },
    cancelEdit () {
      if (this.datum.data.new) {
        this.$emit('cancelNewNode')
      } else {
        this.$set(this.datum.data, 'draft', null)
      }
    },
    removeNode () {
      this.$emit('removeNode', this.datum)
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
    completeChanged (e) {
      this.$emit('completeChanged', e)
    },
    updatePath () {
      // this.$router.push(this.$route.path + '#' + this.diagram.getBreadcrumb().map(v => v.id).join('/'))
    }
  },
  watch: {
    datum: {
      handler: function (val, oldVal) {
        if (val === oldVal) {
          this.$emit('changedDatum', this.datum)
        }
      },
      deep: true
    },
    $route (to, from) {
      // console.log('route change')
    }
  },
  components: {
    newItem,
    mainHeader,
    rpmDiagram,
    nodeInfo,
    vueComments
  },
  mounted: function () {
    this.loadData('/static/data.json')

    this.diagram = this.$refs.diagramComponent.diagram
    if (this.$route.query.panels === 'false') {
      for (let key in this.panels) {
        this.panels[key] = false
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
@import url('https://fonts.googleapis.com/css?family=Open+Sans:300,400,600');

.rpm-main {
  overflow: hidden;
}

.rpm-diagram {
  height: 100%;
  position: absolute;
  left: 30px;
  right: 30px;
  top: 0;
}

.sidebar, .rpm-svg g.offset {
  transition: transform 500ms cubic-bezier(0.815, 0.145, 0.310, 0.915);
}

.sidebar {
  width: 240px;
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  background: #fff;
}

.comments .sidebar {
  transform: translate(-320px, 0);
}

.comments .rpm-diagram {
  right: 350px;
}

.sidebar > * {
  max-height: 100%;
  font-size: 14px;
  color: #6f6f6f;
  overflow: auto;
  text-align: left;
  padding: 15px;
  border-left: 1px solid #f5f5f5;
}

.rpm-main {
  display: table;
  width: 100%;
  height: 100%;
  position: relative;
  font-family: 'Open Sans', sans-serif;
  font-size: 14px;
}

.rpm-main .row {
  display: table-row;
}

.rpm-main .cell {
  display: table-cell;
}

.header-cell {
  height: 1px;
}

.rpm-main > .layout-wrapper {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
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
  /* .hidden-panels .header-row, .hidden-panels .sidebar, .hidden-panels .view-type, .hidden-panels .diagram-options {
    display: none !important;
  } */

  .faded-text {
    color: #a6a4a4;
  }

  .rpm-button {
    /* height: 34px; */
    border-radius: 100px;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    /* text-align: center; */
    display: inline-block;
    width: 100%;
    /* line-height: 34px; */
    border: 1px solid #e3e3e3;
    padding: 8px;
    position: relative;
    cursor: default;
    overflow: hidden;
  }

  .rpm-button:hover {
    /* background-color: #fafafa; */
  }

  .diagram-options {
    position: absolute;
    top: 30px;
    left: 30px;
    line-height: 22px;
  }

  .breadcrumb-container {
    /* top: 30px !important; */
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
    /* animation: spinner 0.4s linear infinite; */
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

  .info-buttons-wrapper > *:not(:first-child) {
    /* box-shadow: inset 1px 0 0 rgba(0, 0, 0, 0.04); */
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
    /* transform: scale(0.1, 0.1); */
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
    /* background: #d2d2d2; */
    transform: scale(0.9);
    opacity: 0.7;
  }

  .buttons-zone:hover .info-button .icon:before {
    /* transform: scale(1, 1); */
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
    /* overflow: hidden; */
  }

  /* .buttons-zone:hover .edit-icon {
    background: #4da9f1;
  }

  .buttons-zone:hover .remove-icon {
    background: #f05b54;
  } */

  .info-buttons-wrapper .cancel-icon .bar {
    transform: rotate(45deg);
  }

/* .info-buttons-wrapper .cancel-icon .bar:before, .info-buttons-wrapper .cancel-icon .bar:after {
    content: "";
    position: absolute;
    display: block;
    background: #fff;
    border-radius: 3px;
  } */

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

  /* .info-buttons-wrapper .edit-icon .bar:before {
    content: "";
    display: block;
    position: absolute;
    width: 3px;
    height: 100%;
    bottom: 100%;
    left: 50%;
    margin-left: -2px;
    background: #fff;
    border-radius: 1.5px;
  }

  .info-buttons-wrapper .remove-icon .bar:before {
    content: "";
    display: block;
    position: absolute;
    height: 3px;
    bottom: 50%;
    width: 7px;
    margin-bottom: -1.5px;
    background: #fff;
    border-radius: 1.5px;
    transform: translate(-13px, 0);
    transform-origin: 100% 50%;
  } */

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
</style>
