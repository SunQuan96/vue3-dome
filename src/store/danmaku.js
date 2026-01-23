import { defineStore } from 'pinia'
import { countHotWords, mergeHotWords } from '@/utils/hotWords'

// 弹幕 Store
export const useDanmakuStore = defineStore('danmaku', {
  state: () => ({
    danmakuList: [], // 所有弹幕
    hotWords: [], // 热词列表
    activityId: '',
    aiDanmakuPool: [] // AI 弹幕池（用于相似弹幕检测）
  }),
  getters: {
    // 获取显示的弹幕（最近20条）
    displayDanmaku: (state) => {
      return state.danmakuList.slice(-20)
    },
    // 获取 AI 弹幕
    aiDanmaku: (state) => {
      return state.danmakuList.filter(item => item.type === 'ai')
    },
    // 获取真人弹幕
    realDanmaku: (state) => {
      return state.danmakuList.filter(item => item.type === 'real')
    }
  },
  actions: {
    // 添加弹幕
    addDanmaku(danmaku) {
      const newDanmaku = {
        id: Date.now() + Math.random(),
        type: danmaku.type || 'normal', // normal, assistant, highlight, pinned, liked
        sender: danmaku.sender || '匿名',
        content: danmaku.content,
        isAnonymous: danmaku.isAnonymous || false,
        timestamp: Date.now(),
        activityId: this.activityId,
        likeCount: danmaku.likeCount || 0,
        isAssistant: danmaku.isAssistant || false, // 是否是小助理账号
        isHighlighted: danmaku.isHighlighted || false, // 是否被高亮
        isPinned: danmaku.isPinned || false // 是否置顶
      }
      
      // 根据属性设置类型
      if (newDanmaku.isPinned) {
        newDanmaku.type = 'pinned'
      } else if (newDanmaku.isHighlighted) {
        newDanmaku.type = 'highlight'
      } else if (newDanmaku.isAssistant) {
        newDanmaku.type = 'assistant'
      } else if (newDanmaku.likeCount > 0) {
        newDanmaku.type = 'liked'
      } else {
        newDanmaku.type = 'normal'
      }
      
      this.danmakuList.push(newDanmaku)
      
      // 更新热词
      this.updateHotWords()
    },

    // 处理相似弹幕（仅在 AI 弹幕池中）
    processSimilarDanmaku() {
      const aiDanmaku = this.aiDanmaku
      const contentMap = new Map()

      aiDanmaku.forEach(item => {
        const normalized = this.normalizeContent(item.content)
        if (contentMap.has(normalized)) {
          const existing = contentMap.get(normalized)
          if (existing.type !== 'similar') {
            // 将第一个改为相似类型
            existing.type = 'similar'
            existing.count = 2
          } else {
            existing.count++
          }
        } else {
          contentMap.set(normalized, { ...item, normalized })
        }
      })

      // 更新弹幕列表中的相似弹幕
      this.danmakuList = this.danmakuList.map(item => {
        if (item.type === 'ai') {
          const normalized = this.normalizeContent(item.content)
          const similar = contentMap.get(normalized)
          if (similar && similar.count > 1) {
            return { ...item, type: 'similar', count: similar.count }
          }
        }
        return item
      })
    },

    // 标准化内容（用于相似度判断）
    normalizeContent(content) {
      return content.replace(/[，。！？、；：""''（）【】《》\s]/g, '').trim()
    },

    // 更新热词
    updateHotWords() {
      const allTexts = this.danmakuList.map(item => item.content)
      const newHotWords = countHotWords(allTexts)
      this.hotWords = mergeHotWords(this.hotWords, newHotWords)
        .slice(0, 20) // 只保留前20个
    },

    // 设置活动 ID
    setActivityId(activityId) {
      this.activityId = activityId
    },

    // 清空弹幕
    clearDanmaku() {
      this.danmakuList = []
      this.hotWords = []
      this.aiDanmakuPool = []
    }
  }
})
