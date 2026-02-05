<template>
  <div class="screen-display">
    <!-- 导航栏 -->
    <van-nav-bar 
      title="公屏端"
      left-arrow
      @click-left="goBack"
      fixed/>
      <!-- <template #right>
        <van-icon name="search" size="18" />
      </template> -->
    <!-- </van-nav-bar> -->

    <!-- 模式一：未开始前 -->
    <div v-if="mode === 'before'" class="mode-before">
      <!-- 活动二维码 -->
      <div class="qr-code-section">
        <div class="qr-code-wrapper">
          <div class="qr-code-title">扫描二维码参与互动</div>
          <div class="qr-code-box">
            <canvas ref="qrCanvas" class="qr-canvas" width="200" height="200"></canvas>
          </div>
          <div class="qr-code-tip">使用手机扫描二维码发送弹幕</div>
        </div>
      </div>

      <!-- 主讲人信息 -->
      <div class="speaker-info-section">
        <div class="speaker-card">
          <img :src="speakerInfo.avatar" :alt="speakerInfo.name" class="speaker-avatar" />
          <div class="speaker-details">
            <h2 class="speaker-name">{{ speakerInfo.name }}</h2>
            <p class="speaker-title">{{ speakerInfo.title }}</p>
            <p class="speaker-desc">{{ speakerInfo.description }}</p>
          </div>
        </div>
      </div>

      <!-- 模式切换 TAB -->
      <div class="mode-tabs-section">
        <van-tabs v-model:active="modeTabIndex" @change="handleModeTabChange" type="card">
          <van-tab title="未开始" name="before" />
          <van-tab title="演讲中" name="during" />
        </van-tabs>
      </div>
    </div>

    <!-- 模式二：演讲中 -->
    <div v-if="mode === 'during'" class="mode-during">
      <!-- 顶部信息栏 -->
      <div class="top-bar">
        <div class="qr-code-mini">
          <div class="qr-code-wrapper">
            <div class="qr-code-title">扫描二维码参与互动</div>
            <div class="qr-code-box">
              <canvas ref="qrCanvas" class="qr-canvas" width="200" height="200"></canvas>
            </div>
            <div class="qr-code-tip">使用手机扫描二维码发送弹幕</div>
          </div>
        </div>
      </div>

      <!-- 底部模式切换 TAB -->
      <div class="mode-tabs-bottom">
        <van-tabs v-model:active="modeTabIndex" @change="handleModeTabChange" type="card">
          <van-tab title="未开始" name="before" />
          <van-tab title="演讲中" name="during" />
        </van-tabs>
      </div>

      <!-- 弹幕区域 -->
      <DanmakuDisplay 
        :activity-id="activityId"
        :max-display-count="50"
        :animation-duration="15"
        ref="danmakuDisplay"
      />

      <!-- 主讲人信息与热词看板轮播 -->
      <div class="carousel-section">
        <!-- Swiper Tab 导航 -->
        <div class="swiper-tabs">
          <div 
            v-if="showSpeakerInfo"
            class="swiper-tab"
            :class="{ active: activeTab === 0 }"
            @click="switchTab(0)"
          >
            主讲人
          </div>
          <div 
            class="swiper-tab"
            :class="{ active: activeTab === 1 }"
            @click="switchTab(1)"
          >
            热词词云
          </div>
        </div>

        <!-- Swiper 轮播内容 -->
        <div class="swiper-container">
          <Swiper
            :slides-per-view="1"
            :space-between="0"
            :centered-slides="true"
            :initial-slide="activeTab"
            @slide-change="onSlideChange"
            @swiper="onSwiper"
            ref="swiperRef"
            class="swiper-wrapper"
          >
            <!-- 主讲人信息 -->
            <SwiperSlide v-if="showSpeakerInfo">
              <div class="speaker-carousel">
                <div class="speaker-card-mini">
                  <img :src="speakerInfo.avatar" :alt="speakerInfo.name" class="speaker-avatar-mini" />
                  <div class="speaker-details-mini">
                    <h3 class="speaker-name-mini">{{ speakerInfo.name }}</h3>
                    <p class="speaker-title-mini">{{ speakerInfo.title }}</p>
                  </div>
                </div>
              </div>
            </SwiperSlide>

            <!-- 热词词云 -->
            <SwiperSlide>
              <div class="wordcloud-carousel">
                <div class="wordcloud-board">
                  <div class="wordcloud-title">热词词云</div>
                  <WordCloud :speaker-id="123" />
                </div>
              </div>
            </SwiperSlide>
          </Swiper>
        </div>
      </div>
    </div>
    
    <!-- 底部导航 -->
    <BottomNavigation current-tab="screen" @tab-change="onTabChange" />
  </div>
</template>

<script>
import WordCloud from '@/components/wordCloud.vue'
import DanmakuDisplay from '@/components/DanmakuDisplay.vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import 'swiper/css'
import BottomNavigation from '@/components/BottomNavigation.vue'

