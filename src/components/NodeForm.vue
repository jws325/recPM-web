<template>
  <div class="item-form buttons-zone">
    <transition name="overlay-fade">
      <div class="overlay" v-if="showManagers">
          <div class="managers people">
              <ul>
                  <li v-for="manager in people.managers" :key="manager.name" v-on:click="addPerson(manager); showManagers = false">{{manager.name}}</li>
              </ul>
          </div>
      </div>
      <div class="overlay" v-if="showWorkers">
          <div class="workers people">
              <ul>
                  <li v-for="worker in people.workers" :key="worker.name" v-on:click="addPerson(worker); showWorkers = false">{{worker.name}}</li>
              </ul>
          </div>
      </div>
    </transition>
    <!-- <h2>New Project</h2> -->
    <div class="info-form">
      <div class="section">
          <label class="section-label">{{datum.type | capitalize}} Name:</label>
          <input type="text" v-model="datum.name">
      </div>
      <div class="section" v-if="datum.type === 'task'">
          <label class="section-label">Progress:</label>
          <progress-slider v-if="!datum.recurring" v-bind:value="datum.progress" v-on:changed="progressChanged" v-on:completeChanged="completeChanged"></progress-slider>
          <div v-if="datum.recurring" class="recurring-progress"><label><input v-model="recurringCompleted" type="checkbox"> Completed</label></div>
      </div>
      <div v-if="datum.type === 'project'" class="section managers people">
        <label class="section-label">Manager(s):</label>
        <div class="list">
          <div v-for="manager in assigned.managers" :key="manager.name" class="item" v-bind:title="manager.name">
            <img v-bind:src="'/static/images/' + manager.portrait">
            <div class="minus-button" v-on:click="removePerson(manager)"></div>
          </div>
          <div class="item">
            <div class="plus-button" v-on:click="showManagers = true">
              <div class="plus-icon"></div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="datum.type === 'task'" class="section workers people">
        <label class="section-label">Worker(s):</label>
        <div class="list">
          <div v-for="worker in assigned.workers" :key="worker.name" class="item" v-bind:title="worker.name">
            <img v-bind:src="'/static/images/' + worker.portrait">
            <div class="minus-button" v-on:click="removePerson(worker)"></div>
          </div>
          <div class="item">
            <div class="plus-button" v-on:click="showWorkers = true">
              <div class="plus-icon"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="section importance">
          <label class="section-label">Importance:</label>
          <div class="table">
              <div class="cell" v-for="level in importanceLevels" :key="level" v-bind:class="[level, {selected:level === datum.importance}]" v-on:click="datum.importance = level" >
                  <i class="radio"></i><br>
                  {{level | capitalize}}
              </div>
          </div>
      </div>
      <div class="section">
          <label class="section-label">Notes:</label>
          <textarea v-model="datum.notes"></textarea>
      </div>
      <div v-if="datum.type === 'task'" class="section recurring">
          <label>
              <input type="checkbox" v-model="isRecurring" > Recurring
          </label>
      </div>
      <div class="section">
          <label class="section-label"><input type="checkbox" v-model="onDueDate"> Due Date</label>
          <input type="text" v-model="datum.date" v-if="onDueDate">
      </div>
      <div class="section depends">
          <label class="section-label"><input type="checkbox" v-model="onDependsOn"> Depends On</label>
          <ul v-if="onDependsOn && neighbors.length > 0">
              <li v-for="neighbor in neighbors" :key="neighbor.id" v-if="neighbor.id !== datum.id" v-bind:class="{'depends-disabled': neighbor.recurring}"><label><div class="recurring-icon" v-if="neighbor.recurring"></div><input type="checkbox" v-if="!neighbor.recurring" v-bind:value="neighbor.id" v-model="datum.dependencies"> {{neighbor.name}}</label></li>
          </ul>
          <div class="info" v-if="onDependsOn && neighbors.length <= 1">
            Requires more than one project or task on level of this {{datum.type}} to create dependency
          </div>
      </div>
      <div class="section files">
        <input type="file" multiple style="display: none;" ref="fileInput" @change="filesChange">
        <div class="attach-icon"></div> <span class="active-text" v-on:click="clickFileInput">{{datum.attachments && datum.attachments.length ? 'Add files...' : 'Attach files...'}}</span>
        <ul ng-if="datum.attachments && datum.attachments.length">
          <li class="active-text" v-for="(attachment, index) in datum.attachments" :key="attachment.name"><div class="remove-button" v-on:click="removeAttachment(index)"></div> <span class="link">{{attachment.name}}</span></li>
        </ul>
      </div>
      <div class="section">
        <button type="submit" v-on:click="save">Save</button>
      </div>
      <div class="full-width">
        <div class="info-buttons-wrapper">
          <div class="cancel-button info-button" v-on:click="cancel()"><span class="icon cancel-icon"><i class="bar"></i></span><span>Cancel</span></div><div class="remove-button info-button" v-on:click="remove()"><span class="icon remove-icon"><i class="bar"></i></span><span>Remove</span></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import progressSlider from './ProgressSlider.vue'

