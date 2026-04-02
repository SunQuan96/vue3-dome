<script setup lang="ts">
import { prepareWithSegments, walkLineRanges } from '@chenglou/pretext'
import CodeBlock from './CodeBlock.vue'

const FONT = 'bold 22px Arial'
const LINE_HEIGHT = 34
const FIXED_W = 300

const SAMPLES = [
  {
    label: 'English · long orphan',
    text: 'The surprisingly fast rise of open-source AI tools has changed everything'
  },
  {
    label: 'English · single-word widow',
    text: 'Introducing the fastest text layout engine ever built for the modern web'
  },
  {
    label: 'Japanese',
    text: '新しい研究が確認：バランスの取れたタイポグラフィは読解力を大幅に向上させる'
  }
]

function measureLines(prepared: ReturnType<typeof prepareWithSegments>, maxW: number) {
  let count = 0
  walkLineRanges(prepared, maxW, () => {
    count++
  })
  return count
}

function balanceWidth(
  prepared: ReturnType<typeof prepareWithSegments>,
  naturalLines: number,
  maxW: number
) {
  let lo = 40,
    hi = maxW
  for (let i = 0; i < 20; i++) {
    const mid = (lo + hi) / 2
    measureLines(prepared, mid) <= naturalLines ? (hi = mid) : (lo = mid)
  }
  return Math.ceil(hi)
}

const results = SAMPLES.map(({ label, text }) => {
  const prepared = prepareWithSegments(text, FONT)
  const naturalLines = measureLines(prepared, FIXED_W)
  const balancedW = balanceWidth(prepared, naturalLines, FIXED_W)
  const saving = Math.round((1 - balancedW / FIXED_W) * 100)
  return { label, text, naturalLines, balancedW, saving }
})

const CODE = `import { prepareWithSegments, walkLineRanges } from '@chenglou/pretext'

const prepared = prepareWithSegments(headline, 'bold 22px Arial')

function countLines(maxWidth: number) {
  let n = 0
  walkLineRanges(prepared, maxWidth, () => { n++ })
  return n
}

// True text-wrap:balance: find narrowest width for the SAME line count.
function balanceWidth(containerWidth: number) {
  const natural = countLines(containerWidth)
  let lo = 40, hi = containerWidth
  for (let i = 0; i < 20; i++) {
    const mid = (lo + hi) / 2
    countLines(mid) <= natural ? (hi = mid) : (lo = mid)
  }
  return Math.ceil(hi)
}

element.style.maxWidth = balanceWidth(containerWidth) + 'px'`
</script>

<template>
  <div>
    <p class="canvas-instructions">
      Both columns use a <strong>fixed {{ FIXED_W }}px container</strong>. Normal wrapping is greedy
      — the last line is often a short orphan. Balanced finds the <em>narrowest</em> width that
      keeps the same line count, so every line fills its space evenly.
    </p>

    <div class="balance-list">
      <div v-for="r in results" :key="r.label" class="balance-card">
        <div class="balance-label">{{ r.label }} · {{ r.naturalLines }} lines</div>
        <div class="balance-row">
          <div class="balance-col">
            <div class="balance-col-title">Normal — greedy wrap</div>
            <div
              :style="{
                width: FIXED_W + 'px',
                border: '2px dashed #C4BFAA',
                borderRadius: '6px',
                padding: '8px',
                fontFamily: 'Arial',
                fontSize: '22px',
                fontWeight: 'bold',
                lineHeight: LINE_HEIGHT + 'px',
                color: '#3D405B',
                wordBreak: 'break-word'
              }"
            >
              {{ r.text }}
            </div>
            <div class="balance-meta">container: {{ FIXED_W }}px</div>
          </div>

          <div class="balance-divider" />

          <div class="balance-col">
            <div class="balance-col-title balanced">Balanced ✓ — equal lines</div>
            <div :style="{ width: FIXED_W + 'px' }">
              <div
                :style="{
                  width: r.balancedW + 'px',
                  border: '2px solid #81B29A',
                  borderRadius: '6px',
                  padding: '8px',
                  fontFamily: 'Arial',
                  fontSize: '22px',
                  fontWeight: 'bold',
                  lineHeight: LINE_HEIGHT + 'px',
                  color: '#3D405B',
                  wordBreak: 'break-word'
                }"
              >
                {{ r.text }}
              </div>
            </div>
            <div class="balance-meta balanced">
              maxWidth: {{ r.balancedW }}px · {{ r.saving }}% narrower — lines fill evenly
            </div>
          </div>
        </div>
      </div>
    </div>

    <CodeBlock title="Example — Balanced Headlines with walkLineRanges()" :code="CODE" />
  </div>
</template>

<style scoped>
.canvas-instructions {
  margin-bottom: 16px;
  font-size: 0.9rem;
  line-height: 1.6;
  color: #5a5e78;
}
.canvas-instructions strong {
  color: #3d405b;
}
.canvas-instructions code {
  color: #e07a5f;
  background: #e8e4ce;
  padding: 1px 5px;
  border-radius: 3px;
}
.balance-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.balance-card {
  background: #ede9d4;
  border: 1px solid #c4bfaa;
  border-radius: 10px;
  padding: 16px;
}
.balance-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #7a7e96;
  margin-bottom: 12px;
}
.balance-row {
  display: flex;
  gap: 24px;
  align-items: flex-start;
  flex-wrap: wrap;
}
.balance-col {
  flex: 1;
  min-width: 200px;
}
.balance-col-title {
  font-size: 0.75rem;
  color: #7a7e96;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.balance-col-title.balanced {
  color: #81b29a;
}
.balance-meta {
  font-size: 0.75rem;
  color: #7a7e96;
  margin-top: 8px;
  font-variant-numeric: tabular-nums;
}
.balance-meta.balanced {
  color: #81b29a;
}
.balance-divider {
  width: 1px;
  background: #c4bfaa;
  align-self: stretch;
}
</style>
