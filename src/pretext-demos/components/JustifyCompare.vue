<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { prepareWithSegments, layoutWithLines } from '@chenglou/pretext'
import CodeBlock from './CodeBlock.vue'
import { justificationComparisonText } from '../shared/justificationComparisonText.ts'

const canvasRef = ref<HTMLCanvasElement | null>(null)

// Constants matching the reference demo
const FONT = '15px Georgia, "Times New Roman", serif'
const LH = 24
const PAD = 12           // inner column padding
const PARA_GAP = LH * 0.6
const H_PAD = 16
const COL_GAP = 24
const LABEL_H = 42
const STAT_H = 58

// Justification guards (from reference model)
const SHORT_LINE_RATIO = 0.6
const RIVER_THRESHOLD = 1.5
const MIN_READABLE_GAP = 0.75
const OVERFLOW_GAP = 0.2

const PARAGRAPHS = justificationComparisonText.split('\n\n')
const colW = ref(240)

function getRiverColor(gapW: number, spW: number): string | null {
  if (gapW <= spW * RIVER_THRESHOLD) return null
  const t = Math.min(1, (gapW / spW - RIVER_THRESHOLD) / RIVER_THRESHOLD)
  const r = Math.round(220 + t * 35)
  const g = Math.round(180 - t * 80)
  const b = Math.round(180 - t * 80)
  const a = 0.25 + t * 0.35
  return `rgba(${r},${g},${b},${a})`
}

const CODE = `import { prepareWithSegments, layoutWithLines } from '@chenglou/pretext'

const innerWidth = columnWidth - PAD * 2
const prepared   = prepareWithSegments(text, font)
const { lines }  = layoutWithLines(prepared, innerWidth, lineHeight)

const spW = ctx.measureText(' ').width

lines.forEach((line, i) => {
  const txt      = line.text.trimEnd()
  const words    = txt.split(' ').filter(Boolean)
  const wordW    = words.map(w => ctx.measureText(w).width)
  const totalW   = wordW.reduce((s, w) => s + w, 0)
  const naturalW = totalW + spW * (words.length - 1)
  const isLast   = i === lines.length - 1

  // Skip justification for short lines (<60% filled) or the last para line
  const isShort  = naturalW < innerWidth * 0.6
  const rawGap   = (innerWidth - totalW) / (words.length - 1)
  const doJust   = words.length > 1 && !isShort && !isLast && rawGap > spW * 0.2

  if (!doJust) { ctx.fillText(txt, x, y); return }

  // Clamp to min readable gap, detect rivers
  const gapW    = Math.max(rawGap, spW * 0.75)
  const isRiver = gapW > spW * 1.5

  let cx = x
  words.forEach((word, wi) => {
    if (wi < words.length - 1 && isRiver) {
      ctx.fillStyle = 'rgba(220,120,100,0.4)'
      ctx.fillRect(cx + wordW[wi] + 1, y, gapW - 2, lineHeight)
    }
    ctx.fillStyle = '#2a2520'
    ctx.fillText(word, cx, y)
    if (wi < words.length - 1) cx += wordW[wi] + gapW
  })
})`

type Mode = 'left' | 'css' | 'smart'
type Metrics = { avgDev: number; maxDev: number; rivers: number }

