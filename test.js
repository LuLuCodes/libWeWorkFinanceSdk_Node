const { execFile } = require('child_process');
const rsaDecrypt = require('./rsaDecrypt');
const util = require('util');

const execFilePromise = util.promisify(execFile);

const corpid = '';
const secret = '';

const privateKey = ``;

async function chatmsg() {
  try {
    const { stdout, stderr } = await execFilePromise('./WeWorkFinanceSdk', [
      corpid,
      secret,
      'chatmsg',
      504,
      100,
      '',
      '',
      5000,
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

async function decryptdata(encrypt_random_key, encrypt_msg) {
  try {
    const encrypt_key = rsaDecrypt(encrypt_random_key, privateKey);
    const { stdout, stderr } = await execFilePromise('./WeWorkFinanceSdk', [
      corpid,
      secret,
      'decryptdata',
      encrypt_key,
      encrypt_msg,
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

async function mediadata(fileid) {
  try {
    const { stdout, stderr } = await execFilePromise('./WeWorkFinanceSdk', [
      corpid,
      secret,
      'mediadata',
      fileid,
      '',
      '',
      60000,
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
