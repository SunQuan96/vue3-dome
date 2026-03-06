<template>
  <div class="login-page">
    <van-nav-bar title="登录" fixed />

    <div class="login-body">
      <h2 class="title">微信扫码登录</h2>
      <p class="sub-title">
        使用微信扫一扫登录当前账号，登录成功后会自动返回首页。
      </p>

      <div class="qrcode-card" v-if="qrcodeUrl">
        <img :src="qrcodeUrl" alt="微信登录二维码" class="qrcode-image" />
      </div>
      <div class="qrcode-placeholder" v-else>
        <van-loading size="24px" />
        <span>正在获取二维码…</span>
      </div>

      <div class="status">
        <van-tag type="primary" v-if="status === 'waiting'">请使用微信扫一扫</van-tag>
        <van-tag type="warning" v-else-if="status === 'scanned'">已扫码，等待确认…</van-tag>
        <van-tag type="success" v-else-if="status === 'confirmed'">登录成功，正在跳转…</van-tag>
        <van-tag type="danger" v-else-if="status === 'expired'">二维码已过期，请刷新</van-tag>
      </div>

      <van-button
        block
        type="primary"
        class="refresh-btn"
        :loading="loading"
        @click="refreshQrcode"
      >
        重新获取二维码
      </van-button>

      <van-button
        block
        type="default"
        class="back-btn"
        @click="$router.replace('/')"
      >
        返回首页
      </van-button>
    </div>
  </div>
</template>

<script>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { showFailToast, showToast } from 'vant'
import { api } from '@/api'
import { useUserStore } from '@/store'

export default {
  name: 'Login',
  setup(_, { emit, expose }) {
    const qrcodeUrl = ref('')
    const sceneId = ref('')
    const status = ref('waiting') // waiting / scanned / confirmed / expired
    const loading = ref(false)
    let timer = null

    const userStore = useUserStore()

    const clearTimer = () => {
      if (timer) {
        clearInterval(timer)
        timer = null
      }
    }

    const pollStatus = () => {
      clearTimer()
      if (!sceneId.value) return

      timer = setInterval(async () => {
        try {
          const res = await api.wechatLoginStatus({ sceneId: sceneId.value })
          const code = res?.code ?? res?.data?.code

          // 以下状态码仅为示例，需与后端约定
          if (code === 0) {
            const data = res.data || res.result
            status.value = 'confirmed'
            clearTimer()

            // 写入用户信息 / token
            userStore.setUserInfo?.(data.user || {})
            userStore.setToken?.(data.token || '')

            showToast('登录成功')
            setTimeout(() => {
              window.location.href = import.meta.env.BASE_URL || '/'
            }, 600)
          } else if (code === 1) {
            status.value = 'waiting'
          } else if (code === 2) {
            status.value = 'scanned'
          } else if (code === 3) {
            status.value = 'expired'
            clearTimer()
          }
        } catch (e) {
          console.error(e)
        }
      }, 2000)
    }

    const fetchQrcode = async () => {
      loading.value = true
      status.value = 'waiting'
      clearTimer()

      try {
        const res = await api.wechatLoginQrcode()
        const data = res.data || res.result || res

        if (!data.qrcodeUrl || !data.sceneId) {
          throw new Error('后端未返回二维码地址或 sceneId')
        }

        qrcodeUrl.value = data.qrcodeUrl
        sceneId.value = data.sceneId
        pollStatus()
      } catch (e) {
        console.error(e)
        showFailToast('获取二维码失败，请稍后重试')
      } finally {
        loading.value = false
      }
    }

    const refreshQrcode = () => {
      fetchQrcode()
    }

    onMounted(() => {
      fetchQrcode()
    })

    onBeforeUnmount(() => {
      clearTimer()
    })

    expose({
      refreshQrcode
    })

    return {
      qrcodeUrl,
      status,
      loading,
      refreshQrcode
    }
  }
}
</script>

<style lang="scss" scoped>
.login-page {
  padding-top: 46px;
  min-height: 100vh;
  background: linear-gradient(180deg, #f5f7ff 0%, #f7f8fa 60%, #ffffff 100%);
}

.login-body {
  padding: 24px 16px 32px;
}

.title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 8px;
  text-align: center;
}

.sub-title {
  font-size: 13px;
  color: #666;
  text-align: center;
  margin-bottom: 20px;
}

.qrcode-card {
  margin: 0 auto 16px;
  width: 220px;
  height: 220px;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.qrcode-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.qrcode-placeholder {
  margin: 40px auto 16px;
  width: 220px;
  height: 220px;
  border-radius: 16px;
  background: #f2f3f5;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #969799;
}

.status {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.refresh-btn {
  margin-bottom: 12px;
}

.back-btn {
  color: #666;
}
</style>

