<template>
  <div class="collection-detail">
    <!-- 导航栏 -->
    <van-nav-bar 
      title="藏品详情" 
      left-arrow 
      @click-left="goBack"
      fixed
    />

    <!-- 页面内容 -->
    <div class="detail-container">
      <!-- 藏品图片轮播图 -->
      <div class="swiper-section">
        <Swiper
          :slides-per-view="1"
          :space-between="0"
          :pagination="{ clickable: true }"
          :navigation="true"
          @swiper="onSwiperReady"
          @slide-change="onSlideChange"
          class="collection-swiper"
        >
          <SwiperSlide v-for="(image, index) in collection.images" :key="index">
            <div class="swiper-slide-content">
              <img 
                :src="image" 
                :alt="`藏品图片${index + 1}`"
                class="swiper-image"
              />
            </div>
          </SwiperSlide>
        </Swiper>
        
        <!-- 收藏按钮 -->
        <div class="favorite-btn" @click="toggleFavorite">
          <van-icon 
            :name="isFavorite ? 'star' : 'star-o'" 
            :color="isFavorite ? '#ffd700' : '#999'"
            size="24"
          />
        </div>
      </div>

      <!-- 藏品信息 -->
      <div class="info-section">
        <div class="collection-header">
          <h1 class="collection-name">{{ collection.name }}</h1>
          <div class="collection-tags">
            <van-tag 
              v-for="tag in collection.tags"
              :key="tag"
              type="primary"
              size="medium"
            >
              {{ tag }}
            </van-tag>
          </div>
        </div>

        <!-- 价格信息 -->
        <div class="price-section">
          <div class="current-price">
            <span class="price-label">当前价格</span>
            <span class="price-value">¥{{ formatPrice(collection.price) }}</span>
          </div>
          <div class="price-change">
            <span class="change-label">24小时涨跌幅</span>
            <span 
              class="change-value"
              :class="{ up: collection.priceChange > 0, down: collection.priceChange < 0 }"
            >
              {{ collection.priceChange > 0 ? '+' : '' }}{{ collection.priceChange }}%
            </span>
          </div>
        </div>

        <!-- 藏品属性 -->
        <div class="attributes-section">
          <h2 class="section-title">藏品属性</h2>
          <div class="attributes-grid">
            <div 
              v-for="attr in collection.attributes"
              :key="attr.name"
              class="attribute-item"
            >
              <span class="attr-name">{{ attr.name }}</span>
              <span class="attr-value">{{ attr.value }}</span>
            </div>
          </div>
        </div>

        <!-- 藏品描述 -->
        <div class="description-section">
          <h2 class="section-title">藏品描述</h2>
          <div class="description-content">
            <p>{{ collection.description }}</p>
          </div>
        </div>

        <!-- 祝福语输入 -->
        <div class="blessing-section">
          <h2 class="section-title">祝福语</h2>
          <div class="blessing-content">
            <van-field
              v-model="blessingText"
              type="textarea"
              rows="3"
              placeholder="点击输入您的祝福语..."
              :readonly="false"
              @focus="onBlessingFocus"
              @blur="onBlessingBlur"
              class="blessing-input"
            />
            <p class="blessing-tip">展示抽中当次发送的祝福语，可手动修改</p>
          </div>
        </div>

        <!-- 交易信息 -->
        <div class="trade-section">
          <h2 class="section-title">交易信息</h2>
          <div class="trade-info">
            <div class="trade-item">
              <span class="trade-label">发行总量</span>
              <span class="trade-value">{{ collection.totalSupply }}件</span>
            </div>
            <div class="trade-item">
              <span class="trade-label">当前持有者</span>
              <span class="trade-value">{{ collection.holders }}人</span>
            </div>
            <div class="trade-item">
              <span class="trade-label">交易次数</span>
              <span class="trade-value">{{ collection.tradeCount }}次</span>
            </div>
            <div class="trade-item">
              <span class="trade-label">创建时间</span>
              <span class="trade-value">{{ formatDate(collection.createdAt) }}</span>
            </div>
          </div>
        </div>

        <!-- 惊喜加倍提示 -->
        <div class="surprise-section">
          <div class="surprise-content">
            <van-icon name="gift-o" size="20" color="#ff6b6b" />
            <span class="surprise-text">惊喜加倍实体勋章好礼，活动后统一邮寄至手中</span>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="action-buttons">
          <van-button 
            type="primary" 
            size="large"
            @click="handleShare"
            class="share-btn"
          >
            <van-icon name="share-o" size="18" />
            分享
          </van-button>
        </div>
      </div>

      <!-- 底部导航 -->
      <van-tabbar v-model="activeTab" fixed>
        <van-tabbar-item name="home" icon="home-o" @click="goHome">首页</van-tabbar-item>
        <van-tabbar-item name="market" icon="chart-trending-o" @click="goMarket">市场</van-tabbar-item>
        <van-tabbar-item name="collection" icon="photo-o" @click="goCollections">我的藏品</van-tabbar-item>
        <van-tabbar-item name="profile" icon="user-o" @click="goProfile">个人中心</van-tabbar-item>
      </van-tabbar>
    </div>

    <!-- 购买确认对话框 -->
    <van-dialog
      v-model="showBuyDialog"
      title="确认购买"
      show-cancel-button
      @confirm="confirmBuy"
    >
      <div class="dialog-content">
        <p>确认购买藏品《{{ collection.name }}》？</p>
        <p class="dialog-price">价格：¥{{ formatPrice(collection.price) }}</p>
      </div>
    </van-dialog>

    <!-- 出价对话框 -->
    <van-dialog
      v-model="showOfferDialog"
      title="出价购买"
      show-cancel-button
      @confirm="confirmOffer"
    >
      <div class="dialog-content">
        <p>为藏品《{{ collection.name }}》出价</p>
        <van-field
          v-model="offerPrice"
          label="出价金额"
          placeholder="请输入出价金额"
          type="number"
        />
        <p class="dialog-tip">当前价格：¥{{ formatPrice(collection.price) }}</p>
      </div>
    </van-dialog>
  </div>
