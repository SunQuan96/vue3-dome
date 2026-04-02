<script setup lang="ts">
import { onMounted, ref } from 'vue'
import DynamicWidth from './DynamicWidth.vue'
import FlowAround from './FlowAround.vue'
import HeadlineFit from './HeadlineFit.vue'
import KaraokeText from './KaraokeText.vue'
import MasonryLayout from './MasonryLayout.vue'
import VirtualScroll from './VirtualScroll.vue'
import WordScatter from './WordScatter.vue'

type Tab = 'scroll' | 'width' | 'flow' | 'masonry' | 'headline' | 'karaoke' | 'scatter'
const VALID_TABS: Tab[] = ['scroll', 'width', 'flow', 'masonry', 'headline', 'karaoke', 'scatter']

function getHashTab(): Tab {
  const h = location.hash.slice(1) as Tab
  return VALID_TABS.includes(h) ? h : 'scroll'
}

const activeTab = ref<Tab>(getHashTab())

onMounted(() => {
  window.addEventListener('hashchange', () => {
    activeTab.value = getHashTab()
  })
})

function switchTab(id: Tab) {
  location.hash = id
  activeTab.value = id
}
</script>

<template>
  <div class="app">
    <header>
      <div>
        <h1 class="title"><img src="/vite.svg" class="fw-header-icon" alt="Vue" />Pretext × Vue</h1>
        <p class="subtitle">Text layout demos — zero DOM reflow, all languages</p>
      </div>
      <a class="back-link" href="/">← Back</a>
    </header>

    <nav class="tabs">
      <button :class="{ active: activeTab === 'scroll' }" @click="switchTab('scroll')">
        📜 Virtual Scroll
      </button>
      <button :class="{ active: activeTab === 'width' }" @click="switchTab('width')">
        ↔ Dynamic Width
      </button>
      <button :class="{ active: activeTab === 'flow' }" @click="switchTab('flow')">
        🌀 Flow Around Cursor
      </button>
      <button :class="{ active: activeTab === 'masonry' }" @click="switchTab('masonry')">
        🧱 Masonry Layout
      </button>
      <button :class="{ active: activeTab === 'headline' }" @click="switchTab('headline')">
        🗞 Headline Fit
      </button>
      <button :class="{ active: activeTab === 'karaoke' }" @click="switchTab('karaoke')">
        🎤 Karaoke
      </button>
      <button :class="{ active: activeTab === 'scatter' }" @click="switchTab('scatter')">
        💥 Word Scatter
      </button>
    </nav>

    <div class="content">
      <VirtualScroll v-if="activeTab === 'scroll'" />
      <DynamicWidth v-if="activeTab === 'width'" />
      <FlowAround v-if="activeTab === 'flow'" />
      <MasonryLayout v-if="activeTab === 'masonry'" />
      <HeadlineFit v-if="activeTab === 'headline'" />
      <KaraokeText v-if="activeTab === 'karaoke'" />
      <WordScatter v-if="activeTab === 'scatter'" />
    </div>
  </div>
</template>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: Arial, sans-serif;
  background: #f4f1de;
  color: #3d405b;
  min-height: 100vh;
  padding: 24px 32px;
}

.app {
  max-width: 960px;
  margin: 0 auto;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  gap: 24px;
}

.title {
  font-family: 'VT323', monospace;
  font-size: 1.9rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #81b29a;
  margin-bottom: 6px;
}

.fw-header-icon {
  width: 28px;
  height: 28px;
  flex-shrink: 0;
}

.subtitle {
  color: #7a7e96;
  font-size: 0.9rem;
}

.back-link {
  color: #81b29a;
  text-decoration: none;
  font-size: 0.9rem;
  white-space: nowrap;
  padding: 6px 14px;
  border: 1px solid #c4bfaa;
  border-radius: 8px;
  transition: border-color 0.15s;
}
.back-link:hover {
  border-color: #81b29a;
}

.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.tabs button {
  padding: 10px 22px;
  border: 1px solid #c4bfaa;
  background: #e8e4ce;
  color: #7a7e96;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.15s;
  font-family: Arial, sans-serif;
}
.tabs button:hover {
  border-color: #81b29a;
  color: #3d405b;
}
.tabs button.active {
  background: #81b29a;
  border-color: #5a9078;
  color: #f4f1de;
}

.content {
  background: #e8e4ce;
  border: 1px solid #c4bfaa;
  border-radius: 12px;
  padding: 24px;
}

/* ── Code block (global, shared across all demo components) ── */
.code-block {
  margin-top: 20px;
  border: 1px solid #c4bfaa;
  border-radius: 10px;
  overflow: hidden;
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #ddd8c0;
  padding: 8px 14px;
  border-bottom: 1px solid #c4bfaa;
}

.code-title {
  font-size: 0.75rem;
  color: #7a7e96;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  font-family: Arial, sans-serif;
}

.copy-btn {
  background: #ede9d4;
  border: 1px solid #c4bfaa;
  color: #7a7e96;
  padding: 3px 12px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.75rem;
  font-family: Arial, sans-serif;
  transition: all 0.15s;
}
.copy-btn:hover {
  border-color: #81b29a;
  color: #3d405b;
}

.code-block pre {
  background: #3d405b;
  padding: 16px;
  overflow-x: auto;
  margin: 0;
}

.code-block code {
  font-family: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
  font-size: 0.78rem;
  line-height: 1.7;
  color: #f4f1de;
  white-space: pre;
}
</style>
