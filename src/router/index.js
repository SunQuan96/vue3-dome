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
    path: '/luck-rank',
    name: 'LuckRank',
    component: () => import('@/views/LuckRank.vue'),
    meta: {
      title: '手气榜'
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
  },
  {
    path: '/geek-profile',
    name: 'GeekProfile',
    component: () => import('@/views/GeekProfile.vue'),
    meta: {
      title: '极客名片'
    }
  },
  {
    path: '/collection/:id',
    name: 'CollectionDetail',
    component: () => import('@/views/CollectionDetail.vue'),
    meta: {
      title: '藏品详情'
    }
  },
  {
    path: '/collections',
    name: 'Collections',
    component: () => import('@/views/Collections.vue'),
    meta: {
      title: '我的藏品'
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: {
      title: '登录'
    }
  }
]

const router = createRouter({
  // 兼容 GitHub Pages 项目站点部署在 `/<repo>/` 子路径下的情况
  history: createWebHistory(import.meta.env.BASE_URL),
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
