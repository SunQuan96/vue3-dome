<script setup lang="ts">
import { ref, onMounted, onUnmounted, watchEffect } from 'vue'
import { prepareWithSegments, layoutNextLine, type LayoutCursor } from '@chenglou/pretext'
import CodeBlock from './CodeBlock.vue'
import { FLOW_AROUND_TEXT } from '../shared/flowAroundText'

const canvas = ref<HTMLCanvasElement | null>(null)
const mouseX = ref(430)
const mouseY = ref(220)
const lineCount = ref(0)

const W = 860
const H = 520
const FONT = '15px Arial'
const LINE_HEIGHT = 24
const MARGIN_X = 28
const MARGIN_TOP = 24
const RADIUS = 72

const MIN_COL = 56
const prepared = prepareWithSegments(FLOW_AROUND_TEXT, FONT)

function render() {
  const ctx = canvas.value?.getContext('2d')
  if (!ctx) return

  const cx = mouseX.value
  const cy = mouseY.value

  ctx.clearRect(0, 0, W, H)
  ctx.fillStyle = '#3D405B'
  ctx.fillRect(0, 0, W, H)

  // Exclusion circle glow
  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, RADIUS)
  glow.addColorStop(0, 'rgba(99,102,241,0.25)')
  glow.addColorStop(0.6, 'rgba(99,102,241,0.12)')
  glow.addColorStop(1, 'rgba(99,102,241,0)')
  ctx.fillStyle = glow
  ctx.beginPath()
  ctx.arc(cx, cy, RADIUS, 0, Math.PI * 2)
  ctx.fill()

  // Exclusion circle border
  ctx.strokeStyle = '#6366f1'
  ctx.lineWidth = 1.5
  ctx.setLineDash([6, 4])
  ctx.beginPath()
  ctx.arc(cx, cy, RADIUS, 0, Math.PI * 2)
  ctx.stroke()
  ctx.setLineDash([])

  // Circle label
  ctx.fillStyle = '#818cf8'
  ctx.font = 'bold 11px Arial'
  ctx.textAlign = 'center'
  ctx.fillText('exclusion', cx, cy - 8)
  ctx.fillText('zone', cx, cy + 8)
  ctx.textAlign = 'left'

  // Flow text — dual column when both sides of the circle have room
  ctx.font = FONT
  ctx.textBaseline = 'top'
  ctx.fillStyle = '#e2e8f0'

  let cursor: LayoutCursor = { segmentIndex: 0, graphemeIndex: 0 }
  let y = MARGIN_TOP
  let count = 0

  while (y < H - LINE_HEIGHT) {
    const yMid = y + LINE_HEIGHT / 2
    const dy = Math.abs(yMid - cy)

    if (dy >= RADIUS) {
      // No circle intersection — full width single line
      const line = layoutNextLine(prepared, cursor, W - MARGIN_X * 2)
      if (line === null) break
      ctx.fillText(line.text, MARGIN_X, y)
      cursor = line.end
      count++
    } else {
      const halfChord = Math.sqrt(RADIUS * RADIUS - dy * dy)
      const cLeft = cx - halfChord
      const cRight = cx + halfChord
      const leftRoom = Math.max(0, cLeft - MARGIN_X - 4)
      const rightRoom = Math.max(0, W - MARGIN_X - cRight - 4)
      const hasLeft = leftRoom >= MIN_COL
      const hasRight = rightRoom >= MIN_COL

      if (!hasLeft && !hasRight) { y += LINE_HEIGHT; continue }

      if (hasLeft && hasRight) {
        // Both columns have room — render text on left AND right simultaneously
        const leftLine = layoutNextLine(prepared, cursor, leftRoom)
        if (leftLine === null) break
        ctx.fillText(leftLine.text, MARGIN_X, y)
        cursor = leftLine.end
        count++
        const rightLine = layoutNextLine(prepared, cursor, rightRoom)
        if (rightLine !== null) {
          ctx.fillText(rightLine.text, cRight + 4, y)
          cursor = rightLine.end
          count++
        }
      } else if (hasLeft) {
        const line = layoutNextLine(prepared, cursor, leftRoom)
        if (line === null) break
        ctx.fillText(line.text, MARGIN_X, y)
        cursor = line.end
        count++
      } else {
        const line = layoutNextLine(prepared, cursor, rightRoom)
        if (line === null) break
        ctx.fillText(line.text, cRight + 4, y)
        cursor = line.end
        count++
      }
    }

    y += LINE_HEIGHT
  }

  lineCount.value = count
}

let rafId = 0
let pending = false

function onMouseMove(e: MouseEvent) {
  const rect = canvas.value?.getBoundingClientRect()
  if (!rect) return
  mouseX.value = e.clientX - rect.left
  mouseY.value = e.clientY - rect.top
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
      Move mouse anywhere over the canvas — text flows around the
      <strong>exclusion zone</strong> using
      <code>layoutNextLine()</code> with a different width per line
    </p>

    <canvas
      ref="canvas"
      :width="W"
      :height="H"
      style="cursor: none; border-radius: 8px; display: block; max-width: 100%"
      @mousemove="onMouseMove"
    />

    <div class="stats-row">
      <div class="chip">Lines rendered <strong>{{ lineCount }}</strong></div>
      <div class="chip">
        Cursor <strong>({{ Math.round(mouseX) }}, {{ Math.round(mouseY) }})</strong>
      </div>
      <div class="chip">Radius <strong>{{ RADIUS }}px</strong></div>
      <div class="chip note">API: <code>layoutNextLine()</code> — per-line variable width</div>
    </div>

    <CodeBlock
      title="Example — Text Flow Around Exclusion Zone with Pretext"
      :code="`import { prepareWithSegments, layoutNextLine } from '@chenglou/pretext'

// ① Once: prepare the text (segments + canvas glyph measurements)
const prepared = prepareWithSegments(text, '15px Arial')

// ② Per frame: flow text around a circular exclusion zone
function drawFlowAround(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  let cursor = { segmentIndex: 0, graphemeIndex: 0 }
  let y = marginTop

  while (y < canvasHeight) {
    const yMid = y + lineHeight / 2
    const dy = Math.abs(yMid - cy)

    if (dy >= radius) {
      // Outside the circle — full-width line
      const line = layoutNextLine(prepared, cursor, fullWidth)
      if (!line) break
      ctx.fillText(line.text, marginX, y)
      cursor = line.end
    } else {
      // Inside the circle's bounding scanline — render on both sides
      const halfChord = Math.sqrt(radius ** 2 - dy ** 2)
      const leftW  = Math.max(0, (cx - halfChord) - marginX - gap)
      const rightX = cx + halfChord + gap
      const rightW = Math.max(0, (canvasW - marginX) - rightX)

      if (leftW >= minCol) {
        const line = layoutNextLine(prepared, cursor, leftW)
        if (!line) break
        ctx.fillText(line.text, marginX, y)
        cursor = line.end
      }
      if (rightW >= minCol) {
        const line = layoutNextLine(prepared, cursor, rightW)
        if (line) { ctx.fillText(line.text, rightX, y); cursor = line.end }
      }
    }
    y += lineHeight
  }
}`"
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
