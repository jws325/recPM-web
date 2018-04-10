<template>
  <div class="issues sidebar-padding">
    <div class="line">
      <issue-form
        :min-height="newIssueMinHeight"
        :show-controls="newIssueIsActive"
        :submit-text="'Save'"
        :hide-remove-button="true"
        v-model="newIssueText"
        @focus="newIssueFocus"
        @cancel="newIssueClose"
        @submit="newIssueSave"
        placeholder="New Issue"
      ></issue-form>
    </div>
    <div class="issues-list">
      <!-- <transition-group name="slide-h"> -->
        <div class="issue line" v-for="(issue, index) in (datum.data.issues || []).slice().reverse()" :key="issue.id" :class="{active: activeIssues[issue.id]}">
          <div class="static-view" v-if="!activeIssues[issue.id]" @click="editIssue(issue, index)" @mouseover="setMouseOver(issue, true)" @mouseout="setMouseOver(issue, false)">
            <div class="hover-bg"></div>
            <div class="issue-content"><span v-if="isNew(issue)" class="new-issue-mark"></span> <span v-for="(line, index) in issue.content.split('\n')" :key="index">{{line}}<br></span></div>
            <!-- <div class="issue-caption">#{{issue.id}} — <span class="humanized">{{humanizeDate(issue.updated || issue.created)}}</span><span class="format">{{formatDate(issue.updated || issue.created)}}</span></div> -->
            <div class="issue-caption">#{{issue.id}} — 
              <slide-text :value="overId[issue.id] ? formatDate(issue.updated || issue.created) : humanizeDate(issue.updated || issue.created)"></slide-text>
            </div>
          </div>
          <div v-if="activeIssues[issue.id]">
            <issue-form
              :min-height="100"
              :show-controls="true"
              :submit-text="'Save'"
              :focus="true"
              v-model="activeIssues[issue.id].content"
              @remove="removeIssue(issue)"
              @cancel="cancelIssue(issue)"
              @submit="saveIssue(issue)"
            ></issue-form>
            <div class="issue-caption">#{{issue.id}} — <span>{{formatDate(issue.updated || issue.created)}}</span></div>
          </div>
        </div>
      <!-- </transition-group> -->
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import issueForm from './IssueForm.vue'
import slideText from './SlideText.vue'

export default {
  name: 'issues',
  props: ['datum', 'lastVisit'],
  data () {
    return {
      newIssueText: '',
      newIssueIsActive: false,
      newIssueMinHeight: null,
      activeIssues: {},
      overId: {}
    }
  },
  methods: {
    humanizeDate (date) {
      return moment(date).fromNow()
    },
    formatDate (date) {
      return moment(date).format('MMMM D, YYYY hh:mm a')
    },
    newIssueFocus () {
      this.newIssueIsActive = true
      this.newIssueMinHeight = 100
    },
    newIssueClose () {
      this.newIssueIsActive = false
      this.newIssueMinHeight = null
      this.newIssueText = ''
    },
    newIssueSave () {
      if (!this.datum.data.issues) {
        this.$set(this.datum.data, 'issues', [])
      }
      this.datum.data.issuesCount = (this.datum.data.issuesCount || (this.datum.data.issues ? this.datum.data.issues.length : 0)) + 1
      this.datum.data.issues.push({content: this.newIssueText, created: (new Date()).toISOString(), id: this.datum.data.issuesCount})
      this.newIssueClose()
    },
    editIssue (issue) {
      this.$set(this.activeIssues, issue.id, {content: issue.content})
    },
    saveIssue (issue) {
      if (issue.content !== this.activeIssues[issue.id].content) {
        issue.content = this.activeIssues[issue.id].content
        issue.updated = (new Date()).toISOString()
      }
      this.activeIssues[issue.id] = null
    },
    cancelIssue (issue) {
      this.activeIssues[issue.id] = null
    },
    removeIssue (issue) {
      for (let i = 0; i < this.datum.data.issues.length; i++) {
        if (this.datum.data.issues[i].id === issue.id) {
          this.datum.data.issues.splice(i, 1)
          return
        }
      }
    },
    getIssueById (id) {
      for (let i = 0; i < this.datum.data.issues.length; i++) {
        if (this.datum.data.issues[i].id === id) {
          return this.datum.data.issues[i]
        }
      }
    },
    isNew (issue) {
      return moment(this.lastVisit).isBefore(issue.updated || issue.created)
    },
    setMouseOver (issue, value) {
      this.$set(this.overId, issue.id, value)
    }
  },
  mounted () {
    this.datum.data.issuesCount = (this.datum.data.issuesCount || (this.datum.data.issues ? this.datum.data.issues.length : 0))
  },
  components: {
    issueForm,
    slideText
  },
  watch: {
    datum (n, o) {
      if (!o || n.id !== o.id) {
        this.activeIssues = {}
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.new-issue-mark {
  display: inline-block;
  width: 5px;
  height: 5px;
  border-radius: 2.5px;
  background: #ff715a;
  vertical-align: middle;
  margin-right: 5px;
  margin-top: -2px;
}
.issues {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  overflow: auto;
}

.issue {
  position: relative;
}

.static-view * {
  pointer-events: none;
}

.line {
  margin-bottom: 25px;
}

.issue:not(.active) .hover-bg {
  content: "";
  display: block;
  position: absolute;
  transition: background-color 0.1s;
  left: -7px;
  right: -7px;
  top: -7px;
  bottom: -7px;
}

.issue:not(.active):hover .hover-bg {
  /* border: 1px solid #e0e0e0; */
  background: #f5f5f5;
}

.issue .format {
  display: none;
}

.issue:not(.active):hover .format {
  display: inline;
}

.issue:not(.active):hover .humanized {
  display: none
}

.issue-content, .issue-caption {
  position: relative;
}

.issue-caption {
  font-size: 12px;
  color: #a6a4a4;
  margin-top: 3px;
}
</style>
