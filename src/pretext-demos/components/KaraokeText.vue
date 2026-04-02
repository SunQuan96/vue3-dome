<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { prepareWithSegments, layoutWithLines } from '@chenglou/pretext'
import CodeBlock from './CodeBlock.vue'

const W = 820, FONT = '21px Georgia, serif', LH = 34
const PAD_X = 32, PAD_TOP = 26, SECTION_GAP = 26
const MAX_TEXT_W = W - PAD_X * 2, BG = '#3D405B'

const SECTIONS = [
  { text: 'Pretext knows every script: from ASCII to Unicode, Latin words to CJK ideographs, Arabic calligraphy to Hangul syllables — all measured without a single DOM query.', charMode: false },
  { text: '床前明月光，疑是地上霜，举头望明月，低头思故乡。', charMode: true },
  { text: 'Mixed: Hello 你好 مرحبا Bonjour — pretext layouts every language on Earth.', charMode: false },
]

function isCJKLike(c: string): boolean {
  const cp = c.codePointAt(0) ?? 0
  return (cp >= 0x4e00 && cp <= 0x9fff) || (cp >= 0x3040 && cp <= 0x30ff) ||
    (cp >= 0xac00 && cp <= 0xd7af) || (cp >= 0x3000 && cp <= 0x303f)
}

type Token = { text: string; x: number; y: number; w: number }

function buildAllTokens(): { tokens: Token[]; canvasH: number } {
  const tmpCtx = document.createElement('canvas').getContext('2d')!
  tmpCtx.font = FONT
  let y = PAD_TOP
  const tokens: Token[] = []
  for (const s of SECTIONS) {
    const p = prepareWithSegments(s.text, FONT)
    const lines = layoutWithLines(p, MAX_TEXT_W, LH).lines
    for (const line of lines) {
      let x = PAD_X, i = 0
      const text = line.text
      while (i < text.length) {
        const c = text[i]
        if (/\s/.test(c)) { x += tmpCtx.measureText(c).width; i++; continue }
        if (s.charMode || isCJKLike(c)) {
          const w = tmpCtx.measureText(c).width
          tokens.push({ text: c, x, y, w }); x += w; i++
        } else {
          let j = i + 1
          while (j < text.length && !isCJKLike(text[j]) && !/\s/.test(text[j])) j++
          const word = text.slice(i, j)
          const w = tmpCtx.measureText(word).width
          tokens.push({ text: word, x, y, w }); x += w; i = j
        }
      }
      y += LH
    }
    y += SECTION_GAP
  }
  return { tokens, canvasH: y + 18 }
}

const { tokens: ALL_TOKENS, canvasH: CANVAS_H } = buildAllTokens()

const canvas = ref<HTMLCanvasElement | null>(null)
const currentIdx = ref(-1)
const playing = ref(false)
const msPerToken = ref(220)
let ctx: CanvasRenderingContext2D | null = null
let intervalId = 0

function draw(idx: number) {
  if (!ctx) return
  ctx.fillStyle = BG; ctx.fillRect(0, 0, W, CANVAS_H)
  ctx.font = FONT; ctx.textBaseline = 'top'
  for (let i = 0; i < ALL_TOKENS.length; i++) {
    const tok = ALL_TOKENS[i]
    if (i === idx) {
      const bp = 4
      ctx.fillStyle = 'rgba(251,191,36,0.18)'
      ctx.beginPath(); ctx.roundRect(tok.x - bp, tok.y - bp + 2, tok.w + bp * 2, LH, 4); ctx.fill()
      ctx.strokeStyle = 'rgba(251,191,36,0.65)'; ctx.lineWidth = 1.5; ctx.stroke()
      ctx.fillStyle = '#fffde7'
    } else if (i < idx) {
      ctx.fillStyle = '#8a9ab0'
    } else {
      ctx.fillStyle = '#5a6275'
    }
    ctx.fillText(tok.text, tok.x, tok.y)
  }
  const prog = idx < 0 ? 0 : (idx + 1) / ALL_TOKENS.length
  const barY = CANVAS_H - 14, barW = W - PAD_X * 2
  ctx.fillStyle = '#2a2e45'; ctx.beginPath(); ctx.roundRect(PAD_X, barY, barW, 4, 2); ctx.fill()
  if (prog > 0) { ctx.fillStyle = '#fbbf24'; ctx.beginPath(); ctx.roundRect(PAD_X, barY, barW * prog, 4, 2); ctx.fill() }
}

