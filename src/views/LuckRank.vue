<template>
  <div class="luck-rank-page">
    <!-- 导航栏 -->
    <van-nav-bar 
      title="手气榜" 
      left-arrow 
      @click-left="goBack" 
      fixed
    >
      <template #right>
        <van-icon 
          name="replay" 
          size="18" 
          @click="refreshRank" 
          class="refresh-icon"
          :class="{ 'refreshing': refreshing }"
        />
      </template>
    </van-nav-bar>
    
    <div class="page-content">
      <!-- 排名规则说明 -->
    <div class="rule-section">
      <div class="section-header">
        <van-icon name="info" class="rule-icon" />
        <span class="section-title">排名规则说明</span>
        <van-tag type="primary" size="small" class="rule-tag">重要</van-tag>
      </div>
      <div class="rule-content">
        <p>🎯 <strong>排名规则：</strong>展示收到藏品的名单，按照抽取次数越少排名越靠上</p>
        <p>🏆 <strong>前3名展示：</strong>只展示前3名抽取次数，若抽取次数相同则按照抽取时间顺序排列，并列排名</p>
        <p>📊 <strong>次数标签：</strong>3名以下不展示次数标签</p>
        <p class="rule-tip">💡 提示：手气越好（抽取次数越少），排名越靠前！</p>
      </div>
    </div>

      <!-- 手气榜列表 -->
      <div class="rank-list">
        <div class="list-header">
          <span class="header-title">手气排行榜</span>
          <span class="header-count">共 {{ totalCount }} 人</span>
        </div>
        
        <!-- 排名列表 -->
        <div class="rank-items">
          <div 
            v-for="(item, index) in displayedRanks" 
            :key="item.id"
            class="rank-item"
            :class="{
              'top-1': item.rank === 1,
              'top-2': item.rank === 2,
              'top-3': item.rank === 3
            }"
          >
            <!-- 排名序号 -->
            <div class="rank-number">
              <span class="number-text">{{ item.rank }}</span>
              <div class="rank-crown" v-if="item.rank <= 3">
                <van-icon name="medal" />
              </div>
            </div>
            
            <!-- 用户信息 -->
            <div class="user-info">
              <div class="user-name">{{ item.name }}</div>
              <div class="user-department">{{ item.department }}</div>
              <div class="user-time">获得时间：{{ formatTime(item.obtainTime) }}</div>
            </div>
            
            <!-- 抽取次数（仅前3名显示） -->
            <div class="draw-count" v-if="item.rank <= 3">
              <span class="count-label">抽取次数</span>
              <span class="count-value">{{ item.drawCount }}次</span>
            </div>
            
            <!-- 固定文案 -->
            <div class="fixed-text">获得35周年限定藏品</div>
          </div>
        </div>
        
        <!-- 加载更多 -->
        <div class="load-more" v-if="hasMore">
          <van-button 
            type="primary" 
            size="small" 
            @click="loadMore"
            :loading="loading"
            loading-text="加载中..."
          >
            加载更多
          </van-button>
          <div class="load-tip">已加载 {{ displayedRanks.length }} / {{ totalCount }} 条</div>
        </div>
        
        <!-- 没有更多数据 -->
        <div class="no-more" v-else>
          <van-icon name="checked" class="no-more-icon" />
          <span class="no-more-text">已加载全部数据</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { showToast } from 'vant'

