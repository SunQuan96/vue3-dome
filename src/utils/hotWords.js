/**
 * 提取关键词（简单实现）
 * @param {string} text - 文本内容
 * @returns {Array<string>} 关键词列表
 */
export function extractKeywords(text) {
  if (!text || typeof text !== 'string') {
    return []
  }

  // 移除标点符号和特殊字符
  const cleaned = text.replace(/[，。！？、；：""''（）【】《》\s]/g, '')
  
  // 简单分词（实际应该使用专业分词库）
  const words = []
  const minLength = 2
  const maxLength = 6

  for (let i = 0; i < cleaned.length; i++) {
    for (let len = minLength; len <= maxLength && i + len <= cleaned.length; len++) {
      const word = cleaned.substr(i, len)
      if (word.length >= minLength) {
        words.push(word)
      }
    }
  }

  return words
}

/**
 * 统计热词
 * @param {Array<string>} texts - 文本列表
 * @returns {Array<{text: string, count: number}>} 热词统计
 */
export function countHotWords(texts) {
  const wordCount = new Map()

  texts.forEach(text => {
    const keywords = extractKeywords(text)
    keywords.forEach(word => {
      wordCount.set(word, (wordCount.get(word) || 0) + 1)
    })
  })

  // 转换为数组并排序
  const hotWords = Array.from(wordCount.entries())
    .map(([text, count]) => ({ text, count }))
    .sort((a, b) => b.count - a.count)
    .filter(word => word.count > 1) // 过滤掉只出现一次的

  return hotWords
}

/**
 * 合并热词统计
 * @param {Array} existingHotWords - 现有热词
 * @param {Array} newHotWords - 新热词
 * @returns {Array} 合并后的热词
 */
export function mergeHotWords(existingHotWords, newHotWords) {
  const merged = new Map()

  // 添加现有热词
  existingHotWords.forEach(word => {
    merged.set(word.text, word.count)
  })

  // 合并新热词
  newHotWords.forEach(word => {
    merged.set(word.text, (merged.get(word.text) || 0) + word.count)
  })

  // 转换为数组并排序
  return Array.from(merged.entries())
    .map(([text, count]) => ({ text, count }))
    .sort((a, b) => b.count - a.count)
}
