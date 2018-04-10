<template>
  <span class="slide-wrapper">
    <span class="placeholder">{{value}}</span>
    <transition :name="this.textHistory[value] ? 'slide-text' : 'slide-text-reverse'">
      <div class="visible-text" v-bind:key="value">{{value}}</div>
    </transition>
  </span>
</template>

<script>
export default {
  name: 'slideText',
  props: ['value'],
  data () {
    return {
      textHistory: {},
      reverse: false
    }
  },
  methods: {
  },
  mounted () {
    this.textHistory[this.value] = false
  },
  watch: {
    value (n, o) {
      this.textHistory[o] = !this.textHistory[n]
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.slide-wrapper {
  display: inline-block;
  position: relative;
  overflow: hidden;
  white-space: nowrap;
  vertical-align: bottom;
}

.placeholder {
  visibility: hidden;
}

.visible-text {
  position: absolute;
  left: 0;
  top: 0;
}

.slide-text-enter-active, .slide-text-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.slide-text-enter {
  opacity: 0;
  -webkit-transform: translate(0, 100%);
  transform: translate(0, 100%);
}

.slide-text-leave-to {
  opacity: 0;
  -webkit-transform: translate(0, -100%);
  transform: translate(0, -100%);
}


.slide-text-reverse-enter-active, .slide-text-reverse-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.slide-text-reverse-enter {
  opacity: 0;
  -webkit-transform: translate(0, -100%);
  transform: translate(0, -100%);
}

.slide-text-reverse-leave-to {
  opacity: 0;
  -webkit-transform: translate(0, 100%);
  transform: translate(0, 100%);
}
</style>
