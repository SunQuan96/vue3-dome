<template>
  <div class="screen-display">
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

      <!-- 实时语音转写区域 -->
      <div class="speech-transcription" v-if="speechList && speechList.length > 0">
        <div
          v-for="(item, index) in speechList"
          :key="item.id || index"
          class="speech-item"
          :class="`speaker-${item.speakerId || 1}`"
          :style="getSpeechStyle(item)"
        >
          <span class="speaker-label">{{ item.speakerName || '主讲人' }}：</span>
          <span class="speech-content">{{ item.text || '' }}</span>
        </div>
      </div>

      <!-- 置顶弹幕区域 -->
      <div class="pinned-danmaku-container" v-if="pinnedDanmaku && pinnedDanmaku.length > 0">
        <div
          v-for="(item, index) in pinnedDanmaku"
          :key="`pinned-${item.id}`"
          class="danmaku-item danmaku-pinned"
          :style="getPinnedDanmakuStyle(item, index)"
        >
          <span class="danmaku-sender">{{ item.sender }}</span>
          <span class="danmaku-content">{{ item.content }}</span>
          <span class="pinned-badge">置顶</span>
        </div>
      </div>

      <!-- 弹幕区域 -->
      <div class="danmaku-container" ref="danmakuContainer">
        <div
          v-for="(item, index) in normalDanmaku"
          :key="item.id || index"
          :class="['danmaku-item', `danmaku-${item.type || 'normal'}`]"
          :style="getDanmakuStyle(item, index)"
        >
          <span v-if="item.sender" class="danmaku-sender">{{ item.sender }}</span>
          <span class="danmaku-content">{{ item.content || '' }}</span>
          <span v-if="item.likeCount > 0" class="danmaku-like">
            <van-icon name="good-job" />{{ item.likeCount }}
          </span>
        </div>
      </div>

      <!-- 主讲人信息与热词看板轮播 -->
      <div class="carousel-section">
        <div
          v-if="showSpeakerInfo"
          class="carousel-item speaker-carousel"
          :class="{ active: currentCarouselIndex === 0 }"
        >
          <div class="speaker-card-mini">
            <img :src="speakerInfo.avatar" :alt="speakerInfo.name" class="speaker-avatar-mini" />
            <div class="speaker-details-mini">
              <h3 class="speaker-name-mini">{{ speakerInfo.name }}</h3>
              <p class="speaker-title-mini">{{ speakerInfo.title }}</p>
            </div>
          </div>
        </div>

        <div
          v-if="hotWords.length > 0"
          class="carousel-item hotwords-carousel"
          :class="{ active: currentCarouselIndex === 1 }"
        >
          <div class="hotwords-board">
            <div class="hotwords-title">热词看板</div>
            <div class="hotwords-list">
              <div
                v-for="(word, index) in hotWords"
                :key="index"
                class="hotword-item"
                :style="getHotwordStyle(word)"
              >
                <span class="hotword-text">{{ word.text }}</span>
                <span class="hotword-count">{{ word.count }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { fetchData } from '@/service'
import { useDanmakuStore } from '@/store/danmaku'
import { getLocalDanmaku, onDanmakuEvent } from '@/utils/danmakuLocal'

// 简单的二维码生成（使用在线服务）
function generateQRCode(text) {
  // 使用在线二维码生成服务
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}`
}

export default {
  name: 'ScreenDisplay',
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
      currentCarouselIndex: 0, // 当前轮播索引
      carouselTimer: null,
      showSpeakerInfo: true, // 是否显示主讲人信息
      danmakuTimer: null, // 弹幕更新定时器
      ws: null, // WebSocket 连接
      danmakuStore: null, // Store 实例
      speechList: [], // 实时语音转写列表
      pinnedDanmaku: [], // 置顶弹幕列表
      pinnedTimer: null, // 置顶弹幕循环播放定时器
      currentPinnedIndex: 0, // 当前播放的置顶弹幕索引
      speechTimer: null, // 语音转写更新定时器
      unsubscribeDanmaku: null // 弹幕事件取消订阅函数
    }
  },
  computed: {
    // 从 store 获取弹幕列表
    danmakuList() {
      return this.danmakuStore ? this.danmakuStore.danmakuList : []
    },
    displayDanmaku() {
      return this.danmakuStore ? this.danmakuStore.displayDanmaku : []
    },
    hotWords() {
      return this.danmakuStore ? this.danmakuStore.hotWords : []
    },
    // 过滤掉置顶弹幕的普通弹幕列表
    normalDanmaku() {
      if (!this.displayDanmaku || !Array.isArray(this.displayDanmaku)) {
        return []
      }
      return this.displayDanmaku.filter(item => item && item.type !== 'pinned')
    }
  },
  created() {
    try {
      // 初始化 store
      this.danmakuStore = useDanmakuStore()
      const activityId = (this.$route && this.$route.query && this.$route.query.activityId) || 'default'
      this.danmakuStore.setActivityId(activityId)
    } catch (error) {
      console.error('初始化 store 失败:', error)
    }
  },
  mounted() {
    this.initQRCode()
    this.initWebSocket()
    this.loadSpeakerInfo()
    if (this.mode === 'during') {
      this.startCarousel()
      this.startDanmakuUpdate()
    }
  },
  beforeUnmount() {
    this.clearTimers()
    if (this.ws) {
      this.ws.close()
    }
    // 取消弹幕事件监听
    if (this.unsubscribeDanmaku) {
      this.unsubscribeDanmaku()
    }
  },
  methods: {
    // 初始化二维码
    initQRCode() {
      const activityId = (this.$route && this.$route.query && this.$route.query.activityId) || 'default'
      const participantUrl = `${window.location.origin}/participant?activityId=${activityId}`
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

    // 初始化 WebSocket
    initWebSocket() {
      const activityId = (this.$route && this.$route.query && this.$route.query.activityId) || 'default'
      const wsUrl = `ws://localhost:8080/ws/danmaku?activityId=${activityId}`
      try {
        this.ws = new WebSocket(wsUrl)
        this.ws.onmessage = (event) => {
          const data = JSON.parse(event.data)
          this.handleWebSocketMessage(data)
        }
        this.ws.onerror = (error) => {
          console.error('WebSocket 错误:', error)
          // 降级为轮询
          this.startPolling()
        }
        this.ws.onclose = () => {
          console.log('WebSocket 连接关闭')
          this.startPolling()
        }
      } catch (error) {
        console.error('WebSocket 连接失败，使用轮询:', error)
        this.startPolling()
      }
    },

    // 处理 WebSocket 消息
    handleWebSocketMessage(data) {
      if (data.type === 'danmaku') {
        this.danmakuStore.addDanmaku({
          type: 'real',
          ...data.danmaku
        })
      } else if (data.type === 'hotwords') {
        // 热词由 store 自动更新
      } else if (data.type === 'ai_danmaku') {
        this.danmakuStore.addDanmaku({
          type: 'ai',
          content: data.danmaku.content
        })
      }
    },

    // 轮询获取数据（降级方案）
    startPolling() {
      const activityId = (this.$route && this.$route.query && this.$route.query.activityId) || 'default'
      
      // 先加载本地存储的弹幕
      const localDanmaku = getLocalDanmaku(activityId)
      localDanmaku.forEach(item => {
        this.danmakuStore.addDanmaku(item)
      })

      // 监听新弹幕事件
      const unsubscribe = onDanmakuEvent((event) => {
        if (event.detail.activityId === activityId) {
          this.danmakuStore.addDanmaku(event.detail.danmaku)
        }
      })

      // 保存取消订阅函数，在组件销毁时调用
      this.unsubscribeDanmaku = unsubscribe

      // 同时尝试轮询 API（如果后端可用）
      setInterval(async () => {
        try {
          const response = await fetchData('/danmaku/latest', {
            activityId: activityId
          })
          if (response && response.data) {
            if (response.data.danmaku) {
              response.data.danmaku.forEach(item => {
                this.danmakuStore.addDanmaku(item)
              })
            }
          }
        } catch (error) {
          // API 失败时静默处理，使用本地存储
        }
      }, 2000)
    },

    // 加载主讲人信息
    async loadSpeakerInfo() {
      try {
        const activityId = (this.$route && this.$route.query && this.$route.query.activityId) || 'default'
        const response = await fetchData('/speaker/info', {
          activityId: activityId
        })
        if (response && response.data) {
          this.speakerInfo = {
            name: response.data.name || this.speakerInfo.name,
            title: response.data.title || this.speakerInfo.title,
            description: response.data.description || this.speakerInfo.description,
            avatar: response.data.avatar || this.speakerInfo.avatar
          }
        }
      } catch (error) {
        console.error('加载主讲人信息失败:', error)
      }
    },

    // 获取弹幕样式
    getDanmakuStyle(item, index) {
      const top = (index % 10) * 60 + 20
      const duration = 15 + Math.random() * 5
      return {
        top: `${top}px`,
        animationDuration: `${duration}s`
      }
    },

    // 获取热词样式
    getHotwordStyle(word) {
      const maxCount = Math.max(...this.hotWords.map(w => w.count), 1)
      const fontSize = 16 + (word.count / maxCount) * 20
      const opacity = 0.7 + (word.count / maxCount) * 0.3
      return {
        fontSize: `${fontSize}px`,
        opacity: opacity,
        fontWeight: word.count > maxCount * 0.5 ? 'bold' : 'normal'
      }
    },

    // 切换模式（保留兼容性）
    switchMode() {
      this.mode = this.mode === 'before' ? 'during' : 'before'
      this.modeTabIndex = this.mode
      if (this.mode === 'during') {
        this.startCarousel()
        this.startDanmakuUpdate()
        this.startSpeechTranscription()
        this.startPinnedDanmaku()
      } else {
        this.clearTimers()
      }
    },

    // 处理模式 TAB 切换
    handleModeTabChange(name) {
      this.mode = name
      this.modeTabIndex = name
      if (this.mode === 'during') {
        this.startCarousel()
        this.startDanmakuUpdate()
        this.startSpeechTranscription()
        this.startPinnedDanmaku()
      } else {
        this.clearTimers()
      }
    },

    // 开始轮播
    startCarousel() {
      if (this.hotWords.length >= 5) {
        // 热词量达到5个，一直展示热词看板
        this.showSpeakerInfo = false
        this.currentCarouselIndex = 1
        return
      }

      this.carouselTimer = setInterval(() => {
        if (this.showSpeakerInfo && this.hotWords.length > 0) {
          this.currentCarouselIndex = this.currentCarouselIndex === 0 ? 1 : 0
        }
      }, 5000)
    },

    // 开始弹幕更新（弹幕由 store 管理，这里不需要额外更新）
    startDanmakuUpdate() {
      // 弹幕显示由 computed 属性自动更新
      // 添加一些测试弹幕数据
      if (this.danmakuStore && this.danmakuStore.danmakuList.length === 0) {
        const testDanmaku = [
          { type: 'real', sender: '用户1', content: '这个演讲太精彩了！' },
          { type: 'real', sender: '用户2', content: '学到了很多新知识' },
          { type: 'ai', content: 'AI弹幕：这是一个测试弹幕' },
          { type: 'real', sender: '用户3', content: '主讲人讲得真好' },
          { type: 'real', sender: '用户4', content: '期待更多这样的活动' }
        ]
        
        testDanmaku.forEach(item => {
          this.danmakuStore.addDanmaku(item)
        })
      }
    },

    // 开始实时语音转写
    startSpeechTranscription() {
      // 模拟语音转写数据（实际应该从 WebSocket 或 API 获取）
      this.speechTimer = setInterval(() => {
        // 这里应该从 API 或 WebSocket 获取实时转写数据
        // 示例：模拟语音转写
        this.loadSpeechTranscription()
      }, 3000)
    },

    // 加载语音转写数据
    async loadSpeechTranscription() {
      try {
        const activityId = (this.$route && this.$route.query && this.$route.query.activityId) || 'default'
        const response = await fetchData('/speech/transcription', {
          activityId: activityId
        })
        if (response && response.data && response.data.speechList) {
          // 只保留最近 5 条
          this.speechList = response.data.speechList.slice(-5)
        }
      } catch (error) {
        // API 失败时使用模拟数据
        this.loadMockSpeechTranscription()
      }
    },

    // 加载模拟语音转写数据
    loadMockSpeechTranscription() {
      // 模拟数据，实际应该从实时转写服务获取
      if (Math.random() > 0.7) {
        const newSpeech = {
          id: Date.now(),
          speakerId: Math.random() > 0.5 ? 1 : 2,
          speakerName: Math.random() > 0.5 ? '主讲人' : '嘉宾',
          text: '这是一段实时转写的语音内容'
        }
        this.speechList.push(newSpeech)
        // 只保留最近 5 条
        if (this.speechList.length > 5) {
          this.speechList.shift()
        }
      }
    },

    // 开始置顶弹幕循环播放
    startPinnedDanmaku() {
      // 从 store 中获取置顶弹幕
      this.updatePinnedDanmaku()
      
      // 每 3 分钟循环播放一次置顶弹幕
      this.pinnedTimer = setInterval(() => {
        this.currentPinnedIndex = (this.currentPinnedIndex + 1) % (this.pinnedDanmaku.length || 1)
        this.updatePinnedDanmaku()
      }, 3 * 60 * 1000) // 3分钟
    },

    // 更新置顶弹幕
    updatePinnedDanmaku() {
      if (!this.danmakuStore) return
      
      // 从所有弹幕中筛选出置顶弹幕
      const allPinned = this.danmakuStore.danmakuList.filter(item => item && item.type === 'pinned')
      
      // 如果有置顶弹幕，显示当前索引的弹幕
      if (allPinned.length > 0) {
        this.pinnedDanmaku = [allPinned[this.currentPinnedIndex % allPinned.length]]
      } else {
        this.pinnedDanmaku = []
      }
    },

    // 获取置顶弹幕样式
    getPinnedDanmakuStyle(item, index) {
      return {
        top: `${100 + index * 80}px`,
        left: '50%',
        transform: 'translateX(-50%)'
      }
    },

    // 获取语音转写样式
    getSpeechStyle(item) {
      // 根据说话人设置不同颜色和字号
      const speakerStyles = {
        'speaker-1': { color: '#ff6b6b', fontSize: '32px' }, // 主讲人
        'speaker-2': { color: '#4ecdc4', fontSize: '28px' }, // 其他说话人
        'speaker-3': { color: '#95e1d3', fontSize: '28px' }
      }
      
      const speakerId = item.speakerId || 1
      const style = speakerStyles[`speaker-${speakerId}`] || speakerStyles['speaker-2']
      
      return {
        color: style.color,
        fontSize: style.fontSize,
        fontWeight: speakerId === 1 ? '600' : '400'
      }
    },

    // 清除定时器
    clearTimers() {
      if (this.carouselTimer) {
        clearInterval(this.carouselTimer)
        this.carouselTimer = null
      }
      if (this.danmakuTimer) {
        clearInterval(this.danmakuTimer)
        this.danmakuTimer = null
      }
      if (this.speechTimer) {
        clearInterval(this.speechTimer)
        this.speechTimer = null
      }
      if (this.pinnedTimer) {
        clearInterval(this.pinnedTimer)
        this.pinnedTimer = null
      }
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
}

