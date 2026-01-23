import request from '@/utils/request'

/**
 * 通用数据获取函数
 * @param {string} url - 请求地址
 * @param {object} params - 请求参数
 * @param {object} config - axios 配置
 * @returns {Promise}
 */
export function fetchData(url, params = {}, config = {}) {
  return request({
    url,
    method: 'get',
    params,
    ...config
  })
}

/**
 * POST 请求
 * @param {string} url - 请求地址
 * @param {object} data - 请求数据
 * @param {object} config - axios 配置
 * @returns {Promise}
 */
export function postData(url, data = {}, config = {}) {
  return request({
    url,
    method: 'post',
    data,
    ...config
  })
}
