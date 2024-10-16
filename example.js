const WeWorkFinanceSDK = require('./WeWorkFinanceSDK');

async function main() {
  const sdk = new WeWorkFinanceSDK('your_corp_id', 'your_secret');

  try {
    await sdk.init();
    console.log('SDK 初始化成功');

    const chatData = await sdk.getChatData(0, 100, '', 10000);
    console.log('获取到的聊天数据:', chatData);

    // const decryptedData = await sdk.decryptData('random_key', 'encrypted_data');
    // console.log('解密后的数据:', decryptedData);

    // const mediaResult = await sdk.getMediaData(
    //   'file_id',
    //   '/path/to/save/file',
    //   ''
    // );
    // console.log('媒体文件下载结果:', mediaResult);

    // const privateKey = await sdk.getPrivateKey('/path/to/private/key');
    // console.log('获取到的私钥:', privateKey);
  } catch (error) {
    console.error('发生错误:', error);
  }
}

main();
