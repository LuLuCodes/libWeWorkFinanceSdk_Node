const ffi = require('ffi-napi');
const ref = require('ref-napi');

class WeWorkFinanceSDK {
  constructor(corpId, secret) {
    this.corpId = corpId;
    this.secret = secret;
    this.lib = ffi.Library('./libWeWorkFinanceSdk_Java.so', {
      Init: ['int', ['string', 'string']],
      GetChatData: ['string', ['int', 'int', 'string', 'int']],
      DecryptData: ['string', ['string', 'string']],
      GetMediaData: ['int', ['string', 'string', 'string']],
      GetPrivateKey: ['string', ['string']],
    });
  }

  init() {
    return new Promise((resolve, reject) => {
      this.lib.Init.async(this.corpId, this.secret, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  getChatData(seq, limit, proxy, timeout) {
    return new Promise((resolve, reject) => {
      this.lib.GetChatData.async(seq, limit, proxy, timeout, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  decryptData(randomKey, encryptedData) {
    return new Promise((resolve, reject) => {
      this.lib.DecryptData.async(randomKey, encryptedData, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  getMediaData(sdkFileId, filePath, proxy) {
    return new Promise((resolve, reject) => {
      this.lib.GetMediaData.async(sdkFileId, filePath, proxy, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  getPrivateKey(privateKeyPath) {
    return new Promise((resolve, reject) => {
      this.lib.GetPrivateKey.async(privateKeyPath, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }
}

module.exports = WeWorkFinanceSDK;
