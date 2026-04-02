<script setup lang="ts">
import { ref } from 'vue'

const { title, code } = defineProps<{ title: string; code: string }>()
const copied = ref(false)

function copy() {
  navigator.clipboard.writeText(code.trim()).then(() => {
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  })
}
</script>

<template>
  <div class="code-block">
    <div class="code-header">
      <span class="code-title">{{ title }}</span>
      <button class="copy-btn" @click="copy">{{ copied ? '✓ Copied' : 'Copy' }}</button>
    </div>
    <pre><code>{{ code.trim() }}</code></pre>
  </div>
</template>
