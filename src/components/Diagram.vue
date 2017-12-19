<template>
  <div class="rpm-diagram">
  </div>
</template>

<script>
import RPM from '../assets/js/rpm.js'
import axios from 'axios'

export default {
  name: 'rpmDiagram',
  props: [ 'nodesData', 'search', 'offset', 'showProposed', 'showCompleted', 'viewType' ],
  data () {
    return {
      node: {
        draft: null
      },
      diagram: null
    }
  },
  watch: {
    nodesData: function (val) {
      this.diagram.data(val)
    },
    search: function (val) {
      this.diagram.search(val)
    },
    offset (val) {
      this.diagram.offset(val)
    },
    showProposed (val) {
      this.updateProposedVisibility()
    },
    showCompleted (val) {
      this.updateCompletedVisibility()
    },
    viewType () {
      this.updateProposedVisibility()
    }
  },
  mounted: function () {
    this.diagram = new RPM(this.$el, this.diagramHandler)
    this.loadData()
    this.$parent.$on('addItem', (e) => {
      this.diagram.addItem(e)
    })
    this.$parent.$on('saveItem', (e) => {
      // this.diagram.focusId = this.diagram.activeId
      // console.log(e)
      if (e.data.progress === 1) {
        this.diagram.completeItem(e.id)
      }
    })
    this.$parent.$on('changedDatum', (e) => {
      this.diagram.refreshView()
    })
    this.$parent.$on('editNode', (e) => {
      this.diagram.addDraft(this.diagram.getFocusedDatum().data)
      this.diagram.refreshView()
    })
    this.$parent.$on('removeNode', (e) => {
      this.diagram.removeItem(this.diagram.focusId)
    })
    this.$parent.$on('cancelNewNode', (e) => {
      this.diagram.focusId = this.diagram.activeId
      this.diagram.update(this.diagram.activeId)
    })
    this.$parent.$on('completeChanged', (e) => {
      this.diagram.prepareItemToComplete(this.diagram.focusId, e === 1)
    })
  },
  methods: {
    updateProposedVisibility () {
      this.diagram.showProposed(this.showProposed)
    },
    updateCompletedVisibility () {
      this.diagram.showCompleted(this.showCompleted)
    },
    loadData: function () {
      if (this.dataUrl) {
        axios.get(this.dataUrl).then((d) => {
          this.diagram.data(d.data.nodes)
        })
      }
    },
    diagramHandler (d) {
      this.node = d.data
      this.$emit(d.type, d)
    },
    setData (d) {
      this.diagram.data(d)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  @import url('https://fonts.googleapis.com/css?family=Open+Sans:300,400,600');
  header {
    height: 90px;
    box-sizing: border-box;
    border-bottom: 1px solid #ebebeb;
  }

  .sidebar {
    width: 240px;
    position: absolute;
    top: 20px;
    bottom: 20px;
    right: 0;
  }

  .rpm-app {
    width: 100%;
    height: 100%;
    position: relative;
  }

  .rpm-app > .layout-wrapper {
    position: absolute;
    left: 40px;
    right: 40px;
    top: 0;
    bottom: 0;
  }

  .body {
    position: absolute;
    top: 90px;
    left: 0;
    right: 0;
    bottom: 0;
  }

.fade-enter-active, .fade-leave-active {
  transition: opacity .3s, transform 0.3s;
}

.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
  -webkit-transform: scale(1.05);
  transform: scale(1.05);
}

@import url('../assets/css/rpm.css');

</style>
