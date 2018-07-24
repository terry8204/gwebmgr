<template>
  <div id="app" class="full">
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
html,body{
    width: 100%;
    height: 100%;
    background: #f0f0f0;
    overflow: hidden;
    font-size: 12px;
}

.full{
  width: 100%;
    height: 100%;
}
</style>
