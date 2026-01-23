<template>
  <div class="hello-world">
    <h2>{{ msg }}</h2>
    <p>这是一个示例组件</p>
  </div>
</template>

<script setup>
defineProps({
  msg: {
    type: String,
    default: 'Hello World'
  }
})
</script>

<style lang="scss" scoped>
.hello-world {
  padding: 20px;
  text-align: center;

  h2 {
    color: #42b983;
    margin-bottom: 10px;
  }

  p {
    color: #666;
  }
}
</style>
