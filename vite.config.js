import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // GitHub Pages 通常部署在 `/<repo>/` 路径下；在 Actions 环境中可从 GITHUB_REPOSITORY 推断仓库名
  const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1]
  const base = mode === 'production' ? `/${repoName ?? 'vue3-dome'}/` : '/'

  return {
    plugins: [vue(), vueJsx()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      cors: true,
      open: true
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
      minify: 'terser',
      chunkSizeWarningLimit: 1500
    },
    base
  }
})
