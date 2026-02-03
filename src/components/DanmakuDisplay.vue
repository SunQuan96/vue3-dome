<template>
  <div class="danmaku-display">
    <div class="danmaku-container" ref="danmakuContainer">
      <div
        v-for="(item, index) in displayDanmaku"
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
  </div>
</template>

<script>
import { useDanmakuStore } from '@/store/danmaku'

export default {
  name: 'DanmakuDisplay',
  props: {
    activityId: {
      type: String,
      default: 'default'
    },
    maxDisplayCount: {
      type: Number,
      default: 50
    },
    animationDuration: {
      type: Number,
      default: 15
    }
  },
  data() {
    return {
      danmakuStore: null,
      unsubscribeDanmaku: null
    }
  },
  computed: {
    displayDanmaku() {
      if (!this.danmakuStore) return []
      const allDanmaku = this.danmakuStore.displayDanmaku || []
      // 过滤掉置顶弹幕，只显示普通弹幕
      return allDanmaku
        .filter(item => item && item.type !== 'pinned')
        .slice(0, this.maxDisplayCount)
    }
  },
  watch: {
    activityId: {
      immediate: true,
      handler(newVal) {
        if (this.danmakuStore) {
          this.danmakuStore.setActivityId(newVal)
        }
      }
    }
  },
  created() {
    try {
      this.danmakuStore = useDanmakuStore()
      this.danmakuStore.setActivityId(this.activityId)
    } catch (error) {
      console.error('初始化弹幕store失败:', error)
    }
  },
  beforeUnmount() {
    if (this.unsubscribeDanmaku) {
      this.unsubscribeDanmaku()
    }
  },
  methods: {
    getDanmakuStyle(item, index) {
      const top = (index % 10) * 60 + 20
      const duration = this.animationDuration + Math.random() * 5
      return {
        top: `${top}px`,
        animationDuration: `${duration}s`
      }
    },
    
    // 添加弹幕的方法（供外部调用）
    addDanmaku(danmaku) {
      if (this.danmakuStore) {
        this.danmakuStore.addDanmaku(danmaku)
      }
    },
    
    // 清空弹幕的方法（供外部调用）
    clearDanmaku() {
      if (this.danmakuStore) {
        this.danmakuStore.clearDanmaku()
      }
    },
    
    // 获取弹幕统计信息（供外部调用）
    getDanmakuStats() {
      if (!this.danmakuStore) return {}
      return {
        total: this.danmakuStore.danmakuList?.length || 0,
        display: this.displayDanmaku.length,
        types: {
          real: this.danmakuStore.danmakuList?.filter(d => d.type === 'real').length || 0,
          ai: this.danmakuStore.danmakuList?.filter(d => d.type === 'ai').length || 0,
          similar: this.danmakuStore.danmakuList?.filter(d => d.type === 'similar').length || 0
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.danmaku-display {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
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

  .danmaku-like {
    margin-left: 8px;
    font-size: 18px;
    display: inline-flex;
    align-items: center;
    gap: 4px;
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
</style>