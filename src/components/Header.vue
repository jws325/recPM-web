<template>
  <div class="main-header" v-on:mouseover="hold=false" v-on:mouseout="hold=true">
    <div class="project-info">
      <span class="company-name">{{d.companyName}}</span><br>
      <span v-bind:class="{'short-address': shortProjectAddress}">
        <label class="header-fade">Project Address: </label>
        <strong class="address active-text" v-bind:title="d.projectAddress" v-on:click="shortProjectAddress = !shortProjectAddress">{{d.projectAddress | shorten(shortProjectAddress ? 4 : Infinity, 3)}}</strong>
      </span>
      <div class="project-upvotes">
        <label class="header-fade">Upvotes:</label>
        <strong>{{d.projectUpvotes}}</strong>
        <span v-if="viewType === 'voter'">
          <transition name="shrink">
            <span class="upvotes" v-if="upvotes > 0">+ <slide-text :value="upvotes"></slide-text></span>
          </transition>
          <div class="voting">
            <div v-on:click="changeVote(-1)">−</div><div :class="{upvoted: upvotes > 0}" v-on:click="changeVote(1)">+</div>
          </div>
          <!-- <div class="vote-icon" v-bind:class="{'voted': projectIsVoted}" v-on:click="toggleVote()"></div> -->
          <!-- <div class="vote-button" v-bind:class="{'voted': projectIsVoted}" v-on:click="toggleVote()">Upvote</div> -->
        </span>
      </div>
    </div>
    <div class="center">
      <span v-if="!searchString">
        <div v-for="button in buttons" :key="button.name" class="add-button" v-bind:class="[button.class]" v-on:click="$emit('add-item', button)">
          <div class="icon"></div>
          <div class="name header-fade">{{viewType === 'owner' ? button.ownerName : button.voterName}}</div>
        </div>
      </span>
      <span class="search-text" v-if="searchString">Search</span>
    </div>
    <div>
      <search-input v-bind:hold="hold" v-on:search="search"></search-input><br>
      <div v-if="viewType === 'voter'">
        <label class="header-fade">My Address: </label><strong v-bind:title="d.voterAddress" v-on:click="shortVoterAddress = !shortVoterAddress" class="address active-text">{{d.voterAddress | shorten(shortVoterAddress ? 4 : Infinity, 3) }}</strong><br>
        <label class="header-fade">Votes Remaining: </label><strong><slide-text :value="d.votesRemaining - upvotes"></slide-text></strong>
      </div>
    </div>
  </div>
</template>

