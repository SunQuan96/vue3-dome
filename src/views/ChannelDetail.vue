<template>
  <div class="channel-detail-page">
    <van-nav-bar title="渠道详情" left-arrow @click-left="goBack" fixed />
    <div class="page-content">
      <van-cell-group>
        <van-cell title="类型" :value="type" />
        <van-cell title="ID" :value="id" />
      </van-cell-group>
      <div class="detail-info">
        <p>这是渠道详情页面</p>
        <p>类型: {{ type }}</p>
        <p>ID: {{ id }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const type = route.query.type || '未知'
const id = route.query.id || '未知'

const goBack = () => {
  router.back()
}
</script>

<style lang="scss" scoped>
.channel-detail-page {
  padding-top: 46px;
  min-height: 100vh;
  background-color: #f7f8fa;
}

.page-content {
  padding: 16px;
}

.detail-info {
  margin-top: 16px;
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