export default {
  name: 'newItem',
  props: ['datum', 'people', 'neighbors'],
  data () {
    return {
      importanceLevels: [
        'low', 'normal', 'high', 'critical'
      ],
      importance: 'low',
      assigned: {
        workers: [],
        managers: []
      },
      showManagers: false,
      showWorkers: false,
      onDueDate: false,
      onDependsOn: false,
      initialStatus: null,
      peopleMapping: {
        task: 'workers',
        project: 'managers'
      },
      isRecurring: false,
      recurringCompleted: false
    }
  },
  methods: {
    addPerson (d) {
      var type
      type = this.peopleMapping[this.datum.type]

      if (!this.datum[type]) {
        this.$set(this.datum, type, [])
      }

      if (this.assigned[type].indexOf(d.id)) {
        this.datum[type].push(d.id)
      }
      this.updatePeople()
    },
    removePerson (d) {
      var type, index
      type = this.peopleMapping[this.datum.type]
      index = this.datum[type].indexOf(d.id)
      this.datum[type].splice(index, 1)
      this.updatePeople()
    },
    updatePeople () {
      var type = this.peopleMapping[this.datum.type]

      if (this.datum && this.people[type] && this.datum[type]) {
        this.assigned[type] = this.people[type].filter((d) => {
          return (this.datum[type].indexOf(d.id) > -1)
        })
      } else {
        this.assigned[type] = []
      }
    },
    save () {
      if (this.recurringCompleted) {
        this.datum.progress = 1
      }
      this.$emit('save')
    },
    remove () {
      this.$emit('remove')
    },
    cancel () {
      this.$emit('cancel')
    },
    progressChanged (val) {
      this.datum.progress = val
      this.datum.status = val === 1 ? 'completed' : this.initialStatus
    },
    completeChanged (e) {
      this.$emit('completeChanged', e)
    },
    init () {
      this.updatePeople()
      this.$set(this.datum, '_dependencies', this.datum.dependencies || [])
      this.isRecurring = this.datum.recurring
      this.onDependsOn = !!(this.datum.dependencies && this.datum.dependencies.length)
      this.initialStatus = this.datum.initialStatus
    },
    clickFileInput () {
      this.$refs.fileInput.click()
    },
    filesChange () {
      if (!this.datum.files) {
        this.$set(this.datum, 'attachments', [])
      }

      for (let i = 0; i < this.$refs.fileInput.files.length; i++) {
        this.datum.attachments.push(this.$refs.fileInput.files[i])
      }
      this.$refs.fileInput.value = ''
    },
    removeAttachment (index) {
      this.datum.attachments.splice(index, 1)
    }
  },
  watch: {
    datum: {
      handler: function (val, oldVal) {
        if (!oldVal || oldVal.id !== val.id) {
          this.init()
        }
        this.recurringCompleted = val.progress === 1
        this.updatePeople()
        if (this.onDependsOn) {
          this.datum._dependencies = this.datum.dependencies
        }
      },
      deep: true
    },
    onDependsOn: function (val, oldVal) {
      if (val) {
        this.$set(this.datum, 'dependencies', this.datum._dependencies)
      } else {
        this.$set(this.datum, 'dependencies', [])
      }
    },
    isRecurring () {
      this.$set(this.datum, 'recurring', this.isRecurring)
    },
    recurringCompleted (e) {
      this.$emit('completeChanged', e)
    }
  },
  mounted: function () {
    this.init()
  },
  components: {
    progressSlider
  }
}
</script>


<style scoped>

.section.files .attach-icon {
  width: 15px;
  height: 15px;
  background: url('../assets/icons-assets/attach-icon.svg') no-repeat center center;
  background-size: contain;
  display: inline-block;
  margin-bottom: -2px;
  opacity: 0.4;
  margin-left: 2px;
  margin-right: 0px;
}