// 模式一：未开始前
.mode-before {
  display: flex;
    flex-direction: row;
    justify-content: flex-start;
    height: 100vh;
    padding: 40px 40px 80px 40px;
    gap: 40px;
    align-items: center;
    position: relative;
}

.qr-code-section {
  .qr-code-wrapper {
    text-align: center;
    background: #fff;
    padding: 30px;
    border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);

    .qr-code-title {
      font-size: 24px;
      font-weight: 600;
      color: #333;
      margin-bottom: 20px;
    }

    .qr-code-box {
      display: inline-block;
      padding: 20px;
      background: #fff;
      border-radius: 8px;
    }

    .qr-code-tip {
      margin-top: 20px;
      font-size: 16px;
      color: #666;
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
  bottom: 40px;
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

.top-bar {
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  gap: 20px;
  align-items: center;
  z-index: 100;

  .qr-code-mini {
    background: rgba(255, 255, 255, 0.9);
    padding: 10px;
    border-radius: 8px;
  }


}

// 实时语音转写区域
.speech-transcription {
  position: absolute;
  top: 80px;
  left: 40px;
  right: 40px;
  z-index: 20;
  max-height: 200px;
  overflow: hidden;

  .speech-item {
    margin-bottom: 16px;
    padding: 12px 20px;
    background: rgba(0, 0, 0, 0.6);
    border-radius: 8px;
    backdrop-filter: blur(10px);
    line-height: 1.6;

    .speaker-label {
      font-weight: 600;
      margin-right: 8px;
    }

    .speech-content {
      display: inline-block;
    }
  }
}

// 置顶弹幕容器
.pinned-danmaku-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  pointer-events: none;
}

.danmaku-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.danmaku-item {
  position: absolute;
  white-space: nowrap;
  font-size: 24px;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 20px;
  animation: danmaku-move linear infinite;
  pointer-events: none;
  z-index: 10;

  &.danmaku-ai {
    background: rgba(255, 255, 255, 0.8);
    color: #333;
  }

  &.danmaku-real {
    background: linear-gradient(90deg, #ff6b6b, #ee5a6f);
    color: #fff;
    box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4);
  }

  &.danmaku-similar {
    background: rgba(255, 193, 7, 0.9);
    color: #fff;
    box-shadow: 0 4px 12px rgba(255, 193, 7, 0.4);
  }

  .danmaku-sender {
    margin-right: 8px;
    font-weight: 600;
  }

  .danmaku-content {
    display: inline-block;
  }

  .danmaku-count {
    margin-left: 8px;
    font-weight: 700;
    font-size: 20px;
  }
}

@keyframes danmaku-move {
  from {
    transform: translateX(100vw);
  }
  to {
    transform: translateX(-100%);
  }
}

.carousel-section {
  position: absolute;
  bottom: 450px;
  left: 400px;
  right: -300px;
  z-index: 50;
}

.carousel-item {
  position: absolute;
  opacity: 0;
  transition: opacity 0.5s;
  width: 30%;

  &.active {
    opacity: 1;
  }
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

.hotwords-carousel {
  .hotwords-board {
    background: rgba(255, 255, 255, 0.95);
    padding: 30px;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);

    .hotwords-title {
      font-size: 28px;
      font-weight: 700;
      color: #333;
      margin-bottom: 20px;
      text-align: center;
    }

    .hotwords-list {
      display: flex;
      flex-wrap: wrap;
      gap: 15px;
      justify-content: center;
    }

    .hotword-item {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
      padding: 12px 20px;
      border-radius: 20px;
      display: flex;
      align-items: center;
      gap: 10px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);

      .hotword-text {
        font-weight: 600;
      }

      .hotword-count {
        background: rgba(255, 255, 255, 0.3);
        padding: 2px 8px;
        border-radius: 10px;
        font-size: 12px;
      }
    }
  }
}

.mode-tabs-bottom {
  position: absolute;
  bottom: 40px;
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