// 简单的二维码生成（使用在线服务）
function generateQRCode(text) {
  // 使用在线二维码生成服务
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}`
}

export default {
  name: 'ScreenDisplay',
  components: {
    WordCloud,
    DanmakuDisplay,
    Swiper,
    SwiperSlide,
    BottomNavigation
  },
  data() {
    return {
      mode: 'before', // 'before' | 'during'
      modeTabIndex: 'before', // TAB 索引
      qrCodeUrl: '',
      speakerInfo: {
        name: '主讲人姓名',
        title: '职位/头衔',
        description: '主讲人简介信息',
        avatar: '/images/speaker-default.png'
      },
      activeTab: 0, // 当前激活的Tab索引
      showSpeakerInfo: true, // 是否显示主讲人信息
      danmakuTimer: null, // 弹幕测试数据定时器
      swiperInstance: null // Swiper实例
    }
  },
  computed: {
    activityId() {
      return (this.$route && this.$route.query && this.$route.query.activityId) || 'default'
    }
  },
  mounted() {
    // 初始化二维码
    this.initQRCode()
    
    // 如果是演讲中模式，添加测试弹幕数据
    if (this.mode === 'during') {
      this.startDanmakuTest()
    }
  },
  beforeUnmount() {
    // 清除定时器
    if (this.danmakuTimer) {
      clearInterval(this.danmakuTimer)
      this.danmakuTimer = null
    }
  },
  methods: {
    // 初始化二维码
    initQRCode() {
      const participantUrl = `${window.location.origin}/participant?activityId=${this.activityId}`
      try {
        const qrDataUrl = generateQRCode(participantUrl)
        this.qrCodeUrl = qrDataUrl
        this.$nextTick(() => {
          if (this.$refs.qrCanvas) {
            const img = new Image()
            img.crossOrigin = 'anonymous'
            img.onload = () => {
              const ctx = this.$refs.qrCanvas.getContext('2d')
              this.$refs.qrCanvas.width = 200
              this.$refs.qrCanvas.height = 200
              ctx.drawImage(img, 0, 0, 200, 200)
            }
            img.src = qrDataUrl
          }
        })
      } catch (error) {
        console.error('生成二维码失败:', error)
      }
    },

    // 开始弹幕测试数据
    startDanmakuTest() {
      // 先添加一些初始测试弹幕
      this.addTestDanmaku()
      
      // 定时添加更多测试弹幕
      this.danmakuTimer = setInterval(() => {
        this.addTestDanmaku()
      }, 3000) // 每3秒添加一条测试弹幕
    },

    // 添加测试弹幕
    addTestDanmaku() {
      if (this.$refs.danmakuDisplay) {
        const testDanmaku = [
          { type: 'real', sender: '用户1', content: '这个演讲太精彩了！' },
          { type: 'real', sender: '用户2', content: '学到了很多新知识' },
          { type: 'ai', content: 'AI弹幕：这是一个测试弹幕' },
          { type: 'real', sender: '用户3', content: '主讲人讲得真好' },
          { type: 'real', sender: '用户4', content: '期待更多这样的活动' },
          { type: 'real', sender: '用户5', content: '内容很有深度' },
          { type: 'ai', content: 'AI弹幕：大家积极参与互动' },
          { type: 'real', sender: '用户6', content: '讲得太棒了！' },
          { type: 'real', sender: '用户7', content: '受益匪浅' },
          { type: 'real', sender: '用户8', content: '支持主讲人' }
        ]
        
        // 随机选择一条测试弹幕
        const randomDanmaku = testDanmaku[Math.floor(Math.random() * testDanmaku.length)]
        this.$refs.danmakuDisplay.addDanmaku(randomDanmaku)
      }
    },

    // 处理模式 TAB 切换
    handleModeTabChange(name) {
      this.mode = name
      this.modeTabIndex = name
      
      // 切换模式时处理弹幕测试
      if (this.mode === 'during') {
        this.startDanmakuTest()
      } else {
        if (this.danmakuTimer) {
          clearInterval(this.danmakuTimer)
          this.danmakuTimer = null
        }
      }
    },

    // Swiper实例初始化
    onSwiper(swiper) {
      this.swiperInstance = swiper
    },

    // 切换Tab
    switchTab(index) {
      this.activeTab = index
      if (this.swiperInstance) {
        this.swiperInstance.slideTo(index)
      }
    },

    // Swiper滑动变化
    onSlideChange(swiper) {
      this.activeTab = swiper.activeIndex
    },

    // 返回上一页
    goBack() {
      this.$router.back()
    },
    
    // 底部导航标签页变化
    onTabChange(tabName) {
      // 当标签页变化时，可以在这里处理一些逻辑
      console.log('标签页切换到:', tabName)
    }
  }
}
</script>

<style lang="scss" scoped>
.screen-display {
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: hidden;
  position: relative;
  padding-top: 46px; // 导航栏高度
  padding-bottom: 50px; // 为底部导航栏留出空间
}

// 模式一：未开始前
.mode-before {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: calc(100vh - 46px - 50px); // 减去导航栏高度和底部导航栏高度
  padding: 40px;
  align-items: center;
  position: relative;
}

// 二维码区域
.qr-code-section {
  position: absolute;
  top: 40px;
  right: 40px;
  z-index: 100;

  .qr-code-wrapper {
    background: rgba(255, 255, 255, 0.95);
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    text-align: center;
    max-width: 240px;

    .qr-code-title {
      font-size: 16px;
      font-weight: 600;
      color: #333;
      margin-bottom: 15px;
    }

    .qr-code-box {
      margin: 0 auto 15px;
      width: 200px;
      height: 200px;
      background: #fff;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid #eee;

      .qr-canvas {
        width: 100%;
        height: 100%;
      }
    }

    .qr-code-tip {
      font-size: 14px;
      color: #666;
      line-height: 1.4;
    }
  }
}

.speaker-info-section {
  width: 100%;
  max-width: 800px;

  .speaker-card {
    background: rgba(255, 255, 255, 0.95);
    padding: 40px;
    border-radius: 16px;
    display: flex;
    gap: 30px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);

    .speaker-avatar {
      width: 200px;
      height: 200px;
      border-radius: 12px;
      object-fit: cover;
    }

    .speaker-details {
      flex: 1;

      .speaker-name {
        font-size: 32px;
        font-weight: 700;
        color: #333;
        margin-bottom: 10px;
      }

      .speaker-title {
        font-size: 20px;
        color: #666;
        margin-bottom: 20px;
      }

      .speaker-desc {
        font-size: 16px;
        color: #888;
        line-height: 1.6;
      }
    }
  }
}

.mode-tabs-section {
  position: absolute;
  bottom: 100px; // 调整位置，避免与底部导航栏重叠
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 600px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

// 模式二：演讲中
.mode-during {
  width: 100%;
  height: 100%;
  position: relative;
}

// 顶部信息栏
.top-bar {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 100;

  .qr-code-mini {
    .qr-code-wrapper {
      background: rgba(255, 255, 255, 0.95);
      padding: 15px;
      border-radius: 10px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
      text-align: center;
      max-width: 200px;

      .qr-code-title {
        font-size: 14px;
        font-weight: 600;
        color: #333;
        margin-bottom: 10px;
      }

      .qr-code-box {
        margin: 0 auto 10px;
        width: 150px;
        height: 150px;
        background: #fff;
        border-radius: 6px;
        overflow: hidden;
        border: 1px solid #eee;

        .qr-canvas {
          width: 100%;
          height: 100%;
        }
      }

      .qr-code-tip {
        font-size: 12px;
        color: #666;
        line-height: 1.4;
      }
    }
  }
}

.wordcloud-board {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  height: 100%;
  width:500px;
  display: flex;
  flex-direction: column;

  .wordcloud-title {
    font-size: 24px;
    font-weight: 600;
    color: #333;
    margin-bottom: 15px;
    text-align: center;
  }
}

.wordcloud-carousel {
  .chart-container {
    flex: 1;
    min-height: 400px;
  }
}

/* Swiper Tab 样式 */
.swiper-tabs {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  gap: 20px;

  .swiper-tab {
    padding: 10px 24px;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 8px;
    font-size: 16px;
    font-weight: 500;
    color: #666;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 2px solid transparent;

    &:hover {
      background: rgba(255, 255, 255, 0.9);
      color: #333;
    }

    &.active {
      background: #fff;
      color: #1890ff;
      border-color: #1890ff;
      box-shadow: 0 4px 12px rgba(24, 144, 255, 0.2);
    }
  }
}

.swiper-container {
  width: 100%;
  height: 500px;
  
  .swiper-wrapper {
    height: 100%;
  }
}

.speaker-carousel,
.wordcloud-carousel {
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.carousel-section {
  position: absolute;
  bottom: 100px; // 调整位置，避免与底部导航栏重叠
  left: -250px;
  right: -300px;
  z-index: 50;
}

.speaker-carousel {
  .speaker-card-mini {
    background: rgba(255, 255, 255, 0.95);
    padding: 20px;
    border-radius: 12px;
    display: flex;
    gap: 20px;
    align-items: center;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);

    .speaker-avatar-mini {
      width: 80px;
      height: 80px;
      border-radius: 8px;
      object-fit: cover;
    }

    .speaker-details-mini {
      .speaker-name-mini {
        font-size: 24px;
        font-weight: 600;
        color: #333;
        margin-bottom: 8px;
      }

      .speaker-title-mini {
        font-size: 16px;
        color: #666;
      }
    }
  }
}

.mode-tabs-bottom {
  position: absolute;
  bottom: 100px; // 调整位置，避免与底部导航栏重叠
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 600px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 100;
}
</style>