export default {
  name: 'LuckRank',
  data() {
    return {
      // 所有排名数据
      allRanks: [],
      // 当前显示的数据
      displayedRanks: [],
      // 每页加载数量
      pageSize: 50,
      // 当前加载的页数
      currentPage: 0,
      // 是否正在加载
      loading: false,
      // 是否还有更多数据
      hasMore: true,
      // 是否正在刷新
      refreshing: false
    }
  },
  computed: {
    // 总人数
    totalCount() {
      return this.allRanks.length
    }
  },
  created() {
    // 初始化时加载数据
    this.initRankData()
    this.loadMore()
  },
  methods: {
    goBack() {
      this.$router.back()
    },
    
    // 刷新排名数据
    refreshRank() {
      if (this.refreshing) return
      
      this.refreshing = true
      
      // 模拟刷新数据
      setTimeout(() => {
        // 重新初始化数据
        this.initRankData()
        
        // 重置显示数据
        this.displayedRanks = []
        this.currentPage = 0
        this.hasMore = true
        
        // 重新加载第一页
        this.loadMore()
        
        this.refreshing = false
        
        // 显示刷新成功提示
        showToast({
          message: '排名已刷新',
          type: 'success'
        })
      }, 800)
    },
    
    // 初始化排名数据（模拟数据）
    initRankData() {
      // 生成模拟数据
      const departments = ['技术部', '产品部', '设计部', '市场部', '运营部', '人力资源部', '财务部']
      const names = [
        '张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十',
        '郑十一', '王十二', '李十三', '张十四', '刘十五', '陈十六', '杨十七',
        '黄十八', '赵十九', '周二十', '吴二十一', '郑二十二', '王二十三'
      ]
      
      const ranks = []
      const now = new Date()
      
      // 生成200条模拟数据
      for (let i = 0; i < 200; i++) {
        const id = i + 1
        const name = names[Math.floor(Math.random() * names.length)] + (i + 1)
        const department = departments[Math.floor(Math.random() * departments.length)]
        
        // 抽取次数：前几名次数少，后面次数多
        let drawCount
        if (i < 3) {
          drawCount = Math.floor(Math.random() * 3) + 1 // 1-3次
        } else if (i < 10) {
          drawCount = Math.floor(Math.random() * 5) + 3 // 3-7次
        } else if (i < 30) {
          drawCount = Math.floor(Math.random() * 10) + 5 // 5-14次
        } else {
          drawCount = Math.floor(Math.random() * 20) + 10 // 10-29次
        }
        
        // 获得时间：越靠前的排名获得时间越早
        const timeOffset = i * 1000 * 60 * 60 * 24 // 每天一条
        const obtainTime = new Date(now.getTime() - timeOffset)
        
        ranks.push({
          id,
          name,
          department,
          drawCount,
          obtainTime,
          rank: i + 1 // 初始排名，后面会重新排序
        })
      }
      
      // 按照排名规则排序
      this.allRanks = this.sortRanks(ranks)
    },
    
    // 按照排名规则排序
    sortRanks(ranks) {
      return ranks.sort((a, b) => {
        // 首先按抽取次数排序（次数越少排名越靠前）
        if (a.drawCount !== b.drawCount) {
          return a.drawCount - b.drawCount
        }
        // 抽取次数相同，按获得时间排序（时间越早排名越靠前）
        return a.obtainTime - b.obtainTime
      }).map((item, index) => {
        // 重新分配排名，处理并列排名
        let rank = index + 1
        
        // 处理并列排名：如果与前一个抽取次数相同，则排名相同
        if (index > 0 && item.drawCount === ranks[index - 1].drawCount) {
          // 找到第一个相同抽取次数的排名
          let sameRankIndex = index - 1
          while (sameRankIndex > 0 && ranks[sameRankIndex].drawCount === ranks[sameRankIndex - 1].drawCount) {
            sameRankIndex--
          }
          rank = sameRankIndex + 1
        }
        
        return {
          ...item,
          rank
        }
      })
    },
    
    // 加载更多数据
    loadMore() {
      if (this.loading || !this.hasMore) return
      
      this.loading = true
      
      // 模拟网络请求延迟
      setTimeout(() => {
        const startIndex = this.currentPage * this.pageSize
        const endIndex = startIndex + this.pageSize
        
        if (startIndex >= this.allRanks.length) {
          this.hasMore = false
          this.loading = false
          return
        }
        
        const newData = this.allRanks.slice(startIndex, endIndex)
        this.displayedRanks = [...this.displayedRanks, ...newData]
        this.currentPage++
        
        // 检查是否还有更多数据
        this.hasMore = endIndex < this.allRanks.length
        this.loading = false
      }, 500)
    },
    
    // 格式化时间
    formatTime(time) {
      const date = new Date(time)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      
      return `${year}-${month}-${day} ${hours}:${minutes}`
    }
  }
}
</script>

