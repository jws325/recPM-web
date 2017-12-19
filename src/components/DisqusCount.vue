<template>
  <span class="disqus-count-wrapper">
    <span class="disqus-count">{{loading ? '–' : count}}</span>
    <!-- <div class="disqus-count-loading">-</div> -->
  </span>
</template>

<script>
  import axios from 'axios'
  export default {
    name: 'vue-disqus-count',
    props: {
      shortname: {
        default: null
      },
      identifier: {
        default: null
      },
      apiKey: {
        default: null
      }
    },
    data: function () {
      return {
        loading: true,
        intervalId: null,
        timeoutId: null,
        count: null
      }
    },
    mounted () {
      this.reset()
    },
    watch: {
      identifier (val) {
        this.reset()
      }
    },
    methods: {
      reset () {
        if (this.apiKey === null || this.shortname === null || this.identifier === null) {
          return
        }

        let url, threadsHandler, postsHandler
        this.loading = true

        threadsHandler = (d) => {
          let all = []
          for (let i = 0; i < d.data.response.length; i++) {
            all.push(axios.get(['http://disqus.com/api/3.0/posts/list.json?api_key=', this.apiKey, '&thread=', d.data.response[i].id].join('')))
          }
          axios.all(all).then(values => {
            this.loading = false
            postsHandler(values)
          })
        }

        postsHandler = (values) => {
          let i, count
          count = 0
          for (i = 0; i < values.length; i++) {
            count += values[i].data.response.length
          }
          this.count = count
        }

        url = 'https://disqus.com/api/3.0/threads/list.json?api_key=' + this.apiKey + '&forum=' + this.shortname + '&thread=ident:' + this.identifier
        axios.get(url).then(threadsHandler)
      }
    },
    components: {
      axios
    }
  }
</script>

<style scoped>
  .disqus-count-wrapper {
    display: inline-block;
    position: relative;
    overflow: hidden;
    vertical-align: bottom;
  }

  .disqus-count-wrapper > * {
    transition: opacity 0.5s;
    transition-timing-function: ease;
    display: inline-block;
  }

  .disqus-count-wrapper.count-loading > .disqus-count-loading {
    opacity: 1;
  }

  .disqus-count-wrapper.count-loading > .disqus-count {
    opacity: 0;
  }

  .disqus-count-wrapper .disqus-count-loading {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    right: 0;
    opacity: 0;
  }
</style>