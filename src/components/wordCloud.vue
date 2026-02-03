<template>
  <div ref="chart" class="chart-container"></div>
</template>

<script>
import * as echarts from 'echarts'
import { fetchData } from '../service/index'

export default {
  name: 'word-cloud',
  props: {
    minCount: {
      type: Number,
      default: 3  // 修改默认值为3，热词≥3个时显示词云
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
      hotJsonData: [
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
    },

    updateChart() {   
      if (!this.chartInstance || !this.wordcloudData || this.wordcloudData.length < this.minCount)
        return

      const option = {
        series: [
          {
            type: 'wordCloud',
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
        await new Promise(resolve => setTimeout(resolve, 500))
        
        this.wordcloudData = this.hotJsonData.map(item => ({
          name: item.word,
          value: item.count,
          textStyle: {
            color: `rgb(${[0,0,0].map(() => Math.round(Math.random() * 105) + 150).join(',')})`
          }
        }))
      } catch (error) {
        this.wordcloudData = this.hotJsonData.map(item => ({
          name: item.word,
          value: item.count,
          textStyle: {
            color: `rgb(${[0,0,0].map(() => Math.round(Math.random() * 105) + 150).join(',')})`
          }
        }))
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
