<template>
  <div class="hello">
    

        <scroll-bar  dis-scroll-x>
            <h1>{{ msg }}</h1>
            <h2>Essential Links</h2>
            <Button>sfj </Button>
            {{$t('home')}}
        </scroll-bar>

  </div>
</template>

<script>
import scrollBar from '@/components/vue-scroller-bars'
export default {
  name: 'HelloWorld',
  data () {
    return {
      msg: 'Welcome to Your Vue.js App'
    }
  },
  components:{
    scrollBar
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang='less' scoped>
    .hello{
      color: salmon;
      width: 100px;
      height: 200px;
    }
</style>
