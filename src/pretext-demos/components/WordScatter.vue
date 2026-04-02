<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { prepareWithSegments, layoutWithLines } from '@chenglou/pretext'
import CodeBlock from './CodeBlock.vue'

const W = 820, H = 370, FONT = '18px Arial, sans-serif', LH = 30
const PAD_X = 34, PAD_TOP = 28, MAX_TEXT_W = W - PAD_X * 2, BG = '#3D405B'
const SPRING = 0.055, DAMP = 0.87

const TEXT =
  'Text layout has been broken on the web for 30 years. ' +
  'Pretext solves it: every word knows its exact pixel position, ' +
  'its width, its line, its script — Arabic, CJK, Latin, Devanagari. ' +
  'Click anywhere to scatter the words.'

type P = { text: string; origX: number; origY: number; x: number; y: number; vx: number; vy: number; w: number; hue: number }

function initParticles(): P[] {
  const tmpCtx = document.createElement('canvas').getContext('2d')!
  tmpCtx.font = FONT
  const prepared = prepareWithSegments(TEXT, FONT)
  const { lines } = layoutWithLines(prepared, MAX_TEXT_W, LH)
  const ps: P[] = []
  lines.forEach((line, li) => {
    const y = PAD_TOP + li * LH; let x = PAD_X
    line.text.split(/\s+/).filter(Boolean).forEach((word, wi) => {
      const w = tmpCtx.measureText(word).width
      ps.push({ text: word, origX: x, origY: y, x, y, vx: 0, vy: 0, w, hue: (li * 47 + wi * 23) % 360 })
      x += tmpCtx.measureText(word + ' ').width
    })
  })
  return ps
}

const canvas = ref<HTMLCanvasElement | null>(null)
let particles: P[] = []
let ctx: CanvasRenderingContext2D | null = null
let rafId = 0, active = false

function drawSettled() {
  if (!ctx) return
  ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H)
  ctx.font = FONT; ctx.textBaseline = 'top'; ctx.fillStyle = '#c4cfdb'
  for (const p of particles) ctx.fillText(p.text, p.origX, p.origY)
  ctx.font = '12px Arial'; ctx.fillStyle = '#8a9ab0'; ctx.textAlign = 'center'
  ctx.fillText('click to scatter', W / 2, H - 16); ctx.textAlign = 'left'
}

function tick() {
  if (!ctx) return
  ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H)
  ctx.font = FONT; ctx.textBaseline = 'top'
  let moving = false
  for (const p of particles) {
    p.vx = (p.vx + (p.origX - p.x) * SPRING) * DAMP
    p.vy = (p.vy + (p.origY - p.y) * SPRING) * DAMP
    p.x += p.vx; p.y += p.vy
    if (Math.abs(p.vx) > 0.4 || Math.abs(p.vy) > 0.4) moving = true
    const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
    const sat = Math.min(90, speed * 3.5), lit = 55 + Math.min(28, speed * 1.5)
    ctx.fillStyle = sat < 8 ? '#c4cfdb' : `hsl(${p.hue},${sat}%,${lit}%)`
    ctx.fillText(p.text, p.x, p.y)
  }
  if (moving) {
    rafId = requestAnimationFrame(tick)
  } else {
    active = false
    for (const p of particles) { p.x = p.origX; p.y = p.origY; p.vx = 0; p.vy = 0 }
    drawSettled()
  }
}

function scatter() {
  for (const p of particles) {
    const angle = Math.random() * Math.PI * 2, speed = 180 + Math.random() * 440
    p.vx += Math.cos(angle) * speed; p.vy += Math.sin(angle) * speed
  }
  if (!active) { active = true; rafId = requestAnimationFrame(tick) }
}

onMounted(() => {
  const el = canvas.value
  if (!el) return
  const dpr = window.devicePixelRatio || 1
  el.width = W * dpr; el.height = H * dpr
  el.style.width = W + 'px'; el.style.height = H + 'px'
  ctx = el.getContext('2d')!
  ctx.scale(dpr, dpr)
  particles = initParticles()
  drawSettled()
})

onUnmounted(() => cancelAnimationFrame(rafId))
</script>

<template>
  <div class="demo-wrapper">
    <p class="instructions">
      <code>layoutWithLines</code> gives each word its exact pixel coordinate.
      Click the canvas to scatter — spring physics pulls every word home.
    </p>
    <canvas ref="canvas" style="display:block;cursor:pointer;max-width:100%" @click="scatter" />
    <CodeBlock
      title="Word positions → spring physics scatter"
      :code="`const { lines } = layoutWithLines(prepared, maxWidth, lineHeight)
const particles = lines.flatMap((line, li) => {
  let x = PAD_X
  return line.text.split(/\\\\s+/).filter(Boolean).map(word => {
    const p = { text: word, origX: x, origY: PAD_TOP + li * lh, x, y: 0, vx: 0, vy: 0 }
    x += ctx.measureText(word + ' ').width
    return p
  })
})
// Spring physics — words always return home
function tick() {
  for (const p of particles) {
    p.vx = (p.vx + (p.origX - p.x) * SPRING) * DAMP
    p.vy = (p.vy + (p.origY - p.y) * SPRING) * DAMP
    p.x += p.vx; p.y += p.vy
    ctx.fillText(p.text, p.x, p.y)
  }
}`"
    />
  </div>
</template>

<style scoped>
.demo-wrapper { display: flex; flex-direction: column; gap: 16px; }
.instructions { margin-bottom: 4px; color: #64748b; font-size: 0.9rem; line-height: 1.5; }
.instructions code { color: #81B29A; background: #E8E4CE; padding: 1px 5px; border-radius: 3px; }
</style>
