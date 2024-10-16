const WeWorkFinanceSDK =
  require('./build/Release/wework_finance_sdk').WeWorkFinanceSDK;
const fs = require('fs').promises;

const sdk = new WeWorkFinanceSDK();

async function main() {
  try {
    // 初始化SDK
    const initResult = sdk.init('your_corpid', 'your_secret');
    console.log('SDK初始化结果:', initResult);

    // 获取聊天数据
    const chatData = sdk.getChatData(0, 100, '', '', 5000);
    console.log('聊天数据:', chatData);

    // 解密数据
    // const decryptedData = sdk.decryptData('encrypt_key', 'encrypt_msg');
    // console.log('解密后的数据:', decryptedData);

    // 下载媒体文件
    // await downloadMediaFile('your_sdk_fileid');
  } catch (error) {
    console.error('错误:', error.message);
  }
}

async function downloadMediaFile(sdkFileid) {
  const mediaInfo = sdk.getMediaData('', sdkFileid, '', '', 5000);
  let isFinish = false;
  let allData = Buffer.alloc(0);

  console.log(`开始下载文件: ${sdkFileid}`);

  while (!isFinish) {
    const chunk = sdk.getMediaDataChunk('', '', 5000);
    allData = Buffer.concat([allData, chunk.data]);
    isFinish = chunk.isFinish;
    console.log(`已下载 ${allData.length} 字节`);
  }

  console.log('下载完成');

  // 将下载的文件保存到磁盘
  const filename = `downloaded_${sdkFileid}.bin`;
  await fs.writeFile(filename, allData);
  console.log(`文件已保存为: ${filename}`);

  return allData;
}

main().catch(console.error);
