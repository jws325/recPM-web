<template>
  <div class="search-input-wrapper" v-bind:class="{'hold':(hold && !focused && !searchString)}">
      <input type="search" autocorrect="off" autocapitalize="off" spellcheck="false" v-on:focus="focused=true" v-on:blur="focused=false" v-model="searchString">
      <i class="search-icon"></i>
  </div>
</template>

<script>
export default {
  name: 'searchInput',
  props: ['hold'],
  data () {
    return {
      focused: false,
      searchString: ''
    }
  },
  watch: {
    searchString: {
      handler (val) {
        this.$emit('search', val)
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .search-input-wrapper {
      display: inline-block;
      position: relative;
  }

  .search-input-wrapper input {
      width: 236px;
      height: 28px;
      border-radius: 15px;
      background-color: #f2f2f2;
      -webkit-appearance:none;
      border: 0;
      outline: 0;
      padding: 0 28px 0 3px;
      font-size: 14px;
      transition: background-color 0.4s ease, box-shadow 0.4s ease;
  }

  .search-input-wrapper.hold input {
    background-color: transparent;
  }

  .search-input-wrapper input::-webkit-contacts-auto-fill-button {
    visibility: hidden;
    display: none !important;
    pointer-events: none;
    position: absolute;
    right: 0;
  }

  .search-input-wrapper input:focus {
      box-shadow: 0 0 8px rgba(0, 0, 0, 0.2);
      background-color: #fff;
  }

  .search-input-wrapper .search-icon {
      position: absolute;
      display: block;
      width: 18px;
      height: 18px;
      top: 50%;
      margin-top: -9px;
      right: 6px;
      border: 2px solid #b3b2b2;
      border-radius: 100%;
      box-sizing: border-box;
      transform: rotate(-45deg);
      transition: transform 0.5s ease, width 0.5s ease;
      pointer-events: none;
  }


  .search-input-wrapper .search-icon:before {
    content: "";
    display: block;
    position: absolute;
    right: 100%;
    /* margin-right: -2px; */
    border-radius: 2px;
    width: 0;
    height: 3px;
    top: 50%;
    margin-top: -1.5px;
    background: #b3b2b2;
    transition: width 0.5s ease;
    
  }

  .search-input-wrapper.hold .search-icon:before {
    width: 8px;
  }

</style>
