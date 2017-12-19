<template>
  <div class="comments">
    <div>
      <div class="comments-header">
        <div class="comments-tabs" v-bind:class="{right: activeTab === 'voter'}">
          <div v-bind:class="{active: activeTab === 'team'}" v-on:click="activeTab = 'team'">
            <span class="point"></span> <span>Team Comments</span>
          </div>
          <div v-bind:class="{active: activeTab === 'voter'}" v-on:click="activeTab = 'voter'">
            <span class="point"></span> <span>Voter Comments</span>
          </div>
        </div>
      </div>
    </div>
    <div>
      <div class="comments-body">
        <transition name="slide-v">
          <div v-if="activeTab === 'team'">
              <vue-disqus v-if="viewType === 'owner'" v-bind:shortname="shortname" v-bind:identifier="identifier + 'team'" v-bind:api-key="apiKey"></vue-disqus>
              <vue-disqus-static v-if="viewType === 'voter'" v-bind:shortname="shortname" v-bind:identifier="identifier + 'team'" v-bind:api-key="apiKey"></vue-disqus-static>
          </div>
        </transition>
        <transition name="slide-v">
          <div v-if="activeTab === 'voter'">
            <vue-disqus v-bind:shortname="shortname" v-bind:identifier="identifier + 'voter'" v-bind:api-key="apiKey"></vue-disqus>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script>
  import vueDisqus from './Disqus.vue'
  import vueDisqusStatic from './DisqusStatic.vue'

  export default {
    name: 'vue-comments',
    props: {
      shortname: {
        default: null
      },
      identifier: {
        default: null
      },
      apiKey: {
        default: null
      },
      viewType: {
        default: null
      }
    },
    data: function () {
      return {
        activeTab: 'team'
      }
    },
    mounted () {
    },
    watch: {
      identifier (val) {
      }
    },
    methods: {
      reset () {
      }
    },
    components: {
      vueDisqus,
      vueDisqusStatic
    }
  }
</script>

<style scoped>
.comments {
  display: table;
  width: 100%;
  height: 100%;
}

.comments > div {
  display: table-row;
}

.comments > div > div {
  display: table-cell;
}

.comments-header {
  height: 1px;
}

.comments-header .comments-tabs {
  width: 100%;
  /* border-bottom: 1px solid #f5f5f5; */
  overflow: hidden;
  position: relative;
}

.comments-tabs > div {
  float: left;
  width: 50%;
  text-align: center;
  position: relative;
  cursor: default;
  padding: 20px 0;
  transition: background-color 0.3s;
  background-color: #f5f5f5;
}

.comments-tabs > div:hover {
  background-color: #ededed;
}

.comments-tabs > div.active {
  /* background-color: #e9eef6; */
}

.comments-tabs:after {
  content: '';
  display: block;
  position: absolute;
  left: 0;
  width: 50%;
  height: 2px;
  bottom: 0;
  transition: left 0.3s;
  background-color: #8ed8cd;
}


.comments-tabs.right:after {
  left: 50%;
}

.comments-tabs .point {
  display: inline-block;
  width: 6px;
  height: 6px;
  position: relative;
}

.comments-tabs .point:before {
  content: '';
  display: block;
  position: relative;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 100%;
  background-color: rgba(0, 0, 0, 0.35);
  transition: transform 0.3s, opacity 0.3s;
  transform: translate(0, 10px);
  opacity: 0;
  margin-top: -1px;
  margin-left: -2px;
}

.comments-tabs > div.active > .point:before {
  transform: translate(0, 0);
  opacity: 1;
}

.comments-tabs > div > span {
  display: inline-block;
  position: relative;
}

.comments-tabs > div.active {
  
}

.comments-body > div {
  position: relative;
}

.comments-body {
  position: relative;
}

.comments-body > div {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  padding: 15px;
  overflow: auto;
}
</style>