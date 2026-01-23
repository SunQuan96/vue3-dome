import axios from 'axios'
import { showToast } from 'vant'
import { useUserStore } from '@/store'

// 创建 axios 实例
const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8'
  }
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()
    // 添加 token
    if (userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`
    }
    return config
  },
  (error) => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    const res = response.data

    // 如果返回的状态码不是 200，则视为错误
    if (res.code && res.code !== 200) {
      showToast(res.message || '请求失败')
      return Promise.reject(new Error(res.message || '请求失败'))
    }

    return res
  },
  (error) => {
    console.error('响应错误:', error)

    if (error.response) {
      switch (error.response.status) {
        case 401:
          showToast('未授权，请重新登录')
          const userStore = useUserStore()
          userStore.logout()
          // 可以在这里跳转到登录页
          break
        case 403:
          showToast('拒绝访问')
          break
        case 404:
          showToast('请求错误，未找到该资源')
          break
        case 500:
          showToast('服务器错误')
          break
        default:
          showToast(error.response.data?.message || '网络错误')
      }
    } else {
      showToast('网络连接失败')
    }

    return Promise.reject(error)
  }
)

export default service
