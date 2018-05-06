<template>
  <div>
    <transition-group name="slide-h">
      <node-info
        v-if="!datum.empty && (!datum.data.draft && datum.data.name)"
        v-bind:datum="datum"
        key="info"
      >
      </node-info>
      <node-form
        v-if="datum.data.draft"
        v-bind:datum="datum.data.draft"
        key="form"
      >
      </node-form>
    </transition-group>
  </div>
</template>

<script>
import NodeInfo from './NodeInfo.vue'
import NodeForm from './NodeForm.vue'
export default {
  name: 'Info',
  props: ['datum', 'lastVisit'],
  data () {
    return {
    }
  },
  methods: {
  },
  mounted () {
  },
  watch: {
  },
  components: {
    NodeInfo,
    NodeForm
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
