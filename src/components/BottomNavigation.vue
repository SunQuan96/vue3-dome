<template>
  <van-tabbar v-model="activeTab" fixed>
    <van-tabbar-item name="home" icon="home-o" @click="goHome">首页</van-tabbar-item>
    <van-tabbar-item name="screen" icon="chart-trending-o" @click="goScreen">公屏端</van-tabbar-item>
    <van-tabbar-item name="collection" icon="photo-o" @click="goCollections">我的藏品</van-tabbar-item>
    <van-tabbar-item name="profile" icon="user-o" @click="goProfile">个人中心</van-tabbar-item>
  </van-tabbar>
</template>

<script>
export default {
  name: 'BottomNavigation',
  props: {
    // 当前激活的标签页
    currentTab: {
      type: String,
      default: 'home'
    }
  },
  data() {
    return {
      activeTab: this.currentTab
    }
  },
  watch: {
    // 监听外部传入的 currentTab 变化
    currentTab(newVal) {
      this.activeTab = newVal
    },
    // 监听内部 activeTab 变化，通知父组件
    activeTab(newVal) {
      this.$emit('tab-change', newVal)
    }
  },
  methods: {
    goHome() {
      this.$router.push('/')
    },
    
    goScreen() {
      this.$router.push('/screen')
    },
    
    goCollections() {
      this.$router.push('/collections')
    },
    
    goProfile() {
      this.$router.push('/geek-profile')
    }
  }
}
</script>

<style lang="scss" scoped>
// 可以在这里添加组件特定的样式
// 如果需要覆盖 Vant 默认样式，可以使用 :deep() 选择器
:deep(.van-tabbar) {
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}

:deep(.van-tabbar-item) {
  font-size: 12px;
}

:deep(.van-tabbar-item--active) {
  color: #1989fa;
}
</style>