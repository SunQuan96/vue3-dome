import express from 'express'
import axios from 'axios'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'

// 简单加载环境变量（开发时可以用 cross-env 或 dotenv，这里直接用 process.env）
const {
  WECHAT_APPID,
  WECHAT_SECRET,
  JWT_SECRET = 'vue3-dome-secret',
  WECHAT_REDIRECT_URL
} = process.env

if (!WECHAT_APPID || !WECHAT_SECRET || !WECHAT_REDIRECT_URL) {
  console.warn(
    '[server] 请在 server/.env 中配置 WECHAT_APPID、WECHAT_SECRET、WECHAT_REDIRECT_URL，当前使用的是占位配置（微信回调将无法真正工作）。'
  )
}

const app = express()
app.use(express.json())

// ===== 内存状态（生产建议换成 Redis） =====
// sceneId -> { status, user, token, expireAt }
const loginScenes = new Map()
// openid -> user
const users = new Map()

function isExpired(item) {
  return item?.expireAt && item.expireAt < Date.now()
}

// ===== 1) 获取微信扫码登录二维码 =====
app.get('/auth/wechat/qrcode', (req, res) => {
  const sceneId = uuidv4()

  loginScenes.set(sceneId, {
    status: 'waiting',
    user: null,
    token: null,
    expireAt: Date.now() + 5 * 60 * 1000 // 5 分钟
  })

  const redirectUri = encodeURIComponent(WECHAT_REDIRECT_URL)

  // 微信开放平台 PC 扫码登录（根据你实际接入类型调整）
  const qrcodeUrl =
    'https://open.weixin.qq.com/connect/qrconnect' +
    `?appid=${WECHAT_APPID}` +
    `&redirect_uri=${redirectUri}` +
    '&response_type=code' +
    '&scope=snsapi_login' +
    `&state=${sceneId}` +
    '#wechat_redirect'

  res.json({
    qrcodeUrl,
    sceneId
  })
})

// ===== 2) 前端轮询扫码状态 =====
// code: 0 成功, 1 等待扫码, 2 已扫码待确认, 3 已过期
app.get('/auth/wechat/status', (req, res) => {
  const { sceneId } = req.query
  const info = loginScenes.get(sceneId)

  if (!info || isExpired(info)) {
    loginScenes.delete(sceneId)
    return res.json({ code: 3, message: 'expired' })
  }

  if (info.status === 'waiting') {
    return res.json({ code: 1, message: 'waiting' })
  }

  if (info.status === 'scanned') {
    return res.json({ code: 2, message: 'scanned' })
  }

  if (info.status === 'confirmed') {
    return res.json({
      code: 0,
      message: 'ok',
      data: {
        user: info.user,
        token: info.token
      }
    })
  }

  return res.json({ code: 1, message: 'waiting' })
})

// ===== 3) 微信回调：用户扫码并确认后，会打开这个地址 =====
app.get('/auth/wechat/callback', async (req, res) => {
  const { code, state: sceneId } = req.query
  if (!code || !sceneId) {
    return res.status(400).send('Missing code or state')
  }

  try {
    // 3.1 用 code 换取 access_token + openid
    const tokenResp = await axios.get(
      'https://api.weixin.qq.com/sns/oauth2/access_token',
      {
        params: {
          appid: WECHAT_APPID,
          secret: WECHAT_SECRET,
          code,
          grant_type: 'authorization_code'
        }
      }
    )

    const { access_token, openid } = tokenResp.data
    if (!access_token || !openid) {
      console.error('[wechat] access_token response error:', tokenResp.data)
      return res.status(400).send('WeChat auth failed')
    }

    // 3.2 获取微信用户信息（可选）
    const userInfoResp = await axios.get(
      'https://api.weixin.qq.com/sns/userinfo',
      { params: { access_token, openid } }
    )
    const wxUser = userInfoResp.data

    // 3.3 在本系统里查/建用户
    let user = users.get(openid)
    if (!user) {
      user = {
        id: openid,
        nickname: wxUser.nickname,
        avatar: wxUser.headimgurl
      }
      users.set(openid, user)
    }

    // 3.4 生成业务 token（JWT）
    const token = jwt.sign(
      { uid: user.id, nickname: user.nickname },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    // 3.5 更新对应 sceneId，让前端轮询拿到
    const info = loginScenes.get(sceneId)
    if (info) {
      loginScenes.set(sceneId, {
        ...info,
        status: 'confirmed',
        user,
        token
      })
    }

    res.send('微信登录成功，可以回到原页面了。')
  } catch (err) {
    console.error('[wechat callback error]', err.response?.data || err)
    res.status(500).send('WeChat auth error')
  }
})

// 简单健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Auth server listening on http://localhost:${PORT}`)
})

