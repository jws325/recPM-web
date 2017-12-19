<template>
  <div class="rpm-info buttons-zone">
    <div class="section">
      <h2>{{datum.data.name}}</h2>
      <ul class="top-ul">
        <li><label>{{peopleMapping[datum.data.type] | capitalize}}</label><br><span class="not-filled" v-if="!assigned[peopleMapping[datum.data.type]].length"></span>
          <span>
            <ul v-if="assigned[peopleMapping[datum.data.type]].length">
              <li v-for="person in assigned[peopleMapping[datum.data.type]]">{{person.name}}</li>
            </ul>
          </span>
        </li>
        <li><label>Progress</label><br><span>{{(datum.data.type === 'project' ? datum.descendantsProgress : datum.data.progress || 0) * 100 | round}}%</span></li>
        <li><label>Importance</label><br><span v-bind:class="datum.data.importance">{{datum.data.importance | capitalize}}</span></li>
        <li><label>Notes</label><br><span class="not-filled" v-if="!datum.data.notes"></span><span>{{datum.data.notes}}</span></li>
        <li><label>Recurring</label><br><span>{{datum.data.recurring ? 'Yes' : 'No'}}</span></li>
        <li><label>Due Date</label><br><span class="not-filled" v-if="!datum.data.date"></span><span>{{datum.data.date}}</span></li>
        <li><label>Dependencies</label><br><span class="not-filled" v-if="!assigned.dependencies.length"></span>
          <span v-if="assigned.dependencies.length">
            <ul>
              <li v-for="person in assigned.dependencies">{{person.name}}</li>
            </ul>
          </span>
        </li>
      </ul>
    </div>
    <span class="rpm-button comments-button" v-bind:class="{active: showComments}" v-on:click="commentsClick">
      <span class="count-wrapper">
          <span class="count">
            <!-- Comments <vue-disqus-count v-bind:identifier="datum.data.id + 'team'" v-bind:shortname="disqusname" v-bind:api-key="disqusApiKey"></vue-disqus-count>/<vue-disqus-count v-bind:identifier="datum.data.id + 'voter'" v-bind:shortname="disqusname" v-bind:api-key="disqusApiKey"></vue-disqus-count> -->
          </span>
          <span class="no-count">Comments</span>
      </span>
      <div class="comments-icon">
        <div></div>
        <div></div>
        <div></div>
      </div>
    </span>
    <div class="full-width">
      <div class="info-buttons-wrapper">
        <div class="info-button edit-button" v-on:click="edit()"><span class="icon edit-icon"><i class="bar"></i></span><span>Edit</span></div><div class="info-button remove-button" v-on:click="remove()"><span class="icon remove-icon"><i class="bar"></i></span><span>Remove</span></div>
      </div>
    </div>
  </div>
</template>

<script>
import vueDisqusCount from './DisqusCount.vue'

