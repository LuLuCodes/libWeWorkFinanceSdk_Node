const { execFile } = require('child_process');
const util = require('util');

const execFilePromise = util.promisify(execFile);

async function runWeWorkFinanceSdk(corpid, secret, command, ...args) {
  try {
    const { stdout, stderr } = await execFilePromise('./WeWorkFinanceSdk', [
      corpid,
      secret,
      command,
      ...args,
    ]);

    console.log('输出:', stdout);

    if (stderr) {
      console.error('错误:', stderr);
    }

    // 解析输出以获取结果
    const resultMatch = stdout.match(/结果: (.+)/);
    if (resultMatch) {
      return resultMatch[1];
    } else {
      return '未找到结果';
    }
  } catch (error) {
    console.error('执行错误:', error);
    return '执行出错';
  }
}

// 使用示例
async function main() {
  const result = await runWeWorkFinanceSdk(
    'wwdf65802ca25ec195',
    '-Ta6WMWxBhfGolWnnlO15nQckj3DRKAowUOdX2fwvzE',
    'chatmsg',
    0,
    100,
    '',
    '',
    5000
  );
  console.log('执行结果:', result);
}

main();
