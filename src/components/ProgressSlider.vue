<template>
  <div class="progress-slider" v-bind:class="{completed: innerValue === 1, start: innerValue === 0}">
    <div class="track">
      <div>
        <span>Completed</span>
      </div>
    </div>
    <div class="start-track"></div>
    <div class="pointer" @mousedown="mouseDown">{{innerValue * 100 | round}}%</div>
  </div>
</template>

<script>
export default {
  name: 'progressSlider',
  props: ['value'],
  data () {
    return {
      pointer: null,
      track: null,
      downEvent: null,
      clickOffset: null,
      innerValue: null
    }
  },
  methods: {
    mouseDown (e) {
      this.downEvent = e
      this.clickOffset = e.clientX - this.pointer.getBoundingClientRect().left
      document.body.addEventListener('mousemove', this.moveHandler)
      document.body.style['user-select'] = 'none'
      document.body.style['-webkit-user-select'] = 'none'
      document.body.addEventListener('mouseup', () => {
        document.body.removeEventListener('mousemove', this.moveHandler)
        document.body.style['user-select'] = 'auto'
        document.body.style['-webkit-user-select'] = 'auto'
        this.$emit('changed', this.innerValue)
      })
    },
    moveHandler (e) {
      this.innerValue = Math.round(Math.min(1, Math.max(0, (e.clientX - this.clickOffset - this.$el.getBoundingClientRect().left)) / (this.$el.clientWidth - this.pointer.clientWidth)) * 100) / 100
      this.updatePointerPosition()
    },
    updatePointerPosition () {
      var x = ((this.innerValue * (this.$el.clientWidth - this.pointer.clientWidth)))
      this.pointer.style.marginLeft = x + 'px'
      this.track.style.width = x + this.pointer.clientWidth / 2 + 'px'
    }
  },
  mounted () {
    this.pointer = this.$el.querySelectorAll('.pointer')[0]
    this.track = this.$el.querySelectorAll('.track')[0]
    this.innerValue = this.value
    this.updatePointerPosition()
  },
  watch: {
    innerValue: {
      handler (val, oldVal) {
        if (val === 1 || oldVal === 1) {
          this.$emit('completeChanged', val)
        }
      }
    },
    value: {
      handler (val) {
        this.innerValue = val
        this.updatePointerPosition()
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.progress-slider {
  position: relative;
  width: 100%;
}

.progress-slider .track, .progress-slider .start-track {
  position: absolute;
  height: 1px;
  left: 0;
  top: 50%;
  background-color: #e0e0e0;
  border-radius: 3px;
  overflow: hidden;
  border-top-left-radius: 100px;
  border-bottom-left-radius: 100px;
}

.progress-slider .start-track {
  left: 0;
  right: 0;
  opacity: 0;
  transition: opacity 0.5s;
}

.progress-slider.start .start-track {
  opacity: 1;
}

.progress-slider .track > div {
  position: absolute;
  opacity: 0;
  display: block;
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;
  border-radius: 100px;
  background: rgb(255,166,117);
  background: -moz-linear-gradient(left, rgba(255,166,117,1) 0%, rgba(255,216,98,1) 100%);
  background: -webkit-linear-gradient(left, rgba(255,166,117,1) 0%,rgba(255,216,98,1) 100%);
  background: linear-gradient(to right, rgba(255,166,117,1) 0%,rgba(255,216,98,1) 100%);
}

.progress-slider .track > div > span {
  display: block;
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  line-height: 16px;
  margin-top: -8px;
  color: #fff;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
}

.progress-slider .track {
  transition-property: background-color, opacity;
  transition-duration: 0.2s;
  transition-timing-function: ease;
}

.progress-slider .track span {
  transition-property: background-color, opacity;
  transition-duration: 0.4s;
  transition-timing-function: ease;
}

.progress-slider .pointer, .progress-slider .track div {
  transition-property: top, height, background-color, opacity;
  transition-duration: 0.2s;
  transition-timing-function: ease;
}

.progress-slider .pointer {
  line-height: 24px;
  padding: 0;
  background-color: #10c4b8;
  color: #fff;
  width: 48px;
  text-align: center;
  border-radius: 3px;
  cursor: default !important;
  position: relative;
  border-radius: 100px;
  transition: border-radius 0.2s, box-shadow 0.3s;
  /* box-shadow: 0 0 0 2px rgba(0, 0, 0, 0) */
}

.progress-slider.completed .track {
  top: 0;
  height: 100%;
}

.progress-slider.completed .track > div {
  opacity: 1;
}

.progress-slider .pointer:active {
  /* box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.4) */
}

.progress-slider.completed .pointer {
  background: #00ad9c;
  /* border-top-right-radius: 0;
  border-bottom-right-radius: 0; */
}

.progress-slider.start .pointer {
  /* border-top-left-radius: 0; */
  /* border-bottom-left-radius: 0; */
}
</style>
