import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: {
      title: '首页'
    }
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/views/About.vue'),
    meta: {
      title: '关于'
    }
  },
  {
    path: '/channel-data',
    name: 'ChannelData',
    component: () => import('@/views/ChannelData.vue'),
    meta: {
      title: '渠道数据'
    }
  },
  {
    path: '/channel-detail',
    name: 'ChannelDetail',
    component: () => import('@/views/ChannelDetail.vue'),
    meta: {
      title: '渠道详情'
    }
  },
  {
    path: '/screen',
    name: 'ScreenDisplay',
    component: () => import('@/views/ScreenDisplay.vue'),
    meta: {
      title: '公屏端'
    }
  },
  {
    path: '/participant',
    name: 'Participant',
    component: () => import('@/views/Participant.vue'),
    meta: {
      title: '参与端'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = to.meta.title
  }
  next()
})

export default router
