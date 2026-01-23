<template>
  <div class="channel-data">
    <!-- 数据概览模块 -->
    <div class="overview-section">
      <div class="overview-card">
        <div class="overview-item">
          <div class="label">总规模</div>
          <div class="value">{{ formatNumber(overviewData.totalScale) }}</div>
        </div>
        <div class="overview-item">
          <div class="label">年初规模</div>
          <div class="value">{{ formatNumber(overviewData.beginningScale) }}</div>
        </div>
        <div class="overview-item">
          <div class="label">变动/盈亏</div>
          <div class="value" :class="getChangeClass(overviewData.change)">
            {{ formatChange(overviewData.change) }}
          </div>
        </div>
      </div>
    </div>

    <!-- 统计模块：时间范围选择 -->
    <div class="statistics-section">
      <van-cell-group>
        <van-cell
          title="开始日期"
          :value="formatDate(startDate, 'YYYY-MM-DD')"
          is-link
          @click="showStartDatePicker = true"
        />
        <van-cell
          title="结束日期"
          :value="formatDate(endDate, 'YYYY-MM-DD')"
          is-link
          @click="showEndDatePicker = true"
        />
      </van-cell-group>

      <!-- 开始日期选择器弹窗 -->
      <van-popup v-model:show="showStartDatePicker" position="bottom" :style="{ height: '50%' }">
        <van-date-picker
          v-model="startDate"
          title="选择开始日期"
          @confirm="handleStartDateConfirm"
          @cancel="showStartDatePicker = false"
        />
      </van-popup>

      <!-- 结束日期选择器弹窗 -->
      <van-popup v-model:show="showEndDatePicker" position="bottom" :style="{ height: '50%' }">
        <van-date-picker
          v-model="endDate"
          title="选择结束日期"
          @confirm="handleEndDateConfirm"
          @cancel="showEndDatePicker = false"
        />
      </van-popup>
    </div>

    <!-- 类型标签切换模块 -->
    <div class="tabs-section">
      <van-tabs v-model:active="activeChannelType" @change="handleChannelTypeChange">
        <van-tab
          v-for="tab in channelTypeTabs"
          :key="tab.value"
          :name="tab.value"
          :title="tab.label"
        />
      </van-tabs>
    </div>

    <!-- 表格展示模块 -->
    <div class="table-section">
      <!-- 类型1表格 -->
      <div v-if="activeChannelType === 'type1'" class="table-container">
        <van-cell-group>
          <van-cell
            v-for="(item, index) in tableData"
            :key="index"
            :title="item.name"
            :value="formatNumber(item.amount)"
            :label="item.description"
            is-link
            @click="handleRowClick(item, 'type1')"
          >
            <template #value>
              <span :class="getAmountClass(item.amount)">{{ formatNumber(item.amount) }}</span>
            </template>
          </van-cell>
        </van-cell-group>
      </div>

      <!-- 类型2表格 -->
      <div v-if="activeChannelType === 'type2'" class="table-container">
        <div class="table-header">
          <div
            v-for="col in type2Columns"
            :key="col.key"
            class="table-header-cell"
            :class="{ 'sortable': col.sortable, 'active': sortKey === col.key }"
            @click="handleSort(col.key, col.sortable)"
          >
            {{ col.title }}
            <van-icon
              v-if="col.sortable"
              :name="getSortIcon(col.key)"
              class="sort-icon"
            />
          </div>
        </div>
        <div class="table-body">
          <div
            v-for="(row, index) in sortedTableData"
            :key="index"
            class="table-row"
            @click="handleRowClick(row, 'type2')"
          >
            <div
              v-for="col in type2Columns"
              :key="col.key"
              class="table-cell"
              :class="getCellClass(col.key, row[col.key])"
            >
              {{ formatCellValue(col.key, row[col.key]) }}
            </div>
          </div>
        </div>
      </div>

      <!-- 类型3表格 -->
      <div v-if="activeChannelType === 'type3'" class="table-container">
        <van-cell-group>
          <van-cell
            v-for="(item, index) in tableData"
            :key="index"
            :title="item.title"
            :value="formatNumber(item.value)"
            :label="item.subtitle"
            is-link
            @click="handleRowClick(item, 'type3')"
          >
            <template #value>
              <div class="cell-value-wrapper">
                <span :class="getValueClass(item.value)">{{ formatNumber(item.value) }}</span>
                <span v-if="item.rate" :class="getRateClass(item.rate)" class="rate-text">
                  {{ formatRate(item.rate) }}
                </span>
              </div>
            </template>
          </van-cell>
        </van-cell-group>
      </div>
    </div>
  </div>
