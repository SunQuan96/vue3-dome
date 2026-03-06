import request from '@/utils/request'

// 示例 API
export const api = {
  // 获取用户信息
  getUserInfo: params => {
    return request({
      url: '/user/info',
      method: 'get',
      params
    })
  },

  // 登录
  login: data => {
    return request({
      url: '/user/login',
      method: 'post',
      data
    })
  },

  // 微信扫码登录 - 获取二维码
  wechatLoginQrcode: () => {
    return request({
      url: '/auth/wechat/qrcode',
      method: 'get'
    })
  },

  // 微信扫码登录 - 轮询登录状态
  wechatLoginStatus: params => {
    return request({
      url: '/auth/wechat/status',
      method: 'get',
      params
    })
  }
}
