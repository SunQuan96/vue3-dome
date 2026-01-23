<template>
  <div class="about">
    <van-nav-bar title="关于" left-arrow @click-left="goBack" fixed />
    <div class="content">
      <van-cell-group>
        <van-cell title="项目名称" :value="packageInfo.name" />
        <van-cell title="版本" :value="packageInfo.version" />
        <van-cell title="Vue 版本" value="3.5.13" />
        <van-cell title="Vite 版本" value="6.1.0" />
      </van-cell-group>

      <div class="description">
        <h3>技术栈</h3>
        <ul>
          <li>Vue 3 - 渐进式 JavaScript 框架</li>
          <li>Vite - 下一代前端构建工具</li>
          <li>Vant - 轻量、可靠的移动端 Vue 组件库</li>
          <li>Pinia - Vue 的状态管理库</li>
          <li>Vue Router - Vue.js 官方路由管理器</li>
          <li>Axios - 基于 Promise 的 HTTP 客户端</li>
          <li>ECharts - 强大的数据可视化图表库</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import packageInfo from '../../package.json'

const router = useRouter()

const goBack = () => {
  router.back()
}
</script>

<style lang="scss" scoped>
.about {
  padding-top: 46px;
  min-height: 100vh;
  background-color: #f7f8fa;
}

.content {
  padding: 16px;
}

.description {
  margin-top: 16px;
  padding: 16px;
  background: #fff;
  border-radius: 8px;

  h3 {
    margin: 0 0 12px 0;
    font-size: 16px;
    font-weight: 600;
    color: #323233;
  }

  ul {
    margin: 0;
    padding-left: 20px;

    li {
      margin: 8px 0;
      font-size: 14px;
      color: #646566;
      line-height: 1.6;
    }
  }
}
</style>
