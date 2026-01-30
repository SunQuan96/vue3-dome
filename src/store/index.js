import { defineStore } from 'pinia'

// 用户信息 store
export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: null,
    token: localStorage.getItem('token') || ''
  }),
  getters: {
    isLogin: state => !!state.token
  },
  actions: {
    setUserInfo(userInfo) {
      this.userInfo = userInfo
    },
    setToken(token) {
      this.token = token
      localStorage.setItem('token', token)
    },
    logout() {
      this.userInfo = null
      this.token = ''
      localStorage.removeItem('token')
    }
  }
})

// 应用配置 store
export const useAppStore = defineStore('app', {
  state: () => ({
    loading: false,
    theme: 'light'
  }),
  actions: {
    setLoading(loading) {
      this.loading = loading
    },
    setTheme(theme) {
      this.theme = theme
    }
  }
})
