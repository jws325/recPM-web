<template>
  <div id="disqus_thread"></div>
</template>

<script>
  export default {
    name: 'vue-disqus',
    props: {
      shortname: {
        type: String,
        required: true
      },
      identifier: {
        type: String,
        required: false
      },
      url: {
        type: String,
        required: false
      },
      title: {
        type: String,
        required: false
      },
      remote_auth_s3: {
        type: String,
        required: false
      },
      api_key: {
        type: String,
        required: false
      },
      sso_config: {
        type: Object,
        required: false
      }
    },
    mounted () {
      this.reset()
    },
    beforeDestroy () {
      this.$el.id = null
    },
    watch: {
      identifier: {
        handler () {
          this.reset()
        },
        deep: true
      }
    },
    methods: {
      reset () {
        var id, url
        id = this.identifier
        url = 'http://example.com/#!id' + id
        var config = function () {
          this.page.identifier = id
          this.page.url = url
        }
        if (window.DISQUS) {
          setTimeout(() => {
            window.DISQUS.reset({
              reload: true,
              config: config
            })
          })
        } else {
          this.init(config)
        }
      },
      init (config) {
        window.disqus_config = config
        setTimeout(() => {
          let d, s, target
          d = document
          s = d.createElement('script')
          s.type = 'text/javascript'
          s.async = true
          s.setAttribute('id', 'embed-disqus')
          s.setAttribute('data-timestamp', +new Date())
          s.src = '//' + this.shortname + '.disqus.com/embed.js'
          target = (d.head || d.body)
          target.appendChild(s)
        })
      }
    }
  }
</script>

<style scoped>
</style>