<template>
  <div class="collections">
    <!-- 导航栏 -->
    <van-nav-bar 
      title="我的藏品" 
      left-arrow 
      @click-left="goBack"
      fixed
    />
    
    <div class="page-content">
      <!-- 页面内容 -->
      <div class="empty-state">
        <van-icon name="photo-o" size="80" color="#ccc" />
        <p class="empty-text">暂无藏品</p>
        <p class="empty-subtext">收藏您喜欢的物品，它们会显示在这里</p>
        <p class="empty-subtext">点击下方按钮查看示例藏品</p>
        
        <van-button 
          type="primary" 
          round 
          class="browse-btn"
          @click="goToBrowse"
        >
          查看示例藏品
        </van-button>
      </div>
      
      <!-- 底部导航 -->
      <BottomNavigation current-tab="collection" @tab-change="onTabChange" />
    </div>
  </div>
</template>

<script>
import BottomNavigation from '@/components/BottomNavigation.vue'

export default {
  name: 'Collections',
  components: {
    BottomNavigation
  },
  methods: {
    goBack() {
      this.$router.back()
    },
    
    goToBrowse() {
      // 跳转到默认的收藏品详情页面
      this.$router.push('/collection/001')
    },
    
    onTabChange(tabName) {
      // 当标签页变化时，可以在这里处理一些逻辑
      console.log('标签页切换到:', tabName)
    }
  }
}
</script>

<style lang="scss" scoped>
.collections {
  padding-top: 46px; // 导航栏高度
  padding-bottom: 50px; // 为底部导航栏留出空间
  min-height: 100vh;
  background-color: #f7f8fa;
}

.page-content {
  padding: 16px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-text {
  font-size: 18px;
  font-weight: 500;
  color: #333;
  margin-top: 20px;
  margin-bottom: 8px;
}

.empty-subtext {
  font-size: 14px;
  color: #999;
  margin-bottom: 30px;
}

.browse-btn {
  width: 120px;
}
</style>