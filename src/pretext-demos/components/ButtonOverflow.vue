<script setup lang="ts">
import { prepare, layout } from '@chenglou/pretext'
import CodeBlock from './CodeBlock.vue'

const FONT = '13px Arial'
const LINE_HEIGHT = 20
const H_PAD = 14

const BUTTON_CONFIGS = [
  { maxW: 120, label: 'Submit' },
  { maxW: 120, label: 'Save Changes' },
  { maxW: 120, label: 'Delete Account' },
  { maxW: 100, label: 'OK' },
  { maxW: 100, label: 'Are you sure?' },
  { maxW: 80,  label: 'Confirm Purchase' },
  { maxW: 160, label: 'Send Message' },
  { maxW: 160, label: 'Export All Data as CSV' },
  { maxW: 140, label: '提交订单' },
  { maxW: 100, label: '确认删除此账户' },
  { maxW: 130, label: 'تأكيد الحذف' },
  { maxW: 150, label: '購入を確認する' },
  { maxW: 110, label: '注文を確定する' },
  { maxW: 160, label: 'Confirm 🎉 Great Choice!' },
  { maxW: 140, label: 'Buy Now 🛒' },
  { maxW: 80,  label: 'Install Latest Update' },
]

const results = BUTTON_CONFIGS.map(({ label, maxW }) => {
  const innerW = maxW - H_PAD * 2
  const p = prepare(label, FONT)
  const { lineCount } = layout(p, innerW, LINE_HEIGHT)
  return { label, maxW, lineCount, overflows: lineCount > 1 }
})

const overflowCount = results.filter(r => r.overflows).length

const CODE = `import { prepare, layout } from '@chenglou/pretext'

// Run in build pipeline, test suite, or CI — no browser needed
function checkButtonOverflow(label: string, buttonMaxW: number, font: string) {
  const innerW = buttonMaxW - paddingH * 2
  const p = prepare(label, font)
  const { lineCount } = layout(p, innerW, lineHeight)
  return { overflows: lineCount > 1, lineCount }
}

const results = buttons.map(({ label, maxWidth }) =>
  ({ label, maxWidth, ...checkButtonOverflow(label, maxWidth, '13px Arial') })
)

const failures = results.filter(r => r.overflows)
if (failures.length) {
  console.error('Button overflow detected:', failures)
  process.exit(1) // fail the build
}`
</script>

<template>
  <div>
    <p class="instructions">
      All {{ results.length }} buttons measured with <code>prepare()</code> +
      <code>layout()</code> —
      <strong style="color: #f87171">{{ overflowCount }} overflow</strong>
      detected before any DOM render. Zero reflow.
    </p>

    <div class="overflow-grid">
      <div
        v-for="r in results"
        :key="r.label"
        class="overflow-card"
        :class="r.overflows ? 'overflow' : 'ok'"
      >
        <div class="overflow-indicator">
          <span v-if="r.overflows" class="badge-fail">✗ Overflow</span>
          <span v-else class="badge-ok">✓ OK</span>
          <span class="overflow-meta">{{ r.lineCount }} line{{ r.lineCount > 1 ? 's' : '' }} · max {{ r.maxW }}px</span>
        </div>
        <div
          class="fake-button"
          :style="{
            maxWidth: r.maxW + 'px',
            background: r.overflows ? '#450a0a' : '#0f2a1e',
            borderColor: r.overflows ? '#ef4444' : '#22c55e',
            color: r.overflows ? '#fca5a5' : '#86efac',
          }"
        >{{ r.label }}</div>
      </div>
    </div>

    <div class="overflow-summary">
      <span class="sum ok">✓ {{ results.length - overflowCount }} OK</span>
      <span class="sum fail">✗ {{ overflowCount }} Overflow</span>
      <span class="sum note">— detected without touching the DOM</span>
    </div>

    <CodeBlock title="Example — Button Overflow Check with Pretext" :code="CODE" />
  </div>
</template>

<style scoped>
.instructions { margin-bottom: 16px; color: #94a3b8; font-size: 0.9rem; line-height: 1.5; }
.instructions code { color: #34d399; background: #0f172a; padding: 1px 5px; border-radius: 3px; }
.overflow-grid { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 16px; }
.overflow-card { background: #0f172a; border: 1px solid #1e293b; border-radius: 8px; padding: 10px 12px; display: flex; flex-direction: column; gap: 8px; }
.overflow-card.overflow { border-color: #7f1d1d; }
.overflow-card.ok { border-color: #14532d; }
.overflow-indicator { display: flex; align-items: center; gap: 8px; }
.badge-fail { background: #7f1d1d; color: #fca5a5; padding: 2px 7px; border-radius: 4px; font-size: 0.7rem; font-weight: 700; }
.badge-ok { background: #14532d; color: #86efac; padding: 2px 7px; border-radius: 4px; font-size: 0.7rem; font-weight: 700; }
.overflow-meta { font-size: 0.72rem; color: #475569; font-variant-numeric: tabular-nums; }
.fake-button { border: 1px solid; border-radius: 6px; padding: 5px 12px; font-size: 13px; line-height: 20px; font-family: Arial, sans-serif; word-break: break-word; }
.overflow-summary { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; margin-bottom: 4px; }
.sum { font-size: 0.85rem; }
.sum.ok { color: #22c55e; }
.sum.fail { color: #ef4444; }
.sum.note { color: #475569; }
</style>
