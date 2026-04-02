<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { prepareWithSegments, layoutWithLines } from '@chenglou/pretext'
import CodeBlock from './CodeBlock.vue'

const FONT = '16px Arial'
const LINE_HEIGHT = 24
const PAD = 16
const CANVAS_W = 640
const CANVAS_H = 340
const MAX_W = CANVAS_W - PAD * 2

const DEFAULT_TEXT = `Hello, World! 🌍
Type here — try multilingual text:
中文、日本語、한국어、العربية
Emojis work too: 🚀✨🦋🎨`

const canvas = ref<HTMLCanvasElement | null>(null)
const text = ref(DEFAULT_TEXT)
const cursor = ref({ line: 0, col: 0 })
const focused = ref(false)
const stats = ref({ lines: DEFAULT_TEXT.split('\n').length, chars: 0 })

let blinkOn = true
let blinkTimer = 0
let rafId = 0
let pending = false

function render() {
  const ctx = canvas.value?.getContext('2d')
  if (!ctx) return

  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H)
  ctx.fillStyle = '#080f1a'
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)

  ctx.strokeStyle = focused.value ? '#3b82f6' : '#334155'
  ctx.lineWidth = focused.value ? 2 : 1
  ctx.strokeRect(1, 1, CANVAS_W - 2, CANVAS_H - 2)

  ctx.font = FONT
  ctx.textBaseline = 'top'

  const lines = text.value.split('\n')
  let canvasY = PAD
  let cursorPx = PAD, cursorPy = PAD

  lines.forEach((lineText, li) => {
    if (!lineText) {
      if (li === cursor.value.line) { cursorPx = PAD; cursorPy = canvasY }
      canvasY += LINE_HEIGHT
      return
    }
    const prepared = prepareWithSegments(lineText, FONT)
    const { lines: wrapped } = layoutWithLines(prepared, MAX_W, LINE_HEIGHT)
    wrapped.forEach((wl, wi) => {
      if (li === cursor.value.line) {
        const offset = wrapped.slice(0, wi).reduce((s, l) => s + l.text.length, 0)
        if (cursor.value.col >= offset && cursor.value.col <= offset + wl.text.length) {
          ctx.font = FONT
          cursorPx = PAD + ctx.measureText(wl.text.slice(0, cursor.value.col - offset)).width
          cursorPy = canvasY
        }
      }
      ctx.fillStyle = '#e2e8f0'
      ctx.font = FONT
      ctx.fillText(wl.text, PAD, canvasY)
      canvasY += LINE_HEIGHT
    })
  })

  const textContent = lines.join('')
  stats.value = { lines: lines.length, chars: textContent.length }

  if (focused.value && blinkOn) {
    ctx.fillStyle = '#60a5fa'
    ctx.fillRect(cursorPx, cursorPy + 2, 2, LINE_HEIGHT - 4)
  }
}

function scheduleRender() {
  if (!pending) {
    pending = true
    rafId = requestAnimationFrame(() => { render(); pending = false })
  }
}

watch([text, cursor, focused], scheduleRender, { deep: true })

onMounted(() => {
  render()
  blinkTimer = window.setInterval(() => { blinkOn = !blinkOn; scheduleRender() }, 530)
})
onUnmounted(() => { clearInterval(blinkTimer); cancelAnimationFrame(rafId) })

