/**
 * 本地弹幕存储和事件系统（用于无后端环境）
 */

const STORAGE_KEY = 'danmaku_list'
const EVENT_KEY = 'danmaku_event'

// 获取所有弹幕
export function getLocalDanmaku(activityId) {
  try {
    const data = localStorage.getItem(`${STORAGE_KEY}_${activityId}`)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('获取本地弹幕失败:', error)
    return []
  }
}

// 保存弹幕
export function saveLocalDanmaku(activityId, danmaku) {
  try {
    const list = getLocalDanmaku(activityId)
    const newDanmaku = {
      id: Date.now() + Math.random(),
      ...danmaku,
      timestamp: Date.now()
    }
    list.push(newDanmaku)
    // 只保留最近 1000 条
    const recentList = list.slice(-1000)
    localStorage.setItem(`${STORAGE_KEY}_${activityId}`, JSON.stringify(recentList))
    
    // 触发自定义事件，通知其他页面
    window.dispatchEvent(new CustomEvent(EVENT_KEY, {
      detail: {
        activityId,
        danmaku: newDanmaku,
        type: 'new_danmaku'
      }
    }))
    
    return newDanmaku
  } catch (error) {
    console.error('保存本地弹幕失败:', error)
    return null
  }
}

// 监听弹幕事件
export function onDanmakuEvent(callback) {
  window.addEventListener(EVENT_KEY, callback)
  return () => {
    window.removeEventListener(EVENT_KEY, callback)
  }
}

// 清空弹幕
export function clearLocalDanmaku(activityId) {
  try {
    localStorage.removeItem(`${STORAGE_KEY}_${activityId}`)
  } catch (error) {
    console.error('清空本地弹幕失败:', error)
  }
}