.section.files ul {
  /* list-style-position: inside; */
  padding-left: 0;
  margin: 4px 0;
  list-style-type: none;
}

.section.files ul li {
  white-space: nowrap; 
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 3px;
}

.section.files ul li span {
  white-space: nowrap; 
  overflow: hidden;
  text-overflow: ellipsis;
}

.section.files .remove-button {
  width: 14px;
  height: 14px;
  line-height: 12px;
  border-radius: 7px;
  text-align: center;
  border: 1px solid #ebebeb;
  box-sizing: border-box;
  position: relative;
  display: inline-block;
  margin-bottom: -2px;
  margin-right: 2px;
  margin-left: 2px;
  cursor: pointer;
}

.section.files .remove-button:hover {
  background: #ff6e58;
  border: 0;
}

.section.files .remove-button:hover:after {
  background: #FFF;
}

.section.files .remove-button:after {
  /* content: "−"; */
  content: "";
  display: block;
  position: absolute;
  width: 6px;
  height: 2px;
  left: 50%;
  top: 50%;
  margin-left: -3px;
  margin-top: -1px;
  background-color: #a7a7a7;
}

.item-form {
    font-family: 'Open Sans', sans-serif;
    position: absolute;
    right: 0;
    top: 0;
    left: 0;
    bottom: 0;
    font-size: 14px;
    color: #6f6f6f;
    overflow: auto;
    border-left: 1px solid #f5f5f5;
}

.info-form {
    font-family: 'Open Sans', sans-serif;
    position: absolute;
    right: 0;
    top: 0;
    left: 0;
    bottom: 0;
    font-size: 14px;
    color: #6f6f6f;
    overflow: auto;
    text-align: left;
    padding: 15px;
}

.overlay {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    right: 0;
    background: rgba(50, 50, 50, 0.55);
    background: #fff;
    z-index: 100;
}

.overlay .people {
    position: absolute;
    left: 0;
    right: 0;
    background: #fff;
    max-height: 100%;
    overflow: auto;
}

.overlay .people ul {
  padding: 5px 0;
  margin: 0;
  list-style: none;
}

.overlay .people ul li {
  padding: 10px 15px;
  transition: background-color 0.3s;
  cursor: default;
}

.overlay .people ul li:hover {
  background: rgba(0, 0, 0, 0.05);
}

.overlay .people ul li:active {
  background: rgba(0, 0, 0, 0.1);
}

.text-faded {
    color: #a6a4a4;
}

.section {
    margin-bottom: 20px;
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
    /* margin: -4px -8px; */
    /* display: flex;
    justify-content: space-evenly;
    flex-flow: row wrap;
    align-content: flex-start; */
    text-align: center;
}

.section.people .item img {
    width: 100%;
    display: inline-block;
    position: relative;
    border-radius: 100%;
}

h2 {
    font-size: 20px;
    color: #5d5d5d;
    font-weight: 400;
    margin-top: 0;
}

.section-label {
    color: #6f6f6f;
    font-size: 14px;
    display: inline-block;
    margin-bottom: 3px;
}

input[type="text"] {
    border: 0;
    outline: 0;
    width: 100%;
    height: 34px;
    box-sizing: border-box;
    background: #f2f2f2;
    transition: background-color 0.25s ease, box-shadow 0.4s ease;
    padding: 0 8px;
}

input[type="text"], textarea {
    font: inherit !important;
    color: inherit !important;
}

input[type="text"]::-webkit-contacts-auto-fill-button {
  visibility: hidden;
  display: none !important;
  pointer-events: none;
  position: absolute;
  right: 0;
}

input[type="text"]:focus {
    background: #fff;
    box-shadow: 0 0 8px rgba(0, 0, 0, 0.2);
}

.plus-button {
    display: block;
    width: 28px; 
    height: 28px;
    position: absolute;
    top: 50%;
    margin-top: -14px;
    left: 50%;
    margin-left: -14px;
}

.plus-button:before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    right: 0;
    background: #10c4b8;
    border-radius: 100%;
    transition: transform 0.3s ease, opacity 0.5s ease;
}

.minus-button {
    position: absolute;
    right: 0;
    top: 0;
    background: #FF0000;
    width: 17px;
    height: 17px;
    border-radius: 100%;
    opacity: 0;
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 1);
    transform: scale(0.7);
    transition: transform 0.4s ease, opacity 0.4s ease;
}

