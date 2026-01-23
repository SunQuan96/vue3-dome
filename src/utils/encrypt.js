import JSEncrypt from 'jsencrypt'
import CryptoJS from 'crypto-js'

// RSA 加密（公钥加密）
export function rsaEncrypt(data, publicKey) {
  const encrypt = new JSEncrypt()
  encrypt.setPublicKey(publicKey)
  return encrypt.encrypt(data)
}

// RSA 解密（私钥解密）
export function rsaDecrypt(data, privateKey) {
  const decrypt = new JSEncrypt()
  decrypt.setPrivateKey(privateKey)
  return decrypt.decrypt(data)
}

// AES 加密
export function aesEncrypt(data, key) {
  return CryptoJS.AES.encrypt(data, key).toString()
}

// AES 解密
export function aesDecrypt(data, key) {
  const bytes = CryptoJS.AES.decrypt(data, key)
  return bytes.toString(CryptoJS.enc.Utf8)
}

// MD5 加密
export function md5(data) {
  return CryptoJS.MD5(data).toString()
}

// SHA256 加密
export function sha256(data) {
  return CryptoJS.SHA256(data).toString()
}
