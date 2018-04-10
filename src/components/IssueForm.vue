<template>
    <div class="issue-form" v-bind:class="{controls: showControls}">
      <textarea-autosize
        :placeholder="placeholder"
        ref="textarea"
        v-model="val"
        :min-height="minHeight"
        class="issue-textarea"
        rows="1"
        @focus.native="eventHandler"
        @blur.native="eventHandler"
      ></textarea-autosize>
      <div class="controls">
        <button v-if="!hideRemoveButton" @click="remove" class="issue-form-remove faded-text">Remove</button>
        <button @click="cancelForm" class="issue-form-cancel faded-text">Cancel</button>
        <button @click="submitForm" class="issue-form-save highlighted-text">{{submitText}}</button>
      </div>
    </div>
</template>

<script>

export default {
  name: 'issueForm',
  props: ['minHeight', 'showControls', 'placeholder', 'value', 'submitText', 'focus', 'hideRemoveButton'],
  data () {
    return {
      val: ''
    }
  },
  methods: {
    newIssueFocus () {
    },
    newIssueBlur () {
    },
    eventHandler (event) {
      this.$emit(event.type, event)
    },
    update () {
      this.val = this.value
      this.$refs.textarea.$el.style.paddingBottom = this.showControls ? '40px' : null
    },
    remove (event) {
      this.$emit('remove', event)
    },
    cancelForm (event) {
      this.$emit('cancel', event)
    },
    submitForm (event) {
      this.$emit('submit', event)
    }
  },
  mounted () {
    this.update()
    if (this.focus) {
      this.$refs.textarea.$el.focus()
    }
  },
  watch: {
    minHeight () {
      setTimeout(() => { this.$refs.textarea.resize() })
    },
    showControls () {
      this.update()
    },
    val (val) {
      this.$emit('input', val)
    },
    value () {
      this.update()
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.issue-textarea {
  padding: 6px;
  display: block;
}

.issue-form {
  position: relative;
}

.issue-form .controls {
  position: absolute;
  left: 0;
  bottom: 0;
  overflow: hidden;
  right: 0;
  height: 0;
  opacity: 0;
  transition: opacity 0.2s;
}

.issue-form .controls button {
  height: 30px;
  display: block;
  background: transparent;
  border: 1px solid #f2f2f2;
  font: inherit;
  line-height: 100%;
  /* color: inherit; */
  padding: 0 10px;
  border-left: none;
  border-bottom: none;
  float: left;
  margin: 0;
  outline: 0;
  /* box-sizing: border-box; */
}

.issue-form .controls button:last-child {
  border-top-right-radius: 8px;
}

.issue-form .controls button:hover {
  background: rgba(0, 0, 0, 0.05)
}

/* .issue-form .controls .issue-form-save {
  width: auto;
  padding: 0 15px;
  background: #ff7676;
  color: #fff;
  line-height: 100%;
  transition: background-color 0.2s;
}

.issue-form .controls .issue-form-save:hover {
  background: #ff9f82;
}

.issue-form .controls .issue-form-close:after {
  content: "";
  display: block;
  transform: rotate(45deg);
  width: 12px;
  height: 1px;
  left: 50%;
  top: 50%;
  margin-top: -0.5px;
  margin-left: -6px;
  background: #6f6f6f;
  position: absolute;
}

.issue-form .controls .issue-form-close:before {
  content: "";
  display: block;
  transform: rotate(135deg);
  width: 12px;
  height: 1px;
  left: 50%;
  top: 50%;
  margin-top: -0.5px;
  margin-left: -6px;
  background: #6f6f6f;
  position: absolute;
} */

.issue-form.controls .controls {
  opacity: 1;
  height: auto;
}
</style>
