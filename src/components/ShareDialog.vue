<template>
  <van-popup
    v-model:show="popupVisible"
    position="bottom"
    round
    :style="{ height: '70%' }"
    @close="handleClose"
  >
    <div class="share-dialog">
      <!-- 标题 -->
      <div class="dialog-header">
        <h2 class="dialog-title">分享藏品</h2>
        <van-icon name="cross" class="close-icon" @click="handleClose" />
      </div>

      <!-- 分享图片预览 -->
      <div class="share-preview" ref="sharePreviewRef">
        <div class="share-image-container">
          <!-- 35周年标识 -->
          <div class="anniversary-badge">
            <div class="anniversary-icon">🎉</div>
            <div class="anniversary-text">35周年限定</div>
          </div>

          <!-- 藏品图片 -->
          <div class="collection-image-section">
            <img :src="collectionImage" :alt="collectionName" class="collection-image" />
            <div class="collection-overlay">
              <div class="collection-name">{{ collectionName }}</div>
              <div class="collection-tags">
                <span v-for="tag in collectionTags" :key="tag" class="collection-tag">{{ tag }}</span>
              </div>
            </div>
          </div>

          <!-- 祝福语 -->
          <div class="blessing-section">
            <div class="blessing-icon">💝</div>
            <div class="blessing-text">{{ blessingText }}</div>
          </div>

          <!-- 区块链地址 -->
          <div class="blockchain-section">
            <div class="blockchain-icon">🔗</div>
            <div class="blockchain-info">
              <div class="blockchain-label">区块链地址</div>
              <div class="blockchain-address">{{ blockchainAddress }}</div>
            </div>
          </div>

          <!-- 持有者信息 -->
          <div class="holder-section">
            <div class="holder-icon">👤</div>
            <div class="holder-info">
              <div class="holder-label">持有者</div>
              <div class="holder-name">{{ holderName }}</div>
            </div>
          </div>

          <!-- 分享水印 -->
          <div class="watermark">分享自新征程新起点35周年纪念</div>
        </div>
      </div>

      <!-- 分享选项 -->
      <div class="share-options">
        <div class="options-title">分享到</div>
        <div class="options-grid">
          <!-- 微信分享 -->
          <div class="share-option" @click="shareToWechat">
            <div class="option-icon wechat-icon">
              <van-icon name="wechat" size="28" />
            </div>
            <div class="option-label">微信</div>
          </div>

          <!-- 朋友圈分享 -->
          <div class="share-option" @click="shareToTimeline">
            <div class="option-icon timeline-icon">
              <van-icon name="friends-o" size="28" />
            </div>
            <div class="option-label">朋友圈</div>
          </div>

          <!-- 保存图片 -->
          <div class="share-option" @click="saveToAlbum">
            <div class="option-icon save-icon">
              <van-icon name="photo-o" size="28" />
            </div>
            <div class="option-label">保存图片</div>
          </div>
        </div>
      </div>

      <!-- 取消按钮 -->
      <div class="cancel-section">
        <van-button round block class="cancel-btn" @click="handleClose">
          取消
        </van-button>
      </div>
    </div>
  </van-popup>
</template>

<script>
import html2canvas from 'html2canvas'
import { showToast, showLoadingToast, closeToast } from 'vant'

