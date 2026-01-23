// 敏感词库（示例，实际应该从服务器获取）
const sensitiveWordsList = [
  '敏感词1',
  '敏感词2',
  '政治',
  '色情',
  '暴力',
  '赌博',
  '毒品'
]

/**
 * 过滤敏感词
 * @param {string} content - 待过滤的内容
 * @returns {object} { passed: boolean, content: string, sensitiveWords: array }
 */
export function filterSensitiveWords(content) {
  if (!content || typeof content !== 'string') {
    return { passed: true, content: '', sensitiveWords: [] }
  }

  const sensitiveWords = []
  let filteredContent = content

  // 检查是否包含敏感词
  sensitiveWordsList.forEach(word => {
    if (content.includes(word)) {
      sensitiveWords.push(word)
      // 替换敏感词为 *
      const regex = new RegExp(word, 'g')
      filteredContent = filteredContent.replace(regex, '*'.repeat(word.length))
    }
  })

  return {
    passed: sensitiveWords.length === 0,
    content: filteredContent,
    sensitiveWords: sensitiveWords
  }
}

/**
 * 检查是否包含敏感词（不替换）
 * @param {string} content - 待检查的内容
 * @returns {boolean}
 */
export function hasSensitiveWords(content) {
  if (!content || typeof content !== 'string') {
    return false
  }

  return sensitiveWordsList.some(word => content.includes(word))
}

/**
 * 获取敏感词列表（从服务器）
 * @returns {Promise<Array>}
 */
export async function loadSensitiveWords() {
  try {
    const response = await fetch('/api/sensitive/words')
    const data = await response.json()
    if (data && data.words) {
      sensitiveWordsList.push(...data.words)
    }
    return sensitiveWordsList
  } catch (error) {
    console.error('加载敏感词失败:', error)
    return sensitiveWordsList
  }
}