</template>

<script>
import { formatDate as formatDateUtil } from '@/utils'
import { fetchData } from '@/service'
import { useAppStore } from '@/store'
import * as echarts from 'echarts'
import { Popup, DatePicker, showToast } from 'vant'

export default {
  name: 'ChannelData',
  components: {
    [Popup.name]: Popup,
    [DatePicker.name]: DatePicker
  },
  props: {
    // 渠道类型
    channelType: {
      type: String,
      default: 'type1'
    }
  },
  data() {
    return {
      // 响应式数据
      activeChannelType: this.channelType || 'type1',
      showStartDatePicker: false,
      showEndDatePicker: false,
      startDate: new Date().getTime(),
      endDate: new Date().getTime(),
      sortKey: '',
      sortOrder: 'asc', // 'asc' | 'desc'

      // 数据概览
      overviewData: {
        totalScale: 1000000000,
        beginningScale: 800000000,
        change: 200000000
      },

      // 表格数据
      tableData: [],

      // 类型标签配置
      channelTypeTabs: [
        { label: '类型1', value: 'type1' },
        { label: '类型2', value: 'type2' },
        { label: '类型3', value: 'type3' }
      ],

      // 类型2表格列配置
      type2Columns: [
        { key: 'name', title: '名称', sortable: true },
        { key: 'amount', title: '金额', sortable: true },
        { key: 'rate', title: '占比', sortable: true },
        { key: 'change', title: '变动', sortable: true }
      ],

      // Store 实例
      appStore: null
    }
  },
  computed: {
    // 排序后的表格数据
    sortedTableData() {
      if (this.activeChannelType !== 'type2' || !this.sortKey) {
        return this.tableData
      }

      const data = [...this.tableData]
      return data.sort((a, b) => {
        const aVal = a[this.sortKey]
        const bVal = b[this.sortKey]

        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return this.sortOrder === 'asc' ? aVal - bVal : bVal - aVal
        }

        const aStr = String(aVal || '')
        const bStr = String(bVal || '')
        return this.sortOrder === 'asc'
          ? aStr.localeCompare(bStr)
          : bStr.localeCompare(aStr)
      })
    }
  },
  watch: {
    // 监听 channelType prop 变化
    channelType: {
      handler(newVal) {
        if (newVal) {
          this.activeChannelType = newVal
          this.loadTableData()
        }
      },
      immediate: true
    }
  },
  created() {
    // 初始化 store
    this.appStore = useAppStore()
  },
  mounted() {
    // 如果传入了 channelType prop，使用 prop 的值
    if (this.channelType) {
      this.activeChannelType = this.channelType
    }
    this.loadTableData()
  },
  methods: {
    // 方法
    handleChannelTypeChange(name) {
      this.activeChannelType = name
      this.sortKey = ''
      this.sortOrder = 'asc'
      this.loadTableData()
    },

    handleStartDateConfirm(value) {
      this.startDate = value
      this.showStartDatePicker = false
      this.loadTableData()
    },

    handleEndDateConfirm(value) {
      this.endDate = value
      this.showEndDatePicker = false
      this.loadTableData()
    },

    handleSort(key, sortable) {
      if (!sortable) return

      if (this.sortKey === key) {
        // 切换排序方向
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc'
      } else {
        this.sortKey = key
        this.sortOrder = 'asc'
      }
    },

    getSortIcon(key) {
      if (this.sortKey !== key) {
        return 'arrow'
      }
      return this.sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'
    },

    handleRowClick(row, type) {
      // 跳转到详情页
      this.$router.push({
        path: '/channel-detail',
        query: {
          type,
          id: row.id || row.name
        }
      })
    },

    // 格式化数字
    formatNumber(num) {
      if (num === null || num === undefined) return '0'
      if (num >= 100000000) {
        return (num / 100000000).toFixed(2) + '亿'
      }
      if (num >= 10000) {
        return (num / 10000).toFixed(2) + '万'
      }
      return num.toLocaleString()
    },

    // 格式化变动
    formatChange(change) {
      if (change === null || change === undefined) return '0'
      const prefix = change >= 0 ? '+' : ''
      return prefix + this.formatNumber(change)
    },

    // 格式化单元格值
    formatCellValue(key, value) {
      if (value === null || value === undefined) return '-'
      if (key === 'amount' || key === 'change') {
        return this.formatNumber(value)
      }
      if (key === 'rate') {
        return (value * 100).toFixed(2) + '%'
      }
      return value
    },

    // 格式化比率
    formatRate(rate) {
      if (rate === null || rate === undefined) return ''
      const prefix = rate >= 0 ? '+' : ''
      return prefix + (rate * 100).toFixed(2) + '%'
    },

    // 格式化日期（使用工具函数）
    formatDate(date, format) {
      return formatDateUtil(date, format)
    },


    // 获取变动样式类
    getChangeClass(change) {
      if (change > 0) return 'positive'
      if (change < 0) return 'negative'
      return 'neutral'
    },

    // 获取金额样式类
    getAmountClass(amount) {
      if (amount > 0) return 'amount-positive'
      if (amount < 0) return 'amount-negative'
      return 'amount-neutral'
    },

    // 获取值样式类
    getValueClass(value) {
      if (value > 0) return 'value-positive'
      if (value < 0) return 'value-negative'
      return 'value-neutral'
    },

    // 获取比率样式类
    getRateClass(rate) {
      if (rate > 0) return 'rate-positive'
      if (rate < 0) return 'rate-negative'
      return 'rate-neutral'
    },

    // 获取单元格样式类
    getCellClass(key, value) {
      if (key === 'amount' || key === 'change') {
        if (value > 0) return 'cell-positive'
        if (value < 0) return 'cell-negative'
        return 'cell-neutral'
      }
      if (key === 'rate') {
        if (value > 0.1) return 'cell-high'
        if (value > 0.05) return 'cell-medium'
        return 'cell-low'
      }
      return ''
    },

    // 加载表格数据
    async loadTableData() {
      try {
        this.appStore.setLoading(true)

        // 使用 fetchData 从 API 获取数据
        const params = {
          channelType: this.activeChannelType,
          startDate: formatDateUtil(new Date(this.startDate), 'YYYY-MM-DD'),
          endDate: formatDateUtil(new Date(this.endDate), 'YYYY-MM-DD')
        }

        // 根据不同的 channelType 调用不同的 API
        let apiUrl = '/api/channel/data'
        if (this.activeChannelType === 'type1') {
          apiUrl = '/api/channel/type1'
        } else if (this.activeChannelType === 'type2') {
          apiUrl = '/api/channel/type2'
        } else if (this.activeChannelType === 'type3') {
          apiUrl = '/api/channel/type3'
        }

        const response = await fetchData(apiUrl, params)

        if (response && response.data) {
          this.tableData = response.data.list || []
          // 更新概览数据
          if (response.data.overview) {
            this.overviewData = {
              totalScale: response.data.overview.totalScale || 0,
              beginningScale: response.data.overview.beginningScale || 0,
              change: response.data.overview.change || 0
            }
          }
        }
      } catch (error) {
        console.error('加载数据失败:', error)
        // 如果 API 失败，使用模拟数据作为降级方案
        this.loadMockData()
      } finally {
        this.appStore.setLoading(false)
      }
    },

    // 加载模拟数据（降级方案）
    loadMockData() {
      if (this.activeChannelType === 'type1') {
        this.tableData = [
          { id: 1, name: '渠道A', amount: 50000000, description: '主要渠道' },
          { id: 2, name: '渠道B', amount: 30000000, description: '次要渠道' },
          { id: 3, name: '渠道C', amount: 20000000, description: '辅助渠道' }
        ]
      } else if (this.activeChannelType === 'type2') {
        this.tableData = [
          { id: 1, name: '产品A', amount: 100000000, rate: 0.5, change: 10000000 },
          { id: 2, name: '产品B', amount: 60000000, rate: 0.3, change: -5000000 },
          { id: 3, name: '产品C', amount: 40000000, rate: 0.2, change: 8000000 }
        ]
      } else if (this.activeChannelType === 'type3') {
        this.tableData = [
          { id: 1, title: '项目A', value: 150000000, subtitle: '重点项目', rate: 0.15 },
          { id: 2, title: '项目B', value: 80000000, subtitle: '一般项目', rate: -0.05 },
          { id: 3, title: '项目C', value: 70000000, subtitle: '一般项目', rate: 0.08 }
        ]
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.channel-data {
  padding: 16px;
  background-color: #f7f8fa;
  min-height: 100vh;
}

// 数据概览模块
.overview-section {
  margin-bottom: 16px;

  .overview-card {
    display: flex;
    background: #fff;
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    .overview-item {
      flex: 1;
      text-align: center;

      .label {
        font-size: 12px;
        color: #969799;
        margin-bottom: 8px;
      }

      .value {
        font-size: 18px;
        font-weight: 600;
        color: #323233;

        &.positive {
          color: #ee0a24;
        }

        &.negative {
          color: #07c160;
        }

        &.neutral {
          color: #323233;
        }
      }
    }
  }
}

// 统计模块
.statistics-section {
  margin-bottom: 16px;
}

// 标签切换模块
.tabs-section {
  margin-bottom: 16px;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}

// 表格展示模块
.table-section {
  .table-container {
    background: #fff;
    border-radius: 8px;
    overflow: hidden;
  }

  // 类型2表格样式
  .table-header {
    display: flex;
    background: #f7f8fa;
    border-bottom: 1px solid #ebedf0;
    padding: 12px 16px;

    .table-header-cell {
      flex: 1;
      font-size: 14px;
      font-weight: 600;
      color: #323233;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: default;

      &.sortable {
        cursor: pointer;
        user-select: none;

        &:hover {
          color: #1989fa;
        }

        &.active {
          color: #1989fa;
        }
      }

      .sort-icon {
        margin-left: 4px;
        font-size: 12px;
      }
    }
  }

  .table-body {
    .table-row {
      display: flex;
      padding: 12px 16px;
      border-bottom: 1px solid #ebedf0;
      cursor: pointer;
      transition: background-color 0.2s;

      &:hover {
        background-color: #f7f8fa;
      }

      &:last-child {
        border-bottom: none;
      }

      .table-cell {
        flex: 1;
        font-size: 14px;
        color: #323233;
        text-align: center;

        &.cell-positive {
          color: #ee0a24;
        }

        &.cell-negative {
          color: #07c160;
        }

        &.cell-neutral {
          color: #323233;
        }

        &.cell-high {
          color: #ff6b00;
          font-weight: 600;
        }

        &.cell-medium {
          color: #ff9800;
        }

        &.cell-low {
          color: #969799;
        }
      }
    }
  }

  // 金额样式
  .amount-positive {
    color: #ee0a24;
    font-weight: 600;
  }

  .amount-negative {
    color: #07c160;
    font-weight: 600;
  }

  .amount-neutral {
    color: #323233;
  }

  // 值样式
  .value-positive {
    color: #ee0a24;
    font-weight: 600;
  }

  .value-negative {
    color: #07c160;
    font-weight: 600;
  }

  .value-neutral {
    color: #323233;
  }

  // 比率样式
  .rate-text {
    font-size: 12px;
    margin-left: 8px;
  }

  .rate-positive {
    color: #ee0a24;
  }

  .rate-negative {
    color: #07c160;
  }

  .rate-neutral {
    color: #969799;
  }

  // 单元格值包装器
  .cell-value-wrapper {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }
}
</style>
