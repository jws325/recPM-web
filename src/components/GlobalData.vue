<script>
  import Vue from 'vue'
  var GlobalData = new Vue({
    data: function () {
      return {
        value: {}
      }
    },
    watch: {
    },
    methods: {
      set (key, value) {
        this.$set(this.value, key, value)
      }
    }
  })
  export default GlobalData
</script>