</template>

<script>
import { Swiper, SwiperSlide } from 'swiper/vue'
// 对于 Vue 3，使用以下方式导入模块
import SwiperCore, { Pagination, Navigation } from 'swiper'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'

export default {
  name: 'CollectionDetail',
  components: {
    Swiper,
    SwiperSlide
  },
  data() {
    return {
      activeTab: 'collection',
      activeThumb: 0,
      isFavorite: false,
      buyLoading: false,
      showBuyDialog: false,
      showOfferDialog: false,
      offerPrice: '',
      blessingText: '恭喜获得35周年限定藏品！新征程，新起点，共创美好未来！',
      swiperInstance: null,
      collection: {
        id: '001',
        name: '新征程新起点35周年限定藏品',
        images: [
          'https://images.unsplash.com/photo-1541961017774-22349e4a1262?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        ],
        price: 0, // 限定藏品可能免费
        priceChange: 0,
        tags: ['35周年限定', '限量700个', '纪念藏品'],
        attributes: [
          { name: '发行方', value: '新征程新起点组委会' },
          { name: '藏品类型', value: '35周年纪念限定' },
          { name: '发行数量', value: '700个' },
          { name: '藏品编号', value: '#001/700' },
          { name: '发行时间', value: '2023年12月' },
          { name: '纪念意义', value: '35周年里程碑' },
          { name: '附加权益', value: '实体勋章邮寄' },
          { name: '收藏价值', value: '纪念珍藏' }
        ],
        description: '《新征程新起点35周年限定藏品》是为庆祝重要里程碑特别发行的纪念数字藏品。每一件都承载着35年的辉煌历程与美好回忆，象征着新的开始与无限可能。此藏品不仅具有数字收藏价值，还附赠实体勋章好礼，活动结束后将统一邮寄至获奖者手中。',
        totalSupply: 700,
        holders: 350,
        tradeCount: 0,
        createdAt: '2023-12-01T10:00:00Z'
      }
    }
  },
  created() {
    // 从路由参数获取藏品ID
    const collectionId = this.$route.params.id || '001'
    this.loadCollectionData(collectionId)
  },
  methods: {
    goBack() {
      this.$router.back()
    },
    
    goHome() {
      this.$router.push('/')
    },
    
    goMarket() {
      this.$router.push('/ScreenDisplay')
    },
    
    goCollections() {
      this.$router.push('/collections')
    },
    
    goProfile() {
      this.$router.push('/GeekProfile')
    },
    
    loadCollectionData(id) {
      // 这里应该调用API获取藏品数据
      // 暂时使用模拟数据
      console.log('加载藏品数据:', id)
    },
    
    onSwiperReady(swiper) {
      this.swiperInstance = swiper
      console.log('Swiper实例已初始化:', swiper)
    },
    
    onSlideChange() {
      console.log('幻灯片切换')
    },
    
    toggleFavorite() {
      this.isFavorite = !this.isFavorite
      this.$toast({
        message: this.isFavorite ? '已添加到收藏' : '已取消收藏',
        position: 'top'
      })
    },
    
    formatPrice(price) {
      return price.toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    },
    
    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },
    
    handleBuy() {
      this.showBuyDialog = true
    },
    
    handleOffer() {
      this.offerPrice = this.collection.price.toFixed(2)
      this.showOfferDialog = true
    },
    
    confirmBuy() {
      this.buyLoading = true
      // 模拟API调用
      setTimeout(() => {
        this.buyLoading = false
        this.$toast.success('购买成功！')
        this.showBuyDialog = false
      }, 1500)
    },
    
    confirmOffer() {
      const price = parseFloat(this.offerPrice)
      if (isNaN(price) || price <= 0) {
        this.$toast.fail('请输入有效的出价金额')
        return
      }
      
      // 模拟API调用
      this.$toast.loading({
        message: '提交出价中...',
        forbidClick: true,
        duration: 1000
      })
      
      setTimeout(() => {
        this.$toast.success('出价提交成功！')
        this.showOfferDialog = false
        this.offerPrice = ''
      }, 1500)
    },
    
    onBlessingFocus() {
      console.log('祝福语输入框获得焦点')
      // 在实际应用中，这里可以触发键盘弹出等操作
    },
    
    onBlessingBlur() {
      console.log('祝福语输入框失去焦点')
      // 保存祝福语到服务器
      this.saveBlessingText()
    },
    
    saveBlessingText() {
      // 模拟保存祝福语到服务器
      this.$toast.loading({
        message: '保存祝福语中...',
        forbidClick: true,
        duration: 800
      })
      
      setTimeout(() => {
        this.$toast.success('祝福语已保存！')
      }, 1000)
    },
    
    handleShare() {
      // 唤起分享功能
      this.$toast.loading({
        message: '准备分享...',
        forbidClick: true,
        duration: 800
      })
      
      setTimeout(() => {
        // 在实际应用中，这里应该调用原生分享或显示分享对话框
        this.showShareDialog()
      }, 1000)
    },
    
    showShareDialog() {
      this.$dialog.alert({
        title: '分享藏品',
        message: '选择分享方式',
        showCancelButton: true,
        confirmButtonText: '微信分享',
        cancelButtonText: '复制链接'
      }).then(() => {
        // 微信分享
        this.$toast.success('已唤起微信分享')
      }).catch(() => {
        // 复制链接
        this.copyShareLink()
      })
    },
    
    copyShareLink() {
      const shareLink = `${window.location.origin}/collection/${this.collection.id}`
      // 在实际应用中，这里应该使用clipboard API复制链接
      navigator.clipboard.writeText(shareLink).then(() => {
        this.$toast.success('链接已复制到剪贴板')
      }).catch(() => {
        // 备用方案
        const textArea = document.createElement('textarea')
        textArea.value = shareLink
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        this.$toast.success('链接已复制到剪贴板')
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.collection-detail {
  min-height: 100vh;
  background: #f5f5f5;
  padding-top: 46px; // 导航栏高度
  padding-bottom: 50px; // 底部导航高度
}

.detail-container {
  max-width: 750px;
  margin: 0 auto;
  background: #fff;
}

.swiper-section {
  position: relative;
  background: #000;
  height: 400px;
  
  .collection-swiper {
    width: 100%;
    height: 100%;
    
    .swiper-slide-content {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .swiper-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    // Swiper样式覆盖 - 适配vue-awesome-swiper
    :deep(.swiper-pagination-bullet) {
      width: 8px;
      height: 8px;
      background: rgba(255, 255, 255, 0.5);
      opacity: 1;
      
      &.swiper-pagination-bullet-active {
        background: #1989fa;
        width: 20px;
        border-radius: 4px;
      }
    }
    
    :deep(.swiper-button-prev),
    :deep(.swiper-button-next) {
      color: #fff;
      width: 40px;
      height: 40px;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 50%;
      
      &::after {
        font-size: 18px;
        font-weight: bold;
      }
      
      &:hover {
        background: rgba(0, 0, 0, 0.5);
      }
    }
    
    :deep(.swiper-button-prev) {
      left: 10px;
    }
    
    :deep(.swiper-button-next) {
      right: 10px;
    }
    
    // 添加分页器容器样式
    :deep(.swiper-pagination) {
      bottom: 10px;
    }
  }
  
  .favorite-btn {
    position: absolute;
    top: 15px;
    right: 15px;
    width: 44px;
    height: 44px;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 10;
    transition: all 0.3s ease;
    
    &:hover {
      background: rgba(255, 255, 255, 1);
      transform: scale(1.1);
    }
  }
}

.info-section {
  padding: 20px;
}

.collection-header {
  margin-bottom: 20px;
  
  .collection-name {
    font-size: 24px;
    font-weight: 600;
    color: #333;
    margin-bottom: 10px;
    line-height: 1.4;
  }
  
  .collection-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
}

.price-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  color: #fff;
  
  .current-price {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    
    .price-label {
      font-size: 14px;
      opacity: 0.9;
    }
    
    .price-value {
      font-size: 32px;
      font-weight: 700;
    }
  }
  
  .price-change {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .change-label {
      font-size: 14px;
      opacity: 0.9;
    }
    
    .change-value {
      font-size: 18px;
      font-weight: 600;
      
      &.up {
        color: #00b894;
      }
      
      &.down {
        color: #ff7675;
      }
    }
  }
}

.attributes-section {
  margin-bottom: 20px;
  
  .section-title {
    font-size: 18px;
    font-weight: 600;
    color: #333;
    margin-bottom: 15px;
    padding-bottom: 8px;
    border-bottom: 2px solid #f0f0f0;
  }
  
  .attributes-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    
    .attribute-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      background: #f8f9fa;
      border-radius: 8px;
      
      .attr-name {
        font-size: 14px;
        color: #666;
      }
      
      .attr-value {
        font-size: 14px;
        font-weight: 500;
        color: #333;
      }
    }
  }
}

.description-section {
  margin-bottom: 20px;
  
  .section-title {
    font-size: 18px;
    font-weight: 600;
    color: #333;
    margin-bottom: 15px;
    padding-bottom: 8px;
    border-bottom: 2px solid #f0f0f0;
  }
  
  .description-content {
    p {
      font-size: 15px;
      line-height: 1.6;
      color: #555;
      margin: 0;
    }
  }
}

.trade-section {
  margin-bottom: 20px;
  
  .section-title {
    font-size: 18px;
    font-weight: 600;
    color: #333;
    margin-bottom: 15px;
    padding-bottom: 8px;
    border-bottom: 2px solid #f0f0f0;
  }
  
  .trade-info {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    
    .trade-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      background: #f8f9fa;
      border-radius: 8px;
      
      .trade-label {
        font-size: 14px;
        color: #666;
      }
      
      .trade-value {
        font-size: 14px;
        font-weight: 500;
        color: #333;
      }
    }
  }
}

.blessing-section {
  margin-bottom: 20px;
  
  .section-title {
    font-size: 18px;
    font-weight: 600;
    color: #333;
    margin-bottom: 15px;
    padding-bottom: 8px;
    border-bottom: 2px solid #f0f0f0;
  }
  
  .blessing-content {
    .blessing-input {
      :deep(.van-field__control) {
        font-size: 15px;
        line-height: 1.5;
        color: #333;
        min-height: 80px;
        padding: 12px;
        background: #f8f9fa;
        border-radius: 8px;
        border: 1px solid #e8e8e8;
        
        &:focus {
          border-color: #1989fa;
          background: #fff;
        }
      }
    }
    
    .blessing-tip {
      font-size: 13px;
      color: #999;
      margin-top: 8px;
      text-align: center;
    }
  }
}

.surprise-section {
  margin: 20px 0;
  padding: 15px;
  background: linear-gradient(135deg, #fff9e6 0%, #fff0cc 100%);
  border-radius: 12px;
  border: 1px solid #ffd166;
  
  .surprise-content {
    display: flex;
    align-items: center;
    gap: 10px;
    
    .surprise-text {
      font-size: 15px;
      font-weight: 500;
      color: #d35400;
      line-height: 1.4;
    }
  }
}

.action-buttons {
  display: flex;
  gap: 12px;
  margin-top: 20px;
  
  .van-button {
    flex: 1;
    height: 48px;
    font-size: 16px;
    font-weight: 500;
    border-radius: 24px;
    
    &.share-btn {
      background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
      border: none;
      color: #fff;
      
      .van-icon {
        margin-right: 8px;
      }
    }
  }
}

.dialog-content {
  padding: 20px;
  
  p {
    margin: 10px 0;
    font-size: 16px;
    color: #333;
  }
  
  .dialog-price {
    font-size: 20px;
    font-weight: 600;
    color: #1989fa;
  }
  
  .dialog-tip {
    font-size: 14px;
    color: #999;
    margin-top: 15px;
  }
}

// 响应式设计
@media (max-width: 480px) {
  .image-section {
    .main-image {
      height: 300px;
    }
  }
  
  .collection-header {
    .collection-name {
      font-size: 20px;
    }
  }
  
  .price-section {
    .current-price {
      .price-value {
        font-size: 28px;
      }
    }
  }
  
  .attributes-grid,
  .trade-info {
    grid-template-columns: 1fr !important;
  }
  
  .action-buttons {
    flex-direction: column;
    
    .van-button {
      width: 100%;
    }
  }
}
</style>