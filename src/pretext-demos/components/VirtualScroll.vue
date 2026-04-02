<script setup lang="ts">
import { layout, prepare } from '@chenglou/pretext'
import { computed, ref } from 'vue'
import CodeBlock from './CodeBlock.vue'

const FONT = '14px Arial'
const LINE_HEIGHT = 22
const H_PAD = 16
const V_PAD = 10
const ITEM_WIDTH = 620
const INNER_WIDTH = ITEM_WIDTH - H_PAD * 2
const CONTAINER_HEIGHT = 580
const OVERSCAN = 5

const TEMPLATES = [
  (i: number) => `#${i}  Short item.`,
  (i: number) => `#${i}  The quick brown fox jumps over the lazy dog. A medium-length sentence.`,
  (i: number) => `#${i}  中文：天下兴亡，匹夫有责。努力学习，报效祖国。青春不负，奋斗正当时。`,
  (i: number) =>
    `#${i}  Mixed 🌍: Hello 你好 مرحبا Bonjour こんにちは Привет Hola 안녕하세요 हिन्दी`,
  (i: number) =>
    `#${i}  Long: This is an intentionally long piece of text designed to test multi-line rendering. Pretext computes accurate paragraph heights without any DOM reflow — making it ideal for high-performance virtual scroll lists. It supports all languages, emojis, and bidirectional text out of the box. ` +
    `The layout engine uses Canvas measureText as ground truth, giving sub-pixel accuracy.`,
  (i: number) =>
    `#${i}  العربية: بدأت الرحلة من القاهرة إلى بيروت، مروراً بدمشق وعمّان. كانت رحلة طويلة لكنها ممتعة جداً، وامتلأت بالذكريات الجميلة`,
  (i: number) =>
    `#${i}  日本語: 吾輩は猫である。名前はまだない。どこで生まれたかとんと見当がつかぬ。` +
    `何でも薄暗いじめじめした所でニャーニャー泣いていた事だけは記憶している。`,
  (i: number) => `#${i}  Emoji: 🎉🚀🌈✨🔥💎🦄🌺🎵🎨🏔️🌊🦋🌙⭐🎭🏆🍀🌸🎆`
]

const ITEMS = Array.from({ length: 2000 }, (_, i) => TEMPLATES[i % TEMPLATES.length](i))

// Pre-measure all heights (runs once at component init)
function measureAll() {
  const heights: number[] = new Array(ITEMS.length)
  const offsets: number[] = new Array(ITEMS.length + 1)
  offsets[0] = 0
  for (let i = 0; i < ITEMS.length; i++) {
    const p = prepare(ITEMS[i], FONT)
    const { height } = layout(p, INNER_WIDTH, LINE_HEIGHT)
    heights[i] = height + V_PAD * 2
    offsets[i + 1] = offsets[i] + heights[i]
  }
  return { heights, offsets, totalHeight: offsets[ITEMS.length] }
}

const { heights, offsets, totalHeight } = measureAll()

function findAt(y: number) {
  let lo = 0,
    hi = ITEMS.length - 1
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1
    offsets[mid] <= y ? (lo = mid) : (hi = mid - 1)
  }
  return lo
}

const scrollTop = ref(0)

function onScroll(e: Event) {
  scrollTop.value = (e.target as HTMLElement).scrollTop
}

const startIdx = computed(() => Math.max(0, findAt(scrollTop.value) - OVERSCAN))
const endIdx = computed(() =>
  Math.min(ITEMS.length - 1, findAt(scrollTop.value + CONTAINER_HEIGHT) + OVERSCAN)
)
const renderedCount = computed(() => endIdx.value - startIdx.value + 1)
const visibleItems = computed(() => {
  const items = []
  for (let i = startIdx.value; i <= endIdx.value; i++) {
    items.push({ index: i, text: ITEMS[i], top: offsets[i], height: heights[i] })
  }
  return items
})
</script>

