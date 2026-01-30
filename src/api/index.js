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
  }
}
