<template>
  <div class="tabs" ref="tabs" @mouseover="mouseOver" @mouseout="mouseOut" :class="{'pointer-transition': pointerTransition}">
    <div class="tab-item" 
      v-for="(tab, index) in data" 
      :key="tab.name" 
      :data-name="tab.name"
      v-if="!tab.disabled"
      :class="{highlight: tab.highlight, active: deFactoActiveTab === tab.name}" 
      v-on:click="click(index, tab)">{{tab.name || tab}}<div class="tab-pointer"></div></div>
    <div class="tab-pointer" ref="tabPointer"></div>
  </div>
</template>

<script>
export default {
  name: 'tabs',
  props: ['data', 'activeTab'],
  data () {
    return {
      _activeTabIndex: 0,
      deJureActiveTab: '',
      deFactoActiveTab: '',
      pointerTransition: false
    }
  },
  methods: {
    click (index, tab) {
      this.pointerTransition = true
      this.deJureActiveTab = tab.name
      this.changeTab(tab.name, 'click')
    },
    changeTab (name, type) {
      var index
      index = this.findTabIndex(name)
      this.deFactoActiveTab = name
      this.$emit('tabChanged', {index: index, oldIndex: this._activeTabIndex, tab: this.data[index], type: type})
      this._activeTabIndex = index
      this.updatePointer()
    },
    updatePointer (noTransition) {
      var el
      el = this.$refs.tabs.querySelectorAll('.tab-item[data-name="' + this.deFactoActiveTab + '"]')[0]
      if (el) {
        this.$refs.tabPointer.style.left = el.offsetLeft + 'px'
        this.$refs.tabPointer.style.width = el.offsetWidth + 'px'
      }
    },
    mouseOver () {
      this.updatePointer()
    },
    mouseOut () {
      this.pointerTransition = false
    },
    findTabIndex (name) {
      return this.data.findIndex((value) => {
        return value.name === name
      })
    },
    initActiveTab () {
      if (!this.data || !this.data.length) {
        return this.changeTab('')
      }
      var newIndex
      newIndex = this.findTabIndex(this.deJureActiveTab)
      if (newIndex < 0) {
        newIndex = Math.max(0, Math.min(this._activeTabIndex || 0, this.data.length - 1))
        this.changeTab(this.data[newIndex].name)
      } else {
        this.changeTab(this.deJureActiveTab)
      }
    }
  },
  mounted () {
    this.deJureActiveTab = this.activeTab
    this.deFactoActiveTab = this.activeTab
    this.initActiveTab()
  },
  watch: {
    data: {
      handler (n, o) {
        this.initActiveTab()
      },
      deep: true
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .tabs {
    display: flex;
    justify-content: space-between;
    align-items: stretch;
    height: 60px;
    position: relative;
  }

  .tabs:before {
    content: "";
    height: 1px;
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    background: #f2f2f2;
  }

  .tabs > div {
    display: flex;
    align-items: center;
    cursor: default;
    /* transition: opacity 0.15s; */
  }

  .tabs > div:hover {
    opacity: 0.8;
  }

  .tabs.pointer-transition > .tab-pointer  {
    opacity: 1;
  }

  .tabs > .tab-pointer  {
    opacity: 0;
    transition: left 0.2s, width 0.2s;
    transition-timing-function: ease;
  }

  .tab-pointer {
    position: absolute;
    height: 2px;
    bottom: 0;
    background: #7ae8e1;
  }

  .tab-item {
    position: relative;
    transition: color 0.2s;
  }

  .tab-item .tab-pointer {
    left: 0;
    right: 0;
    opacity: 0;
  }

  .tab-item.active {
    color: #27cdc2;
  }

  .tab-item.active .tab-pointer {
    opacity: 1;
  }

  .tabs.pointer-transition .tab-item .tab-pointer {
    opacity: 0;
  }

  .tab-item:after {
    content: "";
    display: block;
    width: 5px;
    height: 5px;
    background: #ff715a;
    border-radius: 2.5px;
    position: absolute;
    right: -6px;
    top: 50%;
    margin-top: -7px;
    transform: scale(0);
    transition: transform 0.5s ease;
  }

  .tab-item.highlight:after {
    transform: scale(1);
  }
</style>
