<template>
  <div ref="chart" class="chart-container"></div>
</template>

<script>
import * as echarts from 'echarts'
import 'echarts-wordcloud'
import { fetchData } from '../service/index'

export default {
  name: 'word-cloud',
  props: {
    minCount: {
      type: Number,
      default: 6
    },
    speakerId: {
      type: Number,
      default: null
    }
  },
  data() {
    return {
      chartInstance: null,
      chartCleanup: null,
      wordcloudData: [],
      minWordcloudCount: 3
    }
  },
  mounted() {
    this.initChart()
    this.getHotword()
  },
  beforeUnmount() {
    this.destroyChart()
  },
  watch: {
    wordcloudData: {
      handler(newVal) {
        console.log('wordcloudData 变化:', newVal)
        if (newVal && newVal.length >= this.minCount) {
          this.updateChart()
        } else {
          this.clearChart()
        }
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    initChart() {
      if (!this.$refs.chart) return

      this.chartInstance = echarts.init(this.$refs.chart)

      const resizeHandler = () => {
        if (this.chartInstance) {
          this.chartInstance.resize()
        }
      }

      window.addEventListener('resize', resizeHandler)

      this.chartCleanup = () => {
        window.removeEventListener('resize', resizeHandler)
        if (this.chartInstance) {
          this.chartInstance.dispose()
        }
      }

      this.updateChart()
    },

    updateChart() {
      if (!this.chartInstance || !this.wordcloudData || this.wordcloudData.length < this.minCount)
        return

      const option = {
        series: [
          {
            type: 'wordcloud',
            shape: 'circle',
            sizeRange: [10, 100],
            rotationRange: [0, 0],
            gridSize: 38,
            textStyle: {
              fontFamily: 'Arial',
              fontWeight: 'bold',
              fontStyle: 'normal',
              fontSize: 28,
              lineHeight: 1.5
            },
            textShadow: {
              color: '#fff',
              offsetX: 0,
              offsetY: 0
            },
            data: this.wordcloudData
          }
        ]
      }

      this.chartInstance.setOption(option, true)
    },

    clearChart() {
      if (this.$refs.chart) {
        this.$refs.chart.innerHTML = ''
      }
    },

    destroyChart() {
      if (this.chartCleanup) {
        this.chartCleanup()
      }
    },

    async getHotword() {
      try {
        // 模拟热词数据，实际项目中应该从API获取
        const mockHotwords = [
          { word: '演讲', count: 35 },
          { word: '互动', count: 28 },
          { word: '弹幕', count: 25 },
          { word: '技术', count: 22 },
          { word: '创新', count: 20 },
          { word: '未来', count: 18 },
          { word: '发展', count: 17 },
          { word: '学习', count: 16 },
          { word: '分享', count: 15 },
          { word: '交流', count: 14 },
          { word: '科技', count: 13 },
          { word: '人工智能', count: 12 },
          { word: '数字化转型', count: 11 },
          { word: '云计算', count: 10 },
          { word: '大数据', count: 9 },
          { word: '物联网', count: 8 },
          { word: '区块链', count: 7 },
          { word: '元宇宙', count: 6 },
          { word: '5G', count: 5 },
          { word: '智慧城市', count: 4 }
        ]

        // 实际API调用（注释掉，使用模拟数据）
        // const response = await fetchData('/hotword/list', {
        //   speakerId: this.speakerId
        // });
        //
        // if (response && response.code === 200 && response.data) {
        //   this.wordcloudData = response.data.map(item => ({
        //     name: item.word,
        //     value: item.count
        //   }));
        // }

        // 使用模拟数据
        this.wordcloudData = mockHotwords.map(item => ({
          name: item.word,
          value: item.count
        }))
      } catch (error) {
        console.error('获取热词数据失败:', error)
        // 使用模拟数据作为降级方案
        const fallbackData = [
          { name: '演讲', value: 30 },
          { name: '互动', value: 25 },
          { name: '弹幕', value: 22 },
          { name: '技术', value: 20 },
          { name: '创新', value: 18 },
          { name: '未来', value: 16 },
          { name: '发展', value: 15 },
          { name: '学习', value: 14 },
          { name: '分享', value: 13 },
          { name: '交流', value: 12 },
          { name: '科技', value: 11 },
          { name: '人工智能', value: 10 },
          { name: '数字化转型', count: 9 },
          { name: '云计算', count: 8 },
          { name: '大数据', count: 7 },
          { name: '物联网', count: 6 },
          { name: '区块链', count: 5 },
          { name: '元宇宙', count: 4 },
          { name: '5G', count: 3 },
          { name: '智慧城市', count: 2 }
        ]
        this.wordcloudData = fallbackData
      }
    }
  }
}
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 500px;
}
</style>
