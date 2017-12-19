<template>
  <div class="static-post">
      <div class="post-avatar" v-bind:style="{ backgroundImage: 'url(' + post.author.avatar.large.permalink + ')' }"></div>
      <div class="post-body">
        <strong>{{post.author.name}}</strong><br>
        <span class="message" v-html="post.message"></span>
      </div>
      <div v-for="child in post.children">
          <static-post v-bind:post="child"></static-post>
      </div>
  </div>
</template>

<script>
  export default {
    name: 'static-post',
    props: [ 'post' ],
    data: function () {
      return {
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
      }
    }
  }
</script>

<style scoped>
  .static-post {
    overflow: hidden;
  }

  .post-avatar {
    float: left;
    width: 30px;
    height: 30px;
    background-size: cover;
    margin-right: 10px;
    border-radius: 4px;
    margin-top: 5px;
  }

  .post-body {
    overflow: hidden;
  }

  .static-post .static-post {
    margin-left: 15px;
  }

  .post-body .message {
    display: inline-block;
    margin-bottom: 20px;
  }
</style>
<style>
  .post-body .message p {
    margin: 0;
  }
</style>