onMounted(() => {
  const el = canvas.value
  if (!el) return
  const dpr = window.devicePixelRatio || 1
  el.width = W * dpr; el.height = CANVAS_H * dpr
  el.style.width = W + 'px'; el.style.height = CANVAS_H + 'px'
  ctx = el.getContext('2d')!
  ctx.scale(dpr, dpr)
  draw(-1)
})

onUnmounted(() => clearInterval(intervalId))

watch(currentIdx, idx => draw(idx))

function togglePlay() {
  playing.value = !playing.value
  clearInterval(intervalId)
  if (playing.value) {
    intervalId = window.setInterval(() => {
      const next = Math.min(currentIdx.value + 1, ALL_TOKENS.length - 1)
      currentIdx.value = next
      if (next >= ALL_TOKENS.length - 1) { playing.value = false; clearInterval(intervalId) }
    }, msPerToken.value)
  }
}

function reset() {
  playing.value = false; clearInterval(intervalId); currentIdx.value = -1
}
</script>

<template>
  <div class="demo-wrapper">
    <p class="instructions">
      <code>layoutWithLines</code> gives every word and CJK character its exact pixel coordinate.
      Latin text highlights word-by-word; Chinese highlights character-by-character.
    </p>
    <canvas ref="canvas" style="display:block;max-width:100%" />
    <div style="margin-top:12px;display:flex;gap:10px;align-items:center;flex-wrap:wrap">
      <button @click="togglePlay" style="padding:6px 18px;cursor:pointer;font-weight:600">
        {{ playing ? '⏸ Pause' : '▶ Play' }}
      </button>
      <button @click="reset" style="padding:6px 14px;cursor:pointer">↺ Reset</button>
      <label style="color:#7A7E96;font-size:0.85rem">
        Speed:
        <input type="range" min="60" max="600" step="20" v-model.number="msPerToken"
          style="margin-left:8px;vertical-align:middle" />
        <span style="margin-left:6px;font-family:monospace;color:#3D405B;font-size:0.85rem">{{ msPerToken }}ms</span>
      </label>
      <span style="color:#7A7E96;font-size:0.85rem">
        {{ Math.max(0, currentIdx + 1) }} / {{ ALL_TOKENS.length }} tokens
      </span>
    </div>
    <CodeBlock
      title="Word + CJK character positions from layoutWithLines"
      :code="`const lines = layoutWithLines(prepared, maxWidth, lineHeight).lines
const tokens = lines.flatMap(line => {
  let x = PAD_X, i = 0, result = []
  while (i < line.text.length) {
    const c = line.text[i]
    if (isCJKLike(c)) { result.push({ text: c, x }); x += ctx.measureText(c).width; i++ }
    else if (/\\\\s/.test(c)) { x += ctx.measureText(c).width; i++ }
    else {
      const word = readWord(line.text, i)
      result.push({ text: word, x }); x += ctx.measureText(word).width; i += word.length
    }
  }
  return result
})`"
    />
  </div>
</template>

<style scoped>
.demo-wrapper { display: flex; flex-direction: column; gap: 16px; }
.instructions { margin-bottom: 4px; color: #64748b; font-size: 0.9rem; line-height: 1.5; }
.instructions code { color: #81B29A; background: #E8E4CE; padding: 1px 5px; border-radius: 3px; }
</style>
