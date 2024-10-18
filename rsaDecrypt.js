const crypto = require('crypto');

/**
 * RSA解密函数
 * @param {string} encryptedText - Base64编码的加密文本
 * @param {string} privateKey - PEM格式的私钥
 * @returns {string} 解密后的明文
 */
function rsaDecrypt(encryptedText, privateKey) {
  try {
    // 创建解密对象
    const decrypter = crypto.privateDecrypt(
      {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_PADDING,
      },
      Buffer.from(encryptedText, 'base64')
    );

    // 返回解密后的文本
    return decrypter.toString('utf8');
  } catch (error) {
    console.error('RSA解密失败:', error.message);
    return null;
  }
}

// 导出函数以供其他模块使用
module.exports = rsaDecrypt;
