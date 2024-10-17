const { WeWorkFinanceSDK } = require('./build/Release/WeWorkFinanceSDK');

try {
  const sdk = new WeWorkFinanceSDK(
    'wwdf65802ca25ec195',
    '-Ta6WMWxBhfGolWnnlO15nQckj3DRKAowUOdX2fwvzE'
  );

  console.log(11111);
  // 获取聊天数据
  const chatData = sdk.getChatData(0, 100, '', '', 5000);
  console.log('Chat Data:', chatData);

  // // 获取媒体数据
  // sdk.getMediaData('media_sdkfileid', '', '', 5000, 'saved_media_file.jpg');
  // console.log('Media file saved');

  // // 解密数据
  // const decryptedData = sdk.decryptData('encrypt_key', 'encrypt_msg');
  // console.log('Decrypted Data:', decryptedData);
} catch (error) {
  console.error('Error:', error.message);
}
