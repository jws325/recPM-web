<template>
  <div class="disqus-static">
    <transition name="slide-h">
      <div v-if="!loading && hierarchy.length > 0">
        <static-post v-for="post in hierarchy" :key="post.id" v-bind:post="post"></static-post>
      </div>
    </transition>
    <transition name="slide-h">
      <div class="info" v-if="!loading && hierarchy.length === 0">
        No comments yet
      </div>
    </transition>
    <transition name="fade-long">
      <div class="spinner" v-if="loading"></div>
    </transition>
  </div>
</template>

<script>
  import axios from 'axios'
  import jsonp from 'jsonp'
  import staticPost from './StaticPost.vue'

  export default {
    name: 'vue-disqus-static',
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
        posts: [],
        hierarchy: [],
        loading: true,
        requestsByID: {}
      }
    },
    mounted () {
      this.load()
    },
    watch: {
      identifier () {
        this.load()
      }
    },
    methods: {
      load () {
        if (this.apiKey === null || this.shortname === null || this.identifier === null) {
          return
        }

        this.loading = true
        this.requestsByID[this.identifier] = {requests: 0, responses: []}
        let threadsHandler, postsHandler, url

        threadsHandler = (d) => {
          for (let i = 0; i < d.data.response.length; i++) {
            if (d.data.response[i].identifiers.indexOf(this.identifier) > -1) {
              this.requestsByID[this.identifier].requests++
              jsonp(['http://disqus.com/api/3.0/posts/list.json?api_key=', this.apiKey, '&thread=', d.data.response[i].id].join(''), null, (err, data) => {
                if (err) {
                  console.log(err.message)
                } else {
                  this.requestsByID[this.identifier].responses.push(data)
                  if (this.requestsByID[this.identifier].requests === this.requestsByID[this.identifier].responses.length) {
                    postsHandler(this.requestsByID[this.identifier].responses)
                  }
                }
              })
            }
          }

          if (!this.requestsByID[this.identifier].requests) {
            this.loading = false
            this.hierarchy = []
          }
        }

        postsHandler = (values) => {
          let postsByID, i, hierarchy
          this.posts = []
          postsByID = {}
          hierarchy = []
          for (i = 0; i < values.length; i++) {
            this.posts = this.posts.concat(values[i].response)
          }

          for (i = 0; i < this.posts.length; i++) {
            postsByID[this.posts[i].id] = this.posts[i]
          }

          for (i = 0; i < this.posts.length; i++) {
            if (this.posts[i].parent !== null) {
              if (!postsByID[this.posts[i].parent].children) {
                postsByID[this.posts[i].parent].children = []
              }
              postsByID[this.posts[i].parent].children.push(this.posts[i])
            } else {
              hierarchy.push(this.posts[i])
            }
          }

          this.hierarchy = hierarchy
          this.loading = false
        }

        url = 'https://disqus.com/api/3.0/threads/list.json?api_key=' + this.apiKey + '&forum=' + this.shortname + '&thread=ident:' + this.identifier
        axios.get(url).then(threadsHandler)
      }
    },
    components: {
      axios,
      staticPost,
      jsonp
    }
  }
</script>

<style scoped>
  .disqus-static {
    position: relative;
  }

  h3 {
    font-size: 20px;
    color: #656565;
    font-weight: 300;
    margin: 0 0 20px 0;
    padding: 0;
  }
  .post {
    overflow: hidden;
  }

  .post-body {
    overflow: hidden;
    margin-bottom: 20px;
  }

  .post-body .message {
  }

  .spinner {
    top: 50px;
  }
</style>
<style>
  .post-body .message p {
    margin: 0;
  }
</style>