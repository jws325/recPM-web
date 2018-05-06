<template>
  <div class="resize-box" :style="{'width': resizeWidth + (increment || 0) + 'px'}" :class="{resizing: mouseIsDown, transition: transition}" ref="box" @mouseover="hover = true" @mouseleave="hover = false">
    <div class="resize-slot">
      <slot></slot>
      <transition name="maximize">
        <div class="maximize-bar" v-if="true">
          <div class="maximize-button" ref="maximize" @click="maximize" :class="{reverse: maximizeReverse}">
            <div class="maximize-icon"></div>
          </div>
        </div>
      </transition>
      <div class="resize-bar" @mousedown="mouseDown($event)"></div>
    </div>
    <div class="resize-overlay" v-if="mouseIsDown" @mouseup="mouseUp" @mousemove="mouseMove($event)"></div>
  </div>
</template>

<script>
export default {
  name: 'resize',
  props: ['width', 'normalWidth', 'maxWidth', 'minWidth', 'leavePlace', 'transition', 'increment', 'offset'],
  data () {
    return {
      mouseIsDown: false,
      resizeWidth: 0,
      downData: {x: 0, y: 0, width: 0},
      maximizeReverse: false,
      hover: false
    }
  },
  mounted () {
    this.resizeWidth = typeof this.width === 'undefined' ? this.$refs.box.offsetWidth : this.width
    this.maximizeReverse = this.resizeWidth > this.downData.max - 10
    window.addEventListener('resize', this.windowResized)
  },
  beforeDestroy: function () {
    window.removeEventListener('resize', this.windowResized)
  },
  methods: {
    windowResized () {
      var oldVal = this.resizeWidth
      this.resizeWidth = Math.min(this.resizeWidth, this.getMaxWidth())
      if (oldVal === this.resizeWidth) {
        this.refreshMaximize()
      }
    },
    mouseMove (e) {
      this.resizeWidth = Math.max(this.downData.min, Math.min(this.downData.max, this.downData.width + this.downData.x - e.clientX))
    },
    mouseDown (e) {
      e.preventDefault()
      this.mouseIsDown = true
      this.downData.x = e.clientX
      this.downData.y = e.clientY
      this.downData.width = this.resizeWidth
      this.downData.max = this.getMaxWidth()
      this.downData.min = this.getWidthValue(this.minWidth) || 0
    },
    mouseUp () {
      this.downData.max = NaN
      this.mouseIsDown = false
    },
    getWidthValue (val) {
      if (typeof val === 'string') {
        return val.slice(-1) === '%' ? parseFloat(val) / 100 * this.$refs.box.offsetParent.offsetWidth : parseFloat(val)
      }
      return parseFloat(val)
    },
    getMaxWidth () {
      return (Math.min(this.$refs.box.offsetParent.offsetWidth - this.getWidthValue(this.leavePlace), this.getWidthValue(this.maxWidth) - (this.offset || 0))) || Infinity
    },
    refreshMaximize () {
      this.maximizeReverse = this.resizeWidth > ((this.downData.max || this.getMaxWidth()) - 10)
    },
    maximize () {
      this.resizeWidth = this.maximizeReverse ? this.getWidthValue(this.normalWidth || this.minWidth) : this.getMaxWidth()
    }
  },
  watch: {
    width: {
      handler (val) {
        this.resizeWidth = this.width || 0
      }
    },
    resizeWidth (val) {
      this.refreshMaximize()
      this.$emit('resize', {width: val})
    },
    offset () {
      console.log('offset')
      this.resizeWidth = Math.min(this.resizeWidth, this.getMaxWidth())
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.maximize-button {
  width: 18px;
  height: 18px;
  background: #f5f5f5;
  position: absolute;
  right: -1px;
  top: -1px;
}

.maximize-bar {
  width: 30px;
  position: absolute;
  right: 100%;
  top: 0;
  bottom: 0;
}

.resize-box {
  position: relative;
}

.resize-box.transition {
  transition: width 0.3s ease;
}

.resize-box.resizing {
  transition: none !important;
}

.resize-slot {
  height: 100%;
  position: relative;
}

.resize-slot > .resize-bar {
  position: absolute;
  top: 17px;
  bottom: 0;
  width: 8px;
  cursor: ew-resize;
  margin-left: -4px;
}

.resize-box .resize-bar:before {
  content: "";
  display: block;
  width: 1px;
  left: 50%;
  top: -17px;
  bottom: 0;
  position: absolute;
  background: #f5f5f5;
  box-sizing: border-box;
  transition: box-shadow 0.2s, background-color 0.2s;
}

.resize-bar:hover:before {
  /* background: rgba(0, 0, 0, 0.1); */
  /* background: #d0e5fd; */
}

.resizing > .resize-slot > .resize-bar:before {
  background: #d0e5fd;
  box-shadow: 0 0 2px #d0e5fd;
}

.resizing .maximize-button {
  /* background: #d0e5fd; */
}

.resize-overlay {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 1000;
  /* background: rgba(255, 0, 0, 0.1); */
  cursor: ew-resize;
  user-select: none;
}

.resize-overlay:active {
  cursor: ew-resize;
}

.maximize-enter-active, .maximize-leave-active {
  transition: opacity .3s, transform 0.3s;
}

.maximize-enter, .maximize-leave-to {
  opacity: 0;
  /* transform: translate(0, 10px); */
}

.maximize-icon {
  display: block;
  position: absolute;
  transform: rotate(-45deg);
  width: 5px;
  height: 5px;
  border: 1px solid #494949;
  border-bottom-width: 0;
  border-right-width: 0;
  top: 50%;
  left: 50%;
  margin-left: -2.5px;
  margin-top: -3.5px;
  /* transition: border-color 0.3s, transform 0.3s; */
}

.maximize-button.reverse .maximize-icon {
  border-bottom-width: 1px;
  border-right-width: 1px;
  border-left-width: 0;
  border-top-width: 0;
  margin-left: -4px;
}

.maximize-button:active {
  background: #d0e5fd;
}

.maximize-button:active .maximize-icon {
  /* border-color: white; */
}
</style>