function onKeyDown(e: KeyboardEvent) {
  const lines = text.value.split('\n')
  let { line, col } = cursor.value

  if (e.key === 'ArrowLeft')       { cursor.value = col > 0 ? { line, col: col - 1 } : line > 0 ? { line: line - 1, col: lines[line - 1].length } : cursor.value }
  else if (e.key === 'ArrowRight') { cursor.value = col < lines[line].length ? { line, col: col + 1 } : line < lines.length - 1 ? { line: line + 1, col: 0 } : cursor.value }
  else if (e.key === 'ArrowUp')    { if (line > 0) cursor.value = { line: line - 1, col: Math.min(col, lines[line - 1].length) } }
  else if (e.key === 'ArrowDown')  { if (line < lines.length - 1) cursor.value = { line: line + 1, col: Math.min(col, lines[line + 1].length) } }
  else if (e.key === 'Home')       { cursor.value = { line, col: 0 } }
  else if (e.key === 'End')        { cursor.value = { line, col: lines[line].length } }
  else if (e.key === 'Enter') {
    e.preventDefault()
    const before = lines[line].slice(0, col), after = lines[line].slice(col)
    text.value = [...lines.slice(0, line), before, after, ...lines.slice(line + 1)].join('\n')
    cursor.value = { line: line + 1, col: 0 }
  } else if (e.key === 'Backspace') {
    if (col > 0) {
      const nl = lines[line].slice(0, col - 1) + lines[line].slice(col)
      text.value = [...lines.slice(0, line), nl, ...lines.slice(line + 1)].join('\n')
      cursor.value = { line, col: col - 1 }
    } else if (line > 0) {
      const prevLen = lines[line - 1].length
      const merged = lines[line - 1] + lines[line]
      text.value = [...lines.slice(0, line - 1), merged, ...lines.slice(line + 1)].join('\n')
      cursor.value = { line: line - 1, col: prevLen }
    }
  } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
    const nl = lines[line].slice(0, col) + e.key + lines[line].slice(col)
    text.value = [...lines.slice(0, line), nl, ...lines.slice(line + 1)].join('\n')
    cursor.value = { line, col: col + 1 }
  }
}

const CODE = `import { prepareWithSegments, layoutWithLines } from '@chenglou/pretext'

function renderParagraph(ctx, text, cursorCol, x, y, maxWidth) {
  const prepared = prepareWithSegments(text, FONT)
  const { lines } = layoutWithLines(prepared, maxWidth, LINE_HEIGHT)

  let charOffset = 0
  lines.forEach((line, i) => {
    ctx.fillText(line.text, x, y + i * LINE_HEIGHT)

    const lineEnd = charOffset + line.text.length
    if (cursorCol >= charOffset && cursorCol <= lineEnd) {
      const before = line.text.slice(0, cursorCol - charOffset)
      const cx = x + ctx.measureText(before).width
      ctx.fillRect(cx, y + i * LINE_HEIGHT + 2, 2, LINE_HEIGHT - 4)
    }
    charOffset = lineEnd
  })
}

// Call on every keystroke — layout is cheap (~0.09ms per text)`
</script>

<template>
  <div>
    <p class="instructions">
      A canvas text editor. <code>layoutWithLines()</code> wraps each paragraph and
      computes exact cursor X position — all without DOM text measurement.
      <strong>Click the canvas to focus, then type.</strong>
    </p>

    <canvas
      ref="canvas"
      :width="CANVAS_W"
      :height="CANVAS_H"
      tabindex="0"
      style="outline: none; border-radius: 8px; display: block; cursor: text; max-width: 100%"
      @focus="focused = true"
      @blur="focused = false"
      @keydown="onKeyDown"
    />

    <div class="stats-row">
      <div class="chip">Lines <strong>{{ stats.lines }}</strong></div>
      <div class="chip">Chars <strong>{{ stats.chars }}</strong></div>
      <div class="chip">Cursor <strong>L{{ cursor.line + 1 }}:C{{ cursor.col }}</strong></div>
      <div class="chip note">API: <code>layoutWithLines()</code> for cursor positioning</div>
    </div>

    <CodeBlock title="Example — Canvas Text Editor with Pretext" :code="CODE" />
  </div>
</template>

<style scoped>
.instructions { margin-bottom: 12px; color: #94a3b8; font-size: 0.9rem; line-height: 1.5; }
.instructions strong { color: #e2e8f0; }
.instructions code { color: #34d399; background: #0f172a; padding: 1px 5px; border-radius: 3px; }
.stats-row { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 12px; align-items: center; }
.chip { background: #0f172a; border: 1px solid #334155; padding: 6px 13px; border-radius: 6px; font-size: 0.82rem; color: #94a3b8; }
.chip strong { color: #34d399; }
.chip.note { color: #475569; }
.chip.note code { color: #34d399; }
</style>
