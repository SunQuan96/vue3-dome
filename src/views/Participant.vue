<template>
  <div class="participant">
    <!-- 标题栏 -->
    <div class="header-bar">
      <div class="header-title">{{ activityTitle }}</div>
      <div class="header-close" @click="handleClose">
        <van-icon name="cross" />
      </div>
    </div>

    <!-- 中间区域 -->
    <div class="content-area">
      <!-- 演讲背景图 -->
      <div class="background-image">
        <img :src="backgroundImage" alt="演讲背景" />
      </div>

      <!-- 输入框区域 -->
      <div class="input-section" :class="{ expanded: isInputExpanded }">
        <div class="input-wrapper">
          <van-field
            v-model="danmakuContent"
            placeholder="输入弹幕内容..."
            :border="false"
            @focus="handleInputFocus"
            @blur="handleInputBlur"
            @keyup.enter="handleSend"
          >
            <template #button>
              <van-button
                type="primary"
                size="small"
                :disabled="!danmakuContent.trim()"
                @click="handleSend"
              >
                发送
              </van-button>
            </template>
          </van-field>

          <!-- 匿名选项 -->
          <div class="anonymous-option">
            <van-checkbox v-model="isAnonymous">匿名发送</van-checkbox>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载提示 -->
    <van-loading v-if="sending" type="spinner" class="sending-loading">
      发送中...
    </van-loading>
  </div>
</template>

<script>
import { postData, fetchData } from '@/service'
import { filterSensitiveWords } from '@/utils/sensitiveWords'
import { saveLocalDanmaku } from '@/utils/danmakuLocal'
import { showToast } from 'vant'

export default {
  name: 'Participant',
  data() {
    return {
      activityId: '',
      activityTitle: '春茗主题讲座',
      backgroundImage: 'https://images.unsplash.com/photo-1511578314322-379afb476865?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
      danmakuContent: '',
      isInputExpanded: false,
      isAnonymous: false,
      sending: false
    }
  },
  mounted() {
    this.activityId = this.$route.query.activityId || 'default'
    this.loadActivityInfo()
  },
  methods: {
    // 加载活动信息
    async loadActivityInfo() {
      try {
        const response = await fetchData('/activity/info', {
          activityId: this.activityId
        })
        if (response && response.data) {
          this.activityTitle = response.data.title || this.activityTitle
          this.backgroundImage = response.data.backgroundImage || this.backgroundImage
        }
      } catch (error) {
        console.error('加载活动信息失败:', error)
      }
    },

    // 输入框获得焦点
    handleInputFocus() {
      this.isInputExpanded = true
    },

    // 输入框失去焦点
    handleInputBlur() {
      // 延迟收起，避免按钮点击失效
      setTimeout(() => {
        if (!this.danmakuContent.trim()) {
          this.isInputExpanded = false
        }
      }, 200)
    },

    // 发送弹幕
    async handleSend() {
      const content = this.danmakuContent.trim()
      if (!content) {
        showToast('请输入弹幕内容')
        return
      }

      // 敏感词过滤
      const filteredResult = filterSensitiveWords(content)
      if (!filteredResult.passed) {
        showToast('内容包含敏感词，请修改后重试')
        // 记录敏感词到后台
        this.recordSensitiveContent(content, filteredResult.sensitiveWords)
        return
      }

      this.sending = true

      try {
        // 先尝试调用 API
        try {
          const response = await postData('/danmaku/send', {
            activityId: this.activityId,
            content: filteredResult.content,
            isAnonymous: this.isAnonymous,
            sender: this.isAnonymous ? null : '用户' + Math.floor(Math.random() * 1000)
          })

          if (response && response.code === 200) {
            showToast('发送成功')
            this.danmakuContent = ''
            this.isInputExpanded = false
            this.sending = false
            return
          }
        } catch (apiError) {
          // API 失败，使用本地存储
          console.log('API 请求失败，使用本地存储:', apiError)
        }

        // 使用本地存储保存弹幕
        const danmaku = {
          type: 'real',
          content: filteredResult.content,
          isAnonymous: this.isAnonymous,
          sender: this.isAnonymous ? null : '用户' + Math.floor(Math.random() * 1000)
        }
        
        const saved = saveLocalDanmaku(this.activityId, danmaku)
        if (saved) {
          showToast('发送成功')
          this.danmakuContent = ''
          this.isInputExpanded = false
        } else {
          showToast('发送失败，请重试')
        }
      } catch (error) {
        console.error('发送弹幕失败:', error)
        showToast('发送失败，请重试')
      } finally {
        this.sending = false
      }
    },

    // 记录敏感内容
    async recordSensitiveContent(content, sensitiveWords) {
      try {
        // 尝试调用 API
        try {
          await postData('/sensitive/record', {
            activityId: this.activityId,
            content: content,
            sensitiveWords: sensitiveWords,
            timestamp: Date.now()
          })
        } catch (apiError) {
          // API 失败时，在控制台记录
          console.warn('记录敏感内容到服务器失败，已记录到控制台:', {
            activityId: this.activityId,
            content: content,
            sensitiveWords: sensitiveWords,
            timestamp: Date.now()
          })
        }
      } catch (error) {
        console.error('记录敏感内容失败:', error)
      }
    },

    // 关闭页面
    handleClose() {
      if (confirm('确定要关闭页面吗？')) {
        window.close()
        // 如果无法关闭，则返回上一页
        if (this.$router) {
          this.$router.back()
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.participant {
  width: 100%;
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.header-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 50px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 150;

  .header-title {
    font-size: 18px;
    font-weight: 600;
    color: #333;
  }

  .header-close {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #666;

    &:active {
      opacity: 0.6;
    }
  }
}

.content-area {
  flex: 1;
  margin-top: 50px;
  position: relative;
  display: flex;
  flex-direction: column;
  z-index: 1;
}

.background-image {
  flex: 1;
  position: relative;
  overflow: hidden;
  z-index: 1;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.input-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 12px 16px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  z-index: 200;
  transform: translateY(100%);

  &.expanded {
    transform: translateY(0);
  }

  .input-wrapper {
    .van-field {
      background: #f7f8fa;
      border-radius: 24px;
      padding: 8px 16px;
    }

    .anonymous-option {
      margin-top: 8px;
      padding-left: 8px;
    }
  }
}

.sending-loading {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 20px;
  border-radius: 8px;
}
</style>