.minus-button:before {
    content: "";
    display: block;
    width: 7px;
    height: 3px;
    position: absolute;
    top: 50%;
    margin-top: -1.5px;
    left: 50%;
    margin-left: -3.5px;
    background: #fff;
    border-radius: 1px;
}

.section.people .item:hover .minus-button {
    opacity: 1;
    transform: scale(1);
}


.plus-icon {
    position: absolute;
    left: 50%;
    top: 50%;
    transition: transform 0.3s ease;
}

.plus-button:hover:before {
    /* transform: scale(1.1); */
    opacity: 0.7;
}

.plus-button:hover .plus-icon {
    transform: rotate(90deg);
}

.plus-icon:before, .plus-icon:after {
    content: "";
    display: block;
    position: absolute;
    background-color: #fff;
    border-radius: 1px;
}

.plus-icon:before {
    height: 10px;
    width: 2px;
    top: -5px;
    left: -1px;
}

.plus-icon:after {
    height: 2px;
    width: 10px;
    top: -1px;
    left: -5px;
}

.table {
    display: table;
    width: 100%;
}

.table .cell {
    display: table-cell;
    vertical-align: middle;
}

.section.importance .cell {
    width: 25%;
    text-align: center;
    padding-top: 5px;
    cursor: default;
}

.section.importance .cell .radio {
    width: 18px;
    height: 18px;
    display: inline-block;
    position: relative;
    /* margin-bottom: 3px; */
}

.section.importance .cell:not(.selected) {
    color: #a6a4a4;
}

.section.importance .cell .radio:before {
    content: "";
    display: block;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    border-radius: 100%;
    border: 2px solid red;
    box-sizing: border-box;
    transition: transform 0.15s ease, opacity 0.15s ease;
}

.section.importance .cell:hover .radio:before {
    transform: scale(1.2);
    opacity: 0.5;
}

.section.importance .cell .radio:after {
    content: "";
    display: block;
    position: absolute;
    top: 5px;
    bottom: 5px;
    left: 5px;
    right: 5px;
    border-radius: 100%;
    opacity: 0;
    transform: scale(0);
    transition: transform 0.15s ease, opacity 0.15s ease;
}

.section.importance .cell.selected .radio:after {
    opacity: 1;
    transform: scale(1);
}

.section.importance .low .radio:before {
    border-color: #38ce70;
}

.section.importance .low .radio:after {
    background: #38ce70;
}

.section.importance .normal .radio:before {
    border-color: #266cfa;
}

.section.importance .normal .radio:after {
    background: #266cfa;
}

.section.importance .high .radio:before {
    border-color: #fa9426;
}

.section.importance .high .radio:after {
    background: #fa9426;
}

.section.importance .critical .radio:before {
    border-color: #fa4426;
}

.section.importance .critical .radio:after {
    background: #fa4426;
}

.section.depends ul {
  padding: 0 0 0 20px;
  margin: 0;
  list-style: none;
}

.section.depends ul li {
  margin: 3px 0;
}

.section.depends .depends-disabled {
  opacity: 0.5;
}

textarea {
    border: 0;
    outline: 0;
    width: 100%;
    height: 100px;
    resize: vertical;
    box-sizing: border-box;
    background: #f2f2f2;
    transition: background-color 0.25s ease, box-shadow 0.4s ease;
    padding: 8px;
}

textarea:focus {
    background: #fff;
    box-shadow: 0 0 8px rgba(0, 0, 0, 0.2);
}

button[type="submit"] {
    background: #10c4b8;
    border: 0;
    outline: 0;
    width: 100%;
    font-size: 14px;
    font-family: inherit !important;
    height: 38px;
    color: #fff;
    transition: opacity 0.3s ease;
    border-radius: 18px;
}


button[type="submit"]:hover {
  opacity: 0.7;
}

.overlay-fade-enter-active, .overlay-fade-leave-active {
    transition: opacity .3s, transform 0.3s;
}

.overlay-fade-enter, .overlay-fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
    opacity: 0;
    -webkit-transform: translate(0px, 20px);
    transform: translate(0px, 20px);
}

.recurring-icon {
    background: url('../assets/icons-assets/recurring-icon.svg') no-repeat center center;
    background-size: contain;
    display: inline-block;
    width: 12px;
    height: 12px;
    margin: 3px 2px;
    opacity: 0.3;
    vertical-align: middle;
}

.recurring-progress {
  line-height: 24px;
}
</style>