<style lang="scss" scoped>
.luck-rank-page {
  padding-top: 46px;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  
  .refresh-icon {
    color: #667eea;
    transition: transform 0.3s ease;
    
    &.refreshing {
      animation: rotate 0.8s linear infinite;
    }
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.page-content {
  padding: 16px;
}

// 规则说明区域
.rule-section {
    background: linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%);
    border-radius: 16px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 4px 20px rgba(102, 126, 234, 0.15);
    border: 1px solid rgba(102, 126, 234, 0.1);
    
    .section-header {
      display: flex;
      align-items: center;
      margin-bottom: 16px;
      
      .rule-icon {
        color: #667eea;
        margin-right: 10px;
        font-size: 20px;
      }
      
      .section-title {
        font-size: 18px;
        font-weight: 700;
        color: #333;
        flex: 1;
      }
      
      .rule-tag {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: #fff;
        border: none;
        font-weight: 500;
      }
    }
    
    .rule-content {
      p {
        margin: 8px 0;
        font-size: 14px;
        color: #555;
        line-height: 1.5;
        padding-left: 8px;
        border-left: 3px solid transparent;
        
        &:nth-child(1) {
          border-left-color: #ff6b6b;
        }
        
        &:nth-child(2) {
          border-left-color: #4ecdc4;
        }
        
        &:nth-child(3) {
          border-left-color: #45b7d1;
        }
        
        strong {
          color: #333;
        }
        
        &:first-child {
          margin-top: 0;
        }
        
        &:last-child {
          margin-bottom: 0;
        }
      }
      
      .rule-tip {
        margin-top: 12px;
        padding: 10px;
        background: linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 215, 0, 0.05) 100%);
        border-radius: 8px;
        border-left: 3px solid #ffd700;
        color: #8a6d3b;
        font-size: 13px;
        
        strong {
          color: #8a6d3b;
        }
      }
    }
  }

// 手气榜列表
.rank-list {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  
  .list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    
    .header-title {
      font-size: 18px;
      font-weight: 600;
    }
    
    .header-count {
      font-size: 14px;
      opacity: 0.9;
    }
  }
}

// 排名项
.rank-items {
  .rank-item {
    display: flex;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid #f0f0f0;
    position: relative;
    
    &:last-child {
      border-bottom: none;
    }
    
    // 前三名特殊样式
    &.top-1 {
      background: linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 215, 0, 0.05) 100%);
      
      .rank-number {
        background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
        color: #fff;
      }
    }
    
    &.top-2 {
      background: linear-gradient(135deg, rgba(192, 192, 192, 0.1) 0%, rgba(192, 192, 192, 0.05) 100%);
      
      .rank-number {
        background: linear-gradient(135deg, #C0C0C0 0%, #A9A9A9 100%);
        color: #fff;
      }
    }
    
    &.top-3 {
      background: linear-gradient(135deg, rgba(205, 127, 50, 0.1) 0%, rgba(205, 127, 50, 0.05) 100%);
      
      .rank-number {
        background: linear-gradient(135deg, #CD7F32 0%, #8B4513 100%);
        color: #fff;
      }
    }
  }
  
  .rank-number {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 16px;
    font-weight: 600;
    font-size: 16px;
    position: relative;
    background: #f0f0f0;
    color: #666;
    
    .rank-crown {
      position: absolute;
      top: -8px;
      right: -8px;
      color: #ffd700;
      font-size: 14px;
    }
  }
  
  .user-info {
    flex: 1;
    
    .user-name {
      font-size: 16px;
      font-weight: 500;
      color: #333;
      margin-bottom: 4px;
    }
    
    .user-department {
      font-size: 13px;
      color: #666;
      margin-bottom: 4px;
    }
    
    .user-time {
      font-size: 12px;
      color: #999;
    }
  }
  
  .draw-count {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-right: 16px;
    padding: 8px 12px;
    background: #f8f9fa;
    border-radius: 8px;
    min-width: 80px;
    
    .count-label {
      font-size: 12px;
      color: #666;
      margin-bottom: 4px;
    }
    
    .count-value {
      font-size: 16px;
      font-weight: 600;
      color: #1989fa;
    }
  }
  
  .fixed-text {
    padding: 6px 12px;
    background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
    color: #fff;
    border-radius: 16px;
    font-size: 12px;
    white-space: nowrap;
  }
}

// 加载更多区域
.load-more {
  padding: 24px 16px;
  text-align: center;
  border-top: 1px solid #f0f0f0;
  
  .van-button {
    width: 120px;
    border-radius: 20px;
  }
  
  .load-tip {
    margin-top: 12px;
    font-size: 12px;
    color: #999;
  }
}

// 没有更多数据
.no-more {
  padding: 24px 16px;
  text-align: center;
  border-top: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  .no-more-icon {
    color: #07c160;
    font-size: 24px;
    margin-bottom: 8px;
  }
  
  .no-more-text {
    font-size: 14px;
    color: #666;
  }
}
</style>