<script>
import SearchInput from './SearchInput.vue'
import slideText from './SlideText.vue'
export default {
  name: 'mainHeader',
  props: ['d', 'searchString', 'viewType'],
  data () {
    return {
      buttons: [
      {ownerName: 'Add Project', voterName: 'Propose Project', class: 'add-project', type: 'project'},
      {ownerName: 'Add Task', voterName: 'Propose Task', class: 'add-task', type: 'task'}
      ],
      hold: true,
      shortProjectAddress: true,
      shortVoterAddress: true,
      upvotes: 0
    }
  },
  methods: {
    search (val) {
    //   this.searchString = val
      this.$emit('search', val)
    },
    changeVote (value) {
      this.upvotes = Math.min(this.d.votesRemaining, Math.max(0, this.upvotes + value))
    }
  },
  components: {
    SearchInput,
    slideText
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .main-header {
    border-bottom: 1px solid #f5f5f5;
    transition: border 0.5s ease;
    line-height: 1.4em;
  }

  .main-header .search-input-wrapper {
    margin-right: -5px;
  }

  .main-header label {
    color: #9A9A9A;
  }

  .main-header .header-fade {
    opacity: 0.5;
    transition: opacity 0.5s ease;
  }

  .main-header:hover {
    border-bottom: 1px solid #ebebeb;
  }

  .main-header:hover  .header-fade {
    opacity: 1;
  }

  .voting {
    display: inline-block;
    position: relative;
    line-height: 0;
    margin: 0 3px;
    user-select: none;
  }

  .voting > * {
    text-align: center;
    line-height: 16px;
    border: 1px solid #e9e9e9;
    display: inline-block;
    width: 30px;
    box-sizing: border-box;
    cursor: default;
    transition: background-color 0.3s, color 0.3s, border-color 0.3s, transform 0.1s;
  }

  .voting > *:hover {
    opacity: 0.9;
  }

  .voting > *:first-child {
    border-top-left-radius: 9px;
    border-bottom-left-radius: 9px;
    border-right: 0;
  }

  .voting > *:first-child:active {
    transform: translate(0, 2px)
  }

  .voting > *:last-child:active {
    transform: translate(0, -2px)
  }

  .voting > *:last-child {
    border-top-right-radius: 9px;
    border-bottom-right-radius: 9px;
    /* border-left: ; */
  }

  .voting .upvoted {
    background: #ff8375;
    border-color: #ff8375;
    color: #fff;
  }

  .upvotes {
    font-weight: 600;
    display: inline-block;
    width: 25px;
    white-space: nowrap;
  }

  .main-header  {
      display: table;
      width: 100%;
      table-layout: fixed;
      height: 90px;
      box-sizing: border-box;
  }

  .pull-left {
    float: left;
  }

  .pull-right {
    float: right;
  }

  .main-header > div {
      display: table-cell;
      vertical-align: middle;
      text-align: center;
      width: 50%;
  }

  .main-header > div.center {
      width: 250px !important;
  }

  .main-header > div:first-child {
      text-align: left;
      padding-left: 30px;
  }

  .main-header > div:last-child {
      text-align: right;
      padding-right: 30px;
  }

  .main-header .company-name {
      color: #5e5e5e;
      font-size: 22px;
      font-weight: 300;
      line-height: 28px;
  }

  .main-header .center .search-text {
    font-size: 30px;
    font-weight: 300;
  }

  .main-header .add-button {
      display: inline-block;
      color: #9A9A9A;
      font-size: 14px;
      cursor: pointer;
      position: relative;
      overflow: visible;
      vertical-align: middle;
      text-align: center;
      margin-bottom: -20px;
  }

  .main-header .add-button:not(:last-child) {
      margin-right: 28px;
  }

  .main-header .add-button .icon {
      height: 24px;
      width: 24px;
      opacity: 0.2;
      transition: opacity 0.2s ease;
      display: inline-block;
  }

  .main-header .add-button:hover .icon {
      opacity: 0.5;
  }

  .main-header .add-project .icon {
      background: url('../assets/icons-assets/project-icon.svg') no-repeat center center;
      background-size: 21px auto;
  }

  .main-header .add-task .icon {
      background: url('../assets/icons-assets/task-icon.svg') no-repeat center center;
      background-size: 22px auto;
  }

  .address {
      /* cursor: default; */
  }

  .voter-info {
    background-color: #F7F7F7;
    line-height: 28px;
    padding: 0 30px;
    color: #9A9A9A;
    overflow: hidden;
  }

  strong {
    /* color: #656565; */
    font-weight: 600;
  }

  .vote-icon {
    width: 15px;
    height: 13.83px;
    margin-top: -1px;
    display: inline-block;
    background-size: contain;
    background-position: center center;
    background-repeat: no-repeat;
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='433 403 15 13.828'%3e%3cdefs%3e%3cstyle%3e .cls-1 %7b fill: %23fff;%7d .cls-2 %7b fill: %23e0e0e0;%7d %3c/style%3e%3c/defs%3e%3cg id='Group_7' data-name='Group 7' transform='translate(309 344)'%3e%3cpath id='Path_3' data-name='Path 3' class='cls-1' d='M10.087,3.763A4.887,4.887,0,0,0,7.5,4.5,4.913,4.913,0,0,0,0,8.676c0,3.511,5.955,7.948,7.149,8.8a.6.6,0,0,0,.7,0C9.045,16.623,15,12.184,15,8.676a4.919,4.919,0,0,0-4.913-4.913Z' transform='translate(124 55.237)'/%3e%3cpath id='Path_2' data-name='Path 2' class='cls-2' d='M10.087,5.477a3.2,3.2,0,0,1,3.2,3.2c0,1.717-2.813,4.684-5.787,6.933-2.972-2.247-5.786-5.214-5.786-6.933A3.2,3.2,0,0,1,6.6,5.955l.9.562.9-.561a3.186,3.186,0,0,1,1.683-.478m0-1.714A4.887,4.887,0,0,0,7.5,4.5,4.913,4.913,0,0,0,0,8.676c0,3.511,5.955,7.948,7.149,8.8a.6.6,0,0,0,.7,0C9.045,16.623,15,12.184,15,8.676a4.919,4.919,0,0,0-4.913-4.913Z' transform='translate(124 55.237)'/%3e%3c/g%3e%3c/svg%3e ");
    cursor: pointer;
  }

  .vote-icon.voted {
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='440 460 15 13.828'%3e%3cdefs%3e%3cstyle%3e .cls-1 %7b fill: %23ffcd59;%7d %3c/style%3e%3c/defs%3e%3cpath id='Path_2' data-name='Path 2' class='cls-1' d='M10.087,3.763A4.887,4.887,0,0,0,7.5,4.5,4.913,4.913,0,0,0,0,8.676c0,3.511,5.955,7.948,7.149,8.8a.6.6,0,0,0,.7,0C9.045,16.623,15,12.184,15,8.676a4.919,4.919,0,0,0-4.913-4.913Z' transform='translate(440 456.237)'/%3e%3c/svg%3e ");
  }

  .vote-image {
    fill: #FFBB6C;
  }

  .vote-switcher {
    display: inline-block;
    font-weight: 600;
    position: relative;
    overflow: hidden;
    cursor: default;
    width: 100px;
    vertical-align: bottom;
  }

  .vote-switcher > * {
    display: inline-block;
    transition: transform 0.5s ease, opacity 0.3s;
  }

  .vote-switcher .upvote-state {
    color: #fa8037;
  }

  .vote-switcher .voted-state, .vote-switcher .remove-vote {
    position: absolute;
    left: 0;
    top: 100%;
  }

  .vote-switcher .remove-vote {
    opacity: 0;
  }

  .vote-switcher:hover .remove-vote {
    opacity: 1;
  }

  .vote-switcher:hover .voted-state {
    opacity: 0;
  }

  .vote-switcher.voted > * {
    transform: translate(0, -100%)
  }

  .shrink-enter-active, .shrink-leave-active {
    transition: opacity 0.3s ease, width 0.3s ease;
  }

  .shrink-enter, .shrink-leave-to /* .fade-leave-active below version 2.1.8 */ {
    opacity: 0;
    width: 0;
  }
</style>