export default {
  name: 'nodeInfo',
  props: [ 'datum', 'people', 'neighbors', 'viewType', 'disqusname', 'disqusApiKey', 'showComments' ],
  data () {
    return {
      peopleMapping: {
        task: 'workers',
        project: 'managers'
      },
      assigned: {
        workers: [],
        managers: [],
        dependencies: []
      },
      noRemoveInfo: false
    }
  },
  watch: {
    datum: {
      handler () {
        this.noRemoveInfo = false
        this.updatePeople()
        this.updateDependencies()
      }
    }
  },
  mounted: function () {
    this.updatePeople()
    this.updateDependencies()
  },
  methods: {
    updatePeople () {
      var type = this.peopleMapping[this.datum.data.type]

      if (this.datum && this.datum.data[type] && this.people[type]) {
        this.assigned[type] = this.people[type].filter((d) => {
          return (this.datum.data[type].indexOf(d.id) > -1)
        })
      } else {
        this.assigned[type] = []
      }
    },
    commentsClick (val) {
      this.$emit('comments-click', val)
    },
    updateDependencies () {
      if (this.datum && this.datum.data.dependencies && this.neighbors) {
        this.assigned.dependencies = this.neighbors.filter((d) => {
          return (this.datum.data.dependencies.indexOf(d.id) > -1)
        })
      } else {
        this.assigned.dependencies = []
      }
    },
    edit () {
      this.$emit('edit-click')
    },
    remove () {
      // if (!this.datum.parent) {
      //   this.noRemoveInfo = true
      // } else {
      //   this.$emit('remove-click')
      // }
      this.$emit('remove-click')
    }
  },
  components: {
    vueDisqusCount
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .rpm-info {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    overflow: auto;
  }

  .section.people .item {
      display: inline-block;
      overflow: visible;
      width: 40px;
      height: 40px;
      border-radius: 100%;
      margin: 2px 6px;
      position: relative;
      vertical-align: middle;
  }

  .section.people .list {
      text-align: center;
  }

  .section.people .item img {
      width: 100%;
      display: inline-block;
      position: relative;
      border-radius: 100%;
  }
  
  .not-filled {
    display: inline;
  }

  .not-filled:after {
    content: "Not Filled"
  }

  .top-ul {
    /* padding-top: 0; */
    /* padding-bottom: 0; */
    /* margin: 0; */
    /* list-style: none; */
    padding-left: 20px
  }

  .top-ul > li {
    margin-bottom: 18px;
  }

  .top-ul {
    color: #9A9A9A;
  }

  .top-ul ul {
    padding-left: 20px;
  }

  .top-ul span {
    color: #656565;
    font-weight: 600;
  }

  .top-ul .low {
    color: #18b066;
  }

  .top-ul .normal {
    color: #239adb;
  }

  .top-ul .high {
    color: #e7b33c;
  }

  .top-ul .critical{
    color: #f14f17;
  }

  h2 {
    font-size: 20px;
    color: #656565;
    font-weight: 300;
    margin: 0 0 20px 0;
    padding: 0;
  }
  .comments-icon {
    position: absolute;
    width: 11px;
    overflow: visible;
    height: 0;
    top: 50%;
    right: 15px;
  }

  .comments-icon > div {
    width: 100%;
    height: 2px;
    border-radius: 1px;
    top: -1px;
    right: 0;
    background: #dedede;
    transform-origin: 8px 50%;
    position: absolute;
    transition: transform, width, background-color;
    transition-timing-function: ease;
    transition-duration: 500ms;
  }

  .comments-button {
    transition-property: border, background-color, color; 
    transition-duration: 500ms;
    transition-timing-function: ease;
    line-height: 37px;
    padding: 0 20px;
    /* color: #215fdb; */
    font-weight: 600;
    margin-bottom: 20px;
  }

  .comments-button .count-wrapper {
    display: inline-block;
    position: relative;
  }

  .comments-button .count-wrapper > * {
    transition-property: opacity; 
    transition-duration: 500ms;
    transition-timing-function: ease;
  }

  .comments-button .no-count {
    /* position: absolute;
    left: 0;
    top: 0;
    opacity: 0; */
  }

  .comments-button.active {
    background: #215fdb;
    border-color: #215fdb;
    color: #fff;
  }

  /* .comments-button.active .no-count {
    opacity: 1;
  }
  
  .comments-button.active .count {
    opacity: 0;
  } */

  .comments-icon > div:nth-child(1) {
    transform: translate(0, -4px);
  }

  .comments-icon > div:nth-child(3) {
    transform: translate(0, 4px);
  }

  .comments-button.active .comments-icon > div:nth-child(1) {
    transform: rotate(45deg);
    width: 9px;
  }

  .comments-button.active .comments-icon > div:nth-child(2) {
  }

  .comments-button.active .comments-icon > div:nth-child(3) {
    transform: rotate(-45deg);
    width: 9px;
  }

  .comments-button.active .comments-icon > div {
    background: #fff;
  }
</style>
