<script setup lang="ts">
import { ref, onMounted, onUnmounted, watchEffect } from 'vue'
import { prepareWithSegments, layoutWithLines } from '@chenglou/pretext'
import CodeBlock from './CodeBlock.vue'

const canvas = ref<HTMLCanvasElement | null>(null)
const mouseX = ref(380)
const stats = ref({ width: 380, lineCount: 0, height: 0 })

const W = 860
const H = 480
const FONT = '15px Arial'
const LINE_HEIGHT = 25
const MARGIN_LEFT = 30
const MARGIN_TOP = 28
const MIN_WIDTH = 80

const TEXT =
  `Pretext is a pure JavaScript/TypeScript library for multiline text ` +
  `measurement and layout. It is fast, accurate, and supports all the ` +
  `languages you didn't even know about — including left-to-right, ` +
  `right-to-left, and mixed bidirectional text. ` +
  `这个库支持多种语言：中文、日本語、한국어、العربية，以及各种表情符号 🎉🚀🌍。` +
  `Pretext sidesteps DOM measurements (getBoundingClientRect, offsetHeight) ` +
  `which trigger expensive layout reflows. Instead it uses the browser's ` +
  `own Canvas font engine as ground truth, giving sub-pixel accuracy. ` +
  `It is ideal for virtual scroll lists, masonry layouts, text editors, ` +
  `canvas/SVG/WebGL renderers, and server-side layout (coming soon). ` +
  `Move your mouse left and right to see the text reflow in real time — ` +
  `lineCount and height are recomputed on every frame via layoutWithLines().`

// prepare() is the one-time work: segment, apply glue rules, measure with Canvas
const prepared = prepareWithSegments(TEXT, FONT)

function render() {
  const ctx = canvas.value?.getContext('2d')
  if (!ctx) return

  const mx = mouseX.value
  const textMaxW = Math.max(MIN_WIDTH, Math.min(W - MARGIN_LEFT - 10, mx - MARGIN_LEFT))

  ctx.clearRect(0, 0, W, H)

  // Background
  ctx.fillStyle = '#3D405B'
  ctx.fillRect(0, 0, W, H)

  // Left margin guide
  ctx.strokeStyle = '#1e3a5f'
  ctx.lineWidth = 1
  ctx.setLineDash([])
  ctx.beginPath()
  ctx.moveTo(MARGIN_LEFT, 0)
  ctx.lineTo(MARGIN_LEFT, H)
  ctx.stroke()

  // Right boundary (mouse position)
  const boundaryX = MARGIN_LEFT + textMaxW
  ctx.strokeStyle = '#3b82f6'
  ctx.lineWidth = 1.5
  ctx.setLineDash([5, 4])
  ctx.beginPath()
  ctx.moveTo(boundaryX, 0)
  ctx.lineTo(boundaryX, H)
  ctx.stroke()
  ctx.setLineDash([])

  // Cursor arrow at top of boundary
  ctx.fillStyle = '#60a5fa'
  ctx.beginPath()
  ctx.moveTo(boundaryX, 10)
  ctx.lineTo(boundaryX - 6, 22)
  ctx.lineTo(boundaryX + 6, 22)
  ctx.closePath()
  ctx.fill()

  // Width label
  ctx.fillStyle = '#3b82f6'
  ctx.font = 'bold 11px Arial'
  ctx.textAlign = 'center'
  ctx.fillText(`${Math.round(textMaxW)}px`, boundaryX, 36)
  ctx.textAlign = 'left'

  // Lay out text — pure arithmetic after prepare()
  const { lines, lineCount, height } = layoutWithLines(prepared, textMaxW, LINE_HEIGHT)
  stats.value = { width: Math.round(textMaxW), lineCount, height: Math.round(height) }

  ctx.font = FONT
  ctx.textBaseline = 'top'
  ctx.fillStyle = '#e2e8f0'

  for (let i = 0; i < lines.length; i++) {
    const y = MARGIN_TOP + i * LINE_HEIGHT
    if (y + LINE_HEIGHT > H) break
    ctx.fillText(lines[i].text, MARGIN_LEFT, y)
  }
}

let rafId = 0
let pending = false

function onMouseMove(e: MouseEvent) {
  const rect = canvas.value?.getBoundingClientRect()
  if (!rect) return
  mouseX.value = e.clientX - rect.left
  if (!pending) {
    pending = true
    rafId = requestAnimationFrame(() => {
      render()
      pending = false
    })
  }
}

onMounted(() => {
  watchEffect(render)
})

onUnmounted(() => {
  cancelAnimationFrame(rafId)
})
</script>

<template>
  <div>
    <p class="instructions">
      Move mouse <strong>left / right</strong> to resize the text column —
      <code>layoutWithLines()</code> recomputes on every frame
    </p>

    <canvas
      ref="canvas"
      :width="W"
      :height="H"
      style="cursor: col-resize; border-radius: 8px; display: block; max-width: 100%"
      @mousemove="onMouseMove"
    />

    <div class="stats-row">
      <div class="chip">Width <strong>{{ stats.width }}px</strong></div>
      <div class="chip">Lines <strong>{{ stats.lineCount }}</strong></div>
      <div class="chip">Height <strong>{{ stats.height }}px</strong></div>
      <div class="chip note">
        API: <code>prepareWithSegments()</code> + <code>layoutWithLines()</code>
      </div>
    </div>

    <CodeBlock
      title="Example — Dynamic Column Width with Pretext"
      :code="`import { prepareWithSegments, layoutWithLines } from '@chenglou/pretext'

// ① Once: segment text + measure glyphs with Canvas (expensive, ~19ms/500 texts)
const prepared = prepareWithSegments(text, '15px Arial')

// ② Hot path: pure arithmetic — call on every resize or mouse move (~0.09ms)
function drawText(ctx: CanvasRenderingContext2D, maxWidth: number) {
  const { lines, lineCount, height } = layoutWithLines(prepared, maxWidth, 25)

  lines.forEach((line, i) => {
    ctx.fillText(line.text, marginLeft, marginTop + i * 25)
  })
}

// ③ Re-run only layoutWithLines() on each frame — never re-run prepare()
canvas.addEventListener('mousemove', e => {
  requestAnimationFrame(() => drawText(ctx, e.clientX - canvasLeft))
})`"
    />
  </div>
</template>

<style scoped>
.instructions {
  margin-bottom: 12px;
  color: #64748b;
  font-size: 0.9rem;
  line-height: 1.5;
}
.instructions strong { color: #3D405B; }
.instructions code { color: #81B29A; background: #E8E4CE; padding: 1px 5px; border-radius: 3px; }

.stats-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 12px;
  align-items: center;
}

.chip {
  background: #EDE9D4;
  border: 1px solid #C4BFAA;
  padding: 6px 13px;
  border-radius: 6px;
  font-size: 0.82rem;
  color: #7A7E96;
}
.chip strong { color: #81B29A; }
.chip.note { color: #9497AC; }
.chip.note code { color: #81B29A; }
</style>