function redraw() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const dpr = window.devicePixelRatio || 1
  const cw = colW.value

  ctx.font = FONT
  const spW = ctx.measureText(' ').width
  const innerW = cw - PAD * 2

  const paraLines = PARAGRAPHS.map(para => {
    const prepared = prepareWithSegments(para, FONT)
    return layoutWithLines(prepared, innerW, LH).lines
  })

  const contentH =
    paraLines.reduce((s: number, ls) => s + ls.length * LH, 0) +
    (PARAGRAPHS.length - 1) * PARA_GAP

  const totalW = H_PAD * 2 + cw * 3 + COL_GAP * 2
  const totalH = LABEL_H + PAD + contentH + PAD + STAT_H

  canvas.width = totalW * dpr
  canvas.height = totalH * dpr
  canvas.style.width = totalW + 'px'
  canvas.style.height = totalH + 'px'
  ctx.scale(dpr, dpr)

  const colXs = [
    H_PAD,
    H_PAD + cw + COL_GAP,
    H_PAD + (cw + COL_GAP) * 2,
  ]

  ctx.fillStyle = '#F4F1DE'
  ctx.fillRect(0, 0, totalW, totalH)

  colXs.forEach(x => {
    ctx.fillStyle = '#EDE9D4'
    ctx.fillRect(x, 0, cw, totalH)
  })

  ctx.strokeStyle = '#C4BFAA'
  ctx.lineWidth = 1
  for (let i = 1; i < 3; i++) {
    const dx = colXs[i] - COL_GAP / 2
    ctx.beginPath(); ctx.moveTo(dx, 0); ctx.lineTo(dx, totalH); ctx.stroke()
  }

  ctx.strokeStyle = '#C4BFAA'
  ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(0, LABEL_H); ctx.lineTo(totalW, LABEL_H); ctx.stroke()

  const LABELS = ['Left align', 'CSS justify', 'Pretext — smart justify']
  const SUBS   = ['greedy, no stretch', 'rivers shown in red', 'rivers skipped → ragged']
  ctx.textBaseline = 'top'
  ctx.textAlign = 'left'
  colXs.forEach((x, i) => {
    ctx.font = 'bold 11px Arial'
    ctx.fillStyle = '#3D405B'
    ctx.fillText(LABELS[i], x + PAD, 8)
    ctx.font = '10px Arial'
    ctx.fillStyle = '#7A7E96'
    ctx.fillText(SUBS[i], x + PAD, 24)
  })

  function drawColumn(x0: number, mode: Mode): Metrics {
    ctx.font = FONT
    ctx.textBaseline = 'top'
    const deviations: number[] = []
    let rivers = 0
    let y = LABEL_H + PAD

    paraLines.forEach((lines, paraIdx) => {
      lines.forEach((line, lineIdx) => {
        const txt = line.text.trimEnd()
        const words = txt.split(' ').filter(Boolean)
        if (words.length === 0) { y += LH; return }

        // Use line.width from Pretext (exact measured width, trailing space excluded)
        const isLastInPara = lineIdx === lines.length - 1
        const isShort = line.width < innerW * SHORT_LINE_RATIO
        const rawGap = words.length > 1
          ? spW + (innerW - line.width) / (words.length - 1)
          : spW
        const wouldOverflow = rawGap < spW * OVERFLOW_GAP
        const wouldCreateRiver = rawGap > spW * RIVER_THRESHOLD

        // Both CSS and smart modes skip last-in-para (matching browser & reference behaviour)
        const doJustify =
          mode !== 'left' &&
          words.length > 1 &&
          !isLastInPara &&
          !isShort &&
          !wouldOverflow &&
          !(mode === 'smart' && wouldCreateRiver)

        if (doJustify) {
          const gapW = Math.max(rawGap, spW * MIN_READABLE_GAP)
          const deviation = Math.abs(gapW - spW) / spW
          deviations.push(deviation)
          const isRiver = gapW > spW * RIVER_THRESHOLD
          if (isRiver) rivers++

          let cx = x0 + PAD
          words.forEach((word: string, wi: number) => {
            if (wi < words.length - 1 && isRiver && mode === 'css') {
              const rc = getRiverColor(gapW, spW)
              if (rc) {
                ctx.fillStyle = rc
                ctx.fillRect(cx + ctx.measureText(word).width + 1, y, gapW - 2, LH)
              }
            }
            ctx.fillStyle = '#3D405B'
            ctx.fillText(word, cx, y)
            if (wi < words.length - 1) cx += ctx.measureText(word).width + gapW
          })
        } else {
          ctx.fillStyle = '#3D405B'
          ctx.fillText(txt, x0 + PAD, y)
        }

        y += LH
      })
      if (paraIdx < paraLines.length - 1) y += PARA_GAP
    })

    const avgDev = deviations.length > 0
      ? deviations.reduce((s: number, d: number) => s + d, 0) / deviations.length
      : 0
    const maxDev = deviations.length > 0 ? Math.max(...deviations) : 0
    return { avgDev, maxDev, rivers }
  }

  const allMetrics = [
    drawColumn(colXs[0], 'left'),
    drawColumn(colXs[1], 'css'),
    drawColumn(colXs[2], 'smart'),
  ]

  const statY = LABEL_H + PAD + contentH + PAD
  ctx.strokeStyle = '#C4BFAA'
  ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(0, statY); ctx.lineTo(totalW, statY); ctx.stroke()

  colXs.forEach((x, i) => {
    const m = allMetrics[i]!
    ctx.font = '10px Arial'
    ctx.textBaseline = 'top'
    const tx = x + PAD
    const avgColor = m.avgDev < 0.15 ? '#81B29A' : m.avgDev < 0.35 ? '#C8943A' : '#E07A5F'
    ctx.fillStyle = avgColor
    ctx.fillText(`avg gap dev: ${(m.avgDev * 100).toFixed(1)}%`, tx, statY + 6)
    ctx.fillStyle = '#7A7E96'
    ctx.fillText(`max gap dev: ${(m.maxDev * 100).toFixed(1)}%`, tx, statY + 20)
    ctx.fillStyle = m.rivers > 0 ? '#E07A5F' : '#81B29A'
    ctx.fillText(`river spaces: ${m.rivers}`, tx, statY + 34)
  })
}

onMounted(redraw)
watch(colW, redraw)
</script>

<template>
  <div>
    <p class="canvas-instructions">
      Same paragraph, three rendering strategies — all with identical greedy line-breaks.
      <strong style="color:#E07A5F">CSS justify</strong>: stretches every non-short,
      non-last line; <span style="color:#E07A5F">red highlights</span> mark river
      gaps (&gt;1.5× normal).
      <strong style="color:#81B29A">Pretext smart</strong>: uses <code>line.width</code>
      to pre-compute each gap — if it would create a river, the line is left ragged instead.
      Drag narrower to amplify the difference.
    </p>
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
      <label style="font-size:0.85rem;color:#7A7E96;white-space:nowrap">column width</label>
      <input type="range" min="120" max="420" v-model.number="colW" style="flex:1;max-width:260px;accent-color:#E07A5F" />
      <span style="font-size:0.85rem;color:#3D405B;min-width:40px;text-align:right">{{ colW }}px</span>
    </div>
    <div style="overflow-x: auto; margin-bottom: 16px">
      <canvas ref="canvasRef" style="display:block; border-radius:8px" />
    </div>
    <CodeBlock title="Justification with river detection" :code="CODE" />
  </div>
</template>
