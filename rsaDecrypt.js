const crypto = require('crypto');
const NodeRSA = require('node-rsa');

/**
 * RSA解密函数
 * @param {string} encryptedText - Base64编码的加密文本
 * @param {string} privateKey - PEM格式的私钥
 * @returns {string} 解密后的明文
 */
function rsaDecrypt(encryptedText, privateKey) {
  try {
    const rsa = new NodeRSA(privateKey);
    rsa.setOptions({
      encryptionScheme: 'pkcs1',
      environment: 'browser',
    });

    // 返回解密后的文本
    return rsa.decrypt(encryptedText).toString('utf8');
  } catch (error) {
    console.error('RSA解密失败:', error.message);
    return null;
  }
}

// 导出函数以供其他模块使用
module.exports = rsaDecrypt;