<template>
  <div>
    <!-- Stats bar -->
    <div class="stats-bar">
      <div class="stat">
        <span class="stat-label">Total items</span>
        <span class="stat-value">{{ ITEMS.length.toLocaleString() }}</span>
      </div>
      <div class="stat">
        <span class="stat-label">DOM nodes</span>
        <span class="stat-value blue">{{ renderedCount }}</span>
      </div>
      <div class="stat">
        <span class="stat-label">Total height</span>
        <span class="stat-value">{{ Math.round(totalHeight).toLocaleString() }} px</span>
      </div>
      <div class="stat">
        <span class="stat-label">Scroll offset</span>
        <span class="stat-value">{{ Math.round(scrollTop) }} px</span>
      </div>
      <div class="stat">
        <span class="stat-label">Visible range</span>
        <span class="stat-value">#{{ startIdx }} – #{{ endIdx }}</span>
      </div>
    </div>

    <!-- Scroll container -->
    <div
      class="scroll-container"
      :style="{ height: `${CONTAINER_HEIGHT}px`, width: `${ITEM_WIDTH}px` }"
      @scroll="onScroll"
    >
      <div :style="{ height: `${totalHeight}px`, position: 'relative' }">
        <div
          v-for="item in visibleItems"
          :key="item.index"
          class="scroll-item"
          :class="item.index % 2 === 0 ? 'even' : 'odd'"
          :style="{
            position: 'absolute',
            top: `${item.top}px`,
            height: `${item.height}px`,
            left: 0,
            right: 0,
            padding: `${V_PAD}px ${H_PAD}px`
          }"
        >
          {{ item.text }}
        </div>
      </div>
    </div>

    <p class="footnote">
      All {{ ITEMS.length }} heights computed with <code>prepare()</code> +
      <code>layout()</code> before first render — no <code>getBoundingClientRect</code>, no reflow.
    </p>

    <CodeBlock
      title="Example — Virtual Scroll with Pretext"
      :code="`import { prepare, layout } from '@chenglou/pretext'

// ① One-time: pre-measure all item heights before first render
//    Runs in ~80ms for 2000 items — no DOM, no reflow
const heights = items.map(text => {
  const p = prepare(text, '14px Arial')
  const { height } = layout(p, columnWidth, 22) // 22px line-height
  return height + paddingV * 2
})

// ② Build a prefix-sum offset table for O(log n) scroll positioning
const offsets = [0]
heights.forEach(h => offsets.push(offsets.at(-1)! + h))
const totalHeight = offsets.at(-1)!

// ③ Binary search: find the first visible item at a given scrollY
function findAt(scrollY: number) {
  let lo = 0, hi = items.length - 1
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1
    offsets[mid] <= scrollY ? (lo = mid) : (hi = mid - 1)
  }
  return lo
}

// ④ On scroll: render only the items in the visible range + overscan
const start = Math.max(0, findAt(scrollTop) - OVERSCAN)
const end   = Math.min(items.length - 1, findAt(scrollTop + viewportH) + OVERSCAN)`"
    />
  </div>
</template>

<style scoped>
.stats-bar {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.stat {
  background: #ede9d4;
  border: 1px solid #c4bfaa;
  border-radius: 10px;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 110px;
}

.stat-label {
  font-size: 0.7rem;
  color: #7a7e96;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.stat-value {
  font-size: 1.15rem;
  font-weight: 600;
  color: #3d405b;
  font-variant-numeric: tabular-nums;
}
.stat-value.blue {
  color: #81b29a;
}

.scroll-container {
  border: 1px solid #c4bfaa;
  border-radius: 12px;
  overflow-y: auto;
  overflow-x: hidden;
  background: #e8e4ce;
  margin-bottom: 12px;
}

.scroll-container::-webkit-scrollbar {
  width: 8px;
}
.scroll-container::-webkit-scrollbar-track {
  background: #f4f1de;
}
.scroll-container::-webkit-scrollbar-thumb {
  background: #c4bfaa;
  border-radius: 4px;
}
.scroll-container::-webkit-scrollbar-thumb:hover {
  background: #a8a390;
}

.scroll-item {
  font-size: 14px;
  line-height: 22px;
  border-bottom: 1px solid #c4bfaa;
  word-break: break-word;
  overflow-wrap: break-word;
}
.scroll-item.even {
  background: #e8e4ce;
  color: #3d405b;
}
.scroll-item.odd {
  background: #ede9d4;
  color: #5a5e78;
}

.footnote {
  font-size: 0.8rem;
  color: #7a7e96;
}
.footnote code {
  background: #e8e4ce;
  padding: 1px 5px;
  border-radius: 4px;
  color: #81b29a;
}
</style>
