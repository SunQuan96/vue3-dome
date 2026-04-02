<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { prepare, layout } from '@chenglou/pretext'
import CodeBlock from './CodeBlock.vue'

const FONT = '14px Arial'
const LINE_HEIGHT = 22
const H_PAD = 14
const V_PAD = 10
const GAP = 12
const COLS = 3

const RAW_CARDS = [
  // short — single line
  { title: 'AGI春天', tag: 'AI', color: '#3a2d1e', accent: '#f59e0b' },
  { title: 'River delta', tag: 'Nature', color: '#1e3a2f', accent: '#34d399' },
  { title: 'Zero reflow', tag: 'Dev', color: '#2d3a1e', accent: '#a3e635' },
  { title: '🚀 Fast', tag: 'Perf', color: '#1e3322', accent: '#4ade80' },
  // medium — 2-3 lines
  { title: 'The silent architecture of modernist Japan', tag: 'Design', color: '#1e293b', accent: '#60a5fa' },
  { title: 'Why your UI text is always wrong', tag: 'Dev', color: '#2d1e3a', accent: '#a78bfa' },
  { title: '日本語タイポグラフィの美学', tag: 'Typography', color: '#2a1e3a', accent: '#c084fc' },
  { title: '한국어와 웹 타이포그래피의 도전', tag: 'i18n', color: '#1e2a3a', accent: '#67e8f9' },
  { title: 'Text layout has been broken on the web for 30 years', tag: 'Rant', color: '#1e3a3a', accent: '#2dd4bf' },
  { title: 'مرحبا بالعالم — Hello World in 42 scripts', tag: 'Languages', color: '#3a1e2d', accent: '#f472b6' },
  // long — 4-6 lines
  { title: 'How bees navigate without GPS and what that means for swarm robotics and autonomous drones', tag: 'Science', color: '#1e2e3a', accent: '#38bdf8' },
  { title: 'Emoji 🌍🎨🦋🔥💡 are far harder than you think for layout engines — here is why every renderer gets them wrong', tag: 'Deep Dive', color: '#3a2a1e', accent: '#fb923c' },
  { title: 'Zero DOM reflow: the final boss of frontend performance and why most frameworks still fail at it in 2026', tag: 'Dev', color: '#2d3a1e', accent: '#a3e635' },
  { title: 'Building a sub-10ms text layout pipeline in pure JavaScript: lessons from shipping pretext to production', tag: 'Performance', color: '#1e3322', accent: '#4ade80' },
  // extra-long — 7+ lines
  { title: 'The complete history of web typography: from early bitmap fonts to variable fonts, color emoji and the coming era of AI-driven layout that adapts to every reader', tag: 'History', color: '#2a1e2a', accent: '#e879f9' },
  { title: 'Why internationalization breaks every assumption your layout engine ever made about text direction, script segmentation, line breaking rules and whitespace semantics — a survival guide', tag: 'i18n', color: '#1e2a2a', accent: '#22d3ee' },
]

const containerW = ref(700)
const containerEl = ref<HTMLElement | null>(null)
const pct = ref(100)
const demoW = computed(() => Math.round(containerW.value * pct.value / 100))

onMounted(() => {
  const obs = new ResizeObserver(e => {
    containerW.value = e[0].contentRect.width
  })
  if (containerEl.value) obs.observe(containerEl.value)
})

const colWidth = computed(() => Math.floor((demoW.value - GAP * (COLS - 1)) / COLS))
const innerW = computed(() => colWidth.value - H_PAD * 2)

const placed = computed(() => {
  const iw = innerW.value
  const cw = colWidth.value

  const cards = RAW_CARDS.map(c => {
    const p = prepare(c.title, FONT)
    const { height } = layout(p, iw, LINE_HEIGHT)
    return { ...c, cardH: height + V_PAD * 2 + 40 }
  })

  const colHeights = new Array(COLS).fill(GAP)
  return cards.map(card => {
    const col = colHeights.indexOf(Math.min(...colHeights))
    const top = colHeights[col]
    colHeights[col] += card.cardH + GAP
    return { ...card, col, top, left: col * (cw + GAP) }
  })
})