export default {
  name: 'ShareDialog',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    collectionData: {
      type: Object,
      default: () => ({
        name: '',
        image: '',
        tags: [],
        blessing: '',
        blockchainAddress: '',
        holderName: ''
      })
    }
  },
  data() {
    return {
      // 默认数据
      collectionName: '新征程新起点35周年限定藏品',
      collectionImage: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      collectionTags: ['35周年限定', '限量700个', '纪念藏品'],
      blessingText: '恭喜获得35周年限定藏品！新征程，新起点，共创美好未来！',
      blockchainAddress: '0x1234...5678',
      holderName: '张三',
      // 本地弹窗状态
      popupVisible: false
    }
  },
  created() {
    // 初始化弹窗状态
    this.popupVisible = this.modelValue
  },
  watch: {
    modelValue(newVal) {
      this.popupVisible = newVal
    },
    collectionData: {
      handler(newData) {
        if (newData.name) this.collectionName = newData.name
        if (newData.image) this.collectionImage = newData.image
        if (newData.tags) this.collectionTags = newData.tags
        if (newData.blessing) this.blessingText = newData.blessing
        if (newData.blockchainAddress) this.blockchainAddress = newData.blockchainAddress
        if (newData.holderName) this.holderName = newData.holderName
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    handleClose() {
      // 关闭弹窗并通知父组件
      this.popupVisible = false
      this.$emit('update:modelValue', false)
      this.$emit('close')
    },

    // 生成分享图片
    async generateShareImage() {
      try {
        const element = this.$refs.sharePreviewRef
        if (!element) {
          throw new Error('分享预览元素不存在')
        }

        // 获取分享图片容器的实际元素
        const shareContainer = element.querySelector('.share-image-container')
        if (!shareContainer) {
          throw new Error('分享图片容器不存在')
        }

        // 设置固定的图片尺寸（改为400×600）
        const targetWidth = 400
        const targetHeight = 600
        
        // 添加截图专用样式类
        shareContainer.classList.add('for-screenshot')

        // 使用html2canvas生成图片
        const canvas = await html2canvas(shareContainer, {
          backgroundColor: '#ffffff',
          scale: 2, // 提高图片质量
          width: targetWidth,
          height: targetHeight,
          useCORS: true, // 允许跨域图片
          logging: false, // 关闭日志
          windowWidth: targetWidth,
          windowHeight: targetHeight,
          ignoreElements: (element) => {
            // 忽略不需要的元素，如关闭按钮等
            return element.classList.contains('close-icon') || 
                   element.classList.contains('cancel-btn')
          }
        })

        // 移除截图专用样式类
        shareContainer.classList.remove('for-screenshot')

        return canvas.toDataURL('image/png')
      } catch (error) {
        console.error('生成分享图片失败:', error)
        showToast({
          message: '生成分享图片失败',
          type: 'fail'
        })
        return null
      }
    },

    // 分享到微信
    async shareToWechat() {
      const loadingToast = showLoadingToast({
        message: '准备分享到微信...',
        forbidClick: true
      })

      try {
        const imageDataUrl = await this.generateShareImage()
        if (!imageDataUrl) {
          closeToast()
          return
        }

        // 在实际应用中，这里应该调用微信JS-SDK的分享接口
        // 由于是Web环境，我们使用模拟分享
        setTimeout(() => {
          closeToast()
          showToast({
            message: '已唤起微信分享',
            type: 'success'
          })
          this.handleClose()
        }, 1000)
      } catch (error) {
        closeToast()
        showToast({
          message: '分享失败',
          type: 'fail'
        })
      }
    },

    // 分享到朋友圈
    async shareToTimeline() {
      const loadingToast = showLoadingToast({
        message: '准备分享到朋友圈...',
        forbidClick: true
      })

      try {
        const imageDataUrl = await this.generateShareImage()
        if (!imageDataUrl) {
          closeToast()
          return
        }

        // 在实际应用中，这里应该调用微信JS-SDK的朋友圈分享接口
        setTimeout(() => {
          closeToast()
          showToast({
            message: '已唤起朋友圈分享',
            type: 'success'
          })
          this.handleClose()
        }, 1000)
      } catch (error) {
        closeToast()
        showToast({
          message: '分享失败',
          type: 'fail'
        })
      }
    },

    // 保存图片到相册
    async saveToAlbum() {
      const loadingToast = showLoadingToast({
        message: '正在生成图片...',
        forbidClick: true
      })

      try {
        const imageDataUrl = await this.generateShareImage()
        if (!imageDataUrl) {
          closeToast()
          return
        }

        // 创建下载链接
        const link = document.createElement('a')
        link.href = imageDataUrl
        // 使用更有意义的文件名
        const fileName = `35周年藏品分享_${this.collectionName.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '_')}_${new Date().toISOString().slice(0, 10)}.png`
        link.download = fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        closeToast()
        showToast({
          message: '图片已保存',
          type: 'success'
        })
        this.handleClose()
      } catch (error) {
        closeToast()
        showToast({
          message: '保存失败',
          type: 'fail'
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.share-dialog {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f7f8fa;
}

.dialog-header {
  position: relative;
  padding: 20px;
  text-align: center;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;

  .dialog-title {
    font-size: 18px;
    font-weight: 600;
    color: #333;
    margin: 0;
  }

  .close-icon {
    position: absolute;
    right: 20px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 20px;
    color: #999;
    cursor: pointer;

    &:hover {
      color: #333;
    }
  }
}

.share-preview {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: #fff;
  margin: 10px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);

  .share-image-container {
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 16px;
    padding: 20px;
    color: #fff;
    position: relative;
    overflow: hidden;
    
    // 图片生成时的固定尺寸
    &.for-screenshot {
      width: 400px !important;
      height: 600px !important;
      max-width: 400px !important;
      padding: 20px !important;
      
      // 35周年标识
       .anniversary-badge {
         margin-bottom: 10px !important;
         padding: 4px 8px !important;
         .anniversary-text {
           font-size: 11px !important;
         }
       }
       
       // 藏品图片区域
       .collection-image-section {
         margin-bottom: 10px !important;
         .collection-image {
           height: 180px !important;
         }
         .collection-overlay {
           padding: 10px !important;
           .collection-name {
             font-size: 16px !important;
             margin-bottom: 4px !important;
           }
           .collection-tags {
             gap: 3px !important;
             .collection-tag {
               font-size: 9px !important;
               padding: 2px 4px !important;
             }
           }
         }
       }
       
       // 祝福语区域
       .blessing-section {
         margin-bottom: 10px !important;
         padding: 10px !important;
         .blessing-icon {
           font-size: 16px !important;
         }
         .blessing-text {
           font-size: 12px !important;
           line-height: 1.3 !important;
         }
       }
       
       // 区块链地址区域
       .blockchain-section {
         margin-bottom: 8px !important;
         padding: 8px !important;
         .blockchain-icon {
           font-size: 14px !important;
         }
         .blockchain-label {
           font-size: 9px !important;
         }
         .blockchain-address {
           font-size: 11px !important;
         }
       }
       
       // 持有者信息区域
       .holder-section {
         padding: 8px !important;
         .holder-icon {
           font-size: 14px !important;
         }
         .holder-label {
           font-size: 9px !important;
         }
         .holder-name {
           font-size: 12px !important;
         }
       }
       
       // 水印
       .watermark {
         margin-top: 10px !important;
         padding-top: 8px !important;
         font-size: 9px !important;
       }
     }

    // 35周年标识
    .anniversary-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 20px;
      padding: 8px 16px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 20px;
      backdrop-filter: blur(10px);
      width: fit-content;

      .anniversary-icon {
        font-size: 20px;
      }

      .anniversary-text {
        font-size: 14px;
        font-weight: 600;
      }
    }

    // 藏品图片区域
    .collection-image-section {
      position: relative;
      margin-bottom: 20px;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);

      .collection-image {
        width: 100%;
        height: 200px;
        object-fit: cover;
        display: block;
      }

      .collection-overlay {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
        padding: 16px;
        color: #fff;

        .collection-name {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 8px;
          line-height: 1.3;
        }

        .collection-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;

          .collection-tag {
            font-size: 12px;
            padding: 4px 8px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            backdrop-filter: blur(10px);
          }
        }
      }
    }

    // 祝福语区域
    .blessing-section {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 20px;
      padding: 16px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      backdrop-filter: blur(10px);

      .blessing-icon {
        font-size: 24px;
        flex-shrink: 0;
      }

      .blessing-text {
        font-size: 15px;
        line-height: 1.5;
        flex: 1;
      }
    }

    // 区块链地址区域
    .blockchain-section {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
      padding: 12px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      backdrop-filter: blur(10px);

      .blockchain-icon {
        font-size: 20px;
        flex-shrink: 0;
      }

      .blockchain-info {
        flex: 1;

        .blockchain-label {
          font-size: 12px;
          opacity: 0.8;
          margin-bottom: 4px;
        }

        .blockchain-address {
          font-size: 14px;
          font-weight: 500;
          font-family: 'Courier New', monospace;
          word-break: break-all;
        }
      }
    }

    // 持有者信息区域
    .holder-section {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      backdrop-filter: blur(10px);

      .holder-icon {
        font-size: 20px;
        flex-shrink: 0;
      }

      .holder-info {
        flex: 1;

        .holder-label {
          font-size: 12px;
          opacity: 0.8;
          margin-bottom: 4px;
        }

        .holder-name {
          font-size: 16px;
          font-weight: 600;
        }
      }
    }

    // 水印
    .watermark {
      text-align: center;
      font-size: 12px;
      opacity: 0.7;
      margin-top: 20px;
      padding-top: 12px;
      border-top: 1px solid rgba(255, 255, 255, 0.2);
    }
  }
}

.share-options {
  background: #fff;
  padding: 20px;
  border-top: 1px solid #f0f0f0;

  .options-title {
    font-size: 16px;
    font-weight: 500;
    color: #333;
    margin-bottom: 20px;
    text-align: center;
  }

  .options-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;

    .share-option {
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
      transition: transform 0.2s;

      &:hover {
        transform: translateY(-4px);
      }

      .option-icon {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 8px;

        &.wechat-icon {
          background: #07c160;
          color: #fff;
        }

        &.timeline-icon {
          background: #1aad19;
          color: #fff;
        }

        &.save-icon {
          background: #1989fa;
          color: #fff;
        }
      }

      .option-label {
        font-size: 14px;
        color: #333;
      }
    }
  }
}

.cancel-section {
  padding: 16px 20px;
  background: #fff;
  border-top: 1px solid #f0f0f0;

  .cancel-btn {
    height: 44px;
    font-size: 16px;
    color: #333;
    background: #f7f8fa;
    border: none;

    &:hover {
      background: #f0f0f0;
    }
  }
}

// 响应式设计
@media (max-width: 480px) {
  .share-preview {
    padding: 15px;
    margin: 8px;

    .share-image-container {
      padding: 15px;

      .collection-image-section {
        .collection-image {
          height: 180px;
        }

        .collection-overlay {
          .collection-name {
            font-size: 16px;
          }
        }
      }

      .blessing-section {
        .blessing-text {
          font-size: 14px;
        }
      }
    }
  }

  .options-grid {
    gap: 15px !important;

    .share-option {
      .option-icon {
        width: 50px !important;
        height: 50px !important;
      }
    }
  }
}
</style>