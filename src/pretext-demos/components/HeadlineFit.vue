<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { prepareWithSegments, layoutWithLines } from '@chenglou/pretext'
import CodeBlock from './CodeBlock.vue'

const W = 820, LH_RATIO = 1.1, V_GAP = 8, PAD_X = 24, BG = '#3D405B', AVAIL_W = W - PAD_X * 2

const HEADLINES = [
  { text: 'Breaking News',           color: '#f8fafc', dir: 'ltr' },
  { text: '人工智能改变世界',           color: '#fbbf24', dir: 'ltr' },
  { text: 'Le Monde Brûle',          color: '#4ade80', dir: 'ltr' },
  { text: 'مرحباً بالمستقبل',        color: '#60a5fa', dir: 'rtl' },
  { text: 'Zero DOM Reflow, Always', color: '#f472b6', dir: 'ltr' },
  { text: 'こんにちは世界',            color: '#c084fc', dir: 'ltr' },
  { text: 'Bonjour la Typographie',  color: '#fb923c', dir: 'ltr' },
  { text: '한국 타이포그래피',          color: '#2dd4bf', dir: 'ltr' },
] as const

function fitFontSize(text: string, maxWidth: number): number {
  let lo = 8, hi = 320
  for (let i = 0; i < 28; i++) {
    const mid = (lo + hi) / 2
    const p = prepareWithSegments(text, `bold ${mid}px Arial`)
    const r = layoutWithLines(p, 99999, mid * LH_RATIO)
    const w = r.lines[0]?.width ?? 0
    w < maxWidth ? (lo = mid) : (hi = mid)
  }
  return (lo + hi) / 2
}

const FITTED = HEADLINES.map(h => ({ ...h, fs: fitFontSize(h.text, AVAIL_W) }))

const canvas = ref<HTMLCanvasElement | null>(null)

onMounted(() => {
  const el = canvas.value
  if (!el) return
  const ctx = el.getContext('2d')
  if (!ctx) return
  const dpr = window.devicePixelRatio || 1
  let totalH = V_GAP
  for (const h of FITTED) totalH += Math.ceil(h.fs * LH_RATIO) + V_GAP
  el.width = W * dpr; el.height = totalH * dpr
  el.style.width = W + 'px'; el.style.height = totalH + 'px'
  ctx.scale(dpr, dpr)
  ctx.fillStyle = BG; ctx.fillRect(0, 0, W, totalH)
  let y = V_GAP
  for (const h of FITTED) {
    const lh = Math.ceil(h.fs * LH_RATIO)
    ctx.strokeStyle = '#2e3148'; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(PAD_X, y - V_GAP / 2 + 0.5); ctx.lineTo(W - PAD_X, y - V_GAP / 2 + 0.5); ctx.stroke()
    ctx.font = `bold ${h.fs}px Arial`; ctx.textBaseline = 'top'; ctx.fillStyle = h.color
    if (h.dir === 'rtl') {
      ctx.direction = 'rtl'; ctx.textAlign = 'right'
      ctx.fillText(h.text, PAD_X + AVAIL_W, y)
      ctx.direction = 'ltr'; ctx.textAlign = 'left'
    } else {
      ctx.fillText(h.text, PAD_X, y)
    }
    ctx.font = '10px monospace'; ctx.fillStyle = '#8a9ab0'; ctx.textAlign = 'right'
    ctx.fillText(`${h.fs.toFixed(0)}px`, W - 6, y + lh - 13); ctx.textAlign = 'left'
    y += lh + V_GAP
  }
})
</script>

<template>
  <div class="demo-wrapper">
    <p class="instructions">
      Each headline auto-fits to fill exactly the same pixel width —
      binary-searching font size via <code>prepareWithSegments</code> +
      <code>layoutWithLines</code>. Works for every language. Zero DOM, zero reflow.
    </p>
    <canvas ref="canvas" style="display:block;max-width:100%" />
    <CodeBlock
      title="Binary-search font size to fill a fixed width"
      :code="`function fitFontSize(text: string, maxWidth: number): number {
  let lo = 8, hi = 320
  for (let i = 0; i < 28; i++) {
    const mid = (lo + hi) / 2
    const p = prepareWithSegments(text, \\\`bold \\\${mid}px Arial\\\`)
    const r = layoutWithLines(p, 99999, mid * 1.1)
    const w = r.lines[0]?.width ?? 0
    w < maxWidth ? (lo = mid) : (hi = mid)
  }
  return (lo + hi) / 2
}`"
    />
  </div>
</template>

<style scoped>
.demo-wrapper { display: flex; flex-direction: column; gap: 16px; }
.instructions { margin-bottom: 12px; color: #64748b; font-size: 0.9rem; line-height: 1.5; }
.instructions code { color: #81B29A; background: #E8E4CE; padding: 1px 5px; border-radius: 3px; }
</style>
