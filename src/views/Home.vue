<template>
  <div class="home">
    <van-nav-bar title="首页" fixed />
    <div class="content">
      <van-cell-group>
        <van-cell title="欢迎使用 Vue3" value="Vite + Vue3" />
        <van-cell title="UI 框架" value="Vant 4" />
        <van-cell title="状态管理" value="Pinia" />
        <van-cell title="路由" value="Vue Router 4" />
      </van-cell-group>

      <div class="demo-section">
        <van-button type="primary" block @click="handleClick"> 点击测试 </van-button>
        <van-button type="success" block @click="goToAbout"> 跳转到关于页面 </van-button>
        <van-button type="warning" block @click="goToChannelData"> 渠道数据页面 </van-button>
        <van-button type="primary" block @click="goToScreen"> 公屏端（电视展示） </van-button>
        <van-button type="info" block @click="goToParticipant"> 参与端（手机扫码） </van-button>
      </div>

      <div class="info">
        <p>当前用户: {{ isLogin ? '已登录' : '未登录' }}</p>
        <p>Token: {{ token || '无' }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store'
import { showToast } from 'vant'

const router = useRouter()
const userStore = useUserStore()

const isLogin = computed(() => userStore.isLogin)
const token = computed(() => userStore.token)

const handleClick = () => {
  showToast('按钮点击成功！')
}

const goToAbout = () => {
  router.push('/about')
}

const goToChannelData = () => {
  router.push('/channel-data')
}

const goToScreen = () => {
  router.push('/screen?activityId=default')
}

const goToParticipant = () => {
  router.push('/participant?activityId=default')
}
</script>

<style lang="scss" scoped>
.home {
  padding-top: 46px;
  min-height: 100vh;
  background-color: #f7f8fa;
}

.content {
  padding: 16px;
}

.demo-section {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info {
  margin-top: 24px;
  padding: 16px;
  background: #fff;
  border-radius: 8px;
  p {
    margin: 8px 0;
    font-size: 14px;
    color: #666;
  }
}
</style>