const totalH = computed(() => {
  const iw = innerW.value
  const cw = colWidth.value
  const colHeights = new Array(COLS).fill(GAP)
  RAW_CARDS.forEach(c => {
    const p = prepare(c.title, FONT)
    const { height } = layout(p, iw, LINE_HEIGHT)
    const cardH = height + V_PAD * 2 + 40
    const col = colHeights.indexOf(Math.min(...colHeights))
    colHeights[col] += cardH + GAP
  })
  return Math.max(...colHeights)
})

const CODE = `import { prepare, layout } from '@chenglou/pretext'

// ① Measure all card heights — no DOM needed
const cards = rawCards.map(card => {
  const p = prepare(card.title, '14px Arial')
  const { height } = layout(p, columnWidth - padding * 2, 22)
  return { ...card, cardH: height + padding * 2 + tagHeight }
})

// ② Greedy column fill: always pick the shortest column
const colHeights = new Array(COLS).fill(gapTop)
const placed = cards.map(card => {
  const col = colHeights.indexOf(Math.min(...colHeights))
  const top = colHeights[col]
  colHeights[col] += card.cardH + gap
  return { ...card, col, top }
})

// ③ Position each card absolutely
container.style.height = Math.max(...colHeights) + 'px'`
</script>

<template>
  <div ref="containerEl">
    <p class="instructions">
      <code>prepare()</code> + <code>layout()</code> compute each card's exact height
      before any DOM exists — the masonry column assignment is pure JS arithmetic.
    </p>

    <div class="masonry-width-control">
      <span class="masonry-width-label">Width</span>
      <input type="range" min="50" max="100" v-model.number="pct" class="masonry-width-slider" />
      <span class="masonry-width-value">{{ pct }}%</span>
    </div>

    <div class="masonry-wrap" :style="{ height: totalH + 'px' }">
      <div
        v-for="card in placed"
        :key="card.title"
        class="masonry-card"
        :style="{
          left: card.left + 'px',
          top: card.top + 'px',
          width: colWidth + 'px',
          height: card.cardH + 'px',
          background: card.color,
          borderColor: card.accent,
          borderWidth: '1px',
        }"
      >
        <span class="masonry-tag" :style="{ color: card.accent, borderColor: card.accent }">
          {{ card.tag }}
        </span>
        <p class="masonry-title">{{ card.title }}</p>
      </div>
    </div>

    <CodeBlock title="Example — Masonry Layout with Pretext" :code="CODE" />
  </div>
</template>

<style scoped>
.instructions { margin-bottom: 16px; color: #94a3b8; font-size: 0.9rem; line-height: 1.5; }
.instructions code { color: #81B29A; background: #E8E4CE; padding: 1px 5px; border-radius: 3px; }
.masonry-wrap { position: relative; width: 100%; }
.masonry-width-control {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  background: #EDE9D4;
  border: 1px solid #C4BFAA;
  border-radius: 8px;
  padding: 8px 14px;
}
.masonry-width-label { font-size: 0.85rem; color: #7A7E96; text-transform: uppercase; letter-spacing: 0.06em; white-space: nowrap; }
.masonry-width-value { font-size: 0.85rem; font-weight: 600; color: #3D405B; font-variant-numeric: tabular-nums; white-space: nowrap; min-width: 46px; }
.masonry-width-slider { flex: 1; accent-color: #81B29A; cursor: pointer; height: 4px; }
.masonry-card {
  position: absolute;
  border: 1px solid;
  border-radius: 10px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.masonry-tag {
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  border: 1px solid;
  border-radius: 4px;
  padding: 2px 7px;
  align-self: flex-start;
}
.masonry-title {
  font-size: 14px;
  line-height: 22px;
  color: #e2e8f0;
  word-break: break-word;
}
</style>
