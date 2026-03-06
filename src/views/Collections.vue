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
      <!-- 收藏列表 -->
      <div class="collections-list" v-if="collections.length > 0">
        <div class="collections-header">
          <h2 class="collections-title">我的收藏 ({{ collections.length }})</h2>
          <van-button 
            size="small" 
            type="primary" 
            plain
            @click="refreshCollections"
          >
            刷新
          </van-button>
        </div>
        
        <div class="collections-grid">
          <div 
            v-for="item in collections" 
            :key="item.id"
            class="collection-item"
            @click="viewCollectionDetail(item.id)"
          >
            <div class="collection-image">
              <img :src="item.image" :alt="item.title" />
              <div class="collection-badge" v-if="item.isNew">
                <span class="badge-text">NEW</span>
              </div>
            </div>
            <div class="collection-info">
              <h3 class="collection-title">{{ item.title }}</h3>
              <p class="collection-description">{{ item.description }}</p>
              <div class="collection-meta">
                <span class="collection-category">{{ item.category }}</span>
                <span class="collection-date">{{ formatDate(item.createdAt) }}</span>
              </div>
              <div class="collection-stats">
                <van-icon name="eye-o" size="14" />
                <span class="stat-text">{{ item.views }} 浏览</span>
                <van-icon name="like-o" size="14" style="margin-left: 12px;" />
                <span class="stat-text">{{ item.likes }} 点赞</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 空状态（当没有收藏时显示） -->
      <div class="empty-state" v-else>
        <van-icon name="photo-o" size="80" color="#ccc" />
        <p class="empty-text">暂无藏品</p>
        <p class="empty-subtext">收藏您喜欢的物品，它们会显示在这里</p>
        <van-button 
          type="primary" 
          round 
          class="browse-btn"
          @click="goToBrowse"
        >
          浏览示例
        </van-button>
      </div>
      
      <!-- 底部导航 -->
      <BottomNavigation current-tab="collection" @tab-change="onTabChange" />
    </div>
  </div>
</template>

<script>
import BottomNavigation from '@/components/BottomNavigation.vue'
import { showToast } from 'vant'

export default {
  name: 'Collections',
  components: {
    BottomNavigation
  },
  data() {
    return {
      collections: [
        {
          id: '001',
          title: 'Vue 3 源码解析',
          description: '深入理解Vue 3响应式原理和编译优化',
          category: '前端开发',
          image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=300&fit=crop',
          views: 1250,
          likes: 89,
          isNew: true,
          createdAt: '2026-02-28'
        },
        {
          id: '002',
          title: 'TypeScript 高级技巧',
          description: '实用TypeScript类型体操和工程实践',
          category: '编程语言',
          image: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w-400&h=300&fit=crop',
          views: 980,
          likes: 76,
          isNew: false,
          createdAt: '2026-02-25'
        },
        {
          id: '003',
          title: '微前端架构设计',
          description: '基于qiankun的微前端解决方案',
          category: '架构设计',
          image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=300&fit=crop',
          views: 1560,
          likes: 102,
          isNew: true,
          createdAt: '2026-03-01'
        },
        {
          id: '004',
          title: 'Node.js性能优化',
          description: 'Node.js应用性能监控与优化策略',
          category: '后端开发',
          image: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400&h=300&fit=crop',
          views: 890,
          likes: 65,
          isNew: false,
          createdAt: '2026-02-20'
        },
        {
          id: '005',
          title: 'React 18新特性',
          description: '并发渲染和Suspense的深度解析',
          category: '前端框架',
          image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop',
          views: 1120,
          likes: 94,
          isNew: false,
          createdAt: '2026-02-22'
        },
        {
          id: '006',
          title: 'Docker容器化部署',
          description: '从零到一的Docker实战指南',
          category: 'DevOps',
          image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop',
          views: 1340,
          likes: 88,
          isNew: true,
          createdAt: '2026-02-27'
        }
      ]
    }
  },
  mounted() {
    this.loadCollections()
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
      console.log('标签页切换到:', tabName)
    },
    
    loadCollections() {
      // 这里可以调用API加载收藏数据
      // 暂时使用模拟数据
      console.log('加载收藏列表')
    },
    
    refreshCollections() {
      showToast({
        message: '刷新成功',
        type: 'success',
        duration: 1000
      })
      // 实际项目中这里应该重新加载数据
    },
    
    viewCollectionDetail(id) {
      this.$router.push(`/collection/${id}`)
    },
    
    formatDate(dateString) {
      const date = new Date(dateString)
      const now = new Date()
      const diffTime = Math.abs(now - date)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays === 0) return '今天'
      if (diffDays === 1) return '昨天'
      if (diffDays < 7) return `${diffDays}天前`
      if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`
      
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
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

/* 收藏列表样式 */
.collections-list {
  margin-bottom: 20px;
}

.collections-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.collections-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.collections-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.collection-item {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  }
}

.collection-image {
  position: relative;
  width: 100%;
  height: 180px;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }
  
  .collection-item:hover & img {
    transform: scale(1.05);
  }
}

.collection-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  
  .badge-text {
    display: block;
    transform: scale(0.9);
  }
}

.collection-info {
  padding: 16px;
}

.collection-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.collection-description {
  font-size: 14px;
  color: #666;
  margin: 0 0 12px 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.collection-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.collection-category {
  font-size: 12px;
  color: #fff;
  background: #4dabf7;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 500;
}

.collection-date {
  font-size: 12px;
  color: #999;
}

.collection-stats {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #999;
  
  .van-icon {
    margin-right: 4px;
  }
  
  .stat-text {
    margin-right: 8px;
  }
}

/* 空状态样式 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
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
  line-height: 1.5;
}

.browse-btn {
  width: 120px;
}

/* 响应式设计 */
@media (min-width: 768px) {
  .collections-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .collection-image {
    height: 200px;
  }
}

@media (min-width: 1024px) {
  .collections-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>