<template>
  <div class="tabs" ref="tabs">
    <div class="tab-item" v-bind:class="{highlight: tab.highlight}" v-for="(tab, index) in data" :key="tab.name" v-on:click="changeIndex(index, tab, $event)">{{tab.name || tab}}</div>
    <div class="tab-pointer" ref="tabPointer"></div>
  </div>
</template>

<script>
export default {
  name: 'tabs',
  props: ['data', 'tabIndex'],
  data () {
    return {
      index: 0
    }
  },
  methods: {
    changeIndex (index, tab) {
      this.index = index
      this.updatePointer()
      this.$emit('indexChanged', {index: index, name: tab.name})
    },
    updatePointer () {
      var el = this.$refs.tabs.querySelectorAll('.tab-item')[this.index]
      this.$refs.tabPointer.style.left = el.offsetLeft + 'px'
      this.$refs.tabPointer.style.width = el.offsetWidth + 'px'
    }
  },
  mounted () {
    this.index = this.tabIndex
    this.updatePointer()
  },
  watch: {
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

  .tab-pointer {
    position: absolute;
    height: 2px;
    bottom: 0;
    background: #8e8e8e;
    transition: left 0.2s, width 0.2s;
    transition-timing-function: ease;
  }

  .tab-item {
    position: relative;
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
